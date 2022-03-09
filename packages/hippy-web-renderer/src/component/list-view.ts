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

import { BaseView, InnerNodeTag } from '../../types';
import { NodeProps } from '../types';
import { HippyView } from './hippy-view';
import {
  eventThrottle,
  GESTURE_CAPTURE_THRESHOLD,
  mountTouchListener,
  touchMoveCalculate,
} from './scrollable';

export class ListView extends HippyView<HTMLDivElement> {
  public static intersectionObserverElement(
    parentElement: Element,
    callBack: (entries: Array<IntersectionObserverEntry>) => void,
  ) {
    return new IntersectionObserver(callBack, {
      root: parentElement,
      threshold: 0,
    });
  }

  private lastPosition = [0, 0];
  private lastTimestamp = 0;
  private scrollableCache = false;
  private childIntersectionObserver;
  private selfIntersectionObserver;
  private rootElement;

  public constructor(context, id, pId) {
    super(context, id, pId);
    this.tagName = InnerNodeTag.LIST;
    this.dom = document.createElement('div');
    this.init();
  }


  public get root() {
    if (!this.rootElement) {
      this.rootElement = getRootElement();
    }
    return this.rootElement;
  }

  public defaultStyle() {
    return  { display: 'flex', flexDirection: 'column', flexShrink: 0, boxSizing: 'border-box' };
  }

  public get overScrollEnabled() {
    return this.props[NodeProps.OVER_SCROLL_ENABLED];
  }

  public set overScrollEnabled(value) {
    this.props[NodeProps.OVER_SCROLL_ENABLED] = value;
  }

  public get initialListSize() {
    return this.props[NodeProps.INITIAL_LIST_SIZE] ?? 10;
  }

  public set initialListSize(value: number) {
    this.props[NodeProps.INITIAL_LIST_SIZE] = value;
  }
  public get initialContentOffset() {
    return this.props[NodeProps.INITIAL_CONTENT_OFFSET];
  }

  public set initialContentOffset(value: number) {
    this.props[NodeProps.INITIAL_CONTENT_OFFSET] = value;
  }

  public get preloadItemNumber() {
    return this.props[NodeProps.OVER_SCROLL_ENABLED];
  }

  public set preloadItemNumber(value: number) {
    this.props[NodeProps.PRELOAD_ITEM_NUMBER] = value;
  }

  public get rowShouldSticky() {
    return this.props[NodeProps.ROW_SHOULD_STICKY];
  }

  public set rowShouldSticky(value) {
    this.props[NodeProps.ROW_SHOULD_STICKY] = value;
  }

  public get scrollEventThrottle() {
    return this.props[NodeProps.SCROLL_EVENT_THROTTLE];
  }

  public set scrollEventThrottle(value: number) {
    this.props[NodeProps.SCROLL_EVENT_THROTTLE] = value;
  }

  public get scrollEnabled() {
    return this.props[NodeProps.SCROLL_ENABLED];
  }

  public set scrollEnabled(value: boolean) {
    this.props[NodeProps.SCROLL_ENABLED] = value;
  }

  public get showScrollIndicator() {
    return this.props[NodeProps.SHOW_SCROLL_INDICATOR];
  }

  public set showScrollIndicator(value: boolean) {
    this.props[NodeProps.SHOW_SCROLL_INDICATOR] = value;
  }

  public get initialListReady() {
    return this.props[NodeProps.INITIAL_LIST_READY];
  }

  public set initialListReady(value: boolean) {
    this.props[NodeProps.INITIAL_LIST_READY] = value;
  }

  public callOnMomentumScrollBegin(event: { contentOffset: { x: number, y: number } }) {
    this.props[NodeProps.ON_MOMENTUM_SCROLL_BEGIN]
    && this.context.sendUiEvent(this.id, NodeProps.ON_MOMENTUM_SCROLL_BEGIN, event);
  }

  public callOnMomentumScrollEnd(event: { contentOffset: { x: number, y: number } }) {
    this.props[NodeProps.ON_MOMENTUM_SCROLL_END]
    && this.context.sendUiEvent(this.id, NodeProps.ON_MOMENTUM_SCROLL_END, event);
  }

  public callOnScroll(event: { contentOffset: { x: number, y: number } }) {
    this.props[NodeProps.ON_SCROLL]
    && this.context.sendUiEvent(this.id, NodeProps.ON_SCROLL, event);
  }

  public callOnScrollBeginDrag(event: { contentOffset: { x: number, y: number } }) {
    this.props[NodeProps.ON_SCROLL_BEGIN_DRAG]
    && this.context.sendUiEvent(this.id, NodeProps.ON_SCROLL_BEGIN_DRAG, event);
  }

  public callOnScrollEndDrag(event: { contentOffset: { x: number, y: number } }) {
    this.props[NodeProps.ON_SCROLL_END_DRAG]
    && this.context.sendUiEvent(this.id, NodeProps.ON_SCROLL_END_DRAG, event);
  }

  public callOnInitialListReady() {
    this.context.sendUiEvent(this.id, NodeProps.INITIAL_LIST_READY, null);
  }

  public callOnAppear(event) {
    this.props[NodeProps.ON_APPEAR]
    && this.context.sendUiEvent(this.id, NodeProps.ON_APPEAR, event);
  }

  public callOnDisappear(event) {
    this.props[NodeProps.ON_DISAPPEAR]
    && this.context.sendUiEvent(this.id, NodeProps.ON_DISAPPEAR, event);
  }

  public callOnWillAppear(event) {
    this.props[NodeProps.ON_WILL_APPEAR]
    && this.context.sendUiEvent(this.id, NodeProps.ON_WILL_APPEAR, event);
  }

  public callOnWillDisappear(event) {
    this.props[NodeProps.ON_WILL_DISAPPEAR]
    && this.context.sendUiEvent(this.id, NodeProps.ON_WILL_DISAPPEAR, event);
  }

  public callOnEndReached() {
    this.props[NodeProps.ON_END_REACHED]
    && this.context.sendUiEvent(this.id, NodeProps.ON_END_REACHED, null);
  }

  public scrollToContentOffset(xOffset: number, yOffset: number, animated: boolean) {
    // TODO to implement
  }

  public scrollToIndex(xIndex: number, yIndex: number, animated: boolean) {
    // TODO to implement
  }

  public async beforeChildMount(child: BaseView, childPosition: number): Promise<any> {
    await super.beforeChildMount(child, childPosition);
    if (child.dom) this.childIntersectionObserver.observe(child.dom);
    if (
      childPosition >= this.initialListSize - 1
      && this.isFirstMount()
    ) {
      setTimeout(() => {
        this.callOnInitialListReady();
      }, 16);
    }
  }

  public beforeChildRemove(child: BaseView): void {
    super.beforeChildRemove(child);
    if (child.dom) this.childIntersectionObserver.unobserve(child.dom);
  }

  public async beforeRemove(): Promise<any> {
    await super.beforeRemove();
    this.childIntersectionObserver.disconnect();
  }

  public destroy() {
    super.destroy();
    if (this.childIntersectionObserver) {
      this.childIntersectionObserver.disconnect();
    }
    if (this.selfIntersectionObserver) {
      this.selfIntersectionObserver.disconnect();
    }
  }

  private init() {
    this.props[NodeProps.OVER_SCROLL_ENABLED] = true;
    this.props[NodeProps.INITIAL_LIST_SIZE] = 10;
    this.props[NodeProps.INITIAL_LIST_READY] = true;
    this.props[NodeProps.PRELOAD_ITEM_NUMBER] = 1;
    this.props[NodeProps.SCROLL_EVENT_THROTTLE] = 30;
    this.webInitIO(this.root);
    mountTouchListener(this.dom!, {
      recordPosition: this.lastPosition,
      scrollEnable: this.checkScrollEnable.bind(this),
      onBeginDrag: this.handleBeginDrag.bind(this),
      onEndDrag: this.handleEndDrag.bind(this),
      onScroll: this.handleScroll.bind(this),
      onBeginSliding: this.handleBeginSliding.bind(this),
      onEndSliding: this.handleEndSliding.bind(this),

    });
  }

  private isFirstMount() {
    return !this.lastTimestamp;
  }

  private webInitIO(root: HTMLElement) {
    this.childIntersectionObserver = ListView.intersectionObserverElement(
      this.dom!,
      this.handleChildExposure.bind(this),
    );
    this.selfIntersectionObserver = ListView.intersectionObserverElement(root, this.handleSelfExposure.bind(this));
    this.selfIntersectionObserver.observe(this.dom!);
  }

  private checkScrollEnable(lastTouchEvent: TouchEvent, touchEvent: TouchEvent|null)  {
    if (!touchEvent) {
      // 隐式含义，在touchEnd/Cancel时的回调
      return this.scrollableCache;
    }

    if (this.scrollableCache && touchEvent) {
      touchEvent.stopPropagation();
      return this.scrollableCache;
    }

    const moveDistance = touchMoveCalculate(touchEvent, lastTouchEvent);
    if (Math.abs(moveDistance[1]) > GESTURE_CAPTURE_THRESHOLD) {
      this.scrollableCache = true;
      touchEvent.stopPropagation();
    }
    return this.scrollableCache;
  }

  private handleBeginDrag() {
    if (this.dom) {
      this.callOnScrollBeginDrag(buildScrollEvent(this.dom));
    }
  }

  private handleEndDrag() {
    this.scrollableCache = false;
    if (this.dom) {
      this.callOnScrollEndDrag(buildScrollEvent(this.dom));
    }
  }

  private handleScroll() {
    if (this.dom) {
      const isTrigger = eventThrottle(
        this.lastTimestamp,
        this.scrollEventThrottle,
        () => {
          this.callOnScroll(buildScrollEvent(this.dom!));
        },
      );
      if (isTrigger) {
        this.lastTimestamp = Date.now();
      }
    }
  }


  private handleBeginSliding() {
    if (this.dom) {
      this.callOnMomentumScrollBegin(buildScrollEvent(this.dom));
    }
  }
  private handleEndSliding() {
    if (this.dom) {
      this.callOnMomentumScrollEnd(buildScrollEvent(this.dom));
    }
  }

  private handleSelfExposure(entries: Array<IntersectionObserverEntry>) {
    const uniqueEntryList = this.filterDuplicateEntry(entries);
    if (uniqueEntryList[0]?.intersectionRatio <= 0
      && uniqueEntryList[0].target.getRootNode() !== document) {
      this.childIntersectionObserver.disconnect();
    }
  }

  private handleChildExposure(entries: Array<IntersectionObserverEntry>) {
    const childNodes = Array.from(this.dom!.childNodes);
    const uniqueEntryList = this.filterDuplicateEntry(entries);
    uniqueEntryList.forEach((entry) => {
      // TODO  findIndex() api maybe have a performance problem, when big data
      const childIndex = childNodes.findIndex(value => value === entry.target) ?? -1;
      let isChildVisible = true;
      if (entry.intersectionRatio <= 0 && this.isFirstMount()) {
        return;
      }
      if (entry.intersectionRatio <= 0 && !this.isFirstMount()) {
        isChildVisible = false;
      }
      this.childVisibleChange(childIndex, isChildVisible, childNodes.length);
    });
  }

  private childVisibleChange(
    sortIndex: number,
    isVisible: boolean,
    brotherElementSize: number,
  ) {
    if (isVisible) {
      this.callOnAppear(sortIndex);
      this.handleEndReached(sortIndex, brotherElementSize);
    }
    if (!isVisible) {
      this.callOnDisappear(sortIndex);
    }
  }

  private filterDuplicateEntry(entries: Array<IntersectionObserverEntry>) {
    const entryDic: { [key: string]: IntersectionObserverEntry } = {};
    entries.forEach((entry) => {
      const entryId = entry.target.id;
      if (!entryDic[entryId] || entryDic[entryId].time < entry.time) {
        entryDic[entryId] = entry;
      }
    });
    // TODO ios 9.x not support the api,need to fix
    return Object.values(entryDic);
  }

  private handleEndReached(index: number, childLength: number) {
    if (
      (this.preloadItemNumber
        && index >= childLength - this.preloadItemNumber)
      || index === childLength - 1
    ) {
      this.callOnEndReached();
    }
  }
}

export class ListViewItem extends HippyView<HTMLDivElement> {
  public constructor(context, id, pId) {
    super(context, id, pId);
    this.tagName = InnerNodeTag.LIST_ITEM;
    this.dom = document.createElement('div');
  }
}
function buildScrollEvent(el: HTMLElement) {
  return { contentOffset: { x: el.scrollLeft, y: el.scrollTop } };
}
function getRootElement() {
  return document.getElementsByTagName('body')[0];
}
