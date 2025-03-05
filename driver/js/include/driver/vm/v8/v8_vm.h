/*
 *
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

#include "driver/vm/js_vm.h"

#include <any>

#include "driver/napi/js_ctx.h"
#include "footstone/string_view.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wconversion"
#include "v8/v8.h"
#pragma clang diagnostic pop

#if defined(ENABLE_INSPECTOR) && !defined(V8_WITHOUT_INSPECTOR)
#include "driver/vm/v8/inspector/v8_inspector_client_impl.h"
#endif

namespace hippy {
inline namespace driver {
inline namespace vm {

struct V8VMInitParam : public VM::VMInitParam {
  enum class V8VMInitType {
    kNoSnapshot, kCreateSnapshot, kUseSnapshot
  };

  size_t initial_heap_size_in_bytes;
  size_t maximum_heap_size_in_bytes;
  v8::NearHeapLimitCallback near_heap_limit_callback;
  void* near_heap_limit_callback_data;
  V8VMInitType type;
  std::shared_ptr<v8::StartupData> snapshot_blob;
  std::any holder;
  std::basic_string<uint8_t> buffer;
  bool enable_v8_serialization;

  static size_t HeapLimitSlowGrowthStrategy(void* data, size_t current_heap_limit,
                                            size_t initial_heap_limit) {
    // The heap limit must be larger than the old generation capacity,
    // but its size cannot be obtained directly, so use the old space size for simulation
    constexpr char kOldSpace[] = "old_space";
    constexpr char kCodeSpace[] = "code_space";
    constexpr char kMapSpace[] = "map_space";
    constexpr char kLOSpace[] = "large_object_space";
    constexpr char kCodeLOSpace[] = "code_large_object_space";
    auto isolate = v8::Isolate::GetCurrent();
    size_t capacity = 0;
    v8::HeapSpaceStatistics heap_space_statistics;
    for (size_t i = 0; i < isolate->NumberOfHeapSpaces(); i++) {
      isolate->GetHeapSpaceStatistics(&heap_space_statistics, i);
      std::string space_name(heap_space_statistics.space_name());
      if (space_name == kOldSpace || space_name == kCodeSpace || space_name == kMapSpace) {
        capacity += heap_space_statistics.space_size();
      } else if (space_name == kLOSpace || space_name == kCodeLOSpace) {
        capacity += heap_space_statistics.space_used_size();
      }
    }
    const size_t kHeapSizeFactor = 2;
    return std::clamp(std::max(current_heap_limit * kHeapSizeFactor, capacity),
                      std::numeric_limits<size_t>::min(),
                      std::numeric_limits<size_t>::max());
  }
};

class V8VM : public VM {
 public:
  using string_view = footstone::string_view;
#if defined(ENABLE_INSPECTOR) && defined(JS_V8) && !defined(V8_WITHOUT_INSPECTOR)
  using V8InspectorClientImpl = hippy::inspector::V8InspectorClientImpl;
#endif
  struct DeserializerResult {
    bool flag;
    std::shared_ptr<CtxValue> result;
    string_view message;
  };

  V8VM(const std::shared_ptr<V8VMInitParam>& param);
  ~V8VM();

  inline void SaveUncaughtExceptionCallback(std::unique_ptr<FunctionWrapper>&& wrapper) {
    uncaught_exception_ = std::move(wrapper);
  }
  inline bool IsEnableV8Serialization() { return enable_v8_serialization_; }
  inline std::string& GetBuffer() { return serializer_reused_buffer_; }

#if defined(ENABLE_INSPECTOR) && defined(JS_V8) && !defined(V8_WITHOUT_INSPECTOR)
  inline void SetInspectorClient(std::shared_ptr<V8InspectorClientImpl> inspector_client) {
    inspector_client_ = inspector_client;
  }
  inline std::shared_ptr<V8InspectorClientImpl> GetInspectorClient() {
    return inspector_client_;
  }
#endif
  virtual std::shared_ptr<Ctx> CreateContext() override;
  virtual std::shared_ptr<CtxValue> ParseJson(const std::shared_ptr<Ctx>& ctx, const string_view& json) override;
  void AddUncaughtExceptionMessageListener(const std::unique_ptr<FunctionWrapper>& wrapper) const;
  DeserializerResult Deserializer(const std::shared_ptr<Ctx>& ctx, const std::string& buffer);

  static v8::Local<v8::String> CreateV8String(v8::Isolate* isolate,
                                              v8::Local<v8::Context> context,
                                              const string_view& str_view);
  static string_view ToStringView(v8::Isolate* isolate,
                                  v8::Local<v8::Context> context,
                                  v8::Local<v8::String> str);
  static string_view GetMessageDescription(v8::Isolate* isolate,
                                           v8::Local<v8::Context> context,
                                           v8::Local<v8::Message> message);
  static string_view GetStackTrace(v8::Isolate* isolate,
                                   v8::Local<v8::Context> context,
                                   v8::Local<v8::StackTrace> trace);
  static void PlatformDestroy();
  static std::shared_ptr<VM> CreateVM(const std::shared_ptr<VMInitParam>& param);

  v8::Isolate* isolate_;
  v8::Isolate::CreateParams create_params_;
  std::unique_ptr<FunctionWrapper> uncaught_exception_;
  std::string serializer_reused_buffer_;
  bool enable_v8_serialization_;

#if defined(ENABLE_INSPECTOR) && !defined(V8_WITHOUT_INSPECTOR)
  std::shared_ptr<V8InspectorClientImpl> inspector_client_;
#endif
};

}
}
}
