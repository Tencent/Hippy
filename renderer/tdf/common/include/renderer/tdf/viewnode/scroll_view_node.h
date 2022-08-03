/**
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

#pragma once

#include <chrono>
#include "core/common/listener.h"
#include "renderer/tdf/viewnode/view_node.h"

namespace tdfrender {

inline namespace scrollview {
constexpr const char kScrollView[] = "ScrollView";
constexpr const char kContentOffset4Reuse[] = "contentOffset4Reuse";    // HippyMap
constexpr const char kFlingEnabled[] = "flingEnabled";                  // boolean
constexpr const char kInitialContentOffset[] = "initialContentOffset";  // int
constexpr const char kPagingEnabled[] = "pagingEnabled";                // boolean
constexpr const char kScrollEnabled[] = "scrollEnabled";                // boolean
constexpr const char kScrollEventThrottle[] = "scrollEventThrottle";    // int
constexpr const char kScrollMinOffset[] = "scrollMinOffset";            // int
constexpr const char kShowScrollIndicator[] = "showScrollIndicator";    // boolean
constexpr const char kHorizontal[] = "horizontal";
constexpr const char kOnScroll[] = "onScroll";
constexpr const char kEventTypeBeginDrag[] = "scrollbegindrag";
constexpr const char kEventTypeEndDrag[] = "scrollenddrag";
constexpr const char kEventTypeScroll[] = "scroll";
constexpr const char kEventTypeMomentumBegin[] = "momentumscrollbegin";
constexpr const char kEventTypeMomentumEnd[] = "momentumscrollend";
constexpr const char kEventTypeAnimationEnd[] = "scrollanimationend";
}  // namespace scrollview

class ScrollViewNode : public ViewNode {
 public:
  using ViewNode::ViewNode;

 protected:
  std::shared_ptr<tdfcore::View> CreateView() override;

  void HandleStyleUpdate(const DomStyleMap& dom_style) override;

  void OnChildAdd(const std::shared_ptr<ViewNode>& child, int64_t index) override;

  void OnChildRemove(const std::shared_ptr<ViewNode>& child) override;

 private:
  void InitScrollStartListener();

  void RegisterScrollStartListener(bool listen, std::shared_ptr<tdfcore::ScrollView> scroll_view);

  void InitScrollUpdateListener();

  void RegisterScrollUpdateListener(bool listen, std::shared_ptr<tdfcore::ScrollView> scroll_view);

  void InitScrollEndListener();

  void RegisterScrollEndListener(bool listen, std::shared_ptr<tdfcore::ScrollView> scroll_view);

  void InitDragStartListener();

  void RegisterDragStartListener(bool listen, std::shared_ptr<tdfcore::ScrollView> scroll_view);

  void InitDragEndListener();

  void RegisterDragEndListener(bool listen, std::shared_ptr<tdfcore::ScrollView> scroll_view);

  void HandleInnerEvent(std::string type);

  const uint64_t kUninitializedId = 0;
  uint64_t child_layout_listener_id_ = kUninitializedId;

  int32_t scroll_event_throttle_ = 400;  // ms
  std::chrono::milliseconds last_scroll_event_timestamp_ = std::chrono::milliseconds(0);
  int32_t min_scroll_offset_ = 0;
  uint64_t scroll_update_listener_id_ = kUninitializedId;
  std::function<void(tdfcore::TPoint, tdfcore::TPoint)> scroll_update_listener_;

  uint64_t scroll_start_listener_id_ = kUninitializedId;
  std::function<void()> scroll_start_listener_;

  uint64_t scroll_end_listener_id_ = kUninitializedId;
  std::function<void()> scroll_end_listener_;

  uint64_t drag_start_listener_id_ = kUninitializedId;
  std::function<void()> drag_start_listener_;

  uint64_t drag_end_listener_id_ = kUninitializedId;
  std::function<void()> drag_end_listener_;
};

}  // namespace tdfrender
