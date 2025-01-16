/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#pragma once

#include <string>
#include "renderer/utils/hr_types.h"
#include "renderer/native_render_context.h"
#include "footstone/hippy_value.h"

namespace hippy {
inline namespace render {
inline namespace native {

using HippyValue = footstone::HippyValue;

enum class HREventType { COMPONENT, GESTURE, CUSTOM, ROOT };

class HREventUtils {
public:
  // On image loaded.
  constexpr static const char * EVENT_IMAGE_ON_LOAD = "load";
  // On image load error.
  constexpr static const char * EVENT_IMAGE_LOAD_ERROR = "error";
  // On image load end.
  constexpr static const char * EVENT_IMAGE_LOAD_END = "loadEnd";
  // On image load start.
  constexpr static const char * EVENT_IMAGE_LOAD_START = "loadStart";
  // On image load progress.
  constexpr static const char * EVENT_IMAGE_LOAD_PROGRESS = "progress";

  // On list view header released.
  constexpr static const char * EVENT_LIST_HEADER_RELEASED = "headerReleased";
  // On list view header pulling.
  constexpr static const char * EVENT_LIST_HEADER_PULLING = "headerPulling";
  // On list view footer released.
  constexpr static const char * EVENT_LIST_FOOTER_RELEASED = "footerReleased";
  // On list view footer pulling.
  constexpr static const char * EVENT_LIST_FOOTER_PULLING = "footerPulling";
  // On list view item will appear, event of exposure monitor.
  constexpr static const char * EVENT_LIST_ITEM_WILL_APPEAR = "willAppear";
  // On list view item appear, event of exposure monitor.
  constexpr static const char * EVENT_LIST_ITEM_APPEAR = "appear";
  // On list view item disappear, event of exposure monitor.
  constexpr static const char * EVENT_LIST_ITEM_DISAPPEAR = "disappear";
  // On list view item will disappear, event of exposure monitor.
  constexpr static const char * EVENT_LIST_ITEM_WILL_DISAPPEAR = "willDisappear";

  // On recycler view scroll to end.
  constexpr static const char * EVENT_RECYCLER_END_REACHED = "endReached";
  constexpr static const char * EVENT_RECYCLER_LOAD_MORE = "loadMore";
  // On recycler view first screen ready.
  constexpr static const char * EVENT_RECYCLER_LIST_READY = "initialListReady";

  // On pull footer view released.
  constexpr static const char * EVENT_PULL_FOOTER_RELEASED = "footerReleased";
  // On pull footer view pulling.
  constexpr static const char * EVENT_PULL_FOOTER_PULLING = "footerPulling";
  // On pull header view pulling.
  constexpr static const char * EVENT_PULL_HEADER_PULLING = "headerPulling";
  // On pull header view released.
  constexpr static const char * EVENT_PULL_HEADER_RELEASED = "headerReleased";

  // On modal view request close.
  constexpr static const char * EVENT_MODAL_REQUEST_CLOSE = "requestClose";
  // On modal view show.
  constexpr static const char * EVENT_MODAL_SHOW = "show";

  // On refresh wrapper view refresh.
  constexpr static const char * EVENT_REFRESH_WRAPPER_REFRESH = "refresh";
  // On refresh wrapper view scroll.
  constexpr static const char * EVENT_REFRESH_WRAPPER_SCROLL = "scroll";

  // On view page item will appear, event of exposure monitor.
  constexpr static const char * EVENT_PAGE_ITEM_WILL_APPEAR = "willAppear";
  // On view page item appear, event of exposure monitor.
  constexpr static const char * EVENT_PAGE_ITEM_DID_APPEAR = "didAppear";
  // On view page item will disappear, event of exposure monitor.
  constexpr static const char * EVENT_PAGE_ITEM_WILL_DISAPPEAR = "willDisAppear";
  // On view page item disappear, event of exposure monitor.
  constexpr static const char * EVENT_PAGE_ITEM_DID_DISAPPEAR = "didDisAppear";
  // On view page scroll.
  constexpr static const char * EVENT_PAGE_SCROLL = "pageScroll";
  // On view page scroll state changed.
  constexpr static const char * EVENT_PAGE_SCROLL_STATE_CHANGED = "pageScrollStateChanged";
  // On view page selected.
  constexpr static const char * EVENT_PAGE_SELECTED = "pageSelected";

  // On waterfall view footer appeared.
  constexpr static const char * EVENT_WATERFALL_FOOTER_APPEARED = "footerAppeared";
  // On waterfall view refresh.
  constexpr static const char * EVENT_WATERFALL_REFRESH = "refresh";
  // On waterfall view scroll report.
  constexpr static const char * EVENT_WATERFALL_SCROLL_REPORT = "scrollForReport";
  // On waterfall view exposure report.
  constexpr static const char * EVENT_WATERFALL_EXPOSURE_REPORT = "exposureReport";
  // On waterfall view end reached.
  constexpr static const char * EVENT_WATERFALL_END_REACHED = "endReached";

  // On scroll view begin drag.
  constexpr static const char * EVENT_SCROLLER_BEGIN_DRAG = "scrollBeginDrag";
  // On scroll view end drag.
  constexpr static const char * EVENT_SCROLLER_END_DRAG = "scrollEndDrag";
  // On scroll view on scroll.
  constexpr static const char * EVENT_SCROLLER_ON_SCROLL = "scroll";
  // On scroll view momentum begin.
  constexpr static const char * EVENT_SCROLLER_MOMENTUM_BEGIN = "momentumScrollBegin";
  // On scroll view momentum end.
  constexpr static const char * EVENT_SCROLLER_MOMENTUM_END = "momentumScrollEnd";
  
  static bool CheckRegisteredEvent(std::shared_ptr<NativeRenderContext> &ctx, uint32_t node_id, const std::string &event_name);
  
  inline static void SendComponentEvent(std::shared_ptr<NativeRenderContext> &ctx, uint32_t node_id, const std::string &event_name,
    const std::shared_ptr<HippyValue> &params) {
    HREventUtils::Send(ctx, node_id, event_name, params, false, false, HREventType::COMPONENT);
  }

  inline static void SendGestureEvent(std::shared_ptr<NativeRenderContext> &ctx, uint32_t node_id, const std::string &event_name,
    const std::shared_ptr<HippyValue> &params) {
    HREventUtils::Send(ctx, node_id, event_name, params, true, true, HREventType::GESTURE);
  }
  
  inline static void SendCustomEvent(std::shared_ptr<NativeRenderContext> &ctx, uint32_t node_id, const std::string &event_name,
    const std::shared_ptr<HippyValue> &params,
    bool use_capture, bool use_bubble) {
    HREventUtils::Send(ctx, node_id, event_name, params, use_capture, use_bubble, HREventType::CUSTOM);
  }
  
  static void SendRootEvent(uint32_t renderer_id, uint32_t root_id, const std::string &event_name, const std::shared_ptr<HippyValue> &params);
  
private:
  static void Send(std::shared_ptr<NativeRenderContext> &ctx, uint32_t node_id, const std::string &event_name,
    const std::shared_ptr<HippyValue> &params,
    bool use_capture, bool use_bubble, HREventType event_type);

};

} // namespace native
} // namespace render
} // namespace hippy
