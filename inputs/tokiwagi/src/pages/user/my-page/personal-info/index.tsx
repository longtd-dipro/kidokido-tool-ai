import moment from "moment";
import Image from "next/legacy/image";
import { useEffect, useState } from "react";

import UserCreditCards from "components/User/UserCreditCards";
import Error from "components/common/Error";
import Spinner from "components/common/Spinner";
import UserLayout from "components/common/UserLayout";
import { JP_SHORT_DATE, NEWS_LETTER_OPTIONS, ROLE } from "constants/common";
import { ROUTE } from "constants/route";
import { withAuthentication } from "libs/hoc/withAuthentication";
import { User } from "models/Entity";
import { fetchCreditCard, fetchUser } from "services/api-client/user.service";
import UnlockImage from "statics/images/user/icon-unlock.svg";
import UserSideActiveImage from "statics/images/user/user-active.svg";
import { getIncludedProvinceAddress, getUserGenderLabel } from "utils/user";
import { UserCreditCard } from "models/Booking";

function PersonalInfo() {
  const [user, setUser] = useState<User>();
  const [userCreditCard, setUserCreditCard] = useState<UserCreditCard>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errMsg, setErrMsg] = useState<string>();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setErrMsg("");
      setLoading(true);

      const [user, card] = await Promise.all([fetchUser(), fetchCreditCard()]);

      setUser(user);
      setUserCreditCard(card);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserLayout
      title="マイページ"
      breadcrumbItems={[
        { label: "トップ", href: ROUTE.INDEX },
        { label: "アカウント情報の確認・編集", href: ROUTE.USER_PERSONAL_INFO },
      ]}
    >
      <section className="container w-full mx-auto lg:max-w-5xl mdonly:pl-12 mdonly:pr-4 xs:px-5">
        {/*Error*/}
        <Error message={errMsg} />
        {/* Account Information */}
        <div className="mb-8">
          {/* Heading */}
          <div className="relative flex flex-row items-center justify-between gap-4 py-6 pl-4 bg-[#fafafa] xs:py-3">
            <div className="flex items-center justify-center gap-x-5">
              <Image src={UserSideActiveImage} alt={UserSideActiveImage} />
              <span className="text-2xl font-medium text-blue-color xs:text-base">アカウント情報</span>
            </div>
            <a
              href={ROUTE.USER_EDIT_ACCOUNT}
              className="z-10 px-6 py-2 mr-4 text-base font-bold text-white rounded-full cursor-pointer bg-blue box-shadow">
              編集
            </a>
            <div className="absolute inset-0 border-b-2 border-dotted border-[#979797]"></div>
          </div>

          {/* Body */}
          {user && (
            <div className="flex flex-col xs:w-full max-w-[800px] justify-center">
              <div className="w-full mt-6 px-5 xs:px-0">
                <div className="mt-4 px-4 xs:px-0 xs:mt-0">
                  <div className="grid grid-cols-2 text-sm mb-2">
                    <label className="text-xl font-medium xs:text-base">お名前</label>
                    <span className="break-words text-base font-light xs:text-sm">
                      {user?.lastName} {user?.firstName}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 text-sm mb-2">
                    <label className="text-xl xs:text-base">お名前（カナ）</label>
                    <span className="break-words text-base font-light xs:text-sm">
                      {user?.lastNameFurigana} {user?.firstNameFurigana}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 text-sm mb-2">
                    <label className="text-xl font-medium xs:text-base">性別</label>
                    <span className="break-words text-base font-light xs:text-sm">{getUserGenderLabel(user?.gender)}</span>
                  </div>
                  <div className="grid grid-cols-2 text-sm mb-2">
                    <label className="text-xl font-medium xs:text-base">生年月日</label>
                    <span className="break-words text-base font-light xs:text-sm">{user?.birthday ? moment(user?.birthday).format(JP_SHORT_DATE) : ""}</span>
                  </div>
                  <div className="grid grid-cols-2 text-sm mb-2">
                    <label className="text-xl font-medium xs:text-base">電話番号</label>
                    <span className="break-words text-base font-light xs:text-sm">{user?.phone}</span>
                  </div>
                  <div className="grid grid-cols-2 text-sm mb-2">
                    <label className="text-xl font-medium xs:text-base">郵便番号</label>
                    <span className="break-words text-base font-light xs:text-sm">{user?.postCode}</span>
                  </div>
                  <div className="grid grid-cols-2 text-sm mb-2">
                    <label className="text-xl font-medium xs:text-base">住所</label>
                    <span className="break-words text-base font-light xs:text-sm">{getIncludedProvinceAddress(user)}</span>
                  </div>
                  <div className="grid grid-cols-2 text-sm mb-2">
                    <label className="text-xl font-medium xs:text-base">メールアドレス</label>
                    <span className="break-words text-base font-light xs:text-sm">{user?.email}</span>
                  </div>
                  <div className="grid grid-cols-2 text-sm mb-9">
                    <label className="text-xl font-medium xs:text-base xs:pr-[10px]">ボーネルンドからの情報</label>
                    <span className="break-words text-base font-light xs:text-sm grow">
                      {NEWS_LETTER_OPTIONS.find((item) => item?.value === user?.allowedNewsletter)?.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center my-5">
            <Spinner />
          </div>
        )}

        {/* Payment Credit */}
        {userCreditCard?.CardNo && <UserCreditCards card={userCreditCard} />}

        {/* Change Password */}
        {user?.password && (
          <>
            {/* Heading */}
            <div className="relative flex flex-row items-center justify-between gap-4 py-6 pl-4 bg-[#fafafa] xs:py-3">
              <div className="flex items-center justify-center gap-x-5">
                <Image src={UnlockImage} alt={UnlockImage} />
                <span className="text-2xl font-medium text-blue-color xs:text-base">ログイン情報</span>
              </div>
              <div className="flex items-center justify-center gap-x-16 ">
                {/* Desktop */}
                <a
                  href={ROUTE.USER_CHANGE_PASSWORD}
                  className="xs:hidden z-10 px-6 py-2 mr-4 text-base font-bold text-white rounded-full cursor-pointer bg-blue box-shadow">
                  パスワード変更
                </a>

                {/* Mobile */}
                <a
                  href={ROUTE.USER_CHANGE_PASSWORD}
                  className="xsup:hidden z-10 px-6 py-2 mr-4 text-base font-bold text-white rounded-full cursor-pointer bg-blue box-shadow">
                  編集
                </a>
              </div>
              <div className="absolute inset-0 border-b-2 border-dotted border-[#979797]"></div>
            </div>
            {/* Body */}
            <div className="flex flex-col xs:w-full max-w-[800px] justify-center mb-10">
              <div className="w-full mt-6 px-5 xs:px-0">
                <div className="mt-4 px-4 xs:px-0 xs:mt-0">
                  <div className="grid grid-cols-2 text-sm mb-4 xs:mb-2">
                    <label className="text-xl font-medium xs:text-base">ログインID</label>
                    <span className="break-words text-base font-light xs:text-sm">{user && user ? user.email : "" || user ? user.phone : ""}</span>
                  </div>
                  <div className="grid grid-cols-2 text-sm">
                    <label className="text-xl font-medium xs:text-base">パスワード</label>
                    <span className="break-words text-base font-light xs:text-sm">{Math.random().toString(36).slice(-8).replace(/./gi, "*")}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </UserLayout>
  );
}

export default withAuthentication(PersonalInfo, [ROLE.USER]);
