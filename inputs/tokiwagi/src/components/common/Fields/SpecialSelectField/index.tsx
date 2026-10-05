import { MenuItem, Select, SelectProps } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Image from "next/legacy/image";
import { Controller , Control } from "react-hook-form";

import ArrowDownMobileIcon from "statics/images/arrow-down-mobile.svg";
import ArrowDownIcon from "statics/images/arrow-down.svg";

import styles from "./index.module.scss";

interface Props extends SelectProps<any> {
  name: string;
  control: Control<any>;
  options: {
    value: any;
    label: string;
  }[];
  defaultValue?: unknown;
  label?: string;
  currentValue?: any;
  shouldDisable?: boolean;
  handleChange?: (data: any) => void;
}

export default function SpecialSelectField(props: Props) {
  const { currentValue, name, control, options, defaultValue, handleChange, shouldDisable, ...selectProps } = props;
  const defaultValueInput = defaultValue !== undefined ? defaultValue : "";

  return (
    <div>
      {/*DESKTOP*/}
      <div className="xs:hidden">
        <div className={`${styles.specialSelect} flex w-[824px] h-[60px] md:w-full md:h-[54px]`}>
          <div className={`${styles.label} min-w-[294px] md:min-w-[262px] pl-10 flex items-center`}>
            <p className="text-xl font-bold md:text-lg">店舗選択</p>
          </div>
          <FormControl className="w-full">
            {!currentValue && (
              <InputLabel id="choose-tenant-label" className="text-base font-medium text-[#979797]" shrink={false}>
                店舗を選択してください
              </InputLabel>
            )}
            <Controller
              name={name}
              control={control}
              defaultValue={defaultValueInput}
              render={({ field: { onChange, ...field } }) => (
                <Select
                  MenuProps={{ disablePortal: true }}
                  {...selectProps}
                  {...field}
                  onChange={(e) => {
                    onChange(e);
                    handleChange && handleChange(e.target.value);
                  }}
                  className={`${styles.select} ${selectProps.className}`}
                  IconComponent={() => (
                    <div className="absolute right-0 translate-y-[-50%] top-1/2 pr-4 flex">
                      <Image src={ArrowDownIcon} alt="ArrowDownIcon" width={32} height={32} />
                    </div>
                  )}
                  SelectDisplayProps={{
                    className: "z-10",
                  }}
                  disabled={shouldDisable}
                >
                  {options.map(({ value, label }) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>
        </div>
      </div>

      {/*MOBILE*/}
      <div className="xsup:hidden">
        <div className={`${styles.specialSelect} flex w-full h-[60px] xs:!h-[48px]`}>
          <FormControl className="w-full">
            {!currentValue && (
              <InputLabel
                id="choose-tenant-label"
                className="!ml-4 !text-xl !font-bold !text-white xs:!translate-y-[10px] xs:!translate-x-[10px]"
                shrink={false}
              >
                店舗選択
              </InputLabel>
            )}

            <Controller
              name={name}
              control={control}
              defaultValue={defaultValueInput}
              render={({ field: { onChange, ...field } }) => (
                <Select
                  MenuProps={{ disablePortal: true }}
                  {...selectProps}
                  {...field}
                  className={`${styles.select} ${selectProps.className}`}
                  IconComponent={() => (
                    <div className="absolute right-4 translate-y-[-50%] top-1/2 flex">
                      <Image src={ArrowDownMobileIcon} alt="ArrowDownMobileIcon" className="text-white" />
                    </div>
                  )}
                  SelectDisplayProps={{
                    className: "z-10",
                  }}
                  disabled={shouldDisable}
                  onChange={(e) => {
                    onChange(e);
                    handleChange && handleChange(e.target.value);
                  }}
                >
                  {options.map(({ value, label }) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>
        </div>
      </div>
    </div>
  );
}
