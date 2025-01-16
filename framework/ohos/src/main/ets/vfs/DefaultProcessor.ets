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
import { Processor } from './Processor';
import { ResourceLoader } from './ResourceLoader';
import {ResourceDataHolder} from './ResourceDataHolder'
import { ProcessorCallback } from './ProcessorCallback';

export class DefaultProcessor extends Processor {
  private resourceLoader: ResourceLoader

  constructor(resourceLoader: ResourceLoader) {
    super()
    this.resourceLoader = resourceLoader
  }

  handleRequestAsync(holder: ResourceDataHolder, callback: ProcessorCallback) {
    if (holder.resultCode == ResourceDataHolder.RESOURCE_LOAD_SUCCESS_CODE) {
      callback.onHandleCompleted()
    } else {
      this.resourceLoader.fetchResourceAsync(holder, callback)
    }
  }

  handleRequestSync(holder: ResourceDataHolder): boolean {
    if (holder.resultCode == ResourceDataHolder.RESOURCE_LOAD_SUCCESS_CODE) {
      return true
    } else {
      return this.resourceLoader.fetchResourceSync(holder)
    }
  }

}
