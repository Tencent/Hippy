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

#include "core/napi/jsc/js_native_jsc_helper.h"

#include <iostream>

#include "core/base/logging.h"
#include "core/napi/js_native_api_types.h"
#include "core/napi/js_native_api.h"
#include "core/napi/jsc/js_native_api_jsc.h"
#include "core/napi/native_source_code.h"

namespace hippy {
namespace napi {

std::string JsStrToUTF8(JSStringRef str) {
  size_t max_size = JSStringGetMaximumUTF8CStringSize(str);
  char *buf = new char[max_size];
  size_t bytes = JSStringGetUTF8CString(str, buf, max_size);
  std::string utf_string = std::string(buf, bytes - 1);
  delete[] buf;
  return utf_string;
}

void ExceptionDescription(JSContextRef ctx, JSValueRef exception) {
  if (!exception) {
    return;
  }

  JSStringRef exception_ref = JSValueToStringCopy(ctx, exception, nullptr);
  size_t max_size = JSStringGetMaximumUTF8CStringSize(exception_ref);
  if (max_size <= 0) {
    return;
  }
  char *buf = new char[max_size];
  JSStringGetUTF8CString(exception_ref, buf, max_size);

  std::cout << "call function expection: " << buf << std::endl;
  delete[] buf;
}

}  // namespace napi
}  // namespace hippy
