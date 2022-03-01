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

#include <iterator>

#include "bridge/bridge_manager.h"
#include "dom/dom_manager.h"

namespace voltron {

static Map<int32_t, Sp<BridgeManager>> bridge_map_;
static std::mutex bridge_mutex_;

std::shared_ptr<BridgeManager> BridgeManager::Create(int32_t engine_id, Sp<PlatformRuntime> runtime) {
  std::unique_lock<std::mutex> lock(bridge_mutex_);
  auto bridge_manager_iter = bridge_map_.find(engine_id);
  if (bridge_manager_iter == bridge_map_.end()) {
    auto new_bridge_manager = std::make_shared<BridgeManager>(engine_id);
    bridge_map_[engine_id] = new_bridge_manager;
    new_bridge_manager->BindRuntime(runtime);
    return new_bridge_manager;
  } else {
    bridge_manager_iter->second->BindRuntime(runtime);
    return bridge_manager_iter->second;
  }
}

Sp<BridgeManager> BridgeManager::Find(int32_t engine_id) {
  std::unique_lock<std::mutex> lock(bridge_mutex_);
  auto bridge_manager_iter = bridge_map_.find(engine_id);
  if (bridge_manager_iter == bridge_map_.end()) {
    return nullptr;
  } else {
    return bridge_manager_iter->second;
  }
}

void BridgeManager::Destroy(int32_t root_id) {
  std::unique_lock<std::mutex> lock(bridge_mutex_);
  if (bridge_map_.find(root_id) != bridge_map_.end()) {
    bridge_map_.erase(root_id);
  }
}

void BridgeManager::Notify(int32_t engine_id) {
  auto bridge_manager = BridgeManager::Find(engine_id);
  if (bridge_manager) {
    auto render_manager_map = bridge_manager->render_manager_map_;
    if (!render_manager_map.empty()) {
      auto end = render_manager_map.rbegin();
      auto begin = render_manager_map.rend();
      while (end != begin) {
        auto render_manager = end->second;
        render_manager->Notify();
        end++;
      }
    }
  }
}

void BridgeManager::InitInstance(int32_t engine_id, int32_t root_id) {
  auto render_manager = std::make_shared<VoltronRenderManager>(engine_id, root_id);
  Sp<DomManager> dom_manager = std::make_shared<DomManager>(engine_id);
  dom_manager->SetRenderManager(render_manager);
  BindDomManager(root_id, dom_manager);
  BindRenderManager(root_id, render_manager);
}

void BridgeManager::DestroyInstance(int32_t engine_id, int32_t root_id) {
  if (render_manager_map_.find(root_id) != render_manager_map_.end()) {
    render_manager_map_.erase(root_id);
  }
  auto dom_manager = dom_manager_map_.find(root_id);
  if (dom_manager != dom_manager_map_.end()) {
    dom_manager->second->TerminateTaskRunner();
    dom_manager_map_.erase(root_id);
  }
}

BridgeManager::~BridgeManager() {
  dom_manager_map_.clear();
  render_manager_map_.clear();
  native_callback_map_.clear();
}

BridgeManager::BridgeManager(int32_t engine_id) : engine_id_(engine_id) {}

std::weak_ptr<PlatformRuntime> BridgeManager::GetRuntime() { return runtime_; }

std::shared_ptr<VoltronRenderManager> BridgeManager::GetRenderManager(int32_t root_id) {
  auto render_manager = render_manager_map_.find(root_id);
  if (render_manager != render_manager_map_.end()) {
    return render_manager->second;
  }
  return {};
}

Sp<DomManager> BridgeManager::GetDomManager(int32_t root_id) {
  auto dom_manager = dom_manager_map_.find(root_id);
  if (dom_manager != dom_manager_map_.end()) {
    return dom_manager->second;
  }
  return nullptr;
}

void BridgeManager::BindDomManager(int32_t root_id, const Sp<DomManager>& dom_manager) {
  dom_manager_map_[root_id] = dom_manager;
}

void BridgeManager::BindRuntime(const voltron::Sp<PlatformRuntime>& runtime) {
  runtime_ = std::weak_ptr<PlatformRuntime>(runtime);
}

void BridgeManager::BindRenderManager(int32_t root_id,
                                      const voltron::Sp<voltron::VoltronRenderManager>& render_manager) {
  render_manager_map_[root_id] = render_manager;
}

String BridgeManager::AddNativeCallback(const String& tag, const NativeCallback& callback) {
  auto callback_id = tag + std::to_string(++callback_id_increment_);
  native_callback_map_[callback_id] = callback;
  return callback_id;
}

void BridgeManager::RemoveNativeCallback(const String& callback_id) { native_callback_map_.erase(callback_id); }

void BridgeManager::CallNativeCallback(const String& callback_id, std::unique_ptr<EncodableValue> params, bool keep) {
  auto native_callback_iter = native_callback_map_.find(callback_id);
  if (native_callback_iter != native_callback_map_.end()) {
    auto callback = native_callback_iter->second;
    if (callback) {
      callback(*params);
      if (!keep) {
        RemoveNativeCallback(callback_id);
      }
    }
  }
}

}  // namespace voltron
