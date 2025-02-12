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
#include "connector/arkts_turbo_module.h"
#include "connector/turbo.utils.h"
#include "oh_napi/oh_napi_utils.h"
#include "oh_napi/oh_napi_object.h"
#include "oh_napi/oh_napi_object_builder.h"
#include "driver/napi/js_ctx_value.h"
#include "driver/napi/js_ctx.h"
#include "footstone/string_view.h"
#include "footstone/string_view_utils.h"

using CtxValue = hippy::napi::CtxValue;
using Ctx = hippy::napi::Ctx;
using string_view = footstone::string_view;
using StringViewUtils = footstone::StringViewUtils;

namespace hippy {
inline namespace framework {
inline namespace turbo {

constexpr char kTurboPropertyName[] = "isTurbo";

bool TurboUtils::isTurboObject(
    napi_env env, 
    napi_value value) {
   ArkTS arkTs(env);
   auto turboObject = arkTs.GetObject(value);
   if (turboObject.isNull()) {
      FOOTSTONE_DLOG(ERROR) << "isTurboObject object is null";  
      return false; 
   }
   std::vector<std::pair<napi_value, napi_value>> pairs = turboObject.GetObjectPrototypeProperties();
   for (auto it = pairs.begin(); it != pairs.end(); it++) {
      auto &pair = *it;
      auto &pairItem1 = pair.first;
      auto key = arkTs.GetString(pairItem1);
      if (key == kTurboPropertyName) {
         napi_valuetype valueType;
         napi_typeof(env, pair.second, &valueType);
         if (valueType == napi_boolean) {
             bool result;
             napi_get_value_bool(env, pair.second, &result);
             return result;
         }
         return false;
      }
   }
    return false;
}

std::shared_ptr<CtxValue> TurboUtils::NapiValue2CtxValue(
  napi_env env,
  napi_value value,
  const std::shared_ptr<Ctx>& ctx) {
  ArkTS arkTs(env);
  auto type = arkTs.GetType(value);
  
  switch (type) {
    case napi_undefined: {
      return ctx->CreateUndefined();
    }
    case napi_null: {
      return ctx->CreateNull();
    }
    case napi_boolean: {
      bool result = arkTs.GetBoolean(value);
      return ctx->CreateBoolean(result);
    }
    case napi_number: {
      double result = arkTs.GetDouble(value);
      return ctx->CreateNumber(result);
    }
    case napi_string: {
      std::string result = arkTs.GetString(value);
      return ctx->CreateString(string_view::new_from_utf8(result.c_str(), result.length()));
    }
    case napi_symbol: {
      return ctx->CreateUndefined();
    }
    case napi_object: {
      if (arkTs.IsArray(value)) {
           auto length = arkTs.GetArrayLength(value);
           std::shared_ptr<CtxValue> array[length];
           if (length > 0) {
              for (uint32_t i = 0; i < length; i ++) {
                    auto item = arkTs.GetArrayElement(value, i);
                    auto objValue = NapiValue2CtxValue(env, item, ctx);
                    array[i] = objValue;
              }
           }
           return ctx->CreateArray(length, array);
      }
      std::unordered_map<std::shared_ptr<CtxValue>, std::shared_ptr<CtxValue>> map;
      OhNapiObject napiObj = arkTs.GetObject(value);
      std::vector<std::pair<napi_value, napi_value>> pairs = napiObj.GetKeyValuePairs();
      for (auto it = pairs.begin(); it != pairs.end(); it++) {
        auto &pair = *it;
        auto &pairItem1 = pair.first;
        auto objKey = arkTs.GetString(pairItem1);
        if (objKey.length() > 0) {
          auto &pairItem2 = pair.second;
          auto key = ctx->CreateString(string_view::new_from_utf8(objKey.c_str(), objKey.length()));
          auto objValue = NapiValue2CtxValue(env, pairItem2, ctx);
          map[key] = objValue;
        }
      }
      return ctx->CreateObject(map);
    }
    case napi_function: {
      return ctx->CreateUndefined();
    }
    case napi_external: {
      return ctx->CreateUndefined();
    }
    case napi_bigint: {
      int64_t result = arkTs.GetInt64(value);
      return ctx->CreateNumber(static_cast<int32_t>(result));
    }
    default:
      break;
  }
  return ctx->CreateUndefined();
}

napi_value TurboUtils::CtxValue2NapiValue(
    napi_env env, 
    const std::shared_ptr<Ctx>& ctx,
    const std::shared_ptr<CtxValue>& value) {
  ArkTS arkTs(env);
  if (ctx->IsNumber(value)) {
    double num;
    ctx->GetValueNumber(value, &num);
    return arkTs.CreateDouble(num);
  } else if (ctx->IsBoolean(value)) {
    bool v;
    ctx->GetValueBoolean(value, &v);   
    return arkTs.CreateBoolean(v);
  } else if (ctx->IsString(value)) {
    string_view str_view;
    ctx->GetValueString(value, &str_view);   
    std::string str = StringViewUtils::ToStdString(
        StringViewUtils::ConvertEncoding(str_view, string_view::Encoding::Utf8).utf8_value());
    return arkTs.CreateString(str);
  } else if (ctx->IsMap(value)) {
    std::unordered_map<std::shared_ptr<CtxValue>, std::shared_ptr<CtxValue>> map;
    auto flag = ctx->GetEntriesFromMap(value, map);
    FOOTSTONE_CHECK(flag);
    auto builder = arkTs.CreateObjectBuilder();
    for (const auto& [key_object, value_object]: map) {
      string_view key_string_view;
      flag = ctx->GetValueString(key_object, &key_string_view);
      if (!flag) {
        continue;
      }
      std::string key_string = StringViewUtils::ToStdString(
          StringViewUtils::ConvertEncoding(key_string_view, string_view::Encoding::Utf8).utf8_value());
      auto objNapiValue = CtxValue2NapiValue(env, ctx, value_object);
      builder.AddProperty(key_string.c_str(), objNapiValue);
    }   
    return builder.Build();
  } else if (ctx -> IsArray(value)) {
     uint32_t array_len = ctx->GetArrayLength(value);
     std::vector<napi_value> argv;
     for (uint32_t i = 0; i < array_len; i++) {
        std::shared_ptr<CtxValue> item = ctx->CopyArrayElement(value, i);
        argv.push_back(CtxValue2NapiValue(env, ctx, item));
     }   
     return arkTs.CreateArray(argv);
  } else if (ctx->IsObject(value)) {
    auto host_object = reinterpret_cast<ArkTsTurboModule*>(ctx->GetObjectExternalData(value));
    if (host_object) {
        auto object_ref = host_object->impl->GetRef();
        auto object = arkTs.GetReferenceValue(object_ref);
        return object;
    }   
    std::unordered_map<std::shared_ptr<CtxValue>, std::shared_ptr<CtxValue>> map;
    auto flag = ctx->GetEntriesFromObject(value, map);
    FOOTSTONE_CHECK(flag);
    auto builder = arkTs.CreateObjectBuilder();
    for (const auto& [key_object, value_object]: map) {
      string_view key_string_view;
      flag = ctx->GetValueString(key_object, &key_string_view);
      if (!flag) {
        continue;
      }
      std::string key_string = StringViewUtils::ToStdString(
          StringViewUtils::ConvertEncoding(key_string_view, string_view::Encoding::Utf8).utf8_value());
      auto objNapiValue = CtxValue2NapiValue(env, ctx, value_object);
      builder.AddProperty(key_string.c_str(), objNapiValue);
    }
    return builder.Build();
  } else if (ctx->IsArray(value)) {
    auto array_len = ctx->GetArrayLength(value);
    std::vector<napi_value> arrayNapiValues;
    for (uint32_t it = 0; it != array_len; it++) {
      std::shared_ptr<CtxValue> item = ctx->CopyArrayElement(value, it);
      arrayNapiValues.push_back(CtxValue2NapiValue(env, ctx, item));
    }
    return arkTs.CreateArray(arrayNapiValues);
  }
  return arkTs.GetUndefined();
}

}
}
}
