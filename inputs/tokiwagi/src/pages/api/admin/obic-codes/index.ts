import fs from "fs";

import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import formidable, { File } from "formidable";
import { Prisma, TicketBookingSchedule, TicketDetail, TicketDiscountSetting, TicketType } from "@prisma/client";

import prisma from "utils/db";
import { DEFAULT_TRANSACTION_TIMEOUT, ROLE } from "constants/common";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import { IResponse } from "models/Response";
import { DiscountSettingItem } from "models/Discount";

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.ADMIN, ROLE.SUPER_ADMIN, ROLE.STAFF]));

type ObicTicketToImport = {
  ticketName: string | null;
  category: string | null;
  description: string | null;
  // Raw OBIC codes (null when the cell is empty)
  parent1st: string | null;
  parent2nd: string | null;
  child1st: string | null;
  child2nd: string | null;
  parentSecondTimes: string | null;
  childSecondTimes: string | null;
  extendedChild: string | null;
  extendedParent: string | null;
}

const removeEmptyFields = (obj: any) => {
  for (const key in obj) {
    if (obj[key] === null || obj[key] === undefined) {
      delete obj[key];
    }
  }
  return obj;
};

export const seedObicCodeToDb = async (
  tenantCode: string,
  obicTicketToImport: ObicTicketToImport[]) => {
  const existedTicketNames = [];
  for (const obicTicket of obicTicketToImport) {
    if (!obicTicket.ticketName) {
      continue;
    }
    const existedTicket = await prisma.ticket.findFirst({
      where: {
        tenantCode: tenantCode,
        name: {
          contains: obicTicket.ticketName,
          mode: "insensitive",
        },
      },
      include: {
        TicketDiscountSetting: true
      }
    });

    if (!existedTicket) {
      continue;
    }
    const haveDiscountObicCode = obicTicket.child2nd;
    existedTicketNames.push(obicTicket.ticketName);
    await prisma.$transaction(async (tx) => {
      if (existedTicket.type === TicketType.Daily || existedTicket.type === TicketType.Hourly) {
        const dataToUpdateTicketBookingSchedule: Partial<TicketBookingSchedule> = {
          baseAdultObicCode: obicTicket.parent1st,
          baseChildObicCode: obicTicket.child1st,
          extendedAdultObicCode: obicTicket.extendedParent,
          extendedChildObicCode: obicTicket.extendedChild,
        };
        await tx.ticketBookingSchedule.updateMany({
          where: {
            ticketId: existedTicket.id,
          },
          data: removeEmptyFields(dataToUpdateTicketBookingSchedule),
        });
      } else if (existedTicket.type === TicketType.Monthly || existedTicket.type === TicketType.DailyTimesLimit) {
        const dataToUpdateTicketDetail: Partial<TicketDetail> = {
          // OBIC code for the first booking, and the second booking
          adultObicCode1stBooking: obicTicket.parent1st,
          childObicCode1stBooking: obicTicket.child1st,
          adultObicCode: obicTicket.parentSecondTimes,
          childObicCode: obicTicket.childSecondTimes,
        };

        await tx.ticketDetail.updateMany({
          where: {
            ticketId: existedTicket.id,
          },
          data: removeEmptyFields(dataToUpdateTicketDetail),
        });
      } else {
        return;
      }

      const discountSettingItems = existedTicket.TicketDiscountSetting?.setting as unknown as DiscountSettingItem[];
      if (haveDiscountObicCode && discountSettingItems?.length) {
        const dataToUpdateTicketDiscountSetting: Partial<TicketDiscountSetting> = {
          setting: discountSettingItems.map((settingItem) => {
            return removeEmptyFields({
              ...settingItem,
              childObicCode:
                obicTicket.child2nd || settingItem.childObicCode,
              adultObicCode:
                obicTicket.parent2nd || settingItem.adultObicCode,
            });
          }) as unknown as Prisma.JsonArray,
        };

        await tx.ticketDiscountSetting.updateMany({
          where: {
            ticketId: existedTicket.id,
          },
          data: dataToUpdateTicketDiscountSetting,
        });
      }
    },
    { timeout: DEFAULT_TRANSACTION_TIMEOUT }
    );
  }
};

/* ─────────────────────────────────────────────────────────────
   Route: POST /api/admin/obic-codes
   Body:  multipart/form-data  { tenantCode: string, file: CSV }
───────────────────────────────────────────────────────────── */
handler.post(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const tenantCode = Array.isArray(fields.tenantCode) ? fields.tenantCode[0] : fields.tenantCode;
    if (!tenantCode || !tenantCode.trim()) {
      return res.status(400).json({ error: "tenantCode パラメーターが必要です" });
    }

    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file as File | undefined;
    if (!uploadedFile) {
      return res.status(400).json({ error: "CSV ファイルが必要です" });
    }

    const csvContent = await fs.promises.readFile(uploadedFile.filepath, "utf-8");
    const importRows = parseCSV(csvContent);

    /** Normalise an OBIC code cell, returning null when empty / "null". */
    const resolveCode = (code: string | undefined): string | null => {
      const value = code?.trim();
      if (!value || value === "null") return null;
      return value;
    };

    const obicTicketToImport: ObicTicketToImport[] = importRows.map((row) => ({
      ticketName: row["TicketName"] || null,
      category: row["Category"] || null,
      description: row["description"] || null,
      parent1st: resolveCode(row["parent1st"]),
      parent2nd: resolveCode(row["parent2nd"]),
      child1st: resolveCode(row["child1st"]),
      child2nd: resolveCode(row["child2nd"]),
      parentSecondTimes: resolveCode(row["parentSecondTimes"]),
      childSecondTimes: resolveCode(row["childSecondTimes"]),
      extendedChild: resolveCode(row["extendedChild"]),
      extendedParent: resolveCode(row["extendedParent"]),
    }));

    await seedObicCodeToDb(tenantCode, obicTicketToImport);
    return res.status(200).json({ data: obicTicketToImport });
  });
});

/* ─────────────────────────────────────────────────────────────
   CSV parsing helpers
───────────────────────────────────────────────────────────── */

/** Split a single CSV line, respecting double-quoted fields that may contain commas. */
const splitCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (const ch of line) {
    if (ch === "\"") {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
};

/** Parse a CSV string into an array of header-keyed objects. */
const parseCSV = (content: string): Record<string, string>[] => {
  // Normalise Windows line endings
  const lines = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim().split("\n");
  if (lines.length < 2) return [];

  const headers = splitCSVLine(lines[0]).map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = splitCSVLine(line);
    const record: Record<string, string> = {};
    headers.forEach((header, i) => {
      record[header] = values[i]?.trim() ?? "";
    });
    return record;
  });
};

export default handler;
