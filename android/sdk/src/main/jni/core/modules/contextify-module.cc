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

#include "core/modules/contextify-module.h"

#include <string.h>
#include <memory>
#include <string>

#include "core/base/logging.h"
#include "core/modules/module-register.h"
#include "core/napi/callback-info.h"
#include "core/napi/js-native-api.h"
#include "core/napi/native-source-code.h"

REGISTER_MODULE(ContextifyModule, RunInThisContext)

namespace napi = ::hippy::napi;

void ContextifyModule::RunInThisContext(const napi::CallbackInfo& info) {
  std::shared_ptr<Environment> env = info.GetEnv();
  napi::napi_context context = env->getContext();
  HIPPY_CHECK(context);

  std::string key;
  if (!napi::napi_get_value_string(context, info[0], &key)) {
    info.GetExceptionValue()->Set(
        context, "The first argument must be non-empty string.");
    return;
  }

  //HIPPY_LOG(hippy::Debug, "RunInThisContext key = %s", key.c_str());

  auto source_code = hippy::GetNativeSourceCode(key.c_str());
  napi::napi_value ret = napi::napi_evaluate_javascript(
      context, source_code.data, source_code.length, key.c_str());
  info.GetReturnValue()->Set(ret);
}
