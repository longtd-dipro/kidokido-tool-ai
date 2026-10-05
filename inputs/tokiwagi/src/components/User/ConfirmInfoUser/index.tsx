import moment from "moment";
import { useEffect } from "react";
import { Grid } from "@mui/material";

import styles from "styles/signup-user.module.scss";
import Button from "components/common/Buttons/Button";
import { SHORT_DATE, NEWS_LETTER_OPTIONS, JP_SHORT_DATE } from "constants/common";
import { UserForm } from "models/UserForm";
import Error from "components/common/Error";
import { getProvinceName, getUserGenderLabel } from "utils/user";

interface Props {
  onHide: () => void;
  onSubmit: () => void;
  data: UserForm;
  message: string;
}

export default function ConfirmInfoUser({ data, onHide, onSubmit, message }: Props) {
  const allowedNewsletter = NEWS_LETTER_OPTIONS.find((item) => item.value === data?.allowedNewsletter)?.label;
  const gender = getUserGenderLabel(data?.gender);
  const birthday = data?.birthday ? moment(data.birthday).format(SHORT_DATE) : "";
  const password = data?.password ? data.password.replace(/./gi, "*") : "";

  useEffect(() => {
    if (window.pageYOffset > 0) window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return (
    <section className="flex flex-col gap-[48px] xsup:w-[688px] mdup:max-w-[800px] xs:px-5 mt-[40px] xsup:mb-[250px] mx-auto">
      <div className="flex flex-col xs:w-full max-w-[800px] justify-center">
        <div className="relative">
          <div className="flex flex-col items-center justify-center">
            <span className="usr-title-line text-center xs:!text-[26px]">お客様情報の確認</span>
          </div>
          {/* Login Information */}
          <div className="w-full mt-12">
            <div className="flex flex-col">
              <span className={`${styles.heading__info}`}>ログイン情報</span>
              <div className="flex pt-4 xs:pt-6">
                <div className={`${styles.info__line} max-w-[500px] flex-1 p-0`} />
                <div className={`${styles.info__line__2} max-w-[300px] flex-1 p-0`} />
              </div>
            </div>
            <div className="flex xs:gap-[30px] gap-[180px] xs:mt-[26px] mt-6 xsup:p-4">
              <div className="flex w-full flex-col gap-4 ">
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <label className={`${styles.info__content}`}>メールアドレス</label>
                  </Grid>
                  <Grid item xs={6} spacing={3}>
                    <span className={`${styles.info__data} break-words`}>{data?.email}</span>
                  </Grid>
                </Grid>
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <label className={`${styles.info__content}`}>パスワード</label>
                  </Grid>
                  <Grid item xs={6} spacing={3}>
                    <span className={`${styles.info__data} break-words`}>{password}</span>
                  </Grid>
                </Grid>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="w-full mt-6">
            <div className="flex flex-col">
              <span className={`${styles.heading__info}`}>基本情報</span>
              <div className="flex pt-4 xs:pt-6">
                <div className={`${styles.info__line} max-w-[500px] flex-1 p-0`} />
                <div className={`${styles.info__line__2} max-w-[300px] flex-1 p-0`} />
              </div>
            </div>
            <div className="flex xs:gap-[30px] gap-[100px] xs:mt-[26px] mt-8 xsup:p-4">
              <div className="flex flex-col gap-4 w-full">
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <label className={`${styles.info__content}`}>お名前</label>
                  </Grid>
                  <Grid item xs={6} spacing={3}>
                    <span className={`${styles.info__data} break-words`}>
                      {data?.lastName} {data?.firstName}
                    </span>
                  </Grid>
                </Grid>
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <label className={`${styles.info__content}`}>お名前（カナ）</label>
                  </Grid>
                  <Grid item xs={6} spacing={2}>
                    <span className={`${styles.info__data} break-words`}>
                      {data?.lastNameFurigana} {data?.firstNameFurigana}
                    </span>
                  </Grid>
                </Grid>
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <label className={`${styles.info__content}`}>性別</label>
                  </Grid>
                  <Grid item xs={6}>
                    <span className={`${styles.info__data} h-[24px]`}>{gender ? gender : " "}</span>
                  </Grid>
                </Grid>
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <label className={`${styles.info__content}`}>生年月日</label>
                  </Grid>
                  <Grid item xs={6}>
                    <span className={`${styles.info__data} h-[24px]`}>{birthday ? moment(birthday).format(JP_SHORT_DATE) : " "}</span>
                  </Grid>
                </Grid>
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <label className={`${styles.info__content}`}>電話番号</label>
                  </Grid>
                  <Grid item xs={6}>
                    <span className={`${styles.info__data} break-words`}>{data?.phone}</span>
                  </Grid>
                </Grid>
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <label className={`${styles.info__content}`}>郵便番号</label>
                  </Grid>
                  <Grid item xs={6}>
                    <span className={`${styles.info__data}`}>{data?.postCode}</span>
                  </Grid>
                </Grid>
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <label className={`${styles.info__content}`}>住所</label>
                  </Grid>
                  <Grid item xs={6}>
                    <span className={`${styles.info__data} break-words`}>{data?.province && `${getProvinceName(data.province)}${data?.address}`}</span>
                  </Grid>
                </Grid>
                <Grid container className="xs:!hidden" spacing={3}>
                  <Grid item xs={6}>
                    <label className={`${styles.info__content}`}>ボーネルンドからの情報</label>
                  </Grid>
                  <Grid item xs={6}>
                    <span className={`${styles.info__data} h-[24px] break-words`}>{allowedNewsletter ? allowedNewsletter : " "}</span>
                  </Grid>
                </Grid>
                <Grid container className="xsup:!hidden">
                  <Grid item xs={6.5}>
                    <label className={`${styles.info__content}`}>ボーネルンドからの情報</label>
                  </Grid>
                  <Grid item xs={5.5}>
                    <span className={`${styles.info__data} h-[24px] break-words`}>{allowedNewsletter ? allowedNewsletter : " "}</span>
                  </Grid>
                </Grid>
              </div>
            </div>
          </div>
        </div>
        <div className="flex xs:flex-col-reverse xs:gap-0 items-center justify-between xs:mt-[38px] mt-7">
          {/*Back*/}
          <Button
            type="submit"
            variant="outlined"
            onClick={onHide}
            className="xs:w-[290px] xs:!mt-4 mdonly:w-[260px] md:h-12 md:!text-[18px] w-[300px] h-[64px]"
          >
            戻る
          </Button>

          {/*Submit*/}
          <Button type="submit" variant="contained" onClick={onSubmit} className="xs:w-[290px] mdonly:w-[260px] md:h-12 md:!text-[18px] w-[300px] h-[64px]">
            メールを送信する
          </Button>
        </div>
        <div className="flex justify-center text-center mt-4 mx-5">
          <Error message={message} />
        </div>
      </div>
    </section>
  );
}
