import { yupResolver } from "@hookform/resolvers/yup";
import { Checkbox, FormControlLabel, TextField } from "@mui/material";
import moment from "moment";
import Image from "next/legacy/image";
import Script from "next/script";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import Label from "components/common/Admin/Label";
import Button from "components/common/Buttons/Button";
import Error from "components/common/Error";
import DatePickerField from "components/common/Fields/DatePickerField";
import PasswordInputField from "components/common/Fields/PasswordInputField";
import TextInputField from "components/common/Fields/TextInputField";
import Spinner from "components/common/Spinner";
import { serverConfig } from "config";
import { CREDIT_CARD_EXPIRE_FORMAT, CREDIT_CARD_EXPIRE_INPUT_FORMAT, CREDIT_CARD_EXPIRE_PLACEHOLDER } from "constants/common";
import { creditCardSchema } from "libs/validation/bookingSchema";
import { CreditCardFormData, UserCreditCard } from "models/Booking";
import { fetchCreditCard, saveCreditCard } from "services/api-client/user.service";
import AmericanExpressCardImg from "statics/images/user/american_express.svg";
import CreditCardImg from "statics/images/user/credit-card.svg";
import DinersClubCardImg from "statics/images/user/diners-club.svg";
import JCBCardImg from "statics/images/user/jcb.svg";
import MasterCardImg from "statics/images/user/master-card.svg";
import VisaCardImg from "statics/images/user/visa.svg";
import { getMessageFromError } from "utils/common";
import { getCreditCardToken } from "utils/gmo";

import styles from "./index.module.scss";

export interface Props {
  hideTitle?: boolean;
  okLabel?: string;
  buttonClassName?: string;
  isShowTitle?: boolean;
  onSave: (cardSeq: string, rememberCard?: boolean) => void;
  onBack: () => void;
}

export default function CreditCardForm(props: Props) {
  const [errMsg, setErrMsg] = useState<string>();
  const [userCreditCard, setUserCreditCard] = useState<UserCreditCard>(null);
  const [hasCreditCard, setHasCreditCard] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<CreditCardFormData>({
    resolver: yupResolver(creditCardSchema),
    defaultValues: { hasCreditCard: false, rememberCard: true },
  });

  useEffect(() => {
    scrollToTop();
    fetchData();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const ele = document.querySelector("#scrollTop");
    if (ele) {
      ele.scrollIntoView();
    }
  };

  useEffect(() => {
    if (userCreditCard) {
      const { Expire, HolderName, CardNo } = userCreditCard;
      CardNo && setHasCreditCard(true);
      CardNo && reset({ cardNumber: CardNo, holderName: HolderName, expiredAt: moment(Expire, "YYMM").toDate(), hasCreditCard: true });
    }
  }, [userCreditCard]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setErrMsg("");

      const card = await fetchCreditCard();
      setUserCreditCard(card);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: CreditCardFormData) => {
    try {
      const response = await getCreditCardToken(data);

      if (!response) {
        return props.onSave(userCreditCard.CardSeq);
      }

      const { errorMessage, token } = response;
      if (errorMessage) {
        setErrMsg(errorMessage);
        return;
      }

      if (token) {
        const { CardSeq } = await saveCreditCard(token, userCreditCard?.CardSeq);
        props.onSave(CardSeq, data.rememberCard);
      }
    } catch (error) {
      const message = getMessageFromError(error);
      setErrMsg(message);
    }
  };

  const handleChangeCreditCard = () => {
    scrollToTop();
    reset({ hasCreditCard: false, rememberCard: true });
    setHasCreditCard(false);
  };

  const handleRestoreCreditCard = () => {
    const { Expire, HolderName, CardNo } = userCreditCard;

    scrollToTop();
    setHasCreditCard(true);
    reset({
      cardNumber: CardNo,
      holderName: HolderName,
      expiredAt: moment(Expire, CREDIT_CARD_EXPIRE_FORMAT).toDate(),
      hasCreditCard: true,
    });
  };

  return (
    <div>
      {isLoading && (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}

      {!isLoading && (
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
                {/*Holder name*/}
                <div className="mb-[32px]">
                  <Label
                    isRequired={true}
                    className="flex mb-[10px] !font-medium !text-[20px] items-center xs:!text-[16px] md:!text-[20px] leading-[28px]
                    xs:gap-[10px] gap-[20px] text-color"
                  >
                    カード名義人
                  </Label>
                  <p className="mb-1 text-[14px] xs:text-[12px]">ご本人名義のクレジットカードのみ登録できます。</p>
                  <TextInputField
                    name="holderName"
                    control={control}
                    inputProps={{
                      className: "border-0 usr-input-field py-[18px] px-[16px]",
                      maxLength: 50,
                    }}
                    className="w-full usr-input-field h-[60px]"
                    disabled={hasCreditCard}
                  />
                  {errors.holderName && <Error message={errors.holderName.message} className="mt-3" />}
                </div>

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
                    disabled={hasCreditCard}
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
                    views={["month", "year"]}
                    control={control}
                    defaultValue={null}
                    inputFormat={CREDIT_CARD_EXPIRE_INPUT_FORMAT}
                    mask="__/__"
                    disableMaskedInput={false}
                    disabled={hasCreditCard}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        inputProps={{
                          className: "border-0 usr-input-field py-[18px] px-[16px]",
                          ...params.inputProps,
                          placeholder: CREDIT_CARD_EXPIRE_PLACEHOLDER,
                        }}
                        className="w-full usr-input-field h-[60px]"
                      />
                    )}
                  />
                  {errors.expiredAt && <Error message={errors.expiredAt.message} className="mt-3" />}
                </div>

                {/*Security code*/}
                {!hasCreditCard && (
                  <>
                    <div className="mb-[34px]">
                      <Label
                        htmlFor="message"
                        isRequired={true}
                        className="flex mb-[10px] !font-medium !text-[20px] items-center xs:!text-[16px] md:!text-[20px] leading-[28px]
                        xs:gap-[10px] gap-[20px] text-color"
                      >
                        セキュリティコード
                      </Label>
                      <p className="mb-1">＊CVV</p>
                      <PasswordInputField
                        name="securityCode"
                        placeholder="000"
                        control={control}
                        inputProps={{
                          className: "border-0 usr-input-field py-[18px] px-[16px]",
                          maxLength: 4,
                        }}
                        className="w-full usr-input-field h-[60px] passwordField"
                      />
                      {errors.securityCode && <Error message={errors.securityCode.message} className="mt-3" />}
                    </div>
                    <div className="mb-4">
                      <FormControlLabel
                        className="font-medium"
                        control={
                          <Controller
                            name="rememberCard"
                            control={control}
                            render={({ field: props }) => <Checkbox {...props} checked={props.value} onChange={(e) => props.onChange(e.target.checked)} />}
                          />
                        }
                        label={<span className="font-medium xs:text-sm">このカードの情報を保存して、次回も使用する</span>}
                      />
                    </div>
                  </>
                )}

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
            {hasCreditCard && (
              <Button
                type="button"
                variant="contained"
                onClick={handleChangeCreditCard}
                className={props.buttonClassName ? props.buttonClassName : "!min-w-[150px] md:!text-lg h-[64px] xs:!w-full xs:h-[48px] xs:!mt-[20px]"}
              >
                <span className="xs:text-lg md:text-lg font-bold text-xl">変更</span>
              </Button>
            )}
            {userCreditCard?.CardNo && !hasCreditCard && (
              <Button
                type="button"
                variant="outlined"
                onClick={handleRestoreCreditCard}
                className={props.buttonClassName ? props.buttonClassName : "!min-w-[150px] md:!text-lg !p-0 h-[64px] xs:!w-full xs:h-[48px] xs:!mt-[20px]"}
              >
                <span className="xs:text-lg md:text-lg font-bold text-xl">キャンセル</span>
              </Button>
            )}
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
      )}

      {/* Error */}
      <Error message={errMsg} className="text-[14px] mt-8 text-center" />

      <Script src={serverConfig.gmo.token_url}></Script>
    </div>
  );
}
