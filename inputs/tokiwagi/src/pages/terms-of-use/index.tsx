import { Button, CardContent, Grid } from "@mui/material";
import React from "react";
import { useRouter } from "next/router";

import Layout from "components/common/Layout";
import Breadcrumb from "components/common/UserLayout/Breadcrumb";
import { ROUTE } from "constants/route";

export default function TermsOfUse() {
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
      <div className="container mx-auto">
        <div className="ml-40 xs:ml-3 md:ml-6">
          <Breadcrumb title="利用規約" />
        </div>
        <h2 className="usr-title-line text-center xs:text-[30px] mx-auto mb-16 xs:mb-8 pt-8 !text-[#0068B7]">利用規約</h2>

        <div className="gird pt-4 pl-12 pr-12 xs:pl-4 xs:pr-4 mdup:pl-[323px] mdup:pr-[323px]">
          <div>
            <p className="pl-4 pb-4 font-thin">
              {
                "株式会社ボーネルンド（以下「当社」といいます）は、運営するボーネルンドあそび場　受付・事前購入サイト（以下「本サービス」といいます）の利用規約（以下「本規約」といいます）を以下の通り定めます。なお、本サービスを利用される方は、以下の条件にご承諾いただいたことになります。"
              }
            </p>
            <div className="pt-4 pl-4 pb-4">
              <b className="w-[130px] h-[20px] xs:!text-[14px] !text-[#0068B7]">＜第1章&emsp;総則＞</b>
            </div>
            <div>
              <hr />
            </div>
            {/* Desktop */}
            <div className="xs:hidden">
              <CardContent>
                <div className="pt-2 ">
                  <p>第1条&emsp;本規約の範囲及び変更</p>

                  <div className="pt-4 pl-4">
                    <div className="text-[16px] font-thin">
                      <Grid container>
                        <Grid item xs={0.2}>
                          <p className="font-thin">1</p>
                        </Grid>
                        <Grid item xs={11.8}>
                          <p className="font-thin">
                            .本規約は本サービスの利用に関し、当社および会員（第３条で定義します）を含む本サービス利用者（以下「利用者」といいます）に適用されるものとします。なお、本サービスを利用される方は、以下の条件にご承諾いただいたことになります。
                          </p>
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item xs={0.2}>
                          <p className="font-thin">2</p>
                        </Grid>
                        <Grid item xs={11.8}>
                          <p className="font-thin">
                            .当社は、利用者に事前の承諾を得ることなく、適切な方法で利用者に通知することにより本規約を変更できるものとします。
                          </p>
                        </Grid>
                      </Grid>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardContent>
                <p>第2条&emsp;本サービスの利用</p>
                <div className="pt-4 pl-4 pb-4">
                  <div className="text-[16px] font-th">
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">1</p>
                      </Grid>
                      <Grid item xs={11.8}>
                        <p className="font-thin">.利用者は、本規約および当社が別途定めるルール等に従い、本サービスを利用するものとします。</p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">2</p>
                      </Grid>
                      <Grid item xs={11.8}>
                        <p className="font-thin">
                          .当社は、利用者に事前の承諾を得ることなく、適切な方法で利用者に通知することにより本規約を変更できるものとします。
                        </p>
                      </Grid>
                    </Grid>
                  </div>
                </div>
              </CardContent>
              <div className="pt-2 pl-4 pb-4">
                <b className="w-[130px] h-[20px] !text-[#0068B7]">＜第2章&emsp;会員＞</b>
              </div>
              <div>
                <hr />
              </div>
              <CardContent>
                <p>第3条&emsp;会員</p>
                <div className="pt-4 pl-4">
                  <div className="text-[16px] font-thin">
                    「会員」とは、本規約を承認いただいた上、当社所定の手続に従い会員登録を申請し、当社がこれを承認した方をいいます。
                  </div>
                </div>
              </CardContent>
              <CardContent>
                <p>第4条&emsp;会員登録</p>
                <div className="pt-4 pl-4">
                  <div className="text-[16px] font-thin xs:text-[14px]">
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">1</p>
                      </Grid>
                      <Grid item xs={11.8}>
                        <p className="font-thin">.会員登録希望者は、本サービスの会員登録ページから当社の指定する方法に従い登録申請を行うものとします。</p>
                      </Grid>
                    </Grid>
                    <div>
                      <Grid container>
                        <Grid item xs={0.2}>
                          <p className="font-thin">2</p>
                        </Grid>
                        <Grid item xs={11.8}>
                          <p className="font-thin">.当社は、以下の各号のいずれかに該当する場合、当該登録申請を承認しない場合があります。</p>
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item xs={0.5}>
                          <p className="font-thin">(1) </p>
                        </Grid>
                        <Grid item xs={11.5}>
                          <p className="font-thin">
                            入会希望者が過去に本規約違反をしたことなどにより、会員登録の抹消などの処分をうけていることが判明した場合。
                          </p>
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item xs={0.5}>
                          <p className="font-thin">(2) </p>
                        </Grid>
                        <Grid item xs={11.5}>
                          <p className="font-thin">会員希望者の申請内容に、虚偽の事項が含まれている場合</p>
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item xs={0.5}>
                          <p className="font-thin">(3) </p>
                        </Grid>
                        <Grid item xs={11.5}>
                          <p className="font-thin">その他登録申請を承認することが不適当であると当社が判断する場合</p>
                        </Grid>
                      </Grid>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardContent>
                <p>第5条&emsp;変更の届出</p>
                <div className="pt-4 pl-4">
                  <div className="text-[16px] font-thin">
                    会員は、住所、氏名、電話番号、その他当社に届け出ている事項に変更が生じた場合には、当社が別途定める方法により、すみやかに当社に届け出るものとします。
                  </div>
                </div>
              </CardContent>
              <CardContent>
                <p>第6条&emsp;本サービスの利用停止、会員登録の抹消</p>
                <div className="pt-4 pl-4">
                  <div className="text-[16px] font-thin">
                    当社は、会員が以下の各号のいずれかに該当する場合、会員に事前通知することなく本サービスの利用停止または会員登録を抹消することができるものとします。
                    この場合、当社はあそび場予約・オンライン購入サイトの提供中止に関し、利用者および第三者に対して一切責任を負わないものとします
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">1</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">.過去に本規約違反をしたことなどにより会員登録の抹消などの処分をうけていることが判明した場合</p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">2</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">.本サービスに関する料金などの支払債務の履行遅延、その他の不履行があった場合</p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">3</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">.第9条（禁止事項）の行為を行った場合</p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">4</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">.その他本規約に違反した場合</p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">5</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">.その他、本規約または商品等（第4章 第11条で定義します）の個別の予約・販売条件に違反した場合</p>
                      </Grid>
                    </Grid>
                  </div>
                </div>
              </CardContent>
              <CardContent>
                <p>第7条&emsp;メールアドレスおよびパスワードの管理</p>
                <div className="pt-4 pl-4">
                  <div className="text-[16px] font-thin">
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">1</p>
                      </Grid>
                      <Grid item xs={11.8}>
                        <p className="font-thin">.会員は、メールアドレスならびにパスワードの管理責任を負うものとします。</p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">2</p>
                      </Grid>
                      <Grid item xs={11.8}>
                        <p className="font-thin">.会員は、メールアドレスならびにパスワードを第三者に譲渡、貸与、開示してはならないものとします。</p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">3</p>
                      </Grid>
                      <Grid item xs={11.8}>
                        <p className="font-thin">
                          .会員は、メールアドレスならびにパスワードの管理不十分、使用上の過誤、第三者の使用などに起因する損害につき自ら責任を負うものとします。
                        </p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">4</p>
                      </Grid>
                      <Grid item xs={11.8}>
                        <p className="font-thin">
                          .会員は、メールアドレスならびにパスワードが第三者によって不正に使用されていることが判明した場合には、直ちに当社に連絡するものとします。
                        </p>
                      </Grid>
                    </Grid>
                  </div>
                </div>
              </CardContent>
              <CardContent>
                <p>第8条&emsp;プライバシーの考え方</p>
                <div className="pt-4 pl-4">
                  <div className="text-[16px] font-thin">
                    会員登録情報および当社が取得した利用者に関する情報は、当社のプライバシーの考え方に従って取り扱われます。当社のプライバシーの考え方はプライバシーポリシーをご覧ください。
                  </div>
                </div>
              </CardContent>
              <div className="pt-4 pl-4 pb-4">
                <b className="w-[130px] h-[20px] !text-[#0068B7]">＜第3章&emsp;サービスの利用＞</b>
              </div>
              <div>
                <hr />
              </div>
              <CardContent>
                <p>第9条&emsp;禁止事項</p>
                <div className="pt-4 pl-4">
                  <div className="text-[16px] font-thin">
                    利用者は以下の行為を行ってはならないものとします。 ご利用の際に虚偽の登録内容を申請する行為
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">1</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">.本サービスの運営を妨げ、その他本サービスに支障をきたすおそれがある行為</p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">2</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">.クレジットカードを不正使用して本サービスを利用する行為</p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">3</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">
                          .当社が明示して許可した場合を除き、本サービスを利用するユーザーとしての地位、本サービスを利用して取得した権利、その他本規約に基づく権利、義務の全部または一部を第三者に譲渡し、承継させ、または担保に供する一切の行為
                        </p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">4</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">
                          .営業行為／転売を目的として本サービスを利用する行為、営業行為／転売を行う第三者へ提供する目的で本サービスを利用する行為
                        </p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">5</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">メールアドレスおよびパスワードを不正に使用する行為</p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">6</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">.他の利用者、第三者もしくは当社に迷惑、不利益もしくは損害を与える行為、またはそれらのおそれがある行為</p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">7</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">
                          .他の利用者、第三者もしくは当社の著作権、プライバシー、その他の一切の権利を侵害する行為、またはそれらのおそれがある行為
                        </p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">8</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">.公序良俗に反する行為その他法令に違反する行為、またはそれらのおそれがある行為</p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">9</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">.その他、当社が不適当であると判断する行為</p>
                      </Grid>
                    </Grid>
                  </div>
                </div>
              </CardContent>
              <CardContent>
                <p>第10条&emsp;著作物の利用</p>
                <div className="pt-4 pl-4">
                  <div className="text-[16px] font-thin">
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">1</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">
                          .利用者は、本サービスを通じて提供されるいかなる画像、写真等の著作物について、権利者の許諾を得ないで、著作権法で認められる個人の私的複製等著作権の制限規定範囲外での使用をすることはできません。
                        </p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">2</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">
                          .本条の規定に違反して権利者との間で問題が生じた場合、利用者は自己の責任と費用においてかかる問題を解決するとともに、当社に何等の迷惑または損害を与えないものとします。
                        </p>
                      </Grid>
                    </Grid>
                  </div>
                </div>
              </CardContent>
              <div className="pt-4 pl-4 pb-4">
                <b className="w-[130px] h-[20px] !text-[#0068B7]">＜第4章&emsp;商品等の予約および購入＞</b>
              </div>
              <div>
                <hr />
              </div>
              <CardContent>
                <p>第11条&emsp;商品等の購入</p>
                <div className="pt-4 pl-4">
                  <div className="text-[16px] font-thin">
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">1</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">
                          .利用者は、本サービスを利用して当社から商品またはサービス（以下「商品等」といいます）を予約・購入することができます。
                        </p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">2</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">
                          .利用者は、商品等の予約・購入を希望する場合、別途当社が定める方法に従って商品等の予約・購入を申し込むものとします
                        </p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">3</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">
                          .前項の申し込みに対して、当社からの商品等の予約・購入を承諾する旨の利用者宛て電子メールを利用者が受領した時点で利用者と当社との間に当該商品等に関する予約・購入の売買契約が成立するものとします。ただし、
                        </p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">4</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">
                          .前項の規定に関わらず、本サービス利用に関して不正行為または不適当な行為があった場合または当社が本規約に基づき会員登録を抹消した場合、当社は売買契約を取り消しもしくは解除、その他適切な措置を取ることができるものとします。
                        </p>
                      </Grid>
                    </Grid>
                  </div>
                </div>
              </CardContent>
              <CardContent>
                <p>第12条&emsp;決済方法</p>
                <div className="pt-4 pl-4">
                  <div className="text-[16px] font-thin">
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">1</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">.商品等のお支払金額は、商品等購入代金、取り扱い手数料および消費税等の合計となります。</p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">2</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">
                          .本サービスによって購入された商品等のお支払いに関しては、会員本人名義のクレジットカードによるお支払い、その他当社が別途認めるお支払方法によるものとします。
                        </p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">3</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">
                          .クレジットカードでのお支払いの場合は、利用者が当該クレジットカード会社との間で別途契約する条件に従うものとします。なお、利用者と当該クレジットカード会社等の間で紛争が発生した場合は、当該当事者双方で解決するものとし、当社には一切責任はないものとします。
                        </p>
                      </Grid>
                    </Grid>
                  </div>
                </div>
              </CardContent>
              <CardContent>
                <p>第13条&emsp;商品等のキャンセル</p>
                <div className="pt-4 pl-4">
                  <div className="text-[16px] font-thin">
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">1</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">.商品等のキャンセルは、商品等の不適合、その他当社が別途認める場合を除き、できないものとします。</p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">2</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">.ユーザーは、前項のキャンセルを、当社が別途定める方法に従い行うものとします。</p>
                      </Grid>
                    </Grid>
                  </div>
                </div>
              </CardContent>
              <div className="pt-4 pb-4">
                <b className="w-[130px] h-[20px] !text-[#0068B7]">＜第５章 本サービスの運用＞</b>
              </div>
              <div>
                <hr />
              </div>
              <CardContent>
                <p>第14条&emsp;本サービスの保守</p>
                <div className="pt-4 pl-4">
                  <div className="text-[16px] font-thin">
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">1</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">
                          .システムの定期保守および緊急保守の場合 天災、火災、停電等の不可抗力、第三者による妨害行為等により、 システムの運用が困難になった場合
                        </p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">2</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">.システムの不具合、故障等による場合 その他</p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">3</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">.システムの停止が必要と当社が判断した場合</p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">4</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin"> .その他、システムの停止が必要と当社が判断した場合</p>
                      </Grid>
                    </Grid>
                  </div>
                </div>
              </CardContent>
              <CardContent>
                <p>第15条&emsp;本サービスの終了</p>
                <div className="pt-4 pl-4">
                  <div className="text-[16px] font-thin">
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">1</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">
                          .当社は、利用者に対し１ヶ月以上前に当社が定める方法に従って通知することにより、本サービスの提供を終了することができるものとします。
                        </p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">2</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">
                          .当社は、本サービスの終了によって生じた利用者の損害、損失、不利益等につき、理由の如何を問わず、一切の責任を負わないものとします。
                        </p>
                      </Grid>
                    </Grid>
                  </div>
                </div>
              </CardContent>
              <CardContent>
                <p>第16条&emsp;その他免責事項</p>
                <div className="pt-4 pl-4">
                  <div className="text-[16px] font-thin">
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">1</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">
                          .当社は、利用者が当社の責めに帰することのできない事由により本サービスをご利用になれなかったこと
                          当社が本規約の定めにより会員登録の承認をしなかったこと、本規約の定めに基づいて当社が会員登録を抹消したことまたは本規約の定めに基づいてサービスの予約・購入内容を無効にしたことにより利用者に発生した一切の損害について、いかなる責任も負わないものとします。
                        </p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">2</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">.当社は、利用者の登録内容に従い事務を処理することにより免責されるものとします。</p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">3</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">
                          .当社は、本サービスの利用により発生した利用者の損害一切に対し、当社に故意又は過失がある場合を除き（間接損害については当社に故意又は重過失がある場合を除き）、いかなる責任も負わないものとし、一切の損害賠償義務から免れるものとします。
                        </p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">4</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">
                          .利用者が、本サービスをご利用になることにより、他の利用者または第三者に対して損害等を与えた場合には、当該利用者は自己の責任と費用において解決し、当社には一切迷
                          惑を与えないものとします。
                        </p>
                      </Grid>
                    </Grid>
                  </div>
                </div>
              </CardContent>
              <CardContent>
                <p>第17条&emsp;その他</p>
                <div className="pt-4 pl-4">
                  <div className="text-[16px] font-thin">
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">1</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">.当社と利用者との連絡方法は原則として電話または電子メールによるものとします。</p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.2}>
                        <p className="font-thin">2</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">
                          .本サービスのご利用に関して、本利用規約により解決できない問題が生じた場合には、当社と利用者との間で双方誠意をもって話し合い、これを解決するものとします。
                        </p>
                      </Grid>
                    </Grid>
                  </div>
                </div>
              </CardContent>
            </div>
            {/* Mobile */}
            <div className="xsup:hidden">
              <CardContent>
                <div className="pt-2 ">
                  <p className="xs:!text-[14px]">第1条&emsp;本規約の範囲及び変更</p>
                  <div className="pt-4 pl-4">
                    <div className="text-[14px] font-thin">
                      <Grid container>
                        <Grid item xs={0.9}>
                          <p className="font-thin">1.</p>
                        </Grid>
                        <Grid item xs={11.1}>
                          <p className="font-thin">
                            本規約は本サービスの利用に関し、当社および会員（第３条で定義します）を含む本サービス利用者（以下「利用者」といいます）に適用されるものとします。なお、本サービスを利用される方は、以下の条件にご承諾いただいたことになります。
                          </p>
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item xs={0.9}>
                          <p className="font-thin">2.</p>
                        </Grid>
                        <Grid item xs={11.1}>
                          <p className="font-thin">
                            当社は、利用者に事前の承諾を得ることなく、適切な方法で利用者に通知することにより本規約を変更できるものとします。
                          </p>
                        </Grid>
                      </Grid>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardContent>
                <p className="xs:!text-[14px]">第2条&emsp;本サービスの利用</p>
                <div className="pt-4 pl-4 pb-4">
                  <div className="text-[14px] font-thin">
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">1.</p>
                      </Grid>
                      <Grid item xs={11.1}>
                        <p className="font-thin">利用者は、本規約および当社が別途定めるルール等に従い、本サービスを利用するものとします。</p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">2.</p>
                      </Grid>
                      <Grid item xs={11.1}>
                        <p className="font-thin">
                          当社は、利用者に事前の承諾を得ることなく、適切な方法で利用者に通知することにより本規約を変更できるものとします。
                        </p>
                      </Grid>
                    </Grid>
                  </div>
                </div>
              </CardContent>
              <div className="pt-2 pl-4 pb-4">
                <b className="w-[130px] h-[20px] xs:text-[14px] !text-[#0068B7]">＜第2章&emsp;会員＞</b>
              </div>
              <div>
                <hr />
              </div>
              <CardContent>
                <p className="xs:!text-[14px]">第3条&emsp;会員</p>
                <div className="pt-4 pl-4">
                  <div className="text-[14px] font-thin">
                    「会員」とは、本規約を承認いただいた上、当社所定の手続に従い会員登録を申請し、当社がこれを承認した方をいいます。
                  </div>
                </div>
              </CardContent>
              <CardContent>
                <p className="xs:!text-[14px]">第4条&emsp;会員登録</p>
                <div className="pt-4 pl-4 xs:!text-[14px]">
                  <Grid container>
                    <Grid item xs={0.9}>
                      <p className="font-thin">1.</p>
                    </Grid>
                    <Grid item xs={11.1}>
                      <p className="font-thin">会員登録希望者は、本サービスの会員登録ページから当社の指定する方法に従い登録申請を行うものとします。</p>
                    </Grid>
                  </Grid>
                  <Grid container>
                    <Grid item xs={0.9}>
                      <p className="font-thin">2.</p>
                    </Grid>
                    <Grid item xs={11.1}>
                      <p className="font-thin">当社は、以下の各号のいずれかに該当する場合、当該登録申請を承認しない場合があります。</p>
                    </Grid>
                  </Grid>
                  <Grid container>
                    <Grid item xs={0.9}>
                      <p className="font-thin">(1) </p>
                    </Grid>
                    <Grid item xs={11.1}>
                      <p className="font-thin">入会希望者が過去に本規約違反をしたことなどにより、会員登録の抹消などの処分をうけていることが判明した場合。</p>
                    </Grid>
                  </Grid>

                  <Grid container>
                    <Grid item xs={0.9}>
                      <p className="font-thin">(2) </p>
                    </Grid>
                    <Grid item xs={11.1}>
                      <p className="font-thin">会員希望者の申請内容に、虚偽の事項が含まれている場合</p>
                    </Grid>
                  </Grid>
                  <Grid container>
                    <Grid item xs={0.9}>
                      <p className="font-thin">(3) </p>
                    </Grid>
                    <Grid item xs={11.1}>
                      <p className="font-thin">その他登録申請を承認することが不適当であると当社が判断する場合</p>
                    </Grid>
                  </Grid>
                </div>
              </CardContent>
              <CardContent>
                <p className="xs:!text-[14px]">第5条&emsp;変更の届出</p>
                <div className="pt-4 pl-4">
                  <div className="text-[14px] font-thin">
                    会員は、住所、氏名、電話番号、その他当社に届け出ている事項に変更が生じた場合には、当社が別途定める方法により、すみやかに当社に届け出るものとします。
                  </div>
                </div>
              </CardContent>
              <CardContent>
                <p className="xs:!text-[14px]">第6条&emsp;本サービスの利用停止、会員登録の抹消</p>
                <div className="pt-4 pl-4">
                  <div className="text-[14px] font-thin">
                    当社は、会員が以下の各号のいずれかに該当する場合、会員に事前通知することなく本サービスの利用停止または会員登録を抹消することができるものとします。
                    この場合、当社はあそび場予約・オンライン購入サイトの提供中止に関し、利用者および第三者に対して一切責任を負わないものとします
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">1.</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">過去に本規約違反をしたことなどにより会員登録の抹消などの処分をうけていることが判明した場合</p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">2.</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">本サービスに関する料金などの支払債務の履行遅延、その他の不履行があった場合</p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">3.</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">第9条（禁止事項）の行為を行った場合</p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">4.</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">その他本規約に違反した場合</p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">5.</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">その他、本規約または商品等（第4章 第11条で定義します）の個別の予約・販売条件に違反した場合</p>
                      </Grid>
                    </Grid>
                  </div>
                </div>
              </CardContent>
              <CardContent>
                <p className="xs:!text-[14px]">第7条&emsp;メールアドレスおよびパスワードの管理</p>
                <div className="pt-4 pl-4">
                  <div className="text-[14px] font-thin">
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">1.</p>
                      </Grid>
                      <Grid item xs={11.1}>
                        <p className="font-thin">会員は、メールアドレスならびにパスワードの管理責任を負うものとします。</p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">2.</p>
                      </Grid>
                      <Grid item xs={11.1}>
                        <p className="font-thin">会員は、メールアドレスならびにパスワードを第三者に譲渡、貸与、開示してはならないものとします。</p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">3.</p>
                      </Grid>
                      <Grid item xs={11.1}>
                        <p className="font-thin">
                          会員は、メールアドレスならびにパスワードの管理不十分、使用上の過誤、第三者の使用などに起因する損害につき自ら責任を負うものとします。
                        </p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">4.</p>
                      </Grid>
                      <Grid item xs={11.1}>
                        <p className="font-thin">
                          会員は、メールアドレスならびにパスワードが第三者によって不正に使用されていることが判明した場合には、直ちに当社に連絡するものとします。
                        </p>
                      </Grid>
                    </Grid>
                  </div>
                </div>
              </CardContent>
              <CardContent>
                <p className="xs:!text-[14px]">第8条&emsp;プライバシーの考え方</p>
                <div className="pt-4 pl-4">
                  <div className="text-[14px] font-thin">
                    会員登録情報および当社が取得した利用者に関する情報は、当社のプライバシーの考え方に従って取り扱われます。当社のプライバシーの考え方はプライバシーポリシーをご覧ください。
                  </div>
                </div>
              </CardContent>
              <div className="pt-4 pl-4 pb-4">
                <b className="w-[130px] h-[20px] xs:!text-[14px] !text-[#0068B7]">＜第3章&emsp;サービスの利用＞</b>
              </div>
              <div>
                <hr />
              </div>
              <CardContent>
                <p className="xs:!text-[14px]">第9条&emsp;禁止事項</p>
                <div className="pt-4 pl-4">
                  <div className="text-[14px] font-thin">
                    利用者は以下の行為を行ってはならないものとします。 ご利用の際に虚偽の登録内容を申請する行為
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">1.</p>
                      </Grid>
                      <Grid item xs={11.1}>
                        <p className="font-thin">本サービスの運営を妨げ、その他本サービスに支障をきたすおそれがある行為</p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">2.</p>
                      </Grid>
                      <Grid item xs={11.1}>
                        <p className="font-thin">クレジットカードを不正使用して本サービスを利用する行為</p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">3.</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">
                          当社が明示して許可した場合を除き、本サービスを利用するユーザーとしての地位、本サービスを利用して取得した権利、その他本規約に基づく権利、義務の全部または一部を第三者に譲渡し、承継させ、または担保に供する一切の行為
                        </p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">4.</p>
                      </Grid>
                      <Grid item xs={11.1}>
                        <p className="font-thin">
                          営業行為／転売を目的として本サービスを利用する行為、営業行為／転売を行う第三者へ提供する目的で本サービスを利用する行為
                        </p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">5.</p>
                      </Grid>
                      <Grid item xs={11.1}>
                        <p className="font-thin">メールアドレスおよびパスワードを不正に使用する行為</p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">6.</p>
                      </Grid>
                      <Grid item xs={11.1}>
                        <p className="font-thin">他の利用者、第三者もしくは当社に迷惑、不利益もしくは損害を与える行為、またはそれらのおそれがある行為</p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">7.</p>
                      </Grid>
                      <Grid item xs={11.1}>
                        <p className="font-thin">
                          他の利用者、第三者もしくは当社の著作権、プライバシー、その他の一切の権利を侵害する行為、またはそれらのおそれがある行為
                        </p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">8.</p>
                      </Grid>
                      <Grid item xs={11.1}>
                        <p className="font-thin">公序良俗に反する行為その他法令に違反する行為、またはそれらのおそれがある行為</p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">9.</p>
                      </Grid>
                      <Grid item xs={11.1}>
                        <p className="font-thin">その他、当社が不適当であると判断する行為</p>
                      </Grid>
                    </Grid>
                  </div>
                </div>
              </CardContent>
              <CardContent>
                <p className="xs:!text-[14px]">第10条&emsp;著作物の利用</p>
                <div className="pt-4 pl-4">
                  <div className="text-[14px] font-thin">
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">1.</p>
                      </Grid>
                      <Grid item xs={11.1}>
                        <p className="font-thin">
                          利用者は、本サービスを通じて提供されるいかなる画像、写真等の著作物について、権利者の許諾を得ないで、著作権法で認められる個人の私的複製等著作権の制限規定範囲外での使用をすることはできません。
                        </p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">2.</p>
                      </Grid>
                      <Grid item xs={11.1}>
                        <p className="font-thin">
                          本条の規定に違反して権利者との間で問題が生じた場合、利用者は自己の責任と費用においてかかる問題を解決するとともに、当社に何等の迷惑または損害を与えないものとします。
                        </p>
                      </Grid>
                    </Grid>
                  </div>
                </div>
              </CardContent>
              <div className="pt-4 pl-4 pb-4">
                <b className="w-[130px] h-[20px] xs:!text-[14px] !text-[#0068B7]">＜第4章&emsp;商品等の予約および購入＞</b>
              </div>
              <div>
                <hr />
              </div>
              <CardContent>
                <p className="xs:!text-[14px]">第11条&emsp;商品等の購入</p>
                <div className="pt-4 pl-4">
                  <div className="text-[14px] font-thin">
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">1.</p>
                      </Grid>
                      <Grid item xs={11.1}>
                        <p className="font-thin">
                          利用者は、本サービスを利用して当社から商品またはサービス（以下「商品等」といいます）を予約・購入することができます。
                        </p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">2.</p>
                      </Grid>
                      <Grid item xs={11.1}>
                        <p className="font-thin">
                          利用者は、商品等の予約・購入を希望する場合、別途当社が定める方法に従って商品等の予約・購入を申し込むものとします
                        </p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">3.</p>
                      </Grid>
                      <Grid item xs={11.1}>
                        <p className="font-thin">
                          前項の申し込みに対して、当社からの商品等の予約・購入を承諾する旨の利用者宛て電子メールを利用者が受領した時点で利用者と当社との間に当該商品等に関する予約・購入の売買契約が成立するものとします。ただし、
                        </p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">4.</p>
                      </Grid>
                      <Grid item xs={11.1}>
                        <p className="font-thin">
                          前項の規定に関わらず、本サービス利用に関して不正行為または不適当な行為があった場合または当社が本規約に基づき会員登録を抹消した場合、当社は売買契約を取り消しもしくは解除、その他適切な措置を取ることができるものとします。
                        </p>
                      </Grid>
                    </Grid>
                  </div>
                </div>
              </CardContent>
              <CardContent>
                <p className="xs:!text-[14px]">第12条&emsp;決済方法</p>
                <div className="pt-4 pl-4">
                  <div className="text-[14px] font-thin">
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">1.</p>
                      </Grid>
                      <Grid item xs={11.1}>
                        <p className="font-thin">商品等のお支払金額は、商品等購入代金、取り扱い手数料および消費税等の合計となります。</p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">2.</p>
                      </Grid>
                      <Grid item xs={11.1}>
                        <p className="font-thin">
                          本サービスによって購入された商品等のお支払いに関しては、会員本人名義のクレジットカードによるお支払い、その他当社が別途認めるお支払方法によるものとします。
                        </p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">3.</p>
                      </Grid>
                      <Grid item xs={11.1}>
                        <p className="font-thin">
                          クレジットカードでのお支払いの場合は、利用者が当該クレジットカード会社との間で別途契約する条件に従うものとします。なお、利用者と当該クレジットカード会社等の間で紛争が発生した場合は、当該当事者双方で解決するものとし、当社には一切責任はないものとします。
                        </p>
                      </Grid>
                    </Grid>
                  </div>
                </div>
              </CardContent>
              <CardContent>
                <p className="xs:!text-[14px]">第13条&emsp;商品等のキャンセル</p>
                <div className="pt-4 pl-4">
                  <div className="text-[14px] font-thin">
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">1.</p>
                      </Grid>
                      <Grid item xs={11.08}>
                        <p className="font-thin">商品等のキャンセルは、商品等の不適合、その他当社が別途認める場合を除き、できないものとします。</p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">2.</p>
                      </Grid>
                      <Grid item xs={11.1}>
                        <p className="font-thin">ユーザーは、前項のキャンセルを、当社が別途定める方法に従い行うものとします。</p>
                      </Grid>
                    </Grid>
                  </div>
                </div>
              </CardContent>
              <div className="pt-4 pb-4">
                <b className="w-[130px] h-[20px] xs:!text-[15px] !text-[#0068B7]">＜第5章 本サービスの運用＞</b>
              </div>
              <div>
                <hr />
              </div>
              <CardContent>
                <p className="xs:!text-[14px]">第14条&emsp;本サービスの保守</p>
                <div className="pt-4 pl-4">
                  <div className="text-[14px] font-thin">
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">1.</p>
                      </Grid>
                      <Grid item xs={11.1}>
                        <p className="font-thin">
                          システムの定期保守および緊急保守の場合 天災、火災、停電等の不可抗力、第三者による妨害行為等により、 システムの運用が困難になった場合
                        </p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">2.</p>
                      </Grid>
                      <Grid item xs={11.1}>
                        <p className="font-thin">システムの不具合、故障等による場合 その他</p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">3.</p>
                      </Grid>
                      <Grid item xs={11.1}>
                        <p className="font-thin">システムの停止が必要と当社が判断した場合</p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">4.</p>
                      </Grid>
                      <Grid item xs={11.1}>
                        <p className="font-thin">その他、システムの停止が必要と当社が判断した場合</p>
                      </Grid>
                    </Grid>
                  </div>
                </div>
              </CardContent>
              <CardContent>
                <p className="xs:!text-[14px]">第15条&emsp;本サービスの終了</p>
                <div className="pt-4 pl-4">
                  <div className="text-[14px] font-thin">
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">1.</p>
                      </Grid>
                      <Grid item xs={11.1}>
                        <p className="font-thin">
                          当社は、利用者に対し１ヶ月以上前に当社が定める方法に従って通知することにより、本サービスの提供を終了することができるものとします。
                        </p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">2.</p>
                      </Grid>
                      <Grid item xs={11.1}>
                        <p className="font-thin">
                          当社は、本サービスの終了によって生じた利用者の損害、損失、不利益等につき、理由の如何を問わず、一切の責任を負わないものとします。
                        </p>
                      </Grid>
                    </Grid>
                  </div>
                </div>
              </CardContent>
              <CardContent>
                <p className="xs:!text-[14px]">第16条&emsp;その他免責事項</p>
                <div className="pt-4 pl-4">
                  <div className="text-[14px] font-thin">
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">1.</p>
                      </Grid>
                      <Grid item xs={11.1}>
                        <p className="font-thin">
                          当社は、利用者が当社の責めに帰することのできない事由により本サービスをご利用になれなかったこと
                          当社が本規約の定めにより会員登録の承認をしなかったこと、本規約の定めに基づいて当社が会員登録を抹消したことまたは本規約の定めに基づいてサービスの予約・購入内容を無効にしたことにより利用者に発生した一切の損害について、いかなる責任も負わないものとします。
                        </p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">2.</p>
                      </Grid>
                      <Grid item xs={11.1}>
                        <p className="font-thin">当社は、利用者の登録内容に従い事務を処理することにより免責されるものとします。</p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">3.</p>
                      </Grid>
                      <Grid item xs={11.1}>
                        <p className="font-thin">
                          当社は、本サービスの利用により発生した利用者の損害一切に対し、当社に故意又は過失がある場合を除き（間接損害については当社に故意又は重過失がある場合を除き）、いかなる責任も負わないものとし、一切の損害賠償義務から免れるものとします。
                        </p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">4.</p>
                      </Grid>
                      <Grid item xs={11.1}>
                        <p className="font-thin">
                          利用者が、本サービスをご利用になることにより、他の利用者または第三者に対して損害等を与えた場合には、当該利用者は自己の責任と費用において解決し、当社には一切迷
                          惑を与えないものとします。
                        </p>
                      </Grid>
                    </Grid>
                  </div>
                </div>
              </CardContent>
              <CardContent>
                <p className="xs:!text-[14px]">第17条&emsp;その他</p>
                <div className="pt-4 pl-4">
                  <div className="text-[14px] font-thin">
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">1.</p>
                      </Grid>
                      <Grid item xs={11.1}>
                        <p className="font-thin">当社と利用者との連絡方法は原則として電話または電子メールによるものとします。</p>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={0.9}>
                        <p className="font-thin">2.</p>
                      </Grid>
                      <Grid item xs={11.1}>
                        <p className="font-thin">
                          本サービスのご利用に関して、本利用規約により解決できない問題が生じた場合には、当社と利用者との間で双方誠意をもって話し合い、これを解決するものとします。
                        </p>
                      </Grid>
                    </Grid>
                  </div>
                </div>
              </CardContent>
            </div>

            {/* Footer */}
            <div className="pl-4 pt-12">
              <p className="font-thin xs:text-[14px]">
                2022年10月1日 <br></br>株式会社ボーネルンド
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-12 pl-4 pr-4 mb-[60px]">
          <Button type="button" variant="contained" className="w-[400px] h-[64px]" onClick={handleBack}>
            戻る
          </Button>
        </div>
      </div>
    </Layout>
  );
}
