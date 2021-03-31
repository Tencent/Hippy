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

#include <string>

#include "core/base/logging.h"
#include "core/napi/js_native_api.h"
#include "core/napi/v8/js_native_api_v8.h"

namespace hippy {
namespace napi {

// Create Value

std::shared_ptr<CtxValue> V8Ctx::CreateNumber(double number) {
  v8::HandleScope isolate_scope(isolate_);

  v8::Handle<v8::Value> v8_number = v8::Number::New(isolate_, number);
  if (v8_number.IsEmpty()) {
    return nullptr;
  }
  return std::make_shared<V8CtxValue>(isolate_, v8_number);
}

std::shared_ptr<CtxValue> V8Ctx::CreateBoolean(bool b) {
  v8::HandleScope isolate_scope(isolate_);

  v8::Handle<v8::Boolean> v8_boolean = v8::Boolean::New(isolate_, b);
  if (v8_boolean.IsEmpty()) {
    return nullptr;
  }
  return std::make_shared<V8CtxValue>(isolate_, v8_boolean);
}

std::shared_ptr<CtxValue> V8Ctx::CreateString(const char *string) {
  if (!string) {
    return nullptr;
  }
  v8::HandleScope isolate_scope(isolate_);

  v8::Handle<v8::String> v8_string =
      v8::String::NewFromUtf8(isolate_, string, v8::NewStringType::kNormal)
          .FromMaybe(v8::Local<v8::String>());
  if (v8_string.IsEmpty()) {
    return nullptr;
  }
  return std::make_shared<V8CtxValue>(isolate_, v8_string);
}

std::shared_ptr<CtxValue> V8Ctx::CreateUndefined() {
  v8::HandleScope isolate_scope(isolate_);

  v8::Handle<v8::Value> undefined = v8::Undefined(isolate_);
  if (undefined.IsEmpty()) {
    return nullptr;
  }
  return std::make_shared<V8CtxValue>(isolate_, undefined);
}

std::shared_ptr<CtxValue> V8Ctx::CreateNull() {
  v8::HandleScope isolate_scope(isolate_);

  v8::Handle<v8::Value> v8Null = v8::Null(isolate_);
  if (v8Null.IsEmpty()) {
    return nullptr;
  }
  return std::make_shared<V8CtxValue>(isolate_, v8Null);
}

v8::Handle<v8::Value> V8Ctx::ParseJson(const char *json) {
  v8::HandleScope handle_scope(isolate_);
  v8::Handle<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  v8::Handle<v8::Object> global = context->Global();
  v8::Handle<v8::Value> json_cls = global->Get(
      v8::String::NewFromUtf8(isolate_, "JSON", v8::NewStringType::kNormal)
          .FromMaybe(v8::Local<v8::String>()));
  v8::Handle<v8::Value> json_parse_func =
      v8::Handle<v8::Object>::Cast(json_cls)->Get(
          v8::String::NewFromUtf8(isolate_, "parse", v8::NewStringType::kNormal)
              .FromMaybe(v8::Local<v8::String>()));
  v8::Handle<v8::String> v8_str =
      v8::String::NewFromUtf8(isolate_, json, v8::NewStringType::kNormal)
          .FromMaybe(v8::Local<v8::String>());
  v8::Handle<v8::Value> argv[1] = {v8_str};
  return v8::Handle<v8::Function>::Cast(json_parse_func)
      ->Call(json_cls, 1, argv);
}

std::shared_ptr<CtxValue> V8Ctx::CreateObject(const char *json) {
  if (!json) {
    return nullptr;
  }

  v8::Handle<v8::Value> object = ParseJson(json);
  if (object.IsEmpty()) {
    return nullptr;
  }
  return std::make_shared<V8CtxValue>(isolate_, object);
}

std::shared_ptr<CtxValue> V8Ctx::CreateArray(
    size_t count,
    std::shared_ptr<CtxValue> value[]) {
  if (!count) {
    return nullptr;
  }
  v8::HandleScope handle_scope(isolate_);

  v8::Handle<v8::Array> array = v8::Array::New(isolate_, count);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  for (size_t i = 0; i < count; i++) {
    std::shared_ptr<V8CtxValue> ctx_value =
        std::static_pointer_cast<V8CtxValue>(value[i]);
    const v8::Persistent<v8::Value> &persistent_value =
        ctx_value->persisent_value_;
    v8::Handle<v8::Value> handle_value =
        v8::Handle<v8::Value>::New(isolate_, persistent_value);
    array->Set(i, handle_value);
  }
  return std::make_shared<V8CtxValue>(isolate_, array);
}

std::shared_ptr<CtxValue> V8Ctx::CreateJsError(const std::string &msg) {
  HIPPY_DLOG(hippy::Debug, "V8Ctx::CreateJsError msg = %s", msg.c_str());
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  v8::Handle<v8::Value> error = v8::Exception::Error(
      v8::String::NewFromUtf8(isolate_, msg.c_str(), v8::NewStringType::kNormal,
                              msg.length())
          .FromMaybe(v8::Local<v8::String>()));
  if (error.IsEmpty()) {
    HIPPY_DLOG(hippy::Debug, "error is empty");
    return nullptr;
  }
  return std::make_shared<V8CtxValue>(isolate_, error);
}

// Get From Value

bool V8Ctx::GetValueNumber(std::shared_ptr<CtxValue> value, double *result) {
  if (!value || !result) {
    return false;
  }
  v8::HandleScope handle_scope(isolate_);

  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(value);
  const v8::Persistent<v8::Value> &persistent_value =
      ctx_value->persisent_value_;
  v8::Handle<v8::Value> handle_value =
      v8::Handle<v8::Value>::New(isolate_, persistent_value);

  if (handle_value.IsEmpty() || !handle_value->IsNumber()) {
    return false;
  }

  v8::Local<v8::Number> number =
      handle_value->ToNumber(context).ToLocalChecked();
  if (number.IsEmpty()) {
    return false;
  }

  *result = number->Value();
  return true;
}

bool V8Ctx::GetValueNumber(std::shared_ptr<CtxValue> value, int32_t *result) {
  if (!value || !result) {
    return false;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(value);
  const v8::Persistent<v8::Value> &persistent_value =
      ctx_value->persisent_value_;
  v8::Handle<v8::Value> handle_value =
      v8::Handle<v8::Value>::New(isolate_, persistent_value);

  if (handle_value.IsEmpty() || !handle_value->IsInt32()) {
    return false;
  }

  v8::Local<v8::Int32> number = handle_value->ToInt32(context).ToLocalChecked();
  if (number.IsEmpty()) {
    return false;
  }

  *result = number->Value();
  return true;
}

bool V8Ctx::GetValueBoolean(std::shared_ptr<CtxValue> value, bool *result) {
  if (!value || !result) {
    return false;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(value);
  const v8::Persistent<v8::Value> &persistent_value =
      ctx_value->persisent_value_;
  v8::Handle<v8::Value> handle_value =
      v8::Handle<v8::Value>::New(isolate_, persistent_value);

  if (handle_value.IsEmpty() || !handle_value->IsBoolean()) {
    return false;
  }

  v8::Handle<v8::Boolean> boolean = handle_value->ToBoolean(isolate_);
  if (boolean.IsEmpty()) {
    return false;
  }

  *result = boolean->Value();
  return true;
}

bool V8Ctx::GetValueString(std::shared_ptr<CtxValue> value,
                           std::string *result) {
  HIPPY_DLOG(hippy::Debug, "V8Ctx::GetValueString");
  if (!value || !result) {
    return false;
  }
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(value);
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  const v8::Persistent<v8::Value> &persistent_value =
      ctx_value->persisent_value_;
  v8::Handle<v8::Value> handle_value =
      v8::Handle<v8::Value>::New(isolate_, persistent_value);
  if (handle_value.IsEmpty()) {
    return false;
  }

  if (handle_value->IsString() || handle_value->IsStringObject()) {
    v8::String::Utf8Value utf8String(isolate_, handle_value);
    *result = *utf8String;
    return true;
  }
  return false;
}

bool V8Ctx::GetValueJson(std::shared_ptr<CtxValue> value, std::string *result) {
  if (!value || !result) {
    return false;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(value);
  const v8::Persistent<v8::Value> &persistent_value =
      ctx_value->persisent_value_;
  v8::Handle<v8::Value> handle_value =
      v8::Handle<v8::Value>::New(isolate_, persistent_value);
  if (handle_value.IsEmpty() || !handle_value->IsObject()) {
    return false;
  }

  v8::MaybeLocal<v8::String> v8MaybeString =
      v8::JSON::Stringify(context, handle_value);
  if (v8MaybeString.IsEmpty()) {
    return false;
  }

  v8::Handle<v8::String> v8String = v8MaybeString.ToLocalChecked();
  v8::String::Utf8Value utf8Value(isolate_, v8String);
  *result = *utf8Value;
  return true;
}

// Array Helpers

bool V8Ctx::IsArray(std::shared_ptr<CtxValue> value) {
  if (!value) {
    return false;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(value);
  const v8::Persistent<v8::Value> &persistent_value =
      ctx_value->persisent_value_;
  v8::Handle<v8::Value> handle_value =
      v8::Handle<v8::Value>::New(isolate_, persistent_value);

  if (handle_value.IsEmpty()) {
    return false;
  }
  return handle_value->IsArray();
}

uint32_t V8Ctx::GetArrayLength(std::shared_ptr<CtxValue> value) {
  if (value == nullptr) {
    return 0;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(value);
  const v8::Persistent<v8::Value> &persistent_value =
      ctx_value->persisent_value_;
  v8::Handle<v8::Value> handle_value =
      v8::Handle<v8::Value>::New(isolate_, persistent_value);

  if (handle_value.IsEmpty()) {
    return 0;
  }

  if (handle_value->IsArray()) {
    v8::Array *array = v8::Array::Cast(*handle_value);
    return array->Length();
  }

  return 0;
}

std::shared_ptr<CtxValue> V8Ctx::CopyArrayElement(
    std::shared_ptr<CtxValue> value,
    uint32_t index) {
  if (!value) {
    return nullptr;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(value);
  const v8::Persistent<v8::Value> &persistent_value =
      ctx_value->persisent_value_;
  v8::Handle<v8::Value> handle_value =
      v8::Handle<v8::Value>::New(isolate_, persistent_value);

  if (handle_value.IsEmpty()) {
    return nullptr;
  }

  if (handle_value->IsArray()) {
    v8::Array *array = v8::Array::Cast(*handle_value);
    v8::Local<v8::Value> value = array->Get(context, index).ToLocalChecked();
    if (value.IsEmpty()) {
      return nullptr;
    }

    return std::make_shared<V8CtxValue>(isolate_, value);
  }
  return nullptr;
}

// Object Helpers

bool V8Ctx::HasNamedProperty(std::shared_ptr<CtxValue> value,
                             const char *utf8name) {
  if (!value || !utf8name) {
    return false;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(value);
  const v8::Persistent<v8::Value> &persistent_value =
      ctx_value->persisent_value_;
  v8::Handle<v8::Value> handle_value =
      v8::Handle<v8::Value>::New(isolate_, persistent_value);

  if (handle_value.IsEmpty()) {
    return false;
  }

  if (handle_value->IsMap()) {
    v8::Map *map = v8::Map::Cast(*handle_value);
    v8::Local<v8::String> key =
        v8::String::NewFromUtf8(isolate_, utf8name, v8::NewStringType::kNormal)
            .FromMaybe(v8::Local<v8::String>());
    if (key.IsEmpty()) {
      return false;
    }

    v8::Maybe<bool> ret = map->Has(context, key);
    return ret.ToChecked();
  }
  return false;
}

std::shared_ptr<CtxValue> V8Ctx::CopyNamedProperty(
    std::shared_ptr<CtxValue> value,
    const char *utf8name) {
  if (!value || !utf8name) {
    return nullptr;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(value);
  const v8::Persistent<v8::Value> &persistent_value =
      ctx_value->persisent_value_;
  v8::Handle<v8::Value> handle_value =
      v8::Handle<v8::Value>::New(isolate_, persistent_value);

  if (handle_value.IsEmpty()) {
    return nullptr;
  }

  if (handle_value->IsMap()) {
    v8::Map *map = v8::Map::Cast(*handle_value);
    if (map == nullptr) {
      return nullptr;
    }

    v8::Local<v8::String> key =
        v8::String::NewFromUtf8(isolate_, utf8name, v8::NewStringType::kNormal)
            .FromMaybe(v8::Local<v8::String>());
    if (key.IsEmpty()) {
      return nullptr;
    }

    return std::make_shared<V8CtxValue>(
        isolate_, map->Get(context, key).ToLocalChecked());
  }

  return nullptr;
}

// Function Helpers

bool V8Ctx::IsFunction(std::shared_ptr<CtxValue> value) {
  if (!value) {
    return false;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(value);
  const v8::Persistent<v8::Value> &persistent_value =
      ctx_value->persisent_value_;
  v8::Handle<v8::Value> handle_value =
      v8::Handle<v8::Value>::New(isolate_, persistent_value);

  if (handle_value.IsEmpty()) {
    return false;
  }

  return handle_value->IsFunction();
}

std::string V8Ctx::CopyFunctionName(std::shared_ptr<CtxValue> function) {
  if (!function) {
    return nullptr;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(function);
  const v8::Persistent<v8::Value> &persistent_value =
      ctx_value->persisent_value_;
  v8::Handle<v8::Value> handle_value =
      v8::Handle<v8::Value>::New(isolate_, persistent_value);

  if (handle_value.IsEmpty()) {
    return nullptr;
  }

  if (handle_value->IsFunction()) {
    v8::String::Utf8Value function_name(isolate_, handle_value);
    std::string js_string(*function_name);

    return js_string;
  }

  return strdup("function param is not a function");
}

}  // namespace napi
}  // namespace hippy
