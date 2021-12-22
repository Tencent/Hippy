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

#ifndef RENDER_CORE_BASE_LOGGING_H_
#define RENDER_CORE_BASE_LOGGING_H_

#define DEBUG

#include <assert.h>
#include <string>

namespace rendercore {

enum LoggingLevel {
  Debug,
  Info,
  Warning,
  Error,
  Fatal,
};

namespace internal {

using LogFunction = void (*)(const char* format, ...);
LogFunction GetLoggingFunction(LoggingLevel level);

std::string GetLoggingFormat(const char* file, int line, const char* format);

template <typename... Args>
void Log(LoggingLevel level, const char* format, Args&&... args) {
  GetLoggingFunction(level)(format, args...);
}
template <typename... Args>
void Log(LoggingLevel level, const char* file, int line, const char* format,
         Args&&... args) {
  GetLoggingFunction(level)(GetLoggingFormat(file, line, format).c_str(),
                            args...);
}

}  // namespace internal
}  // namespace hippy

#ifdef DEBUG
#define RENDER_CORE_LOG(level, ...) \
  rendercore::internal::Log(level, __FILE__, __LINE__, __VA_ARGS__)
#define RENDER_CORE_DLOG(level, ...) HIPPY_LOG(level, __VA_ARGS__)
#else
#define RENDER_CORE_LOG(level, ...) rendercore::internal::Log(level, __VA_ARGS__)
#define HIPPY_DLOG(level, ...) (void(0))
#endif  // DEBUG

#endif  // RENDER_CORE_BASE_LOGGING_H_
