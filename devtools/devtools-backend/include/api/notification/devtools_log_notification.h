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
#include "devtools_base/common/logging.h"
#include "module/record_logger.h"

namespace tdf {
namespace devtools {
class LogNotification {
 public:
  /**
   * JS 日志输出
   * @param log_message
   */
  virtual void PrintLog(const std::string& log_message, LogSeverity serverity, const std::string& file_name,
                        int32_t line_number) = 0;
};
}  // namespace devtools
}  // namespace tdf
