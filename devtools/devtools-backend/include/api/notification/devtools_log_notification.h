/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#pragma once

#include <string>
#include "footstone/logging.h"
#include "module/record_logger.h"

namespace hippy::devtools {
/**
 * Log bridge notification
 */
class LogNotification {
 public:
  /**
   * @brief Output log to the frontend of devtools
   * @param log_module msg module
   * @param log_message msg detail
   * @param serverity log level
   * @param file_name log file name
   * @param line_number line numbder
   */
  virtual void PrintLog(const std::string &log_module, const std::string &log_message, footstone::LogSeverity serverity,
           const std::string &file_name, int32_t line_number) = 0;
};
}  // namespace hippy::devtools
