import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { AppState } from "stores";

export enum NotificationType {
  SUCCESS = "success",
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
}

export const NotificationTitle = {
  [NotificationType.SUCCESS]: "成功",
  [NotificationType.ERROR]: "エラー",
  [NotificationType.WARNING]: "警告",
};

type NotificationInfo = {
  type: NotificationType;
  title?: string;
  message: string;
};

type NotificationState = {
  isShow: boolean;
  info: NotificationInfo;
};

const initialState: NotificationState = {
  isShow: false,
  info: { type: null, title: "", message: "" },
};

export const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    showNotification: (state, action: PayloadAction<NotificationInfo>) => {
      state.isShow = true;
      state.info = action.payload;
    },

    hideNotification: (state) => {
      state.isShow = false;
    },
  },
});

export const { showNotification, hideNotification } = notificationSlice.actions;

export default notificationSlice.reducer;

export const selectNotification = () => (state: AppState) => state.notification;
