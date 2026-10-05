import { FieldValues } from "react-hook-form";

import { hidePasswordConfirmation, showPasswordConfirmation } from "stores/reducers/password-confirmation";
import { ERROR_MESSAGES } from "constants/errors";
import { hideCredentialsConfirmation, setLoggedStaffId, showCredentialsConfirmation } from "stores/reducers/credentials-confirmation";

export const isMobile = () => {
  if (typeof window !== "undefined") {
    const mobilePortrait = window.matchMedia("(max-width: 767px) and (orientation: portrait)");
    const isMobileState = mobilePortrait.matches;
    return isMobileState;
  }
  return false;
};

export const confirmPassword = (dispatch) => {
  return new Promise((resolve, reject) => {
    dispatch(showPasswordConfirmation());
    removeListeners("#event-emitter");
    const eventEmitter = document.querySelector("#event-emitter");
    eventEmitter.addEventListener("resolve", (event: CustomEvent) => {
      dispatch(hidePasswordConfirmation());
      resolve(event.detail.data);
    });
    eventEmitter.addEventListener("reject", () => {
      dispatch(hidePasswordConfirmation());
      reject(new Error(ERROR_MESSAGES.CONFIRM_PASSWORD_FAILED));
    });
  });
};

export const onResolve = (data) => {
  const eventEmitter = document.querySelector("#event-emitter");
  const resolve = new CustomEvent("resolve", { detail: { data } });
  eventEmitter.dispatchEvent(resolve);
};

export const onReject = (data) => {
  const eventEmitter = document.querySelector("#event-emitter");
  const reject = new CustomEvent("reject", { detail: { data } });
  eventEmitter.dispatchEvent(reject);
};

function removeListeners(el) {
  const oldElement = document.querySelector(el);
  const newElement = oldElement.cloneNode(true);
  oldElement.parentNode.replaceChild(newElement, oldElement);
}

export const confirmCredentials = (dispatch, loggedStaffId?: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    dispatch(showCredentialsConfirmation());
    loggedStaffId && dispatch(setLoggedStaffId(loggedStaffId));

    removeListeners("#event-emitter");
    const eventEmitter = document.querySelector("#event-emitter");

    eventEmitter.addEventListener("resolve", (event: CustomEvent) => {
      dispatch(hideCredentialsConfirmation());
      resolve(event.detail.data);
    });

    eventEmitter.addEventListener("reject", () => {
      dispatch(hideCredentialsConfirmation());
      reject(new Error(ERROR_MESSAGES.CONFIRM_PASSWORD_FAILED));
    });
  });
};

export const scrollToElementByClass = (className: string) => {
  const elements = document.getElementsByClassName(className);
  const firstElement = elements[0];

  // Scroll to the first element
  if (firstElement) {
    firstElement.scrollIntoView({ behavior: "smooth", block: "center" });
  }
};

export const scrollToElementOnError = (errors: FieldValues) => {
  if (Object.keys(errors).length) {
    setTimeout(() => {
      scrollToElementByClass("error-message");
    }, 1000);
  }
};
