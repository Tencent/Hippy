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

#ifndef CORE_MODULES_JS_VALUE_HELPER_H_
#define CORE_MODULES_JS_VALUE_HELPER_H_

#include <stdint.h>
#include <string>
#include <type_traits>
#include <utility>

#include "core/base/logging.h"
#include "core/napi/js-native-api.h"

namespace hippy {

// Create |napi_value| from |val| in |context|
template <typename T>
inline napi::napi_value CreateJsValue(napi::napi_context context, T val) {
  static_assert(std::is_arithmetic<T>::value,
                "|T| of |val| must be arithmetic/bool/string/napi_value.");
  return napi::napi_create_number(context, val);
}

inline napi::napi_value CreateJsValue(napi::napi_context context, bool val) {
  return napi::napi_create_boolean(context, val);
}

inline napi::napi_value CreateJsValue(napi::napi_context context,
                                      const char* s) {
  return napi::napi_create_string(context, s);
}

inline napi::napi_value CreateJsValue(napi::napi_context context,
                                      const std::string& str) {
  return napi::napi_create_string(context, str.c_str());
}

inline napi::napi_value CreateJsValue(napi::napi_context context,
                                      napi::napi_value value) {
  return value;
}

// Invoke |function| in |context| with |args...|
template <typename... Args>
void InvokeJsFunction(napi::napi_context context, napi::napi_value function,
                      Args&&... args) {
  HIPPY_CHECK(napi_is_function(context, function));

  constexpr size_t kSize = sizeof...(args);

  if (!kSize) {
    napi::napi_call_function(context, function);
  } else {
    size_t index = 0;
    napi::napi_value values[kSize];
    auto setter = [&](auto&& arg) {
      values[index++] =
          CreateJsValue(context, std::forward<decltype(arg)>(arg));
    };

    using Expander = int[];
    (void)Expander{0, (setter(std::forward<Args>(args)), 0)...};
    napi::napi_call_function(context, function, kSize, values);
  }
}

}  // namespace hippy

#endif  // CORE_MODULES_JS_VALUE_HELPER_H_
