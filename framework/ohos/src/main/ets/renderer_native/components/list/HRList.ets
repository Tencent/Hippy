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
import systemDateTime from '@ohos.systemDateTime';
import { HippyMap } from '../../../support/common/HippyTypes';
import HippyRenderBaseView, {
  HippyObservedArray,
  HIPPY_COMPONENT_KEY_PREFIX } from '../base/HippyRenderBaseView';
import { HREventUtils } from '../../utils/HREventUtils'
import { LogUtils } from '../../../support/utils/LogUtils';
import { HRPullHeaderView } from '../pullheader/HRPullHeader';
import { HRPullFooterView } from '../pullfooter/HRPullFooter';
import { HRListItemView } from './HRListItemView';
import { HRListDataSource } from './HRListDataSource';
import { HRListView } from './HRListView';
import { HippyEndBatchCallback } from '../../uimanager/HRViewManager';
import { buildHippyRenderView } from '../../HippyRenderViewBuilder';

const INVALID_STICKY_INDEX: number = -1

enum ScrollAction {
  None,
  PullHeader,
  ReleaseHeader,
  PullFooter,
  ReleaseFooter
}

@Component
export struct HRList {
  private readonly TAG = "HRList"
  @ObjectLink renderView: HRListView
  @ObjectLink children: HippyObservedArray<HippyRenderBaseView>
  private CONTENT_OFFSET: string = "contentOffset";
  private pullAction: ScrollAction = ScrollAction.None;
  private headerView: HRPullHeaderView | null = null;
  private footerView: HRPullFooterView | null = null;
  private lastScrollTime: number = 0;
  private isLastTimeReachEnd: boolean = false;

  @State stickyIndex: number = INVALID_STICKY_INDEX
  private stickyArray: number[] = []
  private stickyStack: number[] = []

  private isDragging: boolean = false

  private lastMoveY: number = 0

  private initOffsetUsed: boolean = false
  private headerViewFullVisible: boolean = false
  private footerViewFullVisible: boolean = false
  private lastItemFullVisibleYOffset: number = 0

  private endBatchCallback: HippyEndBatchCallback | null = null

  dataSource: HRListDataSource | null = null

  private handleOnChildrenUpdated() {
    let childrenCount = this.children.length
    if (childrenCount > 0) {
      if (this.children[0] instanceof HRPullHeaderView) {
        this.headerView = this.children[0] as HRPullHeaderView
        this.renderView.hasPullHeader = true
        this.renderView.pullHeaderHeight = this.headerView.cssHeight
      }
      if (this.children[childrenCount - 1] instanceof HRPullFooterView) {
        this.footerView = this.children[childrenCount - 1] as HRPullFooterView
      }
    }

    this.stickyArray.splice(0, this.stickyArray.length)
    this.children.forEach((element, index) => {
      if (element instanceof HRListItemView) {
        if ((element as HRListItemView).sticky) {
          this.stickyArray.push(index)
        }
      }
    })
  }

  aboutToAppear(): void {
    LogUtils.d(this.TAG, "aboutToAppear: ")
    this.renderView.uiCtx = this.getUIContext()

    this.dataSource = new HRListDataSource(this.children)
    this.handleOnChildrenUpdated()

    this.endBatchCallback = () => {
      this.handleOnChildrenUpdated()
      this.dataSource?.notifyReload()

      if (!this.initOffsetUsed) {
        this.initOffsetUsed = true
        if (this.renderView.initialOffset > 0) {
          let y = 0
          let offset = this.renderView.scroller.currentOffset()
          if (offset) {
            y = offset.yOffset
          } else if (this.headerView) {
            y = this.headerView.cssHeight
          }
          let yOffset = y + this.renderView.initialOffset
          this.renderView.scroller.scrollTo({
            xOffset: 0,
            yOffset: yOffset,
            animation: true
          })
        }
      }
    }
    this.renderView.ctx.getNativeRender().addEndBatchCallback(this.renderView.ctx.getRootId(), this.endBatchCallback)
  }

  aboutToDisappear(): void {
    LogUtils.d(this.TAG, "aboutToDisappear: ")
    this.renderView.ctx.getNativeRender().removeEndBatchCallback(this.renderView.ctx.getRootId(), this.endBatchCallback as HippyEndBatchCallback)
  }

  emitScrollEvent(eventName: string) {
    if (!HREventUtils.checkRegisteredEvent(this.renderView.ctx, this.renderView.tag, eventName)) {
      return
    }

    let contentInset = new Map<string, number>() as HippyMap;
    contentInset.set("top", 0);
    contentInset.set("bottom", 0);
    contentInset.set("left", 0);
    contentInset.set("right", 0);

    let contentOffset = new Map<string, number>() as HippyMap;
    contentOffset.set("x", this.renderView.scroller.currentOffset().xOffset);
    contentOffset.set("y", this.renderView.scroller.currentOffset().yOffset);

    let contentSize = new Map<string, number>() as HippyMap;
    contentSize.set("width", this.renderView.children.length > 0 ? this.renderView.children[0].cssWidth : this.renderView.cssWidth);
    contentSize.set("height", this.renderView.children.length > 0 ? this.renderView.children[0].cssHeight : this.renderView.cssHeight);

    let layoutMeasurement = new Map<string, number>() as HippyMap;
    layoutMeasurement.set("width", this.renderView.cssWidth);
    layoutMeasurement.set("height", this.renderView.cssHeight);

    let params = new Map<string, HippyMap>() as HippyMap;
    params.set("contentInset", contentInset);
    params.set("contentOffset", contentOffset);
    params.set("contentSize", contentSize);
    params.set("layoutMeasurement", layoutMeasurement);

    HREventUtils.sendComponentEvent(this.renderView.ctx, this.renderView.tag, eventName, params as HippyMap);
  }

  checkSendOnScrollEvent() {
    if (this.renderView.onScrollEventEnable) {
      let currentTime = systemDateTime.getTime(false);
      if (currentTime - this.lastScrollTime >= this.renderView.scrollEventThrottle) {
        this.lastScrollTime = currentTime;
        this.emitScrollEvent(HREventUtils.EVENT_SCROLLER_ON_SCROLL);
      }
    }
  }

  /**
   * 检查是否已经触底，发生onEndReached事件给前端
   * 如果上次是没有到底，这次滑动底了，需要发事件通知，如果上一次已经是到底了，这次到底不会发事件
   */
  checkSendReachEndEvent(lastIndex: number) {
    let isThisTimeReachEnd: boolean = false;
    isThisTimeReachEnd = this.isReachEnd(lastIndex);

    if (!this.isLastTimeReachEnd && isThisTimeReachEnd) {
      this.sendOnReachedEvent();
    }
    this.isLastTimeReachEnd = isThisTimeReachEnd;
  }

  isReachEnd(lastIndex: number): boolean {
    if (this.renderView.preloadItemNumber > 0 && lastIndex >= (this.children.length - this.renderView.preloadItemNumber)) {
      return true;
    } else {
      return false;
    }
  }

  sendOnReachedEvent() {
    HREventUtils.sendComponentEvent(this.renderView.ctx, this.renderView.tag, HREventUtils.EVENT_RECYCLER_END_REACHED, null);
    HREventUtils.sendComponentEvent(this.renderView.ctx, this.renderView.tag, HREventUtils.EVENT_RECYCLER_LOAD_MORE, null);
  }

  private checkBeginDrag() {
    if (!this.isDragging) {
      this.isDragging = true
      if (this.renderView.scrollBeginDragEventEnable) {
        this.emitScrollEvent(HREventUtils.EVENT_SCROLLER_BEGIN_DRAG)
      }
    }
  }

  private checkEndDrag() {
    if (this.isDragging) {
      this.isDragging = false
      if (this.renderView.scrollEndDragEventEnable) {
        this.emitScrollEvent(HREventUtils.EVENT_SCROLLER_END_DRAG)
      }
      if (this.renderView.momentumScrollBeginEventEnable) {
        this.emitScrollEvent(HREventUtils.EVENT_SCROLLER_MOMENTUM_BEGIN);
      }

      if (this.headerView && this.pullAction == ScrollAction.PullHeader) {
        if (this.headerViewFullVisible) {
          HREventUtils.sendComponentEvent(this.headerView.ctx, this.headerView.tag,
            HREventUtils.EVENT_PULL_HEADER_RELEASED, null)
        } else {
          this.renderView.scroller.scrollToIndex(1, true)
        }
        this.pullAction = ScrollAction.None
      } else if (this.footerView && this.pullAction == ScrollAction.PullFooter) {
        if (this.footerViewFullVisible) {
          HREventUtils.sendComponentEvent(this.footerView.ctx, this.footerView.tag,
            HREventUtils.EVENT_PULL_FOOTER_RELEASED, null)
        } else {
          let lastIndex = this.dataSource!.totalCount() - 1
          this.renderView.scroller.scrollToIndex(lastIndex - 1, true, ScrollAlign.END)
        }
        this.pullAction = ScrollAction.None
      }
    }
  }

  private checkPullOnItemVisibleAreaChange(index: number, isVisible: boolean, currentRatio: number) {
    let lastIndex = this.dataSource!.totalCount() - 1
    if (this.headerView && index == 0) {
      if (isVisible) {
        if (this.isDragging) {
          this.pullAction = ScrollAction.PullHeader
          if (currentRatio >= 1.0) {
            this.headerViewFullVisible = true
          } else {
            this.headerViewFullVisible = false
          }
        } else {
          this.renderView.scroller.scrollToIndex(1, true)
        }
      } else {
        this.headerViewFullVisible = false
        if (currentRatio <= 0.0) {
          this.pullAction = ScrollAction.None
        }
      }
    } else if (this.footerView && index == lastIndex) {
      if (isVisible) {
        if (this.isDragging) {
          this.pullAction = ScrollAction.PullFooter
          if (currentRatio >= 1.0) {
            this.footerViewFullVisible = true
          } else {
            this.footerViewFullVisible = false
          }
        } else {
          this.renderView.scroller.scrollToIndex(lastIndex - 1, true, ScrollAlign.END)
        }
      } else {
        this.footerViewFullVisible = false
        if (currentRatio <= 0.0) {
          this.pullAction = ScrollAction.None
        }
      }
    } else if (this.footerView && index == lastIndex - 1) {
      if (isVisible && currentRatio >= 1.0) {
        this.lastItemFullVisibleYOffset = this.renderView.scroller.currentOffset().yOffset
      }
    }
  }

  private checkPullOnScroll() {
    let offset = this.renderView.scroller.currentOffset();
    let yOff: number = offset.yOffset;

    if (this.headerView && this.pullAction === ScrollAction.PullHeader) {
      let params = new Map<string, Number>() as HippyMap;
      params.set(this.CONTENT_OFFSET, -yOff + this.headerView.cssHeight);
      HREventUtils.sendComponentEvent(this.headerView.ctx, this.headerView.tag,
        HREventUtils.EVENT_PULL_HEADER_PULLING, params);
    } else if (this.footerView && this.pullAction === ScrollAction.PullFooter) {
      let params = new Map<string, Number>() as HippyMap;
      params.set(this.CONTENT_OFFSET, yOff - this.lastItemFullVisibleYOffset);
      HREventUtils.sendComponentEvent(this.footerView.ctx, this.footerView.tag,
        HREventUtils.EVENT_PULL_FOOTER_PULLING, params);
    }
  }

  private checkStickyOnItemVisibleAreaChange(index: number, isVisible: boolean, currentRatio: number) {
    let moveUp = false
    let offset = this.renderView.scroller.currentOffset()
    if (offset) {
      let y = offset.yOffset
      if (y > this.lastMoveY) {
        moveUp = true
      }
      this.lastMoveY = y
    }

    if (!isVisible && moveUp) {
      if (this.stickyIndex != index && this.stickyArray.indexOf(index) >= 0) {
        this.stickyStack.push(index)
        this.stickyIndex = index
      }
    }

    if (isVisible && currentRatio >= 1.0) {
      if (this.stickyStack.length > 0 && this.stickyStack[this.stickyStack.length - 1] == index) {
        this.stickyStack.pop()
      }
      if (this.stickyStack.length > 0) {
        this.stickyIndex = this.stickyStack[this.stickyStack.length - 1]
      } else {
        this.stickyIndex = INVALID_STICKY_INDEX
      }
    }
  }

  build() {
    Stack() {
      List({ initialIndex: this.headerView ? 1 : 0, scroller: this.renderView.scroller }) {
        LazyForEach(this.dataSource, (item: HippyRenderBaseView, index) => {
          ListItem() {
            buildHippyRenderView(item, null)
          }
          .onVisibleAreaChange([0.0, 1.0], (isVisible: boolean, currentRatio: number) => {
            this.checkPullOnItemVisibleAreaChange(index, isVisible, currentRatio)
            if (this.renderView.rowShouldSticky) {
              this.checkStickyOnItemVisibleAreaChange(index, isVisible, currentRatio)
            }
            if (this.renderView.exposureEventEnabled && item instanceof HRListItemView) {
              item.checkExposureView(isVisible ? currentRatio : 0.0)
            }
          })
        }, (item: HippyRenderBaseView) => item.tag + '')
      }
      .width('100%')
      .height('100%')
      .listDirection(this.renderView.listDirection)
      .enableScrollInteraction(this.renderView.scrollEnabled)
      .cachedCount(this.renderView.cachedCount)
      .scrollBar(BarState.Off)
      .edgeEffect(this.renderView.edgeEffect)
      .onTouch((e: TouchEvent) => {
        switch (e.type) {
          case TouchType.Down:
          case TouchType.Move:
            this.checkBeginDrag()
            break
          case TouchType.Up:
          case TouchType.Cancel:
            this.checkEndDrag()
            break
        }
      })
      .nestedScroll({
        scrollForward: this.renderView.scrollForward,
        scrollBackward: this.renderView.scrollBackward
      })
      .onScrollIndex((firstIndex: number, lastIndex: number, centerIndex: number) => {
        LogUtils.d(this.TAG, "onScrollIndex: firstIndex=" + firstIndex +
          ", lastIndex=" + lastIndex + ", centerIndex=" + centerIndex + ",yOffset=" + this.renderView.scroller.currentOffset()
          .yOffset);
        this.checkSendReachEndEvent(lastIndex);
      })
      .onScroll((scrollOffset: number, scrollState: ScrollState) => {
        this.checkSendOnScrollEvent();
        this.checkPullOnScroll()
      })
      .onScrollStart(() => {
        LogUtils.d(this.TAG, "onScroll: onScrollStart=");
      })
      .onScrollStop(() => {
        LogUtils.d(this.TAG, "onScroll: onScrollStop=");
        if (this.renderView.momentumScrollEndEventEnable) {
          this.emitScrollEvent(HREventUtils.EVENT_SCROLLER_MOMENTUM_END);
        }
        if (this.renderView.onScrollEventEnable) {
          this.emitScrollEvent(HREventUtils.EVENT_SCROLLER_ON_SCROLL);
        }
      })
      .onReachStart(() => {
        LogUtils.d(this.TAG, 'onReachStart')
      })
      .onReachEnd(() => {
        LogUtils.d(this.TAG, 'onReachEnd')
        this.sendOnReachedEvent();
      })

      // sticky item
      if (this.renderView.rowShouldSticky) {
        Column() {
          ForEach(this.stickyArray, (index: number) => {
            if (index == this.stickyIndex) {
              buildHippyRenderView(this.children[index], null)
            }
          })
        }
        .width("100%")
        .height("100%")
        .hitTestBehavior(HitTestMode.Transparent)
      }
    }.applyRenderViewBaseAttr(this.renderView)
  }
}

// base props for all components
@Extend(Stack)
function applyRenderViewBaseAttr($$: HippyRenderBaseView) {
  .key(HIPPY_COMPONENT_KEY_PREFIX + $$.tag)
  .backgroundColor($$.cssBackgroundColor)
  .position({x: $$.cssPositionX, y: $$.cssPositionY})
  .size({width:$$.cssWidth, height: $$.cssHeight})
  .opacity($$.cssOpacity)
  .clip($$.cssOverflow)
  .visibility(($$ as HippyRenderBaseView).cssVisibility) // must add as, otherwise the compiler has error
  .zIndex($$.cssZIndex)
  .accessibilityText($$.cssAccessibilityLabel)
  .focusable($$.cssFocusable)
  .border($$.cssBorder)
  .shadow($$.cssShadow)
  .linearGradient($$.cssLinearGradient)
  .backgroundImage($$.cssBackgroundImage)
  .backgroundImageSize($$.cssBackgroundImageSize)
  .backgroundImagePosition($$.cssBackgroundImagePosition)
  .transform($$.cssMatrix)
  .rotate($$.cssRotate)
  .scale($$.cssScale)
  .translate($$.cssTranslate)
  .hitTestBehavior($$.hitTestBehavior)
  .onClick($$.eventClick)
}
