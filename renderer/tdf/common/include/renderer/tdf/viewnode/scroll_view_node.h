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
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wsign-conversion"
#pragma clang diagnostic ignored "-Wsign-compare"
#pragma clang diagnostic ignored "-Wextra-semi"
#pragma clang diagnostic ignored "-Wc++98-compat-extra-semi"
#pragma clang diagnostic ignored "-Wignored-qualifiers"
#pragma clang diagnostic ignored "-Wimplicit-float-conversion"
#pragma clang diagnostic ignored "-Wimplicit-int-conversion"
#pragma clang diagnostic ignored "-Wfloat-conversion"
#pragma clang diagnostic ignored "-Wshadow"
#pragma clang diagnostic ignored "-Wdeprecated-copy"
#include "tdfui/view/scroll_view.h"
#pragma clang diagnostic pop

#include "renderer/tdf/viewnode/view_node.h"

namespace hippy {
inline namespace render {
inline namespace tdf {

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
constexpr const char kScrollTo[] = "scrollTo";
constexpr const char kScrollToWithOptions[] = "scrollToWithOptions";
}  // namespace scrollview

class ScrollViewNode : public ViewNode {
 public:
  using ViewNode::ViewNode;

 protected:
  std::shared_ptr<tdfcore::View> CreateView(const std::shared_ptr<ViewContext> &context) override;

  void HandleStyleUpdate(const DomStyleMap& dom_style, const DomDeleteProps& dom_delete_props) override;

  void OnChildAdd(const std::shared_ptr<ViewNode>& child, int64_t index) override;

  void OnChildRemove(const std::shared_ptr<ViewNode>& child) override;

  void HandleEventInfoUpdate() override;

  void CallFunction(const std::string &name, const DomArgument &param, const uint32_t call_back_id) override;

 private:
  void InitScrollStartListener();
  void RegisterScrollStartListener(std::shared_ptr<tdfcore::ScrollView> scroll_view);
  void RemoveScrollStartListener(std::shared_ptr<tdfcore::ScrollView> scroll_view);

  void InitScrollUpdateListener();
  void RegisterScrollUpdateListener(std::shared_ptr<tdfcore::ScrollView> scroll_view);
  void RemoveScrollUpdateListener(std::shared_ptr<tdfcore::ScrollView> scroll_view);

  void InitScrollEndListener();
  void RegisterScrollEndListener(std::shared_ptr<tdfcore::ScrollView> scroll_view);
  void RemoveScrollEndListener(std::shared_ptr<tdfcore::ScrollView> scroll_view);

  void InitDragStartListener();
  void RegisterDragStartListener(std::shared_ptr<tdfcore::ScrollView> scroll_view);
  void RemoveDragStartListener(std::shared_ptr<tdfcore::ScrollView> scroll_view);

  void InitDragEndListener();
  void RegisterDragEndListener(std::shared_ptr<tdfcore::ScrollView> scroll_view);
  void RemoveDragEndListener(std::shared_ptr<tdfcore::ScrollView> scroll_view);

  void HandleInnerEvent(std::string type);

  const uint64_t kUninitializedId = 0;
  uint64_t child_layout_listener_id_ = kUninitializedId;

  int32_t scroll_event_throttle_ = 400;  // ms
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

}  // namespace tdf
}  // namespace render
}  // namespace hippy
