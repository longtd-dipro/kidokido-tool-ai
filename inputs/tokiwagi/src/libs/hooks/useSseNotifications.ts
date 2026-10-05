import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import { NotificationType } from "stores/reducers/notification";
import { SESSION_STATUS } from "constants/common";

const SSE_STREAM_URL = "/api/user/notifications/stream";

export enum SseEvent {
  SCAN_ERROR = "scan-error",
  SCAN_SUCCESS = "scan-success",
  TRANSACTION_PAID = "transaction-paid",
}

export type SseCheckInResult = {
  hasRemainingCheckIn: boolean;
};

export type SseCheckOutResult = {
  barCode: string;
  hasRemaining: boolean;
  needPayment: boolean;
};

export type SseNotification = {
  message: string;
  level?: NotificationType;
  title?: string;
  event?: SseEvent;
  checkIn?: SseCheckInResult;
  checkOut?: SseCheckOutResult;
};

type UseSseNotificationsReturn = {
  notification: SseNotification | null;
  clearNotification: () => void;
};

export const useSseNotifications = (): UseSseNotificationsReturn => {
  const { status } = useSession();
  const [notification, setNotification] = useState<SseNotification | null>(null);

  const clearNotification = useCallback(() => setNotification(null), []);

  useEffect(() => {
    if (status !== SESSION_STATUS.AUTHENTICATED || typeof window === "undefined") {
      return;
    }

    const eventSource = new EventSource(SSE_STREAM_URL, { withCredentials: true });

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as SseNotification;
        if (!payload?.message && !payload?.event) return;
        setNotification(payload);
      } catch {
        // Ignore malformed messages.
      }
    };

    return () => {
      eventSource.close();
    };
  }, [status]);

  return { notification, clearNotification };
};
