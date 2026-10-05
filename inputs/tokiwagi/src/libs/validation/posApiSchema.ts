import * as yup from "yup";
import moment from "moment";

import { POS_API_ERROR_MESSAGE } from "constants/pos-api-result";

export const barCodeSchema = yup.object().shape({
  barCode: yup.string().required(POS_API_ERROR_MESSAGE.BAR_CODE_IS_REQUIRED),
});

export const calculationPayAmountPayloadSchema = yup.object().shape({
  barCode: yup.string().required(POS_API_ERROR_MESSAGE.BAR_CODE_IS_REQUIRED),
  payTimeAt: yup
    .string()
    .required(POS_API_ERROR_MESSAGE.PAY_TIME_AT_IS_REQUIRED)
    .test("is-valid-format", POS_API_ERROR_MESSAGE.INVALID_DATE_TIME_FORMAT, (value) => moment(value).isValid()),
});

export const checkoutPayloadSchema = yup.object().shape({
  barCode: yup.string().required(POS_API_ERROR_MESSAGE.BAR_CODE_IS_REQUIRED),
  totalAmount: yup.number(),
  coupons: yup.array().of(
    yup.object().shape({
      code: yup.string().required(),
      discountAmount: yup.number().required(),
    })
  ),
});
