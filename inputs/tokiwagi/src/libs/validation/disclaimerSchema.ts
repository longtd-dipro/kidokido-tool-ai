import * as yup from "yup";

export const disclaimerSchema = yup.object().shape({
  disclaimers: yup
    .array()
    .of(
      yup.object().shape({
        title: yup.string().required("本文を入力してください"),
        options: yup.array().of(
          yup.object().shape({
            content: yup.string().required("テキストを入力していないチェックボックスがあります。ご確認の上、ご入力してください"),
          })
        ),
      })
    )
    .required("Required"),
});
