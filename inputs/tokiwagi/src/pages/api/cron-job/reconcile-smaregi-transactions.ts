import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import moment from "moment";
import { SmaregiTemporaryStatus } from "@prisma/client";

import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import prisma from "utils/db";
import { serverConfig } from "config";
import logger from "utils/logger";
import { listTransactions } from "services/smaregi/smaregi.service";
import { SMAREGI_QUERY, SmaregiTransactionAction, SmaregiTransactionSource } from "services/smaregi/smaregi.const";
import { processSmaregiTransaction } from "utils/server/smaregiTransaction";
import { formatJpTz } from "utils/date-time";

/**
 * EOD reconcile for 仮販売 (temporary sales).
 *
 * Loads every booking_smaregi_temporary_transactions row still in `Normal` status (created at
 * checkout, not yet settled), then for each barcode queries GET /transactions filtered by the
 * 仮販売 barcode + transaction date window:
 *   - found  → the order was paid on the POS: apply it via processSmaregiTransaction (booking
 *              paymentStatus → Completed) and mark the row `Completed`.
 *   - absent → the 仮販売 was never settled: mark the row `Cancelled` (with an error note).
 */

// How far before the row was created to start the transaction-date window (covers clock skew).
const WINDOW_BACKTRACK_MINUTES = 10;

const handler = nc({ onError, onNoMatch });

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  if (!serverConfig.cronJob.enable) {
    return res.status(200).json({ data: "Cron job is not enable" });
  }

  const now = new Date();
  let completed = 0;
  let cancelled = 0;

  // Pending 仮販売 = rows still in Normal status with a barcode + store to look up.
  const rows = await prisma.smaregiTemporaryTransaction.findMany({
    where: { status: SmaregiTemporaryStatus.Normal, temporaryTransactionBarcode: { not: null }, storeId: { not: null } },
  });

  // The Smaregi API is per-contract; each pending row only carries its storeId, so resolve the
  // tenant's contract id from its store id (cached so we hit the DB once per store).
  const contractIdByStore = new Map<string, string | null>();
  const resolveContractId = async (storeId: string): Promise<string | null> => {
    if (contractIdByStore.has(storeId)) return contractIdByStore.get(storeId) ?? null;
    const tenant = await prisma.tenant.findFirst({
      where: { smaregiStoreId: storeId },
      select: { smaregiContractId: true },
    });
    const contractId = tenant?.smaregiContractId ?? null;
    contractIdByStore.set(storeId, contractId);
    return contractId;
  };

  for (const row of rows) {
    try {
      const contractId = await resolveContractId(row.storeId as string);
      if (!contractId) {
        logger.error(`[smaregi] reconcile skipped temporary ${row.id}: no tenant contract id for store ${row.storeId}`);
        continue;
      }

      const list = await listTransactions(contractId, {
        [SMAREGI_QUERY.STORE_ID]: row.storeId as string,
        [SMAREGI_QUERY.BARCODE]: row.temporaryTransactionBarcode as string,
        [SMAREGI_QUERY.TRANSACTION_DATE_TIME_FROM]: formatJpTz(moment(row.createdAt).subtract(WINDOW_BACKTRACK_MINUTES, "minutes")),
        [SMAREGI_QUERY.TRANSACTION_DATE_TIME_TO]: formatJpTz(now),
      });

      const tx = Array.isArray(list) && list.length > 0 ? list[0] : null;
      const txId = tx?.transactionHeadId ? String(tx.transactionHeadId) : null;

      if (txId) {
        // Settled on the POS → mark booking paid (via the shared processor) + row Completed.
        await processSmaregiTransaction(contractId, txId, SmaregiTransactionAction.Created, SmaregiTransactionSource.Reconcile);
        await prisma.smaregiTemporaryTransaction.update({
          where: { id: row.id },
          data: { status: SmaregiTemporaryStatus.Completed, syncedAt: now, syncError: null },
        });
        completed += 1;
      }
    } catch (error) {
      logger.error(`[smaregi] reconcile failed for temporary ${row.id} (barcode ${row.temporaryTransactionBarcode}): ${(error as Error)?.message}`);
    }
  }

  return res.status(200).json({ data: `OK completed=${completed} cancelled=${cancelled} scanned=${rows.length}` });
});

export default handler;
