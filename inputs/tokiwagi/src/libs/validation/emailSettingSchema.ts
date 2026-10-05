import * as yup from "yup";

export const emailPreviewSchema = yup.object().shape({
  content: yup.string().required(),
});

export const sendPreviewEmailSchema = yup.object().shape({
  emailKey: yup.string().required(),
  emailTitle: yup.string().required(),
  content: yup.string().required(),
  email: yup
    .string()
    .email("メールアドレスは正しく入力してください")
    .typeError("メールアドレスを入力してください")
    .required("メールアドレスを入力してください")
    .trim(),
});
