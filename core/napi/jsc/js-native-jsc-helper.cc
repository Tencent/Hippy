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

#include "core/napi/jsc/js-native-jsc-helper.h"

#include <iostream>

namespace hippy {
namespace napi {

std::string js_string_to_utf8(JSStringRef jsString) {
  size_t maxBufferSize = JSStringGetMaximumUTF8CStringSize(jsString);
  char *utf8Buffer = new char[maxBufferSize];
  size_t bytesWritten =
      JSStringGetUTF8CString(jsString, utf8Buffer, maxBufferSize);
  std::string utf_string = std::string(utf8Buffer, bytesWritten - 1);
  delete[] utf8Buffer;
  return utf_string;
}

void exception_description(JSContextRef ctx, JSValueRef exception) {
  if (!exception) {
    return;
  }

  JSStringRef exceptionRef = JSValueToStringCopy(ctx, exception, nullptr);
  size_t maxBufferSize = JSStringGetMaximumUTF8CStringSize(exceptionRef);
  char *utf8Buffer = new char[maxBufferSize];
  JSStringGetUTF8CString(exceptionRef, utf8Buffer, maxBufferSize);

  std::cout << "call function expection: " << utf8Buffer << std::endl;
  delete[] utf8Buffer;
}

}  // namespace napi
}  // namespace hippy
