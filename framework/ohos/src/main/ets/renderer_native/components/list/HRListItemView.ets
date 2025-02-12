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
import { HRPadding, HRRect } from '../../utils/HRTypes'
import HippyRenderBaseView, { HippyObservedArray,
  HIPPY_COMPONENT_KEY_PREFIX } from '../base/HippyRenderBaseView'
import { LogUtils } from '../../../support/utils/LogUtils';
import { HRValueUtils } from '../../utils/HRValueUtils';
import { HREventUtils } from '../../utils/HREventUtils'
import { buildHippyRenderView } from '../../HippyRenderViewBuilder'

@Observed
export class HRListItemView extends HippyRenderBaseView {
  private readonly TAG = "HRListItemView"
  public type: string = ""
  public sticky: boolean = false

  static readonly EXPOSURE_STATE_FULL_VISIBLE: number = 1;
  static readonly EXPOSURE_STATE_INVISIBLE: number = 2;
  static readonly EXPOSURE_STATE_PART_VISIBLE: number = 3;

  exposureState: number = HRListItemView.EXPOSURE_STATE_INVISIBLE;

  constructor(ctx: NativeRenderContext) {
    super(ctx)
  }

  setProp(propKey: string, propValue: HippyAny | HippyRenderCallback): boolean {
    LogUtils.d(this.TAG, `propKey:${propKey}, propValue:${propValue}`)
    if (propKey === 'type' || propKey === 'itemViewType') {
      if (typeof propValue == 'string') {
        this.type = propValue
      } else if (typeof propValue == 'number') {
        this.type = String(propValue)
      } else {
        this.type = "NoType" + this.tag
      }
      return true
    } else if (propKey === 'sticky') {
      this.sticky = HRValueUtils.getBoolean(propValue as HippyAny, false)
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

  checkExposureView(currentRatio: number) {
    let newState = this.calculateExposureState(currentRatio);
    this.moveToExposureState(newState);
  }

  // 可视面积小于10%，任务view当前已经不在可视区域
  private calculateExposureState(currentRatio: number): number {
    if (currentRatio >= 1) {
      return HRListItemView.EXPOSURE_STATE_FULL_VISIBLE;
    } else if (currentRatio > 0.1) {
      return HRListItemView.EXPOSURE_STATE_PART_VISIBLE;
    } else {
      return HRListItemView.EXPOSURE_STATE_INVISIBLE;
    }
  }

  private moveToExposureState(state: number) {
    if (state == this.exposureState) {
      return;
    }
    switch (state) {
      case HRListItemView.EXPOSURE_STATE_FULL_VISIBLE:
        if (this.exposureState == HRListItemView.EXPOSURE_STATE_INVISIBLE) {
          HREventUtils.sendComponentEvent(this.ctx, this.tag, HREventUtils.EVENT_LIST_ITEM_WILL_APPEAR, null);
        }
        HREventUtils.sendComponentEvent(this.ctx, this.tag, HREventUtils.EVENT_LIST_ITEM_APPEAR, null);
        break;
      case HRListItemView.EXPOSURE_STATE_PART_VISIBLE:
        if (this.exposureState == HRListItemView.EXPOSURE_STATE_FULL_VISIBLE) {
          HREventUtils.sendComponentEvent(this.ctx, this.tag, HREventUtils.EVENT_LIST_ITEM_WILL_DISAPPEAR, null);
        } else {
          HREventUtils.sendComponentEvent(this.ctx, this.tag, HREventUtils.EVENT_LIST_ITEM_WILL_APPEAR, null);
        }
        break;
      case HRListItemView.EXPOSURE_STATE_INVISIBLE:
        if (this.exposureState == HRListItemView.EXPOSURE_STATE_FULL_VISIBLE) {
          HREventUtils.sendComponentEvent(this.ctx, this.tag, HREventUtils.EVENT_LIST_ITEM_WILL_DISAPPEAR, null);
        }
        HREventUtils.sendComponentEvent(this.ctx, this.tag, HREventUtils.EVENT_LIST_ITEM_DISAPPEAR, null);
        break;
      default:
        break;
    }
    this.exposureState = state
  }

}

@Component
@Reusable
export struct HRListItem {
  @ObjectLink renderView: HRListItemView
  @ObjectLink children: HippyObservedArray<HippyRenderBaseView>

  aboutToReuse(params: Record<string, Object>): void {
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
