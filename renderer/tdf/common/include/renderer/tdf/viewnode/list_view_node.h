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
#include "tdfui/view/custom_layout_view.h"
#include "tdfui/view/linear_custom_layout.h"
#include "tdfui/view/refresh_header.h"
#pragma clang diagnostic pop

#include "renderer/tdf/viewnode/scroll_view_node.h"

namespace hippy {
inline namespace render {
inline namespace tdf {

inline namespace listview {
constexpr const char kListViewItem[] = "ListViewItem";
constexpr const char kListView[] = "ListView";
constexpr const char kBounces[] = "bounces";                              // boolean
constexpr const char kExposureEventEnabled[] = "exposureEventEnabled";    // boolean
constexpr const char kOnMomentumScrollBegin[] = "onMomentumScrollBegin";  // boolean
constexpr const char kOnMomentumScrollEnd[] = "onMomentumScrollEnd";      // boolean
constexpr const char kOnScrollBeginDrag[] = "onScrollBeginDrag";          // boolean
constexpr const char kOnScrollEnable[] = "onScrollEnable";                // boolean
constexpr const char kOnScrollEndDrag[] = "onScrollEndDrag";              // boolean
constexpr const char kOverScrollEnabled[] = "overScrollEnabled";          // boolean
constexpr const char kPreloadItemNumber[] = "preloadItemNumber";          // int
constexpr const char kRowShouldSticky[] = "rowShouldSticky";              // boolean
constexpr const char kScrollEnabled[] = "scrollEnabled";                  // boolean
constexpr const char kScrollEventThrottle[] = "scrollEventThrottle";      // int
constexpr const char kSuspendViewListener[] = "suspendViewListener";      // int
constexpr const char kEndreached[] = "endreached";
constexpr const char kLoadmore[] = "loadmore";
constexpr const char kScrollToIndex[] = "scrollToIndex";
constexpr const char kScrollToContentOffset[] = "scrollToContentOffset";

const int64_t kDefaultItemViewType = -1;

}  // namespace listview

class ListViewItemNode : public ViewNode {
 public:
  using ViewNode::ViewNode;

  bool GetIsSticky() const { return is_sticky_; }
  int64_t GetViewType() const { return view_type_; }

  /**
   * @brief ListViewItemNode's CreateView is Public, can be called by ListViewDataSource.
   */
  std::shared_ptr<tdfcore::View> CreateView(const std::shared_ptr<ViewContext> &context) override;

  void UpdateViewType(const DomStyleMap& dom_style);

  void OnDelete() override;
 protected:
  void HandleStyleUpdate(const DomStyleMap& dom_style, const DomDeleteProps& dom_delete_props) override;

  void HandleLayoutUpdate(hippy::LayoutResult layout_result) override;

 private:
  bool is_sticky_ = false;
  int64_t view_type_ = kDefaultItemViewType;
};

class ListViewNode;

class ListViewDataSource : public tdfcore::CustomLayoutViewDataSource {
 public:
  ListViewDataSource(std::shared_ptr<ListViewNode> host) : list_view_node_(host) {}

  std::shared_ptr<tdfcore::View> GetItem(int64_t index,
                                         const std::shared_ptr<tdfcore::CustomLayoutView>& custom_layout_view) override;

  void UpdateItem(int64_t index, const std::shared_ptr<tdfcore::View>& item,
                  const std::shared_ptr<tdfcore::CustomLayoutView>& custom_layout_view) override;

  int64_t GetItemType(int64_t index) override;

  bool IsItemSticky(int64_t index) override;

  int64_t GetItemCount() override;

  void SetItemNodes(std::vector<std::shared_ptr<ViewNode>> item_nodes);

 private:
  std::weak_ptr<ListViewNode> list_view_node_;

  // 数据源需要稳定保存一份，防止列表滑动中途数据源被add/delete列表项改变
  std::vector<std::shared_ptr<ViewNode>> item_nodes_;
};

class ListViewNode : public ScrollViewNode {
 public:
  using ScrollViewNode::ScrollViewNode;

  static node_creator GetCreator();

  void CallFunction(const std::string &name, const DomArgument &param, const uint32_t call_back_id) override;

 protected:
  void OnChildAdd(const std::shared_ptr<ViewNode>& child, int64_t index) override;
  void OnChildRemove(const std::shared_ptr<ViewNode>& child) override;

  void OnAttach() override;
  void OnDetach() override;

  void HandleStyleUpdate(const DomStyleMap& dom_style, const DomDeleteProps& dom_delete_props) override;

  std::shared_ptr<tdfcore::View> CreateView(const std::shared_ptr<ViewContext> &context) override;

  void SetShouldReload() { should_reload_ = true; }

 private:
  void HandleEndReachedEvent();
  int64_t NextUniqueItemViewType() { return --unique_item_type_; }
  bool should_reload_ = false;
  uint64_t on_reach_end_listener_id_;
  uint64_t batch_end_listener_id_;
  bool has_reached_end_ = false;
  int64_t unique_item_type_ = kDefaultItemViewType;

  friend class ListViewDataSource;
  friend class ListViewItemNode;
};

}  // namespace tdf
}  // namespace render
}  // namespace hippy
