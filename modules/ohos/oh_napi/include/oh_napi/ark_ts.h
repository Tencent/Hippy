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

#pragma once

#include <js_native_api.h>
#include <js_native_api_types.h>
#include <array>
#include <vector>
#include <string>
#include <functional>
#include <variant>
#include "footstone/string_view.h"

using string_view = footstone::string_view;

class OhNapiObjectBuilder;
class OhNapiObject;

class ArkTS {
 public:
  ArkTS(napi_env env);

  template <size_t args_count>
  napi_value Call(napi_value callback, std::array<napi_value, args_count> args, napi_value this_object = nullptr) {
    napi_value result;
    auto status = napi_call_function(env_, this_object, callback, args.size(), args.data(), &result);
    this->MaybeThrowFromStatus(status, "Couldn't call a callback");
    return result;
  }

  napi_value Call(napi_value callback, std::vector<napi_value> args, napi_value this_object = nullptr);

  napi_value Call(napi_value callback, const napi_value *args, int args_count, napi_value this_object);

  napi_value CreateBoolean(bool value);

  napi_value CreateInt(int value);
    
  napi_value CreateInt64(int64_t value);

  napi_value CreateUint32(uint32_t value);

  napi_value CreateDouble(double value);

  napi_value CreateString(std::string const &str);

  napi_value CreateStringUtf8(string_view::u8string const &str);

  napi_value CreateStringUtf16(std::u16string const &str);

  napi_value CreateExternalArrayBuffer(void* external_data, size_t byte_length);

  napi_ref CreateReference(napi_value value);

  void DeleteReference(napi_ref reference);

  napi_value CreateArray();

  napi_value CreateArray(std::vector<napi_value>);

  OhNapiObjectBuilder CreateObjectBuilder();

  OhNapiObjectBuilder GetObjectBuilder(napi_value object);

  bool IsPromise(napi_value);

  napi_value GetUndefined();

  napi_value GetNull();

  napi_value GetReferenceValue(napi_ref ref);

  std::vector<napi_value> GetCallbackArgs(napi_callback_info info);

  std::vector<napi_value> GetCallbackArgs(napi_callback_info info, size_t args_count);

  OhNapiObject GetObject(napi_value object);

  OhNapiObject GetObject(napi_ref object_ref);

  napi_value GetObjectProperty(napi_value object, std::string const &key);

  napi_value GetObjectProperty(napi_value object, napi_value key);

  bool GetBoolean(napi_value value);

  double GetDouble(napi_value value);

  int GetInteger(napi_value value);

  int64_t GetInt64(napi_value value);
  
  bool IsArray(napi_value array);

  napi_value GetArrayElement(napi_value array, uint32_t index);

  uint32_t GetArrayLength(napi_value array);

  std::vector<std::pair<napi_value, napi_value>> GetObjectProperties(napi_value object);
    
  std::vector<std::pair<napi_value, napi_value>> GetObjectPrototypeProperties(napi_value object);

  std::string GetString(napi_value value);

  bool GetArrayBufferInfo(napi_value value, void** data, size_t* byte_length);

  bool IsArrayBuffer(napi_value value);

  napi_valuetype GetType(napi_value value);

  napi_env GetEnv();

  void ThrowError(const char *message);

  void PrintValue(napi_value value);

 private:
  napi_env env_;

  void MaybeThrowFromStatus(napi_status status, const char *message);
};
