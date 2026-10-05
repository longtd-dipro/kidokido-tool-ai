export const formatCurrency = (value: number | string) => {
  const parsedNumber = Number(value);
  if (Number.isNaN(parsedNumber)) {
    return "";
  }

  return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(+value);
};

export const formatCurrencyStrictMode = (value: number | string) => {
  if (value === undefined || value === null) {
    return "";
  }

  return formatCurrency(value);
};

export const getSafeNumberValue = (number) => {
  if (number && (typeof number === "object")) {
    return number.toNumber();
  }

  return number || 0;
};
