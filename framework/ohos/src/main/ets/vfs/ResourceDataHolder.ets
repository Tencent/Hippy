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

import fs from '@ohos.file.fs';
import HashMap from '@ohos.util.HashMap';
import { LogUtils } from '../support/utils/LogUtils';
import { FetchResourceCallback } from './FetchResourceCallback';
import { buffer } from '@kit.ArkTS';
import { HippyJsException } from '../hippy_framework/common/HippyJsException';
import { HippyAny } from '../support/common/HippyTypes';

const RESOURCE_DATA_TAG = "ResourceDataHolder"

export enum RequestFrom {
  NATIVE,
  LOCAL,
}

export enum TransferType {
  NORMAL,
  NIO,
}

export enum UriType {
  NORMAL,
  FILE,
}

export class ResourceDataHolder {
  static RESOURCE_LOAD_SUCCESS_CODE: number = 0;
  public uri: string
  public uriType: UriType
  public buffer: ArrayBuffer | null = null
  public requestResult: string = ""
  public requestHeaders: Map<string, string> | null
  public requestParams: Map<string, HippyAny> | null
  public responseHeaders: Map<string, string> | null = null
  public callback: FetchResourceCallback | null
  public transferType: TransferType = TransferType.NORMAL
  public requestFrom: RequestFrom
  public nativeRequestId: number
  public index: number = -1
  public loadStartTime: number = 0
  public resultCode: number = -1
  public requestId: string | null = null
  public errorMessage: string | null = null
  public processorTag: string | null = null
  public filePath = ""

  constructor(uri: string,
              uriType: UriType,
              requestHeaders: Map<string, string> | null,
              requestParams: Map<string, HippyAny> | null,
              callback: FetchResourceCallback | null,
              from: RequestFrom,
              nativeRequestId: number) {
    this.uri = uri
    this.uriType = uriType
    this.requestHeaders = requestHeaders
    this.requestParams = requestParams
    this.callback = callback
    this.requestFrom = from
    this.nativeRequestId = nativeRequestId
  }

  private hashMap2Array(map: Map<string, string> | null): Array<string> | null {
    if (!map) {
      return null
    }

    let array = new Array<string>()
    map.forEach((value: string, key: string) => {
      array.push(key)
      array.push(value)
    })
    return array
  }

  private array2HashMap(array: Array<string> | null): Map<string, string> | null {
    if (!array || array.length <= 0) {
      return null
    }

    let map = new Map<string, string>()
    for (let i = 0; i < array.length; i += 2) {
      let key = array[i]
      if (i + 1 < array.length) {
        let value = array[i + 1]
        map.set(key, value)
      }
    }
    return map
  }

  // call from c++
  public setNativeRequestId(nativeRequestId: number) {
    this.nativeRequestId = nativeRequestId;
  }

  // call from c++
  public getNativeRequestId(): number {
    return this.nativeRequestId;
  }

  // call from c++
  public setUri(uri: string) {
    this.uri = uri;
  }

  // call from c++
  public getUri(): string {
    return this.uri;
  }

  // call from c++
  public getRequestHeadersArray(): Array<string> | null {
    return this.hashMap2Array(this.requestHeaders)
  }

  // call from c++
  public setResponseHeadersArray(responseHeadersArray: Array<string> | null) {
    this.responseHeaders = this.array2HashMap(responseHeadersArray)
  }

  // call from c++
  public getResponseHeadersArray(): Array<string> | null {
    return this.hashMap2Array(this.responseHeaders)
  }

  // call from c++
  public getResultCode(): number {
    return this.resultCode;
  }

  // call from c++
  public setResultCode(resultCode: number) {
     this.resultCode = resultCode;
  }

  // call from c++
  public setBuffer(buffer: ArrayBuffer) {
    this.buffer = buffer;
  }

  // call from c++
  public getBuffer(): ArrayBuffer | null {
    return this.buffer;
  }

  public recycle() {
    this.buffer = null;
    this.callback = null;
    this.errorMessage = null;
    this.processorTag = null;
    this.loadStartTime = 0;
    this.index = -1;
    this.resultCode = -1;
    this.transferType = TransferType.NORMAL;
  }

  addResponseHeaderProperty(key: string, property: string) {
    if (this.responseHeaders == null) {
      this.responseHeaders = new Map<string, string>()
    }
    this.responseHeaders.set(key, property)
  }

  setBufferByFilePath(filePath: string) {
    this.filePath = filePath;
    let resultBuffer: ArrayBuffer | null = null
    let res = fs.accessSync(filePath);
    if (res) {
      let stat = fs.statSync(this.filePath);
      if (stat && stat.size > 0) {
        let file = fs.openSync(this.filePath, fs.OpenMode.READ_WRITE);
        if (file) {
          resultBuffer = new ArrayBuffer(stat.size);
          fs.readSync(file.fd, resultBuffer);
          fs.closeSync(file);
        }
      }
    } else {
      LogUtils.i(RESOURCE_DATA_TAG, `file not exists, ${filePath}`);
    }
    this.buffer = resultBuffer;
  }
}
