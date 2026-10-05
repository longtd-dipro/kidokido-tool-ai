import { createSlice } from "@reduxjs/toolkit";

import { Staff, User } from "models/Entity";
import { AppState } from "stores";

type CredentialsConfirmationState = {
  isSkipCredentialsStep: boolean;
  staffOrAdmin: Staff | User;
};

const initialState: CredentialsConfirmationState = {
  isSkipCredentialsStep: false,
  staffOrAdmin: null,
};

export const staffManagementSlice = createSlice({
  name: "staff-management",
  initialState,
  reducers: {
    skipCredentialsStep: (state) => {
      state.isSkipCredentialsStep = true;
    },

    enableCredentialsRequired: (state) => {
      state.isSkipCredentialsStep = false;
    },

    updateStaffOrAdmin: (state, action) => {
      state.staffOrAdmin = action.payload;
    },

    resetStaffOrAdmin: (state) => {
      state.staffOrAdmin = null;
    },
  },
});

export const { skipCredentialsStep, enableCredentialsRequired, updateStaffOrAdmin, resetStaffOrAdmin } = staffManagementSlice.actions;

export default staffManagementSlice.reducer;

export const selectStaffManagement = () => (state: AppState) => state.staffManagement;
