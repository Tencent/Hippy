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

#include <functional>
#include <string>
#include <unordered_map>

#include "base/logging.h"

namespace hippy {
namespace base {

constexpr int KB = 1024;
constexpr int MB = KB * 1024;
constexpr int GB = MB * 1024;
constexpr char kUseSnapshot[] = "USE_SNAPSHOT";
constexpr char kVMCreateCBKey[] = "VM_CREATED";
constexpr char kContextCreatedCBKey[] = "CONTEXT_CREATED";
constexpr char KScopeInitializedCBKey[] = "SCOPE_INITIALIZED";
constexpr char kAsyncTaskEndKey[] = "ASYNC_TASK_END";

using RegisterFunction = std::function<void(void*)>;
using RegisterMap = std::unordered_map<std::string, RegisterFunction>;

#define TO_REGISTER_FUNCTION(fn, T)    \
  [](void* p) {                        \
    auto* data = reinterpret_cast<T*>(p); \
    fn(data);                          \
  };

template <class F>
auto MakeCopyable(F&& f) {
  auto s = std::make_shared<std::decay_t<F>>(std::forward<F>(f));
  return [s](auto&&... args) -> decltype(auto) {
    return (*s)(decltype(args)(args)...);
  };
}

template<typename SourceType, typename TargetType>
static constexpr bool numeric_cast(const SourceType& source, TargetType& target) {
  auto target_value = static_cast<TargetType>(source);
  if (static_cast<SourceType>(target_value)!=source || (target_value < 0 && source > 0)
      || (target_value > 0 && source < 0)) {
    return false;
  }
  target = target_value;
  return true;
}

template<typename SourceType, typename TargetType>
static constexpr TargetType checked_numeric_cast(const SourceType& source) {
  TargetType target;
  auto result = numeric_cast<SourceType, TargetType>(source, target);
  TDF_BASE_CHECK(result);
  return target;
}

}  // namespace base
}  // namespace hippy
