import { IconButton, TextField } from "@mui/material";
import Image from "next/legacy/image";
import { useFieldArray, useFormContext } from "react-hook-form";
import { filter, map } from "lodash";
import { useEffect } from "react";

import Button from "components/common/Buttons/Button";
import AutocompleteField from "components/common/Fields/AutocompleteField";
import { AGE_UNIT_OPTIONS } from "constants/ticket";
import { Booking, Ticket } from "models/Entity";
import ChevronDown from "statics/images/user/chevron-down.svg";
import MinusImg from "statics/images/user/minus-circle.svg";
import PlusImg from "statics/images/user/plus-circle.svg";
import { getChildAgeIndexesShouldRemove } from "utils/booking";
import { generateMonthlyBookingAgeOptions } from "utils/ticket";
import Error from "components/common/Error";

import styles from "./BookingForm.module.scss";

export interface Props {
  parentMonthlyBookings: Booking[];
  fieldIndex: number;
  tickets: Ticket[];
  onRemove: (index: number) => void;
}

export default function UserMonthlyBookingForm({ parentMonthlyBookings, fieldIndex, onRemove }: Props) {
  const {
    control,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const {
    fields: childAgeFields,
    append: appendChildAge,
    remove: removeChildAge,
  } = useFieldArray({
    control,
    name: `monthlyBookings.${fieldIndex}.childAges`,
  });

  const [adultQuantity, childQuantity, ticket, monthlyBookings] = watch([
    `monthlyBookings.${fieldIndex}.adultQuantity`,
    `monthlyBookings.${fieldIndex}.childQuantity`,
    `monthlyBookings.${fieldIndex}.ticketId`,
    "monthlyBookings",
  ]);

  useEffect(() => {
    if (fieldIndex === 0 && adultQuantity === 0) {
      setValue(`monthlyBookings.${fieldIndex}.adultQuantity`, 1);
    }
  }, [fieldIndex]);

  const handleDecreaseAdultQuantity = () => {
    const nextMaxChildQuantity = adultQuantity - 1 === 0 ? 1 : (adultQuantity - 1) * ticket?.maxChildPerAdult;

    if (nextMaxChildQuantity < childQuantity) {
      setValue(`monthlyBookings.${fieldIndex}.childQuantity`, nextMaxChildQuantity, { shouldValidate: true });

      const shouldRemoveIndexes = getChildAgeIndexesShouldRemove(childAgeFields.length, childQuantity - nextMaxChildQuantity);
      removeChildAge(shouldRemoveIndexes);
    }

    setValue(`monthlyBookings.${fieldIndex}.adultQuantity`, adultQuantity - 1, { shouldValidate: true });
  };

  const handleIncreaseAdultQuantity = () => {
    const nextAdultQuantity = adultQuantity + 1;
    setValue(`monthlyBookings.${fieldIndex}.adultQuantity`, nextAdultQuantity, { shouldValidate: true });
  };

  const handleDecreaseChildQuantity = () => {
    removeChildAge(childAgeFields.length - 1);

    const nextChildQuantity = childQuantity - 1;
    setValue(`monthlyBookings.${fieldIndex}.childQuantity`, nextChildQuantity, { shouldValidate: true });
  };

  const handleIncreaseChildQuantity = () => {
    appendChildAge({ age: "", unit: "" });

    const nextChildQuantity = childQuantity + 1;
    setValue(`monthlyBookings.${fieldIndex}.childQuantity`, nextChildQuantity, { shouldValidate: true });
  };

  const handleChangeTicket = (data: any) => {
    const parentMonthlyBooking = parentMonthlyBookings.find(
      (booking) => booking.ticketId === data.id && (data?.parentBookingId ? booking.id === data?.parentBookingId : true)
    );

    removeChildAge();

    setValue(`monthlyBookings.${fieldIndex}.adultQuantity`, defaultAdultQuantity);
    setValue(`monthlyBookings.${fieldIndex}.childQuantity`, 1);
    setValue(`monthlyBookings.${fieldIndex}.parentBookingId`, parentMonthlyBooking?.id);
    appendChildAge({ age: "", unit: "" });
  };

  const handleShowChildAgeError = (childAgeIndex: number) => {
    return (
      errors.monthlyBookings?.length &&
      errors.monthlyBookings[fieldIndex]?.childAges &&
      errors.monthlyBookings[fieldIndex]?.childAges[childAgeIndex] && (
        <Error message={errors.monthlyBookings[fieldIndex].childAges[childAgeIndex]?.message} className="mt-2" />
      )
    );
  };

  let defaultAdultQuantity = fieldIndex === 0 ? 1 : 0;

  const parentMonthlyBooking = parentMonthlyBookings.find(
    (booking) => booking.ticketId === ticket?.id && (ticket.parentBookingId ? booking.id === ticket.parentBookingId : true)
  );

  const canAddAdult = parentMonthlyBooking?.adultQuantity > adultQuantity;
  const maxChildByAdults = (adultQuantity || 1) * ticket?.maxChildPerAdult;
  const canAddChild = maxChildByAdults > childQuantity && parentMonthlyBooking?.childQuantity > childQuantity;

  const isDisableDecreaseAdultQuantityButton = adultQuantity === defaultAdultQuantity;

  // First compute chosenMonthlyBookingIds
  const chosenMonthlyBookingIds = map(
    filter(monthlyBookings, (booking) => booking.ticketId),
    (booking) => booking.parentBookingId
  );

  // Then compute filteredTickets
  const filteredTickets = map(
    filter(parentMonthlyBookings, (parentMonthlyBooking) =>
      !chosenMonthlyBookingIds.includes(parentMonthlyBooking.id)
    ),
    (parentMonthlyBooking) => ({
      ...parentMonthlyBooking.Ticket,
      parentBookingId: parentMonthlyBooking.id
    })
  );

  return (
    <div className={`${styles.bookingForm} w-full p-6 xs:p-4`}>
      {/* Ticket Selector */}
      <div className="flex justify-between mb-8 gap-8 xs:flex-col xs:mb-0">
        <div className="xs:w-full">
          <div className="xsup:flex items-center xs:justify-between">
            <p className="xs:min-w-[100px] xs:text-center xs:mb-3">商品選択：</p>

            <AutocompleteField
              disablePortal
              name={`monthlyBookings.${fieldIndex}.ticketId`}
              control={control}
              options={filteredTickets}
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
            {errors.monthlyBookings?.length && errors.monthlyBookings[fieldIndex]?.ticketId && (
              <Error message={errors.monthlyBookings[fieldIndex].ticketId?.message} className="mt-2" />
            )}
          </div>
        </div>

        <Button variant="outlined" className="w-[125px] h-[40px] !text-base !font-medium !p-0 xs:!hidden" onClick={() => onRemove(fieldIndex)}>
          キャンセル
        </Button>
      </div>

      {/* Quantity Selector */}
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
                  <IconButton className={styles.iconButton} onClick={handleIncreaseAdultQuantity} disabled={!canAddAdult}>
                    <Image src={PlusImg} alt="plus" />
                  </IconButton>
                </div>
              </div>

              {/*Child quantity*/}
              <div className="flex items-center justify-between mb-6">
                <p>子ども人数</p>
                <div className="flex items-center justify-end w-[180px] xs:w-[140px] xs:min-w-[140px]">
                  <IconButton className={styles.iconButton} onClick={handleDecreaseChildQuantity} disabled={childQuantity === 1}>
                    <Image src={MinusImg} alt="minus" />
                  </IconButton>
                  <p className="text-xl font-medium text-center grow">{childQuantity}</p>
                  <IconButton className={styles.iconButton} onClick={handleIncreaseChildQuantity} disabled={!canAddChild}>
                    <Image src={PlusImg} alt="plus" />
                  </IconButton>
                </div>
              </div>

              {/* Age children */}
              <div className="flex items-start justify-between">
                <p>子どもの年齢</p>
                <ul>
                  {childAgeFields.map((item, childAgeIndex) => {
                    return (
                      <li key={item.id} className="mb-4">
                        <div className="flex justify-end items-center">
                          <p className="text-xl font-medium mr-6 xs:mr-2 xs:text-base">{childAgeIndex + 1}人目</p>
                          <AutocompleteField
                            disablePortal
                            name={`monthlyBookings.${fieldIndex}.childAges.${childAgeIndex}`}
                            control={control}
                            options={generateMonthlyBookingAgeOptions(parentMonthlyBooking)}
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
                        {handleShowChildAgeError(childAgeIndex)}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Only - Remove Button */}
      <div className="flex justify-center mt-6 xsup:hidden">
        <Button variant="outlined" className="w-[200px] h-[40px] !text-base !font-medium !p-0" onClick={() => onRemove(fieldIndex)}>
          キャンセル
        </Button>
      </div>
    </div>
  );
}
