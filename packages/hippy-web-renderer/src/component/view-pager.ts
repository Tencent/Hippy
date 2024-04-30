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
import * as Hammer from 'hammerjs';
import {
  NodeProps,
  SCROLL_STATE,
  HippyBaseView,
  InnerNodeTag,
  UIProps,
  DefaultPropsProcess,
} from '../types';
import { setElementStyle } from '../common';
import { HippyWebView } from './hippy-web-view';
import {
  GESTURE_CAPTURE_THRESHOLD,
  mountTouchListener, calculateScrollEndPagePosition,
  touchMoveCalculate,
  virtualSmoothScroll,
} from './scrollable';

const ANIMATION_TIME = 200;

export class ViewPager extends HippyWebView<HTMLDivElement> {
  private pageIndex = 0;
  private scrollCaptureState = false;
  private lastPosition: [number, number] = [0, 0];
  private children: ViewPagerItem[] = [];
  private swipeRecognize: any = null;
  private touchListenerRelease;

  public constructor(context, id, pId) {
    super(context, id, pId);
    this.tagName = InnerNodeTag.VIEW_PAGER;
    this.dom = document.createElement('div');
    this.init();
  }

  public defaultStyle(): { [p: string]: any } {
    return {
      display: 'flex',
      flexDirection: 'row',
      overflowX: 'visible',
      overflowY: 'visible',
      maxHeight: '100%',
      boxSizing: 'border-box',
    };
  }

  public get initialPage() {
    return this.props[NodeProps.INITIAL_PAGE];
  }

  public set initialPage(value: number) {
    this.props[NodeProps.INITIAL_PAGE] = value;
  }

  public get scrollEnabled() {
    return this.props[NodeProps.SCROLL_ENABLED];
  }

  public set scrollEnabled(value: number) {
    this.props[NodeProps.SCROLL_ENABLED] = value;
  }

  public onPageSelected(event: {position: number}) {
    this.props[NodeProps.ON_PAGE_SELECTED]
    && this.context.sendUiEvent(this.id, NodeProps.ON_PAGE_SELECTED, event);
  }

  public onPageScroll(event: {position: number, offset: number}) {
    this.props[NodeProps.ON_PAGE_SCROLL]
    && this.context.sendUiEvent(this.id, NodeProps.ON_PAGE_SCROLL, event);
  }

  public onPageScrollStateChanged(event: {pageScrollState: SCROLL_STATE}) {
    this.props[NodeProps.ON_PAGE_SCROLL_STATE_CHANGED]
    && this.context.sendUiEvent(this.id, NodeProps.ON_PAGE_SCROLL_STATE_CHANGED, event);
  }

  public setPage(index: number) {
    this.scrollPage(index, true);
  }

  public setPageWithoutAnimation(index: number) {
    this.scrollPage(index, false);
  }

  public async beforeChildMount(child: HippyBaseView, childPosition: number): Promise<any> {
    await super.beforeChildMount(child, childPosition);
    if (child instanceof ViewPagerItem) {
      this.children.push(child);
    }
  }

  public beforeChildRemove(child: HippyBaseView): void {
    super.beforeChildRemove(child);
    if (child instanceof ViewPagerItem) {
      this.children = this.children.filter(item => item !== child);
    }
  }

  public async beforeRemove(): Promise<void> {
    await super.beforeRemove();
    this.hammer.destroy();
    this.touchListenerRelease?.();
  }

  public endBatch() {
    if (this.initialPage !== 0 && this.initialPage !== this.pageIndex) {
      this.scrollToPageByIndex(this.initialPage, false);
    }
  }

  public init() {
    this.props[NodeProps.INITIAL_PAGE] = 0;
    this.props[NodeProps.SCROLL_ENABLED] = true;
    this.hammer =  new Hammer.Manager(this.dom!, { inputClass: Hammer.TouchInput, touchAction: 'auto' });
    const swipe = new Hammer.Swipe();
    this.hammer.add(swipe);
    this.hammer.on('swipe', (e) => {
      this.swipeRecognize = e;
      e.srcEvent.stopPropagation();
    });
    this.touchListenerRelease = mountTouchListener(this.dom!, {
      onTouchMove: this.handleScroll.bind(this),
      onBeginDrag: this.handleBeginDrag.bind(this),
      onEndDrag: this.handleEndDrag.bind(this),
      updatePosition: this.updatePositionInfo.bind(this),
      getPosition: () => this.lastPosition,
      scrollEnable: this.checkScrollEnable.bind(this),
      needSimulatedScrolling: true,
    });
  }

  private checkScrollEnable(lastTouchEvent: TouchEvent, newTouchEvent?: TouchEvent) {
    if (!newTouchEvent) {
      return this.scrollCaptureState;
    }

    if (this.scrollCaptureState && newTouchEvent) {
      newTouchEvent.preventDefault();
      return this.scrollCaptureState;
    }

    this.scrollCaptureState = this.needCaptureTouch(lastTouchEvent, newTouchEvent);
    this.scrollCaptureState && newTouchEvent.preventDefault();
    return this.scrollCaptureState;
  }

  private needCaptureTouch(lastTouchEvent: TouchEvent, newTouchEvent: TouchEvent) {
    const moveDistance = touchMoveCalculate(newTouchEvent, lastTouchEvent);
    return !!(Math.abs(moveDistance[0]) > GESTURE_CAPTURE_THRESHOLD
      && this.scrollEnabled);
  }

  private handleScroll() {
    if (this.dom) {
      this.onPageScroll(buildPageScrollEvent(this.dom.clientWidth, this.pageIndex, this.lastPosition));
    }
  }

  private handleBeginDrag() {
    this.swipeRecognize = null;
    this.onPageScrollStateChanged(buildScrollStateEvent(SCROLL_STATE.DRAG));
  }

  private async handleEndDrag(position: [number, number]) {
    this.scrollCaptureState = false;
    this.onPageScrollStateChanged(buildScrollStateEvent(SCROLL_STATE.SETTL));
    if (this.swipeRecognize) {
      let nextPage = this.pageIndex;
      if (this.swipeRecognize.offsetDirection === Hammer.DIRECTION_RIGHT && this.pageIndex > 0) {
        nextPage -= 1;
      } else if (this.swipeRecognize.offsetDirection === Hammer.DIRECTION_LEFT
        && this.pageIndex < this.children.length - 1) {
        nextPage += 1;
      }
      this.scrollPage(nextPage, true);
      this.swipeRecognize = null;
      return;
    }

    const { toOffset, newPageIndex } = calculateScrollEndPagePosition(
      this.dom!.clientWidth,
      this.dom!.scrollWidth, position[0],
    );
    const toPosition: [number, number] = [toOffset, position[1]];
    const scrollCallBack = (position, index) => {
      this.updatePositionInfo(position, index);
      this.handleScroll();
    };
    await virtualSmoothScroll(
      this.dom!, scrollCallBack, position, toPosition,
      ANIMATION_TIME, this.pageIndex, newPageIndex,
    );
    this.onPageSelected({ position: newPageIndex });
    this.onPageScrollStateChanged(buildScrollStateEvent(SCROLL_STATE.IDLE));
  }

  private updatePositionInfo(newPosition: [number, number], newIndex?: number)  {
    if (newIndex !== undefined) this.pageIndex = newIndex;
    this.lastPosition = newPosition;
  }

  private async scrollToPageByIndex(
    toIndex: number,
    needAnimation: boolean,
  ) {
    const pageWidth = this.dom!.clientWidth;
    const tmpPosition: [number, number]  = [...this.lastPosition];
    const toPosition: [number, number] = [toIndex * pageWidth * -1, this.lastPosition[1]];
    this.onPageScrollStateChanged(buildScrollStateEvent(SCROLL_STATE.SETTL));
    const scrollCallBack = (position, index) => {
      this.updatePositionInfo(position, index);
      this.handleScroll();
    };
    await virtualSmoothScroll(
      this.dom!, scrollCallBack, tmpPosition, toPosition,
      needAnimation ? ANIMATION_TIME : 0, this.pageIndex, toIndex,
    );
    this.onPageSelected({ position: toIndex });
    this.onPageScrollStateChanged(buildScrollStateEvent(SCROLL_STATE.IDLE));
  }


  private scrollPage(index: number, withAnimation: boolean) {
    if (!this.dom) {
      return;
    }
    this.scrollToPageByIndex(
      index,
      withAnimation,
    );
  }
}


function buildScrollStateEvent(state: SCROLL_STATE) {
  return { pageScrollState: state };
}

function buildPageScrollEvent(
  pageWidth: number,
  position: number,
  lastScroll: Array<number>,
) {
  const tmpIndex = parseInt(String(Math.abs(lastScroll[0]) / pageWidth), 10);
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

export class ViewPagerItem extends HippyWebView<HTMLDivElement> {
  public constructor(context, id, pId) {
    super(context, id, pId);
    this.tagName = InnerNodeTag.VIEW_PAGER_ITEM;
    this.dom = document.createElement('div');
  }

  public defaultStyle(): { [p: string]: any } {
    return { flexShrink: 0, display: 'flex', boxSizing: 'border-box', position: 'static' };
  }

  public updateProps(data: UIProps, defaultProcess: DefaultPropsProcess) {
    const newData = { ...data };
    if (data.style && data.style.position === 'absolute') {
      delete newData.style.position;
    }
    Object.assign(newData.style, this.defaultStyle());
    defaultProcess(this, newData);
  }

  public async beforeMount(parent: HippyBaseView, position: number) {
    await super.beforeMount(parent, position);
    setElementStyle(this.dom!, { width: `${parent.dom!.clientWidth}px` });
  }
}
