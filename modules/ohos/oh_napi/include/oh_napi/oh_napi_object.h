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
#include "oh_napi/ark_ts.h"

class OhNapiObject {
 public:
  OhNapiObject(ArkTS arkTs, napi_value object);

  template <size_t args_count>
  napi_value Call(std::string const &key, std::array<napi_value, args_count> args) {
    return arkTs_.Call(this->GetProperty(key), args, object_);
  }

  napi_value Call(std::string const &key, std::vector<napi_value> args) {
    return arkTs_.Call(this->GetProperty(key), args, object_);
  }

  napi_value Call(std::string const &key, const napi_value *args, int argsCount) {
    return arkTs_.Call(this->GetProperty(key), args, argsCount, object_);
  }

  napi_value GetProperty(std::string const &key);

  napi_value GetProperty(napi_value key);

  std::vector<std::pair<napi_value, napi_value>> GetKeyValuePairs();
    
  std::vector<std::pair<napi_value, napi_value>> GetObjectPrototypeProperties();
    
  bool isNull();

 private:
  ArkTS arkTs_;
  napi_value object_;
};
