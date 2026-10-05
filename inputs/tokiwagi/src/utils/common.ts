import { GridColDef } from "@mui/x-data-grid";
import { isEqual, sortBy } from "lodash";

import { CsvHeader, FILE_SIZE, FILE_SIZE_UNIT } from "models/common";

export const getMessageFromError = (error: any) => {
  const message = error?.response?.data?.error || error?.message;
  return message;
};

export const formatThousands = (num: number) => {
  if (!num) {
    return "0";
  }

  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
};

export const trimFields = <T extends { [key: string]: any }, K extends keyof T>(params: T, fields: K[]): T => {
  const result = {} as T;
  const paramKeys = Object.keys(params) as K[];
  paramKeys.forEach((key) => {
    if (fields.includes(key) && typeof params[key] === "string") {
      result[key] = params[key].trim();
    } else {
      result[key] = params[key];
    }
  });
  return result;
};

export const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

export const checkIsEqualArrays = (array1: number[], array2: number[]) => {
  return isEqual(sortBy(array1), sortBy(array2));
};

export const formatMessage = (str: string, ...args: unknown[]): string => {
  return `${str}`.replace(/\{(\d+)\}/g, (match, index) => (args[index] || match) as string);
};

export const transformCsvHeader: (item: GridColDef) => CsvHeader = (item: GridColDef) => ({ label: item.headerName, key: item.field });

export const convertFileSize = (size: number, sourceUnit: FILE_SIZE_UNIT, targetUnit: FILE_SIZE_UNIT) => {
  if (!FILE_SIZE[sourceUnit] || !FILE_SIZE[targetUnit]) {
    throw new Error("Invalid unit");
  }

  const bytes = size * FILE_SIZE[sourceUnit];
  return bytes / FILE_SIZE[targetUnit];
};

export const wait = (timeout: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({});
    }, timeout);
  });
};
