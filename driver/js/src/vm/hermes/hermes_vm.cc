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

#include "driver/vm/hermes/hermes_vm.h"

#include "driver/napi/hermes/hermes_ctx.h"
#include "driver/napi/hermes/hermes_ctx_value.h"
#include "footstone/string_view_utils.h"

using string_view = footstone::string_view;
using StringViewUtils = footstone::StringViewUtils;
using Ctx = hippy::napi::Ctx;
using HermesCtx = hippy::napi::HermesCtx;

namespace hippy {
inline namespace driver {
inline namespace vm {

HermesVM::HermesVM(const std::shared_ptr<HermesVMInitParam>& param) : VM(param) {
  FOOTSTONE_DLOG(INFO) << "HermesVM begin";
  FOOTSTONE_DLOG(INFO) << "HermesVM end";
}

std::shared_ptr<CtxValue> HermesVM::ParseJson(const std::shared_ptr<Ctx>& ctx, const string_view& json) {
  if (footstone::StringViewUtils::IsEmpty(json)) {
    return nullptr;
  }
  auto hermes_ctx = std::static_pointer_cast<HermesCtx>(ctx);
  auto& runtime = hermes_ctx->GetRuntime();
  auto utf8_json = StringViewUtils::CovertToUtf8(json, json.encoding());
  facebook::jsi::Value json_value =
      facebook::jsi::Value::createFromJsonUtf8(*runtime, utf8_json.utf8_value().c_str(), utf8_json.utf8_value().size());
  //  return std::make_shared<HermesCtxValue>(std::move(json_value));
  return std::make_shared<HermesCtxValue>(*runtime, json_value);
}

static bool JsiValueToHippyValue(Runtime& runtime, const Value& value, HippyValue& hippy_value) {
  if (value.isUndefined()) {
    hippy_value = HippyValue::Undefined();
  } else if (value.isNull()) {
    hippy_value = HippyValue::Null();
  } else if (value.isString()) {
    auto str = value.asString(runtime).utf8(runtime);
    hippy_value = HippyValue(str);
  } else if (value.isNumber()) {
    auto d = value.asNumber();
    hippy_value = HippyValue(d);
  } else if (value.isBool()) {
    auto b = value.asBool();
    hippy_value = HippyValue(b);
  } else if (value.isObject()) {
    auto object = value.asObject(runtime);
    if (object.isArray(runtime)) {
      auto jsi_array = object.asArray(runtime);
      HippyValue::HippyValueArrayType hippy_array;
      for (size_t i = 0; i < jsi_array.size(runtime); i++) {
        HippyValue val;
        auto ret = JsiValueToHippyValue(runtime, jsi_array.getValueAtIndex(runtime, i), val);
        if (!ret) return false;
        hippy_array[i] = val;
      }
      hippy_value = HippyValue(std::move(hippy_array));
    } else {
      auto jsi_keys = object.getPropertyNames(runtime);
      HippyValue::HippyValueObjectType hippy_object;
      for (size_t i = 0; i < jsi_keys.size(runtime); i++) {
        auto jsi_key = jsi_keys.getValueAtIndex(runtime, i);
        if (!jsi_key.isString()) return false;
        std::string key = jsi_key.asString(runtime).utf8(runtime);
        Value jsi_value = object.getProperty(runtime, key.data());
        HippyValue val;
        auto ret = JsiValueToHippyValue(runtime, jsi_value, val);
        if (!ret) return false;
        hippy_object.insert({key, val});
      }
      hippy_value = HippyValue(std::move(hippy_object));
    }
  }
  return true;
}

bool HermesVM::ParseHippyValue(const std::shared_ptr<Ctx>& ctx, const string_view& json, HippyValue& hippy_value) {
  if (footstone::StringViewUtils::IsEmpty(json)) {
    hippy_value = HippyValue::Null();
    return true;
  }
  auto hermes_ctx = std::static_pointer_cast<HermesCtx>(ctx);
  auto& runtime = hermes_ctx->GetRuntime();
  auto utf8_json = StringViewUtils::CovertToUtf8(json, json.encoding());
  facebook::jsi::Value value =
      facebook::jsi::Value::createFromJsonUtf8(*runtime, utf8_json.utf8_value().c_str(), utf8_json.utf8_value().size());
  return JsiValueToHippyValue(*runtime, value, hippy_value);
}

std::shared_ptr<Ctx> HermesVM::CreateContext() { return std::make_shared<HermesCtx>(); }

std::shared_ptr<VM> CreateVM(const std::shared_ptr<VM::VMInitParam>& param) {
  return std::make_shared<HermesVM>(std::static_pointer_cast<HermesVMInitParam>(param));
}

}  // namespace vm
}  // namespace driver
}  // namespace hippy
