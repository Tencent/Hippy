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
#include "oh_napi/oh_napi_utils.h"
#include "oh_napi/oh_napi_object.h"
#include "oh_napi/oh_napi_object_builder.h"

using HippyValueObjectType = HippyValue::HippyValueObjectType;

HippyValue OhNapiUtils::NapiValue2HippyValue(napi_env env, napi_value value) {
  ArkTS arkTs(env);
  auto type = arkTs.GetType(value);
  
  switch (type) {
    case napi_undefined: {
      return HippyValue::Undefined();
    }
    case napi_null: {
      return HippyValue::Null();
    }
    case napi_boolean: {
      bool result = arkTs.GetBoolean(value);
      return HippyValue(result);
    }
    case napi_number: {
      double result = arkTs.GetDouble(value);
      return HippyValue(result);
    }
    case napi_string: {
      std::string result = arkTs.GetString(value);
      return HippyValue(result);
    }
    case napi_symbol: {
      return HippyValue::Undefined();
    }
    case napi_object: {
      HippyValueObjectType map;
      OhNapiObject napiObj = arkTs.GetObject(value);
      std::vector<std::pair<napi_value, napi_value>> pairs = napiObj.GetKeyValuePairs();
      for (auto it = pairs.begin(); it != pairs.end(); it++) {
        auto &pair = *it;
        auto &pairItem1 = pair.first;
        auto objKey = arkTs.GetString(pairItem1);
        if (objKey.length() > 0) {
          auto &pairItem2 = pair.second;
          auto objValue = NapiValue2HippyValue(env, pairItem2);
          map[objKey] = objValue;
        }
      }
      return HippyValue(map);
    }
    case napi_function: {
      return HippyValue::Undefined();
    }
    case napi_external: {
      return HippyValue::Undefined();
    }
    case napi_bigint: {
      int64_t result = arkTs.GetInt64(value);
      return HippyValue(static_cast<int32_t>(result));
    }
    default:
      break;
  }
  return HippyValue::Undefined();
}

napi_value OhNapiUtils::HippyValue2NapiValue(napi_env env, const HippyValue &value) {
  ArkTS arkTs(env);
  if (value.IsNumber()) {
    double v = value.ToDoubleChecked();
    return arkTs.CreateDouble(v);
  } else if (value.IsBoolean()) {
    bool v = value.ToBooleanChecked();
    return arkTs.CreateBoolean(v);
  } else if (value.IsString()) {
    std::string v = value.ToStringChecked();
    return arkTs.CreateString(v);
  } else if (value.IsObject()) {
    auto obj = value.ToObjectChecked();
    auto builder = arkTs.CreateObjectBuilder();
    for (auto it : obj) {
      auto &objKey = it.first;
      auto &objValue = it.second;
      auto objNapiValue = HippyValue2NapiValue(env, objValue);
      builder.AddProperty(objKey.c_str(), objNapiValue);
    }
    return builder.Build();
  } else if (value.IsArray()) {
    auto array = value.ToArrayChecked();
    std::vector<napi_value> arrayNapiValues;
    for (auto it = array.begin(); it != array.end(); it++) {
      arrayNapiValues.push_back(HippyValue2NapiValue(env, *it));
    }
    return arkTs.CreateArray(arrayNapiValues);
  }
  return arkTs.GetUndefined();
}
