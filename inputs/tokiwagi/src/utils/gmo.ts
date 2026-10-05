import moment from "moment";

import { serverConfig } from "config";
import { CREDIT_CARD_ERRORS } from "constants/booking";
import { CREDIT_CARD_EXPIRE_FORMAT } from "constants/common";
import { CreditCardFormData } from "models/Booking";

type GMOResponse = {
  ErrInfo: string;
  [key: string]: any;
};

export type GMOAccount = {
  shop_id: string;
  shop_pass: string;
  site_id: string;
  site_pass: string;
};

export const parseGMOResponse = (response: string): GMOResponse => {
  const splitString = response.split("&");

  const result = splitString.reduce((acc, item) => {
    const [key, values] = splitByFirstDelimiter(item, "=");
    const value = values.split("|")[0];
    return { ...acc, [key]: value };
  }, {});

  return {
    ErrInfo: null,
    ...result,
  };
};

export const getCreditCardToken = async (data: CreditCardFormData): Promise<{ errorMessage?: string; token?: string }> => {
  const { cardNumber, securityCode, holderName, expiredAt } = data;
  const shopId = serverConfig.gmo.shop_id;

  if (!securityCode) {
    return null;
  }

  const expire = moment(expiredAt).format(CREDIT_CARD_EXPIRE_FORMAT);
  const creditCardPayload = {
    cardno: cardNumber,
    expire,
    securitycode: securityCode,
    holdername: holderName,
  };

  return new Promise((resolve) => {
    (window as any).Multipayment.init(shopId);
    (window as any).Multipayment.getToken(creditCardPayload, (response) => {
      const { resultCode, tokenObject } = response;
      if (resultCode !== "000" || !tokenObject?.token) {
        const errorMessage = CREDIT_CARD_ERRORS[resultCode];
        return resolve({ errorMessage });
      }
      resolve({ token: tokenObject.token });
    });
  });
};

export const splitByFirstDelimiter = (inputString: string, delimiter: string) => {
  const delimiterIndex = inputString.indexOf(delimiter);

  const key = inputString.substring(0, delimiterIndex);
  const value = inputString.substring(delimiterIndex + 1);

  return [key, value];
};
