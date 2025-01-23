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
import HippyRenderBaseView, {
  HippyObservedArray,
  HIPPY_COMPONENT_KEY_PREFIX
}  from 'hippy/src/main/ets/renderer_native/components/base/HippyRenderBaseView'
import { HippyCustomComponentView } from 'hippy/src/main/ets/renderer_native/components/custom/HippyCustomComponentView'
import { NativeRenderContext } from 'hippy/src/main/ets/renderer_native/NativeRenderContext'
import { HRMeasureMode, HRMeasureResult } from 'hippy/src/main/ets/renderer_native/utils/HRMeasure'
import { HRPadding, HRRect } from 'hippy/src/main/ets/renderer_native/utils/HRTypes'
import { HippyAny, HippyRenderCallback } from 'hippy/src/main/ets/support/common/HippyTypes'

@Observed
export class ExampleViewB extends HippyCustomComponentView {
  constructor(ctx: NativeRenderContext) {
    super(ctx)
  }

  setProp(propKey: string, propValue: HippyAny): boolean {
    return super.setProp(propKey, propValue)
  }

  call(method: string, params: Array<HippyAny>, callback: HippyRenderCallback | null): void {

  }

  customMeasure(width: number, widthMode: HRMeasureMode, height: number, heightMode: HRMeasureMode): HRMeasureResult {
    return new HRMeasureResult(100, 100)
  }
}

@Component
export struct ExampleComponentB {
  @ObjectLink renderView: ExampleViewB
  @ObjectLink children: HippyObservedArray<HippyRenderBaseView>

  aboutToAppear() {

  }

  aboutToDisappear() {

  }

  build() {
    Stack() {
      Text("This is a custom component B.")
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
