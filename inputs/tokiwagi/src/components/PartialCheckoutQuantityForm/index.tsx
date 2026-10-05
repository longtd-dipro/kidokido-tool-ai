import { IconButton } from "@mui/material";
import Image from "next/legacy/image";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";

import { Ticket } from "models/Entity";
import MinusImg from "statics/images/user/minus-circle.svg";
import PlusImg from "statics/images/user/plus-circle.svg";
import { getAgeLabel } from "utils/ticket";
import ChildAgeItemCheckbox from "components/PartialCheckoutQuantityForm/ChildAgeItemCheckbox";
import Button from "components/common/Buttons/Button";
import { BookingQuantityFormData } from "models/Booking";

type Props = {
  originalBookingQuantity: BookingQuantityFormData;
  ticket: Ticket;
  onSuccessfullySubmit: (data: BookingQuantityFormData) => void;
  onBack: () => void;
};

export default function PartialCheckoutQuantityForm({ originalBookingQuantity, ticket, onSuccessfullySubmit, onBack }: Props) {
  const transformBookingQuantityDefaultValue = (bookingQuantity: BookingQuantityFormData) => {
    const childAges = bookingQuantity.childAges.map((item) => ({ ...item, isChecked: false }));
    return { ...bookingQuantity, childAges };
  };

  const methods = useForm({
    defaultValues: transformBookingQuantityDefaultValue(originalBookingQuantity),
  });

  const { control, watch, setValue, handleSubmit } = methods;

  const { fields } = useFieldArray({
    control,
    name: "childAges",
  });

  const [adultQuantity, childQuantity, childAges] = watch(["adultQuantity", "childQuantity", "childAges"]);
  const isDisableIncreaseAdultQuantityButton = adultQuantity === originalBookingQuantity.adultQuantity;
  const isDisableDecreaseAdultQuantityButton = adultQuantity === 0;

  const handleDecreaseAdultQuantity = () => {
    const updateAdultQuantity = adultQuantity - 1;
    setValue("adultQuantity", updateAdultQuantity);
  };

  const handleIncreaseAdultQuantity = () => {
    const updateAdultQuantity = adultQuantity + 1;
    setValue("adultQuantity", updateAdultQuantity);
  };

  const onSubmit = (data: BookingQuantityFormData) => {
    const payload = preparePayloadToPartialCheckOut(data);
    onSuccessfullySubmit(payload);
  };

  const preparePayloadToPartialCheckOut = (data: BookingQuantityFormData) => {
    const adultQuantity = originalBookingQuantity.adultQuantity - data.adultQuantity;
    const childAges = data.childAges.filter((item) => item.isChecked);
    const childQuantity = childAges.length;

    return { adultQuantity, childQuantity, childAges };
  };

  const checkWasUpdate = () => {
    const wasChangeAdultQuantity = adultQuantity !== originalBookingQuantity.adultQuantity;
    const wasChangeChildQuantity = childAges.some((item) => item.isChecked);
    return wasChangeAdultQuantity || wasChangeChildQuantity;
  };

  const isDisableSubmitButton = !checkWasUpdate();

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-center justify-between mb-6">
          <p className="xs:text-base text-xl">おとなの人数</p>
          <div className="flex items-center justify-end w-[180px] xs:w-[150px]">
            <IconButton className="p-0 disabled:opacity-50" onClick={handleDecreaseAdultQuantity} disabled={isDisableDecreaseAdultQuantityButton}>
              <Image src={MinusImg} alt="minus" />
            </IconButton>
            <p className="text-[16px] font-medium grow text-center">{adultQuantity}</p>
            <IconButton className="p-0 disabled:opacity-50" onClick={handleIncreaseAdultQuantity} disabled={isDisableIncreaseAdultQuantityButton}>
              <Image src={PlusImg} alt="plus" />
            </IconButton>
          </div>
        </div>

        <div className="flex items-start justify-between mb-6">
          <p className="xs:text-base text-xl">
            <span>子どもの人数・年齢</span>
            <span className="text-[12px] leading-[14px] font-light flex mt-[8px] xs:w-[140px]">
              ※{getAgeLabel(ticket.childAgeLimitFrom)}〜{getAgeLabel(ticket.childAgeLimitTo, true)}
              でご利用可能となります。
            </span>
          </p>
          <div className="text-center flex flex-col items-center justify-center w-[180px] xs:w-[150px]">
            <p className="text-[16px] font-medium grow text-center mb-6">{childQuantity}人</p>
            {/* DESKTOP */}
            <div className="xs:hidden">
              {fields.map((item, index) => (
                <ChildAgeItemCheckbox index={index} key={item.id} />
              ))}
            </div>
          </div>
        </div>
        {/* MOBILE */}
        <div className="xsup:hidden">
          {fields.map((item, index) => (
            <ChildAgeItemCheckbox index={index} key={item.id} />
          ))}
        </div>

        <div className="flex flex-col items-center mt-8">
          <div className="flex flex-row gap-[40px] xs:flex-col-reverse xs:gap-0">
            <Button variant="outlined" className="h-[56px] md:h-12 w-[200px] xs:w-[290px] xs:!mt-4 text-xl md:!text-lg mdup:!leading-7" onClick={onBack}>
              戻る
            </Button>
            <Button
              variant="contained"
              className={`user-button-blue-medium h-[56px] md:h-12 w-[200px] xs:w-[290px] text-xl md:!text-lg mdup:!leading-7 ${
                isDisableSubmitButton ? "disabled" : ""
              }`}
              type="submit"
              disabled={isDisableSubmitButton}
            >
              変更
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
