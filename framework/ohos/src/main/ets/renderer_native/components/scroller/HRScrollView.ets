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
import {
  HippyAny,
  HippyArray,
  HippyMap,
  HippyRecord,
  HippyRenderCallback
} from '../../../support/common/HippyTypes';
import { NativeRenderContext } from '../../NativeRenderContext';
import HippyRenderBaseView, { HippyObservedArray,
  HIPPY_COMPONENT_KEY_PREFIX } from '../base/HippyRenderBaseView';
import { LogUtils } from '../../../support/utils/LogUtils';
import { HREventUtils } from '../../utils/HREventUtils';
import systemDateTime from '@ohos.systemDateTime';
import { HRValueUtils } from '../../utils/HRValueUtils';
import { buildHippyRenderView } from '../../HippyRenderViewBuilder';

@Observed
export class HRScrollView extends HippyRenderBaseView {
  private readonly TAG = "HRScrollView"
  private static readonly DEFAULT_FRICTION = 0.8
  axis: ScrollDirection = ScrollDirection.Vertical
  scrollBar: BarState = BarState.Off
  friction: number = HRScrollView.DEFAULT_FRICTION // default value is 0.6 in ohos
  pageEnabled: boolean = false
  enableScrollInteraction: boolean = true
  initialContentOffset: number = 0
  scrollEventThrottle: number = 30
  scrollMinOffset: number = 5

  private readonly PAGING_ENABLED = "pagingEnabled"
  private readonly FLING_ENABLED = "flingEnabled"
  private readonly CONTENT_OFFSET = "contentOffset4Reuse"
  private readonly SCROLL_ENABLED = "scrollEnabled"
  private readonly HORIZONTAL = "horizontal"
  private readonly INITIAL_CONTENTOFFSET = "initialContentOffset"
  private readonly SCROLL_EVENT_THROTTLE = "scrollEventThrottle"
  private readonly SCROLL_MINOFFSET = "scrollMinOffset"
  private readonly SHOW_SCROLLER_INDICATOR: string = "showScrollIndicator"

  private readonly METHOD_SCROLLTO: string = "scrollTo"
  private readonly METHOD_SCROLLTO_OPTIONS: string = "scrollToWithOptions"

  scroller: Scroller = new Scroller()

  constructor(ctx: NativeRenderContext) {
    super(ctx)
    LogUtils.d(this.TAG, "constructor -------------------- ")
  }

  setProp(propKey: string, propValue: HippyAny | HippyRenderCallback): boolean {
    LogUtils.d(this.TAG, "setProp: index " + propKey + ", propValue: " + propValue)
    switch (propKey) {
      case this.SHOW_SCROLLER_INDICATOR:
        this.scrollBar = HRValueUtils.getBoolean(propValue as HippyAny, false) ? BarState.On : BarState.Off
        return true
      case this.PAGING_ENABLED:
        this.pageEnabled = HRValueUtils.getBoolean(propValue as HippyAny, false)
        return true
      case this.FLING_ENABLED:
        this.friction = HRValueUtils.getBoolean(propValue as HippyAny, true) ? 20 : HRScrollView.DEFAULT_FRICTION // no params in ohos
        return true
      case this.CONTENT_OFFSET:
        this.setContentOffset4Reuse(HRValueUtils.getMap(propValue as HippyAny) as HippyMap)
        return true
      case this.SCROLL_ENABLED:
        this.enableScrollInteraction = HRValueUtils.getBoolean(propValue as HippyAny, true)
        return true
      case this.HORIZONTAL:
        this.axis = HRValueUtils.getBoolean(propValue as HippyAny, false) ? ScrollDirection.Horizontal : ScrollDirection.Vertical
        return true
      case this.INITIAL_CONTENTOFFSET:
        this.initialContentOffset = HRValueUtils.getNumber(propValue as HippyAny)
        return true
      case this.SCROLL_EVENT_THROTTLE:
        this.scrollEventThrottle = HRValueUtils.getNumber(propValue as HippyAny)
        return true
      case this.SCROLL_MINOFFSET:
        this.scrollMinOffset = HRValueUtils.getNumber(propValue as HippyAny)
        return true
    }
    return super.setProp(propKey, propValue as HippyAny)
  }

  setContentOffset4Reuse(propValue: HippyMap) {
    if (this.axis == ScrollDirection.Vertical) {
      this.scroller.scrollTo({ xOffset: 0, yOffset: HRValueUtils.getNumber(propValue.get('y')) })
    } else {
      this.scroller.scrollTo({ xOffset: HRValueUtils.getNumber(propValue.get('x')), yOffset: 0 })
    }
  }

  call(method: string, params: Array<HippyAny>, callback: HippyRenderCallback | null): void {
    switch (method) {
      case this.METHOD_SCROLLTO:
        this.hanldeScrollTo(params)
        break
      case this.METHOD_SCROLLTO_OPTIONS:
        this.handleScrollToWithOptions(params)
        break
      default:
        super.call(method, params, callback)
    }
  }

  hanldeScrollTo(params: Array<HippyAny>) {
    let xOffset: number = params.length >= 1 ? HRValueUtils.getNumber(params[0]) : 0
    let yOffset: number = params.length >= 2 ? HRValueUtils.getNumber(params[1]) : 0
    let animated: boolean = params.length >= 3 ? HRValueUtils.getBoolean(params[2], false) : false
    this.scroller.scrollTo({ xOffset: xOffset, yOffset: yOffset, animation: animated })
  }

  handleScrollToWithOptions(params: Array<HippyAny>) {
    if (params.length == 0) {
      return
    }
    let element = params[0]
    if (!(element instanceof Map)) {
      return
    }

    let xOffset: number = 0
    let yOffset: number = 0
    let duration: number = 0
    let value = element.get("x")
    if (typeof value == 'number') {
      xOffset = Math.round(value)
    }
    value = element.get("y")
    if (typeof value == 'number') {
      yOffset = Math.round(value)
    }
    value = element.get("duration")
    if (typeof value == 'number') {
      duration = value
    }
    if (duration > 0) {
      this.scroller.scrollTo({
        xOffset: xOffset,
        yOffset: yOffset,
        animation: { duration: duration }
      })
    } else {
      this.scroller.scrollTo({ xOffset: xOffset, yOffset: yOffset })
    }
  }
}

@Component
export struct HRScroll {
  @ObjectLink renderView: HRScrollView
  @ObjectLink children: HippyObservedArray<HippyRenderBaseView>
  private isDragging: boolean = false
  private lastScrollOffset: number = 0
  private lastScrollTime: number = 0

  private checkFireBeginDragEvent() {
    if (!this.isDragging) {
      this.isDragging = true
      this.emitScrollEvent(HREventUtils.EVENT_SCROLLER_BEGIN_DRAG)
    }
  }

  private checkFireEndDragEvent() {
    if (this.isDragging) {
      this.isDragging = false
      this.emitScrollEvent(HREventUtils.EVENT_SCROLLER_END_DRAG)
      this.emitScrollEvent(HREventUtils.EVENT_SCROLLER_MOMENTUM_BEGIN)
    }
  }

  aboutToAppear() {

  }

  emitScrollEvent(eventName: string) {
    if (!HREventUtils.checkRegisteredEvent(this.renderView.ctx, this.renderView.tag, eventName)) {
      return;
    }

    let contentInset = new Map<string, number>() as HippyMap;
    contentInset.set("top", 0);
    contentInset.set("bottom", 0);
    contentInset.set("left", 0);
    contentInset.set("right", 0);

    let contentOffset = new Map<string, number>() as HippyMap;
    contentOffset.set("x", this.renderView.scroller.currentOffset().xOffset);
    contentOffset.set("y", this.renderView.scroller.currentOffset().yOffset);

    let contentSize = new Map<string, number>() as HippyMap;
    contentSize.set("width", this.renderView.children.length > 0 ? this.renderView.children[0].cssWidth : this.renderView.cssWidth);
    contentSize.set("height", this.renderView.children.length > 0 ? this.renderView.children[0].cssHeight : this.renderView.cssHeight);

    let layoutMeasurement = new Map<string, number>() as HippyMap;
    layoutMeasurement.set("width", this.renderView.cssWidth);
    layoutMeasurement.set("height", this.renderView.cssHeight);

    let params = new Map<string, HippyMap>() as HippyMap;
    params.set("contentInset", contentInset);
    params.set("contentOffset", contentOffset);
    params.set("contentSize", contentSize);
    params.set("layoutMeasurement", layoutMeasurement);

    HREventUtils.sendComponentEvent(this.renderView.ctx, this.renderView.tag, eventName, params as HippyMap);
  }

  build() {
    Scroll(this.renderView.scroller) {
      Stack() {
        if (this.children.length > 0) {
          buildHippyRenderView(this.children[0], this)
        }
      }
    }
    .applyRenderViewBaseAttr(this.renderView)
    .scrollBar(this.renderView.scrollBar)
    .scrollable(this.renderView.axis)
    .friction(this.renderView.friction)
    .enablePaging(this.renderView.pageEnabled)
    .enableScrollInteraction(this.renderView.enableScrollInteraction)
    .onScroll((xOffset: number, yOffset: number) => {
      let now = systemDateTime.getUptime(systemDateTime.TimeType.STARTUP)
      if (this.renderView.axis == ScrollDirection.Vertical) {
        if (this.renderView.scrollMinOffset != 0 && Math.abs(yOffset - this.lastScrollOffset) > this.renderView.scrollMinOffset) {
          this.lastScrollOffset = yOffset
          this.emitScrollEvent(HREventUtils.EVENT_SCROLLER_ON_SCROLL)
          return
        }
      } else {
        if (this.renderView.scrollMinOffset != 0 && Math.abs(xOffset - this.lastScrollOffset) > this.renderView.scrollMinOffset) {
          this.lastScrollOffset = xOffset
          this.emitScrollEvent(HREventUtils.EVENT_SCROLLER_ON_SCROLL)
          return
        }
      }

      if (this.renderView.scrollMinOffset == 0 && (now - this.lastScrollTime) > this.renderView.scrollEventThrottle) {
        this.lastScrollTime = now
        this.emitScrollEvent(HREventUtils.EVENT_SCROLLER_ON_SCROLL)
      }
    })
    .onScrollStop(() => {
      // consider for change between vertical and Horizontal
      this.lastScrollOffset = 0
      this.lastScrollTime = 0

      this.emitScrollEvent(HREventUtils.EVENT_SCROLLER_MOMENTUM_END)
    })
    .onTouch((e: TouchEvent) => {
      switch (e.type) {
        case TouchType.Down:
        case TouchType.Move:
          this.checkFireBeginDragEvent()
          break
        case TouchType.Up:
        case TouchType.Cancel:
          this.checkFireEndDragEvent()
          break
      }
    })
    .onAppear(() => {
      if (this.renderView.axis == ScrollDirection.Vertical) {
        this.renderView.scroller.scrollTo({
          xOffset: 0,
          yOffset: this.renderView.initialContentOffset
        })
      } else {
        this.renderView.scroller.scrollTo({
          xOffset: this.renderView.initialContentOffset,
          yOffset: 0
        })
      }
    })
  }
}

// base props for all components
@Extend(Scroll)
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
