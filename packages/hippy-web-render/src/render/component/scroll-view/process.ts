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
  HIPPY_COMPONENT_METHOD,
  NodeProps,
  NodeTag,
  ORIGIN_TYPE,
} from '../../module/node-def';
import { buildCallBackProps, ProcessType, setElementStyle } from '../../common';
export const HScrollViewContainerStyle = 'contentContainerStyle';
export const HippyScrollViewProps = 'hippyScrollViewProps';

export const HippyScrollViewMethodScrollTo = 'scrollTo';
export const HippyScrollViewMethodScrollToWithDuration = 'scrollToWithDuration';
export const ScrollViewProps: ProcessType = {
  contentContainerStyle: containerStyleProcess,
  onMomentumScrollBegin: onMomentumScrollBeginProcess,
  onMomentumScrollEnd: onMomentumScrollEndProcess,
  onScroll: onScrollProcess,
  onScrollBeginDrag: onScrollBeginDragProcess,
  onScrollEndDrag: onScrollEndDragProcess,
  scrollEventThrottle: scrollEventThrottleProcess,
  scrollIndicatorInsets: scrollIndicatorInsetsProcess,
  pagingEnabled: pagingEnabledProcess,
  scrollEnabled: scrollEnabledProcess,
  showsHorizontalScrollIndicator: showsHorizontalScrollIndicatorProcess,
  showsVerticalScrollIndicator: showsVerticalScrollIndicatorProcess,
  horizontal: horizontalProcess,
};
export function initProps(el: HTMLElement) {
  el[HippyScrollViewProps][NodeProps.ON_SCROLL] = null;
  el[HippyScrollViewProps][NodeProps.ON_SCROLL_BEGIN_DRAG] = null;
  el[HippyScrollViewProps][NodeProps.ON_SCROLL_END_DRAG] = null;
  el[HippyScrollViewProps][NodeProps.PAGING_ENABLED] = false;
  el[HippyScrollViewProps][NodeProps.SCROLL_EVENT_THROTTLE] = 30;
  el[HippyScrollViewProps][NodeProps.ON_MOMENTUM_SCROLL_BEGIN] = null;
  el[HippyScrollViewProps][NodeProps.ON_MOMENTUM_SCROLL_END] = null;
  el[HippyScrollViewProps][NodeProps.SCROLL_ENABLED] = true;
  el[HippyScrollViewProps][NodeProps.HORIZONTAL] = false;
  el[HippyScrollViewProps][NodeProps.SHOW_HORIZONTAL_SCROLL_INDICATOR] = false;
  el[HippyScrollViewProps][NodeProps.SHOW_VERTICAL_SCROLL_INDICATOR] = false;
  // TODO implement api
  el[HIPPY_COMPONENT_METHOD][HippyScrollViewMethodScrollTo] = null;
  el[HIPPY_COMPONENT_METHOD][HippyScrollViewMethodScrollToWithDuration] = null;
}
function containerStyleProcess(el: HTMLElement, value: string | number | boolean) {
  if (el[ORIGIN_TYPE] === NodeTag.SCROLL_VIEW && el.childNodes?.length === 1) {
    setElementStyle(el.childNodes[0] as HTMLElement, value);
  }
}
function onMomentumScrollBeginProcess(
  el: HTMLElement,
  value: string | number | boolean,
  nodeId: number,
) {
  buildCallBackProps(el, !!value, HippyScrollViewProps, NodeProps.ON_MOMENTUM_SCROLL_BEGIN, nodeId);
}
function onMomentumScrollEndProcess(
  el: HTMLElement,
  value: string | number | boolean,
  nodeId: number,
) {
  buildCallBackProps(el, !!value, HippyScrollViewProps, NodeProps.ON_MOMENTUM_SCROLL_END, nodeId);
}
function onScrollProcess(el: HTMLElement, value: string | number | boolean, nodeId: number) {
  buildCallBackProps(el, !!value, HippyScrollViewProps, NodeProps.ON_SCROLL, nodeId);
}
function onScrollBeginDragProcess(
  el: HTMLElement,
  value: string | number | boolean,
  nodeId: number,
) {
  buildCallBackProps(el, !!value, HippyScrollViewProps, NodeProps.ON_SCROLL_BEGIN_DRAG, nodeId);
}
function onScrollEndDragProcess(el: HTMLElement, value: string | number | boolean, nodeId: number) {
  buildCallBackProps(el, !!value, HippyScrollViewProps, NodeProps.ON_SCROLL_END_DRAG, nodeId);
}
function scrollEventThrottleProcess(el: HTMLElement, value: string | number | boolean) {
  el[HippyScrollViewProps][NodeProps.SCROLL_EVENT_THROTTLE] = isNaN(parseInt(value as string))
    ? parseInt(value as string, 10)
    : 30;
}
function scrollIndicatorInsetsProcess(
  _el: HTMLElement,
  _value: string | number | boolean,
  _nodeId: number,
) {
  // TODO implement api
}
function pagingEnabledProcess(el: HTMLElement, value: string | number | boolean) {
  el[HippyScrollViewProps][NodeProps.PAGING_ENABLED] = !!value;
}
function scrollEnabledProcess(el: HTMLElement, value: string | number | boolean) {
  el[HippyScrollViewProps][NodeProps.SCROLL_ENABLED] = !!value;
  const scrollStyle = getScrollStyle(el[HippyScrollViewProps][NodeProps.HORIZONTAL]);
  if (!el[HippyScrollViewProps][NodeProps.SCROLL_ENABLED]) {
    scrollStyle.overflowX = 'hidden';
    scrollStyle.overflowY = 'hidden';
  }
  if (el[HippyScrollViewProps][NodeProps.PAGING_ENABLED]) {
    scrollStyle.overflowX = 'visible';
    scrollStyle.overflowY = 'visible';
  }
  setElementStyle(el, scrollStyle);
}
function horizontalProcess(el: HTMLElement, value: string | number | boolean) {
  el[HippyScrollViewProps][NodeProps.HORIZONTAL] = !!value;
  setElementStyle(el, getScrollStyle(el[HippyScrollViewProps][NodeProps.HORIZONTAL]));
}
function showsHorizontalScrollIndicatorProcess(el: HTMLElement, value: string | number | boolean) {
  el[HippyScrollViewProps][NodeProps.SHOW_HORIZONTAL_SCROLL_INDICATOR] = !!value;
}
function showsVerticalScrollIndicatorProcess(el: HTMLElement, value: string | number | boolean) {
  el[HippyScrollViewProps][NodeProps.SHOW_VERTICAL_SCROLL_INDICATOR] = !!value;
}
function getScrollStyle(horizontal: boolean) {
  const defaultStyle = {
    style: { display: 'flex', flexDirection: 'column', overflowX: 'hidden', overflowY: 'scroll' },
  };
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
