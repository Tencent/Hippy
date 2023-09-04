/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

#include "driver/base/js_convert_utils.h"

#include "footstone/logging.h"
#include "footstone/string_view.h"
#include "footstone/string_view_utils.h"

#ifdef JS_V8
#include "driver/napi/v8/v8_ctx.h"
#include "driver/napi/v8/v8_ctx_value.h"
#include "driver/vm/v8/serializer.h"
#endif

#ifdef JS_JSC
#include "driver/napi/jsc/jsc_ctx.h"
#include "driver/napi/jsc/jsc_ctx_value.h"
#endif

namespace hippy {
inline namespace driver {
inline namespace base {

using HippyValue = footstone::HippyValue;
using string_view = footstone::string_view;
using StringViewUtils = footstone::StringViewUtils;
using JSValueWrapper = hippy::JSValueWrapper;
using Ctx = hippy::Ctx;
using CtxValue = hippy::CtxValue;
using DomArgument = hippy::DomArgument;

static std::string IntToString(int v) {
  const int buf_len = 16;
  char buf[buf_len] = {0};
  snprintf(buf, buf_len, "%d", v);
  return buf;
}

bool IsEqualCtxValue(const std::shared_ptr<CtxValue>& value1, const std::shared_ptr<CtxValue>& value2) {
#ifdef JS_V8
  auto v1 = std::static_pointer_cast<V8CtxValue>(value1);
  auto v2 = std::static_pointer_cast<V8CtxValue>(value2);
  return v1->global_value_ == v2->global_value_;
#elif JS_JSC
  auto v1 = std::static_pointer_cast<JSCCtxValue>(value1);
  auto v2 = std::static_pointer_cast<JSCCtxValue>(value2);
  return v1->value_ == v2->value_;
#else
  FOOTSTONE_UNREACHABLE();
#endif
}

std::shared_ptr<HippyValue> ToDomValueWithCycleCheck(const std::shared_ptr<Ctx>& ctx,
                                                     const std::shared_ptr<CtxValue>& value,
                                                     std::vector<std::string>& key_stack,
                                                     std::vector<std::shared_ptr<CtxValue>>& value_stack) {
  int stack_len = static_cast<int>(value_stack.size());
  for (int i = 0; i < stack_len - 1; i++) {
    if(IsEqualCtxValue(value, value_stack[static_cast<uint32_t>(i)])) {
      std::string str = "value stack: ";
      for (int t = 0; t < stack_len; t++) {
        str.append(IntToString(t));
        str.append(":");
        str.append(key_stack[static_cast<uint32_t>(t)]);
        if (t < stack_len - 1) {
          str.append(" - ");
        }
      }
      str.append(", cycle with position: ");
      str.append(IntToString(i));
      FOOTSTONE_LOG(ERROR) << "Js value setting error, cycle is found, " << str;
      FOOTSTONE_DCHECK(false);
      return nullptr;
    }
  }

  if (ctx->IsUndefined(value)) {
    return std::make_shared<HippyValue>(HippyValue::Undefined());
  } else if (ctx->IsNull(value)) {
    return std::make_shared<HippyValue>(HippyValue::Null());
  } else if (ctx->IsBoolean(value)) {
    bool ret;
    ctx->GetValueBoolean(value, &ret);
    return std::make_shared<HippyValue>(ret);
  } else if (ctx->IsString(value)) {
    footstone::string_view ret;
    ctx->GetValueString(value, &ret);
    auto str = StringViewUtils::ToStdString(StringViewUtils::ConvertEncoding(ret, string_view::Encoding::Utf8).utf8_value());
    return std::make_shared<HippyValue>(std::move(str));
  } else if (ctx->IsNumber(value)) {
    double ret;
    ctx->GetValueNumber(value, &ret);
    return std::make_shared<HippyValue>(ret);
  } else if (ctx->IsArray(value)) {
    auto len = ctx->GetArrayLength(value);
    HippyValue::HippyValueArrayType ret;
    for (uint32_t i = 0; i < len; ++i) {
      std::string value_key = "array";
      value_key.append(IntToString(static_cast<int>(i)));
      auto value_object = ctx->CopyArrayElement(value, i);
      key_stack.push_back(value_key);
      value_stack.push_back(value_object);
      auto value_obj = ToDomValueWithCycleCheck(ctx, value_object, key_stack, value_stack);
      key_stack.pop_back();
      value_stack.pop_back();
      if (value_obj) {
        ret.push_back(*value_obj);
      }
    }
    return std::make_shared<HippyValue>(std::move(ret));
  } else if (ctx->IsObject(value)) {
    HippyValue::HippyValueObjectType ret;
    std::unordered_map<std::shared_ptr<CtxValue>, std::shared_ptr<CtxValue>> map;
    auto flag = ctx->GetEntriesFromObject(value, map);
    FOOTSTONE_CHECK(flag);
    for (const auto& [key_object, value_object]: map) {
      string_view key_string_view;
      flag = ctx->GetValueString(key_object, &key_string_view);
      if (!flag) {
        continue;
      }
      std::string key_string = StringViewUtils::ToStdString(
          StringViewUtils::ConvertEncoding(key_string_view, string_view::Encoding::Utf8).utf8_value());
      key_stack.push_back(key_string);
      value_stack.push_back(value_object);
      auto value_obj = ToDomValueWithCycleCheck(ctx, value_object, key_stack, value_stack);
      key_stack.pop_back();
      value_stack.pop_back();
      if (value_obj) {
        ret[key_string] = *value_obj;
      }
    }
    return std::make_shared<HippyValue>(std::move(ret));
  } else {
    FOOTSTONE_UNREACHABLE();
  }
}

std::shared_ptr<HippyValue> ToDomValue(const std::shared_ptr<Ctx>& ctx, const std::shared_ptr<CtxValue>& value) {
  std::vector<std::string> key_stack;
  std::vector<std::shared_ptr<CtxValue>> value_stack;
  key_stack.push_back("root");
  value_stack.push_back(value);
  return ToDomValueWithCycleCheck(ctx, value, key_stack, value_stack);
}

std::shared_ptr<DomArgument> ToDomArgument(
    const std::shared_ptr<Ctx>& ctx,
    const std::shared_ptr<CtxValue>& value) {
#ifdef JS_V8
  auto v8_ctx = std::static_pointer_cast<hippy::V8Ctx>(ctx);
  auto isolate = v8_ctx->isolate_;
  auto context = v8_ctx->context_persistent_.Get(isolate);
  auto ctx_value = std::static_pointer_cast<hippy::V8CtxValue>(value);
  const v8::Global<v8::Value>& global_value = ctx_value->global_value_;
  auto handle_value =v8::Local<v8::Value>::New(isolate, global_value);
  std::string reused_buffer;
  Serializer serializer(isolate, context, reused_buffer);
  serializer.WriteHeader();
  serializer.WriteValue(handle_value);
  std::pair<uint8_t*, size_t> pair = serializer.Release();
  return std::make_shared<DomArgument>(std::move(pair));
#else
  auto hippy_value = ToDomValue(ctx, value);
  return std::make_shared<DomArgument>(std::move(*hippy_value));
#endif
}

std::shared_ptr<CtxValue> CreateCtxValue(const std::shared_ptr<Ctx>& ctx,
                                         const std::shared_ptr<HippyValue>& value) {
  if (!value) {
    return nullptr;
  }
  if (value->IsUndefined()) {
    return ctx->CreateUndefined();
  } else if (value->IsNull()) {
    return ctx->CreateNull();
  } else if (value->IsString()) {
    const auto& str = value->ToStringChecked();
    return ctx->CreateString(string_view::new_from_utf8(str.c_str(), str.length()));
  } else if (value->IsNumber()) {
    return ctx->CreateNumber(value->ToDoubleChecked());
  } else if (value->IsBoolean()) {
    return ctx->CreateBoolean(value->ToBooleanChecked());
  } else if (value->IsArray()) {
    auto array = value->ToArrayChecked();
    auto len = array.size();
    std::shared_ptr<CtxValue> argv[len];
    for (size_t i = 0; i < len; ++i) {
      argv[i] = CreateCtxValue(ctx, std::make_shared<HippyValue>(array[i]));
    }
    return ctx->CreateArray(array.size(), argv);
  } else if (value->IsObject()) {
    auto obj = ctx->CreateObject();
    auto object = value->ToObjectChecked();
    for (const auto& p : object) {
      auto key_str = string_view::new_from_utf8(p.first.c_str(), p.first.length());
      auto prop_key = ctx->CreateString(key_str);
      auto hippy_value = p.second;
      auto prop_value = CreateCtxValue(ctx, std::make_shared<HippyValue>(hippy_value));
      ctx->SetProperty(obj, prop_key, prop_value);
    }
    return obj;
  } else {
    FOOTSTONE_UNREACHABLE();
  }
}

}
}
}
