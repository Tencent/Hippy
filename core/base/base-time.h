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

#ifndef CORE_BASE_TIME_H_
#define CORE_BASE_TIME_H_

#include <stdint.h>

#include <chrono>

namespace hippy {
namespace base {
inline uint64_t MonotonicallyIncreasingTime() {
  auto now = std::chrono::steady_clock::now();
  auto now_ms = std::chrono::time_point_cast<std::chrono::milliseconds>(now)
                    .time_since_epoch();
  return std::chrono::duration_cast<std::chrono::milliseconds>(now_ms).count();
}
}  // namespace base
}  // namespace hippy

#endif  // CORE_BASE_TIME_H_
