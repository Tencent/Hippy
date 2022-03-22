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
import { NodeProps, InnerNodeTag } from '../types';
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
  isDirty?: boolean
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
  private initialListReadyFlag = false;
  private lastPosition: [number, number] = [0, 0];
  private renderChildrenTuple: [number, number] = [0, 0];
  private lastTimestamp = 0;
  private scrollCaptureState = false;
  private rootElement;
  private virtualList;
  private childData: VirtualItemData[] = [];
  private dataDirtyFlag = false;
  private touchListenerRelease;


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

  public onLoadMore() {
    this.props[NodeProps.ON_LOAD_MORE]
    && this.context.sendUiEvent(this.id, NodeProps.ON_LOAD_MORE, null);
    this.props[NodeProps.ON_LOAD_MORE]
    && this.context.sendUiEvent(this.id, NodeProps.ON_END_REACHED, null);
  }

  public scrollToContentOffset(xOffset: number, yOffset: number, animated: boolean) {
    // TODO to implement
    this.virtualList.scrollTo(yOffset, animated);
  }

  public scrollToIndex(xIndex: number, yIndex: number, animated: boolean) {
    this.virtualList.scrollToIndex(xIndex, animated);
  }

  public async beforeRemove(): Promise<any> {
    await super.beforeRemove();
    this.touchListenerRelease?.();
  }

  public destroy() {
    super.destroy();
  }

  public insertChild(component: ListViewItem) {
    this.childData.push({ component });
    component.addDirtyListener(this.handleListItemDirty.bind(this));
  }

  public removeChild(component: ListViewItem) {
    delete this.childData[component.index];
    this.notifyDataSetChange();
  }

  public mounted(): void {
    super.mounted();
  }

  public endBatch() {
    if (!this.virtualList) {
      this.virtualList = new VirtualizedList(this.dom!, {
        height: this.dom?.clientHeight,
        rowCount: this.childData.length,
        rowHeight: this.getChildHeight.bind(this),
        renderRow: this.getChildDom.bind(this),
        onRowsRendered: this.handleOnRowsRendered.bind(this),
        initialScrollTop: this.initialContentOffset ?? 0,
        overScanCount: 2,
      });
    }
    this.needCheckAllDataHeight();
    this.notifyDataSetChange();
  }

  public getChildHeight(index) {
    if (this.childData[index] && !this.childData[index]?.height) {
      this.childData[index].height = this.getListItemNewHeight(this.childData[index].component);
    }
    return this.childData[index]?.height ?? 0;
  }

  public getChildDom(index: number) {
    return this.childData[index]?.component?.dom ?? null;
  }

  private handleListItemDirty(id: number, height: number) {
    const [dirtyData] = this.childData.filter(data => data.component.id === id);
    if (!dirtyData.isDirty && dirtyData.height !== undefined && dirtyData.height !== Math.round(height)) {
      dirtyData.isDirty = true;
      dirtyData.height = height;
      this.dataDirtyFlag = true;
    }
  }

  private handleOnRowsRendered({
    startIndex,
    stopIndex,
  }) {
    this.needCheckChildVisible({
      startIndex,
      stopIndex,
    });
  }

  private notifyDataSetChange() {
    this.virtualList.setRowCount(this.childData.length);
  }

  private init() {
    this.props[NodeProps.OVER_SCROLL_ENABLED] = true;
    this.props[NodeProps.INITIAL_LIST_SIZE] = 10;
    this.props[NodeProps.INITIAL_LIST_READY] = true;
    this.props[NodeProps.PRELOAD_ITEM_NUMBER] = 1;
    this.props[NodeProps.SCROLL_EVENT_THROTTLE] = 30;
    this.props[NodeProps.ON_LOAD_MORE] = true;

    this.touchListenerRelease = mountTouchListener(this.dom!, {
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
    if (startIndex !== this.renderChildrenTuple[0] || stopIndex !== this.renderChildrenTuple[1]) {
      this.notifyVisibleChildrenChange(this.renderChildrenTuple, [startIndex, stopIndex]);
    }
    if (!this.initialListReadyFlag && stopIndex >= this.initialListSize - 1) {
      this.onInitialListReady();
      this.initialListReadyFlag = true;
    }
    this.renderChildrenTuple = [startIndex, stopIndex];
  }

  private needCheckAllDataHeight() {
    for (let i = 0;i < this.childData.length;i++) {
      const data = this.childData[i];
      if (data.height) {
        continue;
      }
      data.height = this.getListItemNewHeight(data.component);
    }
  }

  private needCheckDirtyChild() {
    const dirtyList = this.childData.filter(item => item.isDirty === true);
    for (let i = 0;i < dirtyList.length;i++) {
      const item = dirtyList[i];
      item.isDirty = false;
    }
    this.notifyDataSetChange();
  }

  private getListItemNewHeight(component: ListViewItem) {
    if (!component.dom!.parentNode) {
      return this.measureListViewItemSize(component);
    }
    return component.getItemHeight();
  }

  private notifyVisibleChildrenChange(origin: [number, number], now: [number, number]) {
    const originShowIndexList = new Array(origin[1] - origin[0] + 1);
    const nowShowIndexList = new Array(now[1] - now[0] + 1);
    for (let i = origin[0];i <= origin[1] && origin[1] !== 0;i++) {
      originShowIndexList[i] =  i;
    }
    for (let i = now[0];i <= now[1];i++) {
      nowShowIndexList[i] = i;
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

  private checkScrollEnable(lastTouchEvent: TouchEvent, newTouchEvent?: TouchEvent)  {
    if (!newTouchEvent || !lastTouchEvent) {
      return this.scrollCaptureState;
    }

    if (this.scrollCaptureState && newTouchEvent) {
      return this.scrollCaptureState;
    }
    this.scrollCaptureState = this.needCaptureTouch(lastTouchEvent, newTouchEvent);
    return this.scrollCaptureState;
  }

  private needCaptureTouch(lastTouchEvent: TouchEvent, newTouchEvent: TouchEvent) {
    const moveDistance = touchMoveCalculate(newTouchEvent, lastTouchEvent);
    return (Math.abs(moveDistance[1]) > GESTURE_CAPTURE_THRESHOLD);
  }

  private handleBeginDrag() {
    this.dom && this.onScrollBeginDrag(this.buildScrollEvent());
  }

  private handleEndDrag() {
    this.scrollCaptureState = false;
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
    this.dataDirtyFlag && requestAnimationFrame(() => {
      this.needCheckDirtyChild();
      this.dataDirtyFlag = false;
    });
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
      this.onLoadMore();
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
    return { contentOffset: { x: 0, y: this.virtualList.getOffset() } };
  }
}

export class ListViewItem extends HippyView<HTMLDivElement> {
  private dirtyListener: ((id: number, height: number) => void) | null = null;

  public constructor(context, id, pId) {
    super(context, id, pId);
    this.tagName = InnerNodeTag.LIST_ITEM;
    this.dom = document.createElement('div');
    this.onLayout = true;
  }

  public addDirtyListener(callBack: ((index: number, height: number) => void) | null) {
    this.dirtyListener = callBack;
  }

  mounted(): void {
    super.mounted();
  }

  public getItemHeight() {
    return this.dom?.clientHeight;
  }

  public handleReLayout(entries: ResizeObserverEntry[]) {
    const [entry] = entries;
    const { height } = entry.contentRect;
    if (height === 0) {
      return;
    }
    this.dirtyListener?.(this.id, height);
  }
}


function getRootElement() {
  return document.getElementsByTagName('body')[0];
}
