import * as yup from "yup";

export const confirmSecurityAnswerSchema = yup.object().shape({
  question: yup.mixed().required("質問を必ず選択してください"),
  answer: yup.string().required("回答を必ず入力してください"),
});
