/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
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

import { NodeProps } from '../types';
import { BaseView, InnerNodeTag, UIProps } from '../../types';
import { setElementStyle } from '../common';
import { HippyView } from './hippy-view';
import {
  eventThrottle,
  GESTURE_CAPTURE_THRESHOLD,
  mountTouchListener,
  scrollEndPagePosition,
  touchMoveCalculate,
  virtualSmoothScroll,
} from './scrollable';


interface HippyScrollEvent {
  contentInset: { bottom: number; left: number; right: number; top: number };
  contentOffset: { x: number; y: number };
  contentSize: { width: number; height: number };
  layoutMeasurement: { width: number; height: number };
  zoomScale: number;
}


const ANIMATION_TIME = 100;

export class ScrollView extends HippyView<HTMLDivElement> {
  private lastPosition: [number, number] = [0, 0];
  private lastTimestamp = 0;
  private scrollableCache = false;
  private touchListenerRelease;


  public constructor(context, id, pId) {
    super(context, id, pId);
    this.tagName = InnerNodeTag.SCROLL_VIEW;
    this.dom = document.createElement('div');
    this[NodeProps.SCROLL_EVENT_THROTTLE] = 30;
    this[NodeProps.SCROLL_ENABLED] = true;
  }

  public defaultStyle(): { [p: string]: any } {
    return { display: 'flex', flexDirection: 'column', overflowX: 'hidden', overflowY: 'scroll' };
  }

  public updateProps(data: UIProps, defaultProcess: (component: BaseView, data: UIProps) => void) {
    if (this.firstUpdateStyle) {
      defaultProcess(this, { style: this.defaultStyle() });
    }
    const newData = { ...data };
    if (data.style && data.style.flexShrink === 1 && data.style.flexGrow === 1 && !data.style.flexBasis) {
      delete newData.style.flexShrink;
      delete newData.style.flexGrow;
    }
    defaultProcess(this, newData);
  }

  public scrollStyle() {
    const defaultStyle = this.defaultStyle();
    const pageEnableValue = this.pagingEnabled ? 'visible' : 'scroll';
    if (this.horizontal) {
      defaultStyle.flexDirection = 'row';
      Object.assign(defaultStyle, { flexDirection: 'row', overflowX: pageEnableValue, overflowY: 'hidden' });
    }
    if (this.pagingEnabled) {
      Object.assign(defaultStyle, { overflowY: pageEnableValue, overflowX: pageEnableValue });
    }
    if (!this.scrollEnabled) {
      Object.assign(defaultStyle, { overflowY: 'hidden', overflowX: 'hidden' });
    }
    return defaultStyle;
  }

  public get bounces() {
    return this.props[NodeProps.BOUNCES];
  }

  public set bounces(value: boolean) {
    this.props[NodeProps.BOUNCES] = value;
    // TODO to implement
  }

  public get horizontal() {
    return this.props[NodeProps.HORIZONTAL];
  }

  public set horizontal(value: boolean) {
    this.props[NodeProps.HORIZONTAL] = value;
    setElementStyle(this.dom!, this.scrollStyle());
  }

  public get pagingEnabled() {
    return this.props[NodeProps.PAGING_ENABLED] && this.horizontal;
  }

  public set pagingEnabled(value: boolean) {
    this.props[NodeProps.PAGING_ENABLED] = value;
    setElementStyle(this.dom!, this.scrollStyle());
  }

  public get scrollEventThrottle() {
    return this.props[NodeProps.SCROLL_EVENT_THROTTLE] ?? 30;
  }

  public set scrollEventThrottle(value: number) {
    this.props[NodeProps.SCROLL_EVENT_THROTTLE] = value;
  }

  public get scrollIndicatorInsets() {
    return this.props[NodeProps.SCROLL_INDICATOR_INSETS];
  }

  public set scrollIndicatorInsets(value: { top: number, left: number, bottom: number, right: number }) {
    this.props[NodeProps.SCROLL_INDICATOR_INSETS] = value;
    // TODO to implement
  }

  public get scrollEnabled() {
    return this.props[NodeProps.CONTENT_CONTAINER_STYLE];
  }

  public set scrollEnabled(value) {
    this.props[NodeProps.CONTENT_CONTAINER_STYLE] = value;
    setElementStyle(this.dom!, this.scrollStyle());
  }

  public onMomentumScrollBegin(event) {
    this.props[NodeProps.ON_MOMENTUM_SCROLL_BEGIN]
    && this.context.sendUiEvent(this.id, NodeProps.ON_MOMENTUM_SCROLL_BEGIN, event);
  }

  public onMomentumScrollEnd(event) {
    this.props[NodeProps.ON_MOMENTUM_SCROLL_END]
    && this.context.sendUiEvent(this.id, NodeProps.ON_MOMENTUM_SCROLL_END, event);
  }

  public onScroll(event: HippyScrollEvent) {
    this.props[NodeProps.ON_SCROLL]
    && this.context.sendUiEvent(this.id, NodeProps.ON_SCROLL, event);
  }

  public onScrollBeginDrag(event: HippyScrollEvent) {
    this.props[NodeProps.ON_SCROLL_BEGIN_DRAG]
    && this.context.sendUiEvent(this.id, NodeProps.ON_SCROLL_BEGIN_DRAG, event);
  }

  public onScrollEndDrag(event: HippyScrollEvent) {
    this.props[NodeProps.ON_SCROLL_END_DRAG]
    && this.context.sendUiEvent(this.id, NodeProps.ON_SCROLL_END_DRAG, event);
  }

  public async beforeMount(parent: BaseView, position: number): Promise<void> {
    await super.beforeMount(parent, position);
    this.init();
  }

  public async beforeRemove(): Promise<void> {
    await super.beforeRemove();
    this.touchListenerRelease?.();
  }

  public async scrollTo(x: number, y: number, animated: boolean) {
    if (!this.pagingEnabled) {
      this.dom?.scrollTo({ top: this.horizontal ? 0 : y, left: this.horizontal ? x : 0, behavior: animated ? 'smooth' : 'auto' });
    } else {
      this.pagingModeScroll(x, animated ? ANIMATION_TIME : 1);
    }
  }

  public scrollToWithOptions({ x, y, duration }) {
    if (!this.pagingEnabled) {
      const beginTimeStamp = Date.now();
      const endTimeStamp = beginTimeStamp + duration + 1;
      let lastDistance = (this.horizontal ? x : y) - (this.horizontal ? this.dom!.scrollLeft : this.dom!.scrollTop) ;
      if (lastDistance === 0) {
        return;
      }
      const scrollCallBack = () => {
        if (Date.now() > endTimeStamp - 16) {
          if (lastDistance !== 0) {
            this.dom?.scrollTo({ top: this.horizontal ? 0 : y, left: this.horizontal ? x : 0, behavior: 'smooth' });
          }
          return;
        }
        const freScroll = lastDistance / 5;
        this.dom?.scrollTo(
          this.horizontal ? (freScroll + this.dom!.scrollLeft) : 0,
          this.horizontal ? 0 : (freScroll + this.dom!.scrollTop),
        );
        lastDistance -= (lastDistance / 5) ;
        requestAnimationFrame(scrollCallBack);
      };
      requestAnimationFrame(scrollCallBack);
    } else {
      this.pagingModeScroll(x, duration);
    }
  }

  private init() {
    this.touchListenerRelease = mountTouchListener(this.dom!, {
      onBeginDrag: this.handleBeginDrag.bind(this),
      onEndDrag: this.handleEndDrag.bind(this),
      onScroll: this.handleScroll.bind(this),
      onTouchMove: this.handleScroll.bind(this),
      onBeginSliding: this.handleBeginSliding.bind(this),
      onEndSliding: this.handleEndSliding.bind(this),
      updatePosition: this.updatePositionInfo.bind(this),
      getPosition: () => this.lastPosition,
      needSimulatedScrolling: this.pagingEnabled,
      scrollEnable: this.checkScrollEnable.bind(this),
    });
  }

  private async pagingModeScroll(offset: number, animationTime = ANIMATION_TIME) {
    this.onMomentumScrollBegin(this.buildScrollEvent(this.dom!));
    const toPosition: [number, number] = [offset * -1, 0];
    const scrollCallBack = (position) => {
      this.updatePositionInfo(position);
      this.onScroll(this.buildScrollEvent(this.dom!));
    };
    await virtualSmoothScroll(
      this.dom!, scrollCallBack, this.lastPosition, toPosition,
      animationTime,
    );
    this.onMomentumScrollEnd(this.buildScrollEvent(this.dom!));
  }

  private checkScrollEnable(lastTouchEvent: TouchEvent, touchEvent: TouchEvent|null) {
    if (!touchEvent) {
      // 隐式含义，在touchEnd/Cancel时的回调
      return this.scrollableCache;
    }
    if (this.scrollableCache && touchEvent) {
      touchEvent.stopPropagation();
      if (this.pagingEnabled) touchEvent.preventDefault();
      return this.scrollableCache;
    }

    const moveDistance = touchMoveCalculate(touchEvent, lastTouchEvent);
    if (((Math.abs(moveDistance[0]) > GESTURE_CAPTURE_THRESHOLD && this.horizontal)
        || (Math.abs(moveDistance[1]) > GESTURE_CAPTURE_THRESHOLD && !this.horizontal))
      && this.scrollEnabled
    ) {
      this.scrollableCache = true;
      touchEvent.stopPropagation();
      if (this.pagingEnabled) {
        touchEvent.preventDefault();
      }
    }
    return this.scrollableCache;
  }

  private handleBeginDrag() {
    this.onScrollBeginDrag(this.buildScrollEvent(this.dom!));
  }

  private async handleEndDrag(position:  [number, number]) {
    this.scrollableCache = false;
    this.onScrollEndDrag(this.buildScrollEvent(this.dom!));

    if (this.pagingEnabled) {
      this.onMomentumScrollBegin(this.buildScrollEvent(this.dom!));
      const { toOffset } = this.scrollEndCalculate(position);
      const toPosition: [number, number] = [toOffset, position[1]];
      const scrollCallBack = (position) => {
        this.updatePositionInfo(position);
        this.onScroll(this.buildScrollEvent(this.dom!));
      };
      await virtualSmoothScroll(
        this.dom!, scrollCallBack, position, toPosition,
        ANIMATION_TIME,
      );
      this.onMomentumScrollEnd(this.buildScrollEvent(this.dom!));
    }
  }

  private updatePositionInfo(newPosition: [number, number])  {
    this.lastPosition = newPosition;
  }

  private scrollEndCalculate(lastPosition: Array<number>) {
    const pageUnitSize = this.dom!.clientWidth;
    const scrollSize = this.dom!.scrollWidth;
    const originOffset = lastPosition[0];
    return scrollEndPagePosition(pageUnitSize, scrollSize, originOffset);
  }

  private handleScroll() {
    this.dom && eventThrottle(this.lastTimestamp, this.scrollEventThrottle, () => {
      console.log('scroll', this.buildScrollEvent(this.dom!));
      this.onScroll(this.buildScrollEvent(this.dom!));
      this.lastTimestamp = Date.now();
    });
  }

  private handleBeginSliding() {
    this.onMomentumScrollBegin(this.buildScrollEvent(this.dom!));
  }

  private handleEndSliding() {
    if (this.pagingEnabled) {
      return;
    }
    this.onMomentumScrollEnd(this.buildScrollEvent(this.dom!));
  }

  private buildScrollEvent(scrollContainer: HTMLElement): HippyScrollEvent {
    const event = {
      contentInset: { right: 0, top: 0, left: 0, bottom: 0 },
      contentOffset: { x: scrollContainer?.scrollLeft, y: scrollContainer?.scrollTop },
      contentSize: { width: scrollContainer?.clientWidth, height: scrollContainer?.clientHeight },
      layoutMeasurement: {
        width: scrollContainer?.clientWidth,
        height: scrollContainer?.clientHeight,
      },
      zoomScale: 1,
    };
    if (this.pagingEnabled) {
      event.contentOffset = { x: Math.abs(this.lastPosition[0]), y: Math.abs(this.lastPosition[1]) };
    }
    return event;
  }
}

