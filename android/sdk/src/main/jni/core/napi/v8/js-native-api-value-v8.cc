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

#include "core/napi/js-native-api.h"

#include <string>

#include "core/base/logging.h"
#include "core/napi/v8/js-native-api-v8.h"

namespace hippy {
namespace napi {

// Create Value

napi_value napi_create_number(napi_context context, double number) {
  HIPPY_DCHECK(context);
  v8::Isolate *isolate = context->isolate_;
  v8::HandleScope isolate_scope(isolate);

  v8::Handle<v8::Value> v8number = v8::Number::New(isolate, number);
  if (v8number.IsEmpty()) {
    return nullptr;
  }
  return std::make_shared<napi_value__>(isolate, v8number);
}

napi_value napi_create_boolean(napi_context context, bool b) {
  HIPPY_DCHECK(context);
  v8::Isolate *isolate = context->isolate_;
  v8::HandleScope isolate_scope(isolate);

  v8::Handle<v8::Boolean> v8Boolean = v8::Boolean::New(isolate, b);
  if (v8Boolean.IsEmpty()) {
    return nullptr;
  }
  return std::make_shared<napi_value__>(isolate, v8Boolean);
}

napi_value napi_create_string(napi_context context, const char *string) {
  HIPPY_DCHECK(context);
  if (!string) {
    return nullptr;
  }
  v8::Isolate *isolate = context->isolate_;
  v8::HandleScope isolate_scope(isolate);

  v8::Handle<v8::String> v8String =
      v8::String::NewFromUtf8(isolate, string, v8::NewStringType::kNormal)
          .ToLocalChecked();
  if (v8String.IsEmpty()) {
    return nullptr;
  }
  return std::make_shared<napi_value__>(isolate, v8String);
}

napi_value napi_create_undefined(napi_context context) {
  HIPPY_DCHECK(context);
  v8::Isolate *isolate = context->isolate_;
  v8::HandleScope isolate_scope(isolate);

  v8::Handle<v8::Value> undefined = v8::Undefined(isolate);
  if (undefined.IsEmpty()) {
    return nullptr;
  }
  return std::make_shared<napi_value__>(isolate, undefined);
}

napi_value napi_create_null(napi_context context) {
  HIPPY_DCHECK(context);
  v8::Isolate *isolate = context->isolate_;
  v8::HandleScope isolate_scope(isolate);

  v8::Handle<v8::Value> v8Null = v8::Null(isolate);
  if (v8Null.IsEmpty()) {
    return nullptr;
  }
  return std::make_shared<napi_value__>(isolate, v8Null);
}

napi_value napi_create_object(napi_context context, const char *json) {
  HIPPY_DCHECK(context);
  if (!json) {
    return nullptr;
  }
  v8::Isolate *isolate = context->isolate_;
  v8::HandleScope handle_scope(isolate);

  v8::Handle<v8::Context> v8context = context->context_persistent.Get(isolate);
  v8::Context::Scope context_scope(v8context);
  v8::Handle<v8::String> v8String =
      v8::String::NewFromUtf8(isolate, json, v8::NewStringType::kNormal)
          .ToLocalChecked();
  v8::MaybeLocal<v8::Value> maybeObj = v8::JSON::Parse(v8context, v8String);
  if (maybeObj.IsEmpty()) {
    return nullptr;
  }

  v8::Handle<v8::Value> object = maybeObj.ToLocalChecked();
  if (object.IsEmpty()) {
    return nullptr;
  }
  return std::make_shared<napi_value__>(isolate, object);
}

napi_value napi_create_array(napi_context context,
                             size_t count,
                             napi_value value[]) {
  HIPPY_DCHECK(context);
  if (!count) {
    return nullptr;
  }
  v8::Isolate *isolate = context->isolate_;
  v8::HandleScope handle_scope(isolate);

  v8::Handle<v8::Array> array = v8::Array::New(isolate, count);
  for (size_t i = 0; i < count; i++) {
    array->Set(i, value[i]->persisent_value.Get(isolate));
  }
  return std::make_shared<napi_value__>(isolate, array);
}

// Get From Value

bool napi_get_value_number(napi_context context,
                           napi_value value,
                           double *result) {
  HIPPY_DCHECK(context);
  if (!value || !result) {
    return false;
  }
  v8::Isolate *isolate = context->isolate_;
  v8::HandleScope handle_scope(isolate);

  v8::Local<v8::Context> v8context = context->context_persistent.Get(isolate);
  v8::Context::Scope context_scope(v8context);
  const v8::Persistent<v8::Value> &persistent_value = value->persisent_value;
  v8::Handle<v8::Value> handle_value =
      v8::Handle<v8::Value>::New(isolate, persistent_value);

  if (handle_value.IsEmpty() || !handle_value->IsNumber()) {
    return false;
  }

  v8::Local<v8::Number> number =
      handle_value->ToNumber(v8context).ToLocalChecked();
  if (number.IsEmpty()) {
    return false;
  }

  *result = number->Value();
  return true;
}

bool napi_get_value_number(napi_context context,
                           napi_value value,
                           int32_t *result) {
  HIPPY_DCHECK(context);
  if (!value || !result) {
    return false;
  }
  v8::Isolate *isolate = context->isolate_;
  v8::HandleScope handle_scope(isolate);

  v8::Local<v8::Context> v8context = context->context_persistent.Get(isolate);
  v8::Context::Scope context_scope(v8context);
  const v8::Persistent<v8::Value> &persistent_value = value->persisent_value;
  v8::Handle<v8::Value> handle_value =
      v8::Handle<v8::Value>::New(isolate, persistent_value);

  if (handle_value.IsEmpty() || !handle_value->IsInt32()) {
    return false;
  }

  v8::Local<v8::Int32> number =
      handle_value->ToInt32(v8context).ToLocalChecked();
  if (number.IsEmpty()) {
    return false;
  }

  *result = number->Value();
  return true;
}

bool napi_get_value_boolean(napi_context context,
                            napi_value value,
                            bool *result) {
  HIPPY_DCHECK(context);
  if (!value || !result) {
    return false;
  }
  v8::Isolate *isolate = context->isolate_;
  v8::HandleScope handle_scope(isolate);

  v8::Local<v8::Context> v8context = context->context_persistent.Get(isolate);
  v8::Context::Scope context_scope(v8context);
  const v8::Persistent<v8::Value> &persistent_value = value->persisent_value;
  v8::Handle<v8::Value> handle_value =
      v8::Handle<v8::Value>::New(isolate, persistent_value);

  if (handle_value.IsEmpty() || !handle_value->IsBoolean()) {
    return false;
  }

  v8::Handle<v8::Boolean> boolean = handle_value->ToBoolean(isolate);
  if (boolean.IsEmpty()) {
    return false;
  }

  *result = boolean->Value();
  return true;
}

bool napi_get_value_string(napi_context context,
                           napi_value value,
                           std::string *result) {
  HIPPY_DCHECK(context);
  if (!value || !result) {
    return false;
  }
  v8::Isolate *isolate = context->isolate_;
  v8::HandleScope handle_scope(isolate);

  v8::Local<v8::Context> v8context = context->context_persistent.Get(isolate);
  v8::Context::Scope context_scope(v8context);
  const v8::Persistent<v8::Value> &persistent_value = value->persisent_value;
  v8::Handle<v8::Value> handle_value =
      v8::Handle<v8::Value>::New(isolate, persistent_value);

  if (handle_value.IsEmpty()) {
    return false;
  }

  if (handle_value->IsString() || handle_value->IsStringObject()) {
    v8::String::Utf8Value utf8String(isolate, handle_value);
    *result = *utf8String;
    return true;
  }

  return false;
}

bool napi_get_value_json(napi_context context,
                         napi_value value,
                         std::string *result) {
  HIPPY_DCHECK(context);
  if (!value || !result) {
    return false;
  }
  v8::Isolate *isolate = context->isolate_;
  v8::HandleScope handle_scope(isolate);

  v8::Local<v8::Context> v8context = context->context_persistent.Get(isolate);
  v8::Context::Scope context_scope(v8context);
  const v8::Persistent<v8::Value> &persistent_value = value->persisent_value;
  v8::Handle<v8::Value> handle_value =
      v8::Handle<v8::Value>::New(isolate, persistent_value);

  if (handle_value.IsEmpty() || !handle_value->IsObject()) {
    return false;
  }

  v8::MaybeLocal<v8::String> v8MaybeString =
      v8::JSON::Stringify(v8context, handle_value);
  if (v8MaybeString.IsEmpty()) {
    return false;
  }

  v8::Handle<v8::String> v8String = v8MaybeString.ToLocalChecked();
  v8::String::Utf8Value utf8Value(isolate, v8String);
  *result = *utf8Value;
  return true;
}

// Array Helpers

bool napi_is_array(napi_context context, napi_value value) {
  HIPPY_DCHECK(context);
  if (!value) {
    return false;
  }
  v8::Isolate *isolate = context->isolate_;
  v8::HandleScope handle_scope(isolate);

  v8::Local<v8::Context> v8context = context->context_persistent.Get(isolate);
  v8::Context::Scope context_scope(v8context);
  const v8::Persistent<v8::Value> &persistent_value = value->persisent_value;
  v8::Handle<v8::Value> handle_value =
      v8::Handle<v8::Value>::New(isolate, persistent_value);

  if (handle_value.IsEmpty()) {
    return false;
  }
  return handle_value->IsArray();
}

uint32_t napi_get_array_length(napi_context context, napi_value value) {
  HIPPY_DCHECK(context);
  if (value == nullptr) {
    return 0;
  }
  v8::Isolate *isolate = context->isolate_;
  v8::HandleScope handle_scope(isolate);

  v8::Local<v8::Context> v8context = context->context_persistent.Get(isolate);
  v8::Context::Scope context_scope(v8context);
  const v8::Persistent<v8::Value> &persistent_value = value->persisent_value;
  v8::Handle<v8::Value> handle_value =
      v8::Handle<v8::Value>::New(isolate, persistent_value);

  if (handle_value.IsEmpty()) {
    return 0;
  }

  if (handle_value->IsArray()) {
    v8::Array *array = v8::Array::Cast(*handle_value);
    return array->Length();
  }

  return 0;
}

napi_value napi_copy_array_element(napi_context context,
                                   napi_value value,
                                   uint32_t index) {
  HIPPY_DCHECK(context);
  if (!value) {
    return nullptr;
  }
  v8::Isolate *isolate = context->isolate_;
  v8::HandleScope handle_scope(isolate);

  v8::Local<v8::Context> v8context = context->context_persistent.Get(isolate);
  v8::Context::Scope context_scope(v8context);
  const v8::Persistent<v8::Value> &persistent_value = value->persisent_value;
  v8::Handle<v8::Value> handle_value =
      v8::Handle<v8::Value>::New(isolate, persistent_value);

  if (handle_value.IsEmpty()) {
    return nullptr;
  }

  if (handle_value->IsArray()) {
    v8::Array *array = v8::Array::Cast(*handle_value);
    v8::Local<v8::Value> value = array->Get(v8context, index).ToLocalChecked();
    if (value.IsEmpty()) {
      return nullptr;
    }

    return std::make_shared<napi_value__>(isolate, value);
  }
  return nullptr;
}

// Object Helpers

bool napi_has_named_property(napi_context context,
                             napi_value value,
                             const char *utf8name) {
  HIPPY_DCHECK(context);
  if (!value || !utf8name) {
    return false;
  }
  v8::Isolate *isolate = context->isolate_;
  v8::HandleScope handle_scope(isolate);

  v8::Local<v8::Context> v8context = context->context_persistent.Get(isolate);
  v8::Context::Scope context_scope(v8context);
  const v8::Persistent<v8::Value> &persistent_value = value->persisent_value;
  v8::Handle<v8::Value> handle_value =
      v8::Handle<v8::Value>::New(isolate, persistent_value);

  if (handle_value.IsEmpty()) {
    return false;
  }

  if (handle_value->IsMap()) {
    v8::Map *map = v8::Map::Cast(*handle_value);
    v8::Local<v8::String> key =
        v8::String::NewFromUtf8(isolate, utf8name, v8::NewStringType::kNormal)
            .ToLocalChecked();
    if (key.IsEmpty()) {
      return false;
    }

    v8::Maybe<bool> ret = map->Has(v8context, key);
    return ret.ToChecked();
  }
  return false;
}

napi_value napi_copy_named_property(napi_context context,
                                    napi_value value,
                                    const char *utf8name) {
  HIPPY_DCHECK(context);
  if (!value || !utf8name) {
    return nullptr;
  }
  v8::Isolate *isolate = context->isolate_;
  v8::HandleScope handle_scope(isolate);

  v8::Local<v8::Context> v8context = context->context_persistent.Get(isolate);
  v8::Context::Scope context_scope(v8context);
  const v8::Persistent<v8::Value> &persistent_value = value->persisent_value;
  v8::Handle<v8::Value> handle_value =
      v8::Handle<v8::Value>::New(isolate, persistent_value);

  if (handle_value.IsEmpty()) {
    return nullptr;
  }

  if (handle_value->IsMap()) {
    v8::Map *map = v8::Map::Cast(*handle_value);
    if (map == nullptr) {
      return nullptr;
    }

    v8::Local<v8::String> key =
        v8::String::NewFromUtf8(isolate, utf8name, v8::NewStringType::kNormal)
            .ToLocalChecked();
    if (key.IsEmpty()) {
      return nullptr;
    }

    return std::make_shared<napi_value__>(
        isolate, map->Get(v8context, key).ToLocalChecked());
  }

  return nullptr;
}

// Function Helpers

bool napi_is_function(napi_context context, napi_value value) {
  HIPPY_DCHECK(context);
  if (!context || !value) {
    return false;
  }
  v8::Isolate *isolate = context->isolate_;
  v8::HandleScope handle_scope(isolate);

  v8::Local<v8::Context> v8context = context->context_persistent.Get(isolate);
  v8::Context::Scope context_scope(v8context);
  const v8::Persistent<v8::Value> &persistent_value = value->persisent_value;
  v8::Handle<v8::Value> handle_value =
      v8::Handle<v8::Value>::New(isolate, persistent_value);

  if (handle_value.IsEmpty()) {
    return false;
  }

  return handle_value->IsFunction();
}

std::string napi_copy_function_name(napi_context context, napi_value function) {
  HIPPY_DCHECK(context);
  if (!context || !function) {
    return nullptr;
  }
  v8::Isolate *isolate = context->isolate_;
  v8::HandleScope handle_scope(isolate);

  const v8::Persistent<v8::Value> &persistent_value = function->persisent_value;
  v8::Handle<v8::Context> ctx = context->context_persistent.Get(isolate);
  v8::Context::Scope context_scope(ctx);
  v8::Handle<v8::Value> value =
      v8::Handle<v8::Value>::New(isolate, persistent_value);

  if (value.IsEmpty()) {
    return nullptr;
  }

  if (value->IsFunction()) {
    v8::String::Utf8Value functionName(isolate, value);
    std::string jsString(*functionName);

    return jsString;
  }

  return strdup("function param is not a function");
}

napi_value napi_call_function(napi_context context,
                              napi_value function,
                              size_t argument_count,
                              const napi_value argumets[]) {
  HIPPY_DCHECK(context);

  if (!function) {
    return nullptr;
  }

  //HIPPY_LOG(hippy::Debug, "napi_call_function start");

  v8::Isolate *isolate = context->isolate_;
  v8::HandleScope handleScope(isolate);

  v8::Local<v8::Context> v8Context = context->context_persistent.Get(isolate);
  v8::Context::Scope contextScope(v8Context);
  if (v8Context.IsEmpty() || v8Context->Global().IsEmpty()) {
    return nullptr;
  }

  // v8::TryCatch tryCatch(isolate);

  const v8::Persistent<v8::Value> &persistent_value = function->persisent_value;
  v8::Handle<v8::Value> handle_value =
      v8::Handle<v8::Value>::New(isolate, persistent_value);
  if (!handle_value->IsFunction()) {
    return nullptr;
  }

  v8::Function *v8Func = v8::Function::Cast(*handle_value);
  if (v8Func == nullptr) {
    return nullptr;
  }

  std::vector<v8::Handle<v8::Value>> args(argument_count);
  for (size_t i = 0; i < argument_count; i++) {
    const v8::Persistent<v8::Value> &value = argumets[i]->persisent_value;
    args[i] = v8::Handle<v8::Value>::New(isolate, value);
  }
  v8::MaybeLocal<v8::Value> maybeResult =
      v8Func->Call(v8Context, v8Context->Global(),
                   static_cast<int>(argument_count), args.data());

  if (!maybeResult.IsEmpty()) {
    v8::Local<v8::Value> result = maybeResult.ToLocalChecked();
    if (!result.IsEmpty()) {
      return std::make_shared<napi_value__>(isolate, result);
    }
  }

  // v8::Local<v8::String> errorString = tryCatch.Message()->Get();
  // v8::String::Utf8Value utf8Value(isolate, errorString);

  // HIPPY_LOG(hippy::Debug, "function call error %s", *utf8Value);

  //HIPPY_LOG(hippy::Debug, "napi_call_function end");

  return nullptr;
}

}  // namespace napi
}  // namespace hippy
