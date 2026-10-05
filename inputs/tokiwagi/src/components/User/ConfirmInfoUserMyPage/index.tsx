import moment from "moment";

import styles from "styles/signup-user.module.scss";
import Error from "components/common/Error";
import Button from "components/common/Buttons/Button";
import { SHORT_DATE, NEWS_LETTER_OPTIONS, JP_SHORT_DATE } from "constants/common";
import { UserForm } from "models/UserForm";
import { getProvinceName, getUserGenderLabel } from "utils/user";

interface Props {
  onHide: () => void;
  onSubmit: () => void;
  data: UserForm;
  message: string;
  textConfirm?: string;
}

export default function ConfirmInfoUserMyPage({ data, onHide, onSubmit, message, textConfirm }: Props) {
  const allowedNewsletter = NEWS_LETTER_OPTIONS.find((item) => item.value === data?.allowedNewsletter)?.label;
  const gender = getUserGenderLabel(data?.gender);
  const birthday = data?.birthday ? moment(data.birthday).format(SHORT_DATE) : "";

  return (
    <section className="flex flex-col gap-[48px] relative max-w-[800px] mt-[40px] xsup:mb-[250px] mx-auto">
      <div className="flex flex-col xs:w-full max-w-[800px] justify-center">
        <div className="relative">
          {/* Basic Information */}
          <div className="w-full mt-6 px-5 relative">
            <div className="mt-8 px-4">
              <div className="grid grid-cols-2 text-sm mb-2">
                <label className={`${styles.info__content}`}>お名前</label>
                <span className={`${styles.info__data} break-words`}>
                  {data?.lastName} {data?.firstName}
                </span>
              </div>
              <div className="grid grid-cols-2 text-sm mb-2">
                <label className={`${styles.info__content}`}>お名前（カナ）</label>
                <span className={`${styles.info__data} break-words`}>
                  {data?.lastNameFurigana} {data?.firstNameFurigana}
                </span>
              </div>
              <div className="grid grid-cols-2 text-sm mb-2">
                <label className={`${styles.info__content}`}>性別</label>
                <span className={`${styles.info__data}`}>{gender}</span>
              </div>
              <div className="grid grid-cols-2 text-sm mb-2">
                <label className={`${styles.info__content}`}>生年月日</label>
                <span className={`${styles.info__data}`}>{birthday ? moment(birthday).format(JP_SHORT_DATE) : ""}</span>
              </div>
              <div className="grid grid-cols-2 text-sm mb-2">
                <label className={`${styles.info__content}`}>電話番号</label>
                <span className={`${styles.info__data} break-words`}>{data?.phone}</span>
              </div>
              <div className="grid grid-cols-2 text-sm mb-2">
                <label className={`${styles.info__content}`}>郵便番号</label>
                <span className={`${styles.info__data}`}>{data?.postCode}</span>
              </div>
              <div className="grid grid-cols-2 text-sm mb-2">
                <label className={`${styles.info__content}`}>住所</label>
                <span className={`${styles.info__data} break-words`}>{data?.province && `${getProvinceName(data.province)}${data?.address}`}</span>
              </div>
              <div className="grid grid-cols-2 text-sm mb-2">
                <label className={`${styles.info__content}`}>メールアドレス</label>
                <span className={`${styles.info__data} break-words`}>{data?.email}</span>
              </div>
              <div className="grid grid-cols-2 text-sm mb-9 xs:gap-[10px]">
                <label className={`${styles.info__content}`}>ボーネルンドからの情報</label>
                <span className={`${styles.info__data} break-words`}>{allowedNewsletter}</span>
              </div>
            </div>
          </div>
          <div className="absolute top-[18.5rem] left-0 bottom-0 right-0 border-b-2 border-dotted border-[#979797] xs:mx-5"></div>
        </div>
        <div className="flex xs:flex-col-reverse xs:gap-0 items-center justify-between mt-14">
          {/*Back*/}
          <Button type="submit" variant="outlined" onClick={onHide} className="w-[300px] h-[64px] mdonly:w-[260px]  mdonly:h-[48px] xs:!mt-4">
            戻る
          </Button>

          {/*Submit*/}
          <Button type="submit" variant="contained" onClick={onSubmit} className="w-[300px] h-[64px] xs:text-[20px] mdonly:w-[260px]  mdonly:h-[48px]">
            {textConfirm || "次へ"}
          </Button>
        </div>
        <div className="flex justify-center text-center mt-4 mx-5">
          <Error message={message} />
        </div>
      </div>
    </section>
  );
}
