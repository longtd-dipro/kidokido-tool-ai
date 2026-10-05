import { yupResolver } from "@hookform/resolvers/yup";
import { Checkbox, FormControlLabel, TextField } from "@mui/material";
import { PriceUnit, TicketType } from "@prisma/client";
import { cloneDeep, isNil } from "lodash";
import { useEffect, useState } from "react";
import { Controller, FieldErrors, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";

import { BEFORE_ONE_OR_ZERO_DAY_OPTIONS, INPUT_PRICE_UNIT_OPTIONS, MAX_BOOKING_TIMES_OPTIONS, TIMES_LIMIT_TICKET_TYPE_NAME } from "constants/ticket";
import AdminButton from "components/common/Buttons/AdminButton";
import Error from "components/common/Error";
import DatePickerField from "components/common/Fields/DatePickerField";
import RadioButtonsField from "components/common/Fields/RadioButtonsField";
import SelectField from "components/common/Fields/SelectField";
import TextInputField from "components/common/Fields/TextInputField";
import TimePickerField from "components/common/Fields/TimePickerField";
import { ticketBookingFrameSchema } from "libs/validation/ticketSchema";
import { FrameFormData } from "models/Ticket";
import Label from "components/common/Admin/Label";
import FileUploadField from "components/common/Fields/FileUploadField";
import { upload } from "services/api-client/upload.service";
import { NotificationType, showNotification } from "stores/reducers/notification";
import UserSiteLoadingButton from "components/common/Buttons/LoadingButton";
import { useSmaregiEnabled } from "libs/hooks/useSmaregiEnabled";

type Props = {
  onSave: (data: FrameFormData) => void;
  onError: (error: FieldErrors, id: number | string) => void;
  id: string;
  frame: FrameFormData;
  ticketType: TicketType;
  tenantCode?: string;
};

const DEFAULT_FORM_VALUES = {
  startSaleAt: null,
  dateFrom: null,
  dateTo: null,
  canBookingFrom: null,
  canBookingUtil: null,
  canCancelOrChangeUtil: null,

  enableRemind: "",
  remindBeforeInDay: null,

  maxBookingPeople: null,
  maxBookingPeopleAccumulative: false,
  invisibleWhenReachedMaxBookingPeople: false,
  maxBookingTimes: "",

  baseAdultPeriod: "",
  baseAdultPeriodPrice: "",
  baseAdultPeriodUnit: PriceUnit.Minute,
  baseChildPeriodUnit: PriceUnit.Minute,
  baseChildPeriod: "",
  baseChildPeriodPrice: "",

  extendedAdultPeriod: "",
  extendedAdultPeriodPrice: "",
  extendedAdultPeriodUnit: PriceUnit.Minute,
  extendedChildPeriod: "",
  extendedChildPeriodPrice: "",
  extendedChildPeriodUnit: PriceUnit.Minute,

  canBookingBeforeInDay: 0,
  canCancelOrChangeBeforeInDay: 0,
  isLimitMaxBookingPeople: "",
};

const qrCodeFields = [
  "baseAdultSmaregiQRCodeUrl",
  "baseChildSmaregiQRCodeUrl",
  "extendedAdultSmaregiQRCodeUrl",
  "extendedChildSmaregiQRCodeUrl",
] as const;

export default function TicketBookingFrameForm({ onSave, onError, frame, ticketType, id, tenantCode }: Props) {
  const [errMsg, setErrMsg] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const dispatch = useDispatch();

  const { isEnabledSmaregi } = useSmaregiEnabled(tenantCode);

  const transformDefaultFrame = (frame: FrameFormData) => {
    const result = cloneDeep(frame);
    result.ticketType = ticketType;

    result.isLimitMaxBookingPeople = isNil(result.maxBookingPeople) ? "false" : "true";
    result.enableRemind = result.enableRemind ? "true" : "false";

    return result;
  };

  const {
    handleSubmit,
    formState: { errors },
    watch,
    control,
    reset,
    setValue,
    trigger,
  } = useForm<FrameFormData>({
    resolver: yupResolver(ticketBookingFrameSchema),
    defaultValues: frame ? transformDefaultFrame(frame) : { ...DEFAULT_FORM_VALUES, ticketType },
  });

  useEffect(() => {
    onError(errors, id);
  }, [errors]);

  const isLimitMaxBookingPeople = watch("isLimitMaxBookingPeople");
  const enableRemind = watch("enableRemind") === "true";
  const shouldImmediatelyValidate = watch("shouldImmediatelyValidate");
  useEffect(() => {
    if (shouldImmediatelyValidate) {
      trigger();
    }
  }, [shouldImmediatelyValidate]);

  const uploadImageFile = async (imageFile: any) => {
    try {
      const res = await upload(imageFile);
      return res.fileName;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      dispatch(showNotification({ type: NotificationType.ERROR, message }));
    }
  };

  const prepareDataToSubmit = async (data: FrameFormData) => {
    const result: FrameFormData = cloneDeep(data);

    result.startSaleAt = (data.startSaleAt as Date).toISOString();
    result.dateFrom = (data.dateFrom as Date).toISOString();
    result.dateTo = (data.dateTo as Date).toISOString();
    result.canBookingFrom = (data.canBookingFrom as Date)?.toISOString();
    result.canBookingUtil = (data.canBookingUtil as Date).toISOString();
    result.canCancelOrChangeUtil = (data.canCancelOrChangeUtil as Date).toISOString();

    result.enableRemind = data.enableRemind === "true" ? true : false;
    result.remindBeforeInDay = enableRemind ? Number(data.remindBeforeInDay) : null;
    result.remindAt = enableRemind ? (data.remindAt as Date).toISOString() : null;

    result.extendedAdultPeriod = data.extendedAdultPeriod ? data.extendedAdultPeriod : null;
    result.extendedAdultPeriodPrice = data.extendedAdultPeriodPrice ? data.extendedAdultPeriodPrice : null;
    result.extendedChildPeriod = data.extendedChildPeriod ? data.extendedChildPeriod : null;
    result.extendedChildPeriodPrice = data.extendedChildPeriodPrice ? data.extendedChildPeriodPrice : null;

    result.maxBookingPeople = isLimitMaxBookingPeople === "true" ? result.maxBookingPeople : null;

    delete result.isLimitMaxBookingPeople;

    if (isEnabledSmaregi) {
      await Promise.all(
        qrCodeFields.map(async (field) => {
          const value = result[field];

          if (value instanceof File) {
            const url = await uploadImageFile(value);
            setValue(field, url);
            result[field] = url;
          }
        })
      );
    }

    return result;
  };

  const onSubmit = async (data: FrameFormData) => {
    setErrMsg("");
    setIsSubmitting(true);
    try {
      const dataToSubmit = await prepareDataToSubmit(data);
      onSave(dataToSubmit);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col justify-center mx-auto mt-8 font-medium">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/*Start sale at*/}
        <div className="mb-6 date-from-to">
          <div className="flex items-center gap-16 md:gap-6">
            <Label className="text-base min-w-[240px] text-right md:min-w-[180px]" isRequired={true}>
              公開日設定
            </Label>
            <div>
              <DatePickerField
                name="startSaleAt"
                control={control}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={!!errors.startSaleAt}
                    className="flex justify-between ad-input-field w-[195px] md:w-[140px]"
                    inputProps={{ className: "ad-input-field !py-3", ...params.inputProps }}
                  />
                )}
              />
            </div>
          </div>
          <div className="flex items-center gap-16 mt-2 md:gap-6">
            <div className="min-w-[240px] md:min-w-[180px]"></div>
            {errors.startSaleAt && <Error message={errors.startSaleAt.message} />}
          </div>
        </div>

        {/*Valid from - to*/}
        <div className="mb-6 date-from-to">
          <div className="flex items-center gap-16 md:gap-6">
            <Label className="text-base min-w-[240px] text-right md:min-w-[180px]" isRequired={true}>
              開催日程
            </Label>

            <div className="flex items-center gap-4">
              <div>
                <div className="flex items-center gap-4 mdonly:gap-3">
                  <p>開始日:</p>
                  <DatePickerField
                    name="dateFrom"
                    control={control}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={!!errors.dateFrom}
                        className="flex justify-between ad-input-field w-[195px] md:w-[140px]"
                        inputProps={{ className: "ad-input-field !py-3", ...params.inputProps }}
                      />
                    )}
                  />
                </div>
              </div>

              <div className="ml-12 mdonly:ml-4">
                <div className="flex items-center gap-4 mdonly:gap-3">
                  <p>終了日:</p>
                  <DatePickerField
                    name="dateTo"
                    control={control}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={!!errors.dateTo}
                        className="flex justify-between ad-input-field w-[195px] md:w-[140px]"
                        inputProps={{ className: "ad-input-field !py-3", ...params.inputProps }}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-16 mt-2 md:gap-6">
            <div className="min-w-[240px] md:min-w-[180px]"></div>
            <div className="flex">
              <div className="w-[328px] md:w-[230px]">{errors.dateFrom && <Error message={errors.dateFrom.message} />}</div>
              {errors.dateTo && <Error message={errors.dateTo.message} />}
            </div>
          </div>
        </div>

        {/*Booking available until*/}
        <div className="mb-6">
          <div className="flex items-center gap-16 md:gap-6">
            <Label className="text-base min-w-[240px] text-right md:min-w-[180px]" isRequired={true}>
              販売開始・〆切日時
            </Label>

            <div className="flex gap-8 items-center md:gap-4">
              <SelectField
                name="canBookingBeforeInDay"
                control={control}
                options={BEFORE_ONE_OR_ZERO_DAY_OPTIONS}
                inputProps={{ className: "min-w-[150px] " }}
                className="h-[48px] ad-input-field mdonly:w-[140px]"
                disabled
              />
              {errors.canBookingBeforeInDay && <Error message={errors.canBookingBeforeInDay.message} />}

              <p className="">の</p>

              <div className="flex items-center gap-4 mdonly:gap-2">
                <div>
                  <TimePickerField
                    name="canBookingFrom"
                    control={control}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={!!errors.canBookingFrom}
                        className="ad-input-field w-[148px] mdonly:w-[80px]"
                        inputProps={{ className: "ad-input-field !py-3", ...params.inputProps }}
                      />
                    )}
                  />
                </div>
              </div>

              <p className="">〜</p>

              <div className="flex items-center gap-4 mdonly:gap-2">
                <div>
                  <TimePickerField
                    name="canBookingUtil"
                    control={control}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={!!errors.canBookingUtil}
                        className="ad-input-field w-[148px] mdonly:w-[80px]"
                        inputProps={{ className: "ad-input-field !py-3", ...params.inputProps }}
                      />
                    )}
                  />
                </div>
                <p>まで</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-16 mt-2 md:gap-6">
            <div className="min-w-[240px] md:min-w-[180px]"></div>

            <div className="flex gap-[75px] mdonly:gap-2 ml-[230px] md:ml-[180px]">
              <div className="min-w-[150px] w-[150px] md:min-w-[100px] md:w-[100px] md:mr-[20px]">
                {errors.canBookingFrom && <Error message={errors.canBookingFrom.message} />}
              </div>
              <div className="min-w-[150px] w-[150px] md:min-w-[100px] md:w-[100px]">
                {errors.canBookingUtil && <Error message={errors.canBookingUtil.message} />}
              </div>
            </div>
          </div>
        </div>

        {/*Cancel or change available until*/}
        <div className="mb-6">
          <div className="flex items-center gap-16 md:gap-6">
            <Label className="text-base min-w-[240px] text-right md:min-w-[180px] md:max-w-[180px] " isRequired={true}>
              キャンセル・変更可能期限
            </Label>

            <div className="flex gap-8 items-center md:gap-4">
              <SelectField
                name="canCancelOrChangeBeforeInDay"
                control={control}
                options={BEFORE_ONE_OR_ZERO_DAY_OPTIONS}
                inputProps={{ className: "min-w-[150px]" }}
                className="h-[48px] ad-input-field mdonly:w-[140px]"
              />
              {errors.canCancelOrChangeBeforeInDay && <Error message={errors.canCancelOrChangeBeforeInDay.message} className="mt-2" />}

              <p>の</p>

              <div className="flex items-center gap-2">
                <div>
                  <TimePickerField
                    name="canCancelOrChangeUtil"
                    control={control}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={!!errors.canCancelOrChangeUtil}
                        className="ad-input-field w-[148px] mdonly:w-[80px]"
                        inputProps={{ className: "ad-input-field !py-3", ...params.inputProps }}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-16 mt-2 md:gap-6">
            <div className="min-w-[240px] md:min-w-[180px]"></div>
            {errors.canCancelOrChangeUtil && <Error message={errors.canCancelOrChangeUtil.message} />}
          </div>
        </div>

        {/*Setting max booking times*/}
        <div className="mb-6">
          <div className="flex items-center gap-16 md:gap-6">
            <Label className="text-base min-w-[240px] text-right md:min-w-[180px]" isRequired={true}>
              予約できる回数
            </Label>

            <div>
              <SelectField
                name="maxBookingTimes"
                error={!!errors.maxBookingTimes}
                control={control}
                options={MAX_BOOKING_TIMES_OPTIONS}
                inputProps={{ className: "!min-w-[150px]" }}
                className="h-[48px] ad-input-field"
              />
            </div>
          </div>
          <div className="flex items-center gap-16 mt-2 md:gap-6">
            <div className="min-w-[240px] md:min-w-[180px]"></div>
            {errors.maxBookingTimes && <Error message={errors.maxBookingTimes.message} />}
          </div>
        </div>

        {/*Setting max booking people*/}
        <div className="flex items-start gap-16 mb-6 md:gap-6">
          <Label className="text-base min-w-[240px] text-right mt-2 md:min-w-[180px]" isRequired={true}>
            定員数設定
          </Label>

          <div>
            <div className="flex md:gap-4">
              <RadioButtonsField
                name="isLimitMaxBookingPeople"
                className="mdup:w-[200px] mdonly:w-[120px]"
                control={control}
                options={IS_LIMIT_MAX_BOOKING_PEOPLE_OPTIONS}
              />
              {isLimitMaxBookingPeople === "true" && (
                <div className="flex flex-col justify-start">
                  <div className="flex items-center gap-12 md:gap-2 md:items-start">
                    <div className="flex items-center gap-4 mdonly:w-1/3">
                      <TextInputField
                        placeholder="80"
                        name="maxBookingPeople"
                        error={!!errors.maxBookingPeople}
                        control={control}
                        type="number"
                        className="ad-input-field w-[85px]"
                        inputProps={{ className: "ad-input-field px-4 !py-3 text-right" }}
                      />
                      <p>人</p>
                    </div>
                    <div className="">
                      <FormControlLabel
                        className="mdup:ml-24 mdonly:ml-2 !min-w-0 mdonly:min-w-2/3"
                        control={
                          <Controller
                            name="maxBookingPeopleAccumulative"
                            control={control}
                            render={({ field: props }) => <Checkbox {...props} checked={props.value} onChange={(e) => props.onChange(e.target.checked)} />}
                          />
                        }
                        label="当日利用枠で設定"
                      />
                      <FormControlLabel
                        className="mdup:ml-24 mdonly:ml-2 !min-w-0 mdonly:min-w-2/3"
                        control={
                          <Controller
                            name="invisibleWhenReachedMaxBookingPeople"
                            control={control}
                            render={({ field: props }) => <Checkbox {...props} checked={props.value} onChange={(e) => props.onChange(e.target.checked)} />}
                          />
                        }
                        label="設定枠上限数に達したら販売終了"
                      />
                    </div>
                  </div>
                  <div className="mt-2">{errors.maxBookingPeople && <Error message={errors.maxBookingPeople.message} />}</div>
                </div>
              )}
            </div>
            {errors.isLimitMaxBookingPeople && <Error message={errors.isLimitMaxBookingPeople.message} />}
          </div>
        </div>

        {/*Setting price*/}
        {!([TicketType.Monthly, TicketType.DailyTimesLimit, TicketType.HourlyTimesLimit, TIMES_LIMIT_TICKET_TYPE_NAME] as string[]).includes(ticketType) && (
          <>
            <div className="flex items-center gap-16 mb-6 md:gap-6">
              <Label className="text-base min-w-[240px] text-right md:min-w-[180px]" isRequired={true}>
                延長金額設定
              </Label>
            </div>
            {isEnabledSmaregi ?
              <div className="flex flex-col gap-6 md:px-[48px] px-[106px]">
                <div className="flex gap-6 mdonly:gap-3">
                  <div className="flex-1">
                    <p>ベース利用時間:</p>
                    <div className="flex items-center mdup:justify-flex-start my-3">
                      <label className="mr-8 mdonly:mr-0 w-[53px]">大人:</label>

                      <TextInputField
                        name="baseAdultPeriod"
                        placeholder="1"
                        error={!!errors.baseAdultPeriod}
                        control={control}
                        type="number"
                        className="ad-input-field w-[85px] mdonly:w-[60px]"
                        inputProps={{ className: "ad-input-field px-4 !py-3 text-right" }}
                      />

                      <SelectField
                        name="baseAdultPeriodUnit"
                        control={control}
                        options={INPUT_PRICE_UNIT_OPTIONS}
                        inputProps={{ className: "!min-w-[100px]" }}
                        className="h-[48px] ad-input-field ml-6 mdonly:w-[80px] md:ml-2"
                      />
                    </div>
                    {errors.baseAdultPeriodUnit && <Error message={errors.baseAdultPeriodUnit.message} className="mt-2" />}
                    {errors.baseAdultPeriod && <Error message={errors.baseAdultPeriod.message} className="my-1 mb-4" />}

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

                  <div >
                    <p>ベース金額設定:</p>
                    <div className="flex items-center mdup:justify-flex-start my-3">
                      <label className="mr-8 mdonly:mr-1 w-[53px]">大人:</label>
                      <div className="flex justify-center items-center gap-x-2">
                        <TextInputField
                          name="baseAdultPeriodPrice"
                          placeholder="0"
                          error={!!errors.baseAdultPeriodPrice}
                          control={control}
                          type="number"
                          className="ad-input-field w-[106px] mdonly:w-[100px]"
                          inputProps={{ className: "ad-input-field px-4 !py-3 text-right" }}
                        />
                        <p>円</p>
                      </div>
                    </div>
                    {errors.baseAdultPeriodPrice && <Error message={errors.baseAdultPeriodPrice.message} className="my-1 mb-4" />}

                    <div className="flex items-center mdup:justify-flex-start">
                      <label className="mr-8 mdonly:mr-1 w-[53px]">子供:</label>
                      <div className="flex justify-center items-center gap-x-2">
                        <TextInputField
                          name="baseChildPeriodPrice"
                          placeholder="700"
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

                  <div className="flex-1 min-w-0">
                    <p className="block">決済バーコード:</p>
                    <div className="flex items-center mdup:justify-flex-start my-3">
                      <FileUploadField
                        className="w-full h-[47px] mdonly:h-[44px]"
                        name="baseAdultSmaregiQRCodeUrl"
                        control={control}
                        accept="image/jpeg,image/png,image/jpg"
                      />
                    </div>
                    <div className="flex items-center mdup:justify-flex-start">
                      <FileUploadField
                        className="w-full h-[47px] mdonly:h-[44px]"
                        name="baseChildSmaregiQRCodeUrl"
                        control={control}
                        accept="image/jpeg,image/png,image/jpg"
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="block">OBIC：</p>
                    <div className="flex items-center my-3">
                      <TextInputField
                        name="baseAdultObicCode"
                        error={!!errors.baseAdultObicCode}
                        control={control}
                        className="ad-input-field w-full"
                        inputProps={{ className: "ad-input-field px-4 !py-3", placeholder: "KOK0005" }}
                      />
                    </div>
                    {errors.baseAdultObicCode && <Error message={errors.baseAdultObicCode.message} className="mb-1" />}
                    <div className="flex items-center">
                      <TextInputField
                        name="baseChildObicCode"
                        error={!!errors.baseChildObicCode}
                        control={control}
                        className="ad-input-field w-full"
                        inputProps={{ className: "ad-input-field px-4 !py-3", placeholder: "KOK0005" }}
                      />
                    </div>
                    {errors.baseChildObicCode && <Error message={errors.baseChildObicCode.message} className="mt-1" />}
                  </div>
                </div>
                <div className="flex gap-6 mdonly:gap-3">
                  <div className="flex-1">
                    <p>延長時間設定:</p>
                    <div className="flex items-center mdup:justify-flex-start my-3">
                      <label className="mr-8 mdonly:mr-0 w-[53px]">大人:</label>
                      <TextInputField
                        name="extendedAdultPeriod"
                        placeholder="1"
                        error={!!errors.extendedAdultPeriod}
                        control={control}
                        type="number"
                        className="ad-input-field w-[85px] mdonly:w-[60px]"
                        inputProps={{ className: "ad-input-field px-4 !py-3 text-right" }}
                      />

                      <SelectField
                        name="extendedAdultPeriodUnit"
                        control={control}
                        options={INPUT_PRICE_UNIT_OPTIONS}
                        inputProps={{ className: "!min-w-[100px]" }}
                        className="h-[48px] ad-input-field ml-6 mdonly:w-[80px] md:ml-2"
                      />
                    </div>
                    {errors.extendedAdultPeriod && <Error message={errors.extendedAdultPeriod.message} />}
                    {errors.extendedAdultPeriodUnit && <Error message={errors.extendedAdultPeriodUnit.message} />}

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

                  <div>
                    <label className="text-base font-medium">延長金額設定:</label>
                    <div className="flex items-center mdup:justify-flex-start my-3">
                      <label className="mr-8 mdonly:mr-1 w-[53px]">大人:</label>
                      <div className="flex justify-center items-center gap-x-2">
                        <TextInputField
                          name="extendedAdultPeriodPrice"
                          placeholder="0"
                          error={!!errors.extendedAdultPeriodPrice}
                          control={control}
                          type="number"
                          className="ad-input-field w-[106px] mdonly:w-[100px]"
                          inputProps={{ className: "ad-input-field px-4 !py-3 text-right" }}
                        />
                        <p>円</p>
                      </div>
                    </div>
                    {errors.extendedAdultPeriodPrice && <Error message={errors.extendedAdultPeriodPrice.message} />}

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

                  <div className="flex-1 min-w-0">
                    <p className="block">決済バーコード:</p>
                    <div className="flex items-center mdup:justify-flex-start my-3">
                      <FileUploadField
                        className="w-full h-[47px] mdonly:h-[44px]"
                        name="extendedAdultSmaregiQRCodeUrl"
                        control={control}
                        accept="image/jpeg,image/png,image/jpg"
                      />
                    </div>
                    <div className="flex min-w-0 items-center mdup:justify-flex-start">
                      <FileUploadField
                        className="w-full h-[47px] mdonly:h-[44px]"
                        name="extendedChildSmaregiQRCodeUrl"
                        control={control}
                        accept="image/jpeg,image/png,image/jpg"
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="block">OBIC：</p>
                    <div className="flex items-center my-3">
                      <TextInputField
                        name="extendedAdultObicCode"
                        error={!!errors.extendedAdultObicCode}
                        control={control}
                        className="ad-input-field w-full"
                        inputProps={{ className: "ad-input-field px-4 !py-3", placeholder: "KOK0005" }}
                      />
                    </div>
                    {errors.extendedAdultObicCode && <Error message={errors.extendedAdultObicCode.message} className="mb-1" />}
                    <div className="flex items-center">
                      <TextInputField
                        name="extendedChildObicCode"
                        error={!!errors.extendedChildObicCode}
                        control={control}
                        className="ad-input-field w-full"
                        inputProps={{ className: "ad-input-field px-4 !py-3", placeholder: "KOK0005" }}
                      />
                    </div>
                    {errors.extendedChildObicCode && <Error message={errors.extendedChildObicCode.message} className="mt-1" />}
                  </div>
                </div>
              </div>
              :
              <div className="flex-1 mr-[100px]">
                <div className="flex gap-12 mdonly:gap-12 mb-5">
                  <div className="w-1/3">
                    <p>ベース利用時間:</p>
                    <div className="flex items-center mdup:justify-flex-start my-3">
                      <label className="mr-8 mdonly:mr-0 w-[53px]">大人:</label>

                      <TextInputField
                        name="baseAdultPeriod"
                        placeholder="1"
                        error={!!errors.baseAdultPeriod}
                        control={control}
                        type="number"
                        className="ad-input-field w-[85px] mdonly:w-[60px]"
                        inputProps={{ className: "ad-input-field px-4 !py-3 text-right" }}
                      />

                      <SelectField
                        name="baseAdultPeriodUnit"
                        control={control}
                        options={INPUT_PRICE_UNIT_OPTIONS}
                        inputProps={{ className: "!min-w-[100px]" }}
                        className="h-[48px] ad-input-field ml-6 mdonly:w-[80px] md:ml-2"
                      />
                    </div>
                    {errors.baseAdultPeriodUnit && <Error message={errors.baseAdultPeriodUnit.message} className="mt-2" />}
                    {errors.baseAdultPeriod && <Error message={errors.baseAdultPeriod.message} className="my-1 mb-4" />}

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

                  <div className="w-1/3">
                    <p>ベース金額設定:</p>
                    <div className="flex items-center mdup:justify-flex-start my-3">
                      <label className="mr-8 mdonly:mr-1 w-[53px]">大人:</label>
                      <div className="flex justify-center items-center gap-x-2">
                        <TextInputField
                          name="baseAdultPeriodPrice"
                          placeholder="0"
                          error={!!errors.baseAdultPeriodPrice}
                          control={control}
                          type="number"
                          className="ad-input-field w-[106px] mdonly:w-[100px]"
                          inputProps={{ className: "ad-input-field px-4 !py-3 text-right" }}
                        />
                        <p>円</p>
                      </div>
                    </div>
                    {errors.baseAdultPeriodPrice && <Error message={errors.baseAdultPeriodPrice.message} className="my-1 mb-4" />}

                    <div className="flex items-center mdup:justify-flex-start">
                      <label className="mr-8 mdonly:mr-1 w-[53px]">子供:</label>
                      <div className="flex justify-center items-center gap-x-2">
                        <TextInputField
                          name="baseChildPeriodPrice"
                          placeholder="700"
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

                  <div className="w-1/3">
                    <p>OBIC:</p>
                    <div className="flex items-center my-3">
                      <TextInputField
                        name="baseAdultObicCode"
                        error={!!errors.baseAdultObicCode}
                        control={control}
                        className="ad-input-field w-full"
                        inputProps={{ className: "ad-input-field px-4 !py-3", placeholder: "KOK0005" }}
                      />
                    </div>
                    {errors.baseAdultObicCode && <Error message={errors.baseAdultObicCode.message} className="mb-1" />}
                    <div className="flex items-center">
                      <TextInputField
                        name="baseChildObicCode"
                        error={!!errors.baseChildObicCode}
                        control={control}
                        className="ad-input-field w-full"
                        inputProps={{ className: "ad-input-field px-4 !py-3", placeholder: "KOK0005" }}
                      />
                    </div>
                    {errors.baseChildObicCode && <Error message={errors.baseChildObicCode.message} className="mt-1" />}
                  </div>
                </div>
                <div className="flex gap-12 mdonly:gap-12">
                  <div className="w-1/3">
                    <p>延長時間設定:</p>
                    <div className="flex items-center mdup:justify-flex-start my-3">
                      <label className="mr-8 mdonly:mr-0 w-[53px]">大人:</label>
                      <TextInputField
                        name="extendedAdultPeriod"
                        placeholder="1"
                        error={!!errors.extendedAdultPeriod}
                        control={control}
                        type="number"
                        className="ad-input-field w-[85px] mdonly:w-[60px]"
                        inputProps={{ className: "ad-input-field px-4 !py-3 text-right" }}
                      />

                      <SelectField
                        name="extendedAdultPeriodUnit"
                        control={control}
                        options={INPUT_PRICE_UNIT_OPTIONS}
                        inputProps={{ className: "!min-w-[100px]" }}
                        className="h-[48px] ad-input-field ml-6 mdonly:w-[80px] md:ml-2"
                      />
                    </div>
                    {errors.extendedAdultPeriod && <Error message={errors.extendedAdultPeriod.message} />}
                    {errors.extendedAdultPeriodUnit && <Error message={errors.extendedAdultPeriodUnit.message} />}

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

                  <div className="w-1/3">
                    <label className="text-base font-medium">延長金額設定:</label>
                    <div className="flex items-center mdup:justify-flex-start my-3">
                      <label className="mr-8 mdonly:mr-1 w-[53px]">大人:</label>
                      <div className="flex justify-center items-center gap-x-2">
                        <TextInputField
                          name="extendedAdultPeriodPrice"
                          placeholder="0"
                          error={!!errors.extendedAdultPeriodPrice}
                          control={control}
                          type="number"
                          className="ad-input-field w-[106px] mdonly:w-[100px]"
                          inputProps={{ className: "ad-input-field px-4 !py-3 text-right" }}
                        />
                        <p>円</p>
                      </div>
                    </div>
                    {errors.extendedAdultPeriodPrice && <Error message={errors.extendedAdultPeriodPrice.message} />}

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
                  <div className="w-1/3">
                    <p>OBIC:</p>
                    <div className="flex items-center my-3">
                      <TextInputField
                        name="extendedAdultObicCode"
                        error={!!errors.extendedAdultObicCode}
                        control={control}
                        className="ad-input-field w-full"
                        inputProps={{ className: "ad-input-field px-4 !py-3", placeholder: "KOK0005" }}
                      />
                    </div>
                    {errors.extendedAdultObicCode && <Error message={errors.extendedAdultObicCode.message} className="mb-1" />}
                    <div className="flex items-center">
                      <TextInputField
                        name="extendedChildObicCode"
                        error={!!errors.extendedChildObicCode}
                        control={control}
                        className="ad-input-field w-full"
                        inputProps={{ className: "ad-input-field px-4 !py-3", placeholder: "KOK0005" }}
                      />
                    </div>
                    {errors.extendedChildObicCode && <Error message={errors.extendedChildObicCode.message} className="mt-1" />}
                  </div>
                </div>
              </div>
            }
          </>
        )}

        {/*Can setting remind booking*/}
        <div className="mb-6">
          <div className="flex items-center gap-16 md:gap-6">
            <Label className="text-base min-w-[240px] text-right md:min-w-[180px]">予約リマインダ</Label>
            <RadioButtonsField name="enableRemind" control={control} options={CAN_SETTING_OPTIONS} className="!inline-block min-width-0" />
          </div>
          <div className="flex items-center gap-16 mt-2">
            <div className="min-w-[240px]"></div>
            {errors.enableRemind && <Error message={errors.enableRemind.message} />}
          </div>
        </div>

        {enableRemind && (
          <div className="flex items-center flex-1 gap-16 mb-6 md:gap-6">
            <div className="min-w-[240px] md:min-w-[180px]"></div>
            <div>
              <div className="flex items-center gap-4">
                <p className="w-[100px] md:w-[50px]">開催日:</p>
                <div>
                  <TextInputField
                    name="remindBeforeInDay"
                    error={!!errors.remindBeforeInDay}
                    control={control}
                    inputProps={{ className: "ad-input-field px-4 !py-3 text-right" }}
                    className="ad-input-field w-[90px]"
                  />
                </div>

                <p className="w-[80px] ml-24 md:ml-8">日前の:</p>
                <div>
                  <TimePickerField
                    name="remindAt"
                    control={control}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={!!errors.remindAt}
                        className="ad-input-field w-[148px] md:w-[100px]"
                        inputProps={{ className: "ad-input-field !py-3", ...params.inputProps }}
                      />
                    )}
                  />
                </div>
              </div>
              <div className="mt-2">
                {errors.remindBeforeInDay && <Error message={errors.remindBeforeInDay.message} />}
                {errors.remindAt && <Error message={errors.remindAt.message} />}
              </div>
            </div>
          </div>
        )}

        {/*Submit*/}
        <div className="flex justify-center gap-24 my-12">
          <AdminButton variant="outlined" className="w-[230px] h-[56px]" onClick={() => reset({ ...DEFAULT_FORM_VALUES })}>
            キャンセル
          </AdminButton>
          <UserSiteLoadingButton isLoading={isSubmitting} type="submit" variant="contained" className="w-[230px] h-[56px]">
            予約枠の保存
          </UserSiteLoadingButton>
        </div>
      </form>

      {/*Error*/}
      <Error message={errMsg} />
    </div>
  );
}

const CAN_SETTING_OPTIONS = [
  { value: true, label: "設定する" },
  { value: false, label: "設定しない" },
];

const IS_LIMIT_MAX_BOOKING_PEOPLE_OPTIONS = [
  { value: true, label: "設定する" },
  { value: false, label: "設定しない" },
];
