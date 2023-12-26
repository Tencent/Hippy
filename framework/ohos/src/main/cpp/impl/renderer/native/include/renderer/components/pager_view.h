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

#include "renderer/components/base_view.h"
#include "renderer/arkui/swiper_node.h"
#include "renderer/components/pager_item_adapter.h"

namespace hippy {
inline namespace render {
inline namespace native {

class PagerView : public BaseView, public SwiperNodeDelegate {
public:
  PagerView(std::shared_ptr<NativeRenderContext> &ctx);
  ~PagerView();

  SwiperNode *GetLocalRootArkUINode() override;
  void CreateArkUINodeImpl() override;
  void DestroyArkUINodeImpl() override;
  bool SetPropImpl(const std::string &propKey, const HippyValue &propValue) override;
  void CallImpl(const std::string &method, const std::vector<HippyValue> params,
            std::function<void(const HippyValue &result)> callback) override;

  void OnChildInserted(std::shared_ptr<BaseView> const &childView, int index) override;
  void OnChildRemoved(std::shared_ptr<BaseView> const &childView, int32_t index) override;
  void OnChildInsertedImpl(std::shared_ptr<BaseView> const &childView, int32_t index) override;
  void OnChildRemovedImpl(std::shared_ptr<BaseView> const &childView, int32_t index) override;

  void OnChange(const int32_t &index) override;
  void OnAnimationStart(const int32_t &currentIndex, const int32_t &targetIndex,
                        const float_t &currentOffset, const float_t &targetOffset,
                        const float_t &swipeVelocity) override;
  void OnAnimationEnd(const int32_t &currentIndex, const float_t &currentOffset) override;
  void OnContentDidScroll(const int32_t currentIndex, const int32_t pageIndex,
                          const float_t pageOffset) override;
  void OnTouch(int32_t actionType, const HRPosition &screenPosition) override;

private:
  void SendScrollStateChangeEvent(const std::string &state);

  constexpr static const char *PAGE_ITEM_POSITION = "position";
  constexpr static const char *PAGE_ITEM_OFFSET = "offset";
  constexpr static const char *PAGE_SCROLL_STATE = "pageScrollState";
  constexpr static const char *SCROLL_STATE_IDLE = "idle";
  constexpr static const char *SCROLL_STATE_DRAGGING = "dragging";
  constexpr static const char *SCROLL_STATE_SETTLING = "settling";

  std::shared_ptr<SwiperNode> swiperNode_;

  std::shared_ptr<PagerItemAdapter> adapter_;

  int32_t initialPage_ = 0;
  bool initialPageUsed_ = false;
  int32_t index_ = 0;
  float prevMargin_ = 0;
  float nextMargin_ = 0;
  bool disableSwipe_ = false;
  bool vertical_ = false;
};

} // namespace native
} // namespace render
} // namespace hippy
