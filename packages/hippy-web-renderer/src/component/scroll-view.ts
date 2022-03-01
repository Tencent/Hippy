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

import { NodeProps  } from '../types';
import { BaseView, InnerNodeTag, UIProps } from '../../types';

import { dispatchEventToHippy, setElementStyle } from '../common';
import { HippyView } from './hippy-view';
import {
  GESTURE_CAPTURE_THRESHOLD,
  mountTouchListener,
  scrollToIntegerSize,
  touchMoveCalculate,
} from './scrollable';


interface HippyScrollEvent {
  contentInset: { bottom: number; left: number; right: number; top: number };
  contentOffset: { x: number; y: number };
  contentSize: { width: number; height: number };
  layoutMeasurement: { width: number; height: number };
  zoomScale: number;
}

interface HippyScrollDragEvent extends HippyScrollEvent {
  velocity: { x: number; y: number };
  targetContentOffset: { x: number; y: number };
}

const ANIMATION_TIME = 100;

export class ScrollView extends HippyView<HTMLDivElement> {
  private lastPosition = [0, 0];
  private lastTimestamp = 0;
  private scrollableCache = false;
  public constructor(id: number, pId: number) {
    super(id, pId);
    this.tagName = InnerNodeTag.SCROLL_VIEW;
    this.dom = document.createElement('div');
    this.init();
  }
  public defaultStyle(): { [p: string]: any } {
    return { display: 'flex', flexDirection: 'column', overflowX: 'hidden', overflowY: 'scroll' };
  }

  public updateProps(data: UIProps, defaultProcess: (component: BaseView, data: UIProps) => void) {
    if (this.firstUpdateStyle) {
      defaultProcess(this, { style: this.defaultStyle() });
    }
    if (data.style && data.style.flexShrink === 1 && data.style.flexGrow === 1 && !data.style.flexBasis) {
      const newData = { ...data };
      delete newData.style.flexShrink;
      delete newData.style.flexGrow;
      defaultProcess(this, newData);
    }
  }

  public scrollStyle(horizontal: boolean) {
    const defaultStyle = this.defaultStyle();
    if (horizontal) {
      defaultStyle.style = {
        display: 'flex',
        flexDirection: 'row',
        overflowX: 'scroll',
        overflowY: 'hidden',
      };
    }
    return defaultStyle.style;
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
    setElementStyle(this.dom!, this.scrollStyle(this.horizontal));
  }

  public get pagingEnabled() {
    return this.props[NodeProps.PAGING_ENABLED];
  }

  public set pagingEnabled(value: boolean) {
    this.props[NodeProps.PAGING_ENABLED] = value;
  }

  public get scrollEventThrottle() {
    return this.props[NodeProps.SCROLL_EVENT_THROTTLE];
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
    const scrollStyle = this.scrollStyle(this.horizontal);
    if (!this.scrollEnabled) {
      scrollStyle.overflowX = 'hidden';
      scrollStyle.overflowY = 'hidden';
    }
    if (this.pagingEnabled) {
      scrollStyle.overflowX = 'visible';
      scrollStyle.overflowY = 'visible';
    }
    setElementStyle(this.dom!, scrollStyle);
  }

  public onMomentumScrollBegin(event) {
    dispatchEventToHippy(this.id, NodeProps.ON_MOMENTUM_SCROLL_BEGIN, event);
  }

  public onMomentumScrollEnd(event) {
    dispatchEventToHippy(this.id, NodeProps.ON_MOMENTUM_SCROLL_END, event);
  }

  public onScroll(event: HippyScrollEvent) {
    dispatchEventToHippy(this.id, NodeProps.ON_SCROLL, event);
  }

  public onScrollBeginDrag(event: HippyScrollDragEvent) {
    dispatchEventToHippy(this.id, NodeProps.ON_SCROLL_BEGIN_DRAG, event);
  }

  public onScrollEndDrag(event: HippyScrollDragEvent) {
    dispatchEventToHippy(this.id, NodeProps.ON_SCROLL_END_DRAG, event);
  }

  private init() {
    this[NodeProps.SCROLL_EVENT_THROTTLE] = 30;
    this[NodeProps.SCROLL_ENABLED] = true;
    mountTouchListener(this.dom!, {
      recordPosition: this.lastPosition,
      needSimulatedScrolling: this.pagingEnabled,
      scrollEnable: this.checkScrollEnable,
      onBeginDrag: this.handleBeginDrag,
      onEndDrag: this.handleEndDrag,
      onScroll: this.handleScroll,
      onBeginSliding: this.handleBeginSliding,
      onEndSliding: this.handleEndSliding,
    });
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
    this.onScrollBeginDrag(buildScrollDragEvent(this.dom!));
  }

  private handleEndDrag(position: Array<number>) {
    this.scrollableCache = false;
    this.onScrollEndDrag(buildScrollDragEvent(this.dom!));
    if (this.pagingEnabled) {
      scrollToIntegerSize(this.dom!, position, ANIMATION_TIME);
    }
  }

  private handleScroll() {
    eventThrottle(this.lastTimestamp, this.scrollEventThrottle, () => {
      console.log('scroll', buildScrollDragEvent(this.dom!));
      this.onScroll(buildScrollEvent(this.dom!));
      this.lastTimestamp = Date.now();
    });
  }

  private handleBeginSliding() {
    this.onMomentumScrollBegin(buildScrollEvent(this.dom!));
  }

  private handleEndSliding() {
    this.onMomentumScrollEnd(buildScrollEvent(this.dom!));
  }
}

function buildScrollEvent(scrollContainer: HTMLElement): HippyScrollEvent {
  return {
    contentInset: { right: 0, top: 0, left: 0, bottom: 0 },
    contentOffset: { x: scrollContainer?.scrollLeft, y: scrollContainer?.scrollTop },
    contentSize: { width: scrollContainer?.clientWidth, height: scrollContainer?.clientHeight },
    layoutMeasurement: {
      width: scrollContainer?.clientWidth,
      height: scrollContainer?.clientHeight,
    },
    zoomScale: 1,
  };
}

function buildScrollDragEvent(scrollContainer: HTMLElement): HippyScrollDragEvent {
  return {
    velocity: { x: 0, y: 0 },
    targetContentOffset: { x: scrollContainer?.scrollLeft, y: scrollContainer?.scrollTop },
    ...buildScrollEvent(scrollContainer),
  };
}

function eventThrottle(lastExecuteTime: number, throttle: number, action: Function) {
  const timeStamp = 1 / throttle;
  if (Date.now() - lastExecuteTime > timeStamp) {
    action?.();
  }
}
