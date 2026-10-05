import { Accordion, AccordionDetails, AccordionSummary, Button } from "@mui/material";
import { TicketType } from "@prisma/client";
import { isEmpty, omit, sortBy } from "lodash";
import moment from "moment";
import Image from "next/legacy/image";
import randomstring from "randomstring";
import { MouseEvent, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { FieldErrors } from "react-hook-form";

import AdminButton from "components/common/Buttons/AdminButton";
import TicketBookingFrameForm from "components/Ticket/CreateOrEditTicketStepper/TicketBookingScheduleManager/TicketBookingFrameForm";
import { JP_SHORT_DATE, MINIMUM_MONTH_CAN_DELETE_BOOKING_SCHEDULE, SHORT_TIME } from "constants/common";
import { Ticket } from "models/Entity";
import { FrameFormData, TicketPayload } from "models/Ticket";
import AddCircleImage from "statics/images/add-circle.svg";
import { NotificationType, showNotification } from "stores/reducers/notification";
import { isAfterDay, isDateInFuture, isSameDay, isSameOrAfterDay, isSameOrBeforeDay } from "utils/date-time";
import { MESSAGES } from "constants/messages";
import { checkTicketBookingScheduleHasBooking } from "services/api-client/admin/ticket.service";

import styles from "./index.module.scss";

export type TicketFrames = {
  [id: string]: FrameFormData & { ticketId?: number; id?: number };
};

type Props = {
  ticket: Ticket | TicketPayload;
  ticketBookingFrames: TicketFrames;
  onSave: (ticketFrames: TicketFrames) => void;
  onError: (error: FieldErrors, id: number | string) => void;
};

export default function TicketBookingScheduleManager({ ticket, ticketBookingFrames, onSave, onError }: Props) {
  const dispatch = useDispatch();
  const [frames, setFrames] = useState<TicketFrames>(ticketBookingFrames || {});
  useEffect(() => {
    onSave(frames);
  }, [frames]);

  const handleAddNewFrame = () => {
    const id = randomstring.generate();
    setFrames({ ...frames, [id]: null });
  };

  const handleDeleteFrame = async (e: MouseEvent<HTMLButtonElement>, id: string, ticket: Ticket | TicketPayload) => {
    e.stopPropagation();

    const frame = frames[id];
    if (frame?.id) {
      const today = moment();
      const dateFrom = moment(frame?.dateFrom);
      const dateTo = moment(frame?.dateTo);

      const isOutOfDate = today.diff(dateTo, "month", true) > MINIMUM_MONTH_CAN_DELETE_BOOKING_SCHEDULE;

      if (!isOutOfDate) {
        let allowedToDelete = !(await handleCheckHasBooking(frame?.id));

        if (allowedToDelete && ticket.type === TicketType.Monthly) {
          // Allow deleting the booking schedule frame in the future, excluding today
          allowedToDelete = isDateInFuture(dateFrom);
        }

        if (!allowedToDelete) {
          dispatch(showNotification({ type: NotificationType.ERROR, message: MESSAGES.CANNOT_REMOVE_TICKET_BOOKING_SCHEDULE }));
          return;
        }
      }
    }

    const filteredFrames = omit(frames, [id]);
    setFrames(filteredFrames);
    onError({}, id);
  };

  const handleCheckHasBooking = async (ticketBookingScheduleId: number) => {
    try {
      const { hasBooking } = await checkTicketBookingScheduleHasBooking(ticketBookingScheduleId);
      return hasBooking;
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      dispatch(showNotification({ type: NotificationType.ERROR, message }));
    }
  };

  const handleSaveFrame = (id: string, frameData: FrameFormData) => {
    const filteredFrames = omit(frames, [id]);
    const isValidRangeDate = checkValidRangeDate(frameData, Object.values(filteredFrames));
    if (!isValidRangeDate) {
      dispatch(showNotification({ type: NotificationType.ERROR, message: MESSAGES.RANGE_DATE_TICKET_BOOKING_SCHEDULE_INVALID }));
      setFrames({ ...frames, [id]: { ...frameData, isValidRangeDate: false } });
      return;
    }
    setFrames({ ...frames, [id]: { ...frameData, isValidRangeDate: true } });
    dispatch(showNotification({ type: NotificationType.SUCCESS, message: MESSAGES.CREATE_TICKET_BOOKING_SCHEDULE_SUCCESS }));
  };

  /**
   * Check range date valid:
   * Invalid cases:
   * - dateFrom > dateTo
   * - dateFrom = dateTo = [dateFrom, dateTo] of existing frames
   * - [dateFrom -> dateTo] is overlap with [dateFrom -> dateTo] of existing frames
   * @param currentFrame
   * @param existingFrames
   * @returns isValid true or false
   */
  const checkValidRangeDate = (frameData: FrameFormData, frames: FrameFormData[]) => {
    const { dateFrom, dateTo } = frameData;
    if (isAfterDay(dateFrom, dateTo)) {
      return false;
    }

    for (const frame of frames) {
      if (frame?.dateFrom && frame?.dateTo) {
        if (isSameDay(dateFrom, dateTo)) {
          if (isSameDay(dateFrom, frame.dateFrom) || isSameDay(dateTo, frame.dateTo)) {
            return false;
          }
          continue;
        }

        if (isSameOrBeforeDay(dateFrom, frame.dateTo) && isSameOrAfterDay(dateTo, frame.dateFrom)) {
          return false;
        }
      }
    }

    return true;
  };

  const handleDuplicate = (e: MouseEvent<HTMLButtonElement>, id: string) => {
    e.stopPropagation();

    const newId = randomstring.generate();
    let newFrame = omit(frames[id], ["id", "dateFrom", "dateTo", "createdAt", "updatedAt"]);

    if (isEmpty(newFrame)) {
      newFrame = null;
    } else {
      newFrame.shouldImmediatelyValidate = true;
    }

    setFrames({ ...frames, [newId]: newFrame as any });
  };

  return (
    <div className={`${styles.container} mt-12 px-4`}>
      <div className="flex items-center gap-2 mb-16 heading">
        <div className={`${styles.line} w-[146px]`}></div>
        <div className="flex items-center gap-4">
          <AdminButton className={`!min-w-[32px] h-[32px] !p-0 !rounded-full !cursor-default !text-white !font-bold ${styles.buttonNumber}`}>2</AdminButton>
          <div className="text-xl font-bold">在庫・予約枠の日時、場所、定員を設定</div>
        </div>

        <div className={`${styles.line} flex-1`}></div>
      </div>
      <div className="flex flex-col px-2">
        {sortBy(Object.entries(frames), function (frame: FrameFormData) {
          return new Date(frame?.[1]?.dateFrom);
        }).map(([id, frame]: any) => (
          <Accordion className="my-3 shadow-none" key={id}>
            <AccordionSummary className={`${styles.frame} px-8`}>
              <div className="flex items-center justify-between w-full mdup:ml-2 mr-12 text-base">
                <div className="mdonly:min-w-2/3">
                  <div className="mb-2">
                    <span>開催:</span>
                    <span className="mx-8 font-bold min-w-[110px]">{frame?.dateFrom ? moment(frame?.dateFrom).format(JP_SHORT_DATE) : ""}</span>
                  </div>
                  <div>
                    <span>〆切:</span>
                    <span className="mx-8 font-bold min-w-[110px]">{frame?.dateTo ? moment(frame?.dateTo).format(JP_SHORT_DATE) : ""}</span>
                    <span className="font-bold">{(frame && moment(frame?.canBookingUtil).format(SHORT_TIME)) || ""}</span>
                  </div>
                </div>

                <div className="flex gap-8 mdonly:w-1/3 mdonly:gap-4">
                  <AdminButton variant="contained" className="w-[170px] h-[51px] mdonly:w-[115px]" onClick={(e) => handleDuplicate(e, id)}>
                    複製
                  </AdminButton>
                  <AdminButton variant="outlined" className="w-[170px] h-[51px] mdonly:w-[115px]" onClick={(e) => handleDeleteFrame(e, id, ticket)}>
                    削除
                  </AdminButton>
                </div>
              </div>
            </AccordionSummary>

            <AccordionDetails>
              <TicketBookingFrameForm
                id={id}
                onSave={(frameData) => handleSaveFrame(id, frameData)}
                onError={onError}
                frame={frame}
                ticketType={ticket.type as TicketType}
                tenantCode={ticket?.tenantCode}
              />
            </AccordionDetails>
          </Accordion>
        ))}

        <Button type="submit" className={`${styles.addButton} mt-4`} onClick={handleAddNewFrame}>
          <div className="flex items-center justify-center gap-4 text-xl font-medium">
            <Image src={AddCircleImage} alt="add-icon" />
            <span>予約枠を追加</span>
          </div>
        </Button>
      </div>
    </div>
  );
}
