import DashboardInActiveImage from "statics/images/dashboard-inactive.svg";
import DashboardActiveImage from "statics/images/dashboard-active.svg";
import UserActiveImage from "statics/images/user-active.svg";
import ShopActiveImage from "statics/images/shop-add-active.svg";
import ShopInactiveImage from "statics/images/shop-add-inactive.svg";
import LockActiveImage from "statics/images/lock.svg";
import LockInactiveImage from "statics/images/lock-inactive.svg";
import UserInactiveImage from "statics/images/user-inactive.svg";
import ProfileActiveImage from "statics/images/profile-user-active.svg";
import ProfileInactiveImage from "statics/images/profile-user-inactive.svg";
import HouseActiveImage from "statics/images/house-active.svg";
import HouseInactiveImage from "statics/images/house-inactive.svg";
import NoteActiveImage from "statics/images/note-active.svg";
import NoteInactiveImage from "statics/images/note-inactive.svg";
import ChartActiveImage from "statics/images/chart-active.svg";
import ChartInactiveImage from "statics/images/chart-inactive.svg";
import UserEditActiveImage from "statics/images/user/edit-active.svg";
import UserEditInActiveImage from "statics/images/user/edit-inactive.svg";
import UserEditHoverImage from "statics/images/user/edit-hover.svg";
import UserCheckActiveImage from "statics/images/user/check-active.svg";
import UserCheckInActiveImage from "statics/images/user/check-inactive.svg";
import UserHeartActiveImage from "statics/images/user/hear-active.svg";
import UserHeartInActiveImage from "statics/images/user/heart-inactive.svg";
import UserSideActiveImage from "statics/images/user/user-active.svg";
import UserSideInActiveImage from "statics/images/user/user-inactive.svg";
import TicketHistoryActiveIcon from "statics/images/user/ticket-history-active.svg";
import TicketHistoryInActiveIcon from "statics/images/user/ticket-history-inactive.svg";
import UserXImage from "statics/images/user/user-x.svg";
import SMSActiveImage from "statics/images/sms-edit-active.svg";
import SMSInActiveImage from "statics/images/sms-edit-inactive.svg";
import NewsActiveImage from "statics/images/news-active.svg";
import NewsInActiveImage from "statics/images/news-inactive.svg";
import ClockActiveImage from "statics/images/clock-active.svg";
import ClockInActiveImage from "statics/images/clock-inactive.svg";
import DisclaimerActiveImage from "statics/images/fluent-person-info-active.svg";
import DisclaimerInActiveImage from "statics/images/fluent-person-info-inactive.svg";
import GMOInActiveImage from "statics/images/gmo-inactive.svg";
import GMOActiveImage from "statics/images/gmo-active.svg";
import StaffInActiveImage from "statics/images/staff-inactive.svg";
import StaffActiveImage from "statics/images/staff-active.svg";
import ScanBarcodeImage from "statics/images/scan-barcode.svg";
import ScanManagementImage from "statics/images/scan-management.svg";
import { Menu } from "models/Menu";
import { ROUTE } from "constants/route";

export const UPLOAD_DIR = "./public/uploads";
export const UPLOAD_PATH = "/uploads";

export const EMAIL_SETTING_KEY = {
  VERIFY_ACCOUNT: "verify-account",
  VERIFY_SUCCESSFUL: "verify-successful",
  RESET_PASSWORD: "reset-password",
  BOOKING_SUCCESSFUL: "booking-successful",
  BOOKING_UPDATE: "booking-update",
  REMIND_USING_ONE_DAY_BOOKING: "remind-using-one-day-booking",
  REMIND_USING_MONTHLY_BOOKING: "remind-using-monthly-booking",
  REMIND_BOOKING_EXPIRED: "remind-booking-expired",
  ADMIN_UPDATED_TICKET_NOTIFICATION: "admin-updated-ticket-notification",
  CALLING_NOTIFICATION: "calling-notification",
  BOOKING_WITH_WAITING_SUCCESSFUL: "booking-with-waiting-successful",
  USER_UPDATED_CREDIT_CARD: "user-updated-credit-card",
  USER_CHECK_OUT: "user-check-out",
  USER_CANCEL_BOOKING: "user-cancel-booking",
  SYSTEM_CANCEL_BOOKING: "system-cancel-booking",
  ADMIN_CANCEL_BOOKING: "admin-cancel-booking",
  EDIT_EMAIL_NOTIFICATION: "edit-email-notification",
  MONTHLY_BOOKING_SUCCESSFUL: "monthly-booking-successful",
  ONE_DAY_ONLINE_BOOKING_SUCCESSFUL: "one-day-online-booking-successful",
  UNLOCK_ACCOUNT: "unlock-account",
};

export const APP_SETTING_KEY = {
  WAITING_TIME_IN_MINUTES: "waiting-time-in-minutes",
  FREE_PERIOD_IN_MINUTES: "free-period-in-minutes",
  VIDEO_URL: "guide-video-url",
  MONTHLY_REMIND_BEFORE_IN_DAY: "monthly-remind-before-in-day",
  MONTHLY_REMIND_AT: "monthly-remind-at",
  CALLING_TIME_LIMIT_IN_MINUTES: "calling-time-limit-in-minutes",
  MAINTENANCE_MODE: "maintenance-mode",
};

export const BARCODE_IMG_CID = "barcode";

export const ALLOW_RESEND_EMAIL_INTERVAL_IN_SECONDS = 60; // seconds

export const MENU_LIST_USER: Menu[] = [
  {
    id: 1,
    title: "予約履歴・変更・キャンセル",
    heading: "予約履歴",
    path: ROUTE.USER_HISTORY_BOOKINGS,
    icons: {
      active: UserEditActiveImage,
      inactive: UserEditInActiveImage,
      hover: UserEditHoverImage,
    },
  },
  {
    id: 2,
    title: "フリーパスの確認",
    path: ROUTE.USER_MONTHLY_TICKET,
    icons: {
      active: UserCheckActiveImage,
      inactive: UserCheckInActiveImage,
    },
  },
  {
    id: 3,
    title: "回数券の確認",
    path: ROUTE.USER_TIMES_LIMIT_TICKET,
    icons: {
      active: TicketHistoryActiveIcon,
      inactive: TicketHistoryInActiveIcon,
    },
  },
  {
    id: 4,
    title: "お気に入り店舗一覧",
    path: ROUTE.USER_FAVORITE_TENANTS,
    icons: {
      active: UserHeartActiveImage,
      inactive: UserHeartInActiveImage,
    },
  },
  {
    id: 5,
    title: "アカウント情報の確認・編集",
    path: ROUTE.USER_PERSONAL_INFO,
    icons: {
      active: UserSideActiveImage,
      inactive: UserSideInActiveImage,
    },
  },
  {
    id: 6,
    title: "アカウント削除",
    path: ROUTE.USER_DELETE_ACCOUNT,
    icons: {
      active: UserXImage,
      inactive: UserXImage,
    },
  },
];

export const MENU_LIST_ADMIN: Menu[] = [
  {
    id: 1,
    title: "予約管理",
    icons: {
      active: ShopInactiveImage,
      inactive: ShopInactiveImage,
    },
    hasSubMenu: true,
    subMenuItems: [
      {
        title: "予約一覧",
        path: ROUTE.BOOKING_MANAGEMENT_LIST,
      },
      {
        title: "空き状況",
        path: ROUTE.BOOKING_MANAGEMENT_VACANCIES,
      },
    ],
  },
  {
    id: 7,
    title: "バーコード読み取り",
    path: ROUTE.ADMIN_BARCODE_SCANNER,
    icons: {
      active: ScanBarcodeImage,
      inactive: ScanBarcodeImage,
    },
  },
  {
    id: 8,
    title: "入場状況管理",
    path: ROUTE.ADMIN_SCAN_MANAGEMENT,
    icons: {
      active: ScanManagementImage,
      inactive: ScanManagementImage,
    },
  },
  {
    id: 2,
    title: "順番待ち・受付管理 ",
    icons: {
      active: ProfileActiveImage,
      inactive: ProfileInactiveImage,
    },
    hasSubMenu: true,
    subMenuItems: [
      { title: "順番待ち管理", path: ROUTE.BOOKING_QUEUE },
      { title: "在庫管理", path: ROUTE.BOOKING_VACANCIES },
    ],
    isOpen: false,
  },
  {
    id: 3,
    title: "ユーザー管理",
    path: ROUTE.USER_MANAGEMENT,
    icons: {
      active: UserActiveImage,
      inactive: UserInactiveImage,
    },
  },
  {
    id: 4,
    title: "売上管理",
    path: ROUTE.REVENUES_MANAGEMENT,
    icons: {
      active: ChartActiveImage,
      inactive: ChartInactiveImage,
    },
  },
  {
    id: 5,
    title: "商品管理",
    path: ROUTE.TICKET_MANAGEMENT,
    icons: {
      active: NoteActiveImage,
      inactive: NoteInactiveImage,
    },
  },
  {
    id: 6,
    title: "従業員管理",
    path: "/admin/staff-management",
    icons: {
      active: StaffActiveImage,
      inactive: StaffInActiveImage,
    },
  },
];

export const MENU_LIST_SUPER_ADMIN: Menu[] = [
  {
    id: 1,
    title: "ダッシュボード",
    path: ROUTE.DASHBOARD,
    icons: {
      active: DashboardActiveImage,
      inactive: DashboardInActiveImage,
    },
  },
  {
    id: 2,
    title: "施設管理",
    path: ROUTE.TENANT_MANAGEMENT,
    icons: {
      active: HouseActiveImage,
      inactive: HouseInactiveImage,
    },
  },
  {
    id: 3,
    title: "予約管理",
    path: ROUTE.BOOKING_MANAGEMENT_LIST,
    checkActive: (routePath) => routePath.includes(ROUTE.BOOKING_MANAGEMENT),
    icons: {
      active: ShopActiveImage,
      inactive: ShopInactiveImage,
    },
  },
  {
    id: 4,
    title: "売上管理",
    path: ROUTE.REVENUES_MANAGEMENT,
    icons: {
      active: ChartActiveImage,
      inactive: ChartInactiveImage,
    },
  },
  {
    id: 5,
    title: "自動返信メール設定",
    path: "/admin/email-settings",
    icons: {
      active: SMSActiveImage,
      inactive: SMSInActiveImage,
    },
  },
  {
    id: 6,
    title: "商品管理",
    path: ROUTE.TICKET_MANAGEMENT,
    icons: {
      active: NoteActiveImage,
      inactive: NoteInactiveImage,
    },
  },
  {
    id: 7,
    title: "ユーザー管理",
    path: ROUTE.USER_MANAGEMENT,
    icons: {
      active: UserActiveImage,
      inactive: UserInactiveImage,
    },
  },
  {
    id: 8,
    title: "お知らせ管理",
    path: ROUTE.NEWS_MANAGEMENT,
    icons: {
      active: NewsActiveImage,
      inactive: NewsInActiveImage,
    },
  },
  {
    id: 9,
    title: "待機時間設定",
    path: ROUTE.WAITING_TIME_MANAGEMENT,
    icons: {
      active: ClockActiveImage,
      inactive: ClockInActiveImage,
    },
  },
  {
    id: 10,
    title: "従業員管理",
    path: "/admin/staff-management",
    icons: {
      active: StaffActiveImage,
      inactive: StaffInActiveImage,
    },
  },
  {
    id: 11,
    title: "免責事項設定",
    path: ROUTE.DISCLAIMER_MANAGEMENT,
    icons: {
      active: DisclaimerActiveImage,
      inactive: DisclaimerInActiveImage,
    },
  },
  {
    id: 12,
    title: "ログイン情報変更",
    path: "",
    icons: {
      active: LockActiveImage,
      inactive: LockInactiveImage,
    },
    hasSubMenu: true,
    subMenuItems: [
      { title: "パスワード変更", path: "/admin/change-password" },
      { title: "メール変更", path: "/admin/change-email" },
    ],
  },
  {
    id: 13,
    title: "GMOアカウント管理",
    path: "/admin/gmo-settings",
    icons: {
      active: GMOActiveImage,
      inactive: GMOInActiveImage,
    },
  },
];
