import { Control, FieldError } from "react-hook-form";
import * as React from "react";

import Error from "components/common/Error";
import TextInputField from "components/common/Fields/TextInputField";

type Props = {
  description?: React.ReactNode;
  control: Control<any, any>;
  errors: {
    subEmail?: FieldError;
  };
};

export default function SubEmailField({ control, errors, description }: Props) {
  return (
    <div className="px-8 mt-20 xs:mt-8 xs:px-0">
      {/*Sub email*/}
      <div>
        <div className="flex xs:flex-col xs:gap-2">
          <h2 className="text-[24px] leading-[32px] font-medium w-[260px] flex items-center xs:text-base xs:font-medium xs:mb-2">サブメールアドレス</h2>
          <div className="flex-1">
            <TextInputField
              name="subEmail"
              control={control}
              placeholder="abc@gmail.com"
              inputProps={{
                className: "border-0 usr-input-field py-[14px] px-[16px]",
                maxLength: 256,
              }}
              className="w-full usr-input-field"
            />
            {errors?.subEmail && <Error message={errors.subEmail.message} />}
          </div>
        </div>
      </div>
      <div className="flex items-center mt-4 xs:flex-col">
        <div className="w-[260px]"></div>
        <p className="flex-1 pr-24 text-[14px] leading-[20px] xs:pr-0 font-light md:pr-0">
          {
            description
              ? (description)
              : (
                <>
                  ※おとな2人以上でご利用の場合、もう1名ご入力ください。
                  <br />
                  入退場時に必要になる場合がございます。
                </>
              )
          }
        </p>
      </div>
    </div>
  );
}