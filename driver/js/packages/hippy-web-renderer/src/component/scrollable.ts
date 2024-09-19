/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29  Limited, a Tencent company.
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
  onBeginDrag?: (position: [number, number]) => void;
  onEndDrag?: (position: [number, number]) => Promise<void>;
  onScroll?: () => void;
  onBeginSliding?: () => void;
  onEndSliding?: () => void;
  onTouchMove?: (event: Touch, lastEvent: Touch) => void;
  getPosition: () => [number, number];
  updatePosition: (newPosition: [number, number]) => void;
  scrollEnable: (lastTouchEvent: TouchEvent, touchEvent?: TouchEvent) => boolean;
  needSimulatedScrolling?: boolean;
}
let touchMoveCaptureElement;
export function mountTouchListener(el: HTMLElement, config: TouchMoveListenerConfig) {
  let isScroll = false;
  let isTouchIn = false;
  let scrollStopCheckTimer = -1;
  let lastTouchEvent: TouchEvent | null = null;
  const closeScrollState = () => {
    isScroll = false;
  };
  const scrollOverTimeCheck = () => {
    if (isScroll && !isTouchIn) {
      config?.onEndSliding?.();
      closeScrollState();
    }
  };
  const handleScroll = () => {
    scrollStopCheckTimer = scrollDeal(
      el,
      isTouchIn,
      isScroll,
      scrollStopCheckTimer,
      scrollOverTimeCheck,
      config.getPosition(),
      config?.onBeginDrag,
      config?.onScroll,
    );
    isScroll = true;
  };
  const handleTouchStart = (event) => {
    isTouchIn = true;
    lastTouchEvent = event;
  };
  const  handleTouchMove = (event) => {
    if (touchMoveCaptureElement && touchMoveCaptureElement !== el) {
      return;
    }
    const isEnableScroll = config.scrollEnable(lastTouchEvent!, event);
    if (isEnableScroll && config.needSimulatedScrolling) {
      const newPosition = touchMoveDeal(el, event, lastTouchEvent!, config.getPosition(), config?.onTouchMove);
      config.updatePosition(newPosition);
      if (!isScroll) {
        isScroll = true;
        config.onBeginDrag?.(newPosition);
      }
    }

    if (isEnableScroll) {
      event.stopPropagation();
      touchMoveCaptureElement = el;
      lastTouchEvent = event;
    }
  };
  const handleTouchCancel = () => {
    touchMoveCaptureElement = null;
    touchEndDeal(el, isTouchIn, isScroll, config.scrollEnable(lastTouchEvent!), config.getPosition());
    isTouchIn = false;
    config.needSimulatedScrolling && closeScrollState();
  };
  const handleTouchEnd = () => {
    touchMoveCaptureElement = null;
    touchEndDeal(
      el,
      isTouchIn,
      isScroll,
      config.scrollEnable(lastTouchEvent!),
      config.getPosition(),
      config?.onEndDrag,
      config?.onBeginSliding,
    );
    isTouchIn = false;
    config.needSimulatedScrolling && closeScrollState();
  };

  el.addEventListener('scroll', handleScroll);
  el.addEventListener('touchstart', handleTouchStart);
  el.addEventListener('touchmove', handleTouchMove);
  el.addEventListener('touchcancel', handleTouchCancel);
  el.addEventListener('touchend', handleTouchEnd);

  return () => {
    el.removeEventListener('scroll', handleScroll);
    el.removeEventListener('touchstart', handleTouchStart);
    el.removeEventListener('touchmove', handleTouchMove);
    el.removeEventListener('touchcancel', handleTouchCancel);
    el.removeEventListener('touchend', handleTouchEnd);
  };
}

function scrollDeal(
  el: HTMLElement,
  isTouchIn: boolean,
  isScroll: boolean,
  scrollStopCheckTimer: number,
  timeCheck: Function,
  position: [number, number],
  beginDragCallBack?: (position: [number, number]) => void,
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
  lastPosition: [number, number],
  endDragCallBack?: (lastPosition: [number, number]) => void,
  slidingBeginCallBack?: () => void,
) {
  if (isTouchIn && enableScroll) {
    endDragCallBack?.(lastPosition);
  }
  if (isTouchIn && isScroll && enableScroll) {
    slidingBeginCallBack?.();
  }
}

function touchMoveDeal(
  el: HTMLElement,
  event: TouchEvent,
  lastEvent: TouchEvent,
  lastPosition: [number, number],
  touchMoveCallBack?: (touch: Touch, lastTouch: Touch,) => void,
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
    return lastPosition;
  }
  const newPosition: [number, number] = [...lastPosition];

  newPosition[0] += currentTouch.pageX - lastTouch.pageX;
  newPosition[1] += currentTouch.pageY - lastTouch.pageY;
  if (newPosition[0] > maxHValue) {
    newPosition[0] = maxHValue;
  }
  if (newPosition[0] < minHValue) {
    newPosition[0] = minHValue;
  }
  if (newPosition[1] > maxVValue) {
    newPosition[1] = maxVValue;
  }
  if (newPosition[1] < minVValue) {
    newPosition[1] = minVValue;
  }
  updateTransform(el, newPosition);
  touchMoveCallBack?.(currentTouch, lastTouch);
  return newPosition;
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
  const { scrollWidth } = scrollContainer;
  const currentScrollSize = lastPosition[0];
  const pageIndex = Math.round(currentScrollSize / pageWidth);
  const minValue = pageWidth - scrollWidth;
  const maxPageIndex = Math.ceil(scrollWidth / pageWidth);
  let lastPageWidth = scrollWidth - parseInt(String(scrollWidth / pageWidth), 10) * pageWidth;
  lastPageWidth = lastPageWidth !== 0 ? lastPageWidth : pageWidth;
  const isOverLastPageHalf = Math.abs(currentScrollSize) + pageWidth > (maxPageIndex - 1)
    * pageWidth + lastPageWidth / 2;
  const originOffsetX = lastPosition[0];
  const newPosition = [...lastPosition];
  newPosition[0] = pageIndex * pageWidth;
  if (newPosition[0] < minValue || currentScrollSize === minValue || isOverLastPageHalf) {
    newPosition[0] = minValue;
  }
  scrollTo(scrollContainer, newPosition, animationTime);
  return {
    newPageIndex: Math.abs(Math.round(newPosition[0] / pageWidth)),
    fromOffsetX: originOffsetX,
    toOffsetX: newPosition[0],
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
  const timeStamp = 1000 / throttle;
  const overThreshold = Date.now() - lastExecuteTime >= timeStamp;
  if (overThreshold) {
    action?.();
  }
  return overThreshold;
}

export function calculateScrollEndPagePosition(pageUnitSize: number, scrollSize: number, endScrollOffset: number) {
  const pageIndex = Math.round(endScrollOffset / pageUnitSize);
  const minValue = pageUnitSize - scrollSize;
  const maxPageIndex = Math.ceil(scrollSize / pageUnitSize);
  let lastPageWidth = scrollSize - parseInt(String(scrollSize / pageUnitSize), 10) * pageUnitSize;
  lastPageWidth = lastPageWidth !== 0 ? lastPageWidth : pageUnitSize;
  const isOverLastPageHalf = Math.abs(endScrollOffset) + pageUnitSize
    > (maxPageIndex - 1) * pageUnitSize + lastPageWidth / 2;
  let newPosition = pageIndex * pageUnitSize;
  if (newPosition < minValue || endScrollOffset === minValue || isOverLastPageHalf) {
    newPosition = minValue;
  }
  return {
    newPageIndex: Math.abs(Math.round(newPosition / pageUnitSize)),
    fromOffset: endScrollOffset,
    toOffset: newPosition,
  };
}

export function virtualScrollEventDispatchBegin(
  dom: HTMLDivElement,
  scrollCallBack: (position: [number, number], index?: number) => void,
  position: [number, number],
  toPosition: [number, number],
  pageIndex?: number,
  time?: number,
) {
  let animationTime = time;
  return new Promise((resolve) => {
    if (!time || time <= 0) {
      animationTime = 1;
    }
    const moveDistance = position[0] - toPosition[0];
    const beginTime = Date.now();
    let recordMoveOffset = [...position];

    scrollTo(dom,  [toPosition[0], 0], animationTime);
    const loop = () => {
      const overTime = Date.now() - beginTime;
      if (overTime > animationTime!) {
        resolve(recordMoveOffset[0]);
        return;
      }
      window.requestAnimationFrame(loop);
      const realOffset = moveDistance * (overTime / animationTime!);
      const tmpPosition: [number, number] = [position[0] - realOffset, position[1]];
      recordMoveOffset = tmpPosition;
      scrollCallBack(tmpPosition, pageIndex);
    };
    window.requestAnimationFrame(loop);
  });
}

export function virtualScrollEventDispatchEnd(
  dom: HTMLDivElement, scrollCallBack: (position: [number, number], index?: number) => void,
  scrollResult: Promise<any>, willToPosition: [number, number], willToIndex?: number,
) {
  return new Promise((resolve) => {
    scrollResult.then((lasMoveOffset: number) => {
      if (!dom) {
        return;
      }
      if (lasMoveOffset !== willToPosition[0]) {
        scrollTo(dom!,  willToPosition, 0);
      }
      scrollCallBack(willToPosition, willToIndex);
      resolve(null);
    }).catch((error) => {
      throw error;
    });
  });
}

export function virtualSmoothScroll(
  dom: HTMLDivElement,
  scrollCallBack: (position: [number, number], index?: number) => void,
  position: [number, number],
  toPosition: [number, number],
  time?: number,
  pageIndex?: number,
  toPageIndex?: number,
) {
  return virtualScrollEventDispatchEnd(
    dom, scrollCallBack,
    virtualScrollEventDispatchBegin(dom, scrollCallBack, position, toPosition, pageIndex, time),
    toPosition, toPageIndex,
  );
}
