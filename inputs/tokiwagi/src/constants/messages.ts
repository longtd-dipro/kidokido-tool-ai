export const MESSAGES = {
  ACCOUNT_VERIFIED: "アカウントの認証が完了しました",

  FULLY_PAYMENT_ONLINE_BOOKING: "完売しましたので、他の日程を選択してください",
  NOT_AVAILABLE_BOOKING_SCHEDULE:
    "利用できない日程です。他の日程を選択してください。",

  CREATE_USER_SUCCESSFUL: "新規ユーザー登録が完了しました",
  DELETE_USER_SUCCESSFUL: "このユーザーはリストから削除されました",

  CREATE_TENANT_SUCCESSFUL: "新施設登録が完了しました",
  EDIT_TENANT_SUCCESSFUL: "施設情報の編集が完了しました",
  DELETE_TENANT_SUCCESSFUL: "施設はリストから削除されました",
  UNLOCK_TENANT_ACCOUNT_SUCCESSFUL: "施設のロック解除ができました。",

  UPDATE_VACANCIES_SUCCESSFUL: "枠数変更が完了しました",

  SEND_NOTIFICATION_SUCCESSFUL: "ユーザーに通知を送りました",
  CHANGE_STATUS_SUCCESSFUL: "ステータスの変更が完了しました",

  SETTING_EMAIL_SUCCESSFUL: "編集が完了しました",

  CHANGE_PASSWORD_SUCCESSFUL: "パスワードの変更が完了しました",
  CHANGE_EMAIL_SUCCESSFUL: "アドレスの変更が完了しました",

  CHANGE_WAITING_TIME_SUCCESSFUL: "待機時間の変更が完了しました",

  MUST_HAVE_BOOKING_SCHEDULE:
    "在庫・予約枠の日時、場所、定員を設定してください",

  MIN_NUMBER_IS_ZERO: "0以上の半角英数字を入力してください",
  MIN_NUMBER_IS_ONE: "1以上の半角英数字を入力してください",
  MAX_NUMBER_IS_60: "60以下の半角英数字を入力してください",

  TICKET_NAME_IS_REQUIRED: "商品名を入力してください",
  TICKET_TENANT_IS_REQUIRED: "施設設定を入力してください",
  TICKET_LIMIT_TIMES_IS_REQUIRED: "支払い回数を入力してください",
  TICKET_VISIBILITY_IS_REQUIRED: "公開ステータスを設定してください",
  TICKET_CHILD_AGE_IS_REQUIRED: "対象年齢を設定してください",
  TICKET_MAX_CHILD_PER_ADULT_IS_REQUIRED: "1組の予約構成を入力してください",
  TICKET_ADULT_CODE_IS_REQUIRED: "おとなの商品コードを入力してください",
  TICKET_CHILD_CODE_IS_REQUIRED: "子どもの商品コードを入力してください",
  TICKET_CODE_FORMAT: "半角英数字４桁を入力してください",
  TICKET_PAYMENT_TYPE_IS_REQUIRED: "精算タイプを設定してください",
  TICKET_CAN_BOOK_IN_ADVANCE_IS_REQUIRED: "事前予約可能を設定してください",
  TICKET_TYPE_IS_REQUIRED: "商品のタイプを設定してください",
  TICKET_TOTAL_DAYS_IN_USE_IS_REQUIRED:
    "指定期間利用タイプは、利用可能日数を設定してください",
  TIMES_LIMIT_TICKET_TOTAL_DAYS_IN_USE_IS_REQUIRED:
    "回数券タイプは、利用可能日数を設定してください",
  TICKET_PRICE_IS_REQUIRED: "金額を設定してください",
  TICKET_AGREEMENT_IS_REQUIRED: "免責事項の表示・非表示を設定してください",
  TICKET_DISCOUNT_VALUES_IS_REQUIRED: "金額を設定をしてください",

  TICKET_ADULT_PERIOD_IS_REQUIRED: "おとなのベース時間を入力してください",
  TICKET_CHILD_PERIOD_IS_REQUIRED: "子どものベース時間を入力してください",
  TICKET_ADULT_PERIOD_PRICE_IS_REQUIRED: "おとなのベース金額を入力してください",
  TICKET_CHILD_PERIOD_PRICE_IS_REQUIRED: "子どものベース金額を入力してください",

  TICKET_WHETHER_OR_NOT_SETTING_MAX_BOOKING_PEOPLE_IS_REQUIRED:
    "定員数の有無を設定してください",
  TICKET_MAX_BOOKING_PEOPLE_IS_REQUIRED: "定員数を入力してください",
  TICKET_MAX_BOOKING_TIMES_IS_REQUIRED: "予約できる回数を設定してください",
  TICKET_START_SALE_AT_IS_REQUIRED: "公開日を設定してください",
  TICKET_DATE_FROM_TO_IS_REQUIRED: "開催日程を設定してください",
  TICKET_DATE_FROM_AFTER_START_SALE:
    "開始日は公開日より後の日程を選択してください",
  TICKET_DATE_TO_AFTER_DATE_FROM:
    "終了日は開始日より後の日程を選択してください",
  TICKET_TIME_FROM_TO_IS_REQUIRED: "開催時間を設定してください",
  TICKET_TIME_TO_AFTER_TIME_FROM:
    "終了時間は開始時間より後の時間を選択してください",
  TICKET_CAN_BOOKING_UTIL_IS_REQUIRED: "〆切日時を設定してください",
  TICKET_CAN_CANCEL_OR_CHANGE_UTIL_IS_REQUIRED:
    "キャンセル・変更可能期限を設定してください",
  TICKET_REMIND_BEFORE_IS_REQUIRED: "開催日を入力してください",
  TICKET_REMIND_AT_IS_REQUIRED: "日前のを入力してください",

  CREATE_TICKET_SUCCESS: "新規商品登録が完了しました",
  CREATE_TICKET_FAILED: "商品の確定ができません",
  CREATE_TICKET_BOOKING_SCHEDULE_SUCCESS: "予約枠の作成が完了しました",
  RANGE_DATE_TICKET_BOOKING_SCHEDULE_INVALID:
    "予約枠はすでに設定されているため、別の枠を設定してください",
  CANNOT_REMOVE_TICKET_BOOKING_SCHEDULE:
    "この予約枠が過去1年1ヶ月間を超えていない、または予約されている利用者がいるため、削除することができません。",
  CANNOT_REMOVE_TICKET:
    "予約がされているため、こちらの商品を削除することができません。",

  INVALID_DATE: "日付形式を正しく入力してください",

  TICKET_REACHED_MAX_BOOKING_PEOPLE_AND_NOT_AVAILABLE:
    "現在販売できる商品はございません",
  MONTHLY_BOOKING_NOT_FILL_CHILD_AGES:
    "ご入力いただいた項目に不備があります。子どもの年齢を選択した上で次に進んでください。",
  WARNING_CANCEL_ALL_BOOKINGS:
    "子ども3名に対し、最低おとな1名の入場をお願いしています。こちらをキャンセルすると定員に満たないため、同日予約している他の内容もすべてキャンセルされます。よろしいでしょうか？",
  WARNING_CANCEL_ONE_BOOKING: "予約をキャンセルします。\nよろしいでしょうか？",

  WARNING_ADMIN_CANCEL_ALL_BOOKINGS:
    "キャンセルすると大人の人数が不足するため、同時に入場する予定の予約も一緒にキャンセルされます。",
  WARNING_ADMIN_CANCEL_PARTIAL_MONTHLY_BOOKINGS:
    "こちらをキャンセルすると大人の人数が不足する商品があれば、一緒にキャンセルされます。",
  BOOKING_TICKET_NOT_AVAILABLE: "本日の営業は終了いたしました",

  CREATE_DISCLAIMERS_SUCCESS: "免責事項の作成が完了しました",

  EXPIRED_MONTHLY_BOOKING:
    "前回にご予約した商品の期限が切れており、他の商品を選択してください",
  TICKET_FULL_AND_NOT_BOOK_MORE:
    "現在ticketNameは販売終了になりました。他の商品をご利用ください。",
  TICKET_BOOKING_SCHEDULE_NOT_AVAILABLE: "現在ticketNameは販売時間外です。",
  TICKET_NOT_IN_BOOKING_TIME: "現在ticketNameは販売時間外となりました。",

  INVALID_PARTIAL_CHECKOUT:
    "入場中の利用者は0人にできません。\n全員退場される際は通常の退場手続きを\n行ってください。",
  INVALID_PROCESS_PARTIAL_CHECKOUT: "すでに人数が変更されました。",

  SEND_PREVIEW_EMAIL_SUCCESS: "メールが指定のメールアドレスに送信されました",

  CREATE_GMO_SETTING_SUCCESSFUL: "GMOアカウントの追加が完了しました。",
  EDIT_GMO_SETTING_SUCCESSFUL: "GMOアカウントの編集が完了しました。",

  CREATE_STAFF_SUCCESSFUL: "新規従業員登録が完了しました。",
  UPDATE_STAFF_SUCCESSFUL: "従業員情報の編集が完了しました。",
  DELETE_STAFF_SUCCESSFUL: "従業員の削除が完了しました。",

  CHECKOUT_SUCCESS: "退場処理が完了しました。",
  CHECKIN_SUCCESS: "入場処理が完了しました。",
  DUPLICATE_SCAN_CONFIRM:
    "同じバーコードが連続で読み込まれました。\nこのまま処理を実行してよろしいですか？",
  CHECKIN_SUCCESS_TITLE: "チェックインに成功しました",
  CHECKIN_HAS_REMAINING:
    "まだチェックインされていない予約があります。\n続けてチェックインしますか？",
  CHECKOUT_SUCCESS_TITLE: "チェックアウトに成功しました",
  CHECKOUT_NEED_PAYMENT:
    "お支払い情報はスマレジに表示されています。\nスマレジ端末にて引き続きお支払い手続きを行ってください。\nバーコードを表示してお支払いされる場合は、下の「決済バーコード表示」ボタンを押してください。",
  CHECKOUT_HAS_REMAINING:
    "まだチェックアウトされていない予約があります。\n続けてチェックアウトしますか？",
  BOOKING_TRANSACTION_PAID: "決済が完了しました。",
};

// Query param keys used by the /403 page.
export enum ForbiddenParam {
  REASON = "reason",
  LOGOUT = "logout",
}

// Values for the `reason` param (also drives which message is shown).
export enum ForbiddenReason {
  IP = "ip",
  DEFAULT = "default",
}

// Value for the `logout` param — its presence forces a logout.
export enum ForbiddenLogout {
  ENABLED = "1",
}

// Response header the middleware sets to flag an IP-block 403 for the client.
export const FORBIDDEN_REASON_HEADER = "x-forbidden-reason";

// Reason-specific messages. Defaults to the generic forbidden text so existing
// callers (e.g. withEnabledSmaregi) keep their original behaviour.
export const FORBIDDEN_MESSAGES: Record<string, string> = {
  [ForbiddenReason.IP]:
    "現在ご利用のIPアドレスからのアクセスは許可されていません。",
  [ForbiddenReason.DEFAULT]: "このページへのアクセス権限がありません。",
};
