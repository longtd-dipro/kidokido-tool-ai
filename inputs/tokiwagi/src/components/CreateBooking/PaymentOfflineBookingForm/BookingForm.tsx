import { useEffect } from "react";
import { IconButton, TextField } from "@mui/material";
import { useFieldArray } from "react-hook-form";
import Image from "next/legacy/image";

import AutocompleteField from "components/common/Fields/AutocompleteField";
import { Booking, Ticket } from "models/Entity";
import Button from "components/common/Buttons/Button";
import MinusImg from "statics/images/user/minus-circle.svg";
import PlusImg from "statics/images/user/plus-circle.svg";
import ChevronDown from "statics/images/user/chevron-down.svg";
import Error from "components/common/Error";
import { AGE_UNIT_OPTIONS } from "constants/ticket";
import { generateAgeOptions } from "utils/ticket";
import { getChildAgeIndexesShouldRemove } from "utils/booking";

import styles from "./BookingForm.module.scss";

export interface Props {
  tickets: Ticket[];
  control: any;
  setValue: any;
  watch: any;
  errors: any;
  removeBooking: any;
  index: number;
  defaultQuantityDetail: any;
  userMonthlyBookings?: Booking[];
  userTimesLimitBookings?: Booking[];
  mainBookingId?: number;
  onRemoveBooking?: (index: number) => void;
}

export default function BookingForm({
  tickets,
  control,
  setValue,
  watch,
  errors,
  removeBooking,
  index,
  defaultQuantityDetail,
  userMonthlyBookings,
  userTimesLimitBookings,
  mainBookingId,
  onRemoveBooking,
}: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `bookings.${index}.childAges`,
  });

  const [adultQuantity, childQuantity, ticket, fromLastBooking] = watch([
    `bookings.${index}.adultQuantity`,
    `bookings.${index}.childQuantity`,
    `bookings.${index}.ticketId`,
    `bookings.${index}.fromLastBooking`,
  ]);

  const maxChildByAdults = (adultQuantity || 1) * ticket?.maxChildPerAdult;
  const hasMainBooking = userTimesLimitBookings.length || userMonthlyBookings.length || mainBookingId;
  let defaultAdultQuantity = hasMainBooking ? 0 : index === 0 ? 1 : 0;
  const isOnlyAdultTicket = ticket?.maxChildPerAdult === 0;
  const isPromotionTicket = ticket?.isPromotion;
  const isDisableDecreaseAdultQuantityButton = isPromotionTicket || (isOnlyAdultTicket ? adultQuantity === 1 : adultQuantity === defaultAdultQuantity);
  const canAddChild = !isPromotionTicket && maxChildByAdults > childQuantity;

  if (isPromotionTicket) {
    defaultAdultQuantity = 1;
  }

  useEffect(() => {
    if (index === 0 && adultQuantity === 0 && !hasMainBooking) {
      setValue(`bookings.${index}.adultQuantity`, 1);
    }

    if (index === 0 && adultQuantity === 1 && !fromLastBooking && hasMainBooking && !isOnlyAdultTicket && !isPromotionTicket) {
      setValue(`bookings.${index}.adultQuantity`, 0);
    }
  }, [index, hasMainBooking]);

  const handleIncreaseAdultQuantity = () => {
    const nextAdultQuantity = adultQuantity + 1;
    setValue(`bookings.${index}.adultQuantity`, nextAdultQuantity, { shouldValidate: true });
  };

  const handleDecreaseAdultQuantity = () => {
    const nextMaxChildQuantity = adultQuantity - 1 === 0 ? 1 : (adultQuantity - 1) * ticket?.maxChildPerAdult;

    if (nextMaxChildQuantity < childQuantity) {
      setValue(`bookings.${index}.childQuantity`, nextMaxChildQuantity, { shouldValidate: true });

      const shouldRemoveIndexes = getChildAgeIndexesShouldRemove(fields.length, childQuantity - nextMaxChildQuantity);
      remove(shouldRemoveIndexes);
    }

    setValue(`bookings.${index}.adultQuantity`, adultQuantity - 1, { shouldValidate: true });
  };

  const handleIncreaseChildQuantity = () => {
    setValue(`bookings.${index}.childQuantity`, childQuantity + 1, { shouldValidate: true });
    append({ age: "", unit: "" });
  };

  const handleDecreaseChildQuantity = () => {
    setValue(`bookings.${index}.childQuantity`, childQuantity - 1, { shouldValidate: true });
    remove(fields.length - 1);
  };

  const handleRemoveBooking = () => {
    removeBooking(index);
    onRemoveBooking(index);
  };

  const handleChangeTicket = (data) => {
    if (data.isPromotion) {
      remove();
      setValue(`bookings.${index}.adultQuantity`, 1);
      setValue(`bookings.${index}.childQuantity`, 1);
      append({ age: "", unit: "" });
      return;
    }

    if (data.id !== defaultQuantityDetail.ticketId.id) {
      remove();
      if (data.maxChildPerAdult === 0) {
        setValue(`bookings.${index}.adultQuantity`, 1);
        setValue(`bookings.${index}.childQuantity`, 0);
      } else {
        setValue(`bookings.${index}.adultQuantity`, defaultAdultQuantity);
        setValue(`bookings.${index}.childQuantity`, 1);
        append({ age: "", unit: "" });
      }
    }
  };

  return (
    <div className={`${styles.bookingForm} w-full p-6 xs:p-4`} id={ticket?.id}>
      <div className="flex justify-between mb-8">
        <div className="xs:w-full">
          <div className="xsup:flex items-center xs:justify-between">
            <p className="xs:min-w-[100px] xs:text-center xs:mb-3">商品選択：</p>

            <AutocompleteField
              disablePortal
              name={`bookings.${index}.ticketId`}
              control={control}
              options={tickets}
              getOptionLabel={(option) => option.name || ""}
              renderInput={(params) => (
                <TextField
                  {...params}
                  className="w-[300px] min-w-[173px] xs:w-full border border-solid border-[#313131] bg-white
                  flex justify-center h-[40px] rounded-[10px] xs:mx-auto"
                  InputProps={{
                    ...params.InputProps,
                    className: "!py-0 !pr-[32px] !pl-[4px]",
                  }}
                  inputProps={{
                    ...params.inputProps,
                    className: "!py-0",
                    readOnly: true,
                  }}
                  placeholder="商品選択"
                />
              )}
              isOptionEqualToValue={(option, value) => {
                return option.id == value.id || value == "";
              }}
              disableClearable
              popupIcon={
                <span className="flex mr-[4px]">
                  <Image src={ChevronDown} alt="arrow-down" width={15} height={12} />
                </span>
              }
              noOptionsText="データがありません"
              handleChange={handleChangeTicket}
            />
          </div>
          <div className="flex items-center">
            <div className="w-[80px] xs:w-[110px]"></div>
            {errors.bookings?.length && errors.bookings[index]?.ticketId && <Error message={errors.bookings[index].ticketId?.message} className="mt-2" />}
          </div>
        </div>

        <Button variant="outlined" className="w-[125px] h-[40px] !text-base !font-medium !p-0 xs:!hidden" onClick={handleRemoveBooking}>
          キャンセル
        </Button>
      </div>
      <div>
        {ticket && (
          <div className={`${styles.quantityCard} w-full text-xl font-medium`}>
            <div className={`${styles.title} py-4`}>
              <p className="text-center">利用内容</p>
            </div>
            <div className="px-12 py-4 xs:px-2 xs:text-base">
              {/*Adult quantity*/}
              <div className="flex items-center justify-between mb-6">
                <p>おとな人数</p>
                <div className="flex items-center justify-end w-[180px] xs:w-[140px] xs:min-w-[140px]">
                  <IconButton className={styles.iconButton} onClick={handleDecreaseAdultQuantity} disabled={isDisableDecreaseAdultQuantityButton}>
                    <Image src={MinusImg} alt="minus" />
                  </IconButton>
                  <p className="text-xl font-medium text-center grow">{adultQuantity}</p>
                  <IconButton className={styles.iconButton} onClick={handleIncreaseAdultQuantity} disabled={isPromotionTicket}>
                    <Image src={PlusImg} alt="plus" />
                  </IconButton>
                </div>
              </div>

              {/*Child quantity*/}
              {!isOnlyAdultTicket && (
                <div className="flex items-center justify-between mb-6">
                  <p>子ども人数</p>
                  <div className="flex items-center justify-end w-[180px] xs:w-[140px] xs:min-w-[140px]">
                    <IconButton className={styles.iconButton} onClick={handleDecreaseChildQuantity} disabled={isPromotionTicket || childQuantity === 1}>
                      <Image src={MinusImg} alt="minus" />
                    </IconButton>
                    <p className="text-xl font-medium text-center grow">{childQuantity}</p>
                    <IconButton className={styles.iconButton} onClick={handleIncreaseChildQuantity} disabled={!canAddChild}>
                      <Image src={PlusImg} alt="plus" />
                    </IconButton>
                  </div>
                </div>
              )}

              {/* Age children */}
              {!isOnlyAdultTicket && (
                <div className="flex items-start justify-between">
                  <p>子どもの年齢</p>
                  <ul>
                    {fields.map((item, childAgeIndex) => {
                      return (
                        <li key={item.id} className="mb-4">
                          <div className="flex justify-end items-center">
                            <p className="text-xl font-medium mr-6 xs:mr-2 xs:text-base">{childAgeIndex + 1}人目</p>
                            <AutocompleteField
                              disablePortal
                              name={`bookings.${index}.childAges.${childAgeIndex}`}
                              control={control}
                              options={generateAgeOptions(ticket)}
                              getOptionLabel={(option) => `${option.age || ""}${AGE_UNIT_OPTIONS.find(({ value }) => option.unit === value)?.label || ""}`}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  className="!w-[120px] xs:!w-[100px] !border !border-solid !border-[#313131] bg-white flex justify-center h-[40px]
                                rounded-[10px]"
                                  InputProps={{
                                    ...params.InputProps,
                                    className: "!py-0 !pr-[32px] !pl-[4px]",
                                  }}
                                  inputProps={{
                                    ...params.inputProps,
                                    className: "!py-0 xs:!pr-0 xs:!pl-1",
                                    readOnly: true,
                                  }}
                                />
                              )}
                              isOptionEqualToValue={(option, value) => (option.age === value.age && option.unit === value.unit) || value.age === ""}
                              disableClearable
                              popupIcon={
                                <span className="flex mr-[4px]">
                                  <Image src={ChevronDown} alt="arrow-down" width={15} height={12} />
                                </span>
                              }
                            />
                          </div>
                          {errors.bookings?.length && errors.bookings[index]?.childAges && errors.bookings[index]?.childAges[childAgeIndex] && (
                            <Error message={errors.bookings[index].childAges[childAgeIndex]?.message} className="mt-2" />
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-center mt-6 xsup:hidden">
        <Button variant="outlined" className="w-[200px] h-[40px] !text-base !font-medium !p-0" onClick={handleRemoveBooking}>
          キャンセル
        </Button>
      </div>
    </div>
  );
}
