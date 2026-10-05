import moment from "moment";

import AdminButton from "components/common/Buttons/AdminButton";
import { JP_SHORT_DATE, NEWS_LETTER_OPTIONS } from "constants/common";
import Error from "components/common/Error";
import { getProvinceName, getUserGenderLabel } from "utils/user";

type UserFormData = {
  id?: number;
  lastName: string;
  firstName: string;
  lastNameFurigana: string;
  firstNameFurigana: string;
  email: string;
  confirmationEmail: string;
  password: string;
  confirmationPassword: string;
  phone: string;
  postCode: string;
  province: string;
  address: string;
  gender?: boolean | string;
  birthday?: Date;
  allowedNewsletter?: boolean;
};

type Props = {
  user?: UserFormData;
  message?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
};

const ConfirmInfoUserAdmin = ({ user, message, onCancel, onSuccess }: Props) => {
  return (
    <div className="ad-section-container">
      {/*Data */}
      {user && (
        <div className="flex flex-col items-center justify-center max-w-[563px] mdonly:w-full mdonly:pl-4 mdonly:pr-4  mx-auto ad-text-color">
          <h1 className="my-4 mt-9 text-xl font-bold text-center">ユーザー詳細</h1>
          <div className="w-full mt-4">
            <h2 className="pb-2 text-xl font-medium">ログイン情報</h2>
            <div className="border border-[#D9D9D9]"></div>
            <div className="flex mx-4 my-8 gap-20">
              <div className="flex flex-col gap-4">
                <p>メールアドレス</p>
                <p>パスワード</p>
              </div>
              <div className="flex flex-col gap-4">
                <p className="font-bold">{user.email ? user.email : ""}</p>
                <p className="font-bold">*********</p>
              </div>
            </div>
          </div>

          <div className="w-full mt-4 mb-4">
            <h2 className="pb-2 text-xl font-medium">基本情報</h2>
            <div className="border border-[#D9D9D9]"></div>
            <div className="grid text-base font-medium mx-4 my-8">
              <div className="grid grid-cols-2 gap-4">
                <p>お名前</p>
                <span className="max-w-[244px] font-bold">
                  {user.lastName ? user.lastName : ""} {user.firstName ? user.firstName : ""}
                </span>
                <p>お名前（カナ）</p>
                <span className="max-w-[244px] font-bold">
                  {user.lastNameFurigana ? user.lastNameFurigana : ""} {user.firstNameFurigana ? user.firstNameFurigana : ""}
                </span>
                <p>性別</p>
                <span className="break-words max-w-[144px] font-bold">{getUserGenderLabel(user.gender)}</span>
                <p>電話番号</p>
                <span className="break-words max-w-[144px] font-bold">{user.phone ? user.phone : ""}</span>
                <p>郵便番号</p>
                <span className="break-words max-w-[144px] font-bold">{user.postCode ? user.postCode : ""}</span>
                <p>住所</p>
                <span className="break-words max-w-[144px] font-bold">{user.address ? `${getProvinceName(user.province)}${user.address}` : ""}</span>
                <p>生年月日</p>
                <span className="break-words max-w-[144px] font-bold">{user.birthday ? moment(user.birthday).format(JP_SHORT_DATE) : ""}</span>
                <p>ボーネルンドからの情報</p>
                <span className="break-words max-w-[144px] font-bold">
                  {user.allowedNewsletter && NEWS_LETTER_OPTIONS.find((item) => item.value === user.allowedNewsletter).label}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-x-20 mb-6">
            <AdminButton onClick={onCancel} type="button" variant="outlined" className="w-[230px] h-[56px] mdonly:w-[170px] mdup:w-[170px] !font-bold">
              キャンセル
            </AdminButton>

            <AdminButton onClick={onSuccess} type="button" variant="contained" className="w-[230px] h-[56px] mdonly:w-[170px] mdup:w-[170px] !font-bold">
              次へ
            </AdminButton>
          </div>
          <div className="flex justify-center mb-6">
            <Error message={message} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfirmInfoUserAdmin;
