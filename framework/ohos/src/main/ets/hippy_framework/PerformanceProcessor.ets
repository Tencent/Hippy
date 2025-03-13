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
import { Processor } from '../vfs/Processor';
import { RequestFrom, ResourceDataHolder } from '../vfs/ResourceDataHolder'
import { ProcessorCallback } from '../vfs/ProcessorCallback';
import { UrlUtils } from '../support/utils/UrlUtils';
import systemDateTime from '@ohos.systemDateTime';
import { HippyEngineContext } from '.';

export class PerformanceProcessor extends Processor {
  private engineContextRef: WeakRef<HippyEngineContext>

  constructor(engineContext: HippyEngineContext) {
    super()
    this.engineContextRef = new WeakRef(engineContext);
  }

  handleRequestAsync(holder: ResourceDataHolder, callback: ProcessorCallback) {
    if (holder.requestFrom == RequestFrom.LOCAL) {
      holder.loadStartTime = systemDateTime.getTime();
    }
    super.handleRequestAsync(holder, callback);
  }

  handleRequestSync(holder: ResourceDataHolder): boolean {
    if (holder.requestFrom == RequestFrom.LOCAL) {
      holder.loadStartTime = systemDateTime.getTime();
    }
    return super.handleRequestSync(holder);
  }

  handleResponseAsync(holder: ResourceDataHolder, callback: ProcessorCallback) {
    let engineContext = this.engineContextRef.deref();
    if (this.shouldDoRecord(holder) && engineContext) {
      let loadEndTime = systemDateTime.getTime();
      engineContext.getJsDriver()?.onResourceLoadEnd(holder.uri, holder.loadStartTime, loadEndTime,
        holder.resultCode, holder.errorMessage || '');
    }
    super.handleResponseAsync(holder, callback);
  }

  handleResponseSync(holder: ResourceDataHolder) {
    let engineContext = this.engineContextRef.deref();
    if (this.shouldDoRecord(holder) && engineContext) {
      let loadEndTime = systemDateTime.getTime();
      engineContext.getJsDriver()?.onResourceLoadEnd(holder.uri, holder.loadStartTime, loadEndTime,
        holder.resultCode, holder.errorMessage || '');
    }
    super.handleResponseSync(holder);
  }

  private shouldDoRecord(holder: ResourceDataHolder): boolean {
    return holder.requestFrom != RequestFrom.NATIVE && !UrlUtils.isBase64Url(holder.uri);
  }
}
