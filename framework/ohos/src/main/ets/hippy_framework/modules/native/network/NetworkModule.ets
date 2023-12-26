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
import { HippyNativeModule } from '../../../../support/annotation/HippyNativeModule'
import { HippyAny, HippyMap, HippyValue } from '../../../../support/common/HippyTypes'
import { VfsManager } from '../../../../vfs/VfsManager'
import { ResourceDataHolder, UriType } from '../../../../vfs/ResourceDataHolder'
import { HippyEngineContext } from '../../../HippyEngineContext'
import { HippyNativeModuleBase } from '../HippyNativeModuleBase'
import { TextUtils } from '../../../../support/utils/TextUtils'
import { HippyHttpRequest } from '../../../adapter/http/HippyHttpRequest'
import { HippyHttpResponse } from '../../../adapter/http/HippyHttpResponse'
import { LogUtils } from '../../../../support/utils/LogUtils'
import { FetchResourceCallback } from '../../../../vfs/FetchResourceCallback'
import { HippyModulePromise } from '../../HippyModulePromise'
import { ArgumentUtils } from '../../../../support/utils/ArgumentUtils'

const NETWORK_MODULE_TAG = "NetworkModule"

@HippyNativeModule({ name: "network" })
export class NetworkModule extends HippyNativeModuleBase {
  public static readonly NAME = 'network'

  constructor(ctx: HippyEngineContext) {
    super(ctx)
  }

  public handleFetchResult(dataHolder: ResourceDataHolder, promise: HippyModulePromise) {
    try {
      if (dataHolder.resultCode == ResourceDataHolder.RESOURCE_LOAD_SUCCESS_CODE) {
        let responseObject = this.handleFetchResponse(dataHolder);
        promise.resolve(responseObject);
      } else {
        let errorMessage = (dataHolder.errorMessage == null) ? "Load remote resource failed!" : dataHolder.errorMessage;
        promise.reject(errorMessage);
      }
    } catch (e) {
      promise.reject("Handle response failed: " + e.getMessage());
    }
  }

  public call(method: string, params: Array<HippyAny>, promise: HippyModulePromise): HippyAny {
    switch (method) {
      case 'fetch': {
        this.fetch(params[0] as HippyMap, promise)
        break;
      }
      case 'setCookie': {
        if (params != null && params.length > 2) {
          let url = ""
          let keyValue = ""
          let expires = ""
          if (params[0] !== undefined) {
            url = params[0] as string
          }
          if (params[1] !== undefined) {
            keyValue = params[1] as string
          }
          if (params[2] !== undefined) {
            expires = params[2] as string
          }
          this.setCookie(url, keyValue, expires)
        }
        break;
      }
      case 'addListener': {
        this.addListener()
        break;
      }
      case 'removeListener': {
        this.removeListener()
        break;
      }
      case 'getCookie': {
        this.getCookie(params[0] as string, promise)
        break;
      }
      default:
        super.call(method, params, promise)
    }
    return null;
  }

  private fetch(request: HippyMap, promise: HippyModulePromise) {
    let vfsManager: VfsManager = this.ctx.getVfsManager()
    const uri: string = request.get(HippyHttpRequest.HTTP_URL) as string;
    const redirect: string = request.get(HippyHttpRequest.HTTP_REDIRECT) as string;
    const requestHeaders = request.get(HippyHttpRequest.HTTP_HEADERS) as Map<string, string>;
    const requestParams =  new Map<string, HippyAny>();
    const requestBody = this.normalizeRequestParams(request);
    const method = request.get(HippyHttpRequest.HTTP_METHOD) as string ?? 'GET';
    requestParams.set(HippyHttpRequest.HTTP_METHOD, method.toUpperCase())
    requestParams.set(HippyHttpRequest.HTTP_BODY, requestBody)
    requestParams.set(HippyHttpRequest.HTTP_URL, uri)
    requestParams.set(HippyHttpRequest.HTTP_REDIRECT, redirect)
    const map = new Map<string, HippyValue>();
    if (TextUtils.isEmpty(uri)) {
      map.set('request', 'Get url parameter failed!')
      promise.resolve(map);
      return;
    }

    vfsManager.fetchResourceAsync(uri, UriType.NORMAL, requestHeaders, requestParams, new FetchResCallback(this.ctx, promise));
  }

  private normalizeRequestParams(request: HippyMap): string {
    let requestParams = request.get(HippyHttpRequest.HTTP_BODY) as Map<string, string> | string;
    if (requestParams instanceof Map) {
      const jsonObject: Record<string, Object> = {};
      requestParams.forEach((value, key) => {
        if (key !== undefined && value !== undefined) {
          jsonObject[key] = value;
        }
      })
      return JSON.stringify(jsonObject);
    }
    return requestParams;
  }

  private handleFetchResponse(dataHolder: ResourceDataHolder): HippyMap {
    let resHeader = dataHolder.responseHeaders
    let headerMap: HippyMap = new Map<string, string>();
    let responseMap: HippyMap = new Map<string, HippyAny>();
    let statusCode = -1;
    let responseMessage = "";
    if (resHeader != null) {
      try {
        statusCode = Number.parseInt(resHeader.get(HippyHttpResponse.HTTP_RESPONSE_STATUS_CODE) ?? '-1');
      } catch (e) {
        LogUtils.e(NETWORK_MODULE_TAG, "parse status code error!")
      }
      responseMessage = resHeader.get(HippyHttpResponse.HTTP_RESPONSE_RESPONSE_MESSAGE) ?? '';
      for (let header of resHeader.entries()) {
        let key = header[0]
        let value = header[1]
        if (key == null || value == null) {
          continue;
        }
        headerMap.set(key, value);
      }
    }
    if (responseMessage == "") {
      responseMessage = (dataHolder.errorMessage == null) ? "" : dataHolder.errorMessage;
    }
    responseMap.set(HippyHttpResponse.HTTP_RESPONSE_STATUS_CODE, statusCode);
    responseMap.set("statusLine", responseMessage);
    responseMap.set("respHeaders", headerMap);
    responseMap.set("respBody", dataHolder.requestResult);
    return responseMap
  }

  private getCookie(url: string, promise: HippyModulePromise) {
    let adapter = this.ctx.getGlobalConfigs().getHttpAdapter();
    if (adapter != null) {
      adapter.getCookie(url, promise);
    }
  }

  private setCookie(url: string, keyValue: string, expires: string) {
    let adapter = this.ctx.getGlobalConfigs().getHttpAdapter();
    if (adapter != null) {
      adapter.setCookie(url, keyValue, expires);
    }
  }

  private addListener() {

  }

  private removeListener() {

  }
}

class FetchResCallback implements FetchResourceCallback {
  private netModule: NetworkModule
  private promise: HippyModulePromise

  constructor(ctx: HippyEngineContext, promise: HippyModulePromise) {
    this.netModule = new NetworkModule(ctx)
    this.promise = promise;
  }

  onFetchCompleted(holder: ResourceDataHolder): void {
    this.netModule.handleFetchResult(holder, this.promise);
    holder.recycle();
  }

  onFetchProgress(total: number, loaded: number): void {
    // Nothing need to do here.
  }
}
