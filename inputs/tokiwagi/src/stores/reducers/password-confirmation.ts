import { createSlice } from "@reduxjs/toolkit";

import { AppState } from "stores";

type PasswordConfirmationState = {
  isShow: boolean;
};

const initialState: PasswordConfirmationState = {
  isShow: false
};

export const passwordConfirmationSlice = createSlice({
  name: "password-confirmation",
  initialState,
  reducers: {
    showPasswordConfirmation: (state) => {
      state.isShow = true;
    },

    hidePasswordConfirmation: (state) => {
      state.isShow = false;
    },
  },
});

export const { showPasswordConfirmation, hidePasswordConfirmation } = passwordConfirmationSlice.actions;

export default passwordConfirmationSlice.reducer;

export const selectPasswordConfirmation = () => (state: AppState) => state.passwordConfirmation;
