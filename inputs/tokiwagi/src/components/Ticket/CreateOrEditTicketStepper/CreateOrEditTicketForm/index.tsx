import { yupResolver } from "@hookform/resolvers/yup";
import { Checkbox, Chip, TextField } from "@mui/material";
import { PaymentType, PriceUnit, Prisma, TicketType } from "@prisma/client";
import { cloneDeep } from "lodash";
import { useSession } from "next-auth/react";
import Image from "next/legacy/image";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { useDispatch } from "react-redux";

import ChooseTicketTypeRadioButtonsField from "components/Ticket/CreateOrEditTicketStepper/ChooseTicketTypeRadioButtonsField";
import Label from "components/common/Admin/Label";
import AdminButton from "components/common/Buttons/AdminButton";
import UserSiteLoadingButton from "components/common/Buttons/LoadingButton";
import Error from "components/common/Error";
import AutocompleteField from "components/common/Fields/AutocompleteField";
import RadioButtonsField from "components/common/Fields/RadioButtonsField";
import SelectField from "components/common/Fields/SelectField";
import TextInputField from "components/common/Fields/TextInputField";
import Spinner from "components/common/Spinner";
import { MAX_LENGTH_TICKET_CODE, ROLE } from "constants/common";
import {
  AGE_UNIT_OPTIONS,
  INPUT_PRICE_UNIT_OPTIONS,
  PAYMENT_TYPE_OPTIONS,
  PROMOTION_TICKET_TYPE_NAME,
  SETTING_BOOKING_IN_ADVANCE_OPTIONS,
  TIMES_LIMIT_PAYMENT_TYPE_OPTIONS,
  TIMES_LIMIT_SETTING_BOOKING_IN_ADVANCE_OPTIONS,
  TIMES_LIMIT_TICKET_TYPE_NAME,
  VISIBILITY_OPTIONS,
  YES_NO_OPTIONS,
} from "constants/ticket";
import { ticketFormDataSchema } from "libs/validation/ticketSchema";
import { Tenant } from "models/Entity";
import { TicketFormData, TicketPayload, TicketDetailPayload } from "models/Ticket";
import { DiscountSettingItem, HourlyExtraTimeDiscountSetting } from "models/Discount";
import { AgeUnit } from "models/enums";
import { fetchTenants } from "services/api-client/admin/tenant.service";
import { checkHasBooking } from "services/api-client/admin/ticket.service";
import ExportIcon from "statics/images/export.svg";
import XIcon from "statics/images/x.svg";
import DiscountSettingForm from "components/Ticket/CreateOrEditTicketStepper/CreateOrEditTicketForm/DiscountSettingForm";
import { START_DISCOUNT_THRESHOLD } from "utils/discount";
import InsertNewDiscountSetting from "components/Ticket/CreateOrEditTicketStepper/CreateOrEditTicketForm/InsertNewDiscountSetting";
import TimePickerField from "components/common/Fields/TimePickerField";
import FileUploadField from "components/common/Fields/FileUploadField";
import { useSmaregiEnabled } from "libs/hooks/useSmaregiEnabled";
import { upload } from "services/api-client/upload.service";
import { NotificationType, showNotification } from "stores/reducers/notification";

import styles from "./index.module.scss";

const checkboxIcon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedCheckboxIcon = <CheckBoxIcon fontSize="small" />;

const DEFAULT_FORM_VALUES = {
  name: "",
  visibility: "",
  tenantCode: "",
  slaveTenantCodes: undefined,
  displayOrder: "",

  childAgeLimitFrom: "",
  childAgeLimitTo: "",
  childAgeLimitFromUnit: AgeUnit.Month,
  childAgeLimitToUnit: AgeUnit.Year,

  maxChildPerAdult: "",

  totalDaysInUseFromStart: undefined,
  adultPrice: undefined,
  childPrice: undefined,

  limitTimes: undefined,
  extraTimes: undefined,

  adultTicketCode: "",
  childTicketCode: "",

  baseAdultPeriodUnit: PriceUnit.Minute,
  baseChildPeriodUnit: PriceUnit.Minute,
  extendedAdultPeriodUnit: PriceUnit.Minute,
  extendedChildPeriodUnit: PriceUnit.Minute,

  enableDiscount: "false",

  canBookInAdvance: "",
  paymentType: "",
  type: "",
  timesLimitType: "",
  requiredAgreement: "",

  discountSettings: [],
  enableHourlyExtraTimeDiscount: "false",
  hourlyExtraTimeDiscountSettings: [],

  enableExpirationRemind: "",
  expirationRemindBeforeInDay: null,
};

type Props = {
  onSave: (ticket: TicketPayload) => Promise<void>;
  ticket?: TicketFormData;
  isCreateMode?: boolean;
};

export default function CreateOrEditTicketForm({ onSave, ticket, isCreateMode }: Props) {
  const { data: session } = useSession();

  // State
  const [errMsg, setErrMsg] = useState<string>();
  const [mustDisableSubmit, setMustDisableSubmit] = useState<boolean>(false);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasBookingOfTicket, setHasBookingOfTicket] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const dispatch = useDispatch();

  // Function
  const transformDefaultTicket = (ticket: TicketFormData) => {
    const result = cloneDeep(ticket);
    result.childAgeLimitFromUnit = result.childAgeLimitFrom >= 12 ? AgeUnit.Year : AgeUnit.Month;
    result.childAgeLimitFrom >= 12 && (result.childAgeLimitFrom /= 12);
    result.childAgeLimitToUnit = result.childAgeLimitTo >= 12 ? AgeUnit.Year : AgeUnit.Month;
    result.childAgeLimitTo >= 12 && (result.childAgeLimitTo /= 12);
    result.enableDiscount = result.enableDiscount ? "true" : "false";
    result.enableHourlyExtraTimeDiscount = result.enableHourlyExtraTimeDiscount ? "true" : "false";
    result.enableExpirationRemind = result.enableExpirationRemind ? "true" : "false";
    result.adultTicketCode = result.adultTicketCode.toString().padStart(MAX_LENGTH_TICKET_CODE, "0");
    result.childTicketCode = result.childTicketCode.toString().padStart(MAX_LENGTH_TICKET_CODE, "0");
    return result;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrMsg("");
      const results = await fetchTenants();
      setTenants(results);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCheckingHasBooking = async (ticketId: number) => {
    try {
      setErrMsg("");
      const { hasBooking } = await checkHasBooking(ticketId);
      setHasBookingOfTicket(hasBooking);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  const uploadImageFile = async (imageFile: any) => {
    try {
      const res = await upload(imageFile);
      return res.fileName;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      dispatch(showNotification({ type: NotificationType.ERROR, message }));
    }
  };

  const resolveFile = async (fileOrUrl?: string | File) => {
    if (fileOrUrl instanceof File) {
      return await uploadImageFile(fileOrUrl);
    }
    return fileOrUrl;
  };

  const prepareBasicTicketDataToSubmit = async (data: TicketFormData): Promise<TicketPayload> => {
    const clonedData = cloneDeep(data);

    const {
      totalDaysInUseFromStart,
      adultPrice,
      adultSmaregiQRCodeUrl,
      adultSmaregiQRCodeUrl1stBooking,
      adultObicCode,
      adultObicCode1stBooking,
      childPrice,
      childSmaregiQRCodeUrl,
      childSmaregiQRCodeUrl1stBooking,
      childObicCode,
      childObicCode1stBooking,
      startSaleAt,
      endSaleAt,

      enableDiscount,
      enableHourlyExtraTimeDiscount,
      discountAdultSmaregiQRCodeUrl,
      discountChildSmaregiQRCodeUrl,
      discountAdultObicCode,
      discountChildObicCode,
      requiredAgreement,

      childAgeLimitFromUnit,
      childAgeLimitToUnit,

      cancelOrChangeAvailableUtil,
      type: enteredType,
      timesLimitType,
      limitTimes,
      extraTimes,
      ...ticketFormData
    } = clonedData;

    const isGroupTicket = ([TicketType.Monthly, TicketType.MasterMonthly] as string[]).includes(enteredType) ||
      enteredType === TIMES_LIMIT_TICKET_TYPE_NAME;

    childAgeLimitFromUnit === AgeUnit.Year && (ticketFormData.childAgeLimitFrom *= 12);
    childAgeLimitToUnit === AgeUnit.Year && (ticketFormData.childAgeLimitTo *= 12);
    let type = enteredType;
    if (enteredType === PROMOTION_TICKET_TYPE_NAME) {
      type = TicketType.Hourly;
    } else if (enteredType === TIMES_LIMIT_TICKET_TYPE_NAME) {
      type = timesLimitType;
    }
    const isPromotion = enteredType === PROMOTION_TICKET_TYPE_NAME;
    let discountSettings = [];
    if (enableDiscount) {
      for (const item of data.discountSettings) {
        item.adultSmaregiQRCodeUrl = await resolveFile(item.adultSmaregiQRCodeUrl);
        item.childSmaregiQRCodeUrl = await resolveFile(item.childSmaregiQRCodeUrl);
      }

      discountSettings = data.discountSettings
        .filter(item => item.childDiscountAmount !== undefined)
        .map((item, index): DiscountSettingItem => {
          return {
            threshold: START_DISCOUNT_THRESHOLD + index,
            ...item
          };
        });
    }

    let hourlyExtraTimeSetting: HourlyExtraTimeDiscountSetting = Prisma.JsonNull as any;
    if (enteredType === TicketType.Hourly || enteredType === TicketType.HourlyTimesLimit) {
      if (enableHourlyExtraTimeDiscount === true && data.hourlyExtraTimeDiscountSettings) {
        for (const item of data.hourlyExtraTimeDiscountSettings) {
          item.adultSmaregiQRCodeUrl = await resolveFile(item.adultSmaregiQRCodeUrl);
          item.childSmaregiQRCodeUrl = await resolveFile(item.childSmaregiQRCodeUrl);
        }
      }
      const hourlyExtraTimeDiscountSettings = enableHourlyExtraTimeDiscount === true ? data.hourlyExtraTimeDiscountSettings
        .filter(item => item.childDiscountAmount !== undefined)
        .map((item, index): DiscountSettingItem => {
          return {
            threshold: START_DISCOUNT_THRESHOLD + index,
            ...item
          };
        }) : [];

      hourlyExtraTimeSetting = {
        enable: enableHourlyExtraTimeDiscount === true,
        setting: hourlyExtraTimeDiscountSettings
      };
    }

    const ticketDetail = {
      enableDiscount: enableDiscount as boolean,

      requiredAgreement: requiredAgreement as boolean,
    } as TicketDetailPayload;
    if (isGroupTicket) {
      ticketDetail.totalDaysInUseFromStart = totalDaysInUseFromStart ? +totalDaysInUseFromStart : null;
      ticketDetail.adultPrice = adultPrice ? +adultPrice : 0;
      ticketDetail.childPrice = childPrice ? +childPrice : 0;
      ticketDetail.startSaleAt = startSaleAt;
      ticketDetail.endSaleAt = endSaleAt;
      ticketDetail.limitTimes = limitTimes ? +limitTimes : null;
      ticketDetail.extraTimes = extraTimes ? +extraTimes : null;
      const [adultUrl, childUrl, childUrl1stBooking] = await Promise.all([
        resolveFile(adultSmaregiQRCodeUrl),
        resolveFile(childSmaregiQRCodeUrl),
        resolveFile(childSmaregiQRCodeUrl1stBooking),
      ]);
      ticketDetail.adultSmaregiQRCodeUrl = adultUrl;
      setValue("adultSmaregiQRCodeUrl", adultUrl);
      ticketDetail.adultSmaregiQRCodeUrl1stBooking = adultUrl;
      setValue("adultSmaregiQRCodeUrl1stBooking", adultUrl);
      ticketDetail.childSmaregiQRCodeUrl = childUrl;
      setValue("childSmaregiQRCodeUrl", childUrl);
      ticketDetail.childSmaregiQRCodeUrl1stBooking = childUrl1stBooking;
      setValue("childSmaregiQRCodeUrl1stBooking", childUrl1stBooking);
      ticketDetail.discountAdultSmaregiQRCodeUrl = discountAdultSmaregiQRCodeUrl;
      ticketDetail.discountChildSmaregiQRCodeUrl = discountChildSmaregiQRCodeUrl;
      ticketDetail.adultObicCode = adultObicCode;
      ticketDetail.adultObicCode1stBooking = adultObicCode;
      ticketDetail.childObicCode = childObicCode;
      ticketDetail.childObicCode1stBooking = childObicCode1stBooking;
      ticketDetail.discountAdultObicCode = discountAdultObicCode;
      ticketDetail.discountChildObicCode = discountChildObicCode;
    }

    const ticketPayload = {
      type,
      isPromotion,
      ...ticketFormData,
      TicketDetail: ticketDetail,
      TicketDiscountSetting: {
        setting: discountSettings,
        hourlyExtraTimeSetting,
      }
    };

    delete ticketPayload.discountSettings;
    delete ticketPayload.hourlyExtraTimeDiscountSettings;
    return ticketPayload;
  };

  const onFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setValue("videoUrl", file, { shouldValidate: true });
    }
  };

  const onSubmit = async (data: TicketFormData) => {
    setErrMsg("");
    setIsSubmitting(true);
    const ticketPayload = await prepareBasicTicketDataToSubmit(data);
    if (isMasterMonthlyTicket) {
      try {
        await onSave(ticketPayload);
      } catch (err) {
        const message = err.response?.data?.error || err.message;
        setErrMsg(message);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      onSave(ticketPayload);
      setMustDisableSubmit(true);
      setIsSubmitting(false);
    }
  };

  // Variable
  const {
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    control,
    setValue,
    getValues,
  } = useForm<TicketFormData>({
    resolver: yupResolver(ticketFormDataSchema),
    defaultValues: ticket ? transformDefaultTicket(ticket) : DEFAULT_FORM_VALUES,
  });

  const type = watch("type");
  const timesLimitType = watch("timesLimitType");

  const videoUrl = watch("videoUrl") as any;
  const isAdminRole = session.user.role === ROLE.ADMIN;
  const isMasterMonthlyTicket = type === TicketType.MasterMonthly;
  const isSlaveMonthlyTicket = !!ticket?.masterTicketId;
  const slaveTenantCodes = watch("slaveTenantCodes");
  const isTimesLimitTicketSelected = type === TIMES_LIMIT_TICKET_TYPE_NAME;
  const defaultFormValues = (isCreateMode || !ticket) ? [] : {
    tenantCode: isSlaveMonthlyTicket ? ticket?.tenantCode : "",
    type: (isSlaveMonthlyTicket || isMasterMonthlyTicket) ? ticket.type : ""
  };

  const enableDiscount = watch("enableDiscount") === "true";
  const enableExpirationRemind = watch("enableExpirationRemind") === "true";

  const {
    fields: discountFields,
    remove: removeDiscountField,
    append: appendDiscountField
  } = useFieldArray({
    control,
    name: "discountSettings",
  });
  const [inputDiscountSettings] = watch(["discountSettings"]);

  const [selectedTenant] = watch(["tenantCode"]);

  const { isEnabledSmaregi } = useSmaregiEnabled(selectedTenant?.code);
  const enableHourlyExtraTimeDiscount = watch("enableHourlyExtraTimeDiscount") === "true";
  const {
    fields: hourlyExtraTimeDiscountFields,
    remove: removeHourlyExtraTimeDiscountField,
    append: appendHourlyExtraTimeDiscountField
  } = useFieldArray({
    control,
    name: "hourlyExtraTimeDiscountSettings",
  });
  const [inputHourlyExtraTimeDiscountSettings] = watch(["hourlyExtraTimeDiscountSettings"]);

  const handleInsertNewDiscountSetting = () => {
    const defaultValue = {
      adultDiscountAmount: undefined,
      childDiscountAmount: undefined,
    };

    appendDiscountField(defaultValue);
  };

  const handleInsertNewHourlyExtraTimeDiscountSetting = () => {
    const defaultValue = {
      adultDiscountAmount: undefined,
      childDiscountAmount: undefined,
    };

    appendHourlyExtraTimeDiscountField(defaultValue);
  };

  useEffect(() => {
    if (inputDiscountSettings && inputDiscountSettings.length == 0) {
      handleInsertNewDiscountSetting();
    }
  }, [inputDiscountSettings]);

  useEffect(() => {
    if (inputHourlyExtraTimeDiscountSettings && inputHourlyExtraTimeDiscountSettings.length == 0) {
      handleInsertNewHourlyExtraTimeDiscountSetting();
    }
  }, [inputHourlyExtraTimeDiscountSettings]);

  // Effect
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (ticket?.id && !isCreateMode) {
      fetchCheckingHasBooking(ticket.id);
    }
  }, [ticket]);

  useEffect(() => {
    if (type === TIMES_LIMIT_TICKET_TYPE_NAME) {
      setValue("paymentType", PaymentType.Online);
      setValue("canBookInAdvance", true);
      setValue("timesLimitType", ticket?.timesLimitType || TicketType.DailyTimesLimit);
    } else {
      if (type === PROMOTION_TICKET_TYPE_NAME) {
        setValue("maxChildPerAdult", 1);
      }
      setValue("timesLimitType", "");
    }
  }, [type]);

  const getRenderAdultPriceHtml = (isEnabledSmaregi) => {
    return (
      <div className="flex gap-6 mdonly:gap-4 items-start">
        <div>
          <div className="flex items-center gap-4">
            <p className="mr-8 whitespace-nowrap shrink-0">おとな:</p>
            <TextInputField
              name="adultPrice"
              error={!!errors.adultPrice}
              type="number"
              control={control}
              inputProps={{ className: "ad-input-field px-4 !py-3 text-right" }}
              className="ad-input-field w-[106px]"
            />
            <p>円</p>
          </div>
          {errors.adultPrice && <Error message={errors.adultPrice.message} className="mt-2" />}
        </div>
        {
          isEnabledSmaregi &&
          <div>
            <div className="flex items-center gap-3">
              <p className="block w-[292px]">決済バーコード:</p>
              <FileUploadField
                className="w-[108px] md:w-[140px] h-[47px] mdonly:h-[44px]"
                name="adultSmaregiQRCodeUrl"
                control={control}
                accept="image/jpeg,image/png,image/jpg"
              />
            </div>
            {errors.adultSmaregiQRCodeUrl && <Error message={errors.adultSmaregiQRCodeUrl.message} className="mt-2" />}
          </div>
        }
        <div>
          <div className="flex items-center gap-3">
            <p className="mr-8">OBIC：</p>
            <TextInputField
              name="adultObicCode"
              error={!!errors.adultObicCode}
              control={control}
              inputProps={{ className: "w-[140px] ad-input-field px-4 !py-3", placeholder: "KOK0005" }}
            />
          </div>
          {errors.adultObicCode && <Error message={errors.adultObicCode.message} className="mt-1" />}
        </div>
      </div>
    );
  };
  const getRenderChildPriceHtml = (isEnabledSmaregi) => {
    return (
      <div className="flex gap-6 mdonly:gap-4 items-start mt-4">
        <div>
          <div className="flex items-center gap-4">
            <p className="mr-8 whitespace-nowrap shrink-0">子ども:</p>
            <TextInputField
              name="childPrice"
              error={!!errors.childPrice}
              type="number"
              control={control}
              inputProps={{ className: "ad-input-field px-4 !py-3 text-right" }}
              className="ad-input-field w-[106px]"
            />
            <p>円</p>
          </div>
          {errors.childPrice && <Error message={errors.childPrice.message} className="mt-2" />}
        </div>
        {
          isEnabledSmaregi &&
          <div className="flex flex-col gap-3">
            <div>
              <div className="flex items-center gap-3">
                <p className="block w-[292px]">決済バーコード（初回）：</p>
                <FileUploadField
                  className="w-[108px] md:w-[140px] h-[47px] mdonly:h-[44px]"
                  name="childSmaregiQRCodeUrl1stBooking"
                  control={control}
                  accept="image/jpeg,image/png,image/jpg"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <p className="block w-[292px]">決済バーコード（2回目以降）：</p>
                <FileUploadField
                  className="w-[108px] md:w-[140px] h-[47px] mdonly:h-[44px]"
                  name="childSmaregiQRCodeUrl"
                  control={control}
                  accept="image/jpeg,image/png,image/jpg"
                />
              </div>
            </div>
          </div>
        }
        <div className="flex flex-col gap-3">
          <div>
            <div className="flex items-center gap-3">
              <p className="mr-8">OBIC：</p>
              <TextInputField
                name="childObicCode1stBooking"
                error={!!errors.childObicCode1stBooking}
                control={control}
                inputProps={{ className: "w-[140px] ad-input-field px-4 !py-3", placeholder: "KOK0005" }}
              />
            </div>
            {errors.childObicCode1stBooking && <Error message={errors.childObicCode1stBooking.message} className="mt-1" />}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <p className="mr-8">OBIC：</p>
              <TextInputField
                name="childObicCode"
                error={!!errors.childObicCode}
                control={control}
                inputProps={{ className: "w-[140px] ad-input-field px-4 !py-3", placeholder: "KOK0005" }}
              />
            </div>
            {errors.childObicCode && <Error message={errors.childObicCode.message} className="mt-1" />}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className="flex items-center gap-2 mb-16 heading">
        <div className={`${styles.line} w-[146px]`}></div>
        <div className="flex items-center gap-4">
          <AdminButton className={`!min-w-[32px] h-[32px] !p-0 !rounded-full !cursor-default !text-white !font-bold ${styles.buttonNumber}`}>1</AdminButton>
          <div className="text-xl font-bold">商品の基本設定</div>
        </div>

        <div className={`${styles.line} flex-1`}></div>
      </div>
      <div className="flex flex-col justify-center items-center px-[40px] mx-auto md:px-[30px]">
        {loading && (
          <div className="flex justify-center mb-8">
            <Spinner />
          </div>
        )}

        {!loading && (
          <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
            <fieldset disabled={mustDisableSubmit} className="min-w-0">
              {/*Name*/}
              <div className="mb-6">
                <div className="flex items-center gap-16 md:gap-6">
                  <Label className="text-base min-w-[230px] text-right md:min-w-[180px]" isRequired={true}>
                    <span className="mr-2">商品名</span>
                  </Label>
                  <TextInputField
                    name="name"
                    error={!!errors.name}
                    control={control}
                    placeholder="当日時間制パス"
                    inputProps={{ className: "ad-input-field px-4 py-3 font-medium", maxLength: 256 }}
                    className="w-full ad-input-field"
                  />
                </div>
                <div className="flex items-center gap-16 mt-2 md:gap-6">
                  <div className="min-w-[230px] md:min-w-[180px]"></div>
                  {errors.name && <Error message={errors.name.message} />}
                </div>
              </div>

              {/*Type*/}
              <div className="mb-6">
                <div className="flex items-start gap-16 md:gap-6">
                  <Label className="text-base min-w-[230px] text-right md:min-w-[180px]" isRequired={true}>
                    <span className="mr-2">商品のタイプ</span>
                  </Label>
                  <div>
                    <div className="flex md:flex-col">
                      <ChooseTicketTypeRadioButtonsField
                        control={control}
                        errors={errors}
                        watch={watch}
                        disabled={(!isCreateMode) && (isMasterMonthlyTicket || isSlaveMonthlyTicket)}
                        disabledItems={isCreateMode ? [] : [TicketType.MasterMonthly]}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-16 mt-1 md:gap-6 md:ml-6">
                  <div className="min-w-[230px] md:min-w-[180px]"></div>
                  <div>{errors.type && <Error message={errors.type.message} />}</div>
                </div>
              </div>

              {/* Ticket Tenant */}
              {type !== TicketType.MasterMonthly &&
                <div className="mb-6">
                  <div className="flex items-center gap-16 md:gap-6">
                    <Label className="text-base min-w-[230px] text-right md:min-w-[180px]" isRequired={true}>
                      <span className="mr-2">施設設定</span>
                    </Label>
                    <div className="min-w-[256px]">
                      <AutocompleteField
                        disablePortal
                        id="tenantCode"
                        name="tenantCode"
                        control={control}
                        options={tenants}
                        getOptionLabel={(option) => option.name || ""}
                        renderInput={(params) => (
                          <TextField {...params} className="ad-input-field w-[256px] font-medium" placeholder="施設名" error={!!errors.tenantCode} />
                        )}
                        isOptionEqualToValue={(option, value) => option.code === value.code}
                        disabled={isAdminRole || hasBookingOfTicket || isSlaveMonthlyTicket}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-16 mt-2 md:gap-6">
                    <div className="min-w-[230px] md:min-w-[180px]"></div>
                    {errors.tenantCode && <Error message={errors.tenantCode.message} />}
                  </div>
                </div>
              }

              {/* Times Limit Ticket Additional Fields */}
              {
                isTimesLimitTicketSelected &&
                <>
                  <div className="flex items-start gap-16 mb-6 font-medium md:gap-6">
                    <Label className="text-base min-w-[230px] text-right mt-3 md:min-w-[180px]" isRequired={true}>
                      <span className="mr-2">利用回数設定</span>
                    </Label>
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <p className="w-[50%] mr-8">支払い回数:</p>
                        <TextInputField
                          name="limitTimes"
                          error={!!errors.limitTimes}
                          control={control}
                          type="number"
                          inputProps={{ className: "ad-input-field px-4 !py-3 text-right", min: 0, maxLength: 15 }}
                          className="w-[90px] ad-input-field"
                          placeholder="3"
                        />
                        <p>回</p>
                      </div>
                      <div className="flex items-center gap-4 mb-4">
                        {errors.limitTimes && <Error message={errors.limitTimes.message} />}
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="w-[50%] mr-8">特典付き回数:</p>
                        <TextInputField
                          name="extraTimes"
                          error={!!errors.extraTimes}
                          control={control}
                          type="number"
                          inputProps={{ className: "ad-input-field px-4 !py-3 text-right", min: 0, maxLength: 15 }}
                          className="w-[90px] ad-input-field"
                          placeholder="3"
                        />
                        <p>回</p>
                      </div>
                    </div>
                  </div>
                  {/*Can setting expiration remind booking*/}
                  <div className="mb-6">
                    <div className="flex items-center gap-16 md:gap-6">
                      <Label className="text-base min-w-[230px] text-right md:min-w-[180px]">利用期間終了リマインダ</Label>
                      <RadioButtonsField
                        name="enableExpirationRemind"
                        control={control}
                        options={EXPIRATION_REMINDER_SETTING_OPTIONS}
                        className="!inline-block min-width-0"
                      />
                    </div>
                    <div className="flex items-center gap-16 mt-2">
                      <div className="min-w-[240px]"></div>
                      {errors.enableExpirationRemind && <Error message={errors.enableExpirationRemind.message} />}
                    </div>

                    {enableExpirationRemind && (
                      <div className="flex items-center flex-1 gap-16 mb-6 md:gap-6">
                        <div className="min-w-[230px] md:min-w-[180px]"></div>
                        <div>
                          <div className="flex items-center gap-4">
                            <p className="w-[100px] md:w-[50px]">終了日:</p>
                            <div>
                              <TextInputField
                                name="expirationRemindBeforeInDay"
                                error={!!errors.expirationRemindBeforeInDay}
                                control={control}
                                inputProps={{ className: "ad-input-field px-4 !py-3 text-right" }}
                                className="ad-input-field w-[90px]"
                              />
                            </div>

                            <p className="w-[80px] ml-24 md:ml-8">日前の:</p>
                            <div>
                              <TimePickerField
                                name="expirationRemindAt"
                                control={control}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    error={!!errors.expirationRemindAt}
                                    className="flex justify-between ad-input-field w-[148px] md:w-[100px]"
                                    inputProps={{ className: "ad-input-field !py-3", ...params.inputProps }}
                                  />
                                )}
                              />
                            </div>
                          </div>
                          <div className="mt-2">
                            {errors.expirationRemindBeforeInDay && <Error message={errors.expirationRemindBeforeInDay.message} />}
                            {errors.expirationRemindAt && <Error message={errors.expirationRemindAt.message} />}
                          </div>
                        </div>
                      </div>

                    )}
                  </div>
                </>
              }

              {/* Slave Ticket Tenants */}
              {type == TicketType.MasterMonthly &&
                <div className="mb-6">
                  <div className="flex items-center gap-16 md:gap-6">
                    <Label className="text-base min-w-[230px] text-right md:min-w-[180px]" isRequired={true}>
                      <span className="mr-2">施設設定</span>
                    </Label>
                    <div className="min-w-[256px] flex-1">
                      <AutocompleteField
                        disablePortal
                        multiple
                        disableCloseOnSelect
                        disableClearable={true}
                        id="slaveTenantCodes"
                        name="slaveTenantCodes"
                        control={control}
                        options={tenants}
                        getOptionLabel={(option) => option.name || ""}
                        renderInput={(params) => (
                          <TextField {...params}
                            className="ad-input-field w-full font-medium"
                            placeholder={slaveTenantCodes?.length > 0 ? undefined : "施設名"}
                            error={!!errors.slaveTenantCodes} />
                        )}
                        renderOption={(props, option, { selected }) => {
                          let isDisable = false;
                          if (!isCreateMode) {
                            isDisable = !!(ticket.slaveTenantCodes?.find(tenant => tenant.code == option.code)?.hasBooking);
                          }

                          // @ts-ignore
                          const { key, onClick, ...optionProps } = props;
                          return (
                            <li key={option.code} onClick={isDisable ? null : onClick} {...optionProps} className="flex items-center cursor-pointer">
                              <Checkbox
                                icon={checkboxIcon}
                                checkedIcon={checkedCheckboxIcon}
                                checked={selected}
                                disabled={isDisable}
                              />
                              <div className="flex-1 ml-2">
                                <span>{option.name}</span>
                              </div>
                            </li>
                          );
                        }}
                        renderTags={(value, getTagProps) => {
                          return value.map((option, index) => (
                            <Chip
                              key={option.code}
                              label={option.name}
                              {...getTagProps({ index })}
                              onDelete={undefined} // Remove the close button
                            />
                          ));
                        }}
                        isOptionEqualToValue={(option, value) => {
                          return option.code === value.code;
                        }}
                        disabled={isAdminRole || hasBookingOfTicket}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-16 mt-2 md:gap-6">
                    <div className="min-w-[230px] md:min-w-[180px]"></div>
                    {errors.slaveTenantCodes && <Error message={errors.slaveTenantCodes.message} />}
                  </div>
                </div>
              }

              {/*Visibility*/}
              <div className="mb-6">
                <div className="flex items-center gap-16 md:gap-6">
                  <Label className="text-base min-w-[230px] text-right md:min-w-[180px]" isRequired={true}>
                    <span className="mr-2"> 公開ステータス</span>
                  </Label>
                  <div>
                    <RadioButtonsField name="visibility" control={control} options={VISIBILITY_OPTIONS} className="!inline-block min-width-0" />
                  </div>
                </div>
                <div className="flex items-center gap-16 mt-1 md:gap-6">
                  <div className="min-w-[230px] md:min-w-[180px]"></div>
                  {errors.visibility && <Error message={errors.visibility.message} />}
                </div>
              </div>

              {/*Display Order*/}
              <div className="mb-6">
                <div className="flex items-center gap-16 md:gap-6">
                  <Label className="text-base min-w-[230px] text-right md:min-w-[180px]" isRequired={false}>
                    <span className="mr-2">商品順番設定</span>
                  </Label>
                  <TextInputField
                    name="displayOrder"
                    error={!!errors.displayOrder}
                    type="number"
                    control={control}
                    placeholder="1"
                    inputProps={{ className: "ad-input-field px-4 !py-3 text-right" }}
                    className="ad-input-field w-[152px]"
                  />
                </div>
                <div className="flex items-center gap-16 mt-2 md:gap-6">
                  <div className="min-w-[230px] md:min-w-[180px]"></div>
                  {errors.displayOrder && <Error message={errors.displayOrder.message} />}
                </div>
              </div>

              {/*Children age range*/}
              <div className="mb-6">
                <div className="flex items-center gap-16 md:gap-6">
                  <Label className="text-base min-w-[230px] text-right md:min-w-[180px]" isRequired={true}>
                    <span className="mr-2">対象年齢</span>
                  </Label>
                  <div className="flex items-center gap-6 mdonly:gap-2">
                    <div>
                      <TextInputField
                        name="childAgeLimitFrom"
                        error={!!errors.childAgeLimitFrom}
                        type="number"
                        control={control}
                        placeholder="6"
                        inputProps={{ className: "ad-input-field px-4 !py-3", maxLength: 15 }}
                        className="ad-input-field w-[125px] mdonly:w-[65px]"
                      />
                    </div>
                    <SelectField
                      name="childAgeLimitFromUnit"
                      control={control}
                      options={AGE_UNIT_OPTIONS}
                      className="h-[48px] ad-input-field mdup:min-w-[125px] mdonly:w-[85px]"
                    />
                    <p className="mx-3 text-xl font-medium">~</p>
                    <TextInputField
                      name="childAgeLimitTo"
                      type="number"
                      error={!!errors.childAgeLimitTo}
                      control={control}
                      placeholder="1"
                      inputProps={{ className: "ad-input-field px-4 !py-3", maxLength: 15 }}
                      className="ad-input-field w-[125px] mdonly:w-[65px]"
                    />
                    <SelectField
                      name="childAgeLimitToUnit"
                      control={control}
                      options={AGE_UNIT_OPTIONS}
                      className="h-[48px] ad-input-field mdup:min-w-[125px] mdonly:w-[85px]"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-16 mt-2 md:gap-6">
                  <div className="min-w-[230px] md:min-w-[180px]"></div>
                  <div className="flex md:flex-col">
                    <div className="w-[274px] mr-[82px] md:w-full">{errors.childAgeLimitFrom && <Error message={errors.childAgeLimitFrom.message} />}</div>

                    {errors.childAgeLimitFromUnit && (
                      <div className="w-[274px] mr-[82px]">
                        <Error message={errors.childAgeLimitFromUnit.message} />
                      </div>
                    )}
                    {errors.childAgeLimitTo && (
                      <div className="w-[274px] mr-[82px] md:w-full">
                        <Error message={errors.childAgeLimitTo.message} />
                      </div>
                    )}
                    {errors.childAgeLimitToUnit && (
                      <div className="w-[274px] mr-[82px]">
                        <Error message={errors.childAgeLimitToUnit.message} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/*Max child per adult*/}
              <div className="flex items-start gap-16 mb-6 font-medium md:gap-6">
                <Label className="text-base min-w-[230px] text-right mt-3 md:min-w-[180px]" isRequired={true}>
                  <span className="mr-2">1組の予約構成</span>
                </Label>
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <p className="mr-8">おとな:</p>
                    <TextField value={1} inputProps={{ className: "ad-input-field px-4 !py-3 text-right" }} className="ad-input-field w-[90px]" disabled />
                    <p>人に対して</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <p className="mr-8">子ども:</p>
                    <TextInputField
                      name="maxChildPerAdult"
                      error={!!errors.maxChildPerAdult}
                      control={control}
                      type="number"
                      inputProps={{ className: "ad-input-field px-4 !py-3 text-right", min: 0, maxLength: 15 }}
                      className="ad-input-field w-[90px]"
                      placeholder="3"
                      disabled={type === PROMOTION_TICKET_TYPE_NAME}
                    />
                    <p>人まで</p>
                  </div>
                  {errors.maxChildPerAdult && <Error message={errors.maxChildPerAdult.message} className="mt-2" />}
                </div>
              </div>

              {/*Adult/Child ticket code*/}
              <div className="mb-6">
                <div className="flex items-center gap-16 md:gap-6">
                  <Label className="text-base min-w-[230px] text-right md:min-w-[180px]" isRequired={true}>
                    <span className="mr-2">おとなの商品コード</span>
                  </Label>
                  <TextInputField
                    name="adultTicketCode"
                    error={!!errors.adultTicketCode}
                    type="string"
                    control={control}
                    placeholder="8769"
                    inputProps={{ className: "ad-input-field px-4 !py-3 text-right", maxLength: 4 }}
                    className="ad-input-field w-[152px]"
                  />
                </div>
                <div className="flex items-center gap-16 mt-2 md:gap-6">
                  <div className="min-w-[230px] md:min-w-[180px]"></div>
                  {errors.adultTicketCode && <Error message={errors.adultTicketCode.message} />}
                </div>
              </div>

              {/*Child ticket code*/}
              <div className="mb-6">
                <div className="flex items-center gap-16 md:gap-6">
                  <Label className="text-base min-w-[230px] text-right md:min-w-[180px]" isRequired={true}>
                    <span className="mr-2">子どもの商品コード</span>
                  </Label>
                  <TextInputField
                    name="childTicketCode"
                    error={!!errors.childTicketCode}
                    control={control}
                    type="string"
                    placeholder="8769"
                    inputProps={{ className: "ad-input-field px-4 !py-3 text-right", maxLength: 4 }}
                    className="ad-input-field w-[152px]"
                  />
                </div>
                <div className="flex items-center gap-16 mt-2 md:gap-6">
                  <div className="min-w-[230px] md:min-w-[180px]"></div>
                  {errors.childTicketCode && <Error message={errors.childTicketCode.message} />}
                </div>
              </div>

              {/*Payment type*/}
              <div className="mb-6">
                <div className="flex items-center gap-16 md:gap-6">
                  <Label className="text-base min-w-[230px] text-right md:min-w-[180px]" isRequired={true}>
                    <span className="mr-2">精算タイプ</span>
                  </Label>
                  <div>
                    <RadioButtonsField
                      name="paymentType"
                      control={control}
                      options={isTimesLimitTicketSelected ? TIMES_LIMIT_PAYMENT_TYPE_OPTIONS : PAYMENT_TYPE_OPTIONS}
                      className="!inline-block min-width-0"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-16 mt-1 md:gap-6">
                  <div className="min-w-[230px] md:min-w-[180px]"></div>
                  {errors.paymentType && <Error message={errors.paymentType.message} />}
                </div>
              </div>

              {/*Setting booking in advance*/}
              <div className="mb-6">
                <div className="flex items-center gap-16 md:gap-6">
                  <Label className="text-base min-w-[230px] text-right md:min-w-[180px]" isRequired={true}>
                    <span className="mr-2">事前予約設定</span>
                  </Label>
                  <div>
                    <RadioButtonsField
                      name="canBookInAdvance"
                      control={control}
                      options={isTimesLimitTicketSelected ? TIMES_LIMIT_SETTING_BOOKING_IN_ADVANCE_OPTIONS : SETTING_BOOKING_IN_ADVANCE_OPTIONS}
                      className="!inline-block min-width-0"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-16 mt-1 md:gap-6">
                  <div className="min-w-[230px] md:min-w-[180px]"></div>
                  {errors.canBookInAdvance && <Error message={errors.canBookInAdvance.message} />}
                </div>
              </div>

              {Boolean(([TicketType.Monthly, TicketType.MasterMonthly] as string[]).includes(type) || isTimesLimitTicketSelected) && (
                <div className="mb-6">
                  {/*Price*/}
                  {
                    timesLimitType === TicketType.HourlyTimesLimit
                      ?
                      <div className="flex items-start gap-16 mb-6 md:gap-4">
                        <Label className="text-base min-w-[230px] text-right md:min-w-[180px]" isRequired={true}>
                          <span className="mr-2">指定期間利用販売金額</span>
                        </Label>

                        <div>
                          <div className="flex gap-12 mdonly:gap-12 mb-5">
                            <div className="w-1/2 mdonly:w-1/2">
                              <p>ベース利用時間（1回分）:</p>
                              <div className="flex items-center mdup:justify-flex-start">
                                <label className="mr-8 mdonly:mr-0 w-[53px]">子供:</label>
                                <TextInputField
                                  name="baseChildPeriod"
                                  placeholder="3"
                                  error={!!errors.baseChildPeriod}
                                  control={control}
                                  type="number"
                                  className="ad-input-field w-[85px] mdonly:w-[60px]"
                                  inputProps={{ className: "ad-input-field px-4 !py-3 text-right" }}
                                />

                                <SelectField
                                  name="baseChildPeriodUnit"
                                  control={control}
                                  options={INPUT_PRICE_UNIT_OPTIONS}
                                  inputProps={{ className: "!min-w-[100px]" }}
                                  className="h-[48px] ad-input-field ml-6 mdonly:w-[80px] md:ml-2"
                                />
                              </div>
                              {errors.baseChildPeriod && <Error message={errors.baseChildPeriod.message} className="mt-2" />}
                              {errors.baseChildPeriodUnit && <Error message={errors.baseChildPeriodUnit.message} className="my-1 mb-4" />}
                            </div>

                            <div className="w-1/2">
                              <p>ベース合計金額設定:</p>
                              <div className="flex items-center mdup:justify-flex-start">
                                <label className="mr-8 mdonly:mr-1 w-[53px]">子供:</label>
                                <div className="flex justify-center items-center gap-x-2">
                                  <TextInputField
                                    name="baseChildPeriodPrice"
                                    error={!!errors.baseChildPeriodPrice}
                                    control={control}
                                    type="number"
                                    className="ad-input-field w-[106px] mdonly:w-[100px]"
                                    inputProps={{ className: "ad-input-field px-4 !py-3 text-right" }}
                                  />
                                  <p>円</p>
                                </div>
                              </div>

                              {errors.baseChildPeriodPrice && <Error message={errors.baseChildPeriodPrice.message} className="mt-2" />}
                            </div>
                          </div>
                        </div>
                      </div>
                      :
                      <div>
                        <div className="flex items-start gap-16 mb-6 md:gap-4">
                          <Label className="text-base min-w-[230px] text-right md:min-w-[180px]" isRequired={true}>
                            <span className="mr-2">指定期間利用販売金額</span>
                          </Label>
                          <p className="mb-4">{timesLimitType === TicketType.DailyTimesLimit ? "ベース合計金額設定" : "ベース金額設定"}</p>
                        </div>
                        <div className="w-[958px] mx-auto">
                          {
                            timesLimitType !== TicketType.DailyTimesLimit &&
                            getRenderAdultPriceHtml(isEnabledSmaregi)
                          }
                          {getRenderChildPriceHtml(isEnabledSmaregi)}
                        </div>
                      </div>
                  }
                </div>
              )}

              {
                timesLimitType === TicketType.HourlyTimesLimit && (
                  <div className="mb-6">
                    <div className="flex items-start gap-16 mb-6 md:gap-4">
                      <Label className="text-base min-w-[230px] text-right md:min-w-[180px]">
                        <span className="mr-2">延長金額設定</span>
                      </Label>
                      <div>
                        <div className="flex gap-12 mdonly:gap-12">
                          <div className="w-1/2">
                            <p>延長時間設定:</p>
                            <div className="flex items-center mdup:justify-flex-start">
                              <label className="mr-8 mdonly:mr-0 w-[53px]">子供:</label>

                              <TextInputField
                                name="extendedChildPeriod"
                                placeholder="3"
                                error={!!errors.extendedChildPeriod}
                                control={control}
                                type="number"
                                className="ad-input-field w-[85px] mdonly:w-[60px]"
                                inputProps={{ className: "ad-input-field px-4 !py-3 text-right" }}
                              />

                              <SelectField
                                name="extendedChildPeriodUnit"
                                control={control}
                                options={INPUT_PRICE_UNIT_OPTIONS}
                                inputProps={{ className: "!min-w-[100px]" }}
                                className="!h-[48px] ad-input-field ml-6 mdonly:w-[80px] md:ml-2"
                              />
                            </div>
                            {errors.extendedChildPeriod && <Error message={errors.extendedChildPeriod.message} />}
                            {errors.extendedChildPeriodUnit && <Error message={errors.extendedChildPeriodUnit.message} />}
                          </div>

                          <div className="w-1/2">
                            <label className="text-base font-medium">延長金額設定:</label>
                            <div className="flex items-center mdup:justify-flex-start">
                              <label className="mr-8 mdonly:mr-1 w-[53px]">子供:</label>
                              <div className="flex justify-center items-center gap-x-2">
                                <TextInputField
                                  name="extendedChildPeriodPrice"
                                  placeholder="100"
                                  error={!!errors.extendedChildPeriodPrice}
                                  control={control}
                                  type="number"
                                  inputProps={{ className: "ad-input-field px-4 !py-3 text-right" }}
                                  className="ad-input-field w-[106px] mdonly:w-[100px]"
                                />
                                <p>円</p>
                              </div>
                            </div>
                            {errors.extendedChildPeriodPrice && <Error message={errors.extendedChildPeriodPrice.message} />}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }
              {/*Can setting discount*/}
              {
                !isTimesLimitTicketSelected && (
                  <div className="flex items-center gap-16 mb-6 md:gap-6">
                    <Label className="text-base min-w-[230px] text-right md:min-w-[180px]" isRequired={true}>
                      <span className="mr-2">{type === TicketType.Hourly ? "ベース金額の割引設定" : "割引設定"}</span>
                    </Label>
                    <RadioButtonsField name="enableDiscount" control={control} options={YES_NO_OPTIONS} className="!inline-block min-width-0" />
                    {errors.enableDiscount && <Error message={errors.enableDiscount.message} />}
                  </div>
                )
              }

              {/*Setting discount*/}
              {enableDiscount && (
                <div className="flex">
                  <div className="w-[246px] lg:hidden"></div>
                  <div className="bg-[#DBF0FF] pt-4 px-4 rounded-[10px] pb-2 mb-7 xs:mb-4 md:mx-0 mx-12 xs:w-[868px] md:w-full">
                    {discountFields.map((item, index) => {
                      return (
                        <div key={item.id} id={item.id} className="mb-4">
                          <DiscountSettingForm
                            fieldName="discountSettings"
                            index={index}
                            control={control}
                            fields={discountFields}
                            remove={removeDiscountField}
                            errors={errors}
                            subtitle={type === TicketType.Hourly || timesLimitType === TicketType.HourlyTimesLimit ? "【ベース金額に対する割引】" : ""}
                            tenantCode={selectedTenant?.code}
                          />
                        </div>
                      );
                    })}

                    <div className="-mt-2">
                      <div className="flex justify-center">
                        <InsertNewDiscountSetting onClickButton={handleInsertNewDiscountSetting} title="さらにパスを追加する" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/*Hourly Ticket Extra Time Setting Discount ON/OFF*/}
              {(type === TicketType.Hourly) && (
                <div className="flex items-center gap-16 mb-6 md:gap-6">
                  <Label className="text-base min-w-[230px] text-right md:min-w-[180px]" isRequired={true}>
                    <span className="mr-2">延長金額の割引設定</span>
                  </Label>
                  <RadioButtonsField name="enableHourlyExtraTimeDiscount" control={control} options={YES_NO_OPTIONS} className="!inline-block min-width-0" />
                  {errors.enableHourlyExtraTimeDiscount && <Error message={errors.enableHourlyExtraTimeDiscount.message} />}
                </div>
              )}

              {/*Hourly Ticket Extra Time Setting discount*/}
              {(type === TicketType.Hourly && enableHourlyExtraTimeDiscount) && (
                <div className="flex items-center">
                  <div className="w-[246px] lg:hidden"></div>
                  <div className="bg-[#DBF0FF] pt-4 px-4 rounded-[10px] pb-2 mb-7 xs:mb-4 md:mx-0 mx-12 xs:w-[868px] md:w-full">
                    {hourlyExtraTimeDiscountFields.map((item, index) => {
                      return (
                        <div key={item.id} id={item.id} className="mb-4">
                          <DiscountSettingForm
                            fieldName="hourlyExtraTimeDiscountSettings"
                            index={index}
                            control={control}
                            fields={hourlyExtraTimeDiscountFields}
                            remove={removeHourlyExtraTimeDiscountField}
                            errors={errors}
                            subtitle={type === TicketType.Hourly ? "【延長金額に対する割引】" : ""}
                            tenantCode={selectedTenant?.code}
                          />
                        </div>
                      );
                    })}

                    <div className="-mt-2">
                      <div className="flex justify-center">
                        <InsertNewDiscountSetting onClickButton={handleInsertNewHourlyExtraTimeDiscountSetting} title="さらにパスを追加する" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/*Video url*/}
              <div className="mb-6">
                <div className="flex items-center gap-16 md:gap-6">
                  <Label className="text-base min-w-[230px] text-right md:min-w-[180px]" isRequired={true}>
                    遊び方の案内(動画)
                  </Label>
                  <label htmlFor="filePicker" className="border border-[#D9D9D9] flex items-center p-2 gap-4 min-w-[282px] cursor-pointer">
                    <label className="flex-1 max-h-[30px] min-h-[20px]">{videoUrl?.name || videoUrl}</label>

                    <Image
                      src={videoUrl ? XIcon : ExportIcon}
                      alt="icon"
                      onClick={() => {
                        videoUrl && reset({ ...getValues(), videoUrl: null });
                      }}
                      className={`${videoUrl && "cursor-pointer"} items-end`}
                    />
                  </label>
                  <input accept="video/mp4" type="file" onChange={onFileChange} style={{ visibility: "hidden" }} id="filePicker" />
                </div>
                <div className="flex items-center gap-16 mt-2 md:gap-6">
                  <div className="min-w-[230px] md:min-w-[180px]"></div>
                  {errors.videoUrl && <Error message={errors.videoUrl.message} />}
                </div>
              </div>

              {/*Required agreement*/}
              <div className="mb-6">
                <div className="flex items-center gap-16 md:gap-6">
                  <Label className="text-base min-w-[230px] text-right md:min-w-[180px]" isRequired={true}>
                    <span className="mr-2">免責項目</span>
                  </Label>
                  <div>
                    <RadioButtonsField name="requiredAgreement" control={control} options={CAN_SETTING_OPTIONS} className="!inline-block min-width-0" />
                  </div>
                </div>
                <div className="flex items-center gap-16 mt-1 md:gap-6">
                  <div className="min-w-[230px] md:min-w-[180px]"></div>
                  {errors.requiredAgreement && <Error message={errors.requiredAgreement.message} />}
                </div>
              </div>

              {/*Submit & Cancel Buttons*/}
              <div className="flex justify-center mb-8 gap-36 mdonly:gap-8">
                <AdminButton
                  className="w-[230px] h-[56px] !font-bold"
                  variant="outlined"
                  disabled={mustDisableSubmit}
                  onClick={() => reset({ ...DEFAULT_FORM_VALUES, ...defaultFormValues })}
                >
                  キャンセル
                </AdminButton>

                <UserSiteLoadingButton
                  className={`${mustDisableSubmit ? "ad-disable-button-bg" : ""} w-[230px] h-[56px] !font-bold`}
                  variant="contained"
                  type="submit"
                  disabled={mustDisableSubmit}
                  isLoading={isSubmitting}>
                  {isMasterMonthlyTicket ? "商品を確定" : "次へ"}
                </UserSiteLoadingButton>
              </div>
            </fieldset>
          </form>
        )}

        {/*Error*/}
        <Error message={errMsg} />
      </div>
    </div >
  );
}

const CAN_SETTING_OPTIONS = [
  { value: true, label: "表示" },
  { value: false, label: "非表示" },
];

const EXPIRATION_REMINDER_SETTING_OPTIONS = [
  { value: true, label: "設定する" },
  { value: false, label: "設定しない" },
];
