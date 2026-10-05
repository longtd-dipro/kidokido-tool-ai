import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { AppState } from "stores";

type CredentialsConfirmationState = {
  loggedStaffId?: string;
  isShow: boolean;
};

const initialState: CredentialsConfirmationState = {
  loggedStaffId: null,
  isShow: false,
};

export const credentialsConfirmationSlice = createSlice({
  name: "credentials-confirmation",
  initialState,
  reducers: {
    showCredentialsConfirmation: (state) => {
      state.isShow = true;
    },

    hideCredentialsConfirmation: (state) => {
      state.isShow = false;
      state.loggedStaffId = null;
    },

    setLoggedStaffId: (state, action: PayloadAction<string>) => {
      state.loggedStaffId = action.payload;
    },
  },
});

export const { showCredentialsConfirmation, hideCredentialsConfirmation, setLoggedStaffId } = credentialsConfirmationSlice.actions;

export default credentialsConfirmationSlice.reducer;

export const selectCredentialsConfirmation = () => (state: AppState) => state.credentialsConfirmation;
