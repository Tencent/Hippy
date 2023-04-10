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

#include "render/bridge/bridge_manager.h"

#include <iterator>

#include "dom/dom_manager.h"
#include "footstone/worker_manager.h"
#include "ffi_define.h"

namespace voltron {

using BridgeManagerMap = footstone::utils::PersistentObjectMap<int32_t, Sp<BridgeManager>>;
static BridgeManagerMap bridge_map_;

using RenderManagerMap = footstone::utils::PersistentObjectMap<uint32_t , std::shared_ptr<VoltronRenderManager>>;
static std::atomic<uint32_t> global_render_manager_key_{1};
static RenderManagerMap render_manager_map_;

int64_t BridgeRuntime::CalculateNodeLayout(int32_t instance_id, int32_t node_id, double width, int32_t width_mode, double height, int32_t height_mode) {
    std::condition_variable cv;
    bool notified = false;

    int64_t result;
    assert(calculate_node_layout_func != nullptr);
    const Work work = [this, &result, &cv, &notified, engine_id = engine_id_, instance_id, node_id, width, width_mode, height, height_mode]() {
      auto result_ptr = calculate_node_layout_func(engine_id, instance_id, node_id, width, width_mode, height, height_mode);
      if (result_ptr) {
        result = *result_ptr;
      } else {
        result = 0;
      }
      delete result_ptr;
      std::unique_lock<std::mutex> lock(mutex_);
      notified = true;
      cv.notify_all();
    };
    const Work* work_ptr = new Work(work);
    PostWorkToDart(work_ptr);
    std::unique_lock<std::mutex> lock(mutex_);
    if (!notified) {
      cv.wait(lock);
    }
    return result;
}

BridgeRuntime::BridgeRuntime(int32_t engine_id) : engine_id_(engine_id) {
}

std::shared_ptr<BridgeManager> BridgeManager::Create(int32_t engine_id, const Sp<BridgeRuntime>& runtime) {
  Sp<BridgeManager> bridge_manager;
  auto flag = bridge_map_.Find(engine_id, bridge_manager);
  if (flag) {
    bridge_manager->BindRuntime(runtime);
    return bridge_manager;
  } else {
    auto new_bridge_manager = std::make_shared<BridgeManager>();
    bridge_map_.Insert(engine_id, new_bridge_manager);
    new_bridge_manager->BindRuntime(runtime);
    return new_bridge_manager;
  }
}

Sp<BridgeManager> BridgeManager::Find(int32_t engine_id) {
  Sp<BridgeManager> bridge_manager;
  auto flag = bridge_map_.Find(engine_id, bridge_manager);
  if (flag) {
    return bridge_manager;
  } else {
    return nullptr;
  }
}

void BridgeManager::Destroy(int32_t engine_id) {
  bridge_map_.Erase(engine_id);
}

Sp<VoltronRenderManager> BridgeManager::CreateRenderManager() {
  auto id = global_render_manager_key_.fetch_add(1);
  auto render_manager = std::make_shared<VoltronRenderManager>(id);
  render_manager_map_.Insert(id, render_manager);
  return render_manager;
}

void BridgeManager::DestroyRenderManager(uint32_t render_manager_id) {
  std::shared_ptr<VoltronRenderManager> render_manager;
  auto flag = render_manager_map_.Find(render_manager_id, render_manager);
  if (flag && render_manager) {
    render_manager_map_.Erase(render_manager_id);
  }
}

Sp<VoltronRenderManager> BridgeManager::FindRenderManager(uint32_t render_manager_id) {
  std::shared_ptr<VoltronRenderManager> render_manager;
  auto flag = render_manager_map_.Find(render_manager_id, render_manager);
  if (flag && render_manager) {
    return render_manager;
  }

  return nullptr;
}

BridgeManager::~BridgeManager() {
  native_callback_map_.Clear();
}

BridgeManager::BridgeManager() {}

std::shared_ptr<BridgeRuntime> BridgeManager::GetRuntime() { return runtime_.lock(); }

void BridgeManager::BindRuntime(const voltron::Sp<BridgeRuntime>& runtime) {
  runtime_ = std::weak_ptr<BridgeRuntime>(runtime);
}

String BridgeManager::AddNativeCallback(const String& tag, const NativeCallback& callback) {
  auto callback_id = tag + std::to_string(++callback_id_increment_);
  native_callback_map_.Insert(callback_id, callback);
  return callback_id;
}

void BridgeManager::RemoveNativeCallback(const String& callback_id) { native_callback_map_.Erase(callback_id); }

void BridgeManager::CallNativeCallback(const String &callback_id,
                                       std::unique_ptr<EncodableValue> params,
                                       bool keep) {
  NativeCallback callback;
  auto flag = native_callback_map_.Find(callback_id, callback);
  if (flag) {
    callback(*params);
    if (!keep) {
      RemoveNativeCallback(callback_id);
    }
  }
}

}  // namespace voltron
