import * as yup from "yup";

export const gmoSettingSchema = yup.object().shape({
  name: yup.string().required("アカウント名を必ず入力してください"),
  shopId: yup.string().required("ショップIDを必ず入力してください"),
  shopPass: yup.string().required("ショップパスワードを必ず入力してください"),
});
