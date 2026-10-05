import { TextField } from "@mui/material";
import Image from "next/legacy/image";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import moment from "moment";

import Label from "components/common/Admin/Label";
import Button from "components/common/Buttons/Button";
import Error from "components/common/Error";
import DatePickerField from "components/common/Fields/DatePickerField";
import TextInputField from "components/common/Fields/TextInputField";
import { CreditCardFormData } from "models/Booking";
import { TransactionInfo } from "services/gmo.service";
import AmericanExpressCardImg from "statics/images/user/american_express.svg";
import CreditCardImg from "statics/images/user/credit-card.svg";
import DinersClubCardImg from "statics/images/user/diners-club.svg";
import JCBCardImg from "statics/images/user/jcb.svg";
import MasterCardImg from "statics/images/user/master-card.svg";
import VisaCardImg from "statics/images/user/visa.svg";
import { CREDIT_CARD_EXPIRE_INPUT_FORMAT, CREDIT_CARD_EXPIRE_PLACEHOLDER } from "constants/common";

import styles from "./index.module.scss";

export interface Props {
  transaction: TransactionInfo;
  hideTitle?: boolean;
  okLabel?: string;
  buttonClassName?: string;
  onSave: () => void;
  onBack: () => void;
}

export default function OnlyReadCreditCardForm(props: Props) {
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<CreditCardFormData>({});

  useEffect(() => {
    scrollToTop();
  }, []);

  useEffect(() => {
    if (props.transaction) {
      const { CardNo, Expire } = props.transaction;
      reset({ cardNumber: CardNo, expiredAt: moment(Expire, "YYMM").toDate() });
    }
  }, [props.transaction]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const ele = document.querySelector("#scrollTop");
    if (ele) {
      ele.scrollIntoView();
    }
  };

  const onSubmit = async () => {
    props.onSave();
  };

  return (
    <div>
      <div>
        <div className={styles.wrapper}>
          {!props.hideTitle && (
            <div className="relative flex flex-row items-center justify-between gap-4 py-6 pl-4 bg-[#fafafa] xs:py-3">
              <div className="flex items-center justify-center gap-x-5">
                <Image src={CreditCardImg} alt="credit-card" />
                <h2 className="text-2xl font-medium text-blue-color xs:text-base">クレジットカード情報入力</h2>
              </div>
              <div className="absolute inset-0 border-b-2 border-dotted border-[#979797]"></div>
            </div>
          )}
          <div className="pt-10 xs:pt-6">
            <form onSubmit={handleSubmit(onSubmit)} id="credit-card">
              {/*Card number*/}
              <div className="mb-[32px]">
                <Label
                  isRequired={true}
                  className="flex mb-[10px] !font-medium !text-[20px] items-center xs:!text-[16px] md:!text-[20px] leading-[28px] 
                    xs:gap-[10px] gap-[20px] text-color"
                >
                  カード番号
                </Label>
                <TextInputField
                  name="cardNumber"
                  control={control}
                  inputProps={{
                    className: "border-0 usr-input-field py-[18px] px-[16px]",
                    maxLength: 16,
                  }}
                  className="w-full usr-input-field h-[60px]"
                  disabled={true}
                />
                {errors.cardNumber && <Error message={errors.cardNumber.message} className="mt-3" />}
              </div>

              {/*Expiry date*/}
              <div className="mb-[32px]">
                <Label
                  isRequired={true}
                  className="flex mb-[10px] !font-medium !text-[20px] items-center xs:!text-[16px] md:!text-[20px] leading-[28px]
                    xs:gap-[10px] gap-[20px] text-color"
                >
                  有効期限
                </Label>
                <DatePickerField
                  name="expiredAt"
                  views={["year", "month"]}
                  control={control}
                  defaultValue={null}
                  inputFormat={CREDIT_CARD_EXPIRE_INPUT_FORMAT}
                  disabled={true}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      inputProps={{
                        className: "border-0 usr-input-field py-[18px] px-[16px]",
                        ...params.inputProps,
                        placeholder: CREDIT_CARD_EXPIRE_PLACEHOLDER,
                      }}
                      className="flex justify-between w-full usr-input-field h-[60px]"
                    />
                  )}
                />
                {errors.expiredAt && <Error message={errors.expiredAt.message} className="mt-3" />}
              </div>

              <div className="mt-2 font-medium md:text-sm">
                <p>以下のカードをサポートします.</p>
                <div className="flex gap-8 my-4">
                  <Image src={VisaCardImg} alt="visa" />
                  <Image src={MasterCardImg} alt="master" />
                  <Image src={JCBCardImg} alt="jcb" />
                  <Image src={DinersClubCardImg} alt="diners-club" />
                  <Image src={AmericanExpressCardImg} alt="american-express" />
                </div>
                <p className="xs:text-sm xs:font-semibold md:text-base md:font-medium text-base font-medium">
                  入力された個人情報はプライバシーポリシーに基づき取り扱われることに同意するものとします。
                </p>
              </div>
            </form>
          </div>
        </div>

        {/*Buttons*/}
        <div className="flex justify-end mt-8 gap-[40px] xs:flex-col-reverse xs:gap-2 xs:mx-8 mb-6">
          <div className="grow">
            <Button
              type="button"
              variant="outlined"
              onClick={props.onBack}
              className={props.buttonClassName ? props.buttonClassName : "!min-w-[150px] md:!text-lg h-[64px] xs:!w-full xs:h-[48px] xs:!mt-[20px]"}
            >
              <span className="xs:text-lg md:text-lg font-bold text-xl">戻る</span>
            </Button>
          </div>

          <Button
            type="submit"
            variant="contained"
            form="credit-card"
            className={props.buttonClassName ? props.buttonClassName : "!min-w-[150px] md:!text-lg h-[64px] xs:!w-full xs:h-[48px]"}
          >
            <span className="xs:text-lg md:text-lg font-bold text-xl">{props.okLabel ? props.okLabel : "予約内容を確認する"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
