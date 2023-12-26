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

#include <string>
#include <unordered_map>
#include <vector>

namespace hippy {
inline namespace framework {
inline namespace ohnapi {

class OhNapiRegisterData {
 public:
  OhNapiRegisterData(const char *name, void *pointer);

  std::string name_;
  void *pointer_;
};

class OhNapiRegister {
 public:
  static std::shared_ptr<OhNapiRegister> GetInstance();

  OhNapiRegister() = default;
  OhNapiRegister(const OhNapiRegister &) = delete;
  OhNapiRegister &operator = (const OhNapiRegister &) = delete;

  bool RegisterOhNapiModule(const char *module, const char *name, void *pointer) {
    auto it = oh_napi_modules_.find(module);
    if (it != oh_napi_modules_.end()) {
      oh_napi_modules_[module].push_back({name, pointer});
    } else {
      oh_napi_modules_[module] = {{name, pointer}};
    }
    return true;
  }

  const std::unordered_map<std::string, std::vector<OhNapiRegisterData>> &GetOhNapiModules() {
    return oh_napi_modules_;
  }

 private:
  std::unordered_map<std::string, std::vector<OhNapiRegisterData>> oh_napi_modules_;
};

}
}
}

#define REGISTER_OH_NAPI_INTERNAL(clazz, name, pointer, key)        \
  auto __REGISTER_OH_NAPI_##key = []() {                            \
    hippy::OhNapiRegister::GetInstance()->RegisterOhNapiModule(     \
        clazz, name, reinterpret_cast<void *>(pointer));            \
    return 0;                                                       \
  }();

#define REGISTER_OH_NAPI_TEMP(clazz, name, pointer, key) \
  REGISTER_OH_NAPI_INTERNAL(clazz, name, pointer, pointer##key)

#define REGISTER_OH_NAPI(clazz, name, pointer) \
  REGISTER_OH_NAPI_TEMP(clazz, name, pointer, __COUNTER__)
