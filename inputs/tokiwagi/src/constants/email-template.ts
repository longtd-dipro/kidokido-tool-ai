import { BARCODE_IMG_CID } from "constants/settings";
import { getShortBarCode } from "utils/booking";

export const BOOKINGS_INFO_TEMPLATE = `
  {{%data.bookings.forEach((booking, i) => {%}}
  <div>
    <p>予約 ID: {{%=booking.id%}}</p>
    <p>商品名: {{%=booking.Ticket.name%}}</p>
    <p>お支払い方法: {{%=booking.Ticket.paymentType%}}</p>
    <p>おとな人数: {{%=booking.adultQuantity%}}</p>
    <p>子ども人数: {{%=booking.childQuantity%}}</p>
    <p>子どもの年齢:</p>
    {{%booking.childAges.forEach((childAge, i) => {%}}
  
    <p>{{%=i+1%}}人目: {{%=childAge%}}</p>
  
    {{%})%}}
  </div>
  {{%})%}}
`;

export const WAITING_INFO_TEMPLATE = `
  <p>すぐに入場案内が出来ます。受付までお越しください。なお、30分以内に受付にいらっしゃらない場合は自動キャンセルになります。<p>
`;

export const MONTHLY_BOOKING_INFO_TEMPLATE = `
<div>
    <p>購入店舗: {{%=data.booking.Tenant.name%}}</p>
    <p>商品名: {{%=data.booking.Ticket.name%}}</p>
    <p>購入日: {{%=data.booking.createdAt%}}</p>
    <p>利用スタート日: {{%=data.booking.date%}}</p> 
    <p>利用終了予定日: {{%=data.booking.deadlineDate%}}</p> 
    <p>日数: {{%=data.booking.Ticket.TicketDetail.totalDaysInUseFromStart%}}日間</p> 
    <p>購入金額: {{%=data.booking.totalAmount%}}円（税込み）</p>
    <p>支払い方法: {{%=data.booking.Ticket.paymentType%}}</p>
    <p>おとなの人数: {{%=data.booking.adultQuantity%}}</p>
    <p>子どもの人数・年齢: </p>
    {{%data.booking.childAges.forEach((childAge, i) => {%}}
  
    <p>{{%=i+1%}}人: {{%=childAge%}}</p>
  
    {{%})%}}
  </div>
`;

const FAKE_TENANT_NAME = "tenant name";
const FAKE_TICKET_NAME = "ticket name";
const FAKE_BARCODE_BASE64 =
  // eslint-disable-next-line max-len
  "data:image/gif;base64,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";

export const FAKE_BARCODE = "88888888";

const FAKE_BOOKING_FOR_EMAIL_DATA = {
  id: 1,
  Ticket: {
    paymentType: "事前決済あり",
    name: FAKE_TICKET_NAME,
  },
  barCode: FAKE_BARCODE,
  createdAt: "2023-01-01",
  date: "2023-01-01",
  cancelledAt: "2023-01-01",
  totalAmount: 1000,
  adultQuantity: 1,
  childQuantity: 1,
  Tenant: {
    name: FAKE_TENANT_NAME,
    openedAt: "2023-01-01 12:00",
    closedAt: "2023-01-01 12:00",
    servedUtil: "2023-01-01 12:00",
    postCode: 123456,
    address: "Tenant address",
    guide: "Instructions",
    phone: "0123456789",
    siteUrl: "https://asobi-yoyaku.bornelund.co.jp/",
  },
};

export const FAKE_EMAIL_DATA = {
  name: "name",
  link: "https://asobi-yoyaku.bornelund.co.jp/",
  date: "2023-01-01",
  booking: FAKE_BOOKING_FOR_EMAIL_DATA,
  barCode: FAKE_BARCODE,
  shortBarCode: getShortBarCode(FAKE_BARCODE),

  bookings: [FAKE_BOOKING_FOR_EMAIL_DATA],

  bookingsInfo: [
    `<div>
  <p>予約 ID: 1</p>
  <p>商品名: ticket name</p>
  <p>お支払い方法: 事前決済あり</p>
  <p>おとな人数: 1</p>
  <p>子ども人数: 1</p>
  <p>子どもの年齢:</p>

  <p>1人目: 10ヶ月</p>
</div>`,
  ],

  totalMustWait: 1,
  totalMinutesMustWait: 20,
  waitingInfo: "すぐに入場案内が出来ます。受付までお越しください。なお、30分以内に受付にいらっしゃらない場合は自動キャンセルになります。",
  ticket: { id: 1, name: FAKE_TICKET_NAME },
};

export const FAKE_MONTHLY_BOOKING_EMAIL_DATA = {
  name: "name",

  bookings: [FAKE_BOOKING_FOR_EMAIL_DATA],

  bookingsInfo: [
    `<div>
    <p>購入店舗: ${FAKE_TENANT_NAME}</p>
    <p>商品名: ${FAKE_TICKET_NAME}</p>
    <p>購入日: 2023-01-01</p>
    <p>利用スタート日: 2023-01-01</p> 
    <p>利用終了予定日: 2023-01-22</p> 
    <p>日数: 22日間</p> 
    <p>購入金額: 5700円（税込み）</p>
    <p>支払い方法: 事前決済あり</p>
    <p>おとなの人数: 1</p>
    <p>子どもの人数・年齢: </p>

    <p>1人目: 10ヶ月</p>
  </div>`,
  ],
};

export const FAKE_BARCODE_IMAGE_EMAIL_DATA = {
  barcodeImgSrc: FAKE_BARCODE_BASE64,
  barcodeImgTag: `<img src="cid:${BARCODE_IMG_CID}" alt="bar code" />`,
  cid: BARCODE_IMG_CID,
  attachments: [
    {
      content: FAKE_BARCODE_BASE64.split("base64,")[1],
      encoding: "base64",
      cid: BARCODE_IMG_CID,
      filename: "barcode",
    },
  ],
};
