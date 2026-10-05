import { createSlice } from "@reduxjs/toolkit";

import { AppState } from "stores";

type NotificationState = {
  isShow: boolean;
};

const initialState: NotificationState = {
  isShow: false,
};

export const backdropLoadingSlice = createSlice({
  name: "backdrop-loading",
  initialState,
  reducers: {
    showBackdropLoading: (state) => {
      state.isShow = true;
    },

    hideBackdropLoading: (state) => {
      state.isShow = false;
    },
  },
});

export const { showBackdropLoading, hideBackdropLoading } = backdropLoadingSlice.actions;

export default backdropLoadingSlice.reducer;

export const selectBackdropLoading = () => (state: AppState) => state.backdropLoading;
