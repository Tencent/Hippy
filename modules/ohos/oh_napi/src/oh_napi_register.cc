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

#include "oh_napi/oh_napi_register.h"
#include "oh_napi/oh_napi_invocation.h"
#include "oh_napi/ark_ts.h"
#include "footstone/check.h"
#include "footstone/logging.h"

namespace hippy {
inline namespace framework {
inline namespace ohnapi {

OhNapiRegisterData::OhNapiRegisterData(const char *name, void *pointer)
    : name_(name), pointer_(pointer) {}

std::shared_ptr<OhNapiRegister> OhNapiRegister::GetInstance() {
  static std::shared_ptr<OhNapiRegister> instance = nullptr;
  static std::once_flag flag;
  std::call_once(flag, [] {
    instance = std::make_shared<OhNapiRegister>();
  });
  return instance;
}

napi_value OhNapi_OnLoad(napi_env env, napi_value exports) {
  std::vector<napi_property_descriptor> descs;
  const auto& napi_modules = OhNapiRegister::GetInstance()->GetOhNapiModules();
  for (const auto &napi_module : napi_modules) {
    const std::vector<OhNapiRegisterData> &napi_register_datas = napi_module.second;
    for (auto &data : napi_register_datas) {
      napi_property_descriptor desc = {
        data.name_.c_str(), nullptr, reinterpret_cast<napi_callback>(data.pointer_),
        nullptr, nullptr, nullptr, napi_default, nullptr
      };
      descs.push_back(desc);
    }
  }
  napi_define_properties(env, exports, descs.size(), descs.data());
  return exports;
}

REGISTER_OH_NAPI_ONLOAD(hippy::OhNapi_OnLoad)

}
}
}
