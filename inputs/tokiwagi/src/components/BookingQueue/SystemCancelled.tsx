import { Card, MenuItem, Pagination, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import React, { useState } from "react";

import Button from "components/common/Buttons/AdminButton";
import styles from "styles/booking-queue.module.scss";
import { PAGE_SIZE, STATUS_TYPE } from "constants/common";
import { Booking } from "models/Entity";
import usePagination from "libs/hooks/usePagination";
import { getShortBarCode } from "utils/booking";

export interface Props {
  refreshAbsentQueue: () => void;
  handleChangeStatus: (event: any, booking: Booking) => void;
  bookings: Booking[];
}

export default function SystemCancelled({ bookings, refreshAbsentQueue, handleChangeStatus }: Props) {
  const limit = PAGE_SIZE;
  const [page, setPage] = useState<number>(1);
  const dataAbsent = usePagination(bookings, limit);
  const pageCountAbsent = Math.ceil(bookings.length / limit);

  const handleChangePageAbsent = (event: unknown, newPage: number) => {
    setPage(newPage);
    dataAbsent.jump(newPage);
  };

  return (
    <Card>
      {/* Refresh */}
      <div className="flex justify-end pt-3 pb-[7px] pr-5">
        <Button variant="outlined" onClick={refreshAbsentQueue} className="!rounded-[4px]">
          リフレッシュ
        </Button>
      </div>

      {/* Data */}
      <TableContainer>
        <Table>
          <TableHead className={styles.tableHead}>
            <TableRow>
              <TableCell className="min-w-[114px] w-[114px]" align="center">
                順番待ち
              </TableCell>
              <TableCell className="max-w-[142px] w-[142px]">ステータス</TableCell>
              <TableCell className="min-w-[192px]">予約ID</TableCell>
              <TableCell className="min-w-[192px]">バーコードの下4桁</TableCell>
              <TableCell className="min-w-[192px] w-[192px]">商品名</TableCell>
              <TableCell className="min-w-[142px] w-[142px]">人数</TableCell>
              <TableCell className="min-w-[192px] w-[192px]">経った時間</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dataAbsent.currentData().map((item, index: number) => (
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
                        border: "1px solid #B4B2B7",
                      },
                    }}
                    onChange={(event) => handleChangeStatus(event, item)}
                  >
                    {STATUS_TYPE.map((item, index) => (
                      <MenuItem className={styles["ad-select-field"]} key={index} value={item.value}>
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

                {/* Calling Time */}
                <TableCell>{item.cancelledDuration}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <div className="py-6 px-6 flex justify-end items-center gap-4 text-sm">
        <p>全て {bookings.length} 件</p>
        <Pagination color="primary" variant="outlined" shape="rounded" page={page} count={pageCountAbsent} onChange={handleChangePageAbsent} siblingCount={0} />
        <p>{limit} / ページ</p>
      </div>
    </Card>
  );
}
