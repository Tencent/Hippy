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

import {
  GESTURE_CAPTURE_THRESHOLD,
  mountTouchListener,
  scrollToIntegerSize,
  touchMoveCalculate,
} from '../scrollable';
import { HIPPY_COMPONENT_METHOD, NodeProps, NodeTag, ORIGIN_TYPE } from '../../module/node-def';
import { HippyScrollViewProps, initProps } from './process';
export * from './process';

const TIME_CHECK_LONG = 100;
const TRANSITION_TIME = 100;
const ANIMATION_TIME = 100;

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

export function createHippyScrollView(): HTMLElement {
  const scrollElement = document.createElement('div');
  const lastPosition = [0, 0];
  let lastScrollTime = 0;
  let scrollableCache = false;
  scrollElement[HippyScrollViewProps] = {};
  scrollElement[HIPPY_COMPONENT_METHOD] = {};
  scrollElement[ORIGIN_TYPE] = NodeTag.SCROLL_VIEW;
  initProps(scrollElement);
  mountTouchListener(scrollElement, {
    recordPosition: lastPosition,
    needSimulatedScrolling: scrollElement[HippyScrollViewProps][NodeProps.PAGING_ENABLED],
    scrollEnable: (lastTouchEvent: TouchEvent, touchEvent: TouchEvent|null) => {
      if (!touchEvent) {
        // TODO  Implicit，on touchCancel Event and touchEnd Event
        return scrollableCache;
      }

      if (scrollableCache && touchEvent) {
        touchEvent.stopPropagation();
        if (scrollElement[HippyScrollViewProps][NodeProps.PAGING_ENABLED]) {
          touchEvent.preventDefault();
        }
        return scrollableCache;
      }

      const moveDistance = touchMoveCalculate(touchEvent, lastTouchEvent);
      if (
        ((Math.abs(moveDistance[0]) > GESTURE_CAPTURE_THRESHOLD
          && scrollElement[HippyScrollViewProps][NodeProps.HORIZONTAL])
          || (Math.abs(moveDistance[1]) > GESTURE_CAPTURE_THRESHOLD
            && !scrollElement[HippyScrollViewProps][NodeProps.HORIZONTAL]))
        && !!scrollElement[HippyScrollViewProps][NodeProps.SCROLL_ENABLED]
      ) {
        scrollableCache = true;
        touchEvent.stopPropagation();
        if (scrollElement[HippyScrollViewProps][NodeProps.PAGING_ENABLED]) {
          touchEvent.preventDefault();
        }
      }
      return scrollableCache;
    },
    onBeginDrag: handleBeginDrag,
    onEndDrag: (el: HTMLElement, position: Array<number>) => {
      scrollableCache = false;
      handleEndDrag(el, position);
    },
    onScroll: (el: HTMLElement) => {
      handleScroll(el, lastScrollTime);
      lastScrollTime = Date.now();
    },
    onBeginSliding: handleBeginSliding,
    onEndSliding: handleEndSliding,
  });
  return scrollElement;
}

function handleBeginDrag(el: HTMLElement) {
  el[HippyScrollViewProps][NodeProps.ON_SCROLL_BEGIN_DRAG]?.(buildScrollDragEvent(el));
}
function handleEndDrag(el: HTMLElement, position: Array<number>) {
  el[HippyScrollViewProps][NodeProps.ON_SCROLL_END_DRAG]?.(buildScrollDragEvent(el));

  if (el[HippyScrollViewProps][NodeProps.PAGING_ENABLED]
  ) {
    scrollToIntegerSize(el, position, ANIMATION_TIME);
  }
}
function handleScroll(el: HTMLElement, lastScrollTime: number) {
  eventThrottle(lastScrollTime, el[HippyScrollViewProps][NodeProps.SCROLL_EVENT_THROTTLE], () => {
    el[HippyScrollViewProps][NodeProps.ON_SCROLL]?.(buildScrollEvent(el));
  });
}
function handleBeginSliding(el: HTMLElement) {
  el[HippyScrollViewProps][NodeProps.ON_SCROLL_BEGIN_DRAG]?.(buildScrollEvent(el));
}
function handleEndSliding(el: HTMLElement) {
  el[HippyScrollViewProps][NodeProps.ON_SCROLL_END_DRAG]?.(buildScrollEvent(el));
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
