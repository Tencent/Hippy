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

#include "core/base/logging.h"

#include <sstream>

#include "core/base/macros.h"
#include "core/platform/logging-impl.h"

namespace hippy {
namespace internal {

LogFunction GetLoggingFunction(LoggingLevel level) {
  switch (level) {
    case LoggingLevel::Info:
      return platform::napi_log_info;
    case LoggingLevel::Warning:
      return platform::napi_log_warn;
    case LoggingLevel::Error:
      return platform::napi_log_error;
    case LoggingLevel::Fatal:
      return platform::napi_log_fatal;
    case LoggingLevel::Debug:
    default:
      return platform::napi_log_debug;
  }
}

std::string GetLoggingFormat(const char* file, int line, const char* format) {
  std::ostringstream oss;
  oss << file << "(" << line << "): " << format;
  return oss.str();
}

}  // namespace internal
}  // namespace hippy
