import { MenuItem, Pagination, Select, SelectChangeEvent } from "@mui/material";
import { ChangeEvent, useState } from "react";

interface Props {
  page: number;
  rowCount: number;
  defaultPageSize: number;
  onChange: (page: number, pageSize: number) => void;
}

export default function IndependencePagination(props: Props) {
  const [pageSize, setPageSize] = useState(props.defaultPageSize ?? "");

  const handlePageSizeChange = (event: SelectChangeEvent) => {
    setPageSize(event.target.value);
    props.onChange(props.page, Number(event.target.value));
  };

  const pageCount = Math.ceil(props.rowCount / +pageSize);
  
  return (
    <div className="admin-pagination flex justify-end gap-4">
      <p className="text-[14px]">全て {props.rowCount} 件</p>
      <Pagination
        color="primary"
        shape="rounded"
        page={props.page}
        count={pageCount}
        onChange={(event: ChangeEvent<unknown>, value: number) => props.onChange(value, +pageSize)}
        siblingCount={1}
        boundaryCount={2}
      />
      <Select
        value={pageSize}
        onChange={handlePageSizeChange}
      >
        <MenuItem value={10}>10 / ページ</MenuItem>
        <MenuItem value={20}>20 / ページ</MenuItem>
        <MenuItem value={50}>50 / ページ</MenuItem>
        <MenuItem value={100}>100 / ページ</MenuItem>
      </Select>
    </div>
  );
}
