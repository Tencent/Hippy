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

#include "renderer/arkui/arkui_node_registry.h"
#include "renderer/arkui/arkui_node.h"
#include "renderer/arkui/native_node_api.h"
#include "footstone/logging.h"

namespace hippy {
inline namespace render {
inline namespace native {

ArkUINodeRegistry& ArkUINodeRegistry::GetInstance() {
  static std::unique_ptr<ArkUINodeRegistry> instance = nullptr;
  if (instance == nullptr) {
    instance = std::unique_ptr<ArkUINodeRegistry>(new ArkUINodeRegistry());
  }
  return *instance;
}

void ArkUINodeRegistry::RegisterNode(ArkUINode *node) {
  auto [_it, inserted] = nodesByHandle_.emplace(node->GetArkUINodeHandle(), node);
  if (!inserted) {
    FOOTSTONE_LOG(WARNING) << "Node with handle " << node->GetArkUINodeHandle() << " was already registered";
  }
}

void ArkUINodeRegistry::UnregisterNode(ArkUINode *node) {
  auto it = nodesByHandle_.find(node->GetArkUINodeHandle());
  if (it == nodesByHandle_.end()) {
    FOOTSTONE_LOG(WARNING) << "Node with handle " << node->GetArkUINodeHandle() << " not found";
    return;
  }

  nodesByHandle_.erase(it);
}

ArkUINodeRegistry::ArkUINodeRegistry() {
  NativeNodeApi::GetInstance()->registerNodeEventReceiver([](ArkUI_NodeEvent* event) {
    ArkUINodeRegistry::GetInstance().ReceiveEvent(event);
  });
}

void ArkUINodeRegistry::ReceiveEvent(ArkUI_NodeEvent *event) {
  try {
    ArkUI_NodeHandle nodeHanle = OH_ArkUI_NodeEvent_GetNodeHandle(event);
    auto it = nodesByHandle_.find(nodeHanle);
    if (it == nodesByHandle_.end()) {
      FOOTSTONE_LOG(WARNING) << "Node with handle " << nodeHanle << " not found";
      return;
    }

    it->second->OnNodeEvent(event);
  } catch (std::exception& e) {
    FOOTSTONE_LOG(ERROR) << "Node receive event exception: " << e.what();
  }
}

} // namespace native
} // namespace render
} // namespace hippy
