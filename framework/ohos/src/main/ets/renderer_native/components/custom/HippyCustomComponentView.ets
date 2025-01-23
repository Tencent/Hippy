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
import { HippyAny, HippyRenderCallback } from '../../../support/common/HippyTypes'
import { NativeRenderContext } from '../../NativeRenderContext'
import { HRMeasureMode, HRMeasureResult } from '../../utils/HRMeasure'
import { HRPadding, HRRect } from '../../utils/HRTypes'
import HippyRenderBaseView from '../base/HippyRenderBaseView'

export class HippyCustomComponentView extends HippyRenderBaseView {
  constructor(ctx: NativeRenderContext) {
    super(ctx)
  }

  setProp(propKey: string, propValue: HippyAny): boolean {
    return super.setProp(propKey, propValue)
  }

  updateRenderViewFrame(frame: HRRect, padding: HRPadding | null): void {
    // For c api, the position is used by container node.
    if (this.ctx.getNativeRender().isEnableArkCApi()) {
      this.cssPositionX = 0
      this.cssPositionY = 0
    } else {
      this.cssPositionX = frame.x
      this.cssPositionY = frame.y
    }
    this.cssWidth = frame.width
    this.cssHeight = frame.height
  }

  call(method: string, params: Array<HippyAny>, callback: HippyRenderCallback | null): void {

  }

  // 自定义测量方法。只有 HippyAPIProvider getCustomMeasureRenderViews 方法里指定的自定义组件才会调用该方法。
  customMeasure(width: number, widthMode: HRMeasureMode, height: number, heightMode: HRMeasureMode): HRMeasureResult {
    return new HRMeasureResult(0, 0)
  }

}
