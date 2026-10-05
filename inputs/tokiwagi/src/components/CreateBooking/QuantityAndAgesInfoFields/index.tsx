import { IconButton, TextField } from "@mui/material";
import Image from "next/legacy/image";
import { isEmpty, isNil } from "lodash";

import ChevronDown from "statics/images/user/chevron-down.svg";
import Error from "components/common/Error";
import AutocompleteField from "components/common/Fields/AutocompleteField";
import { AGE_UNIT_OPTIONS } from "constants/ticket";
import { ChildAgeItem } from "models/Booking";
import MinusImg from "statics/images/user/minus-circle.svg";
import PlusImg from "statics/images/user/plus-circle.svg";
import { AgeUnit } from "models/enums";
import { getChildAgeIndexesShouldRemove } from "utils/booking";
import { MAXIMUM_CHILD_QUANTITY_INPUT } from "constants/booking";

import styles from "./index.module.scss";

export interface Props {
  control: any;
  fields: any;
  append: any;
  remove: any;
  errors: any;
  setValue: any;
  adultQuantity: any;
  childQuantity: any;
  ageOptions: ChildAgeItem[];
  maxChildPerAdult: number;
  maxAdultQuantity?: number;
  maxChildQuantity?: number;
  minAdultQuantity?: number;
  minChildQuantity?: number;
  showChildAgeHint?: boolean;
  adultQuantityLabel?: string;
  childQuantityLabel?: string;
  disabled?: boolean;
  shouldHideAdultQuantity?: boolean;
  showMonthlyChildAgeHintMessage?: boolean;
  isTimesLimitBooking?: boolean;
}

export default function QuantityAndAgesInfoFields({
  control,
  fields,
  errors,
  append,
  remove,
  setValue,
  adultQuantity,
  childQuantity,
  ageOptions,
  maxChildPerAdult,
  maxAdultQuantity,
  minAdultQuantity = 0,
  maxChildQuantity,
  minChildQuantity = 0,
  showChildAgeHint,
  adultQuantityLabel,
  childQuantityLabel,
  disabled,
  shouldHideAdultQuantity = false,
  showMonthlyChildAgeHintMessage,
  isTimesLimitBooking,
}: Props) {
  let maxChildByAdults = shouldHideAdultQuantity ? MAXIMUM_CHILD_QUANTITY_INPUT : (adultQuantity || 1) * maxChildPerAdult;

  const canAddChild = maxChildQuantity ? maxChildQuantity > childQuantity : maxChildByAdults > childQuantity;
  const canAddAdult = maxAdultQuantity ? maxAdultQuantity > adultQuantity : true;
  const isOnlyAdultTicket = maxChildPerAdult === 0;

  const handleIncreaseAdultQuantity = () => {
    const nextAdultQuantity = adultQuantity + 1;
    setValue("adultQuantity", nextAdultQuantity, { shouldValidate: true });
  };

  const handleDecreaseAdultQuantity = () => {
    const nextMaxChildQuantity = adultQuantity - 1 === 0 ? 1 : (adultQuantity - 1) * maxChildPerAdult;

    if (nextMaxChildQuantity < childQuantity) {
      setValue("childQuantity", nextMaxChildQuantity, { shouldValidate: true });

      const shouldRemoveIndexes = getChildAgeIndexesShouldRemove(fields.length, childQuantity - nextMaxChildQuantity);
      remove(shouldRemoveIndexes);
    }

    setValue("adultQuantity", adultQuantity - 1, { shouldValidate: true });
  };

  const handleIncreaseChildQuantity = () => {
    setValue("childQuantity", childQuantity + 1, { shouldValidate: true });
    shouldHideAdultQuantity && setValue("adultQuantity", childQuantity + 1, { shouldValidate: true });
    append({ age: "", unit: "" });
  };

  const handleDecreaseChildQuantity = () => {
    setValue("childQuantity", childQuantity - 1, { shouldValidate: true });
    shouldHideAdultQuantity && setValue("adultQuantity", childQuantity - 1, { shouldValidate: true });
    remove(fields.length - 1);
  };

  const renderChildAgeHint = () => {
    if (showChildAgeHint) {
      const content = `※${minChildAge.age}
    ${minChildAge.unit === AgeUnit.Month ? "ヶ月" : "歳"}〜${maxChildAge.age}
    ${maxChildAge.unit === AgeUnit.Month ? "ヶ月" : "歳ま"}でご利用可能となります。`;

      return <span className="text-[12px] leading-[14px] font-light flex mt-[8px] xs:w-[140px]">{content}</span>;
    }
    return null;
  };

  const renderMonthlyChildAgeHint = () => {
    if (showMonthlyChildAgeHintMessage) {
      const content = "※フリーパス1枚につき、子ども1名＋おとな1名でご利用いただけます。おとなの人数入力は不要です。";
      return <span className="text-[12px] leading-[14px] font-light flex mt-[8px]">{content}</span>;
    }
    return null;
  };

  const minChildAge = ageOptions[0];
  const maxChildAge = ageOptions[ageOptions.length - 1];

  return (
    <div className={`${styles.quantityAndAgesInfoFields} w-full text-xl font-medium`}>
      {/*Adult quantity*/}
      {Boolean(!shouldHideAdultQuantity && !isTimesLimitBooking) && (
        <div className="flex items-center justify-between mb-6">
          <p className="xs:text-base text-xl">{adultQuantityLabel ?? "おとな人数"}</p>
          <div className="flex items-center justify-end w-[180px] xs:w-[150px]">
            <IconButton
              className={styles.iconButton}
              onClick={handleDecreaseAdultQuantity}
              disabled={disabled || (!isNil(minAdultQuantity) ? adultQuantity === minAdultQuantity : false)}
            >
              <Image src={MinusImg} alt="minus" />
            </IconButton>
            <p className="text-[16px] font-medium grow text-center">{adultQuantity}</p>
            <IconButton className={styles.iconButton} onClick={handleIncreaseAdultQuantity} disabled={disabled || !canAddAdult}>
              <Image src={PlusImg} alt="plus" />
            </IconButton>
          </div>
        </div>
      )}

      {/*Child quantity*/}
      {!isOnlyAdultTicket && (
        <div className="flex items-start justify-between mb-6">
          <p>
            <span className="text-xl xs:text-base">{childQuantityLabel ?? "子ども人数"}</span>
            <br />
            {renderChildAgeHint()}
            {isTimesLimitBooking && <div className="text-[12px] leading-[14px] font-light flex mt-[8px] xs:w-[140px]">※残り枚数：{maxChildQuantity}枚</div>}
          </p>
          <div className="flex items-center justify-end w-[180px] xs:w-[150px]">
            <IconButton
              className={styles.iconButton}
              onClick={handleDecreaseChildQuantity}
              disabled={disabled || (!isNil(minAdultQuantity) ? childQuantity === minChildQuantity : false)}
            >
              <Image src={MinusImg} alt="minus" />
            </IconButton>
            <p className="text-[16px] font-medium grow text-center">{childQuantity}</p>
            <IconButton className={styles.iconButton} onClick={handleIncreaseChildQuantity} disabled={disabled || !canAddChild}>
              <Image src={PlusImg} alt="plus" />
            </IconButton>
          </div>
        </div>
      )}

      {/* Age children */}
      {!isOnlyAdultTicket && (
        <>
          <div className="flex items-start justify-between">
            <p>
              <span className="text-xl xs:text-base">子どもの年齢</span>
            </p>

            <ul>
              {fields.map((item, index) => {
                return (
                  <li key={item.id} className={index === 0 ? "" : "mt-4"}>
                    <div className="flex justify-end items-center">
                      <p className="text-xl font-medium mr-6 xs:mr-2 xs:text-base md:text-base">{index + 1}人目</p>
                      <AutocompleteField
                        disablePortal
                        name={`childAges.${index}`}
                        control={control}
                        options={ageOptions}
                        getOptionLabel={(option) => `${option.age || ""}${AGE_UNIT_OPTIONS.find(({ value }) => option.unit === value)?.label || ""}`}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            className="!w-[120px] xs:!w-[100px] !border !border-solid !border-[#313131] bg-white flex justify-center h-[40px] rounded-[10px]"
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
                        isOptionEqualToValue={(option, value) => (option.age === value.age && option.unit === value.unit) || value.age === "" || isEmpty(value)}
                        disableClearable
                        popupIcon={
                          <span className="flex mr-[4px]">
                            <Image src={ChevronDown} alt="arrow-down" width={15} height={12} />
                          </span>
                        }
                      />
                    </div>
                    {errors.childAges?.length && <Error message={errors.childAges[index]?.message} className="mt-3" />}
                  </li>
                );
              })}
            </ul>
          </div>
          <div>{renderMonthlyChildAgeHint()}</div>
        </>
      )}
    </div>
  );
}
