import { FormControlLabel, Radio, RadioGroup, RadioGroupProps, TextField } from "@mui/material";
import { TicketType } from "@prisma/client";
import { Controller, FieldErrors, Control, UseFormWatch } from "react-hook-form";

import Error from "components/common/Error";
import DatePickerField from "components/common/Fields/DatePickerField";
import TextInputField from "components/common/Fields/TextInputField";
import { TICKET_TYPE_OPTIONS, TIMES_LIMIT_TICKET_TYPE_NAME, TIMES_LIMIT_TICKET_TYPE_OPTIONS } from "constants/ticket";

type Props = RadioGroupProps & {
  control: Control<any>;
  errors: FieldErrors<any>;
  defaultValue?: string | number | boolean;
  watch: UseFormWatch<any>;
  disabled?: boolean;
  disabledItems?: string[];
};

export default function ChooseTicketTypeRadioButtonsField(props: Props) {
  const { name, control, errors, watch, defaultValue, disabled, disabledItems = [], ...radioGroupProps } = props;

  const type = watch("type");

  return (
    <Controller
      name="type"
      control={control}
      defaultValue={defaultValue}
      render={({ field }) => {
        return (
          <RadioGroup {...radioGroupProps} {...field}>
            {TICKET_TYPE_OPTIONS.map(({ value, label }) => (
              <div key={label}>
                <FormControlLabel
                  key={label} value={value} label={label} control={<Radio size="small" disabled={!!disabled || disabledItems.includes(value)} />} />

                {Boolean([TicketType.Monthly, TicketType.MasterMonthly, TIMES_LIMIT_TICKET_TYPE_NAME].includes(type) && value === type) && (
                  <div className="ml-7 flex flex-col justify-end mt-2">
                    {
                      Boolean(type === TIMES_LIMIT_TICKET_TYPE_NAME) && (
                        <Controller name="timesLimitType"
                          control={control}
                          render={({ field }) =>
                            (
                              <RadioGroup row className="flex flex-row flex-nowrap gap-3 w-auto"{...field}>
                                {TIMES_LIMIT_TICKET_TYPE_OPTIONS.map(({ value: timesLimitType, label: timesLimitTypeLabel }) => (
                                  <FormControlLabel
                                    key={timesLimitTypeLabel}
                                    value={timesLimitType}
                                    label={timesLimitTypeLabel}
                                    control={<Radio size="small" value={timesLimitType} />}
                                  />
                                ))}
                              </RadioGroup>
                            )}
                        />
                      ) 
                    }
                    
                    {/*Total days to use*/}
                    <div className="flex items-center">
                      <p className="w-[250px] md:w-[180px]">{type === TIMES_LIMIT_TICKET_TYPE_NAME ? "購入日から" : "利用希望スタート日から"}</p>
                      <TextInputField
                        name="totalDaysInUseFromStart"
                        error={!!errors.totalDaysInUseFromStart}
                        type="number"
                        control={control}
                        placeholder="1"
                        inputProps={{ className: "ad-input-field px-4 !py-3 text-right" }}
                        className="ad-input-field !w-[110px]"
                      />
                      <span className="w-[32px]">日間</span>
                    </div>
                    {errors.totalDaysInUseFromStart && <Error message={errors.totalDaysInUseFromStart.message} className="mt-1" />}
                    
                    {/*Start - End Sale At*/}
                    <div className="mt-2 md:w-full">
                      <div className="flex items-center md:flex-col md:items-start md:gap-y-2">
                        <p className="w-[250px] md:w-[180px]">販売期間設定</p>
                        <div className="flex gap-4 items-center">
                          <DatePickerField
                            name="startSaleAt"
                            control={control}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                error={!!errors.startSaleAt}
                                className="flex justify-between ad-input-field w-[195px] md:w-[170px]"
                                inputProps={{ className: "ad-input-field !py-3", ...params.inputProps }}
                              />
                            )}
                          />

                          <p>〜</p>

                          <DatePickerField
                            name="endSaleAt"
                            control={control}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                error={!!errors.startSaleAt}
                                className="flex justify-between ad-input-field w-[195px] md:w-[170px]"
                                inputProps={{ className: "ad-input-field !py-3", ...params.inputProps }}
                              />
                            )}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-16 mt-1 md:gap-6">
                        {(errors.startSaleAt || errors.endSaleAt) && <Error message={errors?.startSaleAt?.message || errors?.endSaleAt?.message} />}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </RadioGroup>
        );
      }}
    />
  );
}
