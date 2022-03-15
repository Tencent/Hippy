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
import { VirtualizedList } from '../third-lib/virtual-list.js';
import {  InnerNodeTag } from '../../types';
import { NodeProps } from '../types';
import { setElementStyle } from '../common';
import { HippyView } from './hippy-view';
import {
  eventThrottle,
  GESTURE_CAPTURE_THRESHOLD,
  mountTouchListener,
  touchMoveCalculate,
} from './scrollable';

interface VirtualItemData {
  component: ListViewItem,
  height?: number
}

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

  private lastPosition: [number, number] = [0, 0];
  private renderChildrenTuple: [number, number] = [0, 0];
  private lastTimestamp = 0;
  private scrollableCache = false;
  private rootElement;
  private virtualList;
  private childData: {[key: string]: VirtualItemData} = {};

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
    setElementStyle(this.dom!, { overflow: this.scrollEnabled ? 'hidden' : 'scroll' });
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

  public onMomentumScrollBegin(event: { contentOffset: { x: number, y: number } }) {
    this.props[NodeProps.ON_MOMENTUM_SCROLL_BEGIN]
    && this.context.sendUiEvent(this.id, NodeProps.ON_MOMENTUM_SCROLL_BEGIN, event);
  }

  public onMomentumScrollEnd(event: { contentOffset: { x: number, y: number } }) {
    this.props[NodeProps.ON_MOMENTUM_SCROLL_END]
    && this.context.sendUiEvent(this.id, NodeProps.ON_MOMENTUM_SCROLL_END, event);
  }

  public onScroll(event: { contentOffset: { x: number, y: number } }) {
    this.props[NodeProps.ON_SCROLL]
    && this.context.sendUiEvent(this.id, NodeProps.ON_SCROLL, event);
  }

  public onScrollBeginDrag(event: { contentOffset: { x: number, y: number } }) {
    this.props[NodeProps.ON_SCROLL_BEGIN_DRAG]
    && this.context.sendUiEvent(this.id, NodeProps.ON_SCROLL_BEGIN_DRAG, event);
  }

  public onScrollEndDrag(event: { contentOffset: { x: number, y: number } }) {
    this.props[NodeProps.ON_SCROLL_END_DRAG]
    && this.context.sendUiEvent(this.id, NodeProps.ON_SCROLL_END_DRAG, event);
  }

  public onInitialListReady() {
    this.context.sendUiEvent(this.id, NodeProps.INITIAL_LIST_READY, null);
  }

  public onAppear(event) {
    this.props[NodeProps.ON_APPEAR]
    && this.context.sendUiEvent(this.id, NodeProps.ON_APPEAR, event);
  }

  public onDisappear(event) {
    this.props[NodeProps.ON_DISAPPEAR]
    && this.context.sendUiEvent(this.id, NodeProps.ON_DISAPPEAR, event);
  }

  public onWillAppear(event) {
    this.props[NodeProps.ON_WILL_APPEAR]
    && this.context.sendUiEvent(this.id, NodeProps.ON_WILL_APPEAR, event);
  }

  public onWillDisappear(event) {
    this.props[NodeProps.ON_WILL_DISAPPEAR]
    && this.context.sendUiEvent(this.id, NodeProps.ON_WILL_DISAPPEAR, event);
  }

  public onEndReached() {
    this.props[NodeProps.ON_END_REACHED]
    && this.context.sendUiEvent(this.id, NodeProps.ON_END_REACHED, null);
  }

  public scrollToContentOffset(xOffset: number, yOffset: number, animated: boolean) {
    // TODO to implement
  }

  public scrollToIndex(xIndex: number, yIndex: number, animated: boolean) {
    // TODO to implement
  }

  public async beforeRemove(): Promise<any> {
    await super.beforeRemove();
  }

  public destroy() {
    super.destroy();
  }

  public insertChild(component: ListViewItem, index: number) {
    this.childData[index] = { component };
  }

  public removeChild(component: ListViewItem) {
    delete this.childData[component.index];
    this.notifyDataSetChange();
  }

  public mounted(): void {
    super.mounted();
    this.virtualList = new VirtualizedList(this.dom!, {
      height: this.dom?.clientHeight,
      rowCount: Object.keys(this.childData).length,
      rowHeight: this.getChildHeight.bind(this),
      renderRow: this.getChildDom.bind(this),
      onRowsRendered: this.handleOnRowsRendered.bind(this),
      initialIndex: 0,
    });
  }

  public endBatch() {
    this.needCheckChildHeight({ startIndex: 0, stopIndex: Object.keys(this.childData).length - 1 });
    this.notifyDataSetChange();
  }

  public getChildHeight(index) {
    if (this.childData[index] && !this.childData[index]?.height) {
      this.childData[index].height = this.childData[index].component.getItemHeight();
    }
    return this.childData[index]?.height ?? 0;
  }

  public getChildDom(index: number) {
    return this.childData[index]?.component?.dom ?? null;
  }

  private handleOnRowsRendered({
    startIndex,
    stopIndex,
  }) {
    this.needCheckChildHeight({
      startIndex,
      stopIndex,
    });
    this.needCheckChildVisible({
      startIndex,
      stopIndex,
    });
  }

  private notifyDataSetChange() {
    this.virtualList.setRowCount(Object.keys(this.childData).length);
  }

  private init() {
    this.props[NodeProps.OVER_SCROLL_ENABLED] = true;
    this.props[NodeProps.INITIAL_LIST_SIZE] = 10;
    this.props[NodeProps.INITIAL_LIST_READY] = true;
    this.props[NodeProps.PRELOAD_ITEM_NUMBER] = 1;
    this.props[NodeProps.SCROLL_EVENT_THROTTLE] = 30;

    mountTouchListener(this.dom!, {
      getPosition: () => this.lastPosition,
      updatePosition: this.updatePositionInfo.bind(this),
      scrollEnable: this.checkScrollEnable.bind(this),
      onBeginDrag: this.handleBeginDrag.bind(this),
      onEndDrag: this.handleEndDrag.bind(this),
      onScroll: this.handleScroll.bind(this),
      onBeginSliding: this.handleBeginSliding.bind(this),
      onEndSliding: this.handleEndSliding.bind(this),
    });
  }

  private needCheckChildVisible({
    startIndex,
    stopIndex,
  }) {
    console.log('visible', this.renderChildrenTuple, [startIndex, stopIndex]);
    if (startIndex !== this.renderChildrenTuple[0] || stopIndex !== this.renderChildrenTuple[1]) {
      this.notifyVisibleChildrenChange(this.renderChildrenTuple, [startIndex, stopIndex]);
    }
    if (
      stopIndex >= this.initialListSize - 1
      && this.isFirstMount()
    ) {
      this.lastTimestamp = 1;
      this.onInitialListReady();
    }
    this.renderChildrenTuple = [startIndex, stopIndex];
  }

  private needCheckChildHeight({
    startIndex,
    stopIndex,
  }) {
    for (let i = startIndex;i <= stopIndex;i++) {
      if (this.childData[i].height) {
        continue;
      }
      if (!this.childData[i].component.dom!.parentNode) {
        this.childData[i].height = this.measureListViewItemSize(this.childData[i].component);
      } else {
        this.childData[i].height = this.childData[i].component.getItemHeight();
      }
    }
  }

  private notifyVisibleChildrenChange(origin: [number, number], now: [number, number]) {
    const originShowIndexList = new Array(origin[1] - origin[0] + 1);
    const nowShowIndexList = new Array(now[1] - now[0] + 1);
    for (let i = origin[0];i <= origin[1] && origin[1] !== 0;i++) {
      originShowIndexList[i] = origin[0] + i;
    }
    for (let i = now[0];i <= now[1];i++) {
      nowShowIndexList[i] = now[0] + i;
    }
    const intersection = originShowIndexList.filter(v => nowShowIndexList.indexOf(v) > -1);
    const disappearIndexList =  originShowIndexList.filter(v => intersection.indexOf(v) === -1);
    const appearIndexList =  nowShowIndexList.filter(v => intersection.indexOf(v) === -1);
    disappearIndexList.forEach((item) => {
      this.childVisibleChange(item, false);
    });
    appearIndexList.forEach((item) => {
      this.childVisibleChange(item, true, Object.keys(this.childData).length);
    });
  }

  private updatePositionInfo(newPosition: [number, number])  {
    this.lastPosition = newPosition;
  }

  private isFirstMount() {
    return !this.lastTimestamp;
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
    this.dom && this.onScrollBeginDrag(this.buildScrollEvent());
  }

  private handleEndDrag() {
    this.scrollableCache = false;
    this.dom && this.onScrollEndDrag(this.buildScrollEvent());
  }

  private handleScroll() {
    this.dom && eventThrottle(
      this.lastTimestamp,
      this.scrollEventThrottle,
      () => {
        this.onScroll(this.buildScrollEvent());
        this.lastTimestamp = Date.now();
      },
    );
  }

  private handleBeginSliding() {
    this.dom && this.onMomentumScrollBegin(this.buildScrollEvent());
  }

  private handleEndSliding() {
    this.dom && this.onMomentumScrollEnd(this.buildScrollEvent());
  }

  private childVisibleChange(
    sortIndex: number,
    isVisible: boolean,
    brotherElementSize?: number,
  ) {
    if (isVisible) {
      this.onAppear(sortIndex);
      this.handleEndReached(sortIndex, brotherElementSize!);
    }
    if (!isVisible) {
      this.onDisappear(sortIndex);
    }
  }

  private handleEndReached(index: number, childLength: number) {
    if (
      (this.preloadItemNumber
        && index >= childLength - this.preloadItemNumber)
      || index === childLength - 1
    ) {
      this.onEndReached();
    }
  }
  private measureListViewItemSize(child: ListViewItem) {
    setElementStyle(child.dom!, { visibility: 'hidden', position: 'absolute', zIndex: -99999 });
    this.dom?.insertBefore(child.dom!, null);
    const height = child.getItemHeight();
    this.dom?.removeChild(child.dom!);
    setElementStyle(child.dom!, { visibility: 'visible', position: 'static', zIndex: 0 });
    return height;
  }
  private buildScrollEvent() {
    return { contentOffset: { x: this.virtualList.getOffset(), y: 0 } };
  }
}

export class ListViewItem extends HippyView<HTMLDivElement> {
  public constructor(context, id, pId) {
    super(context, id, pId);
    this.tagName = InnerNodeTag.LIST_ITEM;
    this.dom = document.createElement('div');
  }

  public getItemHeight() {
    return this.dom?.clientHeight;
  }
}


function getRootElement() {
  return document.getElementsByTagName('body')[0];
}
