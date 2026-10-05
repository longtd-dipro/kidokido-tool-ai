import Image from "next/legacy/image";
import { useState } from "react";
import { useRouter } from "next/router";

import UserCreditCardItem from "components/User/UserCreditCardItem";
import Error from "components/common/Error";
import Spinner from "components/common/Spinner";
import { UserCreditCard } from "models/Booking";
import CreditCardImage from "statics/images/user/credit-card.svg";
import WarningDialog from "components/common/WarningDialog";
import { ROUTE } from "constants/route";
import { deleteCreditCard } from "services/api-client/user.service";

type Props = {
  card: UserCreditCard;
};

export default function UserCreditCards({ card }: Props) {
  const router = useRouter();

  const [isShowWarningDialog, setIsShowWarningDialog] = useState<boolean>(false);
  const [errMsg, setErrMsg] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);

  const showWarningDialog = () => {
    setIsShowWarningDialog(true);
  };

  const hideWarningDialog = () => {
    setIsShowWarningDialog(false);
  };

  const handleDeleteCredit = async () => {
    try {
      setErrMsg("");
      setLoading(true);

      await deleteCreditCard(card.CardSeq);

      router.push(ROUTE.USER_DELETE_CREDIT_CARD_SUCCESS);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setIsShowWarningDialog(false);
      setLoading(false);
    }
  };

  return (
    <div className="mb-10">
      {/* Heading */}
      <div className="relative flex flex-row items-center justify-between gap-4 py-6 pl-4 bg-[#fafafa] xs:py-3">
        <div className="flex items-center justify-center gap-x-5">
          <Image src={CreditCardImage} alt="credit card image" />
          <span className="text-2xl font-medium text-blue-color xs:text-base">お支払い方法</span>
        </div>

        <div className="flex items-center justify-center gap-x-16 xs:gap-4">
          <div className="relative z-10 text-base font-bold cursor-pointer text-blue-color xs:hidden">
            <button onClick={showWarningDialog}>削除</button>
            <div className="absolute left-[4rem] top-0 h-[26px] w-0 border border-[#313131] z-10"></div>
          </div>

          {/* Desktop */}
          <a
            href={ROUTE.USER_EDIT_CREDIT_CARD}
            className="xs:hidden z-10 px-6 py-2 mr-4 text-base font-bold text-white rounded-full cursor-pointer bg-blue box-shadow"
          >
            確認/編集
          </a>

          {/* Mobile */}
          <a
            href={ROUTE.USER_EDIT_CREDIT_CARD}
            className="xsup:hidden z-10 px-6 py-2 mr-4 text-base font-bold text-white rounded-full cursor-pointer bg-blue box-shadow"
          >
            編集
          </a>
        </div>
        <div className="absolute inset-0 border-b-2 border-dotted border-[#979797]"></div>
      </div>

      {/* Body */}
      <div className="flex flex-col xs:w-full max-w-[800px] justify-center">
        <div className="w-full mt-6 px-5 xs:px-0">
          <div className="mt-4 px-4 xs:px-0 xs:mt-0">
            {!loading && card && <UserCreditCardItem className="mb-6" card={card} />}

            {/* Loading */}
            {loading && (
              <div className="flex justify-center my-5">
                <Spinner />
              </div>
            )}

            <div className="xsup:hidden">
              <div className="text-base font-medium cursor-pointer text-blue-color text-center">
                <button onClick={showWarningDialog}>カードを削除する</button>
              </div>
            </div>

            {/*Error*/}
            <Error message={errMsg} />
          </div>
        </div>
      </div>

      {/*Delete Confirm Popup*/}
      {isShowWarningDialog && (
        <WarningDialog text="削除" message={"カード情報を削除します。よろしいですか？"} onDismiss={hideWarningDialog} onAccept={handleDeleteCredit} />
      )}
    </div>
  );
}
