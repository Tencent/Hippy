/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
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
import { HippyAny } from '../../support/common/HippyTypes'
import { NativeRenderContext } from '../NativeRenderContext'
import { NativeRenderProviderManager } from '../NativeRenderProviderManager'

export enum HREventType {
  COMPONENT,
  GESTURE,
  CUSTOM,
  ROOT
}

export class HREventUtils {
  // On image loaded.
  static readonly EVENT_IMAGE_ON_LOAD = "load"
  // On image load error.
  static readonly EVENT_IMAGE_LOAD_ERROR = "error"
  // On image load end.
  static readonly EVENT_IMAGE_LOAD_END = "loadEnd"
  // On image load start.
  static readonly EVENT_IMAGE_LOAD_START = "loadStart"
  // On image load progress.
  static readonly EVENT_IMAGE_LOAD_PROGRESS = "progress"

  // On list view header released.
  static readonly EVENT_LIST_HEADER_RELEASED = "headerReleased"
  // On list view header pulling.
  static readonly EVENT_LIST_HEADER_PULLING = "headerPulling"
  // On list view footer released.
  static readonly EVENT_LIST_FOOTER_RELEASED = "footerReleased"
  // On list view footer pulling.
  static readonly EVENT_LIST_FOOTER_PULLING = "footerPulling"
  // On list view item will appear, event of exposure monitor.
  static readonly EVENT_LIST_ITEM_WILL_APPEAR = "willAppear"
  // On list view item appear, event of exposure monitor.
  static readonly EVENT_LIST_ITEM_APPEAR = "appear"
  // On list view item disappear, event of exposure monitor.
  static readonly EVENT_LIST_ITEM_DISAPPEAR = "disappear"
  // On list view item will disappear, event of exposure monitor.
  static readonly EVENT_LIST_ITEM_WILL_DISAPPEAR = "willDisappear"

  // On recycler view scroll to end.
  static readonly EVENT_RECYCLER_END_REACHED = "endReached"
  static readonly EVENT_RECYCLER_LOAD_MORE = "loadMore"
  // On recycler view first screen ready.
  static readonly EVENT_RECYCLER_LIST_READY = "initialListReady"

  // On pull footer view released.
  static readonly EVENT_PULL_FOOTER_RELEASED = "footerReleased"
  // On pull footer view pulling.
  static readonly EVENT_PULL_FOOTER_PULLING = "footerPulling"
  // On pull header view pulling.
  static readonly EVENT_PULL_HEADER_PULLING = "headerPulling"
  // On pull header view released.
  static readonly EVENT_PULL_HEADER_RELEASED = "headerReleased"

  // On modal view request close.
  static readonly EVENT_MODAL_REQUEST_CLOSE = "requestClose"
  // On modal view show.
  static readonly EVENT_MODAL_SHOW = "show"

  // On refresh wrapper view refresh.
  static readonly EVENT_REFRESH_WRAPPER_REFRESH = "refresh"
  // On refresh wrapper view scroll.
  static readonly EVENT_REFRESH_WRAPPER_SCROLL = "scroll"

  // On view page item will appear, event of exposure monitor.
  static readonly EVENT_PAGE_ITEM_WILL_APPEAR = "willAppear"
  // On view page item appear, event of exposure monitor.
  static readonly EVENT_PAGE_ITEM_DID_APPEAR = "didAppear"
  // On view page item will disappear, event of exposure monitor.
  static readonly EVENT_PAGE_ITEM_WILL_DISAPPEAR = "willDisAppear"
  // On view page item disappear, event of exposure monitor.
  static readonly EVENT_PAGE_ITEM_DID_DISAPPEAR = "didDisAppear"
  // On view page scroll.
  static readonly EVENT_PAGE_SCROLL = "pageScroll"
  // On view page scroll state changed.
  static readonly EVENT_PAGE_SCROLL_STATE_CHANGED = "pageScrollStateChanged"
  // On view page selected.
  static readonly EVENT_PAGE_SELECTED = "pageSelected"

  // On waterfall view footer appeared.
  static readonly EVENT_WATERFALL_FOOTER_APPEARED = "footerAppeared"
  // On waterfall view refresh.
  static readonly EVENT_WATERFALL_REFRESH = "refresh"
  // On waterfall view scroll report.
  static readonly EVENT_WATERFALL_SCROLL_REPORT = "scrollForReport"
  // On waterfall view exposure report.
  static readonly EVENT_WATERFALL_EXPOSURE_REPORT = "exposureReport"
  // On waterfall view end reached.
  static readonly EVENT_WATERFALL_END_REACHED = "endReached"

  // On scroll view begin drag.
  static readonly EVENT_SCROLLER_BEGIN_DRAG = "scrollBeginDrag"
  // On scroll view end drag.
  static readonly EVENT_SCROLLER_END_DRAG = "scrollEndDrag"
  // On scroll view on scroll.
  static readonly EVENT_SCROLLER_ON_SCROLL = "scroll"
  // On scroll view momentum begin.
  static readonly EVENT_SCROLLER_MOMENTUM_BEGIN = "momentumScrollBegin"
  // On scroll view momentum end.
  static readonly EVENT_SCROLLER_MOMENTUM_END = "momentumScrollEnd"

  static checkRegisteredEvent(ctx: NativeRenderContext, nodeId: number, eventName: string): boolean {
    let intanceId = ctx.getInstanceId()
    let rootId = ctx.getRootId()
    let provider = NativeRenderProviderManager.getRenderProvider(intanceId)
    if (provider) {
      return provider.getNativeRenderImpl().checkRegisteredEvent(rootId, nodeId, eventName.toLowerCase())
    }
    return false
  }

  static sendComponentEvent(ctx: NativeRenderContext, nodeId: number, eventName: string, params: HippyAny) {
    HREventUtils.send(ctx, nodeId, eventName, params, false, false, HREventType.COMPONENT)
  }

  static sendGestureEvent(ctx: NativeRenderContext, nodeId: number, eventName: string, params: HippyAny) {
    HREventUtils.send(ctx, nodeId, eventName, params, true, true, HREventType.GESTURE)
  }

  static sendCustomEvent(ctx: NativeRenderContext, nodeId: number, eventName: string, params: HippyAny, useCapture: boolean, useBubble: boolean) {
    HREventUtils.send(ctx, nodeId, eventName, params, useCapture, useBubble, HREventType.CUSTOM)
  }

  static sendRootEvent(rendererId: number, rootId: number, eventName: string, params: HippyAny) {
    let provider = NativeRenderProviderManager.getRenderProvider(rendererId)
    if (provider) {
      provider.dispatchEvent(rootId, rootId, eventName, params, false, false, HREventType.ROOT)
    }
  }

  static send(ctx: NativeRenderContext, nodeId: number, eventName: string, params: HippyAny, useCapture: boolean, useBubble: boolean, eventType: HREventType) {
    let intanceId = ctx.getInstanceId()
    let rootId = ctx.getRootId()
    let provider = NativeRenderProviderManager.getRenderProvider(intanceId)
    if (provider) {
      provider.dispatchEvent(rootId, nodeId, eventName, params, useCapture, useBubble, eventType)
    }
  }
}
