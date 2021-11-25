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

#include "bridge/runtime.h"

#include <mutex>
#include <unordered_map>

using V8Ctx = hippy::napi::V8Ctx;

static std::unordered_map<int32_t, std::shared_ptr<Runtime>> RuntimeMap;
static std::mutex mutex;

static std::atomic<int32_t> global_runtime_key{0};

Runtime::Runtime(std::shared_ptr<JavaRef> bridge, bool enable_v8_serialization, bool is_dev)
    : enable_v8_serialization_(enable_v8_serialization), is_debug_(is_dev), group_id_(0), bridge_(std::move(bridge)) {
  id_ = global_runtime_key.fetch_add(1);
}

void Runtime::Insert(const std::shared_ptr<Runtime>& runtime) {
  std::lock_guard<std::mutex> lock(mutex);
  RuntimeMap[runtime->id_] = runtime;
}

std::shared_ptr<Runtime> Runtime::Find(int32_t id) {
  std::lock_guard<std::mutex> lock(mutex);
  const auto it = RuntimeMap.find(id);
  if (it == RuntimeMap.end()) {
    return nullptr;
  }

  return it->second;
}

static const uint32_t kRuntimeSlotIndex = 0;
std::shared_ptr<Runtime> Runtime::Find(v8::Isolate *isolate) {
  if (!isolate) {
    return nullptr;
  }
  auto runtime_id =
      static_cast<int32_t>(reinterpret_cast<int64_t>(isolate->GetData(kRuntimeSlotIndex)));
  if (runtime_id == -1) {// -1 means single isolate multi context mode
    v8::Local<v8::Context> context = isolate->GetCurrentContext();
    std::lock_guard<std::mutex> lock(mutex);
    for (const auto& p: RuntimeMap) {
      std::shared_ptr<Scope> scope = p.second->GetScope();
      std::shared_ptr<V8Ctx> ctx = std::static_pointer_cast<V8Ctx>(scope->GetContext());
      if (ctx->context_persistent_ == context) {
        return p.second;
      }
    }
  } else {
    return Runtime::Find(runtime_id);
  }
  return nullptr;
}

bool Runtime::Erase(int32_t id) {
  std::lock_guard<std::mutex> lock(mutex);
  const auto it = RuntimeMap.find(id);
  if (it == RuntimeMap.end()) {
    return false;
  }

  RuntimeMap.erase(it);
  return true;
}

bool Runtime::Erase(const std::shared_ptr<Runtime>& runtime) {
  return Runtime::Erase(runtime->id_);
}
