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
import { HippyAny, HippyRenderCallback } from '../../../support/common/HippyTypes';
import { NativeRenderContext } from '../../NativeRenderContext';
import HippyRenderBaseView from '../base/HippyRenderBaseView';
import { LogUtils } from '../../../support/utils/LogUtils';
import { HRValueUtils } from '../../utils/HRValueUtils';

@Observed
export class HRListView extends HippyRenderBaseView {
  private readonly TAG = "HRListView"
  public scrollForward: number = NestedScrollMode.SELF_FIRST
  public scrollBackward: number = NestedScrollMode.SELF_FIRST
  public scroller: ListScroller = new ListScroller()
  public uiCtx: UIContext | null = null
  listDirection: Axis = Axis.Vertical;
  scrollEnabled: boolean = true;
  initialOffset: number = 0;
  edgeEffect: EdgeEffect = EdgeEffect.Spring;
  cachedCount: number = 4;
  scrollEventThrottle: number = 30;
  preloadItemNumber: number = 0;
  exposureEventEnabled: Boolean = false;
  rowShouldSticky: boolean = false

  scrollBeginDragEventEnable: boolean = false
  scrollEndDragEventEnable: boolean = false
  momentumScrollBeginEventEnable: boolean = false
  momentumScrollEndEventEnable: boolean = false
  onScrollEventEnable: boolean = false

  hasPullHeader: boolean = false
  pullHeaderHeight: number = 0

  constructor(ctx: NativeRenderContext) {
    super(ctx)
  }

  setProp(propKey: string, propValue: HippyAny | HippyRenderCallback): boolean {
    LogUtils.d(this.TAG, "setProp: propKey " + propKey + ", value: " + propValue)
    switch (propKey) {
      case 'nestedScrollTopPriority':
        {
          let value = HRValueUtils.getString(propValue as HippyAny)
          if (value === 'parent') {
            this.scrollForward = NestedScrollMode.PARENT_FIRST
            //this.scrollBackward = NestedScrollMode.PARENT_FIRST
          } else if (value === 'self') {
            this.scrollForward = NestedScrollMode.SELF_FIRST
            //this.scrollBackward = NestedScrollMode.SELF_FIRST
          }
        }
        return true
      case "horizontal":
        this.listDirection = HRValueUtils.getBoolean(propValue as HippyAny, false) == true ? Axis.Horizontal : Axis.Vertical;
        return true
      case "scrollEnabled":
        this.scrollEnabled = HRValueUtils.getBoolean(propValue as HippyAny, true);
        return true
      case "initialContentOffset":
        this.initialOffset = HRValueUtils.getNumber(propValue as HippyAny);
        return true
      case "itemViewCacheSize":
        this.cachedCount = HRValueUtils.getNumber(propValue as HippyAny);
        return true
      case "scrollEventThrottle":
        this.scrollEventThrottle = HRValueUtils.getNumber2(propValue as HippyAny, 30);
        return true
      case "preloadItemNumber":
        this.preloadItemNumber = HRValueUtils.getNumber(propValue as HippyAny);
        return true
      case "exposureEventEnabled":
        this.exposureEventEnabled = HRValueUtils.getBoolean(propValue as HippyAny, false);
        return true
      case 'rowShouldSticky':
        this.rowShouldSticky = HRValueUtils.getBoolean(propValue as HippyAny, false);
        return true
      case 'bounces':
        let b = HRValueUtils.getBoolean(propValue as HippyAny, true);
        this.edgeEffect = b ? EdgeEffect.Spring : EdgeEffect.None;
        return true
      case 'scrollbegindrag':
        this.scrollBeginDragEventEnable = HRValueUtils.getBoolean(propValue as HippyAny, false)
        return true
      case 'scrollenddrag':
        this.scrollEndDragEventEnable = HRValueUtils.getBoolean(propValue as HippyAny, false)
        return true
      case 'momentumscrollbegin':
        this.momentumScrollBeginEventEnable = HRValueUtils.getBoolean(propValue as HippyAny, false)
        return true
      case 'momentumscrollend':
        this.momentumScrollEndEventEnable = HRValueUtils.getBoolean(propValue as HippyAny, false)
        return true
      case 'scroll':
        this.onScrollEventEnable = HRValueUtils.getBoolean(propValue as HippyAny, false)
        return true
      default:
        break;
    }

    return super.setProp(propKey, propValue as HippyAny)
  }

  call(method: string, params: Array<HippyAny>, callback: HippyRenderCallback | null): void {
    this.uiCtx?.runScopedTask(() => {
    LogUtils.d(this.TAG, "call: method " + method + ", params: " + params)
    switch (method) {
      case "scrollToIndex":
        {
          let xIndex = HRValueUtils.getNumber(params[0])
          let yIndex = HRValueUtils.getNumber(params[1])
          let animated = HRValueUtils.getBoolean(params[2], false)
          let index = this.listDirection == Axis.Vertical ? yIndex : xIndex
          this.scroller.scrollToIndex(this.hasPullHeader ? index + 1 : index, animated)
        }
        break;
      case "scrollToContentOffset":
        {
          let xOffset = HRValueUtils.getNumber(params[0])
          let yOffset = HRValueUtils.getNumber(params[1])
          let animated = HRValueUtils.getBoolean(params[2], false)
          if (this.listDirection == Axis.Vertical) {
            yOffset += this.pullHeaderHeight
          } else {
            xOffset += this.pullHeaderHeight
          }
          this.scroller.scrollTo({
            xOffset: xOffset,
            yOffset: yOffset,
            animation: animated
          })
        }
        break;
      case "scrollToTop":
        {
          this.scroller.scrollToIndex(this.hasPullHeader ? 1 : 0)
        }
        break
      default:
        break;
      }
    })
  }

}
