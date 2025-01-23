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
import HippyRenderBaseView, {
  HippyObservedArray,
  HIPPY_COMPONENT_KEY_PREFIX } from '../base/HippyRenderBaseView';
import { LogUtils } from '../../../support/utils/LogUtils';
import { HRValueUtils } from '../../utils/HRValueUtils';
import { HRListView } from '../list/HRListView';
import { HRPadding, HRRect } from '../../utils/HRTypes';
import { HRWaterfallView } from '../waterfall/HRWaterfallView';
import { buildHippyRenderView } from '../../HippyRenderViewBuilder';

@Observed
export class HRPullHeaderView extends HippyRenderBaseView {
  private readonly TAG = "HRPullHeaderView"

  constructor(ctx: NativeRenderContext) {
    super(ctx)
  }

  setProp(propKey: string, propValue: HippyAny | HippyRenderCallback): boolean {
    LogUtils.d(this.TAG, "setProp: propKey " + propKey + ", propValue: " + propValue)
    return super.setProp(propKey, propValue as HippyAny)
  }

  protected updateRenderViewFrame(frame: HRRect, padding: HRPadding | null): void {
    this.cssPositionX = 0
    this.cssPositionY = 0
    this.cssWidth = frame.width
    this.cssHeight = frame.height
  }

  call(method: string, params: Array<HippyAny>, callback: HippyRenderCallback | null): void {
    LogUtils.d(this.TAG, "call: method " + method + ", params: " + params)
    switch (method) {
      case "collapsePullHeader":
        this.onHeadRefreshFinish()
        break
      case "collapsePullHeaderWithOptions":
        {
          let map = HRValueUtils.getMap(params[0])
          if (!map) {
            break
          }
          let collapseTime = HRValueUtils.getNumber(map.get('time'))
          if (collapseTime > 0) {
            setTimeout(() => {
              LogUtils.d(this.TAG, "delay : " + collapseTime)
              this.onHeadRefreshFinish()
            }, collapseTime);
          } else {
            this.onHeadRefreshFinish()
          }
        }
        break
      case 'expandPullHeader':
        this.onHeaderRefresh()
        break
      default:
        break
    }
  }

  onHeadRefreshFinish() {
    if (this.parentView) {
      if (this.parentView instanceof HRListView) {
        let listView = this.parentView as HRListView
        listView.uiCtx?.runScopedTask(() => {
          listView.scroller.scrollToIndex(1, true)
        })
      } else if (this.parentView instanceof HRWaterfallView) {
        let waterView = this.parentView as HRWaterfallView
        waterView.uiCtx?.runScopedTask(() => {
          waterView.onHeadRefreshFinish()
        })
      }
    }
  }

  onHeaderRefresh() {
    if (this.parentView) {
      if (this.parentView instanceof HRListView) {
        let listView = this.parentView as HRListView
        listView.uiCtx?.runScopedTask(() => {
          listView.scroller.scrollToIndex(0, true)
        })
      }
    }
  }

}

@Component
export struct HRPullHeader {
  private readonly TAG = "HRPullHeader"
  @ObjectLink renderView: HRPullHeaderView
  @ObjectLink children: HippyObservedArray<HippyRenderBaseView>

  aboutToAppear() {
  }

  aboutToDisappear() {
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
  // .position({x: $$.cssPositionX, y: $$.cssPositionY})
  .size({width:$$.cssWidth, height: $$.cssHeight})
  .opacity($$.cssOpacity)
  .clip($$.cssOverflow)
  .visibility(($$ as HippyRenderBaseView).cssVisibility) // must add as, otherwise the compiler has error
  // .zIndex($$.cssZIndex)
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
