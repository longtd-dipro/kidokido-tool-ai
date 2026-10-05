import { BookingStatus, TenantVersion } from "@prisma/client";

import { RevenueStatus } from "models/enums";

export const ROLE = {
  USER: "User",
  ADMIN: "Admin",
  SUPER_ADMIN: "SuperAdmin",
  STAFF: "Staff",
};

export const PAGE_SIZE = 10;
export const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100];

export const SESSION_STATUS = {
  LOADING: "loading",
  AUTHENTICATED: "authenticated",
  UNAUTHENTICATED: "unauthenticated",
};

export const SHOW_REQUIRED_LOGIN_POPUP_STORAGE_KEY = "showRequiredLoginPopup";

export const BARCODE_SCANNER_PATH = "/admin/barcode-scanner";
export const BARCODE_SCANNER_FULLSCREEN_QUERY_KEY = "fullscreen";
export const BARCODE_SCANNER_FULLSCREEN_QUERY_VALUE = "1";

export const QR_REDIRECT_QUERY_KEY = "qrRedirect";

export const CHECKOUT_BARCODE_QUERY_KEY = "checkoutBarcode";

export const CHECK_IN_OUT_TENANT_VERSION = TenantVersion.v2;
export const SCAN_RESULT_DISPLAY_SECONDS = 10;

// 5 minutes: re-scanning the same barcode within this window asks for confirmation
export const DUPLICATE_SCAN_CONFIRM_MS = 5 * 60 * 1000;

export const NO_BOOKING_NOTIFICATION_MESSAGE = "現在、予約がありません。";
export const GO_TO_SAME_DAY_BOOKING_LABEL = "当日利用の予約へ";

export const MINUTES = "minutes";
export const SHORT_DATE = "YYYY-MM-DD";
export const SHORT_DATE_SLASH = "YYYY/MM/DD";
export const JP_LONG_DATE_SLASH = "YYYY/MM/DD (ddd曜日)";
export const SHORT_DATE_DOT = "YYYY.MM.DD";
export const JP_LONG_DATE_TIME = "YYYY年MM月DD日 HH時mm分";
export const JP_SHORT_DATE = "YYYY年MM月DD日";
export const JP_SHORT_DATE_WITH_DAYS = "YYYY年MM月DD日、dddd";
export const JP_SHORT_DATE_WITHOUT_YEARS = "MM月DD日";
export const JP_SHORT_TIME = "HH時mm分";

//setting for period
export const JP_MINUTES = "m分";
export const JP_HOURS = "H時間";
export const JP_HOURS_MINUTES = "H時m分";

export const LONG_DATE = "YYYY-MM-DD HH:mm:ss";
export const LONG_DATE_WITHOUT_SECOND = "YYYY-MM-DD HH:mm";
export const SHORT_TIME = "HH:mm";
export const MEDIUM_TIME = "HH:mm a";

export const EMPTY_SHORT_TIME = "--:--";

export const LONG_TIME = "HH:mm:ss";

export const CREDIT_CARD_EXPIRE_FORMAT = "YYMM";
export const CREDIT_CARD_EXPIRE_INPUT_FORMAT = "MM/YY";
export const CREDIT_CARD_EXPIRE_PLACEHOLDER = "09/25";
export const SHORT_DATE_WITHOUT_YEARS = "MM/DD";

export const PROVINCE_OPTIONS = [
  { value: "", label: "" },
  { value: "01", label: "北海道" },
  { value: "02", label: "青森県" },
  { value: "03", label: "岩手県" },
  { value: "04", label: "宮城県" },
  { value: "05", label: "秋田県" },
  { value: "06", label: "山形県" },
  { value: "07", label: "福島県" },
  { value: "08", label: "茨城県" },
  { value: "09", label: "栃木県" },
  { value: "10", label: "群馬県" },
  { value: "11", label: "埼玉県" },
  { value: "12", label: "千葉県" },
  { value: "13", label: "東京都" },
  { value: "14", label: "神奈川県" },
  { value: "15", label: "新潟県" },
  { value: "16", label: "富山県" },
  { value: "17", label: "石川県" },
  { value: "18", label: "福井県" },
  { value: "19", label: "山梨県" },
  { value: "20", label: "長野県" },
  { value: "21", label: "岐阜県" },
  { value: "22", label: "静岡県" },
  { value: "23", label: "愛知県" },
  { value: "24", label: "三重県" },
  { value: "25", label: "滋賀県" },
  { value: "26", label: "京都府" },
  { value: "27", label: "大阪府" },
  { value: "28", label: "兵庫県" },
  { value: "29", label: "奈良県" },
  { value: "30", label: "和歌山県" },
  { value: "31", label: "鳥取県" },
  { value: "32", label: "島根県" },
  { value: "33", label: "岡山県" },
  { value: "34", label: "広島県" },
  { value: "35", label: "山口県" },
  { value: "36", label: "徳島県" },
  { value: "37", label: "香川県" },
  { value: "38", label: "愛媛県" },
  { value: "39", label: "高知県" },
  { value: "40", label: "福岡県" },
  { value: "41", label: "佐賀県" },
  { value: "42", label: "長崎県" },
  { value: "43", label: "熊本県" },
  { value: "44", label: "大分県" },
  { value: "45", label: "宮崎県" },
  { value: "46", label: "鹿児島県" },
  { value: "47", label: "沖縄県" },
];

export const NEWS_LETTER_OPTIONS = [
  { value: true, label: "希望する" },
  { value: false, label: "希望しない" },
];

export const GENDER_OPTIONS = [
  { value: true, label: "男性" },
  { value: false, label: "女性" },
  { value: "", label: "回答しない" },
];

export const TENANT_ACTIVE_OPTIONS = [
  { value: true, label: "あり" },
  { value: false, label: "なし" },
];

export const STATUS_TYPE = [
  { value: BookingStatus.Waiting, label: "順番待ち中" },
  { value: BookingStatus.Calling, label: "呼び出し中" },
  { value: BookingStatus.SystemCancelled, label: "キャンセル" },
];

export const JAPAN_LOCALE_CODE = "ja-JP";

export const VACANCY_STATUS = {
  FULL: "FULL",
  AVAILABLE: "AVAILABLE",
  NOT_AVAILABLE: "NOT_AVAILABLE",
};

export const NOT_AVAILABLE_REASON = {
  NO_BOOKING_SCHEDULE: "NO_BOOKING_SCHEDULE",
  EXPIRED: "EXPIRED",
  NOT_TIME_YET: "NOT_TIME_YET",
  CAN_NOT_BOOK_MORE: "CAN_NOT_BOOK_MORE",
};

export const NOT_AVAILABLE_MESSAGES = {
  [NOT_AVAILABLE_REASON.NO_BOOKING_SCHEDULE]:
    "利用できない日程です。他の日程を選択してください",
  [NOT_AVAILABLE_REASON.EXPIRED]: "お取り扱い時間外です",
  [NOT_AVAILABLE_REASON.NOT_TIME_YET]: "現時点は販売開始時間ではありません",
  [NOT_AVAILABLE_REASON.CAN_NOT_BOOK_MORE]:
    "ご予約が一杯になっております。他の商品を選択してください",
};

export const BOOKING_HISTORY_PAGE_SIZE = 2;

export const MAX_LENGTH_TICKET_CODE = 4;

export const SIMULATE_COMING_USER_BOOKING_BARCODE = "SIMULATE_BARCODE";

export const SHORT_BARCODE_LENGTH = 4;

export const MINIMUM_SIGNUP_USER_AGE = 18;

export const BASIC_EMAIL_REGEX = /^(.)+@(.)+$/;

export const REVENUE_STATUS_OPTIONS = [
  { value: RevenueStatus.ALREADY_RECHECKIN, label: "再入場" },
  { value: RevenueStatus.NOT_RECHECKIN, label: "初回入場" },
  { value: RevenueStatus.NOT_USED, label: "未利用者" },
];

export const MINIMUM_MONTH_CAN_DELETE_BOOKING_SCHEDULE = 13;

export const MAX_LENGTH_OF_SUB_ITEM_TO_QUERY = 5000;

export const MAXIMUM_ALLOWED_LOGIN_ATTEMPTS = 6;

export const DELETED_EMAIL_PREFIX = "deleted_";

export const DEFAULT_TRANSACTION_TIMEOUT = 1000 * 60 * 10; // 10 minutes

export const MAXIMUM_POSTGRES_BIND_VARIABLES_COUNT_FOR_QUERY = 32767;

export const TOTAL_TIMES_LIMIT_MONTHS_FROM_START = 6;

export const DEAFAULT_CHILD_QUANTITY_FIRST_TIME = 1;

export const DEFAULT_TOTAL_BOOKINGS_PROCESS_IN_BATCH = 10;

// An entry is either a plain path prefix (matches any HTTP method) or an object
// with an explicit `methods` allow-list (matches only those methods on that path).
export type LimitIpAccessingRoute = {
  path: string;
  methods?: string[];
};

export const LIMIT_IP_ACCESSING_ROUTES: (string | LimitIpAccessingRoute)[] = [
  "/signin",
  "/api/auth/callback/credentials",
  // LINE login: block both the sign-in initiation and the OAuth callback.
  "/api/auth/signin/line",
  "/api/auth/callback/line",
  "/signup",
  "/api/auth/signup",
  "/api/auth/resend-verification-email",
  "/user/my-page/personal-info/update-information",
  "/api/auth/verify",
  "/user/my-page/personal-info/change-credit-card",
  "/user/my-page/personal-info/change-password",
  "/api/auth/update-password",
  "/api/user/credit-card/save",
  "/api/user/credit-card/delete",
  {
    path: "/api/user",
    methods: ["PUT", "PATCH", "DELETE"],
  },
];
