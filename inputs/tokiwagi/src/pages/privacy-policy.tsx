import { Button, CardContent } from "@mui/material";
import { Fragment } from "react";
import { useRouter } from "next/router";

import Layout from "components/common/Layout";
import Breadcrumb from "components/common/UserLayout/Breadcrumb";
import { ROUTE } from "constants/route";

type DataType = { title: string; content: string; linkUrl?: string; linkText?: string }[];
export const PrivacyPolicies16: DataType = [
  {
    title: "お聞きする個人情報について",
    content:
      "当社が管理・運営するWebサイトを通じてお客様から氏名、住所、生年月日、電話番号、電子メールアドレス、年齢、性別、職業、クレジットカード情報等、特定の個人を識別できる情報をお聞きすることがあります。\n" +
      "すべての質問にお答えになる必要はありませんが、特定の質問にお答えいただかないと利用できないサービスもあります。\n" +
      "また、ご自身の登録内容を抹消したい場合は、いつでも当社にその旨請求できます。ただし、登録を抹消すると当社Webサイトが提供できないサービスが発生する可能性があります。",
  },
  {
    title: "個人情報の利用について",
    content:
      "お客様の個人情報は、本Webサイトにおけるサービス提供に必要な場合にのみご提供をお願いしております。" +
      "お客様にご提供いただいた個人情報は、明示した利用目的のために利用し、お客様の同意なく利用目的以外に利用することはありません。\n" +
      "当社は、本Webサイトにおけるサービスを通じて当社に提供されるすべての個人情報を、当社事業に関連する範囲において、商品・サービスのご提供および各種情報のお知らせのために利用いたします。\n" +
      "当社は会員から提供された ①氏名、住所、電話番号、電子メールアドレス等、会員がご自身で記入した事項②当社サービスのご利用履歴（位置情報を含む）や商品等の購入履歴 ③当社からのアンケート等にてご回答された情報等を分析し、以下の目的に利用いたします。\n" +
      " 1.会員の趣味、嗜好に応じた当社の商品・サービスの広告宣伝やメール配信のため\n" +
      " 2.会員の趣味、嗜好に応じた当社の商品・サービスを、オフィシャルウェブサイト等においてプッシュ通知等でお勧めするため\n" +
      " 3.商品・サービスの向上や新商品やサービス、施設の開発のため\n" +
      " 4.会員から当社へのご意見をお伺いするためのアンケート、メール配信のため\n",
  },
];
export const PrivacyPolicies: DataType = [
  {
    title: "個人情報の第三者への開示について",
    content:
      "ご提供頂いた個人情報は、次の場合を除き第三者に開示しません。\n" +
      " 1.お客様の同意がある場合\n" +
      " 2.当社が信頼に足ると判断した外部の企業に対して、業務の達成に必要な範囲内で個人情報の取扱いを委託する場合\n" +
      " 3.法令に基づく場合\n" +
      " 4.人の生命、身体又は財産の保護のために必要がある場合であって、本人の同意を得ることが困難である場合\n" +
      " 5.公衆衛生の向上又は児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難である場合\n" +
      " 6.国の機関若しくは地方公共団体又はその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがある場合\n" +
      " 7.当該第三者が学術研究機関等である場合であって、当該第三者が当該個人データを学術研究目的で取り扱う必要がある場合（当該個人データを取り扱う目的の一部が学術研究目的である場合を含み、個人の権利利益を不当に侵害するおそれがある場合を除きます）",
  },
  {
    title: "個人情報の管理について",
    content:
      "ご提供頂いた個人情報は、次の場合を除き第三者に開示しません。" +
      "お客様の同意がある場合" +
      "当社が信頼に足ると判断した外部の企業に対して、業務の達成に必要な範囲内で個人情報の取扱いを委託する場合" +
      "法令に基づく場合" +
      "人の生命、身体又は財産の保護のために必要がある場合であって、本人の同意を得ることが困難である場合" +
      "公衆衛生の向上又は児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難である場合" +
      "国の機関若しくは地方公共団体又はその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがある場合" +
      "当該第三者が学術研究機関等である場合であって、当該第三者が当該個人データを学術研究目的で取り扱う必要がある場合（当該個人データを取り扱う目的の一部が学術研究目的である場合を含み、個人の権利利益を不当に侵害するおそれがある場合を除きます）",
  },
  {
    title: "個人情報の修正・削除等について",
    content:
      "ご提供いただいたお客様の個人情報は、厳重に管理し、紛失、破壊、改ざん、および漏洩等の防止策を講じます。" +
      "また、個人情報をご提供いただく際には、第三者による不正なアクセスに備え、SSL(Secure Sockets Layer)による暗号化またはこれに準ずるセキュリティ技術を施し、安全性の確保に努めます。" +
      "個人情報の管理に際して当社が講じている安全管理措置の詳細については、以下の「問い合せ先」に記載の問い合わせ窓口へご連絡ください",
  },
  {
    title: "外部のサイトの個人情報保護について",
    content:
      "ご提供いただいた個人情報について、個人情報の利用目的の通知、開示、訂正等、利用停止等、第三者への提供の停止または第三者提供記録の開示を希望される場合は、お問い合わせください。",
    linkUrl: "https://kidokid.bornelund.co.jp/contact/",
    linkText: "お問い合わせフォーム",
  },
  {
    title: "関係法令およびその他の規範の遵守について",
    content: "当社は、個人情報の保護に関する法令およびその他関連する規範等を遵守いたします。",
  },
  {
    title: "本プライバシーポリシーの変更について",
    content: "当社では、サービス内容や技術動向の変化および法令等の変更に伴い、本プライバシーポリシーの記載内容を変更することがあります。",
  },
  {
    title: "クッキーの使用について",
    content:
      "当社Webサイトでは、クッキーを使用して動作をコントロールしています。当サイトのご利用に際しては、パソコン・スマートフォンの設定を「クッキーを受け入れる」設定でご利用ください。クッキーを受け入れない設定でご利用した場合、正常に動作しない場合があります。",
  },
];

export default function PrivacySetting() {
  const router = useRouter();

  const handleBack = () => {
    const isFromSignUp = router.query.isFromSignUp;
    if (isFromSignUp) {
      window.close();
      return;
    }
    router.push(ROUTE.INDEX);
  };
  return (
    <Layout>
      <section className="relative text-600">
        <div className="container mx-auto">
          <div className="ml-40 xs:ml-3 md:ml-6">
            <Breadcrumb title="プライバシーポリシー" />
          </div>
          <h2 className="usr-title-line text-center xs:text-[28px] mx-auto mt-8 mb-16 xs:mb-8 !text-[#0068B7] !font-extrabold">プライバシーポリシー</h2>
          <div className="gird pt-4 mdonly:pl-12 mdonly:pr-12 xs:pl-4 xs:pr-4 mdup:pl-[300px]  mdup:pr-[300px]">
            <div>
              <div className="pl-4 font-thin xs:text-[14px]">
                【2022年10月1日改定】
                <br />
                株式会社ボーネルンド（以下「当社」といいます）は、個人情報の保護を社会的責務であると考え、お客様に安心してご利用いただけるWebサイトの管理・運営を行うため、以下の通りプライバシーポリシーを定めました。
                本プライバシーポリシーは、当社のWebサイト（https://www.bornelund.co.jp/）
                を通じてお客様の個人情報をご提供いただく場合に適用されます。ただし、個人情報をご提供いただく際に、本プライバシーポリシーとは別の定めがある場合は、これが本プライバシーポリシーに優先いたします。
                <br></br>
                なお、お客様が個人情報の提供をご希望されない場合は、お客様ご自身のご判断により、個人情報の提供を拒否することができます。この場合、当社のWebサイトにおけるサービスをご利用できない場合がありますが、予めご了承ください。
              </div>
            </div>
            {PrivacyPolicies16.map(({ title, content, linkUrl, linkText }) => (
              <div key={title}>
                <div className="pt-4 pl-4 text-[#0068B7]">
                  <b className="xs:text-[16px]">{title}</b>
                  <div className="pt-4">
                    <hr />
                  </div>
                </div>
                <CardContent>
                  <div className="pt-4 pl-6">
                    <div className="font-thin text-[16px] xs:text-[14px]">
                      {content.split(/(\n|\t)/).map((item, index) => {
                        if (item === "\n") return <br key={index} />;
                        if (item === "\t") return <Fragment key={index}>&emsp;</Fragment>;
                        return <Fragment key={index}>{item}</Fragment>;
                      })}
                    </div>
                    {linkUrl && (
                      <div style={{ color: "blue" }}>
                        <a href={linkUrl} className="cursor-pointer hover:underline" rel="noopener noreferrer" target="_blank">
                          {linkText || linkUrl}
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </div>
            ))}
            {PrivacyPolicies.map(({ title, content, linkUrl, linkText }) => (
              <div key={title}>
                <div className="pt-4 pl-4 text-[#0068B7]">
                  <b className="xs:text-[14px]">{title}</b>
                  <div className="pt-4">
                    <hr />
                  </div>
                </div>
                <CardContent>
                  <div className="pt-4 pl-6">
                    <div className="font-thin text-[16px] xs:text-[14px]">
                      {content.split(/(\n|\t)/).map((item, index) => {
                        if (item === "\n") return <br key={index} />;
                        if (item === "\t") return <Fragment key={index}>&emsp;</Fragment>;
                        return <Fragment key={index}>{item}</Fragment>;
                      })}
                    </div>
                    {linkUrl && (
                      <div style={{ color: "blue" }}>
                        <a href={linkUrl} className="cursor-pointer hover:underline" rel="noopener noreferrer" target="_blank">
                          {linkText || linkUrl}
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </div>
            ))}
          </div>
          <div className="flex justify-center pt-12 pl-4 pr-4 mb-[60px]">
            <Button type="button" variant="contained" className="w-[400px] h-[64px]" onClick={handleBack}>
              戻る
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
