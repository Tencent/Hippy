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
import { HippyMap } from '../../../support/common/HippyTypes';
import { DimensionsUtil } from '../../../support/utils/DimensionsUtil';
import { HippyDeviceAdapter } from './HippyDeviceAdapter';

export class DefaultDeviceAdapter implements HippyDeviceAdapter {
  getDimensions(ww: number, wh: number, context: Context, shouldUseScreenDisplay: boolean): Promise<HippyMap> {
    return DimensionsUtil.getDimensions(ww, wh, context, shouldUseScreenDisplay)
  }

  reviseDimensionIfNeed(context: Context, dimensionMap: HippyMap, shouldUseScreenDisplay: boolean, systemUiVisibilityChanged: boolean) {
    // Default do nothing here
  }
}
