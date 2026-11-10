Kiểm tra và xác nhận phương án đối ứng khi GMO-PG thay đổi phương thức kết nối đến hệ thống thanh toán.


Nội dung nhờ confirm từ phía khách hàng
Kính chào Quý công ty,
Phía khách hàng đã nhận được thông báo từ GMO Payment Gateway (GMO-PG) về việc chuyển đổi điểm kết nối của Trung tâm thanh toán sang môi trường Cloud. Theo đó, một số thông tin và cấu hình kết nối như địa chỉ IP đích, bộ mã hóa TLS (TLS Cipher Suites) sẽ được thay đổi.
Chúng tôi sẽ đính kèm nguyên văn email thông báo từ GMO vào thread này.
Theo thông báo lần này, lịch chuyển đổi đối với màn hình quản lý Shop/Site đã được đẩy lên sớm hơn so với kế hoạch ban đầu, cụ thể:
Môi trường Test: Ngày 18/11.
Môi trường Production: Ngày 07/12.
Ngoài ra, GMO cũng thông báo rằng việc hỗ trợ SNI (Server Name Indication) là bắt buộc đối với giao tiếp API.
Xin lưu ý rằng thời điểm chuyển đổi đối với API và các phương thức kết nối khác được quy định riêng, không trùng với lịch chuyển đổi của màn hình quản lý.
Do thời gian còn lại trước khi chuyển đổi khá ngắn, chúng tôi mong Quý công ty kiểm tra và xác nhận các nội dung dưới đây nhằm đánh giá ảnh hưởng đến hệ thống hiện tại và xác định phương án đối ứng sớm.
Các nội dung cần xác nhận
1. Ảnh hưởng đến hệ thống hiện tại
Việc thay đổi lần này có ảnh hưởng đến quá trình giao tiếp thanh toán hay không?
Có ảnh hưởng đến việc sử dụng màn hình quản lý Shop/Site hay không?
2. Các thay đổi kỹ thuật cần thiết
Đối với địa chỉ IP kết nối, TLS Cipher Suites, SNI..., có cần thay đổi cấu hình hoặc chỉnh sửa hệ thống hay không?
Có cần thực hiện kiểm tra hoạt động sau khi thay đổi hay không?
3. Phương án và kế hoạch đối ứng
Nếu cần đối ứng, nội dung công việc cụ thể là gì?
Phạm vi trách nhiệm của từng bên như thế nào?
Thời gian dự kiến thực hiện các công việc đối ứng là khi nào?
4. Các nội dung cần phía khách hàng thực hiện
Có hạng mục nào phía khách hàng cần xác nhận hoặc trực tiếp thực hiện hay không?
Ngoài ra, vui lòng kiểm tra cả lịch chuyển đổi tương ứng với từng phương thức kết nối.
Rất mong nhận được sự hỗ trợ và xác nhận từ Quý công ty.
Trân trọng cảm ơn.

Nội dung mail khách hàng nhận từ phía GMO
Mail 1 
Tôi xin đính kèm email thứ nhất.
Lưu ý: Lịch trình được đề cập trong email thứ nhất đã được đính chính trong email thứ hai gửi sau đó, vì vậy vui lòng lưu ý điểm này.
Japanese

---------- Forwarded message ---------
From: GMOペイメントゲートウェイ株式会社 カスタマーサポートセンター [email ẩn]
Date: 2026年11月5日(木) 14:02
Subject: 【GMO-PG】PGマルチペイメント／SSL証明書（ルート証明書）更新のご案内とご対応依頼
To: [email ẩn]

\*English follows Japanese
※参考情報として英語版を併記しております。
※英語版は機械翻訳のため、正式な内容は日本語文面をご確認ください。

システムご担当者様に本ご案内を転送いただきますようお願い申しあげます。
お客様各位

                                GMOペイメントゲートウェイ株式会社
                                        カスタマーサポートセンター


　「PGマルチペイメント／
　　　　　SSL証明書（ルート証明書）更新のご案内とご対応依頼」　　　　

拝啓 貴社ますますご清栄のこととお慶び申しあげます。
平素は弊社決済サービスをご利用いただきまして
誠にありがとうございます。

この度、弊社決済センターへの通信において、安全な通信環境を
継続してご利用いただくため、ルート証明書を順次変更いたします。

変更に伴い、一部のシステム環境では事前の確認やご対応が
必要となりますので下記にご案内いたします。

お客様におかれましては、ご面倒をお掛けいたしますが、必ずご確認いただき
ご対応いただけますようお願い申しあげます。

                                                            敬 具


                              記


1.対象加盟店様

　PGマルチペイメントサービスをご利用の加盟店様

　※2028年に予定しているクロスルート証明書なしへの切替までは
　　一部加盟店様を除き、影響はございません。

2.変更の目的と概要

　安全な通信環境を継続してご利用いただくため、
　弊社サービスで使用するSSL証明書のルート証明書を
　「GlobalSign Root CA - R3」から「GlobalSign Root R46」へ
　順次切り替えます。

　移行期間中は、現在ご利用の「GlobalSign Root CA - R3」を削除せず、
　「GlobalSign Root R46」も信頼できる状態としてください。

3.変更内容と変更日時

　■トークン決済
　　・V1、V2：js版、API版

　■サーバー間通信（API）
　　・OpenAPIタイプ
　　・プロトコルタイプ
　　・モジュールタイプ
　　・リンクタイプ Plus（API）

　■クライアント通信（画面）
　　・リンクタイプ Plus（決済画面）
　　・ショップ／サイト管理画面
　　・3DS2.0（認証画面）
　　・Shopify

　ご利用の機能により影響内容、変更日時が異なるため、
　詳細は以下資料をご確認ください。

　https://willap.jp/file/AAACrLRajh9pBEN0h8BAq8Wd1UlowAwcVdSuKg

　※いずれも当変更にともなうサービス停止はございません。

4.関連するFAQ

　利用されている接続方式が不明な場合は、以下FAQページをご覧ください。
　※カートシステムをご利用のお客様は、カート提供元へご確認ください。

　　▼接続方式について教えてください
　　　https://mp-faq2.gmo-pg.com/hc/ja/articles/5449238435614

　　▼利用している接続方式を確認する方法
　　　https://mp-faq2.gmo-pg.com/hc/ja/articles/5449280696862

5.本件に関する問合せ先

 GMOペイメントゲートウェイ株式会社 ／ カスタマーサポートセンター
  電子メール ： [email ẩn]
  電話番号   ： [số điện thoại ẩn]（平日10:00-17:00）

  ※音声ガイダンスが流れますので "4" をお選びください


                                                             以 上
誠に恐縮ではございますが、本ご案内が不要なお客様にもお送りすること \*
がございます。あらかじめご了承いただきますようお願い申しあげます。 \*
※以下は当ご案内の英語版です。
※The following is the English version of this notice.
※メール内記載の時間は日本標準時(UTC+9)で記載されています。
※Please note that all times are listed in JST (UTC+9).
※機械翻訳のため、正確な情報は日本語文面をご参照ください。
※This translation has been generated automatically.
※For accurate information, please refer to the original Japanese text.
※サポートセンターのお問い合わせ対応は日本語のみとなります。
※Please note that inquiries to the support center are handled in Japanese only.

English

Please forward this notice to the person in charge of your system.
Dear Customers,

                                GMO Payment Gateway, Inc.
                                        Customer Support Center


　　　“PG Multi-Payment /
　　　　　Notice of SSL Certificate (Root Certificate) Update
　　　　　and Request for Action”

We would like to express our sincere gratitude for your continued use
of our payment services.

To ensure that you can continue to use a secure communication
environment when connecting to our payment center, we will
sequentially change the root certificates.

As a result of this change, some system environments may require
advance verification or action. Please see the details below.

We apologize for the inconvenience and kindly ask that you review
this notice and take the necessary action.

                                                   Sincerely yours,


                              Details


Applicable Merchants


　Merchants using the PG Multi-Payment Service

　\* Except for some merchants, there will be no impact until the
　　switch to operation without a cross-root certificate, which is
　　scheduled for 2028.

Purpose and Overview of the Change


　To ensure continued use of a secure communication environment,
　we will sequentially switch the root certificate for the SSL
　certificates used by our services from
　“GlobalSign Root CA - R3” to “GlobalSign Root R46.”

　During the transition period, please do not remove the currently
　used “GlobalSign Root CA - R3,” and ensure that
　“GlobalSign Root R46" is also trusted.

Changes and Schedule


　■Token Payment
　　・V1, V2: JavaScript version, API version

　■Server-to-Server Communication (API)
　　・OpenAPI Type
　　・Protocol Type
　　・Module Type
　　・Link Type Plus (API)

　■Client Communication (Screens)
　　・Link Type Plus (Payment Screen)
　　・Shop/Site Management Screen
　　・3DS2.0 (Authentication Screen)
　　・Shopify

　The impact and timing of the changes vary depending on the
　functions you use. Please refer to the following materials
　for details.

　https://willap.jp/file/AAACrLRajh9pBEN0h8BAq8Wd1UlowAwcVdSuKg

　\* There will be no service interruption associated with any of
　　these changes.

Related FAQs


　If you are unsure which connection method you are using, please
　refer to the following FAQ pages.
　\* If you use a shopping cart system, please contact your shopping
　　cart system provider.

　　▼Please tell me about the connection methods.
　　　https://mp-faq2.gmo-pg.com/hc/ja/articles/5449238435614

　　▼How to check the connection method you are using
　　　https://mp-faq2.gmo-pg.com/hc/ja/articles/5449280696862

Contact Information for This MatterGMO Payment Gateway, Inc. / Customer Support CenterEmail  	: [email ẩn]  : [số điện thoại ẩn] (Weekdays, 10:00-17:00)
When you hear the voice guidance, please select “4.”


                                                       End
Please note that this notice may also be sent to customers for whom \*
this information is not required. Thank you for your understanding. \*


Mail 2
Japanese
From: GMOペイメントゲートウェイ株式会社 カスタマーサポートセンター [email ẩn]
Date: 2026年11月9日(月) 14:00
Subject: 【再送】【GMO-PG】PGマルチペイメント／弊社決済センターへの接続に関する変更案内とご確認依頼
To: [email ẩn]

\*English follows Japanese
※参考情報として英語版を併記しております。
※英語版は機械翻訳のため、正式な内容は日本語文面をご確認ください。
本メールは、2026年 7月30日、8月27日、9月17日にご案内した内容の
再案内となります。

本メールでご案内する変更内容は、加盟店様システムからの決済処理や管理
画面のご利用に影響する可能性がございます。

なお、本ご案内における重要なスケジュール変更がございまして、
昨今の不正アクセス事案の多発を鑑み、管理画面のクラウドサービス利用を
既報の日程より前倒しにて実施させていただくことといたしました。

　＜テスト環境＞
　　変更前：2026年11月24日（火）⇒　変更後：2026年11月18日（水）

　＜本番環境＞
　　変更前：2027年 1月18日（月）⇒　変更後：2026年12月 7日（月）

また、クラウドサービスの利用に伴い、API通信時にSNIへの対応が必須と
なることを追記いたしました。

運用ご担当者様、システムご担当者様に本ご案内を転送いただき、必ずご確認いただけますようお願い申しあげます。
お客様各位

　　　　　　　　　　　　　　　　　　 GMOペイメントゲートウェイ株式会社
　　　　　　　　　　　　　　　　　　　　　　カスタマーサポートセンター

　　　　弊社決済センターへの接続に関する変更案内とご確認依頼　　　　

拝啓　貴社ますますご清栄のこととお慶び申しあげます。
平素は弊社サービスをご利用いただきまして、誠にありがとうございます。

このたび、弊社決済サービスの安定性向上を目的とした変更を実施いたします。
当変更に伴い、決済処理、管理画面のIPアドレスやSSL接続要件が変更となり
ますので、下記に詳細をご案内いたします。

お客様におかれましては、ご面倒をお掛けいたしますが、必ずご確認いただき
ご対応いただけますようお願い申しあげます。

　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　 敬 具

　　　　　　　　　　　　　　　　　記　　　　　　　　　　　　　　　　　

1.変更の目的と概要

　システムの安定化を目的に、クラウドサービスを利用することで、
　大量の不正リクエストがなされたとしても正規リクエストの処理を阻害しない
　システム構成に変更いたします。

　これに伴い、弊社決済サービスのIPアドレスと、
　SSL/TLS通信におけるCipher Suite（暗号スイート）を変更いたします。

2.変更内容と変更日時

　影響サービス：PGマルチペイメントサービス

　・トークン決済（V1：js版、API版）※仕様変更済み
　・トークン決済（V2：js版、API版）※仕様変更済み
　・リンクタイプ Plus（決済画面）　※仕様変更済み
　・リンクタイプ Plus（API）
　・プロトコルタイプ
　・モジュールタイプ
　・ショップ／サイト管理画面　※スケジュール変更（前倒し）あり

　それぞれ影響内容、変更日時が異なるため、
　詳細は以下添付ファイルをご参照ください。

　https://willap.jp/file/AAACrI2AKwGdCLQWiz.WbZhfLAlowAwcVdSuKg

　※いずれも当変更にともなうサービス停止はございません。
　※決済センターのクラウドサービス利用に伴い、同一IPアドレスに対して
　　複数ドメインが紐づく構成となるため、API通信時に
　　SNI（Server Name Indication）への対応が必須となります。
　※カートシステムをご利用のお客様は、カート提供元へご確認ください。
　※結果通知プログラムの通知元については変更ございません。
　※OpenAPIタイプは構成変更済みです。

3.関連するFAQ

　利用されている接続方式が不明な場合は、以下FAQページをご覧ください。
　※カートシステムをご利用のお客様は、カート提供元へご確認ください。

　　▼接続方式について教えてください
　　　https://mp-faq2.gmo-pg.com/hc/ja/articles/5449238435614

　　▼利用している接続方式を確認する方法
　　　https://mp-faq2.gmo-pg.com/hc/ja/articles/5449280696862

4.本件に関する問合せ先

　　GMOペイメントゲートウェイ株式会社 ／ カスタマーサポートセンター
　　電子メール ： [email ẩn]
　　電話番号　 ： [số điện thoại ẩn]（平日 10:00-17:00）
　　※音声ガイダンスが流れますので “4” をお選びください

　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　以 上

誠に恐縮ではございますが、本ご案内が不要なお客様にもお送りすること \*
がございます。あらかじめご了承いただきますようお願い申しあげます。 \*
※以下は当ご案内の英語版です。
※The following is the English version of this notice.
※メール内記載の時間は日本標準時(UTC+9)で記載されています。
※Please note that all times are listed in JST (UTC+9).
※機械翻訳のため、正確な情報は日本語文面をご参照ください。
※This translation has been generated automatically.
※For accurate information, please refer to the original Japanese text.
※サポートセンターのお問い合わせ対応は日本語のみとなります。
※Please note that inquiries to the support center are handled in Japanese only.



English
This email is a repeat notice of the information previously provided
on July 30, August 27, and September 17, 2026.

The changes described in this email may affect payment processing from
merchant systems and the use of the management screens.

Please note that there is an important schedule change in this notice.
In light of the recent increase in unauthorized access incidents,
we have decided to move forward the use of cloud services for the
management screens from the previously announced dates.

　&lt;Test Environment&gt;
　　Before: November 24, 2026 (Tue.)
　　⇒ After: November 18, 2026 (Wed.)

　&lt;Production Environment&gt;
　　Before: January 18, 2027 (Mon.)
　　⇒ After: December 7, 2026 (Mon.)

We have also added information stating that support for SNI is
mandatory for API communications due to the use of cloud services.

Please forward this notice to your operations and system personneland ensure that they review the contents.
Dear Customers,

　　　　　　　　　　　　　　　　　　 GMO Payment Gateway, Inc.
　　　　　　　　　　　　　　　　　　　　　　Customer Support Center

　　　　Notice of Changes to Connections to Our Payment Center
　　　　　　　　　and Request for Confirmation　　　　

Thank you very much for your continued use of our services.

We will be implementing changes aimed at improving the stability of
our payment services. As a result of these changes, the IP addresses
for payment processing and the management screens, as well as the
SSL connection requirements, will change. Please see the details below.

We apologize for the inconvenience and kindly ask that you review
the information below and take the necessary action.

　　　　　　　　　　　　　　　　　　　　　　　　　 Sincerely yours,

　　　　　　　　　　　　　　　　　Details　　　　　　　　　　　　　　　　　

Purpose and Overview of the Changes


　To improve system stability, we will change the system configuration
　by using cloud services so that legitimate requests can continue to
　be processed even when a large volume of unauthorized requests is
　received.

　As a result, the IP addresses of our payment services and the
　Cipher Suites used for SSL/TLS communications will change.

Details and Dates of the Changes


　Affected Service: PG Multi-Payment Service

　・Token Payment (V1: JS version, API version)
　　\*Specifications already changed
　・Token Payment (V2: JS version, API version)
　　\*Specifications already changed
　・Link Type Plus (Payment Screen)
　　\*Specifications already changed
　・Link Type Plus (API)
　・Protocol Type
　・Module Type
　・Shop/Site Management Screens
　　\*Schedule change (moved forward)

　As the impact and change dates differ for each item,
　please refer to the attachment below for details.

　https://willap.jp/file/AAACrI2AKwGdCLQWiz.WbZhfLAlowAwcVdSuKg

　\*There will be no service interruption associated with any of
　 these changes.
　\*Due to the use of cloud services by the payment center, multiple
　 domains will be associated with the same IP address. Therefore,
　 support for SNI (Server Name Indication) is mandatory for API
　 communications.
　\*If you use a shopping cart system, please contact your shopping
　 cart system provider.
　\*There will be no change to the source of notifications sent by
　 the result notification program.
　\*The configuration change for the OpenAPI Type has already been
　 completed.

Related FAQs


　If you are unsure which connection method you are using, please
　refer to the FAQ pages below.
　\*If you use a shopping cart system, please contact your shopping
　 cart system provider.

　　▼Please tell me about the connection methods.
　　　https://mp-faq2.gmo-pg.com/hc/ja/articles/5449238435614

　　▼How to check which connection method you are using
　　　https://mp-faq2.gmo-pg.com/hc/ja/articles/5449280696862

Contact Information Regarding This Notice


　　GMO Payment Gateway, Inc. / Customer Support Center
　　Email　　　 : [email ẩn]
　　Phone　　　 : [số điện thoại ẩn] (Weekdays 10:00-17:00)
　　\*When the voice guidance begins, please select “4".

　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　End
Please note that this notice may also be sent to customers for whom \*
this information is not required. Thank you for your understanding. \*

