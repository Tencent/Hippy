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

import HashMap from '@ohos.util.HashMap';
import { HippyLibrary } from '../hippy_library/HippyLibrary';
import { Processor } from './Processor';
import { ResourceDataHolder, RequestFrom, UriType } from './ResourceDataHolder';
import { ProcessorCallback } from './ProcessorCallback';
import { FetchResourceCallback } from './FetchResourceCallback';
import { HippyAny } from '../support/common/HippyTypes';

export class ProcessorCallbackImpl implements ProcessorCallback {
  onHandleCompleted = () => {
  }
  goNext = () => {
  }
}

class FetchResourceCallbackImpl implements FetchResourceCallback {
  onFetchCompleted = (holder: ResourceDataHolder) => {
  }
  onFetchProgress = (total: number, loaded: number) => {
  }
}

export class VfsManager {
  private libHippy: HippyLibrary
  private instanceId: number = 0
  private processorChain: Array<Processor>

  constructor(libHippy: HippyLibrary) {
    this.libHippy = libHippy
    this.instanceId = this.createVfs();
    this.processorChain = new Array;
  }

  getVfsId(): number {
    return this.instanceId
  }

  createVfs(): number {
    return this.libHippy?.VfsManager_CreateVfs(this)
  }

  destroyVfs() {
    this.libHippy?.VfsManager_DestroyVfs(this.instanceId)
  }

  addProcessor(index: number, processor: Processor) {
    if (index < this.processorChain.length) {
      this.processorChain.splice(index, 0, processor)
    }
  }

  addProcessorAtFirst(processor: Processor) {
    this.processorChain.splice(0, 0, processor)
  }

  addProcessorAtLast(processor: Processor) {
    this.processorChain.push(processor)
  }

  destroy() {
    this.processorChain.splice(0, this.processorChain.length)
  }

  fetchResourceSync(uri: string,
                    uriType: UriType,
                    requestHeaders: Map<string, string> | null,
                    requestParams: Map<string, string> | null): ResourceDataHolder {
    this.onFetchResourceStart()
    const holder = this.fetchResourceSyncImpl(uri, uriType, requestHeaders, requestParams, RequestFrom.LOCAL)
    this.onFetchResourceEnd(holder)
    return holder
  }

  fetchResourceSyncImpl(uri: string,
                        uriType: UriType,
                        requestHeaders: Map<string, string> | null,
                        requestParams: Map<string, string> | null,
                        from: RequestFrom): ResourceDataHolder {
    let holder = new ResourceDataHolder(uri, uriType, requestHeaders, requestParams, null, from, -1)
    this.traverseForward(holder, true)
    return holder
  }

  fetchResourceAsync(uri: string,
                     uriType: UriType,
                     requestHeaders: Map<string, string> | null,
                     requestParams: Map<string, HippyAny> | null,
                     callback: FetchResourceCallback) {
    this.onFetchResourceStart()
    this.fetchResourceAsyncImpl(uri, uriType, requestHeaders, requestParams, callback, RequestFrom.LOCAL, -1)
  }

  fetchResourceAsyncImpl(uri: string,
                         uriType: UriType,
                         requestHeaders: Map<string, string> | null,
                         requestParams: Map<string, HippyAny> | null,
                         callback: FetchResourceCallback,
                         from: RequestFrom,
                         nativeRequestId: number) {
    let holder = new ResourceDataHolder(uri, uriType, requestHeaders, requestParams, callback, from, nativeRequestId)
    this.traverseForward(holder, false)
  }

  traverseForward(holder: ResourceDataHolder, isSync: boolean) {
    let index = holder.index + 1
    if (index < this.processorChain.length) {
      holder.index = index
      const processor = this.processorChain[index]
      if (isSync) {
        let goBack = processor.handleRequestSync(holder)
        if (goBack) {
          this.traverseGoBack(holder, true)
        } else {
          this.traverseForward(holder, true)
        }
      } else {
        const callback = new ProcessorCallbackImpl()
        callback.goNext = () => {
          this.traverseForward(holder, false)
        }
        callback.onHandleCompleted = () => {
          this.traverseGoBack(holder, false)
        }
        processor.handleRequestAsync(holder, callback)
      }
    } else if (isSync) {
      if (holder.requestFrom == RequestFrom.LOCAL) {
        this.doNativeTraversalsSync(this.instanceId, holder)
      } else if (holder.requestFrom == RequestFrom.NATIVE) {
        this.traverseGoBack(holder, true)
      }
    } else {
      if (holder.requestFrom == RequestFrom.LOCAL) {
        this.performNativeTraversals(holder)
      } else if (holder.requestFrom == RequestFrom.NATIVE) {
        this.traverseGoBack(holder, false)
      }
    }
  }

  traverseGoBack(holder: ResourceDataHolder, isSync: boolean) {
    let index = holder.index - 1
    if (index >= 0 && index < this.processorChain.length) {
      holder.index = index
      const processor = this.processorChain[index]
      if (isSync) {
        processor.handleRequestSync(holder)
        this.traverseGoBack(holder, true)
      } else {
        let callback = new ProcessorCallbackImpl()
        callback.onHandleCompleted = () => {
          this.traverseGoBack(holder, false)
        }
        processor.handleRequestAsync(holder, callback)
      }
    } else if (!isSync) {
      if (holder.requestFrom == RequestFrom.LOCAL) {
        this.onFetchResourceEnd(holder)
      } else if (holder.requestFrom == RequestFrom.NATIVE) {
        this.onTraversalsEndAsync(holder)
      }
    }
  }

  performNativeTraversals(holder: ResourceDataHolder) {
    const callback = new FetchResourceCallbackImpl()
    callback.onFetchCompleted = (holder: ResourceDataHolder) => {
      this.traverseGoBack(holder, false)
    }
    callback.onFetchProgress = (total: number, loaded: number) => {
      if (holder.callback) {
        holder.callback.onFetchProgress(total, loaded)
      }
    }
    this.doNativeTraversalsAsync(this.instanceId, holder, callback)
  }

  onFetchResourceStart() {

  }

  onFetchResourceEnd(holder: ResourceDataHolder) {
    if (holder.callback) {
      holder.callback.onFetchCompleted(holder)
    }
  }

  // for c++
  doLocalTraversalsAsync(uri: string,
                         requestHeaders: Map<string, string> | null,
                         requestParams: Map<string, string> | null,
                         nativeRequestId: number,
                         progressCallbackId: number) {
    const callback = new FetchResourceCallbackImpl()
    callback.onFetchCompleted = (holder: ResourceDataHolder) => {
      this.onTraversalsEndAsync(holder)
    }
    callback.onFetchProgress = (total: number, loaded: number) => {
      if (progressCallbackId >= 0) {
        this.onProgress(progressCallbackId, total, loaded)
      }
    }
    this.fetchResourceAsyncImpl(uri, UriType.FILE, requestHeaders, requestParams, callback, RequestFrom.NATIVE, nativeRequestId)
  }

  // for c++
  doLocalTraversalsSync(uri: string,
                        requestHeaders: Map<string, string> | null,
                        requestParams: Map<string, string> | null) {
    return this.fetchResourceSyncImpl(uri, UriType.FILE, requestHeaders, requestParams, RequestFrom.NATIVE)
  }

  doNativeTraversalsAsync(id: number, holder: ResourceDataHolder, callback: FetchResourceCallback) {
    this.libHippy.VfsManager_OnJniDelegateInvokeAsync(id, holder, callback)
  }

  doNativeTraversalsSync(id: number, holder: ResourceDataHolder) {
    this.libHippy.VfsManager_OnJniDelegateInvokeSync(id, holder)
  }

  onTraversalsEndAsync(holder: ResourceDataHolder) {
    this.libHippy.VfsManager_OnJniDelegateCallback(holder)
  }

  onProgress(callbackId: number, total: number, loaded: number) {
    this.libHippy.VfsManager_OnJniDelegateInvokeProgress(callbackId, total, loaded)
  }
}
