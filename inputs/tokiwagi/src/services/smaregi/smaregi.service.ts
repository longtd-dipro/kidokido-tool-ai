import axios, { Method } from "axios";

import { serverConfig } from "config";
import { formatJpTz } from "utils/date-time";
import logger from "utils/logger";

import {
  SMAREGI_API,
  SMAREGI_CATEGORIES_LIST_LIMIT,
  SMAREGI_CONFIRMED,
  SMAREGI_GRANT_TYPE,
  SMAREGI_PLAY_AREA_CATEGORY,
  SMAREGI_PREPAID_PAYMENT_METHOD,
  SMAREGI_QUERY,
  SMAREGI_TEMPORARY,
  SMAREGI_TEMPORARY_TERMINAL_ID,
  SMAREGI_TOKEN_TYPE,
  SmaregiWith,
  SmaregiWithDetail,
  TOKEN_EXPIRY_SAFETY_MS,
} from "./smaregi.const";
import {
  SmaregiCategory,
  SmaregiConfirmedInput,
  SmaregiPaymentMethod,
  SmaregiTemporaryInput,
  SmaregiTransaction,
  TokenCache,
  TransactionWithFlags,
} from "./smaregi.types";

/**
 * Smaregi Platform API client.
 *
 * The `contractId` is resolved per-tenant from `tenants.smaregi_contract_id` and passed in by every
 * caller. Auth is OAuth client-credentials against `${idBaseUrl}/app/${contractId}/token`
 * (HTTP Basic clientId:clientSecret), returning a short-lived Bearer token that we cache in-memory,
 * keyed by contract id, until shortly before it expires.
 *
 * The POS API base (`serverConfig.smaregi.apiBaseUrl`) is a template containing a `{contractId}`
 * placeholder + `/pos`, e.g. https://api.smaregi.dev/{contractId}/pos — the placeholder is replaced
 * with the tenant's contract id and endpoints are appended as `/stores`, `/products`…
 */

// One cached Bearer token per contract id.
const tokenCacheByContract = new Map<string, TokenCache>();

// One cached "prepaid" payment method id per contract id (resolved by `resolvePrepaidPaymentMethodId`).
const prepaidPaymentMethodCacheByContract = new Map<string, string>();

// One cached "あそび場" category id per contract id (resolved by `resolvePlayAreaCategoryId`).
const playAreaCategoryCacheByContract = new Map<string, string>();

/** Build the tenant-specific POS API base by substituting `{contractId}` into the configured template. */
const buildApiBaseUrl = (contractId: string): string =>
  String(serverConfig.smaregi.apiBaseUrl ?? "").replace("{contractId}", contractId);

export const getAccessToken = async (contractId: string): Promise<string> => {
  const now = Date.now();
  const cached = tokenCacheByContract.get(contractId);
  if (cached && cached.expiresAt - TOKEN_EXPIRY_SAFETY_MS > now) {
    return cached.accessToken;
  }

  const { idBaseUrl, clientId, clientSecret, scopes } = serverConfig.smaregi;
  const tokenUrl = `${idBaseUrl}/app/${contractId}/token`;

  const params = new URLSearchParams();
  params.append("grant_type", SMAREGI_GRANT_TYPE);
  if (scopes) {
    params.append("scope", scopes);
  }

  const response = await axios.post(tokenUrl, params, {
    auth: { username: clientId, password: clientSecret },
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  const accessToken = response.data?.access_token;
  const expiresInSec = Number(response.data?.expires_in ?? 3600);
  tokenCacheByContract.set(contractId, { accessToken, expiresAt: now + expiresInSec * 1000 });

  return accessToken;
};

const requestSmaregi = async <T = any>(
  contractId: string,
  method: Method,
  path: string,
  options: { params?: Record<string, any>; data?: any } = {}
): Promise<T> => {
  const url = `${buildApiBaseUrl(contractId)}${path}`;

  if (serverConfig.env !== "prod") {
    logger.info(`[smaregi] contract_id: ${contractId}, url: ${url}, method: ${method}, options: ${JSON.stringify(options)}`);
  }

  const token = await getAccessToken(contractId);
  const response = await axios.request<T>({
    method,
    url,
    params: options.params,
    data: options.data,
    headers: {
      Authorization: `${SMAREGI_TOKEN_TYPE} ${token}`,
      "Content-Type": "application/json",
    },
  });

  return response.data;
};

/* ───────────────────────── Temporary sales (仮販売) ───────────────────────── */

/**
 * Create a 仮販売 (temporary sale) holding the whole booking as one recallable order. Returns the
 * created record incl. `transactionHeadId` and the system-generated `barcode` the POS scans to recall.
 * terminalId is a fixed constant for this flow (the API requires it; not configurable in DB/env for now).
 */
export const createTemporaryTransaction = async (contractId: string, payload: SmaregiTemporaryInput) => {
  return requestSmaregi(contractId, "POST", SMAREGI_API.TRANSACTIONS_TEMPORARIES, {
    data: {
      transactionHeadDivision: SMAREGI_TEMPORARY.TRANSACTION_HEAD_DIVISION,
      status: SMAREGI_TEMPORARY.STATUS,
      terminalId: SMAREGI_TEMPORARY_TERMINAL_ID,
      ...payload,
    },
  });
};

/** Delete a not-yet-settled 仮販売 (rollback when the checkout transaction aborts). */
export const deleteTemporaryTransaction = async (contractId: string, id: string) => {
  return requestSmaregi(contractId, "DELETE", SMAREGI_API.temporaryTransaction(id));
};

export const changeTemporaryTransactionStatus = async (contractId: string, id: string, status: string) => {
  return requestSmaregi(contractId, "PATCH", SMAREGI_API.temporaryTransactionStatus(id), { data: { status } });
};

/* ───────────────────────── Confirmed sales (確定販売) ───────────────────────── */

/**
 * Create a confirmed (already-settled) sale for revenue collected outside the register — e.g. ticket
 * price paid online via GMO at booking time. Unlike `createTemporaryTransaction`, this posts a final
 * transaction directly; there is no later register recall/settlement step.
 * terminalId is the tenant's configured Smaregi Device ID (`tenant.smaregiTerminalId`).
 */
export const createTransaction = async (contractId: string, terminalId: string, payload: SmaregiConfirmedInput) => {
  return requestSmaregi(contractId, "POST", SMAREGI_API.TRANSACTIONS, {
    data: {
      transactionHeadDivision: SMAREGI_CONFIRMED.TRANSACTION_HEAD_DIVISION,
      terminalId,
      ...payload,
    },
  });
};

/* ───────────────────────── Transactions ───────────────────────── */

export const getTransaction = async (
  contractId: string,
  transactionId: string,
  flags: TransactionWithFlags = {}
): Promise<SmaregiTransaction> => {
  return requestSmaregi<SmaregiTransaction>(contractId, "GET", SMAREGI_API.transaction(transactionId), {
    params: {
      [SMAREGI_QUERY.WITH_DETAILS]: flags.with_details ?? SmaregiWithDetail.All,
      [SMAREGI_QUERY.WITH_PAYMENTS]: flags.with_payments ?? SmaregiWith.All,
      [SMAREGI_QUERY.WITH_COUPONS]: flags.with_coupons ?? SmaregiWith.All,
      [SMAREGI_QUERY.WITH_DISCOUNTS]: flags.with_discounts ?? SmaregiWith.All,
    },
  });
};

export const listTransactions = async (contractId: string, params: Record<string, any>) => {
  return requestSmaregi<any[]>(contractId, "GET", SMAREGI_API.TRANSACTIONS, { params });
};

/**
 * Cancel a confirmed transaction. `cancelDateTime` must be sent (current time, JST) — without it,
 * Smaregi resolves the cancel request's idempotency key without a distinguishing timestamp and
 * rejects it as a duplicate of an already-processed cancel for the same store/terminal/transaction key
 * ("同一キーの取引データが取消済みの為、取消できません").
 */
export const cancelTransaction = async (contractId: string, transactionId: string) => {
  return requestSmaregi(contractId, "POST", SMAREGI_API.transactionCancel(transactionId), {
    data: { cancelDateTime: formatJpTz(new Date()) },
  });
};

/* ───────────────────────── Payment methods ───────────────────────── */

export const getPaymentMethods = async (contractId: string, params: Record<string, any>) => {
  return requestSmaregi<SmaregiPaymentMethod[]>(contractId, "GET", SMAREGI_API.PAYMENT_METHODS, { params });
};

export const createPaymentMethod = async (contractId: string, payload: { paymentMethodName: string; paymentMethodCode?: string }) => {
  return requestSmaregi<SmaregiPaymentMethod>(contractId, "POST", SMAREGI_API.PAYMENT_METHODS, { data: payload });
};

/**
 * Resolve the `paymentMethodId` of the "prepaid" (事前決済) payment method on a tenant's Smaregi
 * contract, creating it if it doesn't exist yet. Cached in-memory per contract id (same pattern as
 * `getAccessToken`'s token cache) so a confirmed-sale checkout only pays the lookup cost once per
 * contract per process lifetime.
 */
export const resolvePrepaidPaymentMethodId = async (contractId: string): Promise<string> => {
  const cached = prepaidPaymentMethodCacheByContract.get(contractId);
  if (cached) return cached;

  const existing = await getPaymentMethods(contractId, { [SMAREGI_QUERY.PAYMENT_METHOD_CODE]: SMAREGI_PREPAID_PAYMENT_METHOD.CODE });
  let paymentMethodId = existing?.[0]?.paymentMethodId;

  if (!paymentMethodId) {
    const created = await createPaymentMethod(contractId, {
      paymentMethodName: SMAREGI_PREPAID_PAYMENT_METHOD.NAME,
      paymentMethodCode: SMAREGI_PREPAID_PAYMENT_METHOD.CODE,
    });
    paymentMethodId = created?.paymentMethodId;
  }

  if (!paymentMethodId) {
    throw new Error(`[smaregi] could not resolve prepaid payment method id for contract ${contractId}`);
  }

  prepaidPaymentMethodCacheByContract.set(contractId, paymentMethodId);
  return paymentMethodId;
};

/* ───────────────────────── Categories ───────────────────────── */

export const getCategories = async (contractId: string, params: Record<string, any> = {}) => {
  return requestSmaregi<SmaregiCategory[]>(contractId, "GET", SMAREGI_API.CATEGORIES, { params });
};

export const createCategory = async (contractId: string, payload: { categoryName: string }) => {
  return requestSmaregi<SmaregiCategory>(contractId, "POST", SMAREGI_API.CATEGORIES, { data: payload });
};

/**
 * Resolve the `categoryId` of the "あそび場" Category (部門) on a tenant's Smaregi contract, creating it
 * if it doesn't exist yet. `GET /categories` has no name filter, so this lists categories and filters
 * by `categoryName` client-side. Cached in-memory per contract id (same pattern as
 * `resolvePrepaidPaymentMethodId`) so the lookup only pays its cost once per contract per process
 * lifetime.
 */
export const resolvePlayAreaCategoryId = async (contractId: string): Promise<string> => {
  const cached = playAreaCategoryCacheByContract.get(contractId);
  if (cached) return cached;

  const existing = await getCategories(contractId, { [SMAREGI_QUERY.LIMIT]: SMAREGI_CATEGORIES_LIST_LIMIT });
  let categoryId = existing?.find((category) => category.categoryName === SMAREGI_PLAY_AREA_CATEGORY.NAME)?.categoryId;

  if (!categoryId) {
    const created = await createCategory(contractId, { categoryName: SMAREGI_PLAY_AREA_CATEGORY.NAME });
    categoryId = created?.categoryId;
  }

  if (!categoryId) {
    throw new Error(`[smaregi] could not resolve play area category id for contract ${contractId}`);
  }

  playAreaCategoryCacheByContract.set(contractId, categoryId);
  return categoryId;
};
