import os from "os";

import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { getDiskInfoSync } from "node-disk-info/dist";

import prisma from "utils/db";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import logger from "utils/logger";
import { convertFileSize } from "utils/common";
import { cpuUsage } from "utils/cpu";

const handler = nc({ onError, onNoMatch });

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const WEB = await checkWebServer();
  const DB = await checkDB();

  res.status(200).json({ data: { WEB, DB } });
});

export default handler;

const checkWebServer = async () => {
  const WEB = { status: "OK" };

  WEB["CPU"] = await cpuUsage();
  const memTotal = Math.round(convertFileSize(os.totalmem(), "B", "MB"));
  const memFree = Math.round(convertFileSize(os.freemem(), "B", "MB"));
  WEB["MEM"] = Math.round(((memTotal - memFree) / memTotal) * 100);
  WEB["MEM_TOTAL"] = `${memTotal} MB`;
  WEB["MEM_FREE"] = `${memFree} MB`;

  if (WEB["MEM"] >= 80) {
    WEB["warning"] = "MEM is too high";
  }

  if (WEB["CPU"] >= 80 && !WEB["warning"]) {
    WEB["warning"] = "CPU is too high";
  }

  const { free: diskFree, total: diskTotal } = await checkDiskSpace();
  if (diskTotal) {
    WEB["DISK_SPACE"] = Math.round(((diskTotal - diskFree) / diskTotal) * 100);
    WEB["DISK_SPACE_TOTAL"] = `${convertFileSize(diskTotal, "KB", "GB").toFixed(2)} GB`;
    WEB["DISK_SPACE_FREE"] = `${convertFileSize(diskFree, "KB", "GB").toFixed(2)} GB`;

    if (WEB["DISK_SPACE"] >= 80 && !WEB["warning"]) {
      WEB["warning"] = "Disk space is almost full";
    }
  }

  return WEB;
};

const checkDiskSpace = async () => {
  const path = os.platform() === "win32" ? "c:" : "/";
  let free, total;

  try {
    const drives = getDiskInfoSync();
    const rootDrive = drives.find(drive => drive.mounted == path);
    if (rootDrive) {
      free = rootDrive.available;
      total = rootDrive.blocks;
    }
  } catch (err) {
    const message = err.stack || err.message;
    logger.error(message);
  }

  return { free, total };
};

const checkDB = async () => {
  let DB = {};

  try {
    await prisma.$queryRaw`SELECT 1`;
    DB = {
      status: "OK"
    };

    const records = await prisma.$queryRaw`SELECT COUNT(*) AS total_connections
                                           FROM pg_stat_activity
                                           WHERE state = 'active'`;
    const numberOfConnections = records[0]?.total_connections || 0;
    DB["CONNECTIONS"] = numberOfConnections;

    if (DB["CONNECTIONS"] >= 80) {
      DB["warning"] = "Connection is too high";
    }

  } catch (e) {
    const message = e.stack || e.message;
    logger.error(message);
    DB = {
      status: "NOT_OK",
      message
    };
  }

  return DB;
};
