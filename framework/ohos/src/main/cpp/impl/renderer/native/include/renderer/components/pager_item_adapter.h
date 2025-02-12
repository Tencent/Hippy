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

#include <arkui/native_node.h>
#include <stack>
#include "renderer/components/pager_item_view.h"

namespace hippy {
inline namespace render {
inline namespace native {

class PagerItemAdapter {
public:
  PagerItemAdapter(std::vector<std::shared_ptr<BaseView>> &itemViews)
      : handle_(OH_ArkUI_NodeAdapter_Create()), itemViews_(itemViews) {
    // 设置懒加载数据。
    OH_ArkUI_NodeAdapter_SetTotalNodeCount(handle_, static_cast<uint32_t>(itemViews.size()));
    // 设置懒加载回调事件。
    OH_ArkUI_NodeAdapter_RegisterEventReceiver(handle_, this, OnStaticAdapterEvent);
  }

  ~PagerItemAdapter() {
    // 释放创建的组件。
    while (!cachedItems_.empty()) {
      cachedItems_.pop();
    }
    items_.clear();
    // 释放Adapter相关资源。
    OH_ArkUI_NodeAdapter_UnregisterEventReceiver(handle_);
    OH_ArkUI_NodeAdapter_Dispose(handle_);
  }

  ArkUI_NodeAdapterHandle GetHandle() const { return handle_; }

  void RemoveItem(int32_t index) {
    // 如果index会导致可视区域元素发生可见性变化，则会回调NODE_ADAPTER_EVENT_ON_REMOVE_NODE_FROM_ADAPTER事件删除元素，
    // 根据是否有新增元素回调NODE_ADAPTER_EVENT_ON_GET_NODE_ID和NODE_ADAPTER_EVENT_ON_ADD_NODE_TO_ADAPTER事件。
    OH_ArkUI_NodeAdapter_RemoveItem(handle_, static_cast<uint32_t>(index), 1);
    OH_ArkUI_NodeAdapter_SetTotalNodeCount(handle_, static_cast<uint32_t>(itemViews_.size()));
  }

  void InsertItem(int32_t index) {
    // 如果index会导致可视区域元素发生可见性变化，则会回调NODE_ADAPTER_EVENT_ON_GET_NODE_ID和NODE_ADAPTER_EVENT_ON_ADD_NODE_TO_ADAPTER事件，
    // 根据是否有删除元素回调NODE_ADAPTER_EVENT_ON_REMOVE_NODE_FROM_ADAPTER事件。
    OH_ArkUI_NodeAdapter_InsertItem(handle_, static_cast<uint32_t>(index), 1);
    OH_ArkUI_NodeAdapter_SetTotalNodeCount(handle_, static_cast<uint32_t>(itemViews_.size()));
  }

private:
  static void OnStaticAdapterEvent(ArkUI_NodeAdapterEvent *event) {
    // 获取实例对象，回调实例事件。
    auto itemAdapter = reinterpret_cast<PagerItemAdapter *>(OH_ArkUI_NodeAdapterEvent_GetUserData(event));
    itemAdapter->OnAdapterEvent(event);
  }

  void OnAdapterEvent(ArkUI_NodeAdapterEvent *event) {
    auto type = OH_ArkUI_NodeAdapterEvent_GetType(event);
    switch (type) {
    case NODE_ADAPTER_EVENT_ON_GET_NODE_ID:
      OnNewItemIdCreated(event);
      break;
    case NODE_ADAPTER_EVENT_ON_ADD_NODE_TO_ADAPTER:
      OnNewItemAttached(event);
      break;
    case NODE_ADAPTER_EVENT_ON_REMOVE_NODE_FROM_ADAPTER:
      OnItemDetached(event);
      break;
    default:
      break;
    }
  }

  // 分配ID给需要显示的Item，用于ReloadAllItems场景的元素diff。
  void OnNewItemIdCreated(ArkUI_NodeAdapterEvent *event) {
    auto index = OH_ArkUI_NodeAdapterEvent_GetItemIndex(event);
    auto view = itemViews_[index];
    auto id = static_cast<int32_t>(view->GetTag());
    OH_ArkUI_NodeAdapterEvent_SetNodeId(event, id);
  }

  // 需要新的Item显示在可见区域。
  void OnNewItemAttached(ArkUI_NodeAdapterEvent *event) {
    auto index = OH_ArkUI_NodeAdapterEvent_GetItemIndex(event);
    auto view = itemViews_[index];
    view->CreateArkUINode(true, (int32_t)index);
    ArkUI_NodeHandle handle = view->GetLocalRootArkUINode()->GetArkUINodeHandle();
    // 设置需要展示的元素。
    OH_ArkUI_NodeAdapterEvent_SetItem(event, handle);
  }

  // Item从可见区域移除。
  void OnItemDetached(ArkUI_NodeAdapterEvent *event) {

  }

  ArkUI_NodeAdapterHandle handle_ = nullptr;
  
  std::vector<std::shared_ptr<BaseView>> &itemViews_;
  
  // 管理NodeAdapter生成的元素。
  std::unordered_map<ArkUI_NodeHandle, std::shared_ptr<PagerItemView>> items_;

  // 管理回收复用组件池。
  std::stack<std::shared_ptr<PagerItemView>> cachedItems_;
};

} // namespace native
} // namespace render
} // namespace hippy
