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
  EVENT_CHILD_NODE_WILL_INSERT,
  EVENT_CHILD_NODE_WILL_REMOVE,
  EVENT_NODE_WILL_REMOVE,
  NodeProps,
  NodeTag,
  ORIGIN_TYPE,
} from '../../module/node-def';
import {
  eventThrottle,
  GESTURE_CAPTURE_THRESHOLD,
  mountTouchListener,
  touchMoveCalculate,
} from '../scrollable';
import { HippyListViewProps, initProps } from './process';

export * from './process';
export function createHippyListItemView() {
  const listItemElement = document.createElement('div');
  listItemElement[ORIGIN_TYPE] = NodeTag.LIST_ITEM;
  return listItemElement;
}
export function createHippyListView(): HTMLElement {
  const listElement = document.createElement('div');
  const lastPosition = [0, 0];
  const rootElement = getRootElement();
  let lastScrollTime = 0;
  let scrollableCache = false;

  initProps(listElement);
  initIntersectionObserver(listElement, rootElement, () => !lastScrollTime);
  mountTouchListener(listElement, {
    recordPosition: lastPosition,
    needSimulatedScrolling: false,
    scrollEnable: (lastTouchEvent: TouchEvent, touchEvent: TouchEvent|null) => {
      if (!touchEvent) {
        // TODO  Implicit，on touchCancel Event and touchEnd Event
        return scrollableCache;
      }

      if (scrollableCache && touchEvent) {
        touchEvent.stopPropagation();
        return scrollableCache;
      }

      const moveDistance = touchMoveCalculate(touchEvent, lastTouchEvent);
      if (Math.abs(moveDistance[1]) > GESTURE_CAPTURE_THRESHOLD) {
        scrollableCache = true;
        touchEvent.stopPropagation();
      }
      return scrollableCache;
    },
    onBeginDrag: handleBeginDrag,
    onEndDrag: (el: HTMLElement) => {
      scrollableCache = false;
      handleEndDrag(el);
    },
    onScroll: (el: HTMLElement) => {
      if (handleScroll(el, lastScrollTime)) (lastScrollTime = Date.now());
    },
    onBeginSliding: handleBeginSliding,
    onEndSliding: handleEndSliding,
  });
  return listElement;
}
function getRootElement() {
  return document.getElementsByTagName('body')[0];
}
function initIntersectionObserver(
  container: HTMLElement,
  root: HTMLElement,
  isFirstMount: () => boolean,
) {
  webInitIO(container, root, isFirstMount);
}
function webInitIO(container: HTMLElement, root: HTMLElement, isFirstMount: () => boolean) {
  const io = buildChildIntersectionObserver(container, (entries) => {
    handleWebIOChange(container, entries, isFirstMount);
  });
  const selfIo = buildChildIntersectionObserver(root, (entries) => {
    const uniqueEntryList = filterDuplicateEntry(entries);
    if (uniqueEntryList[0]?.intersectionRatio <= 0
      && uniqueEntryList[0].target.getRootNode() !== document) {
      io.disconnect();
    }
  });
  selfIo.observe(container);
  container[EVENT_CHILD_NODE_WILL_INSERT] = (child: HTMLElement, sortIndex: number) => {
    io.observe(child);
    if (
      sortIndex >= container[HippyListViewProps][NodeProps.INITIAL_LIST_SIZE] - 1
      && isFirstMount()
    ) {
      setTimeout(() => {
        handleInitialListReady(container);
      }, 32);
    }
  };
  container[EVENT_CHILD_NODE_WILL_REMOVE] = (child: HTMLElement) => {
    io.unobserve(child);
  };
  container[EVENT_NODE_WILL_REMOVE] = () => {
    io.disconnect();
  };
}
function buildChildIntersectionObserver(
  parentElement: Element,
  callBack: (entries: Array<IntersectionObserverEntry>) => void,
) {
  return new IntersectionObserver(callBack, {
    root: parentElement,
    threshold: 0,
  });
}
function handleWebIOChange(
  container: HTMLElement,
  entries: Array<IntersectionObserverEntry>,
  isMounting: () => boolean,
) {
  const childNodes = Array.from(container.childNodes);
  const uniqueEntryList = filterDuplicateEntry(entries);
  uniqueEntryList.forEach((entry) => {
    // TODO element's index maybe have a performance problem
    const childIndex =      childNodes.findIndex(value => value === entry.target) ?? -1;
    let isChildVisible = true;
    if (entry.intersectionRatio <= 0 && isMounting()) {
      return;
    }
    if (entry.intersectionRatio <= 0 && !isMounting()) {
      isChildVisible = false;
    }
    handleListItemVisibleChange(container, childIndex, isChildVisible, childNodes.length);
  });
}
function handleListItemVisibleChange(
  container: HTMLElement,
  sortIndex: number,
  isVisible: boolean,
  brotherElementSize: number,
) {
  if (isVisible) {
    container[HippyListViewProps][NodeProps.ON_APPEAR]?.(sortIndex);
    handleEndReached(container, sortIndex, brotherElementSize);
  }
  if (!isVisible) {
    container[HippyListViewProps][NodeProps.ON_DISAPPEAR]?.(sortIndex);
  }
}
function filterDuplicateEntry(entries: Array<IntersectionObserverEntry>) {
  const entryDic: { [key: string]: IntersectionObserverEntry } = {};
  entries.forEach((entry) => {
    const entryId = entry.target.id;
    if (!entryDic[entryId] || entryDic[entryId].time < entry.time) {
      entryDic[entryId] = entry;
    }
  });
  // TODO ios 9.x not support the api
  return Object.values(entryDic);
}
function handleInitialListReady(el: HTMLElement) {
  el[HippyListViewProps][NodeProps.INITIAL_LIST_READY]?.({});
}
function handleEndReached(el: HTMLElement, index: number, childLength: number) {
  if (
    (el[HippyListViewProps][NodeProps.PRELOAD_ITEM_NUMBER]
      && index >= childLength - el[HippyListViewProps][NodeProps.PRELOAD_ITEM_NUMBER])
    || index === childLength - 1
  ) {
    el[HippyListViewProps][NodeProps.ON_END_REACHED]?.();
    el[HippyListViewProps][NodeProps.ON_LOAD_MORE]?.();
  }
}
function handleBeginDrag(el: HTMLElement) {
  el[HippyListViewProps][NodeProps.ON_SCROLL_BEGIN_DRAG]?.(buildEvent(el));
}
function handleEndDrag(el: HTMLElement) {
  el[HippyListViewProps][NodeProps.ON_SCROLL_END_DRAG]?.(buildEvent(el));
}
function handleScroll(el: HTMLElement, lastScrollTime: number) {
  return eventThrottle(
    lastScrollTime,
    el[HippyListViewProps][NodeProps.SCROLL_EVENT_THROTTLE],
    () => {
      el[HippyListViewProps][NodeProps.ON_SCROLL]?.(buildEvent(el));
    },
  );
}
function handleBeginSliding(el: HTMLElement) {
  el[HippyListViewProps][NodeProps.ON_MOMENTUM_SCROLL_BEGIN]?.(buildEvent(el));
}
function handleEndSliding(el: HTMLElement) {
  el[HippyListViewProps][NodeProps.ON_MOMENTUM_SCROLL_END]?.(buildEvent(el));
}
function buildEvent(el: HTMLElement) {
  return { contentOffset: { x: el.scrollLeft, y: el.scrollTop } };
}
