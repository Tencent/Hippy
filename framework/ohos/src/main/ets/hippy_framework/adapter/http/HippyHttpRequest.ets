/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { HttpHeaderRequest } from './HippyHttpHeader';
import { TextUtils } from '../../../support/utils/TextUtils';
import I18n from '@ohos.i18n';
import { util } from '@kit.ArkTS';
import { http } from '@kit.NetworkKit';
import Url from '@ohos.url';
import { LogUtils } from '../../../support/utils/LogUtils';
import { HippyAny, HippyArray } from '../../../support/common/HippyTypes';


const HIPPY_HTTP_REQUEST_TAG = "HippyHttpRequest"

export class HippyHttpRequest {
  public static DEFAULT_TIMEOUT_MS: number = 3000;
  public static HTTP_HEADERS: string = "headers";
  public static HTTP_HEADERS_SEPARATOR: string = ",";
  public static HTTP_URL: string = "url";
  public static HTTP_METHOD: string = "method";
  public static HTTP_REDIRECT: string = "redirect";
  public static HTTP_BODY: string = "body";
  private static USER_AGENT = "";
  private mConnectTimeout: number = HippyHttpRequest.DEFAULT_TIMEOUT_MS;
  private mReadTimeout: number = HippyHttpRequest.DEFAULT_TIMEOUT_MS;
  private mUseCaches: boolean = true;
  private mRedirectTimes: number = 0
  private mUrl: string = ""
  private mHeaders: Map<string, string>
  private mMethod: http.RequestMethod = http.RequestMethod.GET
  private mBody: string
  private mNativeParams: Map<string, Object>
  private mRequestParams: Map<string, HippyAny>

  constructor(headers: Map<string, string | Array<string>>,
              requestParams: Map<string, HippyAny>,
              nativeParams: Map<string, Object>) {
    this.mHeaders = new Map<string, string>()
    if (headers !== null) {
      // adjust requestHeader for ohos
      headers.forEach((value: string | Array<string>, key: string) => {
        this.mHeaders.set(key, value.toString());
      })
    }
    this.mRequestParams = requestParams;
    this.mBody = requestParams.get(HippyHttpRequest.HTTP_BODY) as string;
    this.mNativeParams = nativeParams;
    const method = requestParams.get(HippyHttpRequest.HTTP_METHOD) as string;
    this.setMethod(method);
    this.initUserAgent();
  }

  public getRequestCookies(): string | undefined {
    if (this.mHeaders != null) {
      return this.mHeaders.get(HttpHeaderRequest.COOKIE);
    }
    return undefined
  }

  public getNativeParams(): Map<string, Object> {
    return this.mNativeParams;
  }

  public setUrl(url: string): void {
    this.mUrl = url;
  }

  public getUrl(): string | null | undefined {
    if (this.mUrl != null) {
      return this.mUrl;
    }
    return (this.mRequestParams != null) ? this.mRequestParams.get(HippyHttpRequest.HTTP_URL) as string : null;
  }

  public addHeader(name: string, value: string) {
    this.mHeaders.set(name, value);
  }

  public getAndIncrementRedirectTimes(): number {
    return this.mRedirectTimes++;
  }

  public getHeaders(): Map<string, string> {
    return this.mHeaders;
  }

  public getConnectTimeout(): number {
    return this.mConnectTimeout;
  }

  public setConnectTimeout(time: number) {
    this.mConnectTimeout = time;
  }

  public getReadTimeout(): number {
    return this.mReadTimeout;
  }

  public setReadTimeout(time: number) {
    this.mReadTimeout = time;
  }

  public isUseCaches(): boolean {
    return this.mUseCaches;
  }

  public setUseCaches(useCaches: boolean) {
    this.mUseCaches = useCaches;
  }

  public setMethod(method: string) {
    switch (method) {
      case 'GET':
        this.mMethod = http.RequestMethod.GET;
        break
      case 'HEAD':
        this.mMethod = http.RequestMethod.HEAD;
        break
      case 'OPTIONS':
        this.mMethod = http.RequestMethod.OPTIONS;
        break
      case 'TRACE':
        this.mMethod = http.RequestMethod.TRACE;
        break
      case 'DELETE':
        this.mMethod = http.RequestMethod.DELETE;
        break
      case 'POST':
        this.mMethod = http.RequestMethod.POST;
        break
      case 'PUT':
        this.mMethod = http.RequestMethod.PUT;
        break
      case 'CONNECT':
        this.mMethod = http.RequestMethod.CONNECT;
        break
      default:
        this.mMethod = http.RequestMethod.GET;
        break
    }
  }

  public getMethod(): http.RequestMethod {
    return this.mMethod;
  }

  public isInstanceFollowRedirects(): boolean {
    let redirect = (this.mRequestParams != null) ? this.mRequestParams.get(HippyHttpRequest.HTTP_REDIRECT) as string : null;
    return!TextUtils.isEmpty(redirect) && TextUtils.equals("follow", redirect);
  }

  public getBody(): string | Object | ArrayBuffer {
    if (this.mBody == null) return ""
    try {
      let jsonObject: Record<string, Object> = JSON.parse(this.mBody);
      let contentType = this.mHeaders.get('content-type')
      if (!contentType) {
        contentType = this.mHeaders.get('Content-Type') || ''
      }
      LogUtils.d(HIPPY_HTTP_REQUEST_TAG, JSON.stringify(jsonObject));
      if (contentType.indexOf('/json') > 0) {
        return jsonObject;
      } else {
        let result = new Url.URLParams();
        Object.keys(jsonObject).forEach((k) => {
          let v = encodeURIComponent(jsonObject[k] as string | number | boolean);
          result.append(k, v);
        });
        return result.toString();
      }
    } catch (e) {
      LogUtils.e(HIPPY_HTTP_REQUEST_TAG, 'http body parse error: ' + this.mBody);
      return this.mBody;
    }
  }

  private initUserAgent(): void {
    if (HippyHttpRequest.USER_AGENT == null) {
      try {
        let language = I18n.System.getSystemLanguage();
        let country = I18n.System.getSystemRegion(); // 获取系统当前地区设置

        // Add version
        let buffer = ""
        // let version: string = BuildProfile.VERSION_NAME
        let version: string = ""
        if (version.length > 0) {
          buffer += version + "; "
        } else { // default to "1.0"
          buffer += "1.0; "
        }
        buffer += language.toLowerCase()
        buffer += "-"
        buffer += country.toLowerCase()
        let base = "Mozilla/5.0 (Linux; U; Android %s) AppleWebKit/533.1 (KHTML, like Gecko) Mobile Safari/533.1";
        HippyHttpRequest.USER_AGENT = util.format(base, buffer);
      } catch (error) {
        LogUtils.e(HIPPY_HTTP_REQUEST_TAG, `call System.isSuggested failed, error code: ${error.code}, message: ${error.message}.`);
      }
    }

    this.addHeader(HttpHeaderRequest.USER_AGENT, HippyHttpRequest.USER_AGENT);
  }
}
