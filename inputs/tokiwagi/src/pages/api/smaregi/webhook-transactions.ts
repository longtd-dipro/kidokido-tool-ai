import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import prisma from "utils/db";
import logger from "utils/logger";
import { handleSmaregiTransactionMutation, processSmaregiTransaction } from "utils/server/smaregiTransaction";
import {
  SMAREGI_EVENT_HEADER,
  SMAREGI_TRANSACTIONS_EVENT,
  SmaregiTransactionAction,
  SmaregiTransactionSource,
} from "services/smaregi/smaregi.const";

/**
 * Public Smaregi transaction webhook. The callback URL is registered in Smaregi config, so there is
 * no shared secret / signature — we only sanity-check the event header and the contract id. The
 * `contractId` from the body identifies which tenant the transactions belong to and is used for all
 * subsequent Smaregi API calls.
 *
 * Body: { contractId, event, action, transactionHeadIds: string[] }
 * Header: Smaregi-Event: pos:transactions
 */
const handler = nc({ onError, onNoMatch });

handler.post(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const event = req.headers[SMAREGI_EVENT_HEADER];
  const { contractId, action, transactionHeadIds } = req.body ?? {};
  logger.info(`[smaregi] webhook received: ${JSON.stringify(req.body)}`);
  if (event !== SMAREGI_TRANSACTIONS_EVENT) {
    return res.status(200).json({ data: "ignored: unexpected event" });
  }
  if (!contractId) {
    return res.status(200).json({ data: "ignored: missing contractId" });
  }
  // The contract id must belong to a known tenant — otherwise we have no account to call the API with.
  const tenant = await prisma.tenant.findFirst({ where: { smaregiContractId: String(contractId) }, select: { code: true } });
  if (!tenant) {
    return res.status(200).json({ data: "ignored: unknown contract" });
  }
  const contractIdStr = String(contractId);

  const ids: string[] = Array.isArray(transactionHeadIds) ? transactionHeadIds : [];

  const act = (action as string) ?? SmaregiTransactionAction.Created;

  // Process each id independently so one failure never fails the whole batch. `created` settles the
  // 仮販売 (processSmaregiTransaction); every other action is a mutation (edited / canceled /
  // disposed / bulk-update / bulk-deleted) handled separately.
  for (const id of ids) {
    try {
      if (act === SmaregiTransactionAction.Created) {
        await processSmaregiTransaction(contractIdStr, String(id), act, SmaregiTransactionSource.Webhook);
      } else {
        await handleSmaregiTransactionMutation(contractIdStr, String(id), act, SmaregiTransactionSource.Webhook);
      }
    } catch (error) {
      logger.error(`[smaregi] webhook failed for transaction ${id}: ${(error as Error)?.message}`);
    }
  }

  return res.status(200).json({ data: "OK" });
});

export default handler;
