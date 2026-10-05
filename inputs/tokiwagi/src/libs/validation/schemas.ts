import moment from "moment";
import * as yup from "yup";
import { isNil } from "lodash";
import { PaymentStatus } from "@prisma/client";

import { isAfterOrSameTime, isAfterTime, isBeforeDay, isBeforeOrSameTime } from "utils/date-time";
import { MESSAGES } from "constants/messages";
import { MINIMUM_SIGNUP_USER_AGE, SHORT_DATE } from "constants/common";

export const signupSchema = yup.object().shape({
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
  email: yup
    .string()
    .email("メールアドレスは正しく入力してください")
    .typeError("メールアドレスを入力してください")
    .required("メールアドレスを入力してください")
    .trim(),
  password: yup
    .string()
    .nullable()
    .required("パスワードを入力してください")
    .matches(/^(?=.*[0-9])(?=.*[a-z|A-Z])(?=\S+$).{8,}$/, "パスワードは半角記号英数字8文字以上、アルファベットの文字・数字をそれぞれ１つ以上使用してください")
    .min(8)
    .max(255),
  confirmationPassword: yup
    .string()
    .nullable()
    .required("確認用のパスワードを入力してください")
    .matches(/^(?=.*[0-9])(?=.*[a-z|A-Z])(?=\S+$).{8,}$/, "パスワードは半角記号英数字8文字以上、アルファベットの文字・数字をそれぞれ１つ以上使用してください")
    .oneOf([yup.ref("password")], "確認用のパスワードが入力されたパスワードと一致しません"),
  phone: yup
    .string()
    .typeError("電話番号を入力してください")
    .required("電話番号を入力してください")
    .matches(/^\d{10}$|^\d{11}$/, "電話番号は10または11桁の半角英数字を入力してください"),
  postCode: yup
    .string()
    .typeError("郵便番号を入力してください")
    .required("郵便番号を入力してください")
    .matches(/^\d{7}$/, "半角英数字7桁を入力してください"),
  province: yup.string().required("都道府県を選択してください").typeError("都道府県を選択してください").nullable(),
  address: yup
    .string()
    .required("住所を入力してください")
    .typeError("住所を入力してください")
    .test("empty-check", "住所を入力してください", (value) => value.trim().length > 0),
  gender: yup
    .boolean()
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .test("empty-check", "性別を選択してください", (value) => value !== undefined),
  birthday: yup
    .mixed()
    .nullable()
    .typeError("日付形式が正しく入力してください")
    .test("empty-check", "生年月日を選択してください", (value) => value != "" && !isNil(value))
    .test("date-check", "過去の日付を入力してください", (value) => {
      const today = new Date();
      return isBeforeDay(value, today);
    })
    .test("minimum-age-check", "18歳未満の方は登録ができません", (value) => {
      if (!value) return true;
      const date = moment(value).format(SHORT_DATE);
      const age = moment().diff(date, "years");
      return age >= MINIMUM_SIGNUP_USER_AGE;
    })
    .required("生年月日を選択してください"),
  allowedNewsletter: yup.boolean().required("どちらかを選択してください"),
  agreePrivacy: yup.boolean().oneOf([true], "利用規約とプライバシーポリシーに同意する必要があります"),
  systemCreated: yup.boolean().nullable(),
});

export const createUserSchema = signupSchema.omit(["agreePrivacy"]);

export const updateUserSchema = signupSchema.omit(["agreePrivacy"]);

export const updateUserSchemaAdmin = yup.object().shape({
  lastName: yup.string().nullable().trim(),
  firstName: yup.string().nullable().trim(),
  lastNameFurigana: yup
    .string()
    .nullable()
    .matches(/^([ァ-ンa-zA-Z]|ー|ヴ)+$/, "全角カナまたはアルファベットの文字で入力してください")
    .trim(),
  firstNameFurigana: yup
    .string()
    .nullable()
    .matches(/^([ァ-ンa-zA-Z]|ー|ヴ)+$/, "全角カナまたはアルファベットの文字で入力してください")
    .trim(),
  email: yup.string().nullable().email("メールアドレスは正しく入力してください").trim(),
  password: yup
    .string()
    .nullable()
    .matches(/^(?=.*[0-9])(?=.*[a-z|A-Z])(?=\S+$).{8,}$/, "パスワードは半角記号英数字8文字以上、アルファベットの文字・数字をそれぞれ１つ以上使用してください")
    .min(8)
    .max(255),
  phone: yup
    .string()
    .nullable()
    .matches(/^\d{10}$|^\d{11}$/, "電話番号は10または11桁の半角英数字を入力してください"),
  postCode: yup
    .string()
    .nullable()
    .matches(/^\d{7}$/, "半角英数字7桁を入力してください"),
  province: yup.string().nullable(),
  address: yup.string().nullable(),
  gender: yup
    .boolean()
    .transform((value) => (value === "" ? null : value))
    .nullable(),
  birthday: yup
    .mixed()
    .nullable()
    .test("date-check", "過去の日付を入力してください", (value) => {
      if (!value) return true;
      const today = new Date();
      return isBeforeDay(value, today);
    })
    .test("minimum-age-check", "18歳未満の方は登録ができません", (value) => {
      if (!value) return true;
      const date = moment(value).format(SHORT_DATE);
      const age = moment().diff(date, "years");
      return age >= MINIMUM_SIGNUP_USER_AGE;
    }),
  allowedNewsletter: yup.boolean(),
  systemCreated: yup.boolean().nullable(),
});

export const updateLineUserSchema = signupSchema.omit(["password", "confirmationPassword", "confirmationEmail", "agreePrivacy"]);

export const updateUserSchemaForStaff = signupSchema.pick(["lastName", "firstName", "lastNameFurigana", "firstNameFurigana", "email", "systemCreated"]);

export const bookingManagementSchema = yup.object().shape({
  startDate: yup.date().typeError("日付形式が正しく入力してください").nullable(),
  endDate: yup.date().typeError("日付形式が正しく入力してください").nullable(),
});

export const signInSchema = yup.object().shape({
  email: yup
    .string()
    .email("メールアドレスは正しく入力してください")
    .typeError("メールアドレスは正しく入力してください")
    .required("メールアドレスを入力してください"),
  password: yup
    .string()
    .required("パスワードを入力してください")
    .matches(/^(?=.*[0-9])(?=.*[a-z|A-Z])(?=\S+$).{8,}$/, "パスワードは半角記号英数字8文字以上、アルファベットの文字・数字をそれぞれ１つ以上使用してください"),
});

export const tokenSignInSchema = yup.object().shape({
  token: yup.string().required(),
});

export const forgotPasswordSchema = yup.object().shape({
  email: yup.string().email("メールアドレスは正しく入力してください").required("メールアドレスを入力してください"),
});

export const resetPasswordSchema = yup.object().shape({
  password: yup
    .string()
    .required("新しいパスワードを入力してください")
    .matches(/^(?=.*[0-9])(?=.*[a-z|A-Z])(?=\S+$).{8,}$/, "パスワードは半角記号英数字8文字以上、アルファベットの文字・数字をそれぞれ１つ以上使用してください")
    .min(8)
    .max(256),
  confirmedPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "確認用のパスワードが入力されたパスワードと一致しません")
    .required("確認用のパスワードを入力してください"),
});

export const resetPasswordWithTokenSchema = yup.object().shape({
  token: yup.string().required(),
  password: yup.string().required("Password is required"),
  confirmedPassword: yup.string().oneOf([yup.ref("password"), null], "Passwords must match"),
});

export const changeAdminPasswordSchema = yup.object().shape({
  currentPassword: yup.string().required("パスワードを入力してください"),
  newPassword: yup
    .string()
    .required("新パスワードを入力してください")
    .matches(/^(?=.*[0-9])(?=.*[a-z|A-Z])(?=\S+$).{8,}$/, "パスワードは半角記号英数字8文字以上、アルファベットの文字・数字をそれぞれ１つ以上使用してください"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword"), null], "確認用のパスワードが入力されたパスワードと一致しません")
    .required("確認用のパスワードを入力してください"),
});

export const appSettingSchema = yup.object().shape({
  settingKey: yup.string().required("Setting Key is required"),
  name: yup.string().required("Name is required"),
  value: yup.string().required("Value is required"),
  dataType: yup.string().required("Data Type is required"),
});

export const emailSettingScheme = yup.object().shape({
  emailKey: yup.string().required("Email Key is Required!"),
  name: yup.string().required("Name Email is Required!"),
  title: yup.string().required("メールのタイトルを入力してください"),
  content: yup
    .string()
    .required("メールのコンテンツを入力してください")
    .test("empty-check", "メールのコンテンツを入力してください", (value) => value != "<p><br></p>"),
});

export const tenantSchema = yup.object().shape({
  email: yup
    .string()
    .email("メールアドレスは正しく入力してください")
    .typeError("メールアドレスは正しく入力してください")
    .required("メールアドレスを入力してください")
    .trim(),
  password: yup
    .string()
    .required("パスワードを入力してください")
    .matches(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
      "パスワードは半角記号英数字8文字以上、アルファベットの大文字・小文字・数字をそれぞれ１つ以上使用してください"
    )
    .min(8)
    .max(256),
  confirmationPassword: yup
    .string()
    .required("確認用のパスワードを入力してください")
    .oneOf([yup.ref("password")], "確認用のパスワードが入力されたパスワードと一致しません"),
  code: yup
    .string()
    .typeError("施設コードを入力してください")
    .required("施設コードを入力してください")
    .matches(/^[a-zA-Z0-9@]+$/, "空白、特殊文字を入力しないでください"),
  name: yup.string().typeError("施設名を入力してください").required("施設名を入力してください").trim(),
  imageUrl: yup.string().typeError("施設画像をアップしてください").required("施設画像をアップしてください").trim(),
  siteUrl: yup.string().typeError("公式サイトのURLを入力してください").required("公式サイトのURLを入力してください").trim(),
  address: yup.string().typeError("住所を入力してください").required("住所を入力してください").trim(),
  postCode: yup
    .string()
    .typeError("郵便番号を入力してください")
    .required("郵便番号を入力してください")
    .matches(/^\d{7}$/, "半角英数字7桁を入力してください"),
  phone: yup
    .string()
    .typeError("電話番号を入力してください")
    .required("電話番号を入力してください")
    .test("check-phone-format", "電話番号は10または11桁の半角英数字を入力してください", (value) => {
      const totalHyphens = value.match(/-/g)?.length || 0;
      const totalNumbers = value.match(/\d/g)?.length || 0;
      return totalHyphens <= 2 && (totalNumbers === 10 || totalNumbers === 11);
    }),
  active: yup.boolean().optional(),
  openedAt: yup
    .mixed()
    .nullable()
    .test("time-check", "時刻形式を正しく入力してください", (value) => moment(value).isValid() || value == null),
  closedAt: yup
    .mixed()
    .test("time-check", "時刻形式を正しく入力してください", (value) => moment(value).isValid() || value == null)
    .test("is-after-time-open", "終了時間は開始時間より後の時間を選択してください", (value, context) => {
      const openedAt = context.parent.openedAt;
      if (!openedAt) return true;
      return value == null || isAfterTime(value, openedAt);
    }),
  servedUtil: yup
    .mixed()
    .test("time-check", "時刻形式を正しく入力してください", (value) => moment(value).isValid() || value == null)
    .test("is-before-time-close", "終了時間は最終入場受付時間より後の時間を選択してください", (value, context) => {
      const closedAt = context.parent.closedAt;
      if (!closedAt) return true;
      return value == null || isBeforeOrSameTime(value, closedAt);
    })
    .test("is-after-time-open", "最終入場受付時間は開始時間より後の時間を選択してください", (value, context) => {
      const openedAt = context.parent.openedAt;
      if (!openedAt) return true;
      return value == null || isAfterOrSameTime(value, openedAt);
    }),
  smaregiContractId: yup.string().nullable().optional().trim(),
  smaregiStoreId: yup.string().nullable().optional().trim(),
  smaregiTerminalId: yup
    .string()
    .nullable()
    .optional()
    .trim()
    .matches(/^\d*$/, { message: "半角数字で入力してください", excludeEmptyString: true }),
});

export const bookingSchema = yup.object().shape({
  adultQuantity: yup.number().required("Adult Quantity is required"),
  childQuantity: yup.number().required("Child Quantity is required"),
  date: yup.date().required("Date is required"),
});

export const ticketBookingScheduleSchema = yup.object().shape({
  maxBookingPeople: yup.number().required("Max Booking People is required").min(0, "Min value 0."),
});

export const emailSchema = yup.object().shape({
  email: yup.string().email("メールアドレスは正しく入力してください").required("メールアドレスを入力してください"),
});

export const updateWaitingOrderSchema = yup
  .array()
  .of(
    yup.object().shape({
      waitingOrder: yup.number().required("Waiting Order in object is required"),
    })
  )
  .required("Queue is required");

export const userUpdateCreditCardSchema = yup.object().shape({
  holderName: yup.string().typeError("カード名義人を入力してください").required("カード名義人を入力してください"),
  cardNumber: yup
    .string()
    .typeError("カード番号は正しく入力してください")
    .required("カード番号を入力してください")
    .matches(/^[0-9]+$/, "正しい番号を入力してください。"),
  expiredAt: yup.date().typeError("有効期限を正しく入力してください").required("有効期限を入力してください"),
  securityCode: yup
    .string()
    .typeError("半角英数字3-４桁を入力してください")
    .required("セキュリティコードを入力してください")
    .matches(/^[0-9]{3,4}$/, "半角英数字3-４桁を入力してください"),
});

export const passwordSchema = yup.object().shape({
  password: yup.string().required(),
});

export const newsSchema = yup.object().shape({
  date: yup.date().typeError("掲載日時をご記入してください").required("掲載日時をご記入してください"),
  title: yup.string().required("タイトルをご記入してください"),
  content: yup
    .string()
    .required("掲載内容をご記入してください")
    .test("empty-check", "掲載内容をご記入してください", (value) => value != "<p><br></p>"),
});

export const waitingTimeSchema = yup.object().shape({
  waitingTimeGroup1: yup
    .number()
    .min(0, MESSAGES.MIN_NUMBER_IS_ZERO)
    .max(300, "最長時間は300分間で入力してください")
    .typeError("待機時間は正しく入力してください")
    .required("待機時間を入力してください"),
  waitingTimeGroup2: yup
    .number()
    .min(0, MESSAGES.MIN_NUMBER_IS_ZERO)
    .max(300, "最長時間は300分間で入力してください")
    .typeError("待機時間は正しく入力してください")
    .required("待機時間を入力してください"),
  waitingTimeGroup3: yup
    .number()
    .min(0, MESSAGES.MIN_NUMBER_IS_ZERO)
    .max(300, "最長時間は300分間で入力してください")
    .typeError("待機時間は正しく入力してください")
    .required("待機時間を入力してください"),
  waitingTimeGroup4: yup
    .number()
    .min(0, MESSAGES.MIN_NUMBER_IS_ZERO)
    .max(300, "最長時間は300分間で入力してください")
    .typeError("待機時間は正しく入力してください")
    .required("待機時間を入力してください"),
});

export const tokenSchema = yup.object().shape({
  token: yup.string().required(),
});

export const staffConfirmationSchema = yup.object().shape({
  idOrEmail: yup.string().required("従業員IDを入力してください"),
  password: yup.string().required("パスワードを入力してください"),
});

export const editEmailSchema = yup.object().shape({
  token: yup.string().required("トークンが必要です。"),
  email: yup
    .string()
    .email("メールアドレスの形式は正しくありません。")
    .required("メールアドレスが必要です。"),
});

export const changePaymentStatusSchema = yup.object().shape({
  paymentStatus: yup
    .mixed<PaymentStatus>()
    .oneOf(Object.values(PaymentStatus))
    .required("PaymentStatus is required"),
  isSmaregiScanned: yup.boolean().required("isSmaregiScanned is required"),
});
