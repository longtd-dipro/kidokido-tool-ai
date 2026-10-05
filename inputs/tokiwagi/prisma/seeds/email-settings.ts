export const emailSettingSeeds = [
  {
    emailKey: "verify-account",
    name: "Verify Your Account",
    title: "Verify Your Account",
    content: `
      <p>Dear <strong>{{%=data.name%}}</strong>,</p>
      <p>Link to verify account: <a href="{{%=data.link%}}" rel="noopener noreferrer" target="_blank"> Click here</a></p>
    `,
  },
  {
    emailKey: "reset-password",
    name: "Reset Your Password",
    title: "Reset Your Password",
    content: `
      <p>Click here to <a href="{{%=data.link%}}" rel="noopener noreferrer" target="_blank">Reset your password</a>.</p>
    `,
  },
  {
    emailKey: "verify-successful",
    name: "Notification register Success",
    title: "Register Success",
    content: `<p>Dear <strong>{{%=data.name%}}</strong>,</p>
      <p>Your account has been created in DIPRO Platfrom.</p>
      <p>Go to <a href="{{%=data.link%}}" rel="noopener noreferrer" target="_blank">DIPRO Platform</a>.</p>
    `,
  },
  {
    emailKey: "booking-successful",
    name: "Notification booking Success",
    title: "Booking Success",
    content: `
    <p>Dear <strong>{{%=data.name%}}</strong>,</p>
    <p>Bạn đã booking thành công.</p>
    <p>Thông tin booking:</p>
    <p>{{%-data.bookingsInfo%}}</p>
    <p>Ngày sử dụng: {{%=data.bookings[0].date%}}</p>
    <p>Mã barcode của bạn là: {{%=data.bookings[0].barCode%}}</p>
    <p>No.{{%=data.shortBarCode%}}</p>
    <p>{{%-data.barcodeImgTag%}}</p>
    <p>{{%-data.waitingInfo%}}</p>

    <br />

    <p>【tenant {{%=data.bookings[0].Tenant.name%}}】</p>
    <p>営業時間：{{%=data.bookings[0].Tenant.openedAt%}}〜{{%=data.bookings[0].Tenant.closedAt%}}</p>
    <p>最終入場受付時間：{{%=data.bookings[0].Tenant.servedUtil%}}</p>
    <p>〒{{%=data.bookings[0].Tenant.postCode%}}</p>
    <p>{{%=data.bookings[0].Tenant.address%}}</p>
    <p>アクセス：{{%=data.bookings[0].Tenant.guide%}}</p>
    <p>電話番号：{{%=data.bookings[0].Tenant.phone%}}</p>
    <p>公式サイト：{{%=data.bookings[0].Tenant.siteUrl%}}</p>
    `,
  },
  {
    emailKey: "remind-using-one-day-booking",
    name: "Remind using one day booking",
    title: "Remind using one day booking",
    content: `
    <p>{{%=data.name%}}様</p>
    <p>ご予約日が明日となりました。</p>
    <p>ご利用の前に、再度ご利用店舗をご確認くださいませ。</p>
    <p>当日は、あそび場の受付カウンターにて予約完了メールに記載された</p>
    <p>バーコードのご提示をお願いいたします。</p>
    <p><br></p>
    <p>【施設名：{{%=data.booking.Tenant.name%}}】</p>
    <p>営業時間：{{%=data.booking.Tenant.openedAt%}}〜{{%=data.booking.Tenant.closedAt%}}</p>
    <p>最終入場受付時間：{{%=data.booking.Tenant.servedUtil%}}</p>
    <p>〒{{%=data.booking.Tenant.postCode%}}</p>
    <p>{{%=data.booking.Tenant.address%}}</p>
    <p>アクセス：{{%=data.booking.Tenant.guide%}}</p>
    <p>電話番号：{{%=data.booking.Tenant.phone%}}</p>
    <p>公式サイト：{{%=data.booking.Tenant.siteUrl%}}</p>
    `,
  },
  {
    emailKey: "remind-using-monthly-booking",
    name: "Remind using monthly booking",
    title: "Remind using monthly booking",
    content: `
    <p>{{%=data.name%}}様</p>
    <p>ご購入いただいたマンスリーパスが明日からご利用いただけます。</p>
    <p>ご来場お待ちしております。</p>
    <p><br></p><p><br></p>
    <p>【施設名：{{%=data.booking.Tenant.name%}}】</p>
    <p>営業時間：{{%=data.booking.Tenant.openedAt%}}〜{{%=data.booking.Tenant.closedAt%}}</p>
    <p>最終入場受付時間：{{%=data.booking.Tenant.servedUtil%}}</p>
    <p>〒{{%=data.booking.Tenant.postCode%}}</p>
    <p>{{%=data.booking.Tenant.address%}}</p>
    <p>アクセス：{{%=data.booking.Tenant.guide%}}</p>
    <p>電話番号：{{%=data.booking.Tenant.phone%}}</p>
    <p>公式サイト：{{%=data.booking.Tenant.siteUrl%}}</p>
    `,
  },
  {
    emailKey: "remind-booking-expired",
    name: "利用期間終了リマインダ",
    title: "利用期間終了リマインダ",
    content: `
    <p>{{%=data.name%}}様</p>
    <p>ご利用中の回数券の有効期限がまもなく終了いたします。</p>
    <p>未使用のチケットがある場合は、お早めにご利用いただきますようお願いいたします。</p>
    <p><br></p><p><br></p>
    <p> ■ 有効期限：{{%=data.booking.expiredAt%}}</p>
    <p> ■ 残り回数：{{%=data.booking.availableTimes%}}回</p>
    <p><br></p><p><br></p>
    <p>【施設名：{{%=data.booking.Tenant.name%}}】</p>
    <p>営業時間：{{%=data.booking.Tenant.openedAt%}}〜{{%=data.booking.Tenant.closedAt%}}</p>
    <p>最終入場受付時間：{{%=data.booking.Tenant.servedUtil%}}</p>
    <p>〒{{%=data.booking.Tenant.postCode%}}</p>
    <p>{{%=data.booking.Tenant.address%}}</p>
    <p>アクセス：{{%=data.booking.Tenant.guide%}}</p>
    <p>電話番号：{{%=data.booking.Tenant.phone%}}</p>
    <p>公式サイト：{{%=data.booking.Tenant.siteUrl%}}</p>
    `,
  },
  {
    emailKey: "calling-notification",
    name: "Calling Notification",
    title: "Calling Notification",
    content: `
    <p>Dear <strong>{{%=data.name%}}</strong>,</p>
    <p>Thank you for waiting.</p>
    <p>I'll let you know when it's my turn.</p>
    <p>Please come to the reception within 30 minutes after receiving this notice.</p>
    <p>Please note that if you do not come to the reception after 30 minutes, your reservation will be automatically cancelled.</p>

    <p>Your barcode is: {{%=data.barCode%}}</p>
    <p>No.{{%=data.shortBarCode%}}</p>
    <p>{{%-data.barcodeImgTag%}}</p>
    `,
  },
  {
    emailKey: "admin-updated-ticket-notification",
    name: "Admin updated ticket notification",
    title: "Admin updated ticket notification",
    content: `
    <p>Dear ,</p>
    <p>Thông báo: admin đã update thông tin vé.</p>
    <ul>Thông tin vé: </ul>
    <li>Ticket Id: {{%=data.ticket.id%}}</li>
    <li>Ticket Name: {{%=data.ticket.name%}}</li>`,
  },
  {
    emailKey: "booking-with-waiting-successful",
    name: "Notification booking with waiting Success",
    title: "Booking With Waiting Success",
    content: `
    <p>Dear <strong>{{%=data.name%}}</strong>,</p>
    <p>Bạn đã booking thành công.</p>
    <p>Thông tin booking:</p>
    <p>{{%-data.bookingsInfo%}}</p>
    <p>Ngày sử dụng: {{%=data.bookings[0].date%}}</p>
    <p>Mã barcode của bạn là: {{%=data.bookings[0].barCode%}}</p>
    <p>No.{{%=data.shortBarCode%}}</p>
    <p>{{%-data.barcodeImgTag%}}</p>

    
    <p>Message co waiting: {{%=data.totalMustWait%}} </p>
    <p>ご利用お待ち時間の目安: {{%=data.totalMinutesMustWait%}} </p>

    <br />
    
    <p>【tenant {{%=data.bookings[0].Tenant.name%}}】</p>
    <p>営業時間：{{%=data.bookings[0].Tenant.openedAt%}}〜{{%=data.bookings[0].Tenant.closedAt%}}</p>
    <p>最終入場受付時間：{{%=data.bookings[0].Tenant.servedUtil%}}</p>
    <p>〒{{%=data.bookings[0].Tenant.postCode%}}</p>
    <p>{{%=data.bookings[0].Tenant.address%}}</p>
    <p>アクセス：{{%=data.bookings[0].Tenant.guide%}}</p>
    <p>電話番号：{{%=data.bookings[0].Tenant.phone%}}</p>
    <p>公式サイト：{{%=data.bookings[0].Tenant.siteUrl%}}</p>
    `,
  },
  {
    emailKey: "booking-update",
    name: "Notification booking update",
    title: "Booking Updated",
    content: `
    <p>Dear <strong>{{%=data.name%}}</strong>,</p>
    <p>Bạn đã cập nhật booking thành công.</p>
    <p>Thông tin booking:</p>
    <div>
    <p>Booking ID: {{%=data.booking.id%}}</p>
    <p>Hình thức thanh toán: {{%=data.booking.Ticket.paymentType%}}</p>
    <p>Số lượng người lớn: {{%=data.booking.adultQuantity%}}</p>
    <p>Số lượng trẻ em: {{%=data.booking.childQuantity%}}</p>
    </div>
    <p>Ngày sử dụng: {{%=data.booking.date%}}</p>
    <p>Mã barcode của bạn là: {{%=data.booking.barCode%}}</p>
    <p>No.{{%=data.shortBarCode%}}</p>
    <p>{{%-data.barcodeImgTag%}}</p>
    `,
  },
  {
    emailKey: "user-updated-credit-card",
    name: "User updated your credit card",
    title: "User updated your credit card",
    content: `
    <p>Bạn đã cập nhật thông tin thẻ credit card thành công.</p>
    `,
  },
  {
    emailKey: "user-check-out",
    name: "User Check out",
    title: "User Check out",
    content: `
    <p>Email được gửi khi user check out khỏi khu vui chơi.</p>
    `,
  },
  {
    emailKey: "user-cancel-booking",
    name: "User Cancel Booking",
    title: "キャンセルを受け付けました。",
    content: `
    <p>{{%=data.name%}}様</p>
    <p>予約内容のキャンセルが完了しましたのでお知らせいたします。</p>
    <p>またのご利用をお待ちしております。</p>

    <p>【キャンセル内容】</p>
    <p>商品名：{{%=data.booking.Ticket.name%}}</p>
    <p>予約日：{{%=data.booking.createdAt%}}</p>
    <p>利用予定日：{{%=data.booking.date%}}</p>
    <p>キャンセル受付日：{{%=data.booking.cancelledAt%}}</p>
    <p>返金：{{%=data.booking.totalAmount%}}</p>
    <p>ご利用人数：大人{{%=data.booking.adultQuantity%}}人 子ども{{%=data.booking.childQuantity%}}人</p>

    <p>【tenant {{%=data.booking.Tenant.name%}}】</p>
    <p>営業時間：{{%=data.booking.Tenant.openedAt%}}〜{{%=data.booking.Tenant.closedAt%}}</p>
    <p>最終入場受付時間：{{%=data.booking.Tenant.servedUtil%}}</p>
    <p>〒{{%=data.booking.Tenant.postCode%}}</p>
    <p>{{%=data.booking.Tenant.address%}}</p>
    <p>アクセス：{{%=data.booking.Tenant.guide%}}</p>
    <p>電話番号：{{%=data.booking.Tenant.phone%}}</p>
    <p>公式サイト：{{%=data.booking.Tenant.siteUrl%}}</p>
    `,
  },
  {
    emailKey: "system-cancel-booking",
    name: "System Cancel Booking",
    title: "自動キャンセルされました",
    content: `
    <p>{{%=data.name%}}様</p>
    <p>いつもご利用ありがとうございます。</p>
    <p>お呼び出しを致しましたが、時間までに受付にいらっしゃらなかったため自動キャンセルさせていただきました。</p>

    <p>またのご利用をお待ちしております</p>
    <p>商品名：{{%=data.booking.Ticket.name%}}</p>
    <p>予約日：{{%=data.booking.createdAt%}}</p>
    <p>利用予定日：{{%=data.booking.date%}}</p>
    <p>キャンセル受付日：{{%=data.booking.cancelledAt%}}</p>
    <p>ご利用人数：大人{{%=data.booking.adultQuantity%}}人 子ども{{%=data.booking.childQuantity%}}人</p>

    <p>【tenant {{%=data.booking.Tenant.name%}}】</p>
    <p>営業時間：{{%=data.booking.Tenant.openedAt%}}〜{{%=data.booking.Tenant.closedAt%}}</p>
    <p>最終入場受付時間：{{%=data.booking.Tenant.servedUtil%}}</p>
    <p>〒{{%=data.booking.Tenant.postCode%}}</p>
    <p>{{%=data.booking.Tenant.address%}}</p>
    <p>アクセス：{{%=data.booking.Tenant.guide%}}</p>
    <p>電話番号：{{%=data.booking.Tenant.phone%}}</p>
    <p>公式サイト：{{%=data.booking.Tenant.siteUrl%}}</p>
    `,
  },
  {
    emailKey: "admin-cancel-booking",
    name: "Admin Cancel Booking",
    title: "キャンセルを実施いたしました。",
    content: `
    <p>{{%=data.name%}}様</p>
    <p>弊社側の操作により予約内容のキャンセルを実施いたしました。</p>
    <p>キャンセルについてのご不明点などございましたらスタッフまたは店舗電話にてお問い合わせくださいませ。</p>
    <p>またのご利用をお待ちしております。</p>

    <p>【キャンセル内容】</p>
    <p>商品名：{{%=data.booking.Ticket.name%}}</p>
    <p>予約日：{{%=data.booking.createdAt%}}</p>
    <p>利用予定日：{{%=data.booking.date%}}</p>
    <p>キャンセル受付日：{{%=data.booking.cancelledAt%}}</p>
    <p>返金：{{%=data.booking.totalAmount%}}</p>
    <p>ご利用人数：大人{{%=data.booking.adultQuantity%}}人 子ども{{%=data.booking.childQuantity%}}人</p>

    <p>【tenant {{%=data.booking.Tenant.name%}}】</p>
    <p>営業時間：{{%=data.booking.Tenant.openedAt%}}〜{{%=data.booking.Tenant.closedAt%}}</p>
    <p>最終入場受付時間：{{%=data.booking.Tenant.servedUtil%}}</p>
    <p>〒{{%=data.booking.Tenant.postCode%}}</p>
    <p>{{%=data.booking.Tenant.address%}}</p>
    <p>アクセス：{{%=data.booking.Tenant.guide%}}</p>
    <p>電話番号：{{%=data.booking.Tenant.phone%}}</p>
    <p>公式サイト：{{%=data.booking.Tenant.siteUrl%}}</p>
    `,
  },
  {
    emailKey: "edit-email-notification",
    name: "Edit Email Notification",
    title: "メールアドレスの仮変更を受け付けました。",
    content: `
      <p>{{%=data.name%}}様</p>
      <p>いつもあそび場をご利用いただきありがとうございます。</p>
      <p>メールアドレスの仮変更を受け付けました。</p>
      <p>登録を完了させる場合は <a href="{{%=data.link%}}" rel="noopener noreferrer" target="_blank">こちらをクリック</a> してください。</p>
      <p>（予約サイトに飛びます。）</p>
    `,
  },
  {
    emailKey: "monthly-booking-successful",
    name: "Monthly Booking Successful",
    title: "マンスリーパスの購入が完了しました。",
    content: `
    <p>{{%=data.name%}}様</p>
    <p>いつもご利用いただきありがとうございます。</p>
    <p>マンスリーパスの購入が完了いたしましたのでお知らせいたします。</p>
    
    <p>【購入内容】</p>
    <p>{{%-data.bookingsInfo%}}</p>

    <p>【店舗名{{%=data.bookings[0].Tenant.name%}}】</p>
    <p>営業時間：{{%=data.bookings[0].Tenant.openedAt%}}〜{{%=data.bookings[0].Tenant.closedAt%}}</p>
    <p>最終入場受付時間：{{%=data.bookings[0].Tenant.servedUtil%}}</p>
    <p>〒{{%=data.bookings[0].Tenant.postCode%}}</p>
    <p>{{%=data.bookings[0].Tenant.address%}}</p>
    <p>アクセス：{{%=data.bookings[0].Tenant.guide%}}</p>
    <p>電話番号：{{%=data.bookings[0].Tenant.phone%}}</p>
    <p>公式サイト：{{%=data.bookings[0].Tenant.siteUrl%}}</p>
  `,
  },
  {
    emailKey: "one-day-online-booking-successful",
    name: "Oneday Online Booking Successful",
    title: "事前予約バスのメール",
    content: `
    <p>{{%=data.name%}}様</p>
    <p>事前予約が完了いたしました。</p>
    <p>ご予約が完了致しました！</p>
    <p>ご利用日になりましたらこちらのメールを受付のスタッフにお見せください。</p>
    <p>ご予約内容を変更する場合にはマイページより変更ができます。</p>
    <p>【ご予約情報】</p>
    <p>{{%-data.bookingsInfo%}}</p>
    <p>決済金額: {{%=data.bookings[0].totalAmount%}}円</p>
    <p>ご利用予定日: {{%=data.bookings[0].date%}}</p>
    <p>バーコードID: {{%=data.bookings[0].barCode%}}</p>
    <p>No.{{%=data.shortBarCode%}}</p>
    <p>ご利用の際は、こちらのバーコードを受付にご提示ください。</p>
    <p>{{%-data.barcodeImgTag%}}</p>
    <br />
    <p>【注意事項】</p>
    <p>最終入場受付時間を過ぎてしまうとご案内ができなくなりますので、営業時間中に受付を済ませてください。</p>
    <p>場内ではお子さまの安全管理のため、お子さまが目の届く範囲にいていただきます様にお願いいたします。</p>
    <p>あそび場には、お手洗いが無い場合がございます。事前にお済ませいただくとごゆっくりご利用いただけます。</p>
    <p>安全上の観点から、ご利用中にお手洗い等、一時退場される場合には、かならず受付スタッフにお声がけをお願いいたします。</p>
    <p>おとな交代の際には、予約完了メールに記載されているバーコードを後からご利用されるおとなの方にも共有をお願いいたします。入退場時に必要となる場合がございます。</p>

    <p>【店舗名 {{%=data.bookings[0].Tenant.name%}}】</p>
    <p>営業時間：{{%=data.bookings[0].Tenant.openedAt%}}〜{{%=data.bookings[0].Tenant.closedAt%}}</p>
    <p>最終入場受付時間：{{%=data.bookings[0].Tenant.servedUtil%}}</p>
    <p>〒{{%=data.bookings[0].Tenant.postCode%}}</p>
    <p>{{%=data.bookings[0].Tenant.address%}}</p>
    <p>アクセス：{{%=data.bookings[0].Tenant.guide%}}</p>
    <p>電話番号：{{%=data.bookings[0].Tenant.phone%}}</p>
    <p>公式サイト：{{%=data.bookings[0].Tenant.siteUrl%}}</p>
  `,
  },
  {
    emailKey: "unlock-account",
    name: "Unlock Account",
    title: "Unlock Account",
    content: `
      <p>Dear <strong>{{%=data.name%}}</strong>,</p>
      <p>Link to unlock account: <a href="{{%=data.link%}}" rel="noopener noreferrer" target="_blank"> Click here</a></p>
    `,
  },
];
