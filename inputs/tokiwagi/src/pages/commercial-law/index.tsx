import { Button, Grid } from "@mui/material";
import React, { Fragment } from "react";
import router from "next/router";

import Layout from "components/common/Layout";
import { ROUTE } from "constants/route";
import Breadcrumb from "components/common/UserLayout/Breadcrumb";

import styles from "./index.module.scss";

type DataType = { title: string; content: string }[];

export const data: DataType = [
  {
    title: "販売業者",
    content: "株式会社ボーネルンド",
  },
  {
    title: "販売責任者氏名",
    content: "代表取締役会長　中西弘子",
  },
  {
    title: "所在地",
    content: "東京都渋谷区神宮前1-3-12　ジブラルタ生命原宿ビル3階",
  },
  {
    title: "商品の販売価格・サービスの対価",
    content: "各商品・サービスページにおいて表示する金額",
  },
  {
    title: "商品代金以外の必要料金",
    content: "※当日利用の場合は店頭にてお支払いください。当サイトにて決済はありません。",
  },
  {
    title: "商品引渡しまたはサービス提供の時期",
    content: "利用権はご予約完了後直ちにお客様に帰属致しますが、利用権に基づき実際に施設を利用できるのは、ご 予約頂いた日時になります。",
  },
  {
    title: "お申込みの有効期限",
    content: "ご利用日時の経過まで",
  },
  {
    title: "決済手数料",
    content: "弊社負担により、無料とさせていただきます。",
  },
  {
    title: "予約の有効期限",
    content:
      "予約と当日利用のどちらも、ご利用日を過ぎますとご利用いただけなくなります。\n※予約：予約日以降お客様ご自身でご指定 \n※当日利用：当日の入場予約予約・オンライン購入のご購入代金はお客様にて当サイト、または カード会社にて返金手続きをお願いします。",
  },
  {
    title: "お支払い方法（事前予約）",
    content:
      "クレジットカード \n VISA、MasterCard、JCB、American Express、DinersClubのクレジットカードがご利用いただけます。\n※当日利用については、店頭にて現金、クレジットカード、QRコード、電子マネーなど各種決済手段のご利用が可能です。" +
      "（店舗によって異なります。詳しくは各店へお問い合わせください)",
  },
  {
    title: "お支払い期限",
    content: "ご注文時にお手続きをお願いいたします。",
  },
  {
    title: "返金期限",
    content:
      "予約・オンライン購入完了後、ご利用予定店舗のご利用予定日の最終入場受付時間までにマイページより、お手続きをお願いいたします。\n※最終入場受付時間は各店ショップページにてご確認ください。全国ショップリスト" +
      "：https://kidokid.bornelund.co.jp/shop.html",
  },
  {
    title: "返金手数料",
    content: "弊社負担となります。",
  },
  {
    title: "JAVA　SCRIPTについて",
    content:
      "本サイトでは、JavaScriptを使用しています。JavaScriptを有効にしてお使いください。なお、ログインしたまま長時間サイトのご利用を停止すると自動的にログアウトされ、それまでのデータがクリアされることがありますのでご注意ください。",
  },
  {
    title: "推奨環境",
    content: "本サイトの推奨環境です。",
  },
  {
    title: "パソコン",
    content: "・Mozilla Firefox 最新版 \n ・Google Chrome 最新版 \n・Safari 最新版 \n・Microsoft  Edge 最新版",
  },
  {
    title: "スマートフォン",
    content:
      "・AndroidOSの場合 \n\t\t ・ OSバージョン：Android 5.0以上 \n\t\t ・ ブラウザ：AndroidOS標準、またはChrome 最新版 \n ・iOSの場合 " +
      "\n\t\t ・ iPhone5以上 \n\t\t ・ OSバージョン：iOS 10.0以上 \n\t\t ・ ブラウザ：iOS標準（Safari）",
  },
  {
    title: "会員登録について",
    content: "本サイトご利用の際に全てのお客様に会員登録をお願いしております。会員登録をしないとご利用になれません",
  },
  {
    title: "お問い合わせ先  ",
    content:
      "TEL　0120-358-518（通話料無料）\n 受付時間／月〜金曜日　10:00〜17:00　（土日祝日を除く）\n メールアドレス／info@bornelund.co.jp \n土日祝日のお問い合わせは各店舗までお電話ください。",
  },
];

export const dataMobile: DataType = [
  {
    title: "販売業者",
    content: "株式会社ボーネルンド",
  },
  {
    title: "販売責任者氏名",
    content: "代表取締役会長　中西弘子",
  },
  {
    title: "所在地",
    content: "東京都渋谷区神宮前1-3-12　\nジブラルタ生命原宿ビル3階",
  },
  {
    title: "商品の販売価格・サービスの対価",
    content: "各商品・サービスページにおいて表示する金額",
  },
  {
    title: "商品代金以外の必要料金",
    content: "※当日利用の場合は店頭にてお支払いください。当サイトにて決済はありません。",
  },
  {
    title: "商品引渡しまたはサービス提供の時期",
    content: "利用権はご予約完了後直ちにお客様に帰属致しますが、利用権に基づき実際に施設を利用できるのは、ご 予約頂いた日時になります。",
  },
  {
    title: "お申込みの有効期限",
    content: "ご利用日時の経過まで",
  },
  {
    title: "決済手数料",
    content: "弊社負担により、無料とさせていただきます。",
  },
  {
    title: "予約の有効期限",
    content:
      "予約と当日利用のどちらも、ご利用日を過ぎますとご利用いただけなくなります。\n※予約：予約日以降お客様ご自身でご指定 \n※当日利用：当日の入場予約予約・オンライン購入のご購入代金はお客様にて当サイト、または カード会社にて返金手続きをお願いします。",
  },
  {
    title: "お支払い方法（事前予約）",
    content:
      "クレジットカード \n VISA、MasterCard、JCB、American Express、DinersClubのクレジットカードがご利用いただけます。\n※当日利用については、店頭にて現金、クレジットカード、QRコード、電子マネーなど各種決済手段のご利用が可能です。" +
      "（店舗によって異なります。詳しくは各店へお問い合わせください)",
  },
  {
    title: "お支払い期限",
    content: "ご注文時にお手続きをお願いいたします。",
  },
  {
    title: "返金期限",
    content:
      "予約・オンライン購入完了後、ご利用予定店舗のご利用予定日の最終入場受付時間までにマイページより、お手続きをお願いいたします。\n※最終入場受付時間は各店ショップページにてご確認ください。全国ショップリスト" +
      "：https://kidokid.bornelund.co.jp/shop.html",
  },
  {
    title: "返金手数料",
    content: "弊社負担となります。",
  },
  {
    title: "JAVA　SCRIPTについて",
    content:
      "本サイトでは、JavaScriptを使用しています。JavaScriptを有効にしてお使いください。なお、ログインしたまま長時間サイトのご利用を停止すると自動的にログアウトされ、それまでのデータがクリアされることがありますのでご注意ください。",
  },
  {
    title: "推奨環境",
    content: "本サイトの推奨環境です。",
  },
  {
    title: "パソコン",
    content: "・Mozilla Firefox 最新版 \n ・Google Chrome 最新版 \n・Safari 最新版 \n・Microsoft  Edge 最新版",
  },
  {
    title: "スマートフォン",
    content:
      "・AndroidOSの場合 \n\t\t ・ OSバージョン：Android 5.0以上 \n\t\t ・ ブラウザ：AndroidOS標準、または \n \t \t \t Chrome 最新版 \n ・iOSの場合 " +
      "\n\t\t ・ iPhone5以上 \n\t\t ・ OSバージョン：iOS 10.0以上 \n\t\t ・ ブラウザ：iOS標準（Safari）",
  },
  {
    title: "会員登録について",
    content: "本サイトご利用の際に全てのお客様に会員登録をお願いしております。会員登録をしないとご利用になれません",
  },
  {
    title: "お問い合わせ先  ",
    content:
      "TEL　0120-358-518（通話料無料）\n 受付時間／月〜金曜日　10:00〜17:00　（土日祝日を除く）\n メールアドレス／info@bornelund.co.jp \n土日祝日のお問い合わせは各店舗までお電話ください。",
  },
];

export default function PrivacySetting() {
  return (
    <Layout>
      <div className="container mx-auto">
        <div className="ml-40 xs:ml-3 md:ml-6">
          <Breadcrumb title="特定商取引法に基づく表示" />
        </div>
        <h2 className="usr-title-line text-center xs:!text-[30px] mx-auto mb-16 xs:mb-8 pt-8 !text-[#0068B7]">特定商取引法に基づく表示</h2>
        {/* DESKTOP */}
        <div className="xs:hidden gird pt-2 pl-12 pr-12 mdup:ml-[200px] mdup:mr-[100px]">
          <>
            {data.map(({ title, content }) => (
              <Grid key={title} container className={styles.row}>
                <Grid item xs={6}>
                  <p className="font-bold xsup:w-[303px]">{title}</p>
                </Grid>
                <Grid item xs={6} className={styles.content}>
                  <div className="mdup:w-[512px] ">
                    {content.split(/(\n|\t)/).map((item, index) => {
                      if (item === "\n") return <br key={index} />;
                      if (item === "\t") return <Fragment key={index}>&emsp;</Fragment>;
                      return <Fragment key={index}>{item}</Fragment>;
                    })}
                  </div>
                </Grid>
              </Grid>
            ))}

            {/* Tenant Links */}
            <Grid container className={styles.row}>
              <Grid item xs={6}>
                <p className="font-bold xsup:w-[303px]">一部店舗の特定商取引法の表示について</p>
              </Grid>
              <Grid item xs={6} className={styles.content}>
                <div className="mdup:w-[512px] ">
                  <span>下記店舗は本頁の販売業者とは異なります。詳細は店舗名をクリックしてご確認ください。</span>
                  <br />
                  <span>・</span>
                  <a className="text-blue-color" target="_blank" href="https://asobi-yoyaku.bornelund.co.jp/tenant/GT" rel="noreferrer">
                    あそびのせかい グランツリー武蔵小杉店
                  </a>
                  <br />
                  <span>・</span>
                  <a className="text-blue-color" target="_blank" href="https://asobi-yoyaku.bornelund.co.jp/tenant/MP" rel="noreferrer">
                    あそびのせかい マリンピア神戸店
                  </a>
                </div>
              </Grid>
            </Grid>
          </>
        </div>
        {/* MOBILE */}
        <div className="xsup:hidden gird xs:pl-4 xs:pr-4 mdup:ml-[200px] mdup:mr-[100px]">
          <>
            {dataMobile.map(({ title, content }) => (
              <div key={title} className={styles.row}>
                <div>
                  <p className="font-bold xsup:w-[303px]">{title}</p>
                  <div className={`mdup:w-[512px] ${styles.content}`}>
                    {content.split(/(\n|\t)/).map((item, index) => {
                      if (item === "\n") return <br key={index} />;
                      if (item === "\t") return <Fragment key={index}>&emsp;</Fragment>;
                      return <Fragment key={index}>{item}</Fragment>;
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* Tenant Links */}
            <div className={styles.row}>
              <div>
                <p className="font-bold xsup:w-[303px]">一部店舗の特定商取引法の表示について</p>
                <div className={`mdup:w-[512px] ${styles.content}`}>
                  <span>下記店舗は本頁の販売業者とは異なります。詳細は店舗名をクリックしてご確認ください。</span>
                  <br />
                  <span>・</span>
                  <a className="text-blue-color" target="_blank" href="https://asobi-yoyaku.bornelund.co.jp/tenant/GT" rel="noreferrer">
                    あそびのせかい グランツリー武蔵小杉店
                  </a>
                  <br />
                  <span>・</span>
                  <a className="text-blue-color" target="_blank" href="https://asobi-yoyaku.bornelund.co.jp/tenant/MP" rel="noreferrer">
                    あそびのせかい マリンピア神戸店
                  </a>
                </div>
              </div>
            </div>
          </>
        </div>

        <div className="flex justify-center pt-12 pl-4 pr-4 mb-[60px]">
          <Button
            type="button"
            variant="contained"
            className="w-[400px] h-[64px]"
            onClick={() => {
              router.push(`${ROUTE.INDEX}`);
            }}
          >
            戻る
          </Button>
        </div>
      </div>
    </Layout>
  );
}
