import axios from "axios";
import { TicketType } from "@prisma/client";

import { serverConfig } from "config";
import { GMO_PAYMENT_METHOD } from "constants/booking";
import { parseGMOResponse } from "utils/gmo";
import { getGMOAccountByTenant } from "utils/server/gmo";

const APIS = {
  REGISTER_TRANSACTION: "/payment/EntryTran.idPass",
  EXECUTE_TRANSACTION: "/payment/ExecTran.idPass",
  SEARCH_TRANSACTION: "/payment/SearchTrade.idPass",
  CHANGE_TRANSACTION_AMOUNT: "/payment/ChangeTran.idPass",
  CANCEL_TRANSACTION: "/payment/AlterTran.idPass",

  SEARCH_CARD: "/payment/SearchCard.idPass",
  SAVE_CARD: "/payment/SaveCard.idPass",
  DELETE_CARD: "/payment/DeleteCard.idPass",

  SEARCH_MEMBER: "/payment/SearchMember.idPass",
  SAVE_MEMBER: "/payment/SaveMember.idPass",

  EXECUTE_3DS_AUTHENTICATION: "/payment/Tds2Auth.idPass",
  EXECUTE_3DS_AUTHENTICATION_RESULT: "/payment/Tds2Result.idPass",
  EXECUTE_SECURE_TRANSACTION: "/payment/SecureTran2.idPass",
};

const REQUEST_CONFIG = {
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
};

export type TransactionInfo = {
  AccessID: string;
  AccessPass: string;
  TranID?: string;
  ProcessDate?: string;
  CardNo?: string;
  Expire?: string;
};

export const registerTransaction = async (bookingId: number, totalAmount: number, tenantCode: string) => {
  const { shop_id, shop_pass } = await getGMOAccountByTenant(tenantCode);
  const registerTransactionUrl = serverConfig.gmo.api_url + APIS.REGISTER_TRANSACTION;

  const params = new URLSearchParams();
  params.append("ShopID", shop_id);
  params.append("ShopPass", shop_pass);
  params.append("OrderID", "" + bookingId);
  params.append("JobCd", "CAPTURE");
  params.append("Amount", "" + totalAmount);
  params.append("TdFlag", "2");
  params.append("Tds2Type", "3");
  params.append("TdRequired", "0");

  const response = await axios.post(registerTransactionUrl, params, REQUEST_CONFIG);
  return response.data;
};

export const executeTransaction = async (
  transactionInfo: TransactionInfo,
  tenantCode: string,
  ticketType: TicketType,
  bookingId: number,
  memberId: number,
  cardSeq: string
) => {
  const url = serverConfig.external.url;

  const executeTransactionUrl = `${serverConfig.gmo.api_url}${APIS.EXECUTE_TRANSACTION}`;

  const params = new URLSearchParams();
  params.append("AccessID", transactionInfo.AccessID);
  params.append("AccessPass", transactionInfo.AccessPass);
  params.append("OrderID", "" + bookingId);
  params.append("Method", GMO_PAYMENT_METHOD.BULK);
  params.append("SiteID", serverConfig.gmo.site_id);
  params.append("SitePass", serverConfig.gmo.site_pass);
  params.append("MemberID", "" + memberId);
  params.append("CardSeq", cardSeq);
  params.append("ClientField1", tenantCode);
  params.append("RetUrl", `${url}/api/gmo/callback?` +
    `accessId=${transactionInfo.AccessID}&accessPass=${transactionInfo.AccessPass}&bookingId=${bookingId}&tenantCode=${tenantCode}&ticketType=${ticketType}`);
  params.append("CallbackType", "2");

  const response = await axios.post(executeTransactionUrl, params, REQUEST_CONFIG);
  return response.data;
};

export const searchTransaction = async (bookingId: number, tenantCode: string) => {
  const { shop_id, shop_pass } = await getGMOAccountByTenant(tenantCode);
  const searchTransactionUrl = serverConfig.gmo.api_url + APIS.SEARCH_TRANSACTION;

  const params = new URLSearchParams();
  params.append("ShopID", shop_id);
  params.append("ShopPass", shop_pass);
  params.append("OrderID", "" + bookingId);

  const response = await axios.post(searchTransactionUrl, params, REQUEST_CONFIG);
  return response.data;
};

export const changeTransactionAmount = async (transactionInfo: TransactionInfo, amount: number, tenantCode: string) => {
  const { shop_id, shop_pass } = await getGMOAccountByTenant(tenantCode);
  const changeTransactionAmountUrl = serverConfig.gmo.api_url + APIS.CHANGE_TRANSACTION_AMOUNT;

  const params = new URLSearchParams();
  params.append("ShopID", shop_id);
  params.append("ShopPass", shop_pass);
  params.append("AccessID", transactionInfo.AccessID);
  params.append("AccessPass", transactionInfo.AccessPass);
  params.append("JobCd", "CAPTURE");
  params.append("Amount", "" + amount);

  const response = await axios.post(changeTransactionAmountUrl, params, REQUEST_CONFIG);
  return response.data;
};

export const cancelTransaction = async (transactionInfo: TransactionInfo, tenantCode: string) => {
  const { shop_id, shop_pass } = await getGMOAccountByTenant(tenantCode);
  const cancelTransactionUrl = serverConfig.gmo.api_url + APIS.CANCEL_TRANSACTION;

  const params = new URLSearchParams();
  params.append("ShopID", shop_id);
  params.append("ShopPass", shop_pass);
  params.append("AccessID", transactionInfo.AccessID);
  params.append("AccessPass", transactionInfo.AccessPass);
  params.append("JobCd", "CANCEL");

  const response = await axios.post(cancelTransactionUrl, params, REQUEST_CONFIG);
  return response.data;
};

export const saveCard = async (memberId: number, token: string, cardSeq: string) => {
  const url = serverConfig.gmo.api_url + APIS.SAVE_CARD;

  const params = new URLSearchParams();
  params.append("SiteID", serverConfig.gmo.site_id);
  params.append("SitePass", serverConfig.gmo.site_pass);
  params.append("MemberID", "" + memberId);
  params.append("Token", token);
  cardSeq && params.append("CardSeq", cardSeq);

  const response = await axios.post(url, params, REQUEST_CONFIG);
  return response.data;
};

export const searchCard = async (memberId: number) => {
  const url = serverConfig.gmo.api_url + APIS.SEARCH_CARD;

  const params = new URLSearchParams();
  params.append("SiteID", serverConfig.gmo.site_id);
  params.append("SitePass", serverConfig.gmo.site_pass);
  params.append("MemberID", "" + memberId);

  const response = await axios.post(url, params, REQUEST_CONFIG);
  return response.data;
};

export const deleteCard = async (memberId: number, cardSeq: number) => {
  const url = serverConfig.gmo.api_url + APIS.DELETE_CARD;

  const params = new URLSearchParams();
  params.append("SiteID", serverConfig.gmo.site_id);
  params.append("SitePass", serverConfig.gmo.site_pass);
  params.append("MemberID", "" + memberId);
  params.append("CardSeq", "" + cardSeq);

  const response = await axios.post(url, params, REQUEST_CONFIG);
  return response.data;
};

export const saveMember = async (memberId: number) => {
  const url = serverConfig.gmo.api_url + APIS.SAVE_MEMBER;

  const params = new URLSearchParams();
  params.append("SiteID", serverConfig.gmo.site_id);
  params.append("SitePass", serverConfig.gmo.site_pass);
  params.append("MemberID", "" + memberId);

  const response = await axios.post(url, params, REQUEST_CONFIG);
  return response.data;
};

export const searchMember = async (memberId: number) => {
  const url = serverConfig.gmo.api_url + APIS.SEARCH_MEMBER;

  const params = new URLSearchParams();
  params.append("SiteID", serverConfig.gmo.site_id);
  params.append("SitePass", serverConfig.gmo.site_pass);
  params.append("MemberID", "" + memberId);

  const response = await axios.post(url, params, REQUEST_CONFIG);
  return parseGMOResponse(response.data);
};

export const execute3DSAuthentication = async (accessId: string, accessPass: string, param: string) => {
  const url = serverConfig.gmo.api_url + APIS.EXECUTE_3DS_AUTHENTICATION;

  const params = new URLSearchParams();
  params.append("AccessID", accessId);
  params.append("AccessPass", accessPass);
  params.append("Tds2Param", param);

  const response = await axios.post(url, params, REQUEST_CONFIG);
  return parseGMOResponse(response.data);
};

export const get3DSAuthenticationResult = async (accessId: string, accessPass: string) => {
  const url = serverConfig.gmo.api_url + APIS.EXECUTE_3DS_AUTHENTICATION_RESULT;

  const params = new URLSearchParams();
  params.append("AccessID", accessId);
  params.append("AccessPass", accessPass);

  const response = await axios.post(url, params, REQUEST_CONFIG);
  return parseGMOResponse(response.data);
};

export const executeSecureTransaction = async (accessId: string, accessPass: string) => {
  const url = serverConfig.gmo.api_url + APIS.EXECUTE_SECURE_TRANSACTION;

  const params = new URLSearchParams();
  params.append("AccessID", accessId);
  params.append("AccessPass", accessPass);

  const response = await axios.post(url, params, REQUEST_CONFIG);
  return parseGMOResponse(response.data);
};
