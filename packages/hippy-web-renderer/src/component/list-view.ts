/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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
import { HippyWebView } from './hippy-web-view';
import {
  eventThrottle,
  GESTURE_CAPTURE_THRESHOLD,
  mountTouchListener,
  touchMoveCalculate,
} from './scrollable';

export class ListView extends HippyWebView<HTMLDivElement> {
  public static intersectionObserverElement(
    parentElement: Element,
    callBack: (entries: Array<IntersectionObserverEntry>) => void,
  ) {
    return new IntersectionObserver(callBack, {
      root: parentElement,
      threshold: 0,
    });
  }
  private destroying = false;
  private initialListReadyFlag = false;
  private dirtyListItems: ListViewItem[] = [];
  private lastPosition: [number, number] = [0, 0];
  private renderChildrenTuple: [number, number] = [0, 0];
  private lastTimestamp = 0;
  private scrollCaptureState = false;
  private rootElement;
  private virtualList;
  private childData: Array<ListViewItem> = [];
  private touchListenerRelease;
  private checkTimer: any = null;
  private stickyListViewItem: ListViewItem|null = null;
  private stickyContainer: HTMLDivElement|null = null;


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
    return  { display: 'flex', flexDirection: 'column', flexShrink: 0, boxSizing: 'border-box', overflow: 'scroll' };
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
    setElementStyle(this.dom!, { overflow: !this.scrollEnabled ? 'hidden' : 'scroll' });
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
    this.virtualList.scrollTo(yOffset, animated);
  }

  public scrollToIndex(xIndex: number, yIndex: number, animated: boolean) {
    this.virtualList.scrollToIndex(yIndex, animated);
  }

  public async beforeRemove(): Promise<any> {
    await super.beforeRemove();
    this.destroying = true;
    this.touchListenerRelease?.();
    const uiManagerModule = this.context.getModuleByName('UIManagerModule');
    const needRemoveData = [...this.childData];
    for (const itemData of needRemoveData) {
      if (!uiManagerModule.findViewById(itemData.id)) {
        continue;
      }
      await uiManagerModule.viewDelete(itemData);
    }
  }

  public destroy() {
    super.destroy();
  }

  public insertChild(component: ListViewItem) {
    if (component?.props.sticky) {
      this.stickyListViewItem = component;
    }
    this.childData.push(component);
    component.addDirtyListener(this.handleListItemDirty.bind(this));
  }

  public async removeChild(component: ListViewItem) {
    const deleteIndex = this.childData.findIndex(item => item === component);
    const uiManagerModule = this.context.getModuleByName('UIManagerModule');
    await uiManagerModule.removeChild(this, component.id);
    this.childData.splice(deleteIndex, 1);
    if (!this.destroying) {
      requestAnimationFrame(() => {
        this.notifyDataSetChange();
      });
    }
  }

  public mounted(): void {
    super.mounted();
  }

  public endBatch() {
    setTimeout(() => {
      if (!this.dom) {
        return;
      }
      if (!this.virtualList) {
        this.virtualList = new VirtualizedList(this.dom!, {
          height: this.dom?.clientHeight,
          rowCount: this.childData.length,
          rowHeight: this.getChildHeight.bind(this),
          renderRow: this.getChildDom.bind(this),
          onRowsRendered: this.handleOnRowsRendered.bind(this),
          onScroll: this.handleScroll.bind(this),
          initialScrollTop: this.initialContentOffset ?? 0,
          overScanCount: 2,
        });
      }
      this.needCheckAllDataHeight();
      this.notifyDataSetChange();
    }, 0);
  }

  public getChildHeight(index) {
    if (this.childData[index] && !this.childData[index]?.height) {
      this.childData[index].height = this.getListItemNewHeight(this.childData[index]);
    }
    return this.childData[index]?.height ?? 0;
  }

  public getChildDom(index: number) {
    return this.childData[index]?.dom ?? null;
  }

  private handleListItemDirty(item: ListViewItem) {
    this.dirtyListItems.push(item);
    this.whenFinishCheckDirtyChild();
  }

  private whenFinishCheckDirtyChild() {
    if (this.checkTimer) {
      clearTimeout(this.checkTimer);
    }
    this.checkTimer = setTimeout(this.checkDirtyChild.bind(this), 64);
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
      onBeginSliding: this.handleBeginSliding.bind(this),
      onEndSliding: this.handleEndSliding.bind(this),
    });
  }

  private moveStickyRowToContainer() {
    if (this.stickyListViewItem!.dom!.childNodes.length === 0) {
      return;
    }
    if (this.stickyContainer === null) {
      this.stickyContainer = document.createElement('div');
      const rect = this.dom?.getBoundingClientRect() ?? { y: 0, x: 0, width: 0 };
      setElementStyle(this.stickyContainer, {  position: 'sticky', top: 0, left: rect.x, width: rect.width, zIndex: 0 });
      this.virtualList.inner.appendChild(this.stickyContainer);
    }
    const children = this.stickyListViewItem!.dom!.childNodes;
    setElementStyle(this.stickyListViewItem!.dom!, { height: this.stickyListViewItem?.height });
    for (const child of children) {
      this.stickyListViewItem!.dom!.removeChild(child);
      this.stickyContainer.appendChild(child);
    }
  }

  private removeStickyRowToContainer() {
    if (this.stickyContainer!.childNodes.length === 0) {
      return;
    }
    const children = this.stickyContainer!.childNodes;
    setElementStyle(this.stickyListViewItem!.dom!, { height: this.stickyListViewItem?.height });
    for (const child of children) {
      this.stickyContainer!.removeChild(child);
      this.stickyListViewItem!.dom!.appendChild(child);
      setElementStyle(this.stickyListViewItem!.dom!, { height: 'auto' });
    }
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
      data.height = this.getListItemNewHeight(data);
    }
  }

  private checkDirtyChild() {
    for (let i = 0;i < this.dirtyListItems.length;i++) {
      const item = this.dirtyListItems[i];
      item.isDirty = false;
    }
    this.dirtyListItems = [];
    this.notifyDataSetChange();
    clearTimeout(this.checkTimer);
    this.checkTimer = null;
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

  private async handleEndDrag() {
    this.scrollCaptureState = false;
    this.dom && this.onScrollEndDrag(this.buildScrollEvent());
  }

  private handleScroll(force = false) {
    window.requestAnimationFrame(this.listStickyCheck.bind(this));
    if (!this.dom) {
      return;
    }
    !force && eventThrottle(
      this.lastTimestamp,
      this.scrollEventThrottle,
      () => {
        this.onScroll(this.buildScrollEvent());
        this.lastTimestamp = Date.now();
      },
    );
    force && this.onScroll(this.buildScrollEvent());
  }

  private handleBeginSliding() {
    this.dom && this.onMomentumScrollBegin(this.buildScrollEvent());
  }

  private handleEndSliding() {
    this.dirtyListItems.length > 0 && requestAnimationFrame(() => {
      this.checkDirtyChild();
    });
    this.handleScroll(true);
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
    const height = child.getItemHeight() ?? 0;
    this.dom?.removeChild(child.dom!);
    setElementStyle(child.dom!, { visibility: 'visible', position: 'static', zIndex: 0 });
    return height;
  }

  private buildScrollEvent() {
    return { contentOffset: { x: 0, y: this.virtualList.getOffset() } };
  }

  private listStickyCheck() {
    if (!this.stickyListViewItem) {
      return;
    }
    const stickyIndex = this.childData.findIndex(item => item === this.stickyListViewItem);
    if (stickyIndex === -1) {
      return;
    }
    const offset = this.virtualList.getRowOffset(stickyIndex);
    if (this.virtualList.getOffset() > offset) {
      this.moveStickyRowToContainer();
    } else if (this.stickyContainer && this.stickyContainer.childNodes.length > 0) {
      this.removeStickyRowToContainer();
    }
  }
}

export class ListViewItem extends HippyWebView<HTMLDivElement> {
  public height = 0;
  public isDirty = false;
  private dirtyListener: ((component: ListViewItem) => void) | null = null;

  public constructor(context, id, pId) {
    super(context, id, pId);
    this.tagName = InnerNodeTag.LIST_ITEM;
    this.dom = document.createElement('div');
    this.onLayout = true;
  }

  public set sticky(value: boolean) {
    this.props[NodeProps.STICKY] = value;
  }

  public get sticky() {
    return this.props[NodeProps.STICKY];
  }

  public addDirtyListener(callBack: ((component: ListViewItem) => void) | null) {
    this.dirtyListener = callBack;
  }

  mounted(): void {
    super.mounted();
  }

  public getItemHeight() {
    return this.dom?.clientHeight ?? 0;
  }

  public handleReLayout(entries: ResizeObserverEntry[]) {
    const [entry] = entries;
    const { height } = entry.contentRect;
    if ((Math.round(height) === this.height) && Math.round(height) === this.dom?.clientHeight) {
      // no need to relayout ListViewItem when height is not changed
      return;
    }
    this.height = Math.round(height);
    this.isDirty = true;
    this.dirtyListener?.(this);
  }
}


function getRootElement() {
  return document.getElementsByTagName('body')[0];
}
