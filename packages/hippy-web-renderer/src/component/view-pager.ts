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

import { NodeProps, SCROLL_STATE } from '../types';
import { setElementStyle } from '../common';
import { BaseView, InnerNodeTag, UIProps } from '../../types';
import { HippyView } from './hippy-view';
import { mountTouchListener } from './scrollable';

const ANIMATION_TIME = 200;

export class ViewPager extends HippyView<HTMLDivElement> {
  private pageIndex =0;
  private scrollableCache = false;
  private lastPosition = [0, 0];

  public constructor(context, id, pId) {
    super(context, id, pId);
    this.tagName = InnerNodeTag.VIEW_PAGER;
    this.dom = document.createElement('div');
  }

  public defaultStyle(): { [p: string]: any } {
    return {
      display: 'flex',
      flexDirection: 'row',
      overflowX: 'scroll',
      overflowY: 'hidden',
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
    this.context.sendUiEvent(this.id, NodeProps.ON_PAGE_SELECTED, event);
  }

  public onPageScroll(event: {position: number, offset: number}) {
    this.context.sendUiEvent(this.id, NodeProps.ON_PAGE_SCROLL, event);
  }

  public onPageScrollStateChanged(event: {pageScrollState: SCROLL_STATE}) {
    this.context.sendUiEvent(this.id, NodeProps.ON_PAGE_SCROLL_STATE_CHANGED, event);
  }

  public setPage(index: number) {
    this.scrollPage(index, true);
  }

  public setPageWithoutAnimation(index: number) {
    this.scrollPage(index, false);
  }

  public init() {
    this.props[NodeProps.INITIAL_PAGE] = 0;
    this.props[NodeProps.SCROLL_ENABLED] = true;
    mountTouchListener(this.dom!, {
      recordPosition: this.lastPosition,
      scrollEnable: () => true,
      onScroll: this.handleScroll,
      onBeginDrag: this.handleBeginDrag,
      onEndDrag: this.handleEndDrag,
    });
  }
  private scrollPage(index: number, withAnimation: boolean) {
    if (!this.dom) {
      return;
    }
    this.scrollToPageByIndex(
      this.pageIndex,
      index,
      withAnimation,
    );
  }

  private handleScroll() {
    if (this.dom) {
      this.updateInfo(scrollEventPreProcess(this.dom).position, this.pageIndex);
      this.onPageScroll(buildPageScrollEvent(this.dom.clientWidth, this.pageIndex, this.lastPosition));
    }
  }

  private handleBeginDrag() {
    this.onPageScrollStateChanged(buildScrollStateEvent(SCROLL_STATE.DRAG));
  }

  private handleEndDrag(position: Array<number>) {
    if (!this.dom) {
      return;
    }
    this.scrollableCache = false;
    this.onPageScrollStateChanged(buildScrollStateEvent(SCROLL_STATE.SETTL));
    const tmpPosition = [position[0], position[1]];
    const scrollResult = this.scrollEndCalculate(position);
    const scrollWait = this.beginSmoothScroll(
      ANIMATION_TIME,
      this.pageIndex,
      tmpPosition,
      scrollResult.fromOffset,
      scrollResult.toOffset,
    );
    this.endSmoothScroll(scrollWait, [scrollResult.toOffset, tmpPosition[1]], scrollResult.newPageIndex);
  }

  private updateInfo(newPosition: Array<number>, newIndex: number)  {
    this.pageIndex = newIndex;
    this.lastPosition = newPosition;
  }

  private async beginSmoothScroll(
    time: number,
    pageIndex: number,
    position: Array<number>,
    fromOffset: number,
    toOffset: number,
  ) {
    let animationTime = time;
    return new Promise((resolve) => {
      if (time <= 0) {
        animationTime = 1;
      }
      const moveDistance = fromOffset - toOffset;
      const beginTime = Date.now();
      let recordMoveOffset = [0, 0];
      const scrollCallback = () => {
        const overTime = Date.now() - beginTime;
        if (overTime > animationTime || !this.dom) {
          resolve(recordMoveOffset[0]);
          return;
        }
        window.requestAnimationFrame(scrollCallback);
        const realOffset = moveDistance * (overTime / animationTime);
        const tmpPosition = [position[0] - realOffset, position[1]];
        recordMoveOffset = tmpPosition;
        this.dom!.scrollTo(parseInt(String(tmpPosition[0]), 10), parseInt(String(tmpPosition[1]), 10));
        this.onPageScroll(buildPageScrollEvent(this.dom!.clientWidth, pageIndex, tmpPosition));
        this.lastPosition = tmpPosition;
      };
      window.requestAnimationFrame(scrollCallback);
    });
  }
  private endSmoothScroll(scrollResult: Promise<any>, willToPosition: Array<number>, willToIndex: number) {
    scrollResult.then((lasMoveOffset: number) => {
      if (!this.dom) {
        return;
      }
      if (lasMoveOffset !== willToPosition[0]) {
        this.dom!.scrollTo(willToPosition[0], 0);
        this.onPageScroll(buildPageScrollEvent(this.dom!.clientWidth, willToIndex, willToPosition));
      }
      this.onPageScrollStateChanged(buildScrollStateEvent(SCROLL_STATE.IDLE));
      if (this.pageIndex !== willToIndex) {
        this.onPageSelected({ position: willToIndex });
      }
    }).catch((error) => {
      throw error;
    })
      .finally(() => {
        this.updateInfo(willToPosition, willToIndex);
      });
  }

  private scrollEndCalculate(lastPosition: Array<number>) {
    const xScroll = Number(this.dom!.scrollLeft.toFixed(2));
    const pageUnitSize = this.dom!.clientWidth;
    const scrollSize = this.dom!.scrollWidth;
    const originOffset = lastPosition[0];
    return scrollCalculate(pageUnitSize, scrollSize, originOffset, xScroll);
  }

  private scrollToPageByIndex(
    fromIndex: number,
    toIndex: number,
    needAnimation: boolean,
  ) {
    const pageWidth = this.dom!.clientWidth;
    const tmpPosition = [fromIndex * pageWidth, this.lastPosition[1]];
    const toPosition = [toIndex * pageWidth, this.lastPosition[1]];

    this.onPageScrollStateChanged(buildScrollStateEvent(SCROLL_STATE.SETTL));
    const scrollWait = this.beginSmoothScroll(
      needAnimation ? ANIMATION_TIME : 0,
      fromIndex,
      tmpPosition,
      tmpPosition[0],
      toPosition[0],
    );
    this.endSmoothScroll(scrollWait, toPosition, toIndex);
  }
}

function scrollCalculate(pageUnitSize, scrollSize, originOffset, currentScrollSize) {
  const pageIndex = Math.round(currentScrollSize / pageUnitSize);
  const maxValue = scrollSize - pageUnitSize;
  const maxPageIndex = Math.ceil(scrollSize / pageUnitSize);
  const lastPageSize = scrollSize - parseInt(String(scrollSize / pageUnitSize), 10) * pageUnitSize;
  const isOverLastPageHalf = Math.abs(currentScrollSize) + pageUnitSize
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

function scrollEventPreProcess(scrollContainer: HTMLElement) {
  const xScroll = scrollContainer.scrollLeft;
  const yScroll = scrollContainer.scrollTop;
  return {
    position: [xScroll, yScroll],
  };
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

export class ViewPagerItem extends HippyView<HTMLDivElement> {
  public constructor(context, id, pId) {
    super(context, id, pId);
    this.tagName = InnerNodeTag.VIEW_PAGER_ITEM;
    this.dom = document.createElement('div');
  }

  public defaultStyle(): { [p: string]: any } {
    return { flexShrink: 0, display: 'flex', boxSizing: 'border-box', position: 'static' };
  }
  public updateProps(data: UIProps, defaultProcess: (component: BaseView, data: UIProps) => void) {
    const newData = { ...data };
    if (data.style && data.style.position === 'absolute') {
      delete newData.style.position;
    }
    Object.assign(newData.style, this.defaultStyle());
    defaultProcess(this, newData);
  }
  public async beforeMount(parent: BaseView, position: number) {
    await super.beforeMount(parent, position);
    setElementStyle(this.dom!, { width: `${parent.dom!.clientWidth}px` });
  }
}
