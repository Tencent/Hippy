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
import { HRValueUtils } from '../../utils/HRValueUtils';
import { buildHippyRenderView } from '../../HippyRenderViewBuilder';

@Observed
export class HRViewPagerView extends HippyRenderBaseView {
  private readonly TAG = "HRViewPagerView"
  public initialPage: number = 0
  public index: number = 0
  public prevMargin: number = 0
  public nextMargin: number = 0
  public disableSwipe: boolean = false
  public vertical: boolean = false
  public controller: SwiperController = new SwiperController()

  constructor(ctx: NativeRenderContext) {
    super(ctx)
  }

  setProp(propKey: string, propValue: HippyAny | HippyRenderCallback): boolean {
    if (propKey === 'initialPage') {
      this.initialPage = HRValueUtils.getNumber(propValue as HippyAny);
      this.index = this.initialPage
      return true
    } else if (propKey === 'scrollEnabled') {
      let enable = HRValueUtils.getBoolean(propValue as HippyAny, true)
      this.disableSwipe = !enable
      return true
    } else if (propKey === 'direction') {
      if (HRValueUtils.getString(propValue as HippyAny) === 'vertical') {
        this.vertical = true
      }
      return true
    } else if (propKey === 'vertical') {
      this.vertical = true
      return true
    } else if (propKey === 'pageMargin') {
      this.prevMargin = this.nextMargin = HRValueUtils.getNumber(propValue as HippyAny)
      return true
    }
    return super.setProp(propKey, propValue as HippyAny)
  }

  call(method: string, params: Array<HippyAny>, callback: HippyRenderCallback | null): void {
    LogUtils.d(this.TAG, "call: method " + method + ", params: " + params)
    switch (method) {
      case "setPage":
        this.index = HRValueUtils.getNumber(params[0])
        break;
      case "setPageWithoutAnimation":
        this.index = HRValueUtils.getNumber(params[0])
        break;
      case "next":
        this.controller.showNext()
        break;
      case "prev":
        this.controller.showPrevious()
        break;
      case "setIndex":
        // TODO: ohos not support para 'animated'
        let map = HRValueUtils.getMap(params[0])
        if (map) {
          let i = map.get('index')
          if (i && typeof i == 'number') {
            this.index = i
          }
        }
        break;
      default:
        break;
    }
  }
}

@Component
export struct HRViewPager {
  private readonly TAG = "HRViewPager"
  @ObjectLink renderView: HRViewPagerView
  @ObjectLink children: HippyObservedArray<HippyRenderBaseView>

  private PAGE_ITEM_POSITION: string = "position";
  private PAGE_ITEM_OFFSET: string = "offset";
  private PAGE_SCROLL_STATE: string = "pageScrollState";
  private SCROLL_STATE_IDLE: string = "idle";
  private SCROLL_STATE_DRAGGING: string = "dragging";
  private SCROLL_STATE_SETTLING: string = "settling";

  handleChangeEvent(index: number) {
    LogUtils.d(this.TAG, "handleChangeEvent: index " + index)
    let params = new Map<string, number>() as HippyMap;
    params.set(this.PAGE_ITEM_POSITION, index);
    HREventUtils.sendComponentEvent(this.renderView.ctx, this.renderView.tag, HREventUtils.EVENT_PAGE_SELECTED, params);
    LogUtils.d(this.TAG, "EVENT_PAGE_SELECTED ")

    params.clear()
    params.set(this.PAGE_SCROLL_STATE, this.SCROLL_STATE_IDLE);
    HREventUtils.sendComponentEvent(this.renderView.ctx, this.renderView.tag, HREventUtils.EVENT_PAGE_SCROLL_STATE_CHANGED, params);
    LogUtils.d(this.TAG, "EVENT_PAGE_SCROLL_STATE_CHANGED 4 ")
  }

  handleGestureSwipeEvent(index: number, extraInfo: SwiperAnimationEvent) {
    LogUtils.d(this.TAG, "handleGestureSwipeEvent: index " + index)
    let params = new Map<string, Number>() as HippyMap;
    params.set(this.PAGE_ITEM_POSITION, index);
    params.set(this.PAGE_ITEM_OFFSET, extraInfo.currentOffset);
    HREventUtils.sendComponentEvent(this.renderView.ctx, this.renderView.tag, HREventUtils.EVENT_PAGE_SCROLL, params);
    LogUtils.d(this.TAG, "EVENT_PAGE_SCROLL ")
  }

  handleAnimationStartEvent(index: number, targetIndex: number, extraInfo: SwiperAnimationEvent) {
    LogUtils.d(this.TAG, "handleAnimationStartEvent: index " + targetIndex)
  }

  handleAnimationEnd(index: number, extraInfo: SwiperAnimationEvent) {
    LogUtils.d(this.TAG, "handleAnimationEnd: index " + index)
  }

  handleTouchEvent(event:TouchEvent){
    LogUtils.d(this.TAG, "handleTouchEvent: " + event.type)
    switch (event.type){
      case TouchType.Move:
        LogUtils.d(this.TAG, "handleTouchEvent: move ")
        break
      case TouchType.Down:
        {
          LogUtils.d(this.TAG, "handleTouchEvent: Down ")
          let params = new Map<string, number>() as HippyMap;
          params.set(this.PAGE_SCROLL_STATE, this.SCROLL_STATE_DRAGGING);
          HREventUtils.sendComponentEvent(this.renderView.ctx, this.renderView.tag, HREventUtils.EVENT_PAGE_SCROLL_STATE_CHANGED, params);
          LogUtils.d(this.TAG, "EVENT_PAGE_SCROLL_STATE_CHANGED  Down ")
        }
        break
      case TouchType.Up:
        {
          LogUtils.d(this.TAG, "handleTouchEvent: Up ")
          let params = new Map<string, number>() as HippyMap;
          params.set(this.PAGE_SCROLL_STATE, this.SCROLL_STATE_SETTLING);
          HREventUtils.sendComponentEvent(this.renderView.ctx, this.renderView.tag, HREventUtils.EVENT_PAGE_SCROLL_STATE_CHANGED, params);
          LogUtils.d(this.TAG, "EVENT_PAGE_SCROLL_STATE_CHANGED Up")
        }
        break
      case TouchType.Cancel:
        LogUtils.d(this.TAG, "handleTouchEvent: Cancel ")
        break
      default:
        break;
    }
  }

  aboutToAppear() {
  }

  aboutToDisappear() {
  }

  build() {
    Swiper(this.renderView.controller) {
      ForEach(this.children, (item: HippyRenderBaseView) => {
        Stack() {
          buildHippyRenderView(item, null)
        }
      }, (item: HippyRenderBaseView) => item.tag + '')
    }
    .applyRenderViewBaseAttr(this.renderView)
    .indicator(false)
    .index(this.renderView.index)
    .disableSwipe(this.renderView.disableSwipe)
    .vertical(this.renderView.vertical)
    .prevMargin(this.renderView.prevMargin)
    .nextMargin(this.renderView.nextMargin)
    .loop(false)
    .onChange((event) => this.handleChangeEvent(event))
    .onGestureSwipe((index: number, extraInfo: SwiperAnimationEvent) =>
      this.handleGestureSwipeEvent(index, extraInfo))
    .onAnimationStart((index: number, targetIndex: number, extraInfo: SwiperAnimationEvent) =>
      this.handleAnimationStartEvent(index, targetIndex, extraInfo))
    .onAnimationEnd((index: number, extraInfo: SwiperAnimationEvent) =>
      this.handleAnimationEnd(index, extraInfo))
    .onTouch((event:TouchEvent) => this.handleTouchEvent(event))
  }
}

// base props for all components
@Extend(Swiper)
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
