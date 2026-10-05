import { Card, IconButton, MenuItem, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import React, { useEffect, useState } from "react";
import moment from "moment";
import Image from "next/legacy/image";
import { useRouter } from "next/router";
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvided, DroppableProvided, DraggableStateSnapshot } from "react-beautiful-dnd";
import { BookingStatus } from "@prisma/client";
import { useDispatch } from "react-redux";
import { cloneDeep } from "lodash";

import Button from "components/common/Buttons/AdminButton";
import styles from "styles/booking-queue.module.scss";
import { LONG_TIME, MINUTES, STATUS_TYPE } from "constants/common";
import { Booking } from "models/Entity";
import StockIcon from "statics/images/stock-icon.svg";
import AdultIcon from "statics/images/adult-admission-icon.svg";
import ChildrenIcon from "statics/images/children-admission-icon.svg";
import ClockIcon from "statics/images/queue-clock.svg";
import MenuIcon from "statics/images/menu.svg";
import BellIcon from "statics/images/bell-icon.svg";
import { ROUTE } from "constants/route";
import { NotificationType, showNotification } from "stores/reducers/notification";
import { MESSAGES } from "constants/messages";
import { BookingQueueWaitingPayload } from "models/Booking";
import { calculateWaitingOrder, groupBookings, sortWaitingBookings } from "utils/waiting-booking";
import { getShortBarCode } from "utils/booking";

export interface Props {
  processUpdateStatusBookingQueue: (Booking, boolean) => void;
  processUpdateWaitingOrderForBookingQueue: (data: any) => void;
  waitingBookingsData: any;
  refreshWaitingQueue: () => void;
  handleChangeStatus: (event: any, booking: Booking) => void;
}

export default function Waiting({
  processUpdateStatusBookingQueue,
  processUpdateWaitingOrderForBookingQueue,
  waitingBookingsData,
  refreshWaitingQueue,
  handleChangeStatus,
}: Props) {
  const [accumulativeWaitingBookings, setAccumulativeWaitingBookings] = useState<Booking[]>([]);
  const [standaloneWaitingBookings, setStandaloneWaitingBookings] = useState<BookingQueueWaitingPayload[]>([]);
  const { totalWaitingGroups, totalWaitingPeople, totalAdultCheckIn, totalChildCheckIn, totalWaitingBookingsTime } = waitingBookingsData;

  useEffect(() => {
    if (waitingBookingsData) {
      setAccumulativeWaitingBookings(calculateWaitingOrder(sortWaitingBookings(groupBookings(waitingBookingsData.accumulativeWaitingBookings))));

      const standaloneWaitingBookings = waitingBookingsData.standaloneWaitingBookings.filter((item) => item.waitingBookings.length > 0);
      standaloneWaitingBookings.forEach((item, index) => {
        standaloneWaitingBookings[index].waitingBookings = calculateWaitingOrder(sortWaitingBookings(groupBookings(item.waitingBookings)));
      });
      setStandaloneWaitingBookings(standaloneWaitingBookings);
    }
  }, [waitingBookingsData]);

  const router = useRouter();
  const dispatch = useDispatch();

  const redirectBookingVacancies = () => {
    router.push(ROUTE.BOOKING_VACANCIES);
  };

  const processCallingImmediately = async (item: Booking) => {
    item.status = BookingStatus.Calling;

    await processUpdateStatusBookingQueue(item, true);
    dispatch(
      showNotification({
        type: NotificationType.SUCCESS,
        message: MESSAGES.SEND_NOTIFICATION_SUCCESSFUL,
      })
    );
  };

  const changePositionWaitingAccumulative = (result: DropResult) => {
    const queueWaitingAccumulative = [...accumulativeWaitingBookings];
    const queueDestinationIndex = queueWaitingAccumulative[result.destination!.index];
    queueWaitingAccumulative[result.destination!.index] = queueWaitingAccumulative[result.source.index];
    queueWaitingAccumulative[result.source.index] = queueDestinationIndex;
    calculateWaitingOrder(queueWaitingAccumulative);
    setAccumulativeWaitingBookings(queueWaitingAccumulative);
    return queueWaitingAccumulative;
  };

  const changePositionWaitingStandAlone = (result: DropResult, ticketIndex: number) => {
    const queueTicketWaitingBookings = standaloneWaitingBookings[ticketIndex].waitingBookings;
    const queueDestinationIndex = queueTicketWaitingBookings[result.destination!.index];
    queueTicketWaitingBookings[result.destination!.index] = queueTicketWaitingBookings[result.source.index];
    queueTicketWaitingBookings[result.source.index] = queueDestinationIndex;
    calculateWaitingOrder(queueTicketWaitingBookings);

    const cloneStandaloneWaitingBookings = cloneDeep(standaloneWaitingBookings);
    cloneStandaloneWaitingBookings[ticketIndex].waitingBookings = queueTicketWaitingBookings;

    setStandaloneWaitingBookings(cloneStandaloneWaitingBookings);

    return queueTicketWaitingBookings;
  };

  const handleDragEndWaitingAccumulative = async (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    if (result.destination.index === result.source.index) {
      return;
    }

    const updatedPositionAccumulativeData = changePositionWaitingAccumulative(result);

    await processUpdateWaitingOrderForBookingQueue(updatedPositionAccumulativeData);
  };

  const handleDragEndWaitingStandAlone = async (result: DropResult, ticketIndex: number) => {
    if (!result.destination) {
      return;
    }

    if (result.destination.index === result.source.index) {
      return;
    }

    const updatedPositionData = changePositionWaitingStandAlone(result, ticketIndex);

    await processUpdateWaitingOrderForBookingQueue(updatedPositionData);
  };

  return (
    <div className="flex flex-col gap-[28px]">
      {/*Summary info*/}
      <Card className="flex flex-row md:flex-col items-center justify-between md:gap-4 md:p-4">
        <div
          className="flex flex-row justify-between items-center mdup:py-8 mdup:px-5 gap-[4px] bg-white rounded-[10px]
                        leading-[20px] text-base md:text-sm grow md:w-[684px] mdup:basis-4/5"
        >
          <div className="flex h-[40px] flex-row justify-between gap-[12px]">
            <Image src={StockIcon} className="h-[40px] w-[40px]" alt="Logo" />
            <div className="flex-none order-0 grow-0 items-stretch ad-text-color">
              <h2>順番待ち人数</h2>
              <p>{totalWaitingPeople}</p>
            </div>
          </div>
          <div className="flex h-[40px] flex-row justify-between gap-[12px]">
            <Image src={AdultIcon} className="mr-3 h-8 sm:h-9" alt="Logo" />
            <div className="flex-none order-0 grow-0 items-stretch ad-text-color">
              <h2>おとな入場中</h2>
              <p>{totalAdultCheckIn}</p>
            </div>
          </div>
          <div className="flex h-[40px] flex-row justify-between gap-[12px]">
            <Image src={ChildrenIcon} className="mr-3 h-8 sm:h-9" alt="Logo" />
            <div className="flex-none order-0 grow-0 items-stretch ad-text-color">
              <h2>子ども入場中</h2>
              <p>{totalChildCheckIn}</p>
            </div>
          </div>
          <div className="flex h-[40px] flex-row justify-between items-center gap-[12px]">
            <Image src={ClockIcon} className="mr-3 h-8 sm:h-9" alt="Logo" />
            <div className="flex-none order-0 grow-0 items-stretch ad-text-color">
              <h2>
                {totalWaitingGroups}組{totalWaitingBookingsTime}分待ち
              </h2>
            </div>
          </div>
        </div>
        <div className="rounded-[10px] mx-5 mdup:basis-1/5 flex justify-end">
          <Button
            className="rounded-[10px w-[201px] h-11 md:w-[125px] md:h-9 md:!text-sm md:!leading-4 md:!p-0 !text-base mdup:items-end"
            variant="contained"
            onClick={() => redirectBookingVacancies()}
          >
            割り当て数変更
          </Button>
        </div>
      </Card>

      {/* Accumulative Waiting Bookings */}
      {accumulativeWaitingBookings.length > 0 && (
        <Card>
          {/* Refresh */}
          <div className="flex justify-between items-center ml-[44px] mr-[28px] my-[12px]">
            <h3 className="text-[18px] leading-[24px] text-color font-bold">当日利用枠</h3>
            <div className="flex justify-end">
              <Button variant="outlined" onClick={refreshWaitingQueue} className="!rounded-[4px]">
                リフレッシュ
              </Button>
            </div>
          </div>
          {/* Data */}
          <TableContainer>
            <DataTable
              waitingBookings={accumulativeWaitingBookings}
              processCallingImmediately={processCallingImmediately}
              handleChangeStatus={handleChangeStatus}
              handleDragEnd={handleDragEndWaitingAccumulative}
            />
          </TableContainer>
        </Card>
      )}

      {/*Standalone Waiting Bookings*/}
      {standaloneWaitingBookings.map((item, index) => (
        <Card key={`${item.ticketId}_${index}`}>
          {/* Refresh */}
          <div className="flex justify-between items-center ml-[44px] mr-[28px] my-[12px]">
            <h3 className="text-[18px] leading-[24px] text-color font-bold">{item.ticketName}</h3>
            <div className="flex justify-end">
              <Button variant="outlined" onClick={refreshWaitingQueue} className="!rounded-[4px]">
                リフレッシュ
              </Button>
            </div>
          </div>

          {/* Data */}
          <TableContainer className="max-h-[600px]">
            <DataTable
              waitingBookings={item.waitingBookings}
              processCallingImmediately={processCallingImmediately}
              handleChangeStatus={handleChangeStatus}
              handleDragEnd={handleDragEndWaitingStandAlone}
              index={index}
            />
          </TableContainer>
        </Card>
      ))}
    </div>
  );
}

interface DataTableProps {
  waitingBookings: Booking[];
  processCallingImmediately: (Booking) => void;
  handleChangeStatus: (event: any, booking: Booking) => void;
  handleDragEnd: (DropResult, number?) => void;
  index?: number;
}

function DataTable({ waitingBookings, processCallingImmediately, handleChangeStatus, handleDragEnd, index }: DataTableProps) {
  return (
    <Table>
      <TableHead className={styles.tableHead}>
        <TableRow>
          <TableCell className="w-[173px] min-w-[173px]" align="center">
            アクション
          </TableCell>
          <TableCell className="min-w-[74px]">No</TableCell>
          <TableCell className="min-w-[148px]">ステータス</TableCell>
          <TableCell className="min-w-[192px]">予約ID</TableCell>
          <TableCell className="min-w-[192px]">バーコードの下4桁</TableCell>
          <TableCell className="min-w-[192px]">商品名</TableCell>
          <TableCell className="min-w-[142px]">人数</TableCell>
          <TableCell className="min-w-[192px]">待ち時間</TableCell>
          <TableCell className="min-w-[192px]">経った時間</TableCell>
          <TableCell className="min-w-[265px]">電話番号</TableCell>
        </TableRow>
      </TableHead>
      <DragDropContext onDragEnd={(result) => handleDragEnd(result, index)}>
        <Droppable droppableId="droppable" direction="vertical" key={index}>
          {(droppableProvided: DroppableProvided) => (
            <TableBody ref={droppableProvided.innerRef} {...droppableProvided.droppableProps}>
              {waitingBookings.map((item, index: number) => (
                <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                  {(draggableProvided: DraggableProvided, snapshot: DraggableStateSnapshot) => {
                    return (
                      <TableRow
                        ref={draggableProvided.innerRef}
                        {...draggableProvided.draggableProps}
                        style={{
                          ...draggableProvided.draggableProps.style,
                          background: snapshot.isDragging ? "#f5f5f5bf" : "none",
                        }}
                      >
                        {/* Action */}
                        <TableCell align="center">
                          <div className={styles.btnAction}>
                            <div className="h-[24px]" {...draggableProvided.dragHandleProps}>
                              <Image src={MenuIcon} alt="update" />
                            </div>
                            <IconButton aria-label="notifications" onClick={() => processCallingImmediately(item)}>
                              <Image src={BellIcon} alt="sendNotification" />
                            </IconButton>
                          </div>
                        </TableCell>

                        {/* Waiting Order */}
                        <TableCell>{item.waitingOrder}</TableCell>

                        {/* Status */}
                        <TableCell>
                          <Select
                            id="status"
                            value={item.status}
                            size="small"
                            className={styles["ad-select-field"]}
                            sx={{
                              ".MuiSelect-select": {
                                border: "1px solid #FF8100;",
                              },
                            }}
                            onChange={(event) => handleChangeStatus(event, item)}
                          >
                            {STATUS_TYPE.map((item, index) => (
                              <MenuItem key={index} value={item.value}>
                                {item.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </TableCell>

                        {/* Booking ID */}
                        <TableCell className="max-w-[192px] truncate">{item.id}</TableCell>

                        {/* Short Barcode */}
                        <TableCell className="max-w-[192px] truncate">{getShortBarCode(item.barCode)}</TableCell>

                        {/* Ticket Name */}
                        <TableCell className="wrap-cell">{item.Ticket.name}</TableCell>

                        {/* Total People */}
                        <TableCell>{item.adultQuantity + item.childQuantity}</TableCell>

                        {/* Waiting Time */}
                        <TableCell>{formatWaitingTime(item.waitingTime)}</TableCell>

                        {/* Waiting Duration */}
                        <TableCell>{item.waitingDuration}</TableCell>

                        {/* Phone */}
                        <TableCell className="max-w-[265px] truncate">{item.User.phone}</TableCell>
                      </TableRow>
                    );
                  }}
                </Draggable>
              ))}
              {droppableProvided.placeholder}
            </TableBody>
          )}
        </Droppable>
      </DragDropContext>
    </Table>
  );
}

const formatWaitingTime = (waitingTime: number) => {
  return moment.utc(moment.duration(waitingTime, MINUTES).asMilliseconds()).format(LONG_TIME);
};
