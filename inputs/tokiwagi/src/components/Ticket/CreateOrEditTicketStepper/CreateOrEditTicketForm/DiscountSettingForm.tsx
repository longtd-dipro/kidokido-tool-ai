import TextInputField from "components/common/Fields/TextInputField";
import Error from "components/common/Error";
import Button from "components/common/Buttons/Button";
import { START_DISCOUNT_THRESHOLD } from "utils/discount";
import FileUploadField from "components/common/Fields/FileUploadField";
import { useSmaregiEnabled } from "libs/hooks/useSmaregiEnabled";

export interface Props {
  fieldName: string;
  fields: any[];
  control: any;
  remove: any;
  errors: any;
  index: number;
  subtitle?: string;
  tenantCode?: string;
}

export default function DiscountSettingForm({
  fieldName,
  fields,
  control,
  remove,
  errors,
  index,
  subtitle,
  tenantCode,
}: Props) {
  const handleRemove = () => {
    remove(index);
  };

  const { isEnabledSmaregi } = useSmaregiEnabled(tenantCode);

  return (
    <div className="bg-[#F3FAFF] rounded-[10px] flex gap-16 mb-6 md:gap-6">
      <div className="w-full m-4">
        <div className="relative flex justify-between">
          {/*Title*/}
          <p className="font-bold mx-4 md:mx-0">
            {index + START_DISCOUNT_THRESHOLD}枚目の購入に対する割引：
          </p>

          {/*Remove Button*/}
          {/*Only show remove button for the last item from the second block*/}
          {index > 0 && index === fields.length - 1 && (
            <div className="absolute right-0 md:right-8">
              <Button
                variant="outlined"
                className="w-[125px] h-[40px] !text-base !font-medium !p-0"
                onClick={handleRemove}
              >
                キャンセル
              </Button>
            </div>
          )}
        </div>

        <div className="mx-8 md:mx-4">
          {/*Subtitle*/}
          {subtitle ? (
            <div className="mt-4">
              <p className="mb-4 font-bold -ml-2">{subtitle}</p>
            </div>
          ) : (
            <div className="h-4"></div>
          )}
          <div className="mt-4">
            <div className="flex flex-col gap-3">
              <div>
                <div className="flex gap-[56px] md:gap-[30px] items-start">
                  {/*Adult discount amount*/}
                  <div>
                    <div className="flex items-center gap-3">
                      <p>おとな：</p>
                      <div className="flex items-center gap-4 md:gap-2">
                        <TextInputField
                          name={`${fieldName}.${index}.adultDiscountAmount`}
                          error={
                            errors[fieldName]?.[index]?.adultDiscountAmount
                          }
                          control={control}
                          inputProps={{
                            className:
                              "ad-input-field px-4 !py-2 text-right !bg-white",
                            maxLength: 10,
                          }}
                          className="ad-input-field w-[162px] md:w-[120px] !border !border-solid !border-[#D9D9D9]"
                        />
                        <p>円割引</p>
                      </div>
                    </div>
                    {
                      errors[fieldName]?.length &&
                      errors[fieldName][index]?.adultDiscountAmount && (
                        <div className="mt-2 mb-1">
                          <Error
                            message={
                              errors[fieldName]?.[index]?.adultDiscountAmount
                                ?.message
                            }
                          />
                        </div>
                      )
                    }
                  </div>
                  {isEnabledSmaregi &&
                    < div >
                      <div className="flex items-center gap-3">
                        <p>決済バーコード：</p>
                        <div className="flex items-center gap-4 md:gap-2">
                          <FileUploadField
                            className="w-[162px] md:w-[120px]"
                            name={`${fieldName}.${index}.adultSmaregiQRCodeUrl`}
                            control={control}
                            accept="image/jpeg,image/png,image/jpg"
                          />
                        </div>
                      </div>
                      {
                        errors[fieldName]?.length &&
                        errors[fieldName][index]?.adultSmaregiQRCodeUrl && (
                          <div className="mt-2 mb-1">
                            <Error
                              message={
                                errors[fieldName]?.[index]
                                  ?.adultSmaregiQRCodeUrl?.message
                              }
                            />
                          </div>
                        )
                      }
                    </div>
                  }
                  <div>
                    <div className="flex items-center gap-3">
                      <p>OBIC：</p>
                      <TextInputField
                        name={`${fieldName}.${index}.adultObicCode`}
                        error={errors[fieldName]?.[index]?.adultObicCode}
                        control={control}
                        className="ad-input-field w-[162px] md:w-[120px]"
                        inputProps={{
                          className:
                            "ad-input-field px-4 !py-2 text-right !bg-white",
                          placeholder: "KOK0005",
                        }}
                      />
                    </div>
                    {
                      errors[fieldName]?.length &&
                      errors[fieldName][index]?.adultObicCode && (
                        <div className="mt-1">
                          <Error
                            message={
                              errors[fieldName]?.[index]?.adultObicCode
                                ?.message
                            }
                          />
                        </div>
                      )
                    }
                  </div>
                </div>
              </div>
              <div className="flex gap-[56px] md:gap-[30px]">
                {/*Child discount amount*/}
                <div>
                  <div className="flex items-center gap-3">
                    <p>子ども：</p>
                    <div className="flex items-center gap-4 md:gap-2">
                      <TextInputField
                        name={`${fieldName}.${index}.childDiscountAmount`}
                        error={
                          errors[fieldName]?.[index]?.childDiscountAmount
                        }
                        control={control}
                        inputProps={{
                          className:
                            "ad-input-field px-4 !py-2 text-right !bg-white",
                          maxLength: 10,
                        }}
                        className="ad-input-field w-[162px] md:w-[120px] !bg-white !border !border-solid !border-[#D9D9D9]"
                      />
                      <p>円割引</p>
                    </div>
                  </div>
                  {
                    errors[fieldName]?.length &&
                    errors[fieldName][index]?.childDiscountAmount && (
                      <div className="mt-2 mb-1">
                        <Error
                          message={
                            errors[fieldName]?.[index]?.childDiscountAmount
                              ?.message
                          }
                        />
                      </div>
                    )
                  }
                </div>
                {isEnabledSmaregi &&
                  < div >
                    <div className="flex items-center gap-3">
                      <p>決済バーコード：</p>
                      <div className="flex items-center gap-4 md:gap-2">
                        <FileUploadField
                          className="w-[162px] md:w-[120px]"
                          name={`${fieldName}.${index}.childSmaregiQRCodeUrl`}
                          control={control}
                          accept="image/jpeg,image/png,image/jpg"
                        />
                      </div>
                    </div>
                    {
                      errors[fieldName]?.length &&
                      errors[fieldName][index]?.childSmaregiQRCodeUrl && (
                        <div className="mt-2 mb-1">
                          <Error
                            message={
                              errors[fieldName]?.[index]?.childSmaregiQRCodeUrl
                                ?.message
                            }
                          />
                        </div>
                      )
                    }
                  </div>
                }
                <div>
                  <div className="flex items-center gap-3">
                    <p>OBIC：</p>
                    <TextInputField
                      name={`${fieldName}.${index}.childObicCode`}
                      error={errors[fieldName]?.[index]?.childObicCode}
                      control={control}
                      className="ad-input-field w-[162px] md:w-[120px]"
                      inputProps={{
                        className:
                          "ad-input-field px-4 !py-2 text-right !bg-white",
                        placeholder: "KOK0005",
                      }}
                    />
                  </div>
                  {
                    errors[fieldName]?.length &&
                    errors[fieldName][index]?.childObicCode && (
                      <div className="mt-1">
                        <Error
                          message={
                            errors[fieldName]?.[index]?.childObicCode?.message
                          }
                        />
                      </div>
                    )
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}
