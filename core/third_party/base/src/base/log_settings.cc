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

#include "base/log_settings.h"

#include <fcntl.h>
#include <string.h>

#include <algorithm>
#include <iostream>

#include "base/logging.h"

namespace tdf {
namespace base {
extern LogSettings global_log_settings;

void SetLogSettings(const LogSettings& settings) {
  // Validate the new settings as we set them.
  global_log_settings.min_log_level = std::min(TDF_LOG_FATAL, settings.min_log_level);
}

LogSettings GetLogSettings() { return global_log_settings; }

int GetMinLogLevel() { return std::min(global_log_settings.min_log_level, TDF_LOG_FATAL); }

}  // namespace base
}  // namespace tdf
