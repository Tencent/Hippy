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
import { HippyAny, HippyMap, HippyRenderCallback } from '../../../support/common/HippyTypes';
import { NativeRenderContext } from '../../NativeRenderContext';
import { HREventUtils } from '../../utils/HREventUtils'
import HippyRenderBaseView, {
  HippyObservedArray,
  HIPPY_COMPONENT_KEY_PREFIX } from '../base/HippyRenderBaseView';
import { LogUtils } from '../../../support/utils/LogUtils';
import { HRValueUtils } from '../../utils/HRValueUtils';
import { HRPullFooterView } from '../pullfooter/HRPullFooter';
import { HRNodeProps } from '../../dom_node/HRNodeProps';
import { HRWaterfallItemView } from './HRWaterfallItemView';
import { HRWaterfallView } from './HRWaterfallView';
import { HRWaterfallDataSource } from './HRWaterfallDataSource';
import { HRPullHeaderView } from '../pullheader/HRPullHeader';
import { HippyEndBatchCallback } from '../../uimanager/HRViewManager';
import { buildHippyRenderView } from '../../HippyRenderViewBuilder';

@Component
export struct HRWaterfall {
  private readonly TAG = "HRWaterfall"
  @ObjectLink renderView: HRWaterfallView
  @ObjectLink children: HippyObservedArray<HippyRenderBaseView>

  private CONTENT_OFFSET: string = "contentOffset";

  private endBatchCallback: HippyEndBatchCallback | null = null;

  private headerView: HRPullHeaderView | null = null;
  private bannerView: HippyRenderBaseView | null = null;
  private footerView: HRPullFooterView | null = null;

  private isLastTimeReachEnd: boolean = false;

  @State isRefreshing: boolean = false;

  dataSource: HRWaterfallDataSource | null = null;

  private handleOnChildrenUpdated() {
    let childrenCount = this.children.length
    if (childrenCount > 0) {
      if (this.children[0] instanceof HRPullHeaderView) {
        this.headerView = this.children[0] as HRPullHeaderView
        if (childrenCount > 1) {
          if (!(this.children[1] instanceof HRWaterfallItemView)) {
            this.bannerView = this.children[1]
          }
        }
      } else if (!(this.children[0] instanceof HRWaterfallItemView)) {
        this.bannerView = this.children[0]
      }
      if (this.children[childrenCount - 1] instanceof HRPullFooterView) {
        this.footerView = this.children[childrenCount - 1] as HRPullFooterView
      }

      if (this.bannerView) {
        this.bannerView.cssPositionX = 0
        this.bannerView.cssPositionY = 0
      }
    }
  }

  aboutToAppear() {
    LogUtils.d(this.TAG, `aboutToAppear: ${this.children.length}}`)
    this.renderView.uiCtx = this.getUIContext()

    this.dataSource = new HRWaterfallDataSource(this.children)
    this.handleOnChildrenUpdated()

    this.endBatchCallback = () => {
      this.handleOnChildrenUpdated()
      this.dataSource?.notifyReload()
    }
    this.renderView.ctx.getNativeRender().addEndBatchCallback(this.renderView.ctx.getRootId(), this.endBatchCallback)

    this.renderView.onHeadRefreshFinishCallback = () => {
      this.isRefreshing = false
    }
  }

  aboutToDisappear() {
    LogUtils.d(this.TAG, "aboutToDisappear: ")
    this.renderView.ctx.getNativeRender().removeEndBatchCallback(this.renderView.ctx.getRootId(), this.endBatchCallback as HippyEndBatchCallback)

    this.renderView.onHeadRefreshFinishCallback = null
  }

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

  @Builder
  customRefreshComponent() {
    if (this.headerView) {
      Row() {
        buildHippyRenderView(this.headerView as HippyRenderBaseView, null)
      }
      .width("100%")
      .alignItems(VerticalAlign.Bottom)
    }
  }

  @Builder
  customFooter() {
    if (this.footerView) {
      buildHippyRenderView(this.footerView, null)
    }
  }

  build() {
    Column() {
      Refresh({ refreshing: $$this.isRefreshing, builder: this.customRefreshComponent() }) {
        Scroll() {
          Column({ space: this.renderView.interItemSpacing }) {
            if (this.bannerView) {
              Stack() {
                buildHippyRenderView(this.bannerView, null)
              }
              .clip(true)
            }

            WaterFlow({ footer: this.customFooter(), scroller: this.renderView.scroller }) {
              LazyForEach(this.dataSource, (item: HippyRenderBaseView) => {
                FlowItem() {
                  buildHippyRenderView(item, null)
                }
              }, (item: HippyRenderBaseView) => item.tag + '')
            }
            .width('100%')
            .height('100%')
            .edgeEffect(this.renderView.edgeEffect)
            .columnsTemplate(this.renderView.columnsTemplate)
            .columnsGap(this.renderView.columnSpacing)
            .rowsGap(this.renderView.interItemSpacing)
            .cachedCount(4)
            .nestedScroll({
              scrollForward: NestedScrollMode.PARENT_FIRST,
              scrollBackward: NestedScrollMode.SELF_FIRST
            })
            .onScrollIndex((first: number, last: number) => {
              this.checkSendReachEndEvent(last);
            })
            .onReachEnd(() => {
              this.sendOnReachedEvent();
            })
          }
          .padding(this.renderView.padding)
        }
        .enableScrollInteraction(false)
        .scrollBar(BarState.Off)
        .nestedScroll({
          scrollForward: NestedScrollMode.PARENT_FIRST,
          scrollBackward: NestedScrollMode.SELF_FIRST})
      }
      .onStateChange((refreshStatus: RefreshStatus) => {
        if (this.headerView) {
          if (refreshStatus == RefreshStatus.Drag) {
            let params = new Map<string, Number>() as HippyMap;
            params.set(this.CONTENT_OFFSET, this.headerView.cssHeight);
            HREventUtils.sendComponentEvent(this.headerView.ctx, this.headerView.tag,
              HREventUtils.EVENT_PULL_HEADER_PULLING, params);
          }
        }
      })
      .onRefreshing(() => {
        if (this.headerView) {
          HREventUtils.sendComponentEvent(this.headerView.ctx, this.headerView.tag,
            HREventUtils.EVENT_PULL_HEADER_RELEASED, null);
        } else {
          this.isRefreshing = false
        }
      })
    }
    .applyRenderViewBaseAttr(this.renderView)
  }

}

// base props for all components
@Extend(Column)
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
