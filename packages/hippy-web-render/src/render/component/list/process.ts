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
import { buildCallBackProps, ProcessType } from '../../common';

export const HippyListViewProps = 'hippyListViewProps';

export const ListViewProps: ProcessType = {
  horizontal: horizontalProcess,
  initialListSize: initialListSizeProcess,
  initialContentOffset: initialContentOffsetProcess,
  bounces: bouncesProcess,
  overScrollEnabled: overScrollEnabledProcess,
  preloadItemNumber: preloadItemNumberProcess,
  onAppear: onAppearProcess,
  onDisappear: onDisappearProcess,
  onWillAppear: onWillAppearProcess,
  onWillDisappear: onWillDisappearProcess,
  onEndReached: onEndReachedProcess,
  onMomentumScrollBegin: onMomentumScrollBeginProcess,
  onMomentumScrollEnd: onMomentumScrollEndProcess,
  onScroll: onScrollProcess,
  onScrollBeginDrag: onScrollBeginDragProcess,
  onScrollEndDrag: onScrollEndDragProcess,
  rowShouldSticky: rowShouldStickyProcess,
  onHeaderPulling: onHeaderPullingProcess,
  onHeaderReleased: onHeaderReleasedProcess,
  scrollEventThrottle: scrollEventThrottleProcess,
  initialListReady: initialListReadyProcess,
  onLoadMore: onLoadMoreProcess,
};

export function initProps(el: HTMLElement) {
  el[HippyListViewProps] = {};
  el[HIPPY_COMPONENT_METHOD] = {};
  el[ORIGIN_TYPE] = NodeTag.LIST;
  el[HippyListViewProps][NodeProps.HORIZONTAL] = false;
  el[HippyListViewProps][NodeProps.INITIAL_LIST_SIZE] = 10;
  el[HippyListViewProps][NodeProps.INITIAL_LIST_READY] = null;

  el[HippyListViewProps][NodeProps.INITIAL_CONTENT_OFFSET] = null;
  el[HippyListViewProps][NodeProps.BOUNCES] = true;
  el[HippyListViewProps][NodeProps.OVER_SCROLL_ENABLED] = true;
  el[HippyListViewProps][NodeProps.PRELOAD_ITEM_NUMBER] = 1;
  el[HippyListViewProps][NodeProps.ON_APPEAR] = null;
  el[HippyListViewProps][NodeProps.ON_DISAPPEAR] = null;
  el[HippyListViewProps][NodeProps.ON_WILL_APPEAR] = null;
  el[HippyListViewProps][NodeProps.ON_WILL_DISAPPEAR] = null;
  el[HippyListViewProps][NodeProps.ON_END_REACHED] = null;
  el[HippyListViewProps][NodeProps.ON_MOMENTUM_SCROLL_BEGIN] = null;
  el[HippyListViewProps][NodeProps.ON_MOMENTUM_SCROLL_END] = null;
  el[HippyListViewProps][NodeProps.ON_SCROLL] = null;
  el[HippyListViewProps][NodeProps.ON_SCROLL_BEGIN_DRAG] = null;
  el[HippyListViewProps][NodeProps.ON_SCROLL_END_DRAG] = null;
  el[HippyListViewProps][NodeProps.ROW_SHOULD_STICKY] = null;
  el[HippyListViewProps][NodeProps.ON_HEADER_PULLING] = null;
  el[HippyListViewProps][NodeProps.ON_HEADER_RELEASED] = null;
  el[HippyListViewProps][NodeProps.SCROLL_EVENT_THROTTLE] = 30;
  el[HippyListViewProps][NodeProps.ON_LOAD_MORE] = null;

  // TODO implement api
  el[HIPPY_COMPONENT_METHOD][NodeProps.SCROLL_TO_CONTENT_OFFSET] = null;
  el[HIPPY_COMPONENT_METHOD][NodeProps.SCROLL_TO_INDEX] = null;
  el[HIPPY_COMPONENT_METHOD][NodeProps.COLLAPSE_PULL_HEADER] = null;
}
function horizontalProcess(_el: HTMLElement, _value: string | number | boolean) {
  // TODO hippy-native's ios platform not support the api
}
function initialListSizeProcess(el: HTMLElement, value: string | number | boolean) {
  el[HippyListViewProps][NodeProps.INITIAL_LIST_SIZE] = value !== undefined ? parseInt(value as string, 10) : 10;
}
function initialContentOffsetProcess(_el: HTMLElement, _value: string | number | boolean) {}
function initialListReadyProcess(
  el: HTMLElement,
  value: string | number | boolean,
  nodeId: number,
) {
  buildCallBackProps(el, !!value, HippyListViewProps, NodeProps.INITIAL_LIST_READY, nodeId);
}
function bouncesProcess(el: HTMLElement, value: string | number | boolean) {
  el[HippyListViewProps][NodeProps.BOUNCES] = !!value;
}
function overScrollEnabledProcess(el: HTMLElement, value: string | number | boolean) {
  el[HippyListViewProps][NodeProps.OVER_SCROLL_ENABLED] = !!value;
}
function preloadItemNumberProcess(el: HTMLElement, value: string | number | boolean) {
  el[HippyListViewProps][NodeProps.PRELOAD_ITEM_NUMBER] = isNaN(parseInt(value as string, 10))
    ? parseInt(value as string, 10)
    : 1;
}
function onAppearProcess(el: HTMLElement, value: string | number | boolean, nodeId: number) {
  buildCallBackProps(el, !!value, HippyListViewProps, NodeProps.ON_APPEAR, nodeId);
}
function onDisappearProcess(el: HTMLElement, value: string | number | boolean, nodeId: number) {
  buildCallBackProps(el, !!value, HippyListViewProps, NodeProps.ON_DISAPPEAR, nodeId);
}
function onWillAppearProcess(el: HTMLElement, value: string | number | boolean, nodeId: number) {
  buildCallBackProps(el, !!value, HippyListViewProps, NodeProps.ON_WILL_APPEAR, nodeId);
}
function onWillDisappearProcess(el: HTMLElement, value: string | number | boolean, nodeId: number) {
  buildCallBackProps(el, !!value, HippyListViewProps, NodeProps.ON_WILL_DISAPPEAR, nodeId);
}
function onEndReachedProcess(el: HTMLElement, value: string | number | boolean, nodeId: number) {
  buildCallBackProps(el, !!value, HippyListViewProps, NodeProps.ON_END_REACHED, nodeId);
}
function onLoadMoreProcess(el: HTMLElement, value: string | number | boolean, nodeId: number) {
  buildCallBackProps(el, !!value, HippyListViewProps, NodeProps.ON_LOAD_MORE, nodeId);
}
function onMomentumScrollBeginProcess(
  el: HTMLElement,
  value: string | number | boolean,
  nodeId: number,
) {
  buildCallBackProps(el, !!value, HippyListViewProps, NodeProps.ON_MOMENTUM_SCROLL_BEGIN, nodeId);
}
function onMomentumScrollEndProcess(
  el: HTMLElement,
  value: string | number | boolean,
  nodeId: number,
) {
  buildCallBackProps(el, !!value, HippyListViewProps, NodeProps.ON_MOMENTUM_SCROLL_END, nodeId);
}
function onScrollProcess(el: HTMLElement, value: string | number | boolean, nodeId: number) {
  buildCallBackProps(el, !!value, HippyListViewProps, NodeProps.ON_SCROLL, nodeId);
}
function onScrollBeginDragProcess(
  el: HTMLElement,
  value: string | number | boolean,
  nodeId: number,
) {
  buildCallBackProps(el, !!value, HippyListViewProps, NodeProps.ON_SCROLL_BEGIN_DRAG, nodeId);
}
function onScrollEndDragProcess(el: HTMLElement, value: string | number | boolean, nodeId: number) {
  buildCallBackProps(el, !!value, HippyListViewProps, NodeProps.ON_SCROLL_END_DRAG, nodeId);
}
function rowShouldStickyProcess(el: HTMLElement, value: string | number | boolean, nodeId: number) {
  buildCallBackProps(el, !!value, HippyListViewProps, NodeProps.ROW_SHOULD_STICKY, nodeId);
}
function onHeaderPullingProcess(el: HTMLElement, value: string | number | boolean, nodeId: number) {
  buildCallBackProps(el, !!value, HippyListViewProps, NodeProps.ON_HEADER_PULLING, nodeId);
}
function onHeaderReleasedProcess(
  el: HTMLElement,
  value: string | number | boolean,
  nodeId: number,
) {
  buildCallBackProps(el, !!value, HippyListViewProps, NodeProps.ON_HEADER_RELEASED, nodeId);
}
function scrollEventThrottleProcess(el: HTMLElement, value: string | number | boolean, nodeId: number) {
  el[HippyListViewProps][NodeProps.SCROLL_EVENT_THROTTLE] = isNaN(parseInt(value as string, 10))
    ? parseInt(value as string, 10)
    : 30;
}
