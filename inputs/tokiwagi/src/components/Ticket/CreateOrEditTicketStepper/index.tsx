
import { TicketBookingSchedule, TicketType } from "@prisma/client";
import { cloneDeep, isEmpty, isNil } from "lodash";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";

import { PROMOTION_TICKET_TYPE_NAME, TIMES_LIMIT_TICKET_TYPE_NAME } from "constants/ticket";
import { MESSAGES } from "constants/messages";
import { ROUTE } from "constants/route";
import AdminButton from "components/common/Buttons/AdminButton";
import Error from "components/common/Error";
import CreateOrEditTicketForm from "components/Ticket/CreateOrEditTicketStepper/CreateOrEditTicketForm";
import TicketBookingScheduleManager, { TicketFrames } from "components/Ticket/CreateOrEditTicketStepper/TicketBookingScheduleManager";
import { Ticket } from "models/Entity";
import { AgeUnit } from "models/enums";
import { TicketFormData, TicketPayload } from "models/Ticket";
import { DiscountSettingItem, HourlyExtraTimeDiscountSetting } from "models/Discount";
import {
  createTicket,
  createTicketBookingSchedules,
  updateTicket,
  updateTicketBookingSchedules,
  updateTicketVideoUrl,
} from "services/api-client/admin/ticket.service";
import { upload } from "services/api-client/upload.service";
import { NotificationType, showNotification } from "stores/reducers/notification";
import UserSiteLoadingButton from "components/common/Buttons/LoadingButton";
import { getUrlQueryValue } from "utils/url";
import { isMasterMonthlyTicket } from "utils/booking";

type Props = {
  ticket?: Ticket;
  isCreateMode?: boolean;
};

enum Step {
  InputTicket,
  InputTicketBookingSchedules,
}

export default function CreateOrEditTicketStepper({ ticket, isCreateMode = true }: Props) {
  const isEditMode = !!ticket && !isCreateMode;

  const router = useRouter();
  const dispatch = useDispatch();
  const [errMsg, setErrMsg] = useState<string>();
  const [step, setStep] = useState<Step>(Step.InputTicket);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [ticketPayload, setTicketPayload] = useState<TicketPayload>(null);
  const [framesPayload, setFramesPayload] = useState<TicketFrames>(null);
  const [frameErrors, setFrameErrors] = useState<any>(null);

  const page = getUrlQueryValue("page");
  const filters = getUrlQueryValue("filters");

  const handleSavedTicket = async (ticket: TicketPayload) => {
    if (isMasterMonthlyTicket(ticket)) {
      await handleSubmitMasterMonthlyTicket(ticket);
    } else {
      setTicketPayload(ticket);
      setStep(Step.InputTicketBookingSchedules);
    }
  };

  const handleSavedFrame = (ticketFrame: TicketFrames) => {
    setFramesPayload(ticketFrame);
  };

  const convertToTicketFormData = (ticket: Ticket): TicketFormData | any => {
    const clonedTicket: Ticket = cloneDeep(ticket);
    const { TicketDetail, Tenant, isPromotion, TicketDiscountSetting, ...result }: Ticket & Partial<TicketFormData> = clonedTicket;

    result.childAgeLimitFromUnit = AgeUnit.Month;
    result.childAgeLimitToUnit = AgeUnit.Year;
    result.tenantCode = isMasterMonthlyTicket(ticket) ? undefined : { code: Tenant.code, name: Tenant.name };
    result.slaveTenantCodes = isMasterMonthlyTicket(ticket) ? ticket.slaveTickets?.map(t => {
      return { code: t.Tenant.code, name: t.Tenant.name, hasBooking: t.hasBooking };
    }) : undefined;
    // prevent submit unnecessary fields to API
    delete result.slaveTickets;

    isPromotion && ((result.type as any) = PROMOTION_TICKET_TYPE_NAME);
    // Convert Discount Setting
    if (TicketDiscountSetting) {
      result.discountSettings = TicketDiscountSetting.setting as DiscountSettingItem[];
      if (TicketDiscountSetting.hourlyExtraTimeSetting) {
        const hourlyExtraTimeSetting = TicketDiscountSetting.hourlyExtraTimeSetting as HourlyExtraTimeDiscountSetting;
        if (hourlyExtraTimeSetting) {
          result.enableHourlyExtraTimeDiscount = hourlyExtraTimeSetting.enable;
          result.hourlyExtraTimeDiscountSettings = hourlyExtraTimeSetting.setting;
        }
      }
    }
    if (([TicketType.DailyTimesLimit, TicketType.HourlyTimesLimit] as string[]).includes(ticket.type)) {
      result.timesLimitType = ticket.type;
      (result as { type: string }).type = TIMES_LIMIT_TICKET_TYPE_NAME;
      const ticketBookingSchedule = result.TicketBookingSchedule?.[0];
      if (ticketBookingSchedule) {
        result.enableExpirationRemind = ticketBookingSchedule.enableExpirationRemind;
        result.expirationRemindBeforeInDay = ticketBookingSchedule.expirationRemindBeforeInDay;
        result.expirationRemindAt = ticketBookingSchedule.expirationRemindAt;
        if (ticket.type === TicketType.HourlyTimesLimit) {
          result.baseAdultPeriod = +ticketBookingSchedule.baseAdultPeriod;
          result.baseAdultPeriodUnit = ticketBookingSchedule.baseAdultPeriodUnit;
          result.baseAdultPeriodPrice = +ticketBookingSchedule.baseAdultPeriodPrice;
          result.baseChildPeriod = +ticketBookingSchedule.baseChildPeriod;
          result.baseChildPeriodUnit = ticketBookingSchedule.baseChildPeriodUnit;
          result.baseChildPeriodPrice = +ticketBookingSchedule.baseChildPeriodPrice;
          result.extendedAdultPeriod = +ticketBookingSchedule.extendedAdultPeriod;
          result.extendedAdultPeriodUnit = ticketBookingSchedule.extendedAdultPeriodUnit;
          result.extendedAdultPeriodPrice = +ticketBookingSchedule.extendedAdultPeriodPrice;
          result.extendedChildPeriod = +ticketBookingSchedule.extendedChildPeriod;
          result.extendedChildPeriodUnit = ticketBookingSchedule.extendedChildPeriodUnit;
          result.extendedChildPeriodPrice = +ticketBookingSchedule.extendedChildPeriodPrice;
        }
      }
    }

    delete result.TicketBookingSchedule;
    delete TicketDetail.ticketId;
    delete TicketDetail.id;
    // Remove discount fields because they are unused and discount settings were moved to [ticket_discount_settings] table
    delete TicketDetail.discountAdultAmount;
    delete TicketDetail.discountAdultThreshold;
    delete TicketDetail.discountChildAmount;
    delete TicketDetail.discountChildThreshold;

    return { ...result, ...TicketDetail };
  };

  const convertToTicketBookingFrames = (ticket: Ticket) => {
    const clonedTicket: Ticket = cloneDeep(ticket);
    const schedule = clonedTicket.TicketBookingSchedule.map((item: TicketBookingSchedule) => ({
      ...item,
      baseAdultPeriod: +item.baseAdultPeriod,
      baseAdultPeriodPrice: +item.baseAdultPeriodPrice,
      baseChildPeriod: +item.baseChildPeriod,
      baseChildPeriodPrice: +item.baseChildPeriodPrice,

      extendedAdultPeriod: item.extendedAdultPeriod ? +item.extendedAdultPeriod : null,
      extendedAdultPeriodPrice: item.extendedAdultPeriodPrice ? +item.extendedAdultPeriodPrice : null,
      extendedChildPeriod: item.extendedChildPeriod ? +item.extendedChildPeriod : null,
      extendedChildPeriodPrice: item.extendedChildPeriodPrice ? +item.extendedChildPeriodPrice : null,
    }));

    const result = schedule.reduce((frames, item) => ({ ...frames, [`f${item.id}`]: { ...item, id: isCreateMode ? undefined : item.id } }), {});

    return result;
  };

  const handleSubmitMasterMonthlyTicket = async (ticketPayload: TicketPayload) => {
    try {
      setIsSubmitting(true);
      await submitTicket(ticketPayload);
      dispatch(showNotification({ type: NotificationType.SUCCESS, message: MESSAGES.CREATE_TICKET_SUCCESS }));
      router.push(ROUTE.TICKET_MANAGEMENT);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    const isEmptyFramesPayload = isEmpty(framesPayload) || Object.values(framesPayload).every((item) => isNil(item));

    if (isEmptyFramesPayload) {
      dispatch(showNotification({ type: NotificationType.ERROR, message: MESSAGES.MUST_HAVE_BOOKING_SCHEDULE }));
      return;
    }

    const hasFrameErrors = Object.values(frameErrors).some((item) => !isEmpty(item));
    if (hasFrameErrors) {
      dispatch(showNotification({ type: NotificationType.ERROR, message: MESSAGES.CREATE_TICKET_FAILED }));
      return;
    }

    const hasInvalidRangeDateFrame = Object.values(framesPayload).some((item) => item?.isValidRangeDate === false);
    if (hasInvalidRangeDateFrame) {
      dispatch(showNotification({ type: NotificationType.ERROR, message: MESSAGES.RANGE_DATE_TICKET_BOOKING_SCHEDULE_INVALID }));
      return;
    }

    try {
      setIsSubmitting(true);
      const ticketId = await submitTicket(ticketPayload);
      await submitFrames(ticketId || ticket.id);
      dispatch(showNotification({ type: NotificationType.SUCCESS, message: MESSAGES.CREATE_TICKET_SUCCESS }));
      router.push(ROUTE.TICKET_MANAGEMENT);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadVideoFile = async (ticketId: number, videoFile: any) => {
    const fileName = `${ticketId}.${videoFile.name?.split(".").pop()}`;
    try {
      if (videoFile.name) {
        const res = await upload(videoFile, fileName);
        await updateTicketVideoUrl(ticketId, res.fileName);
      }
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      dispatch(showNotification({ type: NotificationType.ERROR, message }));
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

  const submitTicket = async (ticketPayloadParam: TicketPayload): Promise<number | undefined> => {
    const { videoUrl, id, ...dataToSubmit } = ticketPayloadParam;
    delete dataToSubmit.baseAdultPeriod;
    delete dataToSubmit.baseAdultPeriodUnit;
    delete dataToSubmit.baseAdultPeriodPrice;
    delete dataToSubmit.baseChildPeriod;
    delete dataToSubmit.baseChildPeriodUnit;
    delete dataToSubmit.baseChildPeriodPrice;
    delete dataToSubmit.extendedAdultPeriod;
    delete dataToSubmit.extendedAdultPeriodUnit;
    delete dataToSubmit.extendedAdultPeriodPrice;
    delete dataToSubmit.extendedChildPeriod;
    delete dataToSubmit.extendedChildPeriodUnit;
    delete dataToSubmit.extendedChildPeriodPrice;
    delete dataToSubmit.enableExpirationRemind;
    delete dataToSubmit.expirationRemindBeforeInDay;
    delete dataToSubmit.expirationRemindAt;

    const { setting, hourlyExtraTimeSetting } = dataToSubmit.TicketDiscountSetting;
    if (setting && Array.isArray(setting)) {
      const settingData = await Promise.all(
        setting.map(async (s) => ({
          ...s,
          adultSmaregiQRCodeUrl: s.adultSmaregiQRCodeUrl instanceof File
            ? await uploadImageFile(s.adultSmaregiQRCodeUrl)
            : s.adultSmaregiQRCodeUrl,
          childSmaregiQRCodeUrl: s.childSmaregiQRCodeUrl instanceof File
            ? await uploadImageFile(s.childSmaregiQRCodeUrl)
            : s.childSmaregiQRCodeUrl,
        }))
      );

      dataToSubmit.TicketDiscountSetting = {
        ...dataToSubmit.TicketDiscountSetting,
        setting: settingData,
      };
    }

    if (hourlyExtraTimeSetting.setting && Array.isArray(hourlyExtraTimeSetting?.setting)) {
      const settingData = await Promise.all(
        hourlyExtraTimeSetting?.setting.map(async (s) => ({
          ...s,
          adultSmaregiQRCodeUrl: s.adultSmaregiQRCodeUrl instanceof File
            ? await uploadImageFile(s.adultSmaregiQRCodeUrl)
            : s.adultSmaregiQRCodeUrl,
          childSmaregiQRCodeUrl: s.childSmaregiQRCodeUrl instanceof File
            ? await uploadImageFile(s.childSmaregiQRCodeUrl)
            : s.childSmaregiQRCodeUrl,
        }))
      );

      dataToSubmit.TicketDiscountSetting = {
        ...dataToSubmit.TicketDiscountSetting,
        hourlyExtraTimeSetting: {
          ...hourlyExtraTimeSetting,
          setting: settingData
        },
      };
    }

    if (isEditMode) {
      const res = await updateTicket(ticket.id, dataToSubmit);
      videoUrl && (await uploadVideoFile(ticket.id, videoUrl));
      return res.data.ticket.id;
    } else {
      const res = await createTicket({ ...dataToSubmit, videoUrl: typeof videoUrl === "string" ? videoUrl : null });
      videoUrl && (await uploadVideoFile(res.data.ticket.id, videoUrl));
      return res.data.ticket.id;
    }
  };

  const submitFrames = async (ticketId: number) => {
    const framesValues = Object.values(framesPayload).filter((item) => item);
    const framesToSubmit = framesValues.map(({ id, shouldImmediatelyValidate, isValidRangeDate, ...item }) => ({
      ...item,
      ...(([TicketType.HourlyTimesLimit, TicketType.DailyTimesLimit] as string[]).includes(ticketPayload.type) && {
        enableExpirationRemind: ticketPayload.enableExpirationRemind == "true",
        expirationRemindBeforeInDay: ticketPayload.enableExpirationRemind ? Number(ticketPayload.expirationRemindBeforeInDay) : null,
        expirationRemindAt: ticketPayload.expirationRemindAt ? (ticketPayload.expirationRemindAt as Date).toISOString() : null,
        ...(ticketPayload.type === TicketType.HourlyTimesLimit && {
          baseAdultPeriod: +ticketPayload.baseAdultPeriod,
          baseAdultPeriodUnit: ticketPayload.baseAdultPeriodUnit,
          baseAdultPeriodPrice: +ticketPayload.baseAdultPeriodPrice,
          baseChildPeriod: +ticketPayload.baseChildPeriod,
          baseChildPeriodUnit: ticketPayload.baseChildPeriodUnit,
          baseChildPeriodPrice: +ticketPayload.baseChildPeriodPrice,

          extendedAdultPeriod: ticketPayload.extendedAdultPeriod ? +ticketPayload.extendedAdultPeriod : null,
          extendedAdultPeriodUnit: ticketPayload.extendedAdultPeriodUnit || null,
          extendedAdultPeriodPrice: ticketPayload.extendedAdultPeriodPrice ? +ticketPayload.extendedAdultPeriodPrice : null,
          extendedChildPeriod: ticketPayload.extendedChildPeriod ? +ticketPayload.extendedChildPeriod : null,
          extendedChildPeriodUnit: ticketPayload.extendedChildPeriodUnit || null,
          extendedChildPeriodPrice: ticketPayload.extendedChildPeriodPrice ? +ticketPayload.extendedChildPeriodPrice : null,
        })
      }),
      ticketId,
      id: isEditMode ? id : undefined,
    }));
    if (isEditMode) {
      await updateTicketBookingSchedules(framesToSubmit);
    } else {
      await createTicketBookingSchedules(framesToSubmit);
    }
  };

  const handleReceiveErrors = (error, id: number | string) => {
    setFrameErrors((frameErrors) => ({ ...frameErrors, [id]: error }));
  };

  const ticketParams = ticket ? { ...ticket, tenantCode: ticketPayload?.tenantCode || ticket.tenantCode } : ticketPayload;

  return (
    <div>
      <CreateOrEditTicketForm onSave={(ticket) => handleSavedTicket(ticket)} ticket={ticket && convertToTicketFormData(ticket)} isCreateMode={isCreateMode} />

      {step === Step.InputTicketBookingSchedules && (
        <>
          <TicketBookingScheduleManager
            ticket={ticketParams}
            ticketBookingFrames={ticket && convertToTicketBookingFrames(ticket)}
            onSave={(frame) => handleSavedFrame(frame)}
            onError={handleReceiveErrors}
          />

          <div className="flex justify-center gap-24 mt-12">
            <AdminButton
              variant="outlined"
              className="w-[250px] h-[60px] font-bold"
              onClick={() => router.push({ pathname: ROUTE.TICKET_MANAGEMENT, query: { page, filters } })}
            >
              キャンセル
            </AdminButton>
            <UserSiteLoadingButton variant="contained" className="w-[250px] h-[60px] font-bold" onClick={handleSubmit} isLoading={isSubmitting}>
              商品を確定
            </UserSiteLoadingButton>
          </div>
        </>
      )}
      {/*Error*/}
      <Error message={errMsg} />
    </div>
  );
}
