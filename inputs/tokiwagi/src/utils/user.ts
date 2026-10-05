import { isNil } from "lodash";
import { Role } from "@prisma/client";

import { GENDER_OPTIONS, NEWS_LETTER_OPTIONS, PROVINCE_OPTIONS, ROLE } from "constants/common";
import { Staff, User } from "models/Entity";

export const getUserGenderLabel = (gender: boolean | string) => {
  if (isNil(gender)) {
    gender = "";
  }
  return GENDER_OPTIONS.find((item) => item.value === gender).label;
};

export const getUserAllowedNewsletterLabel = (allowedNewsletter: boolean) => {
  return NEWS_LETTER_OPTIONS.find((item) => item.value === allowedNewsletter).label;
};

export const getIncludedProvinceAddress = (user: User) => {
  if (!user?.province && !user?.address) {
    return null;
  }
  return `${getProvinceName(user?.province)}${user?.address}`;
};

export const getProvinceName = (value: string) => {
  return PROVINCE_OPTIONS.find((item) => item.value === value)?.label;
};

export const checkIsLineUser = (user: User) => {
  return !user.password;
};

export const isSuperAdminOrAdmin = (user: User) => {
  return [ROLE.SUPER_ADMIN, ROLE.ADMIN].includes(user?.role);
};

export const isSuperAdmin = (user: User) => {
  return user?.role === ROLE.SUPER_ADMIN;
};

export const isAdmin = (user: User | Staff) => {
  return user?.role === ROLE.ADMIN;
};

export const isStaff = (user: User | Staff) => {
  return user?.role === ROLE.STAFF;
};

export const getStaffRoleLabel = (staffRole: Role) => {
  const options = {
    [ROLE.STAFF]: "従業員",
    [ROLE.ADMIN]: "管理者",
  };

  return options[staffRole];
};
