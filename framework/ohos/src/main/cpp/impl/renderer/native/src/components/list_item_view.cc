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

#include "renderer/components/list_item_view.h"
#include "renderer/utils/hr_event_utils.h"
#include "renderer/utils/hr_value_utils.h"

namespace hippy {
inline namespace render {
inline namespace native {

ListItemView::ListItemView(std::shared_ptr<NativeRenderContext> &ctx) : BaseView(ctx) {
}

ListItemView::~ListItemView() {
  if (!children_.empty()) {
    if (stackNode_) {
      for (const auto &child : children_) {
        stackNode_->RemoveChild(child->GetLocalRootArkUINode());
      }
    }
    children_.clear();
  }
  if (itemNode_) {
    itemNode_->RemoveChild(stackNode_.get());
  }
}

ListItemNode *ListItemView::GetLocalRootArkUINode() { return itemNode_.get(); }

void ListItemView::CreateArkUINodeImpl() {
  itemNode_ = std::make_shared<ListItemNode>();
  stackNode_ = std::make_shared<StackNode>();
  itemNode_->AddChild(stackNode_.get());
}

void ListItemView::DestroyArkUINodeImpl() {
  itemNode_ = nullptr;
  stackNode_ = nullptr;
}

bool ListItemView::RecycleArkUINodeImpl(std::shared_ptr<RecycleView> &recycleView) {
  itemNode_->ResetAllAttributes();
  stackNode_->ResetAllAttributes();
  recycleView->cachedNodes_.resize(2);
  recycleView->cachedNodes_[0] = itemNode_;
  recycleView->cachedNodes_[1] = stackNode_;
  itemNode_ = nullptr;
  stackNode_ = nullptr;
  return true;
}

bool ListItemView::ReuseArkUINodeImpl(std::shared_ptr<RecycleView> &recycleView) {
  if (recycleView->cachedNodes_.size() < 2) {
    return false;
  }
  itemNode_ = std::static_pointer_cast<ListItemNode>(recycleView->cachedNodes_[0]);
  stackNode_ = std::static_pointer_cast<StackNode>(recycleView->cachedNodes_[1]);
  return true;
}

bool ListItemView::SetViewProp(const std::string &propKey, const HippyValue &propValue) {
  if (propKey == "type" || propKey == "itemViewType") {
    if (propValue.IsString()) {
      propValue.ToString(type_);
    } else if (propValue.IsNumber()) {
      int32_t value = HRValueUtils::GetInt32(propValue);
      type_ = std::to_string(value);
    } else {
      type_ = "NoType" + std::to_string(tag_);
    }
    // FOOTSTONE_LOG(INFO) << "hippy, list child, set type: " << type_ << ", view: " << this;
    return true;
  } else if (propKey == "sticky") {
    auto value = HRValueUtils::GetBool(propValue, false);
    if (value) {
      sticky_ = value;
    }
    return true;
  }
  return false;
}

bool ListItemView::SetPropImpl(const std::string &propKey, const HippyValue &propValue) {
  return BaseView::SetPropImpl(propKey, propValue);
}

void ListItemView::OnChildInsertedImpl(std::shared_ptr<BaseView> const &childView, int32_t index) {
  BaseView::OnChildInsertedImpl(childView, index);
  stackNode_->InsertChild(childView->GetLocalRootArkUINode(), index);
}

void ListItemView::OnChildRemovedImpl(std::shared_ptr<BaseView> const &childView, int32_t index) {
  BaseView::OnChildRemovedImpl(childView, index);
  stackNode_->RemoveChild(childView->GetLocalRootArkUINode());
}

void ListItemView::UpdateRenderViewFrameImpl(const HRRect &frame, const HRPadding &padding) {
  stackNode_->SetPosition(HRPosition(0, 0));
  stackNode_->SetSize(HRSize(frame.width, frame.height));
  width_ = frame.width;
  height_ = frame.height;
}

float ListItemView::GetWidth() {
  if (width_ > 0) {
    return width_;
  } else if (lazyFrame_.has_value()) {
    return lazyFrame_.value().width;
  }
  return 0;
}

float ListItemView::GetHeight() {
  if (height_ > 0) {
    return height_;
  } else if (lazyFrame_.has_value()) {
    return lazyFrame_.value().height;
  }
  return 0;
}

void ListItemView::CheckExposureView(float currentRatio) {
  auto newState = CalculateExposureState(currentRatio);
  MoveToExposureState(newState);
}

uint32_t ListItemView::CalculateExposureState(float currentRatio) {
  if (currentRatio >= 1) {
    return ListItemView::EXPOSURE_STATE_FULL_VISIBLE;
  } else if (currentRatio > 0.1) {
    return ListItemView::EXPOSURE_STATE_PART_VISIBLE;
  } else {
    return ListItemView::EXPOSURE_STATE_INVISIBLE;
  }
}

void ListItemView::MoveToExposureState(uint32_t state) {
  if (state == exposureState_) {
    return;
  }
  switch (state) {
    case ListItemView::EXPOSURE_STATE_FULL_VISIBLE:
      if (exposureState_ == ListItemView::EXPOSURE_STATE_INVISIBLE) {
        HREventUtils::SendComponentEvent(ctx_, tag_, HREventUtils::EVENT_LIST_ITEM_WILL_APPEAR, nullptr);
      }
      HREventUtils::SendComponentEvent(ctx_, tag_, HREventUtils::EVENT_LIST_ITEM_APPEAR, nullptr);
      break;
    case ListItemView::EXPOSURE_STATE_PART_VISIBLE:
      if (exposureState_ == ListItemView::EXPOSURE_STATE_FULL_VISIBLE) {
        HREventUtils::SendComponentEvent(ctx_, tag_, HREventUtils::EVENT_LIST_ITEM_WILL_DISAPPEAR, nullptr);
      } else {
        HREventUtils::SendComponentEvent(ctx_, tag_, HREventUtils::EVENT_LIST_ITEM_WILL_APPEAR, nullptr);
      }
      break;
    case ListItemView::EXPOSURE_STATE_INVISIBLE:
      if (exposureState_ == ListItemView::EXPOSURE_STATE_FULL_VISIBLE) {
        HREventUtils::SendComponentEvent(ctx_, tag_, HREventUtils::EVENT_LIST_ITEM_WILL_DISAPPEAR, nullptr);
      }
      HREventUtils::SendComponentEvent(ctx_, tag_, HREventUtils::EVENT_LIST_ITEM_DISAPPEAR, nullptr);
      break;
    default:
      break;
  }
  exposureState_ = state;
}

} // namespace native
} // namespace render
} // namespace hippy
