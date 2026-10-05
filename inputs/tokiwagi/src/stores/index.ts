import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import { createWrapper } from "next-redux-wrapper";

import userReducer from "stores/reducers/user";
import notificationReducer from "stores/reducers/notification";
import passwordConfirmationReducer from "stores/reducers/password-confirmation";
import credentialsConfirmationReducer from "stores/reducers/credentials-confirmation";
import staffManagementReducer from "stores/reducers/staff-management";
import backdropLoadingReducer from "stores/reducers/backdrop-loading";

const rootReducer = combineReducers({
  users: userReducer,
  notification: notificationReducer,
  passwordConfirmation: passwordConfirmationReducer,
  credentialsConfirmation: credentialsConfirmationReducer,
  staffManagement: staffManagementReducer,
  backdropLoading: backdropLoadingReducer,
});

const makeStore = () => {
  return configureStore({
    reducer: rootReducer,
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type AppState = ReturnType<AppStore["getState"]>;

export const storeWrapper = createWrapper(makeStore);
