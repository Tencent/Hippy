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

import { setElementStyle } from '../common';

const TIME_CHECK_LONG = 100;
export const GESTURE_CAPTURE_THRESHOLD = 5;
export interface TouchMoveListenerConfig {
  onBeginDrag?: (position: Array<number>) => void;
  onEndDrag?: (position: Array<number>) => void;
  onScroll?: () => void;
  onBeginSliding?: () => void;
  onEndSliding?: () => void;
  onTouchMove?: (event: Touch, lastEvent: Touch) => void;
  recordPosition: Array<number>;
  scrollEnable: (lastTouchEvent: TouchEvent, touchEvent: TouchEvent|null) => boolean;
  needSimulatedScrolling?: boolean;
}
let TouchMoveCapture;
export function mountTouchListener(el: HTMLElement, config: TouchMoveListenerConfig) {
  let isScroll = false;
  let isTouchIn = false;
  let scrollStopCheckTimer = -1;
  let lastScrollTime = 0;
  let lastTouchEvent: TouchEvent | null = null;
  const lastPosition = config.recordPosition;
  const scrollOverTimeCheck = () => {
    if (isScroll && !isTouchIn) {
      config?.onEndSliding?.();
      isScroll = false;
    }
  };
  el.addEventListener('scroll', () => {
    scrollStopCheckTimer = scrollDeal(
      el,
      isTouchIn,
      isScroll,
      scrollStopCheckTimer,
      scrollOverTimeCheck,
      lastPosition,
      config?.onBeginDrag,
      config?.onScroll,
    );
    isScroll = true;
    lastScrollTime = Date.now();
  });
  el.addEventListener('touchstart', (event) => {
    isTouchIn = true;
    lastTouchEvent = event;
  });
  el.addEventListener('touchmove', (event) => {
    if (TouchMoveCapture && TouchMoveCapture !== el) {
      return;
    }
    const isEnableScroll = config.scrollEnable(lastTouchEvent!, event);
    if (isEnableScroll
      && config.needSimulatedScrolling) {
      touchMoveDeal(el, event, lastTouchEvent!, lastPosition, config?.onTouchMove);
    }

    if (isEnableScroll) {
      TouchMoveCapture = el;
      lastTouchEvent = event;
    }
  });
  el.addEventListener('touchcancel', () => {
    TouchMoveCapture = null;
    touchEndDeal(el, isTouchIn, isScroll, config.scrollEnable(lastTouchEvent!, null), lastPosition);
    isTouchIn = false;
  });
  el.addEventListener('touchend', () => {
    TouchMoveCapture = null;
    touchEndDeal(
      el,
      isTouchIn,
      isScroll,
      config.scrollEnable(lastTouchEvent!, null),
      lastPosition,
      config?.onEndDrag,
      config?.onBeginSliding,
    );
    isTouchIn = false;
  });
}
function scrollDeal(
  el: HTMLElement,
  isTouchIn: boolean,
  isScroll: boolean,
  scrollStopCheckTimer: number,
  timeCheck: Function,
  position: Array<number>,
  beginDragCallBack?: (position: Array<number>) => void,
  scrollCallBack?: () => void,
) {
  clearTimeout(scrollStopCheckTimer);
  if (!isScroll && isTouchIn) {
    beginDragCallBack?.(position);
  }
  scrollCallBack?.();

  return setTimeout(timeCheck, TIME_CHECK_LONG);
}
function touchEndDeal(
  el: HTMLElement,
  isTouchIn: boolean,
  isScroll: boolean,
  enableScroll: boolean,
  lastPosition: Array<number>,
  endDragCallBack?: (lastPosition: Array<number>) => void,
  slidingBeginCallBack?: () => void,
) {
  if (isTouchIn) {
    if (enableScroll) {
      endDragCallBack?.(lastPosition);
    }
    if (isScroll && enableScroll) {
      slidingBeginCallBack?.();
    }
  }
}
function touchMoveDeal(
  el: HTMLElement,
  event: TouchEvent,
  lastEvent: TouchEvent,
  lastPosition: Array<number>,
  touchMoveCallBack?: (touch: Touch, lastTouch: Touch) => void,
) {
  const currentTouch = event.changedTouches[0];
  const lastTouch = lastEvent.changedTouches[0];

  const maxHValue = 0;
  const minHValue = el.clientWidth - el.scrollWidth;

  const maxVValue = 0;
  const minVValue = el.clientHeight - el.scrollHeight;
  const tempOriginPosition = [lastPosition[0], lastPosition[1]];
  if (
    Math.abs(tempOriginPosition[0] - (lastPosition[0] + currentTouch.pageX - lastTouch.pageX))
      < 0.6
    && Math.abs(tempOriginPosition[1] - (lastPosition[1] + currentTouch.pageY - lastTouch.pageY)) < 0.6
  ) {
    return;
  }

  lastPosition[0] += currentTouch.pageX - lastTouch.pageX;
  lastPosition[1] += currentTouch.pageY - lastTouch.pageY;
  if (lastPosition[0] > maxHValue) {
    lastPosition[0] = maxHValue;
  }
  if (lastPosition[0] < minHValue) {
    lastPosition[0] = minHValue;
  }
  if (lastPosition[1] > maxVValue) {
    lastPosition[1] = maxVValue;
  }
  if (lastPosition[1] < minVValue) {
    lastPosition[1] = minVValue;
  }
  updateTransform(el, lastPosition);
  touchMoveCallBack?.(currentTouch, lastTouch);
}
export function touchMoveCalculate(event: TouchEvent, lastEvent: TouchEvent) {
  const currentTouch = event.changedTouches[0];
  const lastTouch = lastEvent.changedTouches[0];
  const position = [0, 0];
  position[0] += currentTouch.pageX - lastTouch.pageX;
  position[1] += currentTouch.pageY - lastTouch.pageY;
  return position;
}
export function scrollToIntegerSize(
  scrollContainer: HTMLElement,
  lastPosition: Array<number>,
  animationTime = 100,
) {
  const pageWidth = scrollContainer.clientWidth;
  const innerWidth = scrollContainer.scrollWidth;
  const currentScrollSize = lastPosition[0];
  const pageIndex = Math.round(currentScrollSize / pageWidth);
  const minValue = scrollContainer.clientWidth - innerWidth;
  const maxPageIndex = Math.ceil(innerWidth / pageWidth);
  let lastPageWidth = innerWidth - parseInt(String(innerWidth / pageWidth)) * pageWidth;
  lastPageWidth = lastPageWidth !== 0 ? lastPageWidth : pageWidth;
  const isOverLastPageHalf = Math.abs(currentScrollSize) + pageWidth > (maxPageIndex - 1)
    * pageWidth + lastPageWidth / 2;
  const originOffsetX = lastPosition[0];
  lastPosition[0] = pageIndex * pageWidth;
  if (lastPosition[0] < minValue || currentScrollSize === minValue || isOverLastPageHalf) {
    lastPosition[0] = minValue;
  }
  scrollTo(scrollContainer, lastPosition, animationTime);
  return {
    newPageIndex: Math.abs(Math.round(lastPosition[0] / pageWidth)),
    fromOffsetX: originOffsetX,
    toOffsetX: lastPosition[0],
  };
}
export function scrollTo(
  scrollContainer: HTMLElement,
  position: Array<number>,
  animationTime = 100,
) {
  setElementStyle(scrollContainer, {
    transition: `transform ${animationTime / 1000}s`,
  });
  setTimeout(() => {
    updateTransform(scrollContainer, position);
  }, 16);
  setTimeout(() => {
    clearTransition(scrollContainer);
  }, animationTime + 16);
}

export function clearTransition(el: HTMLElement) {
  setElementStyle(el, {
    transition: '',
  });
}
export function updateTransform(el: HTMLElement, position: Array<number>) {
  setElementStyle(el, {
    transform: `translate(${position[0]}px,${position[1]}px)`,
  });
}
export function eventThrottle(lastExecuteTime: number, throttle: number, action: Function) {
  const timeStamp = 1 / throttle;
  const overThreshold = Date.now() - lastExecuteTime > timeStamp;
  if (overThreshold) {
    action?.();
  }
  return overThreshold;
}
