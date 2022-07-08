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

#include "render/tdf/extesions/view_pager.h"
#include "render/tdf/vdom/view_node.h"

namespace tdfrender {

using ScrollOffsetListener = std::function<void(int32_t position, double offset)>;
using PageSelectedListener = std::function<void(int32_t position)>;
using ScrollStateChangedListener = std::function<void(std::string old_state, std::string new_state)>;

class ViewPagerNode : public ViewNode {
 public:
  using ViewNode::ViewNode;
  ~ViewPagerNode() override = default;

  static node_creator GetCreator();
  void OnChildAdd(ViewNode& child, int64_t index) override;
  void HandleStyleUpdate(const DomStyleMap& dom_style) override;
  std::shared_ptr<tdfcore::View> CreateView() override;
  void CallFunction(const std::string& function_name, const DomArgument& param, const uint32_t call_back_id) override;

 protected:
  void HandleEventInfoUpdate() override;

 private:
  void InitialPage(const DomStyleMap& dom_style, std::shared_ptr<ViewPager> view_pager);
  void SetOverFlow(const DomStyleMap& dom_style);
  void SetScrollEnable(const DomStyleMap& dom_style, std::shared_ptr<ViewPager> view_pager);
  void SetDirection(const DomStyleMap& dom_style, std::shared_ptr<ViewPager> view_pager);
  void SetPageMargin(const DomStyleMap& dom_style, std::shared_ptr<ViewPager> view_pager);
  void ParsePageScrollStateChangedAttr(const DomStyleMap& dom_style);

  void UpdatePagerCallBack(std::shared_ptr<ViewPager> view_pager);
  void HandleOffsetListener(int32_t position, double offset);
  void HandleSelectedListener(int32_t position);
  void HandleStateChangedListener(std::string state);

  std::weak_ptr<ViewPager> weak_view_pager;
  bool has_on_page_scroll_event_ = false;
  bool has_on_page_selected_event_ = false;
  bool has_on_page_scroll_state_changed_event_ = false;
};

}  // namespace tdfrender
