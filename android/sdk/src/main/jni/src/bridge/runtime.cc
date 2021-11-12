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

static std::unordered_map<int64_t, std::shared_ptr<Runtime>> RuntimeMap;
static std::unordered_map<int64_t, std::shared_ptr<int64_t>> RuntimeKeyMap;
static std::mutex mutex;

static std::atomic<int64_t> global_runtime_key{0};

Runtime::Runtime(std::shared_ptr<JavaRef> bridge, bool enable_v8_serialization, bool is_dev)
    : enable_v8_serialization_(enable_v8_serialization), is_debug_(is_dev), bridge_(bridge) {
  id_ = global_runtime_key.fetch_add(1);
}

void Runtime::Insert(std::shared_ptr<Runtime> runtime) {
  std::lock_guard<std::mutex> lock(mutex);
  int64_t id = runtime->id_;
  RuntimeKeyMap[id] = std::make_shared<int64_t>(id);
  RuntimeMap[id] = runtime;
}

std::shared_ptr<Runtime> Runtime::Find(int64_t id) {
  std::lock_guard<std::mutex> lock(mutex);
  const auto it = RuntimeMap.find(id);
  if (it == RuntimeMap.end()) {
    return nullptr;
  }

  return it->second;
}

static const uint32_t kRuntimeKeyIndex = 0;
std::shared_ptr<Runtime>  Runtime::Find(v8::Isolate* isolate) {
  if (!isolate) {
    return nullptr;
  }
  void* isolate_data = isolate->GetData(kRuntimeKeyIndex);
  if (!isolate_data) { // 约定nullptr为单isolate多context模式
    v8::Local<v8::Context> context = isolate->GetCurrentContext();
    std::lock_guard<std::mutex> lock(mutex);
    for (auto p: RuntimeMap) {
      std::shared_ptr<Scope> scope = p.second->GetScope();
      std::shared_ptr<V8Ctx> ctx = std::static_pointer_cast<V8Ctx>(scope->GetContext());
      if (ctx->context_persistent_ == context) {
        return p.second;
      }
    }
  } else {
    int64_t runtime_key =
        *(reinterpret_cast<int64_t*>(isolate_data));
    return Runtime::Find(runtime_key);
  }
  return nullptr;
}

bool Runtime::Erase(int64_t id) {
  std::lock_guard<std::mutex> lock(mutex);
  const auto it = RuntimeMap.find(id);
  if (it == RuntimeMap.end()) {
    return false;
  }

  RuntimeMap.erase(it);
  return true;
}

bool Runtime::Erase(std::shared_ptr<Runtime> runtime) {
  return Runtime::Erase(runtime->id_);
}

std::shared_ptr<int64_t> Runtime::GetKey(std::shared_ptr<Runtime> runtime) {
  std::lock_guard<std::mutex> lock(mutex);
  const auto it = RuntimeKeyMap.find(runtime->id_);
  if (it == RuntimeKeyMap.end()) {
    return nullptr;
  }

  return it->second;
}

bool Runtime::ReleaseKey(int64_t id) {
  std::lock_guard<std::mutex> lock(mutex);
  const auto it = RuntimeKeyMap.find(id);
  if (it == RuntimeKeyMap.end()) {
    return false;
  }

  RuntimeKeyMap.erase(it);
  return true;
}
