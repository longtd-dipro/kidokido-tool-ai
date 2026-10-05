/* eslint-disable react-hooks/rules-of-hooks */
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";

import { changeRouterQuery } from "utils/url";

interface UsePaginationOptions {
    onPageChange?: (page: number) => void;
}

export const useCachedPagination = (options: UsePaginationOptions) => {
  if (typeof window === "undefined") {
    // usePagination can only be used in browser;
    return {};
  }

  const router = useRouter();
  
  const searchParams = React.useMemo(() => new URLSearchParams(window.location.search), []);

  const defaultPage = searchParams.get("page");
  const defaultItemsPerPage = searchParams.get("itemsPerPage");

  const [page, setPage] = useState(defaultPage ? +defaultPage : 1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage ? +defaultItemsPerPage : 10);
  const [totalItems, setTotalItems] = useState(0);

  const prevPage = useRef(page);
  const prevItemsPerPage = useRef(itemsPerPage);

  useEffect(
    () => {
      if (page !== prevPage.current) {
        changeRouterQuery("page", page.toString(), router);

        options?.onPageChange?.(page);
        prevPage.current = page;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [options?.onPageChange, page]
  );

  useEffect(
    () => {
      if (itemsPerPage !== prevItemsPerPage.current) {
        changeRouterQuery("itemsPerPage", itemsPerPage.toString(), router);
        if (page === 1) {
          options?.onPageChange?.(1);
        }
        setPage(1);
        prevItemsPerPage.current = itemsPerPage;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [itemsPerPage, options?.onPageChange, page]
  );

  return {
    page,
    setPage,
    itemsPerPage,
    setItemsPerPage,
    totalItems,
    setTotalItems
  };
};