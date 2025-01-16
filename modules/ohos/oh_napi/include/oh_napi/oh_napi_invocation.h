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
#include <functional>
#include <vector>

namespace hippy {
inline namespace framework {
inline namespace ohnapi {

class OhNapiInvocation {
 public:
  using OhNapiOnloadFunc = std::function<napi_value(napi_env env, napi_value exports)>;

  OhNapiInvocation() = default;

  static std::shared_ptr<OhNapiInvocation> GetInstance();

  inline void PushOhNapiOnLoad(OhNapiOnloadFunc f) {
    oh_napi_onloads_.emplace_back(f);
  }

  napi_value OhNapi_OnLoad(napi_env env, napi_value exports);

 private:
  std::vector<OhNapiOnloadFunc> oh_napi_onloads_;
};

}
}
}

#define REGISTER_OH_NAPI_ONLOAD(FUNC_NAME)                                                  \
  auto onload = []() {                                                                      \
    OhNapiInvocation::GetInstance()->PushOhNapiOnLoad(FUNC_NAME);                           \
    return 0;                                                                               \
  }();
