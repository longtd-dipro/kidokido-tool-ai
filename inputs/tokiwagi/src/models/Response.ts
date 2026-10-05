export interface IResponse<T = any> {
  error?: string | null;
  data?: T;
}

export interface POSResponse {
  resultCode?: string;
  error?: string | null;
  [key: string]: any;
}
