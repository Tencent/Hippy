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

#include "core/vm/js_vm.h"

#include <any>

#include "base/unicode_string_view.h"
#include "core/napi/js_ctx.h"
#include "core/vm/v8/snapshot_data.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wconversion"
#include "v8/v8.h"
#pragma clang diagnostic pop

namespace hippy {
namespace vm {

struct V8VMInitParam : public VMInitParam {
  enum class V8VMSnapshotType {
    kNoSnapshot, kCreateSnapshot, kUseSnapshot
  };

  size_t initial_heap_size_in_bytes;
  size_t maximum_heap_size_in_bytes;
  v8::NearHeapLimitCallback near_heap_limit_callback;
  void* near_heap_limit_callback_data;
  V8VMSnapshotType type;
  SnapshotData snapshot_data;

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
  using unicode_string_view = tdf::base::unicode_string_view;

  V8VM(const std::shared_ptr<V8VMInitParam>& param);
  ~V8VM();

  virtual std::shared_ptr<Ctx> CreateContext();

  static v8::Local<v8::String> CreateV8String(v8::Isolate* isolate, const unicode_string_view& str_view);
  static unicode_string_view ToStringView(v8::Isolate* isolate, v8::Local<v8::String> str);

  static void PlatformDestroy();

  v8::Isolate* isolate_;
  v8::Isolate::CreateParams create_params_;
  SnapshotData snapshot_data_;
};

class V8SnapshotVM : public VM {
 public:
  V8SnapshotVM();
  ~V8SnapshotVM();

  virtual std::shared_ptr<Ctx> CreateContext() override;

  v8::Isolate::CreateParams create_params_;
  std::shared_ptr<v8::SnapshotCreator> snapshot_creator_;
  v8::Isolate* isolate_;
};

}
}
