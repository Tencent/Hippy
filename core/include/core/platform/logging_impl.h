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

#ifndef HIPPY_CORE_PLATFORM_LOGGING_IMPL_H_
#define HIPPY_CORE_PLATFORM_LOGGING_IMPL_H_

namespace hippy {
namespace platform {

#define LOG_FUNCTION_NAME_PAIRS(V) \
  V(debug, DEBUG)                  \
  V(info, INFO)                    \
  V(warn, WARN)                    \
  V(error, ERROR)                  \
  V(fatal, FATAL)

#define VS(FunctionName, LogLevel) V(FunctionName)
#define V(FunctionName) void napi_log_##FunctionName(const char* format, ...);
LOG_FUNCTION_NAME_PAIRS(VS)
#undef V
#undef VS

}  // namespace platform
}  // namespace hippy

#endif  // HIPPY_CORE_PLATFORM_LOGGING_IMPL_H_
