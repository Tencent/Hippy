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

namespace tdf {
namespace base {

enum LogSeverity: int32_t {
  TDF_LOG_INFO,
  TDF_LOG_WARNING,
  TDF_LOG_ERROR,
  TDF_LOG_FATAL,
  TDF_LOG_NUM_SEVERITIES
};

// One of the Windows headers defines ERROR to 0. This makes the token
// concatenation in BASE_LOG(ERROR) to resolve to LOG_0. We define this back to
// the appropriate log level.
#ifdef _WIN32
#define LOG_0 LOG_ERROR
#endif

// LOG_DFATAL is LOG_FATAL in debug mode, ERROR in normal mode
#ifdef NDEBUG
constexpr LogSeverity TDF_LOG_DFATAL = TDF_LOG_ERROR;
#else
constexpr LogSeverity TDF_LOG_DFATAL = TDF_LOG_FATAL;
#endif

}  // namespace base
}  // namespace tdf
