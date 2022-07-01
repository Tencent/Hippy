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

#include "exception_handler.h"

namespace voltron {

void ExceptionHandler::ReportJsException(const std::shared_ptr<Runtime>& runtime, const unicode_string_view& desc,
                                         const unicode_string_view& stack) {
  FOOTSTONE_DLOG(INFO) << "ReportJsException begin";

  auto bridge = std::static_pointer_cast<VoltronBridge>(runtime->GetBridge());

  if (bridge) {
    auto platform_runtime = bridge->GetPlatformRuntime();
    if (platform_runtime) {
      std::u16string exception = StringViewUtils::CovertToUtf16(desc, desc.encoding()).utf16_value();
      std::u16string stack_trace = StringViewUtils::CovertToUtf16(stack, stack.encoding()).utf16_value();

      platform_runtime->ReportJSException(exception, stack_trace);
    }
  }
  FOOTSTONE_DLOG(INFO) << "ReportJsException end";
}
}
