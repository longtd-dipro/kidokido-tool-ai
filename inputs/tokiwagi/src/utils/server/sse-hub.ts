import { Prisma } from "@prisma/client";

import logger from "utils/logger";
import prisma from "utils/db";

const RETENTION_MS = 60 * 60 * 1000; // 1 hour

export type SseRow = { id: number; payload: Prisma.JsonValue };

export enum SseEvent {
  SCAN_ERROR = "scan-error",
  SCAN_SUCCESS = "scan-success",
  TRANSACTION_PAID = "transaction-paid",
  CANCEL_AND_REFUND_SUCCESS = "cancel-and-refund-success",
}

export enum SseLogLevel {
  SUCCESS = "success",
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
}
export type SseCheckInResult = { hasRemainingCheckIn: boolean };
export type SseCheckOutResult = {
  barCode: string;
  hasRemaining: boolean;
  needPayment: boolean;
};
export type SsePayload = {
  event: SseEvent;
  level: SseLogLevel;
  message?: string;
  checkIn?: SseCheckInResult;
  checkOut?: SseCheckOutResult;
};

export const registerSseNotification = async (
  userId: string | number | undefined,
  payload: SsePayload,
): Promise<void> => {
  if (!userId) {
    return;
  }

  try {
    await prisma.sseNotification.create({
      data: {
        userId: Number(userId),
        payload: payload as Prisma.InputJsonValue,
      },
    });
  } catch (_error) {
    return;
  }
};

export const getLatestNotificationId = async (
  userId: string | number,
): Promise<number> => {
  const latest = await prisma.sseNotification.findFirst({
    where: { userId: Number(userId) },
    orderBy: { id: "desc" },
    select: { id: true },
  });
  return latest?.id ?? 0;
};

export const fetchNotificationsAfter = async (
  userId: string | number,
  afterId: number,
): Promise<SseRow[]> => {
  return prisma.sseNotification.findMany({
    where: { userId: Number(userId), id: { gt: afterId } },
    orderBy: { id: "asc" },
    select: { id: true, payload: true },
  });
};

export const cleanupOldNotifications = async (): Promise<void> => {
  const now = Date.now();
  try {
    await prisma.sseNotification.deleteMany({
      where: { createdAt: { lt: new Date(now - RETENTION_MS) } },
    });
  } catch (error) {
    logger.error(
      `[cron:daily] cleanupOldNotifications failed: ${(error as Error)?.message}`,
    );
  }
};

export const getSseScanErrorPayload = (message: string): SsePayload => {
  return { event: SseEvent.SCAN_ERROR, level: SseLogLevel.ERROR, message };
};

export const getSseScanSuccessPayload = (
  message: string,
  extra?: {
    checkIn?: { hasRemainingCheckIn: boolean };
    checkOut?: { barCode: string; hasRemaining: boolean; needPayment: boolean };
  },
): SsePayload => {
  return {
    event: SseEvent.SCAN_SUCCESS,
    level: SseLogLevel.INFO,
    message,
    ...(extra ?? {}),
  };
};

export const getSseCancelAndRefundSuccessPayload = (): SsePayload => {
  return {
    event: SseEvent.CANCEL_AND_REFUND_SUCCESS,
    level: SseLogLevel.SUCCESS,
  };
};
