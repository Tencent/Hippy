export interface HttpRequestParams {
  method: string;
  data?: Record<string, any>;
  headers: Record<string, string>;
  url: string;
}

// Request相关类型

export interface NativeRequestBaseResponse {
  success: boolean;
  code: number;
}

export interface NativeRequestSuccess extends NativeRequestBaseResponse {
  type: 'SUCCESS';
  data: {
    // 整个请求是否成功
    code: number;
    result: {
      code: number;
      data: any;
    }[];
  };
}

export interface NativeRequestError extends NativeRequestBaseResponse {
  type: 'ERROR';
  errorText: string;
}

export type NativeRequestResponse = NativeRequestSuccess | NativeRequestError;

export interface Http {
  request: (
    params: HttpRequestParams,
    callback: (res: NativeRequestResponse) => void,
  ) => void;
}
