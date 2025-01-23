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
import { ResourceDataHolder } from './ResourceDataHolder'

export interface FetchResourceCallback {
  /**
   * After the process chain traversal is completed, we need to call this method to
   * return the processing results to the original request initiator.
   *
   * @param dataHolder holder of resources fetch result
   */
  onFetchCompleted : (holder: ResourceDataHolder) => void

  /**
   * Return the current progress when loading resources.
   *
   * @param total the total size of resources
   * @param loaded the current progress has loaded
   */
  onFetchProgress : (total: number, loaded: number) => void
}
