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

import { HippyWebModule } from '../base';
import { HippyCallBack } from '../types';

interface NetResponse {
  statusCode: number, statusLine: string, respBody: string, respHeaders: any
}
export class NetworkModule extends HippyWebModule {
  public name = 'network';

  public fetch(data: any, callBack: HippyCallBack) {
    if (!data) {
      callBack.reject('invalid request param');
    }
    const { url } = data;
    const { method } = data;
    if (!url || !method) {
      callBack.reject('no valid url for request');
    }
    const { redirect, body, headers } = data;
    const requestOption: any = {
      redirect,
      headers,
      method,
    };
    if (method.toLowerCase() !== 'get') {
      requestOption.body = body;
    }
    global.__fetch(url, requestOption).then(async (response) => {
      if (response) {
        const dataString = await response.text();
        const respHeaders: any = {};
        for (const key of response.headers.keys()) {
          respHeaders[key] = response.headers.get(key);
        }
        const data: NetResponse = {
          statusCode: response.status,
          statusLine: response.statusText,
          respBody: dataString,
          respHeaders,
        };
        data.statusCode = response.status;

        callBack.resolve(data);
        return;
      }
      callBack.resolve('response null');
    }, (errorMsg) => {
      callBack.reject(errorMsg.toString());
    })
      .catch((error) => {
        callBack.reject(error.toString());
      });
  }

  public setCookie(callBack: HippyCallBack, url: string, keyValue: string, expires: string): void {
    const cookieList = keyValue.split(';');
    cookieList.forEach((cookie) => {
      document.cookie = `${cookie}; expires=${expires};domain=${url}`;
    });
  }

  public getCookies(callBack: HippyCallBack) {
    callBack.resolve(document.cookie);
  }

  public initialize() {

  }

  public destroy() {

  }
}
