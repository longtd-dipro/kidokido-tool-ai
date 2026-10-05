import { yupResolver } from "@hookform/resolvers/yup";
import { TextField } from "@mui/material";
import moment from "moment";
import Image from "next/legacy/image";
import { useRouter } from "next/router";
import Script from "next/script";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";

import Label from "components/common/Admin/Label";
import Button from "components/common/Buttons/Button";
import Error from "components/common/Error";
import DatePickerField from "components/common/Fields/DatePickerField";
import PasswordInputField from "components/common/Fields/PasswordInputField";
import TextInputField from "components/common/Fields/TextInputField";
import Spinner from "components/common/Spinner";
import { serverConfig } from "config";
import { CREDIT_CARD_ERRORS, TRANSACTION_ERRORS } from "constants/booking";
import { CREDIT_CARD_EXPIRE_INPUT_FORMAT, CREDIT_CARD_EXPIRE_PLACEHOLDER } from "constants/common";
import { ROUTE } from "constants/route";
import { userUpdateCreditCardSchema } from "libs/validation/schemas";
import { CreditCardFormData, UserCreditCard } from "models/Booking";
import { fetchCreditCard, saveCreditCard } from "services/api-client/user.service";
import AmericanExpressCardImg from "statics/images/user/american_express.svg";
import CreditCardImage from "statics/images/user/credit-card.svg";
import DinersClubCardImg from "statics/images/user/diners-club.svg";
import JCBCardImg from "statics/images/user/jcb.svg";
import MasterCardImg from "statics/images/user/master-card.svg";
import VisaCardImg from "statics/images/user/visa.svg";
import { NotificationType, showNotification } from "stores/reducers/notification";
import { getCreditCardToken } from "utils/gmo";

export default function UpdateCreditCardForm() {
  const [errMsg, setErrMsg] = useState<string>();
  const [userCreditCard, setUserCreditCard] = useState<UserCreditCard>(null);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const router = useRouter();

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<CreditCardFormData>({
    resolver: yupResolver(userUpdateCreditCardSchema),
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (window.pageYOffset > 0) window.scrollTo({ top: 0, behavior: "auto" });
  }, [userCreditCard]);

  useEffect(() => {
    if (userCreditCard) {
      const { Expire, HolderName, CardNo } = userCreditCard;
      CardNo && reset({ cardNumber: CardNo, holderName: HolderName, expiredAt: moment(Expire, "YYMM").toDate() });
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
    setErrMsg("");

    try {
      const response = await getCreditCardToken(data);
      const { errorMessage, token } = response;
      if (errorMessage) {
        setErrMsg(errorMessage);
        return;
      }

      if (token) {
        const { CardSeq, ErrInfo } = await saveCreditCard(token, userCreditCard?.CardSeq, true);
        CardSeq && router.push(ROUTE.USER_CHANGE_CREDIT_CARD_SUCCESS);
        ErrInfo && dispatch(showNotification({ type: NotificationType.ERROR, message: CREDIT_CARD_ERRORS[ErrInfo] || TRANSACTION_ERRORS[ErrInfo] }));
      }
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  const handleRedirect = () => {
    router.push(ROUTE.USER_PERSONAL_INFO);
  };

  return (
    <div>
      {isLoading && (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}
      {!isLoading && (
        <div className="flex flex-col items-center mdup:w-[856px] xs:w-full mx-auto ">
          <div className="relative flex flex-row items-center justify-between gap-4 py-6 xs:p-[10px] md:p-[19px] md:px-4 pl-4 bg-[#FAFAFA] w-full ">
            <div className="flex items-center justify-center gap-x-5">
              <Image src={CreditCardImage} alt={CreditCardImage} />
              <span className="text-2xl xs:text-base xs:leading-7 md:text-lg md:leading-6 font-medium text-blue-color">お支払い方法</span>
            </div>

            <div className="absolute inset-0 border-b-2 border-dotted border-[#979797]"></div>
          </div>
          <div className="w-full mt-10 xs:mt-6">
            <form onSubmit={handleSubmit(onSubmit)} id="credit-card" className="flex flex-col items-center justify-center text-color">
              {/*Holder name*/}
              <div className="mb-8 w-[600px] xs:w-full">
                <Label
                  isRequired={true}
                  className="flex mb-[10px] !font-medium xsup:!text-xl xs:text-base items-center !leading-[28px] xs:gap-[10px] gap-[20px] text-color"
                >
                  カード名義人
                </Label>
                <p className="mb-1 text-sm xs:font-light leading-4 xs:leading-5 xs:text-xs">ご本人名義のクレジットカードのみ登録できます。</p>
                <TextInputField
                  placeholder="YAMADA TAROU"
                  name="holderName"
                  control={control}
                  inputProps={{
                    className: "border-0 usr-input-field py-[18px] px-[16px]",
                    maxLength: 50,
                  }}
                  className="w-full usr-input-field h-[60px]"
                />
                {errors.holderName && <Error message={errors.holderName.message} />}
              </div>

              {/*Card number*/}
              <div className="mb-8 w-[600px] xs:w-full">
                <Label
                  isRequired={true}
                  className="flex mb-[10px] !font-medium xsup:!text-xl xs:text-base items-center !leading-[28px] xs:gap-[10px] gap-[20px] text-color"
                >
                  カード番号
                </Label>
                <TextInputField
                  placeholder="00000000000000000"
                  name="cardNumber"
                  control={control}
                  inputProps={{
                    className: "border-0 usr-input-field py-[18px] px-[16px]",
                    maxLength: 16,
                  }}
                  className="w-full usr-input-field h-[60px]"
                />
                {errors.cardNumber && <Error message={errors.cardNumber.message} />}
              </div>

              {/*Expiry date*/}
              <div className="mb-8 w-[600px] xs:w-full">
                <Label
                  isRequired={true}
                  className="flex mb-[10px] !font-medium xsup:!text-xl xs:text-base items-center !leading-[28px] xs:gap-[10px] gap-[20px] text-color"
                >
                  有効期限
                </Label>
                <DatePickerField
                  name="expiredAt"
                  control={control}
                  defaultValue={null}
                  views={["month", "year"]}
                  mask="__/__"
                  disableMaskedInput={false}
                  inputFormat={CREDIT_CARD_EXPIRE_INPUT_FORMAT}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      inputProps={{
                        className: "border-0 usr-input-field py-[18px] px-[16px] uppercase",
                        ...params.inputProps,
                        placeholder: CREDIT_CARD_EXPIRE_PLACEHOLDER,
                      }}
                      className="flex justify-between w-full usr-input-field h-[60px]"
                    />
                  )}
                />
                {errors.expiredAt && <Error message={errors.expiredAt.message} />}
              </div>

              {/*Security code*/}

              <div className="mb-[34px] w-[600px] xs:w-full">
                <Label
                  htmlFor="message"
                  isRequired={true}
                  className="flex mb-[10px] !font-medium xsup:!text-xl xs:text-base items-center !leading-[28px] xs:gap-[10px] gap-[20px] text-color"
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
                {errors.securityCode && <Error message={errors.securityCode.message} />}
              </div>

              <div className="mt-[18px] xs:text-sm xs:font-semibold xs:leading-6 font-medium w-[600px] xs:w-full text-color">
                <p>以下のカードをサポートします.</p>
                <div className="flex gap-8 my-4">
                  <Image src={VisaCardImg} alt="visa" />
                  <Image src={MasterCardImg} alt="master" />
                  <Image src={JCBCardImg} alt="jcb" />
                  <Image src={DinersClubCardImg} alt="diners-club" />
                  <Image src={AmericanExpressCardImg} alt="american-express" />
                </div>
                <p className="xs:text-sm xs:leading-6 xs:font-semibold md:text-base md:font-medium text-base font-medium text-color">
                  入力された個人情報はプライバシーポリシーに基づき取り扱われることに同意するものとします。
                </p>
              </div>

              {/* Errors */}
              <Error message={errMsg} />

              {/* Line */}
              <div className="w-full xs:mt-9 mt-[40px] inset-0 border-b-2 border-dotted border-[#979797]"></div>

              {/* Buttons */}
              <div className="flex justify-center xs:mt-9 mt-[48px] gap-x-48 md:gap-[168px] mb-10 xs:flex-col-reverse xs:gap-0 xs:items-center xs:w-full">
                {/*Button Back*/}
                <Button className="w-[200px] md:w-[260px] xs:w-[290px] h-[64px] md:!text-lg md:h-[48px] xs:!mt-4" variant="outlined" onClick={handleRedirect}>
                  戻る
                </Button>
                {/*Button Save*/}
                <Button type="submit" className="w-[200px] md:w-[260px] xs:w-[290px] h-[64px] md:!text-lg md:h-[48px]" variant="contained">
                  変更
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      <Script src={serverConfig.gmo.token_url}></Script>
    </div>
  );
}
