//
// Created on 2024/7/10.
//
// Node APIs are not fully supported. To solve the compilation error of the interface cannot be found,
// please include "napi/native_api.h".

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

#include "driver/napi/js_ctx_value.h"
#include "driver/napi/js_ctx.h"
#include "oh_napi/ark_ts.h"

using CtxValue = hippy::napi::CtxValue;
using Ctx = hippy::napi::Ctx;

namespace hippy {
inline namespace framework {
inline namespace turbo {

class TurboUtils {
public:
  static std::shared_ptr<CtxValue> NapiValue2CtxValue(
    napi_env env, 
    napi_value value,
    const std::shared_ptr<Ctx>& ctx);
  static napi_value CtxValue2NapiValue(
    napi_env env, 
    const std::shared_ptr<Ctx>& ctx,
    const std::shared_ptr<CtxValue>& value);
  static bool isTurboObject(
    napi_env env, 
    napi_value value);
};

}
}
}
