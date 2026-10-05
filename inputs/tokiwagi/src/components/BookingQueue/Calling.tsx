import { Card, MenuItem, Pagination, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import React, { useEffect, useState } from "react";

import Button from "components/common/Buttons/AdminButton";
import styles from "styles/booking-queue.module.scss";
import { PAGE_SIZE, STATUS_TYPE } from "constants/common";
import { Booking } from "models/Entity";
import usePagination from "libs/hooks/usePagination";
import { BookingQueueCallingPayload } from "models/Booking";
import { groupBookings, sortCallingBookings } from "utils/waiting-booking";
import { getShortBarCode } from "utils/booking";

export interface Props {
  callingBookingsData: { accumulativeCallingBookings: Booking[]; standaloneCallingBookings: BookingQueueCallingPayload[] };
  refreshCallingQueue: () => void;
  handleChangeStatus: (event: any, booking: Booking) => void;
}

export default function Calling({ callingBookingsData, refreshCallingQueue, handleChangeStatus }: Props) {
  const [accumulativeBookings, setAccumulativeBookings] = useState<Booking[]>([]);
  const [standaloneBookings, setStandaloneBookings] = useState<BookingQueueCallingPayload[]>([]);

  useEffect(() => {
    if (callingBookingsData) {
      setAccumulativeBookings(sortCallingBookings(groupBookings(callingBookingsData.accumulativeCallingBookings)));

      const standaloneCallingBookings = callingBookingsData.standaloneCallingBookings.filter((item) => item.callingBookings.length > 0);
      standaloneCallingBookings.forEach((item, index) => {
        standaloneCallingBookings[index].callingBookings = sortCallingBookings(groupBookings(item.callingBookings));
      });
      setStandaloneBookings(standaloneCallingBookings);
    }
  }, [callingBookingsData]);

  return (
    <div className="flex flex-col gap-[28px]">
      {/* Accumulative Waiting Bookings */}
      {accumulativeBookings.length > 0 && (
        <Card>
          {/* Refresh */}
          <div className="flex justify-between items-center ml-[44px] mr-[28px] my-[12px]">
            <h3 className="text-[18px] leading-[24px] text-color font-bold">当日利用枠</h3>
            <div className="flex justify-end">
              <Button variant="outlined" onClick={refreshCallingQueue} className="!rounded-[4px]">
                リフレッシュ
              </Button>
            </div>
          </div>

          {/*Data*/}
          <CallingTable callingBookings={accumulativeBookings} handleChangeStatus={handleChangeStatus} />
        </Card>
      )}

      {/*Standalone Calling Bookings*/}
      {standaloneBookings.map((item, index) => (
        <Card key={`${item.ticketId}_${index}`}>
          {/* Refresh */}
          <div className="flex justify-between items-center ml-[44px] mr-[28px] my-[12px]">
            <h3 className="text-[18px] leading-[24px] text-color font-bold">{item.ticketName}</h3>
            <div className="flex justify-end">
              <Button variant="outlined" onClick={refreshCallingQueue} className="!rounded-[4px]">
                リフレッシュ
              </Button>
            </div>
          </div>

          {/* Data */}
          <CallingTable callingBookings={item.callingBookings} handleChangeStatus={handleChangeStatus} />
        </Card>
      ))}
    </div>
  );
}

interface CallingTableProps {
  callingBookings: Booking[];
  handleChangeStatus: (event: any, booking: Booking) => void;
}

function CallingTable({ callingBookings, handleChangeStatus }: CallingTableProps) {
  const limit = PAGE_SIZE;
  const [page, setPage] = useState<number>(1);
  const dataCalling = usePagination(callingBookings, limit);
  const pageCountCalling = Math.ceil(callingBookings.length / limit);

  const handleChangePageCalling = (event: unknown, newPage: number) => {
    setPage(newPage);
    dataCalling.jump(newPage);
  };

  return (
    <>
      <TableContainer>
        <Table>
          <TableHead className={styles.tableHead}>
            <TableRow>
              <TableCell className="min-w-[74px]" align="center">
                順番待ち
              </TableCell>
              <TableCell className="!max-w-[148px] w-[148px]">ステータス</TableCell>
              <TableCell className="min-w-[192px]">予約ID</TableCell>
              <TableCell className="min-w-[192px]">バーコードの下4桁</TableCell>
              <TableCell className="min-w-[192px]">商品名</TableCell>
              <TableCell className="min-w-[142px]">人数</TableCell>
              <TableCell className="min-w-[192px]">呼び出し中</TableCell>
              <TableCell className="min-w-[265px]">電話番号</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dataCalling.currentData().map((item, index: number) => (
              <TableRow key={item.id}>
                {/* Order */}
                <TableCell align="center">{index + 1}</TableCell>

                {/* Status */}
                <TableCell>
                  <Select
                    id="status"
                    value={item.status}
                    size="small"
                    className={styles["ad-select-field"]}
                    sx={{
                      ".MuiSelect-select": {
                        border: "1px solid #92E4CD",
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

                {/* Calling Duration */}
                <TableCell>{item.callingDuration}</TableCell>

                {/* Phone */}
                <TableCell className="max-w-[265px] truncate">{item.User.phone}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <div className="py-6 px-6 flex justify-end items-center gap-4 text-sm">
        <p>全て {callingBookings.length} 件</p>
        <Pagination
          color="primary"
          variant="outlined"
          shape="rounded"
          page={page}
          count={pageCountCalling}
          onChange={handleChangePageCalling}
          siblingCount={0}
        />
        <p>{limit} / ページ</p>
      </div>
    </>
  );
}
