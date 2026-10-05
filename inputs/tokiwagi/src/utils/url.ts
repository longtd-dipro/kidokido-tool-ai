import { NextRouter } from "next/router";

import { UPLOAD_PATH } from "constants/settings";

export const getUrlQueryValue = (key: string) => {
  if (typeof window === "undefined") {
    return "";
  }

  const url = new URL(window.location.href);
  return url.searchParams.get(key);
};

export const changeRouterQuery = (key: string, value: string, router: NextRouter) => {
  const url = new URL(window.location.href);
  url.searchParams.set(key, value);

  router.replace({
    query: url.searchParams.toString(),
  });
};

export const deleteRouterQuery = (key: string, router: NextRouter) => {
  const url = new URL(window.location.href);
  url.searchParams.delete(key);

  router.replace({
    query: url.searchParams.toString(),
  });
};

export const getStorageUrl = (filePath: string) => {
  if (!filePath) {
    return;
  }
  return filePath.startsWith("http") ? filePath : `${UPLOAD_PATH}/${filePath}`;
};

export const getFileExtension = (filename: string) => {
  return filename.split(".").pop();
};

export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v !== undefined && v !== null && v !== "") {
          searchParams.append(`${key}[]`, String(v));
        }
      });
    } else {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
};
