import { Pagination, PaginationItem } from "@mui/material";
import { gridPageCountSelector, gridPageSelector, gridRowCountSelector, gridPageSizeSelector, useGridApiContext, useGridSelector } from "@mui/x-data-grid";
import { useRouter } from "next/router";
import { ChangeEvent } from "react";

import { changeRouterQuery } from "utils/url";

import styles from "./index.module.scss";

type Props = {
  needToSetQueryString?: boolean;
};

export default function DataGridPagination({ needToSetQueryString }: Props) {
  const router = useRouter();
  const apiRef = useGridApiContext();
  const page = useGridSelector(apiRef, gridPageSelector);
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);
  const pageSize = useGridSelector(apiRef, gridPageSizeSelector);
  const rowCount = useGridSelector(apiRef, gridRowCountSelector);

  return (
    <div className={`${styles.container} py-12 px-12 flex items-center gap-4`}>
      <p>全て {rowCount} 件</p>
      <Pagination
        color="primary"
        variant="outlined"
        shape="rounded"
        page={page + 1}
        count={pageCount}
        // @ts-expect-error
        renderItem={(props2) => <PaginationItem {...props2} disableRipple />}
        onChange={(event: ChangeEvent<unknown>, value: number) => {
          const newPage = value - 1;
          apiRef.current.setPage(newPage);
          needToSetQueryString && changeRouterQuery("page", `${value}`, router);
        }}
      />
      <p>{pageSize} / ページ</p>
    </div>
  );
}
