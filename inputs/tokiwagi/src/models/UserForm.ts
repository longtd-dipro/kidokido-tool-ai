export type UserForm = {
  lastName: string;
  firstName: string;
  lastNameFurigana: string;
  firstNameFurigana: string;
  email: string;
  confirmationEmail: string;
  password: string;
  confirmationPassword: string;
  phone: number;
  postCode: number;
  province: string;
  address: string;
  gender?: boolean;
  birthday?: Date;
  allowedNewsletter?: boolean;
  agreePrivacy: boolean;
};
