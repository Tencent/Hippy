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
import { HippyAny, HippyModuleCallback } from '../../../../support/common/HippyTypes'

import { VfsManager } from '../../../../vfs/VfsManager'
import { HippyEngineContext } from '../../../HippyEngineContext'
import { HippyNativeModuleBase } from '../HippyNativeModuleBase'
import { HashMap } from '@kit.ArkTS'
import { ResourceDataHolder, UriType } from '../../../../vfs/ResourceDataHolder'
import { image } from '@kit.ImageKit'
import { LogUtils } from '../../../../support/utils/LogUtils'
import { FetchResourceCallback } from '../../../../vfs/FetchResourceCallback'
import { HippyJsException } from '../../../common/HippyJsException'
import { TextUtils } from '../../../../support/utils/TextUtils'
import { HippyModulePromise } from '../../HippyModulePromise'


const IMAGE_MODULE_TAG = "ImageLoaderModule"

@HippyNativeModule({ name: "ImageLoaderModule" })
export class ImageLoaderModule extends HippyNativeModuleBase {
  public static readonly NAME = 'ImageLoaderModule'
  private static ERROR_KEY_MESSAGE = "message";
  private mVfsManager: VfsManager;

  constructor(ctx: HippyEngineContext) {
    super(ctx)
    this.mVfsManager = ctx.getVfsManager();
  }

  public fetchCompleted(dataHolder: ResourceDataHolder, url: string, promise: HippyModulePromise) {
    let path = dataHolder.filePath;
    if (dataHolder.resultCode != ResourceDataHolder.RESOURCE_LOAD_SUCCESS_CODE || TextUtils.isEmpty(path)) {
      let message = dataHolder.errorMessage != null ? dataHolder.errorMessage : "";
      let errorMsg = "Fetch image failed, url=" + url + ", msg=" + message;
      let map = new Map<string, string>()
      map.set(ImageLoaderModule.ERROR_KEY_MESSAGE, errorMsg)
      promise.resolve(map);
    } else {
      this.decodeImageData(url, path, promise);
    }
    dataHolder.recycle();
  }

  public call(method: string, params: Array<HippyAny>, promise: HippyModulePromise): HippyAny {
    switch (method) {
      case 'getSize': {
        this.getSize(params, promise)
        break;
      }
      case 'prefetch': {
        this.prefetch(params)
        break;
      }
      default:
        super.call(method, params, promise)
    }
    return null;
  }

  private decodeImageData(url: string, filePath: string, promise: HippyModulePromise) {
    let sourceOptions: image.SourceOptions = { sourceDensity: 120 };
    let imageSourceApi: image.ImageSource = image.createImageSource(filePath, sourceOptions);
    if (!imageSourceApi) {
      let errorMsg = "Create image source failed, url=" + url + ", filePath=" + filePath;
      let map = new Map<string, string>()
      map.set("error", errorMsg)
      promise.resolve(map);
      return;
    }
    imageSourceApi.getImageInfo((err: HippyJsException, imageInfo: image.ImageInfo) => {
      let map = new Map<string, string>()
      if (err != undefined) {
        map.set("width", "Fetch image failed, url=" + url + ", msg=" + err.message)
        LogUtils.e(IMAGE_MODULE_TAG, `Failed to obtaining the image information. message is ${err.message}`);
        promise.resolve(map);
      } else {
        map.set("width", imageInfo.size.width + "")
        map.set("height", imageInfo.size.height + "")
        LogUtils.i(IMAGE_MODULE_TAG, 'Succeeded in obtaining the image information.');
        promise.resolve(map);
      }
      promise.resolve(map);
    })
  }

  private generateRequestParams(): Map<string, string> {
    let requestParams = new Map<string, string>();
    requestParams.set("Content-Type", "image");
    return requestParams;
  }

  private getSize(urls: Array<HippyAny>, promise: HippyModulePromise) {
    if (urls == null || urls.length <= 0) {
      let map = new Map<string, string>()
      map.set("width", "Url parameter is empty!")
      promise.reject(map);
      return;
    }
    let resCallback = new FetchResourceCallbackImpl()
    for (let i = 0; i < urls.length; i++) {
      resCallback.onFetchCompleted = (holder: ResourceDataHolder) => {
        this.fetchCompleted(holder, urls[i] as string, promise)
      }
      resCallback.onFetchProgress = (total: number, loaded: number) => {
        // Nothing need to do here.
      }
      this.mVfsManager.fetchResourceAsync(
        urls[i] as string,
        UriType.FILE, null,
        this.generateRequestParams(),
        resCallback)
    }
  }

  private prefetch(urls: Array<HippyAny>) {
    let resCallback = new FetchResourceCallbackImpl()
    for (let i = 0; i < urls.length; i++) {
      resCallback.onFetchCompleted = (holder: ResourceDataHolder) => {
        holder.recycle()
      }
      resCallback.onFetchProgress = (total: number, loaded: number) => {
        // Nothing need to do here.
      }
      this.mVfsManager.fetchResourceAsync(urls[i] as string,  UriType.FILE, null, this.generateRequestParams(), resCallback)
    }
  }
}

class FetchResourceCallbackImpl implements FetchResourceCallback {
  onFetchCompleted = (holder: ResourceDataHolder) => {
  };
  onFetchProgress = (total: number, loaded: number) => {
  };
}
