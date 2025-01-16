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

#include "oh_napi/ark_ts.h"
#include "oh_napi/oh_napi_object.h"
#include "oh_napi/oh_napi_object_builder.h"
#include "footstone/logging.h"
#include <bits/alltypes.h>
#include <future>
#include <napi/native_api.h>
#include <string>
#include <thread>

ArkTS::ArkTS(napi_env env) {
  env_ = env;
}

napi_env ArkTS::GetEnv() { return env_; }

napi_value ArkTS::Call(napi_value callback, std::vector<napi_value> args, napi_value this_object) {
  napi_value result;

  // FOOTSTONE_DLOG(INFO) << "ArkTS::Call params, env:" << env_
  //   << ", obj:" << this_object
  //   << ", callback:" << callback
  //   << ", args:" << args.size();

  auto status = napi_call_function(env_, this_object, callback, args.size(), args.data(), &result);

  // FOOTSTONE_DLOG(INFO) << "ArkTS::Call params, status:" << status;

  this->MaybeThrowFromStatus(status, "Couldn't call a callback");
  return result;
}

napi_value ArkTS::Call(napi_value callback, const napi_value *args, int args_count, napi_value this_object) {
  napi_value result;
  auto status = napi_call_function(env_, this_object, callback, static_cast<size_t>(args_count), args, &result);
  this->MaybeThrowFromStatus(status, "Couldn't call a callback");
  return result;
}

napi_value ArkTS::CreateBoolean(bool value) {
  napi_value result;
  napi_get_boolean(env_, value, &result);
  return result;
}

napi_value ArkTS::CreateInt(int value) {
  napi_value result;
  napi_create_int32(env_, static_cast<int32_t>(value), &result);
  return result;
}

napi_value ArkTS::CreateInt64(int64_t value) {
  napi_value result;
  napi_create_bigint_int64(env_, value, &result);
  return result;
}

napi_value ArkTS::CreateUint32(uint32_t value) {
  napi_value result;
  napi_create_uint32(env_, value, &result);
  return result;
}

napi_value ArkTS::CreateDouble(double value) {
  napi_value result;
  napi_create_double(env_, value, &result);
  return result;
}

napi_value ArkTS::CreateString(std::string const &str) {
  napi_value result;
  auto status = napi_create_string_utf8(env_, str.c_str(), str.length(), &result);
  this->MaybeThrowFromStatus(status, "Failed to create string");
  return result;
}

napi_value ArkTS::CreateStringUtf8(string_view::u8string const &str) {
  napi_value result;
  auto status = napi_create_string_utf8(env_, reinterpret_cast<const char*>(str.c_str()), str.length(), &result);
  this->MaybeThrowFromStatus(status, "Failed to create u8string");
  return result;
}

napi_value ArkTS::CreateStringUtf16(std::u16string const &str) {
  napi_value result;
  auto status = napi_create_string_utf16(env_, str.c_str(), str.length(), &result);
  this->MaybeThrowFromStatus(status, "Failed to create u16string");
  return result;
}

static void NapiFinalize(napi_env env, void* finalize_data, void* finalize_hint) {
  // 用free释放内存不是通用的。
  // 在Hippy内部，napi_create_external_arraybuffer 的调用处需保证都是malloc/realloc分配的内存。
  if (finalize_data) {
    free(finalize_data);
  }
}

napi_value ArkTS::CreateExternalArrayBuffer(void* external_data, size_t byte_length) {
  napi_value result;
  auto status = napi_create_external_arraybuffer(env_, external_data, byte_length, NapiFinalize, NULL, &result);
  this->MaybeThrowFromStatus(status, "Failed to create external arraybuffer");
  return result;
}

napi_value ArkTS::GetUndefined() {
  napi_value result;
  napi_get_undefined(env_, &result);
  return result;
}

napi_value ArkTS::GetNull() {
  napi_value result;
  napi_get_null(env_, &result);
  return result;
}

OhNapiObjectBuilder ArkTS::CreateObjectBuilder() { return OhNapiObjectBuilder(env_, *this); }

OhNapiObjectBuilder ArkTS::GetObjectBuilder(napi_value object) { return OhNapiObjectBuilder(env_, *this, object); }

napi_value ArkTS::GetReferenceValue(napi_ref ref) {
  napi_value result;
  auto status = napi_get_reference_value(env_, ref, &result);
  this->MaybeThrowFromStatus(status, "Couldn't get a reference value");
  return result;
}

napi_ref ArkTS::CreateReference(napi_value value) {
  napi_ref result;
  auto status = napi_create_reference(env_, value, 1, &result);
  this->MaybeThrowFromStatus(status, "Couldn't create a reference");
  return result;
}

void ArkTS::DeleteReference(napi_ref reference) {
  auto status = napi_delete_reference(env_, reference);
  this->MaybeThrowFromStatus(status, "Couldn't delete a reference");
}

napi_value ArkTS::CreateArray() {
  napi_value result;
  napi_create_array(env_, &result);
  return result;
}

napi_value ArkTS::CreateArray(std::vector<napi_value> values) {
  napi_value result;
  napi_create_array(env_, &result);
  for (size_t i = 0; i < values.size(); i++) {
    napi_set_element(env_, result, static_cast<uint32_t>(i), values[i]);
  }
  return result;
}

std::vector<napi_value> ArkTS::GetCallbackArgs(napi_callback_info info) {
  size_t argc;
  napi_get_cb_info(env_, info, &argc, nullptr, nullptr, nullptr);
  return GetCallbackArgs(info, argc);
}

std::vector<napi_value> ArkTS::GetCallbackArgs(napi_callback_info info, size_t args_count) {
  size_t argc = args_count;
  std::vector<napi_value> args(args_count, nullptr);
  napi_get_cb_info(env_, info, &argc, args.data(), nullptr, nullptr);
  return args;
}

OhNapiObject ArkTS::GetObject(napi_value object) { return OhNapiObject(*this, object); }

OhNapiObject ArkTS::GetObject(napi_ref object_ref) { return OhNapiObject(*this, this->GetReferenceValue(object_ref)); }

napi_value ArkTS::GetObjectProperty(napi_value object, std::string const &key) {
  return GetObjectProperty(object, this->CreateString(key));
}

napi_value ArkTS::GetObjectProperty(napi_value object, napi_value key) {
  napi_value result;
  auto status = napi_get_property(env_, object, key, &result);
  this->MaybeThrowFromStatus(status, "Failed to retrieve property from object");
  return result;
}

bool ArkTS::GetBoolean(napi_value value) {
  bool result;
  auto status = napi_get_value_bool(env_, value, &result);
  this->MaybeThrowFromStatus(status, "Failed to retrieve boolean value");
  return result;
}

int ArkTS::GetInteger(napi_value value) {
  int result;
  auto status = napi_get_value_int32(env_, value, &result);
  this->MaybeThrowFromStatus(status, "Failed to retrieve integer value");
  return result;
}

int64_t ArkTS::GetInt64(napi_value value) {
  int64_t result;
  bool lossless;
  auto status = napi_get_value_bigint_int64(env_, value, &result, &lossless);
  this->MaybeThrowFromStatus(status, "Failed to retrieve int64 value");
  return result;
}

double ArkTS::GetDouble(napi_value value) {
  double result;
  auto status = napi_get_value_double(env_, value, &result);
  this->MaybeThrowFromStatus(status, "Failed to retrieve double value");
  return result;
}

bool ArkTS::IsArray(napi_value array) {
  napi_status status;
  bool result = false;
  status = napi_is_array(env_, array, &result);
  this->MaybeThrowFromStatus(status, "Failed to is array");
  return result;
}

napi_value ArkTS::GetArrayElement(napi_value array, uint32_t index) {
  napi_value result;
  auto status = napi_get_element(env_, array, index, &result);
  this->MaybeThrowFromStatus(status, "Failed to retrieve value at index");
  return result;
}

uint32_t ArkTS::GetArrayLength(napi_value array) {
  uint32_t length = 0;
  auto status = napi_get_array_length(env_, array, &length);
  this->MaybeThrowFromStatus(status, "Failed to read array length");
  return length;
}

std::vector<std::pair<napi_value, napi_value>> ArkTS::GetObjectPrototypeProperties(napi_value object) {
  napi_value prototype;
  auto status = napi_get_prototype(env_, object, &prototype);
  this->MaybeThrowFromStatus(status, "Failed to retrieve prototype object");
  auto result = GetObjectProperties(prototype);
  return result;
}

std::vector<std::pair<napi_value, napi_value>> ArkTS::GetObjectProperties(napi_value object) {
  napi_value propertyNames;
  auto status = napi_get_property_names(env_, object, &propertyNames);
  this->MaybeThrowFromStatus(status, "Failed to retrieve property names");
  uint32_t length = this->GetArrayLength(propertyNames);
  std::vector<std::pair<napi_value, napi_value>> result;
  for (uint32_t i = 0; i < length; i++) {
    napi_value propertyName = this->GetArrayElement(propertyNames, i);
    napi_value propertyValue = this->GetObjectProperty(object, propertyName);
    result.emplace_back(propertyName, propertyValue);
  }
  return result;
}

std::string ArkTS::GetString(napi_value value) {
  size_t length = 0;
  napi_status status;
  status = napi_get_value_string_utf8(env_, value, nullptr, 0, &length);
  this->MaybeThrowFromStatus(status, "Failed to get the length of the string");
  std::string buffer(length, '\0');
  status = napi_get_value_string_utf8(env_, value, buffer.data(), length + 1, &length);
  this->MaybeThrowFromStatus(status, "Failed to get the string data");
  return buffer;
}

bool ArkTS::GetArrayBufferInfo(napi_value value, void** data, size_t* byte_length) {
  napi_status status;
  status = napi_get_arraybuffer_info(env_, value, data, byte_length);
  this->MaybeThrowFromStatus(status, "Failed to get arraybuffer info");
  return true;
}

bool ArkTS::IsArrayBuffer(napi_value value) {
  napi_status status;
  bool result = false;
  status = napi_is_arraybuffer(env_, value, &result);
  this->MaybeThrowFromStatus(status, "Failed to is arraybuffer");
  return result;
}

void ArkTS::MaybeThrowFromStatus(napi_status status, const char *message) {
  if (status != napi_ok) {
    napi_extended_error_info const *error_info;
    napi_get_last_error_info(env_, &error_info);
    std::string msg_str = message;
    std::string error_code_msg_str = ". Error code: ";
    std::string status_str = error_info->error_message;
    std::string full_msg = msg_str + error_code_msg_str + status_str;
    
    FOOTSTONE_LOG(ERROR) << "ArkTS::MaybeThrowFromStatus, msg:" << full_msg;

    auto c_str = full_msg.c_str();
    this->ThrowError(c_str);
  }
}

void ArkTS::ThrowError(const char *message) {
  napi_throw_error(env_, nullptr, message);
}

napi_valuetype ArkTS::GetType(napi_value value) {
  napi_valuetype result;
  auto status = napi_typeof(env_, value, &result);
  this->MaybeThrowFromStatus(status, "Failed to get value type");
  return result;
}

bool ArkTS::IsPromise(napi_value value) {
  bool result;
  napi_is_promise(env_, value, &result);
  return result;
}

void ArkTS::PrintValue(napi_value value) {
  napi_valuetype type;
  auto type_status = napi_typeof(env_, value, &type);
  this->MaybeThrowFromStatus(type_status, "Failed to get value type");
  switch(type) {
    case napi_undefined: {
      FOOTSTONE_LOG(INFO) << "ArkTS::PrintValue: undefined";
    }
      break;
    case napi_null: {
      FOOTSTONE_LOG(INFO) << "ArkTS::PrintValue: null";
    }
      break;
    case napi_boolean: {
      bool result;
      auto status = napi_get_value_bool(env_, value, &result);
      this->MaybeThrowFromStatus(status, "Failed to retrieve boolean value");
      FOOTSTONE_LOG(INFO) << "ArkTS::PrintValue: boolean - " << result;
    }
      break;
    case napi_number: {
      double result;
      auto status = napi_get_value_double(env_, value, &result);
      this->MaybeThrowFromStatus(status, "Failed to retrieve double value");
      FOOTSTONE_LOG(INFO) << "ArkTS::PrintValue: number - " << result;
    }
      break;
    case napi_string: {
      size_t length = 0;
      napi_status status;
      status = napi_get_value_string_utf8(env_, value, nullptr, 0, &length);
      this->MaybeThrowFromStatus(status, "Failed to get the length of the string");
      std::string buffer(length, '\0');
      status = napi_get_value_string_utf8(env_, value, buffer.data(), length + 1, &length);
      this->MaybeThrowFromStatus(status, "Failed to get the string data");
      FOOTSTONE_LOG(INFO) << "ArkTS::PrintValue: string - " << buffer;
    }
      break;
    case napi_symbol: {
      FOOTSTONE_LOG(INFO) << "ArkTS::PrintValue: symbol";
    }
      break;
    case napi_object: {
      FOOTSTONE_LOG(INFO) << "ArkTS::PrintValue: object";
    }
      break;
    case napi_function: {
      FOOTSTONE_LOG(INFO) << "ArkTS::PrintValue: function";
    }
      break;
    case napi_external: {
      FOOTSTONE_LOG(INFO) << "ArkTS::PrintValue: external";
    }
      break;
    case napi_bigint: {
      int64_t result;
      bool lossless;
      auto status = napi_get_value_bigint_int64(env_, value, &result, &lossless);
      this->MaybeThrowFromStatus(status, "Failed to retrieve int64 value");
      FOOTSTONE_LOG(INFO) << "ArkTS::PrintValue: bigint - " << result;
    }
      break;
    default:
      break;
  }
}
