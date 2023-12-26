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
import deviceInfo  from '@ohos.deviceInfo';
import { HippyAny } from '../../../support/common/HippyTypes';
import { LogUtils } from '../../../support/utils/LogUtils';
import { buildHippyRenderView } from '../../HippyRenderViewBuilder';
import { NativeRenderContext } from '../../NativeRenderContext';
import HippyRenderBaseView, { HippyObservedArray,
  HIPPY_COMPONENT_KEY_PREFIX } from '../base/HippyRenderBaseView';

const HippyGestureTag = 'HippyGestureTag'

@Observed
export class HRDivView extends HippyRenderBaseView {
  constructor(ctx: NativeRenderContext) {
    super(ctx)
  }

  setProp(propKey: string, propValue: HippyAny): boolean {
    return super.setProp(propKey, propValue)
  }
}

@Component
export struct HRDiv {
  @ObjectLink renderView: HRDivView
  @ObjectLink children: HippyObservedArray<HippyRenderBaseView>

  shouldAddGesture() {
    return deviceInfo.sdkApiVersion >= 11 && (
      this.renderView.eventLongPress != null ||
        this.renderView.eventPressIn != null ||
        this.renderView.eventPressOut != null ||
        this.renderView.eventTouchUp != null ||
        this.renderView.eventTouchDown != null ||
        this.renderView.eventTouchMove != null ||
        this.renderView.eventTouchCancel != null ||
        this.renderView.flagInterceptPullUp
    )
  }

  aboutToAppear() {
    if (this.renderView.eventAttachedToWindow) {
      this.renderView.eventAttachedToWindow()
    }
  }

  aboutToDisappear() {
    if (this.renderView.eventDetachedFromWindow) {
      this.renderView.eventDetachedFromWindow()
    }
  }

  build() {
    if(this.shouldAddGesture()){
      Stack() {
        ForEach(this.children, (item: HippyRenderBaseView) => {
          buildHippyRenderView(item, null)
        }, (item: HippyRenderBaseView) => item.tag + '')
      }
      .applyRenderViewBaseAttr(this.renderView)
      .applyGestures(this.renderView)
    }else {
      Stack() {
        ForEach(this.children, (item: HippyRenderBaseView) => {
          buildHippyRenderView(item, null)
        }, (item: HippyRenderBaseView) => item.tag + '')
      }
      .applyRenderViewBaseAttr(this.renderView)
    }
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

@Extend(Stack)
function applyGestures($$: HippyRenderBaseView) {
  .onGestureJudgeBegin((gestureInfo: GestureInfo, event: BaseGestureEvent): GestureJudgeResult => {
    if (gestureInfo.tag != HippyGestureTag) {
      // let other gestures continue
      return GestureJudgeResult.CONTINUE
    }
    return (gestureInfo.type == GestureControl.GestureType.LONG_PRESS_GESTURE &&
      ($$.eventLongPress != null) || $$.eventPressIn != null || $$.eventPressOut != null) ?
    GestureJudgeResult.CONTINUE : GestureJudgeResult.REJECT
  })
  .parallelGesture(GestureGroup(GestureMode.Parallel,
    LongPressGesture({ repeat: false })
      .tag(HippyGestureTag)
      .onAction((event?: GestureEvent) => {
        if (event && $$.eventPressIn) {
          $$.eventPressIn(event)
        }
      })
      .onActionEnd((event?: GestureEvent) => {
        if (event && $$.eventPressOut) {
          $$.eventPressOut(event)
        }
        if (event && $$.eventLongPress) {
          $$.eventLongPress(event)
        }
      })
      .onActionCancel(() => {
        if ($$.eventPressOut) {
          $$.eventPressOut(null)
        }
      }),
  ))
  .onTouch((event: TouchEvent) => {
    if ($$.flagInterceptPullUp) {
      $$.handleInterceptPullUp(event)
    }
    switch (event.type) {
      case TouchType.Down: {
        if ($$.eventTouchDown) {
          $$.eventTouchDown(event)
        }
      }
        break
      case TouchType.Up: {
        if ($$.eventTouchUp) {
          $$.eventTouchUp(event)
        }
      }
        break
      case TouchType.Move: {
        if ($$.eventTouchMove) {
          $$.eventTouchMove(event)
        }
      }
        break
      case TouchType.Cancel: {
        if ($$.eventTouchCancel) {
          $$.eventTouchCancel(event)
        }
      }
        break
    }
  })
}
