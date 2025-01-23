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

#include <array>
#include <vector>
#include <string>
#include "oh_napi/ark_ts.h"

class OhNapiObjectBuilder {
 public:
  OhNapiObjectBuilder(napi_env env, ArkTS arkTs);

  OhNapiObjectBuilder(napi_env env, ArkTS arkTs, napi_value object);

  OhNapiObjectBuilder &AddProperty(const char *name, napi_value value);

  OhNapiObjectBuilder &AddProperty(const char *name, bool value);

  OhNapiObjectBuilder &AddProperty(const char *name, int value);
  
  OhNapiObjectBuilder &AddProperty(const char *name, uint32_t value);
  
  OhNapiObjectBuilder &AddProperty(const char *name, float value);

  OhNapiObjectBuilder &AddProperty(const char *name, char const *value);

  OhNapiObjectBuilder &AddProperty(const char *name, std::string value);

  OhNapiObjectBuilder &AddProperty(const char *name, std::array<float, 16> matrix);

  napi_value Build();

 private:
  ArkTS arkTs_;
  napi_env env_;
  napi_value object_;
};
