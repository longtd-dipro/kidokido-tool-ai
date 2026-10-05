import * as yup from "yup";

import { MESSAGES } from "constants/messages";

export const changePaymentStatus = yup.object().shape({
  posTotalAmount: yup.number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value
    )
    .required("最終支払金額を入力してください。")
    .typeError("有効な価格を入力してください。")
    .integer("有効な価格を入力してください。")
    .min(0, MESSAGES.MIN_NUMBER_IS_ZERO),
  couponName: yup.string(),
  couponAmount: yup.number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value
    )
    .typeError("有効な価格を入力してください。")
    .integer("有効な価格を入力してください。")
    .min(0, MESSAGES.MIN_NUMBER_IS_ZERO)
    .nullable()
    .notRequired(),
});
