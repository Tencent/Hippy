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
import { HippyAny, HippyResource } from '../../../support/common/HippyTypes';
import { VfsManager } from '../../../vfs/VfsManager';
import { ImageLoaderAdapter } from './ImageLoaderAdapter';
import { HashMap } from '@kit.ArkTS';
import { ImageRequestListener } from './ImageRequestListener';
import { ResourceDataHolder, UriType } from '../../../vfs/ResourceDataHolder';
import { image } from '@kit.ImageKit';
import { FetchResourceCallback } from '../../../vfs/FetchResourceCallback';

export class ImageLoader implements ImageLoaderAdapter {
  private static TAG = "ImageLoader"
  private static REQUEST_CONTENT_TYPE = "Content-Type"
  private static REQUEST_CONTENT_TYPE_IMAGE = "image"
  private vfsManager: VfsManager | null = null

  constructor(vfsManager: VfsManager) {
    this.vfsManager = vfsManager
  }

  fetchImageAsync(url: string,
                  listener: ImageRequestListener,
                  initProps: HashMap<string, HippyAny>,
                  width: number,
                  height: number): void {
    if (this.vfsManager) {
      const cb: FetchResourceCallback = {
        onFetchCompleted: (dataHolder: ResourceDataHolder) => {
          if (dataHolder.resultCode == ResourceDataHolder.RESOURCE_LOAD_SUCCESS_CODE) {
            const r = image.createImageSource(dataHolder.buffer as ArrayBuffer)
            if (r) { // TODO: crash protect
              r.createPixelMap().then(value => {
                listener.onRequestSuccess(value)
              })
            }
          } else {
            listener.onRequestFail()
          }
        },
        onFetchProgress: (total: number, loaded: number) => {
        }
      }
      this.vfsManager.fetchResourceAsync(
        url,
        UriType.FILE,
        this.generateRequestParams(width, height),
        null,
        cb)
    }
  }

  async fetchImageSync(url: string): Promise<HippyResource> {
    let dataHolder = this.vfsManager!.fetchResourceSync(url, UriType.FILE, null, null)
    return await image.createImageSource(dataHolder.buffer as ArrayBuffer).createPixelMap()
  }

  private generateRequestParams(width: number, height: number): Map<string, string> {
    let requestParams = new Map<string, string>()
    requestParams.set("width", String(width))
    requestParams.set("height", String(height))
    requestParams.set(ImageLoader.REQUEST_CONTENT_TYPE, ImageLoader.REQUEST_CONTENT_TYPE_IMAGE)
    return requestParams
  }
}
