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

import { setElementStyle } from '../../common';
import { mountTouchListener } from '../scrollable';
import { EVENT_NODE_WILL_INSERT, HIPPY_COMPONENT_METHOD, NodeProps } from '../../module/node-def';
import { HippyViewPagerProps, initProps } from './process';
export { ViewPagerProps } from './process';
enum SCROLL_STATE {
  IDLE = 'idle',
  DRAG = 'dragging',
  SETTLING = 'settling',
}
interface PageScrollEvent {
  position: number;
  offset: number;
}
const ANIMATION_TIME = 200;
export function createHippyViewPager() {
  const viewPagerElement = document.createElement('div');
  const commonStyle = {
    style: {
      display: 'flex',
      flexDirection: 'row',
      overflowX: 'visible',
      overflowY: 'visible',
      maxHeight: '100%',
    },
  };
  const lastPosition = [0, 0];
  const updateInfo = (newPosition: Array<number>, newIndex: number) => {
    currentPageIndex = newIndex;
    lastPosition[0] = newPosition[0];
    lastPosition[1] = newPosition[1];
  };
  const setPage = (paramList: Array<any>, needAnimation: boolean) => {
    if (!paramList) {
      return;
    }
    const scrollResult = nativeViewPageScroll(
      viewPagerElement,
      currentPageIndex,
      paramList[0],
      needAnimation,
    );
    updateInfo(scrollResult.newPosition, scrollResult.newIndex);
  };
  let currentPageIndex = 0;
  let scrollableCache = false;
  setElementStyle(viewPagerElement, commonStyle.style);
  viewPagerElement[HippyViewPagerProps] = {};
  viewPagerElement[HIPPY_COMPONENT_METHOD] = {};
  initProps(viewPagerElement);
  mountTouchListener(viewPagerElement, {
    recordPosition: lastPosition,
    needSimulatedScrolling: true,
    scrollEnable: () => true,
    onScroll: (el: HTMLElement) => {
      updateInfo(scrollEventPreProcess(el).position, currentPageIndex);
      handleScroll(el, currentPageIndex, lastPosition);
    },
    onBeginDrag: () => {
      handleScrollStateChange(viewPagerElement, SCROLL_STATE.DRAG);
    },
    onEndDrag: (el: HTMLElement, position: Array<number>) => {
      scrollableCache = false;
      handleScrollStateChange(el, SCROLL_STATE.SETTLING);
      currentPageIndex = handleEndDrag(el, currentPageIndex, position);
    },
  });
  viewPagerElement[HIPPY_COMPONENT_METHOD][NodeProps.SET_PAGE] = (
    _callBackId: number,
    paramList: Array<any>,
  ) => setPage(paramList, true);

  viewPagerElement[HIPPY_COMPONENT_METHOD][NodeProps.SET_PAGE_WITHOUT_ANIMATION] = (
    _callBackId: number,
    paramList: Array<any>,
  ) => setPage(paramList, false);

  return viewPagerElement;
}
export function createHippyViewPagerItem() {
  const viewPagerItemElement = document.createElement('div');
  const commonStyle = { style: { flexShrink: 0, display: 'flex' } };
  setElementStyle(viewPagerItemElement, commonStyle.style);
  viewPagerItemElement[NodeProps.HIPPY_VIEW_PAGER_ITEM_PROPS] = {};
  viewPagerItemElement[EVENT_NODE_WILL_INSERT] = (parentElement: HTMLElement) => {
    if (parentElement[HippyViewPagerProps][NodeProps.DIRECTION] === 'vertical') {
      setElementStyle(viewPagerItemElement, { height: `${parentElement.clientHeight}px` });
    } else {
      setElementStyle(viewPagerItemElement, { width: `${parentElement.clientWidth}px` });
    }
  };
  return viewPagerItemElement;
}
function scrollEventPreProcess(scrollContainer: HTMLElement) {
  const xScroll = scrollContainer.scrollLeft;
  const yScroll = scrollContainer.scrollTop;
  return {
    position: [xScroll, yScroll],
  };
}
function scrollToIntegerSize(
  scrollContainer: HTMLElement,
  lastPosition: Array<number>,
  _animationTime = 100,
) {
  const xScroll = Number(scrollContainer.scrollLeft.toFixed(2));
  const yScroll = Number(scrollContainer.scrollTop.toFixed(2));
  const scrollVertical = scrollContainer[HippyViewPagerProps][NodeProps.DIRECTION] === 'vertical';
  let pageUnitSize = scrollContainer.clientWidth;
  let scrollSize = scrollContainer.scrollWidth;
  let originOffset = lastPosition[0];
  let currentScrollSize = xScroll;
  if (scrollVertical) {
    pageUnitSize = scrollContainer.clientHeight;
    scrollSize = scrollContainer.scrollHeight;
    originOffset = lastPosition[1];
    currentScrollSize = yScroll;
  }
  const result = scrollCalculate(pageUnitSize, scrollSize, originOffset, currentScrollSize);
  if (scrollVertical) {
    lastPosition[1] = result.toOffset;
  } else {
    lastPosition[0] = result.toOffset;
  }
  return result;
}

function scrollCalculate(pageUnitSize, scrollSize, originOffset, currentScrollSize) {
  const pageIndex = Math.round(currentScrollSize / pageUnitSize);
  const maxValue = scrollSize - pageUnitSize;
  const maxPageIndex = Math.ceil(scrollSize / pageUnitSize);
  const lastPageSize = scrollSize - parseInt(String(scrollSize / pageUnitSize)) * pageUnitSize;
  const isOverLastPageHalf =    Math.abs(currentScrollSize) + pageUnitSize
    > (maxPageIndex - 1) * pageUnitSize + lastPageSize / 2;
  let newScrollSize = pageIndex * pageUnitSize;
  if (newScrollSize > maxValue || currentScrollSize === maxValue || isOverLastPageHalf) {
    newScrollSize = maxValue;
  }
  return {
    newPageIndex: Math.abs(Math.round(newScrollSize / pageUnitSize)),
    fromOffset: originOffset,
    toOffset: newScrollSize,
  };
}
function handleScroll(el: HTMLElement, pageIndex: number, position: Array<number>) {
  el[HippyViewPagerProps][NodeProps.ON_PAGE_SCROLL]?.(buildPageScrollEvent(el.clientWidth, pageIndex, position));
}
function handleScrollStateChange(el: HTMLElement, state: SCROLL_STATE) {
  el[HippyViewPagerProps][NodeProps.ON_PAGE_SCROLL_STATE_CHANGED]?.(buildPageScrollStateChangeEvent(state));
}
function handleEndDrag(el: HTMLElement, pageIndex: number, position: Array<number>): number {
  const tmpOriginPosition = [position[0], position[1]];
  const scrollResult = scrollToIntegerSize(el, position, ANIMATION_TIME);

  const endWait = buildSmoothScrollEvent(
    el,
    ANIMATION_TIME,
    pageIndex,
    tmpOriginPosition,
    scrollResult.fromOffset,
    scrollResult.toOffset,
  );
  endWait
    .then((lastMoveOffset: number) => {
      if (lastMoveOffset !== scrollResult.toOffset) {
        el.scrollTo(parseInt(String(scrollResult.toOffset), 10), 0);
        el[HippyViewPagerProps][NodeProps.ON_PAGE_SCROLL]?.(buildPageScrollEvent(
          el.clientWidth,
          scrollResult.newPageIndex, [
            scrollResult.toOffset,
            0,
          ],
        ));
      }
      // eslint-disable-next-line max-len
      el[HippyViewPagerProps][NodeProps.ON_PAGE_SCROLL_STATE_CHANGED]?.(buildPageScrollStateChangeEvent(SCROLL_STATE.IDLE));
      if (pageIndex !== scrollResult.newPageIndex) {
        el[HippyViewPagerProps][NodeProps.ON_PAGE_SELECTED]?.(buildPageSelectEvent(scrollResult.newPageIndex));
      }
    })
    .catch(() => {
    });
  return scrollResult.newPageIndex;
}
function buildPageScrollStateChangeEvent(state: SCROLL_STATE) {
  return { pageScrollState: state };
}
async function buildSmoothScrollEvent(
  el: HTMLElement,
  time: number,
  pageIndex: number,
  position: Array<number>,
  fromOffset: number,
  toOffset: number,
) {
  return new Promise((resolve: (value: number) => void) => {
    if (time <= 0) {
      time = 1;
    }
    const moveDistance = fromOffset - toOffset;
    const beginTime = Date.now();
    let recordMoveOffset = 0;
    const scrollCallback = () => {
      const overTime = Date.now() - beginTime;
      if (overTime > time) {
        resolve(recordMoveOffset);
        return;
      }
      window.requestAnimationFrame(scrollCallback);
      const realOffset = moveDistance * (overTime / time);
      const tmpPosition = [position[0] - realOffset, position[1]];
      recordMoveOffset = tmpPosition[0];
      el.scrollTo(parseInt(String(tmpPosition[0]), 10), parseInt(String(tmpPosition[1]), 10));
      el[HippyViewPagerProps][NodeProps.ON_PAGE_SCROLL]?.(buildPageScrollEvent(el.clientWidth, pageIndex, tmpPosition));
    };
    window.requestAnimationFrame(scrollCallback);
  });
}
function buildPageScrollEvent(
  pageWidth: number,
  position: number,
  lastScroll: Array<number>,
): PageScrollEvent {
  const tmpIndex = parseInt(String(Math.abs(lastScroll[0]) / pageWidth));
  const offsetX = (Math.abs(lastScroll[0]) % pageWidth) / pageWidth;
  let newPosition = position;
  if (tmpIndex < position) {
    newPosition -= 1;
  }
  return {
    offset: Number(offsetX.toFixed(3)),
    position: newPosition,
  };
}
function buildPageSelectEvent(position: number) {
  return { position };
}
function nativeViewPageScroll(
  el: HTMLElement,
  fromIndex: number,
  toIndex: number,
  needAnimation: boolean,
) {
  const pageWidth = el.clientWidth;
  const tmpOriginPosition = [fromIndex * pageWidth, 0];
  const toPosition = [toIndex * pageWidth, 0];
  // eslint-disable-next-line max-len
  el[HippyViewPagerProps][NodeProps.ON_PAGE_SCROLL_STATE_CHANGED]?.(buildPageScrollStateChangeEvent(SCROLL_STATE.SETTLING));
  buildSmoothScrollEvent(
    el,
    needAnimation ? ANIMATION_TIME : 0,
    fromIndex,
    tmpOriginPosition,
    tmpOriginPosition[0],
    toPosition[0],
  ).then((lastMoveOffset: number) => {
    if (lastMoveOffset !== toPosition[0]) {
      el.scrollTo(toPosition[0], 0);
      el[HippyViewPagerProps][NodeProps.ON_PAGE_SCROLL]?.(buildPageScrollEvent(el.clientWidth, toIndex, toPosition));
    }
  });
  setTimeout(() => {
    el[HippyViewPagerProps][NodeProps.ON_PAGE_SCROLL]?.(buildPageScrollEvent(el.clientWidth, toIndex, toPosition));
    // eslint-disable-next-line max-len
    el[HippyViewPagerProps][NodeProps.ON_PAGE_SCROLL_STATE_CHANGED]?.(buildPageScrollStateChangeEvent(SCROLL_STATE.IDLE));
    if (fromIndex !== toIndex) {
      el[HippyViewPagerProps][NodeProps.ON_PAGE_SELECTED]?.(buildPageSelectEvent(toIndex));
    }
  }, ANIMATION_TIME);
  return { newPosition: toPosition, newIndex: toIndex };
}
