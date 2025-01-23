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

import { ResourceDataHolder, UriType } from '../vfs/ResourceDataHolder';
import { ResourceLoader } from '../vfs/ResourceLoader';
import { ProcessorCallback } from '../vfs/ProcessorCallback';
import { UrlUtils } from '../support/utils/UrlUtils';
import { HippyEngineContext } from './HippyEngineContext';
import { http } from '@kit.NetworkKit';
import { HippyAssetBundleLoader } from './bridge/bundleloader/HippyAssetBundleLoader';
import { HippyFileBundleLoader } from './bridge/bundleloader/HippyFileBundleLoader';
import { HippyHttpRequest } from './adapter/http/HippyHttpRequest';

export enum FetchResultCode {
  OK,
  ERR_OPEN_LOCAL_FILE,
  ERR_UNKNOWN_SCHEME,
  ERR_REMOTE_REQUEST_FAILED,
}

export class HippyResourceLoader implements ResourceLoader {
  public static readonly RAWFILE_PREFIX = "hpfile://./";
  private static readonly ASSETS_IMAGE_PREFIX = "assets://"
  private readonly engineContext: HippyEngineContext
  private readonly TAG = "HippyResourceLoader"

  constructor(engineContext: HippyEngineContext) {
    this.engineContext = engineContext
  }

  /**
   * Async Download
   * @param holder
   * @param callback
   */
  fetchResourceAsync(holder: ResourceDataHolder, callback: ProcessorCallback) {
    if (holder.uri.startsWith(HippyAssetBundleLoader.ASSETS_STR)) {
      // ASSET File
      const resManager = this.engineContext.getGlobalConfigs().getContext()!.resourceManager
      const rawPath = holder.uri.substring(HippyAssetBundleLoader.ASSETS_STR.length)
      resManager.getRawFileContent(rawPath).then((value: Uint8Array) => {
        holder.buffer = value.buffer as ArrayBuffer
        holder.resultCode = ResourceDataHolder.RESOURCE_LOAD_SUCCESS_CODE
        callback.onHandleCompleted()
      })
    }  else if (holder.uri.startsWith(HippyFileBundleLoader.FILE_STR)) {
      // Other Filer
      const rawPath = holder.uri.substring(HippyFileBundleLoader.FILE_STR.length)
      holder.setBufferByFilePath(rawPath);
      holder.resultCode = ResourceDataHolder.RESOURCE_LOAD_SUCCESS_CODE;
      callback.onHandleCompleted();
    }  else if (UrlUtils.isWebUrl(holder.uri)) {
      // Https/http Download: 1. Normal Https/http request，2. File request
      if(holder.uriType === UriType.NORMAL) {
        let httpAdapter = this.engineContext.getGlobalConfigs().getHttpAdapter()
        if (httpAdapter) {
          httpAdapter.fetch(holder, this.engineContext.getNativeParams(), callback)
        }
      } else {
        let fileAdapter = this.engineContext.getGlobalConfigs().getFileAdapter()
        if (fileAdapter) {
          fileAdapter.downloadFile(holder, callback)
        }
      }
    }
  }

  /**
   * Sync Download
   * @param holder
   * @returns
   */
  fetchResourceSync(holder: ResourceDataHolder) {
    if (holder.uri.startsWith(HippyAssetBundleLoader.ASSETS_STR)) {
      // ASSET File
      const resManager = this.engineContext.getGlobalConfigs().getContext()!.resourceManager
      const rawPath = holder.uri.substring(HippyAssetBundleLoader.ASSETS_STR.length)
      holder.buffer = resManager.getRawFileContentSync(rawPath)
      holder.resultCode = ResourceDataHolder.RESOURCE_LOAD_SUCCESS_CODE
      return true
    } else if (holder.uri.startsWith(HippyFileBundleLoader.FILE_STR)) {
      // Other File
      const rawPath = holder.uri.substring(HippyFileBundleLoader.FILE_STR.length)
      holder.setBufferByFilePath(rawPath);
      holder.resultCode = ResourceDataHolder.RESOURCE_LOAD_SUCCESS_CODE;
      return true
    } else if (UrlUtils.isWebUrl(holder.uri)) {
       // Https/http Download: 1. Normal Https/http request，2. File request
       if (holder.uriType === UriType.NORMAL) {
         // TODO
       } else {
         // TODO
       }
     }
    return false
  }
}
