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
import { buildHippyRenderView } from 'hippy/src/main/ets/renderer_native/HippyRenderViewBuilder'
import { NativeRenderContext } from 'hippy/src/main/ets/renderer_native/NativeRenderContext'
import { HippyAny, HippyRenderCallback } from 'hippy/src/main/ets/support/common/HippyTypes'
import { LogUtils } from 'hippy/src/main/ets/support/utils/LogUtils'

@Observed
export class MyBottomView extends HippyCustomComponentView {
  constructor(ctx: NativeRenderContext) {
    super(ctx)
  }

  setProp(propKey: string, propValue: HippyAny): boolean {
    return super.setProp(propKey, propValue)
  }

  call(method: string, params: Array<HippyAny>, callback: HippyRenderCallback | null): void {
  }
}

@Component
export struct MyBottomComponent {
  @ObjectLink renderView: MyBottomView
  @ObjectLink children: HippyObservedArray<HippyRenderBaseView>

  private arr: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

  aboutToAppear() {
    LogUtils.d('hippy demo', 'MyBottom to appear, tag: ' + this.renderView.tag)

  }

  aboutToDisappear() {
    LogUtils.d('hippy demo', 'MyBottom to disappear, tag: ' + this.renderView.tag)
  }

  build() {
    Stack() {
      List({ initialIndex: 0 }) {
        ForEach(this.arr, (item: number) => {
          ListItem() {
            Text('Item ' + item)
              .width('100%')
              .height(40)
              .fontSize(16)
              .textAlign(TextAlign.Center)
          }
          .backgroundColor(item % 2 == 1 ? Color.White : Color.Gray)
        }, (item: string) => item)
      }
      .listDirection(Axis.Vertical)
      .scrollBar(BarState.Off)
      .edgeEffect(EdgeEffect.None)
      .nestedScroll({
        scrollForward: NestedScrollMode.PARENT_FIRST,
        scrollBackward: NestedScrollMode.SELF_FIRST})
    }
    .applyRenderViewBaseAttr(this.renderView)
  }
}

// base props for all components
@Extend(Stack)
function applyRenderViewBaseAttr($$: HippyRenderBaseView) {
  .key(HIPPY_COMPONENT_KEY_PREFIX + $$.tag)
  .backgroundColor($$.cssBackgroundColor)
  // 当前端给父自定义组件指定native-scroll-ohos="column"时，子自定义组件的位置由内部column布局组件生成
  //.position({x: $$.cssPositionX, y: $$.cssPositionY})
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
