import * as yup from "yup";

export const staffSchema = yup.object().shape({
  lastName: yup.string().typeError("姓を入力してください").required("姓を入力してください").trim(),
  firstName: yup.string().typeError("名を入力してください").required("名を入力してください").trim(),
  lastNameFurigana: yup
    .string()
    .typeError("セイ（カナ）を入力してください")
    .required("セイ（カナ）を入力してください")
    .matches(/^([ァ-ンa-zA-Z]|ー|ヴ)+$/, "全角カナまたはアルファベットの文字で入力してください")
    .trim(),
  firstNameFurigana: yup
    .string()
    .typeError("メイ（カナ）を入力してください")
    .required("メイ（カナ）を入力してください")
    .matches(/^([ァ-ンa-zA-Z]|ー|ヴ)+$/, "全角カナまたはアルファベットの文字で入力してください")
    .trim(),
  id: yup.string().typeError("従業員IDを入力してください").required("従業員IDを入力してください").trim(),
  password: yup
    .string()
    .nullable()
    .required("パスワードを入力してください")
    .matches(/^(?=.*[0-9])(?=.*[a-z|A-Z])(?=\S+$).{8,}$/, "パスワードは半角記号英数字8文字以上、アルファベットの文字・数字をそれぞれ１つ以上使用してください")
    .min(8)
    .max(255),
  role: yup.string().typeError("権限を選択してください").required("権限を選択してください"),
  tenantCode: yup.string().typeError("店舗を選択してください").required("店舗を選択してください"),
});
