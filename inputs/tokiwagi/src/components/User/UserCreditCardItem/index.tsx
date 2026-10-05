import moment from "moment";

import { CREDIT_CARD_EXPIRE_FORMAT, CREDIT_CARD_EXPIRE_INPUT_FORMAT } from "constants/common";
import { UserCreditCard } from "models/Booking";

type Props = {
  card: UserCreditCard;
  className?: string;
};

export default function UserCreditCardItem({ card, className }: Props) {
  return (
    <div className={`${className}`}>
      <div className="grid grid-cols-2">
        <div>
          <label className="text-xl font-medium xs:text-base block mb-4">カード名義人</label>
          <label className="text-xl font-medium xs:text-base block mb-4">通常使うカード</label>
        </div>

        <div>
          <span className="break-words text-base font-light xs:text-sm block mb-4">{`${card?.HolderName ? card?.HolderName : ""}`}</span>
          <div className="flex gap-x-8 text-base font-light break-words xs:text-sm xs:flex-col xs:gap-2 mb-4">
            <p>{`${card?.CardNo ? "下3桁" + card?.CardNo.slice(-3) : ""}`} </p>
            <p>{`${card?.Expire ? "有効期限 " + moment(card?.Expire, CREDIT_CARD_EXPIRE_FORMAT).format(CREDIT_CARD_EXPIRE_INPUT_FORMAT) : ""}`}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
