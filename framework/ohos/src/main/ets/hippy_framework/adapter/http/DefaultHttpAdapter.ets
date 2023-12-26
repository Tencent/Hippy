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
import { HippyHttpAdapter, HttpTaskCallback } from './HippyHttpAdapter';
import { HippyHttpRequest } from './HippyHttpRequest';
import { HttpHeaderRequest } from './HippyHttpHeader';
import List from '@ohos.util.List';
import web_webview from '@ohos.web.webview';
import { TextUtils } from '../../../support/utils/TextUtils';
import { ProcessorCallback } from '../../../vfs/ProcessorCallback';
import { HttpTaskCallbackImpl } from './HttpTaskCallbackImpl';
import { ResourceDataHolder } from '../../../vfs/ResourceDataHolder';
import { HippyException } from '../../../support/common/HippyException';
import { LogUtils } from '../../../support/utils/LogUtils';
import { HippyHttpResponse } from './HippyHttpResponse';
import { http } from '@kit.NetworkKit';
import { HippyJsException } from '../../common/HippyJsException';
import { HippyModulePromise } from '../../modules/HippyModulePromise';
import { ArgumentUtils } from '../../../support/utils/ArgumentUtils';

const DEFAULT_HTTP_ADAPTER_TAG = 'DefaultHttpAdapter'

export class DefaultHttpAdapter implements HippyHttpAdapter {

  public fetch(holder: ResourceDataHolder, nativeParams: Map<string, Object>, callback: ProcessorCallback) {
    holder.processorTag = DefaultHttpAdapter.name
    let httpRequest = this.generateHttpRequest(holder, nativeParams);
    this.handleRequestCookie(httpRequest);
    this.sendRequest(httpRequest, new HttpTaskCallbackImpl(holder, callback))
  }

  public handleRedirectRequest(request: HippyHttpRequest,
                               callback: HttpTaskCallback) {
    if (request.getAndIncrementRedirectTimes() > 2) {
      callback.onTaskFailed(request, new HippyException("Redirect more than 3 times!"));
    } else {
      this.sendRequest(request, callback);
    }
  }

  public sendRequest(request: HippyHttpRequest, callback: HttpTaskCallback) {
    try {
      let httpRequest = http.createHttp();
      const header = ArgumentUtils.mapToRecord(request.getHeaders())
      httpRequest.request(request.getUrl(),
        {
          method: request.getMethod(),
          header: header,
          extraData: request.getBody(),
          readTimeout: request.getReadTimeout(),
          connectTimeout: request.getConnectTimeout()
        }, (err, data) => {
          if (!err) {
            if (data.responseCode === 302) {
              this.handleRedirectRequest(request, callback);
            } else {
              callback.onTaskSuccess(request, this.createResponse(data));
            }
            LogUtils.i(DEFAULT_HTTP_ADAPTER_TAG, 'Result:' + data.result);
            LogUtils.i(DEFAULT_HTTP_ADAPTER_TAG, 'code:' + data.responseCode);
            LogUtils.i(DEFAULT_HTTP_ADAPTER_TAG, 'header:' + JSON.stringify(data.header));
            LogUtils.i(DEFAULT_HTTP_ADAPTER_TAG, 'cookies:' + data.cookies); // 8+
            LogUtils.i(DEFAULT_HTTP_ADAPTER_TAG, 'header.Content-Type:' + data.header['Content-Type']);
            LogUtils.i(DEFAULT_HTTP_ADAPTER_TAG, 'header.Status-Line:' + data.header['Status-Line']);
          } else {
            LogUtils.i(DEFAULT_HTTP_ADAPTER_TAG, 'error:' + JSON.stringify(err));
          }
        });
    } catch (e) {
      LogUtils.i(DEFAULT_HTTP_ADAPTER_TAG, 'error:' + e);
    }
  }

  public createResponse(res: http.HttpResponse): HippyHttpResponse {
    let response = new HippyHttpResponse();
    response.setStatusCode(res.responseCode);
    response.setRspHeaderMap(res.header);
    response.result = res.result.toString();
    return response;
  }

  public async handleRequestCookie(httpRequest: HippyHttpRequest) {
    let url = httpRequest.getUrl();
    if (url != null) {
      let cookies = httpRequest.getRequestCookies();
      if (cookies == undefined) {
        return
      }
      this.saveCookieToManager(url, cookies, "");
      if (this.getCookieManager()) {
        let cookie = web_webview.WebCookieManager.fetchCookieSync(url);
        if (!TextUtils.isEmpty(await cookie)) {
          httpRequest.addHeader(HttpHeaderRequest.COOKIE, await cookie);
        }
      }
    }
  }

  public getCookie(url: string, promise: HippyModulePromise) {
    try {
      web_webview.WebCookieManager.fetchCookie(url)
        .then((res) => {
          LogUtils.d(DEFAULT_HTTP_ADAPTER_TAG, "saveCookieAsyncCallback success!");
          promise.resolve(res);
          return res
        })
        .catch((err: HippyJsException) => {
          LogUtils.e(DEFAULT_HTTP_ADAPTER_TAG, "error: " + err.message);
          promise.reject(err.message)
        })
    } catch (error) {
      LogUtils.e(DEFAULT_HTTP_ADAPTER_TAG, `ErrorCode: ${error.code}` + `;  Message: ${error.message}`);
      promise.reject(error.message)
    }
  }

  public setCookie(url: string, keyValue: string, expires: string) {
    if (!TextUtils.isEmpty(url) && keyValue != null) {
      if (keyValue.trim().length == 0) {
        this.clearCookie(url);
      } else {
        this.saveCookieToManager(url, keyValue, expires);
      }
    }
  }

  protected generateHttpRequest(holder: ResourceDataHolder, nativeParams: Map<string, Object>): HippyHttpRequest {
    if (holder.requestHeaders == null || holder.requestHeaders == undefined)
      holder.requestHeaders = new Map<string, string>()
    if (holder.requestParams == null || holder.requestParams == undefined)
      holder.requestParams = new Map<string, string>()
    let httpRequest: HippyHttpRequest = new HippyHttpRequest(holder.requestHeaders, holder.requestParams, nativeParams);
    httpRequest.setUrl(holder.uri);
    return httpRequest;
  }

  protected saveCookie2Manager(url: string, cookies: List<String>) {
    for (let i = 0; i < cookies.length; i++) {
      let cookie: String = cookies.get(i);
      this.saveCookieToManager(url, cookie, "");
    }
  }

  protected saveCookieToManager(url: string, cookies: String, expires: string) {
    if (cookies == null) {
      return;
    }
    cookies = cookies.replace("\\s+", "");
    let cookieItems: string[] = cookies.split(";");
    cookieItems.forEach((cookie) => {
      if (cookie != null && cookie.trim().length > 0) {
        let newCookie: string = this.resetCookieIfNeeded(cookie, expires);
        web_webview.WebCookieManager.configCookieSync(url, newCookie)
      }
    })
  }

  protected getCookieManager(): web_webview.WebCookieManager {
    let cookieManager: web_webview.WebCookieManager | undefined
    if (cookieManager == undefined) {
      cookieManager = new web_webview.WebCookieManager()
    }
    try {
      if (!web_webview.WebCookieManager.isCookieAllowed()) {
        web_webview.WebCookieManager.putAcceptCookieEnabled(true);
      }
      return web_webview.WebCookieManager
    } catch (err) {
      LogUtils.e(DEFAULT_HTTP_ADAPTER_TAG, "getCookieManager: " + err.getMessage());
      // https://bugs.chromium.org/p/chromium/issues/detail?id=559720
      return false
    }
  }

  protected resetCookieIfNeeded(cookie: string, expires: string): string {
    let kv: String[] = cookie.split("=");
    if (kv.length == 1 || (kv.length >= 2 && kv[1].trim().length == 0)) {
      return kv[0] + "=;Max-Age=0";
    }
    if (!TextUtils.isEmpty(expires)) {
      return cookie + ";expires=" + expires;
    }
    return cookie;
  }

  protected clearCookie(url: string) {
    if (!web_webview.WebCookieManager.existCookie()) {
      return;
    }
    let cookies: string = web_webview.WebCookieManager.fetchCookieSync(url);
    if (TextUtils.isEmpty(cookies)) {
      return;
    }
    let cookieItems: String[] = cookies.split(";");
    cookieItems.forEach((cookie) => {
      web_webview.WebCookieManager.configCookieSync(url, (cookie + ";Max-Age=0"))
    })
  }

}
