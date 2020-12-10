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

#ifndef CORE_MODULES_CONTEXTIFY_MODULE_H_
#define CORE_MODULES_CONTEXTIFY_MODULE_H_

#include "core/modules/module-base.h"
#include "core/napi/callback-info.h"
#include "core/napi/js-native-api-types.h"

class ContextifyModule : public ModuleBase {
 public:
  explicit ContextifyModule(hippy::napi::napi_context context) {}
  void RunInThisContext(const hippy::napi::CallbackInfo& info);
};

#endif  // CORE_MODULES_CONTEXTIFY_MODULE_H_
