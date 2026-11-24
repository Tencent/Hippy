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
import { HippyAny } from '../../../../support/common/HippyTypes'

import { VfsManager } from '../../../../vfs/VfsManager'
import { HippyEngineContext } from '../../../HippyEngineContext'
import { HippyNativeModuleBase } from '../HippyNativeModuleBase'
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
    if (dataHolder.resultCode != ResourceDataHolder.RESOURCE_LOAD_SUCCESS_CODE) {
      let message = dataHolder.errorMessage != null ? dataHolder.errorMessage : "";
      let errorMsg = "Fetch image failed, url=" + url + ", msg=" + message;
      let map = new Map<string, string>()
      map.set(ImageLoaderModule.ERROR_KEY_MESSAGE, errorMsg)
      promise.reject(map);
      dataHolder.recycle();
      return;
    }

    let path = dataHolder.filePath;
    if (!TextUtils.isEmpty(path)) {
      this.decodeImageData(url, path, promise);
      dataHolder.recycle();
      return;
    }

    let imageBuffer = dataHolder.buffer;
    if (imageBuffer != null) {
      this.decodeImageBuffer(url, imageBuffer, promise);
      dataHolder.recycle();
      return;
    }

    let map = new Map<string, string>()
    map.set(ImageLoaderModule.ERROR_KEY_MESSAGE, "Fetch image failed, url=" + url + ", msg=Invalid image data or file path")
    promise.reject(map);
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
      map.set(ImageLoaderModule.ERROR_KEY_MESSAGE, errorMsg)
      promise.reject(map);
      return;
    }
    imageSourceApi.getImageInfo((err: HippyJsException, imageInfo: image.ImageInfo) => {
      if (err != undefined) {
        let map = new Map<string, string>()
        map.set(ImageLoaderModule.ERROR_KEY_MESSAGE, "Fetch image failed, url=" + url + ", msg=" + err.message)
        LogUtils.e(IMAGE_MODULE_TAG, `Failed to obtaining the image information. message is ${err.message}`);
        promise.reject(map);
      } else {
        let map = new Map<string, HippyAny>()
        map.set("width", imageInfo.size.width)
        map.set("height", imageInfo.size.height)
        LogUtils.i(IMAGE_MODULE_TAG, 'Succeeded in obtaining the image information.');
        promise.resolve(map);
      }
    })
  }

  private decodeImageBuffer(url: string, imageBuffer: ArrayBuffer, promise: HippyModulePromise) {
    let sourceOptions: image.SourceOptions = { sourceDensity: 120 };
    let imageSourceApi: image.ImageSource = image.createImageSource(imageBuffer, sourceOptions);
    if (!imageSourceApi) {
      let errorMsg = "Create image source failed, url=" + url + ", msg=Invalid image buffer";
      let map = new Map<string, string>()
      map.set(ImageLoaderModule.ERROR_KEY_MESSAGE, errorMsg)
      promise.reject(map);
      return;
    }
    imageSourceApi.getImageInfo((err: HippyJsException, imageInfo: image.ImageInfo) => {
      if (err != undefined) {
        let map = new Map<string, string>()
        map.set(ImageLoaderModule.ERROR_KEY_MESSAGE, "Fetch image failed, url=" + url + ", msg=" + err.message)
        LogUtils.e(IMAGE_MODULE_TAG, `Failed to obtaining the image information. message is ${err.message}`);
        promise.reject(map);
      } else {
        let map = new Map<string, HippyAny>()
        map.set("width", imageInfo.size.width)
        map.set("height", imageInfo.size.height)
        LogUtils.i(IMAGE_MODULE_TAG, 'Succeeded in obtaining the image information.');
        promise.resolve(map);
      }
    })
  }

  private generateRequestParams(): Map<string, string> {
    let requestParams = new Map<string, string>();
    requestParams.set("Content-Type", "image");
    return requestParams;
  }

  private getSize(params: Array<HippyAny>, promise: HippyModulePromise) {
    const url = (params != null && params.length > 0) ? (params[0] as string) : "";
    if (TextUtils.isEmpty(url)) {
      let map = new Map<string, string>()
      map.set(ImageLoaderModule.ERROR_KEY_MESSAGE, "Url parameter is empty!")
      promise.reject(map);
      return;
    }
    let resCallback = new FetchResourceCallbackImpl()
    resCallback.onFetchCompleted = (holder: ResourceDataHolder) => {
      this.fetchCompleted(holder, url, promise)
    }
    resCallback.onFetchProgress = (total: number, loaded: number) => {
      // Nothing need to do here.
    }
    this.mVfsManager.fetchResourceAsync(
      url,
      UriType.FILE, null,
      this.generateRequestParams(),
      resCallback)
  }

  private prefetch(params: Array<HippyAny>) {
    const url = (params != null && params.length > 0) ? (params[0] as string) : "";
    if (TextUtils.isEmpty(url)) {
      return;
    }
    let resCallback = new FetchResourceCallbackImpl()
    resCallback.onFetchCompleted = (holder: ResourceDataHolder) => {
      holder.recycle()
    }
    resCallback.onFetchProgress = (total: number, loaded: number) => {
      // Nothing need to do here.
    }
    this.mVfsManager.fetchResourceAsync(url, UriType.FILE, null, this.generateRequestParams(), resCallback)
  }
}

class FetchResourceCallbackImpl implements FetchResourceCallback {
  onFetchCompleted = (holder: ResourceDataHolder) => {
  };
  onFetchProgress = (total: number, loaded: number) => {
  };
}
