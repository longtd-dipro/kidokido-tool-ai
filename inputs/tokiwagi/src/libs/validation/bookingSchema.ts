import moment from "moment";
import * as yup from "yup";

export const paymentOfflineBookingSchema = yup.object().shape({
  tenantCode: yup.string().required(),
  subEmail: yup.string().email("メールアドレスは正しく入力してください"),
  hasMonthlyBooking: yup.boolean().default(false),

  bookings: yup.array().of(
    yup.object().shape({
      isSkipValidateEmpty: yup.boolean().default(true),
      ticketId: yup
        .mixed()
        .transform((value) => value?.id)
        .test("empty-check", "商品を選択してください", (value, context) => {
          const isSkipValidateEmpty = context.parent.isSkipValidateEmpty;
          return isSkipValidateEmpty ? true : !!value;
        }),
      adultQuantity: yup.number(),
      childQuantity: yup.number(),
      childAges: yup.array().of(
        yup
          .object()
          .nullable()
          .test("empty-check", "子どもの年齢を選択してください", (value) => {
            return !!value?.age;
          })
      ),
    })
  ),

  monthlyBookings: yup.array().of(
    yup.object().shape({
      isSkipValidateEmpty: yup.boolean().default(false),
      ticketId: yup
        .mixed()
        .transform((value) => value?.id)
        .test("empty-check", "商品を選択してください", (value, context) => {
          const isSkipValidateEmpty = context.parent.isSkipValidateEmpty;
          return isSkipValidateEmpty ? true : !!value;
        }),
      adultQuantity: yup.number(),
      childQuantity: yup.number(),
      childAges: yup.array().of(
        yup
          .object()
          .nullable()
          .test("empty-check", "子どもの年齢を選択してください", (value) => {
            return !!value?.age;
          })
      ),
    })
  ),
  timesLimitBookings: yup.array().of(
    yup.object().shape({
      isSkipValidateEmpty: yup.boolean().default(false),
      ticketId: yup
        .mixed()
        .transform((value) => value?.id)
        .test("empty-check", "商品を選択してください", (value, context) => {
          const isSkipValidateEmpty = context.parent.isSkipValidateEmpty;
          return isSkipValidateEmpty ? true : !!value;
        }),
      adultQuantity: yup.number(),
      childQuantity: yup.number(),
      childAges: yup.array().of(
        yup
          .object()
          .nullable()
          .test("empty-check", "子どもの年齢を選択してください", (value) => {
            return !!value.age;
          })
      ),
    })
  ),
});

export const paymentOnlineBookingSchema = yup.object().shape({
  tenantCode: yup.string().required(),
  ticketId: yup.number().typeError("商品と日付を選択してください").required("商品と日付を選択してください"),

  adultQuantity: yup.number().required(),
  childQuantity: yup.number().required(),

  childAges: yup.array().of(yup.mixed().test("empty-check", "子どもの年齢を選択してください", (value) => !!value.age)),

  bookingDate: yup
    .mixed()
    .test("empty-check", "商品と日付を選択してください", (value) => !!value)
    .test("date-check", "日付形式を正しく入力してください", (value) => moment(value).isValid()),
  subEmail: yup.string().email("メールアドレスは正しく入力してください"),
});

export const updatePaymentOnlineBookingSchema = yup.object().shape({
  adultQuantity: paymentOnlineBookingSchema.fields.adultQuantity,
  childQuantity: paymentOnlineBookingSchema.fields.childQuantity,
  childAges: yup.array().of(
    yup
      .object()
      .nullable()
      .test("empty-check", "子どもの年齢を選択してください", (value) => {
        return !!value?.age;
      })
  ),
  bookingDate: paymentOnlineBookingSchema.fields.bookingDate,
});

export const monthlyBookingSchema = yup.object(paymentOnlineBookingSchema.fields).shape({
  childAges: yup.array().of(
    yup
      .object()
      .nullable()
      .test("empty-check", "子どもの年齢を選択してください", (value) => {
        return !!value?.age;
      })
  ),
});

export const timesLimitBookingSchema = yup.object(paymentOnlineBookingSchema.fields).shape({
  childAges: yup.array().notRequired().of(
    yup
      .object()
      .nullable()
      .test("empty-check", "子どもの年齢を選択してください", (value) => {
        return value ? Boolean(value?.age) : true;
      })
  ),
});

export const bookingPayloadSchema = yup.object().shape({
  tenantCode: yup.string().required(),
  ticketId: yup.number().required(),

  adultQuantity: yup.number().required(),
  childQuantity: yup.number().required(),
  adultPrice: yup.number().required(),
  childPrice: yup.number().required(),

  childAges: yup.array().of(yup.number()),
  date: yup.string().required(),
});

export const useInDayBookingPayloadSchema = yup.object().shape({
  tenantCode: yup.string().required(),
  subEmail: yup.string().email(),

  bookings: yup.array().of(
    yup.object().shape({
      ticketId: yup.number(),
      adultQuantity: yup.number(),
      childQuantity: yup.number(),
      childAges: yup.array().of(yup.number()),
    })
  ),
});

export const bookingTicketsPayloadSchema = yup.object().shape({
  types: yup.array().of(yup.string()),
  includeCancelledStatus: yup.boolean().optional(),
});

export const creditCardSchema = yup.object().shape({
  cardNumber: yup
    .mixed()
    .required()
    .when("hasCreditCard", {
      is: false,
      then: yup
        .string()
        .typeError("カード番号は正しく入力してください")
        .required("カード番号を入力してください")
        .matches(/^[0-9]+$/, "正しい番号を入力してください。"),
    }),
  holderName: yup.string().required("カード名義人を入力してください"),
  expiredAt: yup
    .mixed()
    .test("empty-check", "利用スタート希望日を選択してください", (value) => !!value)
    .test("date-check", "有効期限を正しく入力してください", (value) => moment(value).isValid()),
  securityCode: yup.mixed().when("hasCreditCard", {
    is: false,
    then: yup
      .string()
      .typeError("半角英数字3-４桁を入力してください")
      .required("セキュリティコードを入力してください")
      .matches(/^[0-9]{3,4}$/, "半角英数字3-４桁を入力してください"),
  }),

  hasCreditCard: yup.boolean(),
});
