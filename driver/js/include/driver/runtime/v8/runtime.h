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

#include <cstdint>

#include <any>
#include <memory>

#include "driver/engine.h"
#include "driver/napi/js_ctx.h"
#include "driver/napi/js_ctx_value.h"
#include "v8/v8.h"

namespace hippy {
inline namespace driver {
inline namespace runtime {

class Runtime {
 public:
  using CtxValue = hippy::napi::CtxValue;

  Runtime(bool enable_v8_serialization, bool is_dev);

  inline bool IsEnableV8Serialization() { return enable_v8_serialization_; }
  inline bool IsDebug() { return is_debug_; }
  inline int32_t GetId() { return id_; }
  inline int64_t GetGroupId() { return group_id_; }
  inline std::shared_ptr<Engine> GetEngine() { return engine_; }
  inline std::shared_ptr<Scope> GetScope() { return scope_; }
  inline std::shared_ptr<CtxValue> GetBridgeFunc() {
    return bridge_func_;
  }
  inline std::string& GetBuffer() { return serializer_reused_buffer_; }

  inline void SetGroupId(int64_t id) { group_id_ = id; }
  inline void SetBridgeFunc(std::shared_ptr<hippy::napi::CtxValue> func) {
    bridge_func_ = func;
  }
  inline void SetEngine(std::shared_ptr<Engine> engine) { engine_ = engine; }
  inline void SetScope(std::shared_ptr<Scope> scope) { scope_ = scope; }

  inline std::any GetData(uint8_t slot) {
    return slot_[slot];
  }
  inline bool HasData(uint8_t slot) {
    return slot_.find(slot) != slot_.end();
  }
  inline void SetData(uint8_t slot, std::any data) {
    slot_[slot] = data;
  }
#if defined(ENABLE_INSPECTOR) && !defined(V8_WITHOUT_INSPECTOR)
  inline void SetInspectorContext(std::shared_ptr<hippy::inspector::V8InspectorContext> inspector_context) {
    inspector_context_ = inspector_context;
  }
  inline std::shared_ptr<hippy::inspector::V8InspectorContext> GetInspectorContext() { return inspector_context_; }
#endif
#ifdef ENABLE_INSPECTOR
  inline void SetDevtoolsDataSource(std::shared_ptr<hippy::devtools::DevtoolsDataSource> devtools_data_source) {
    devtools_data_source_ = devtools_data_source;
  }
  inline std::shared_ptr<hippy::devtools::DevtoolsDataSource> GetDevtoolsDataSource() {
    return devtools_data_source_;
  }
#endif
  static void Insert(const std::shared_ptr<Runtime>& runtime);
  static std::shared_ptr<Runtime> Find(int32_t id);
  static std::shared_ptr<Runtime> Find(v8::Isolate* isolate);
  static bool Erase(int32_t id);
  static bool Erase(const std::shared_ptr<Runtime>& runtime);

 private:
  bool enable_v8_serialization_;
  bool is_debug_;
  int64_t group_id_;
  std::string serializer_reused_buffer_;
  std::shared_ptr<Engine> engine_;
  std::shared_ptr<Scope> scope_;
  std::shared_ptr<CtxValue> bridge_func_;
  int32_t id_;
  std::unordered_map<uint32_t, std::any> slot_;
#ifdef ENABLE_INSPECTOR
  std::shared_ptr<hippy::devtools::DevtoolsDataSource> devtools_data_source_;
#endif
#if defined(ENABLE_INSPECTOR) && !defined(V8_WITHOUT_INSPECTOR)
  std::shared_ptr<hippy::inspector::V8InspectorContext> inspector_context_;
#endif
};

} // namespace runtime
} // namespace driver
} // namespace hippy
