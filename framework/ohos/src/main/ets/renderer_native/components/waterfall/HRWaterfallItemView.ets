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

import { HippyAny, HippyMap, HippyRenderCallback } from '../../../support/common/HippyTypes';
import { NativeRenderContext } from '../../NativeRenderContext';
import { HREventUtils } from '../../utils/HREventUtils'
import HippyRenderBaseView, {
  HippyObservedArray,
  HIPPY_COMPONENT_KEY_PREFIX } from '../base/HippyRenderBaseView';
import { LogUtils } from '../../../support/utils/LogUtils';
import { HRPadding, HRRect } from '../../utils/HRTypes';
import { buildHippyRenderView } from '../../HippyRenderViewBuilder';

@Observed
export class HRWaterfallItemView extends HippyRenderBaseView {
  private readonly TAG = "HRWaterfallItemView"
  public type: string = ""

  constructor(ctx: NativeRenderContext) {
    super(ctx)
  }

  setProp(propKey: string, propValue: HippyAny | HippyRenderCallback): boolean {
    LogUtils.d(this.TAG, "setProp: propKey " + propKey + ", value: " + propValue)
    if (propKey === 'type') {
      if (typeof propValue == 'string') {
        this.type = propValue
      } else if (typeof propValue == 'number') {
        this.type = String(propValue)
      } else {
        this.type = "NoType" + this.tag
      }
      return true
    }
    return super.setProp(propKey, propValue as HippyAny)
  }

  protected updateRenderViewFrame(frame: HRRect, padding: HRPadding | null): void {
    this.cssPositionX = 0
    this.cssPositionY = 0
    this.cssWidth = frame.width
    this.cssHeight = frame.height
  }
}

@Component
@Reusable
export struct HRWaterfallItem {
  private readonly TAG = "HRWaterfallItem"
  @ObjectLink renderView: HRWaterfallItemView
  @ObjectLink children: HippyObservedArray<HippyRenderBaseView>

  aboutToReuse(params: Record<string, Object>): void {
  }

  aboutToAppear(): void {
    LogUtils.d(this.TAG, "aboutToAppear ")
  }

  build() {
    Stack() {
      ForEach(this.children, (item: HippyRenderBaseView) => {
        buildHippyRenderView(item, null)
      }, (item: HippyRenderBaseView) => item.tag + '')
    }
    .applyRenderViewBaseAttr(this.renderView)
  }
}

// base props for all components
@Extend(Stack)
function applyRenderViewBaseAttr($$: HippyRenderBaseView) {
  .key(HIPPY_COMPONENT_KEY_PREFIX + $$.tag)
  .backgroundColor($$.cssBackgroundColor)
  .position({x: $$.cssPositionX, y: $$.cssPositionY})
  .size({width:$$.cssWidth, height: $$.cssHeight})
  .opacity($$.cssOpacity)
  .clip($$.cssOverflow)
  .visibility(($$ as HippyRenderBaseView).cssVisibility) // must add as, otherwise the compiler has error
  .zIndex($$.cssZIndex)
  .accessibilityText($$.cssAccessibilityLabel)
  .focusable($$.cssFocusable)
  .border($$.cssBorder)
  .shadow($$.cssShadow)
  .linearGradient($$.cssLinearGradient)
  .backgroundImage($$.cssBackgroundImage)
  .backgroundImageSize($$.cssBackgroundImageSize)
  .backgroundImagePosition($$.cssBackgroundImagePosition)
  .transform($$.cssMatrix)
  .rotate($$.cssRotate)
  .scale($$.cssScale)
  .translate($$.cssTranslate)
  .hitTestBehavior($$.hitTestBehavior)
  .onClick($$.eventClick)
}
