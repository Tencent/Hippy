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

#include "connector/arkts_turbo_module.h"
#include "connector/exception_handler.h"
#include "connector/turbo_module_manager.h"
#include <js_native_api.h>
#include <js_native_api_types.h>
#include "connector/turbo.h"
#include "driver/scope.h"
#include "oh_napi/data_holder.h"
#include "oh_napi/oh_napi_invocation.h"
#include "oh_napi/oh_napi_register.h"
#include "oh_napi/ark_ts.h"
#include "oh_napi/oh_napi_object.h"
#include "oh_napi/oh_napi_register.h"

#include "oh_napi/oh_napi_task_runner.h"


#include <cstdint>

#include "footstone/logging.h"
#include "footstone/string_view.h"
#include "footstone/string_view_utils.h"


using namespace hippy::napi;
using string_view = footstone::string_view;
using StringViewUtils = footstone::StringViewUtils;

constexpr char kTurboKey[] = "getTurboModule";

namespace hippy {
inline namespace framework {
inline namespace turbo {

static napi_env s_env = 0;

void InitTurbo(napi_env env) {
  s_env = env;
}

void GetTurboModule(CallbackInfo& info, void* data) {
  FOOTSTONE_DLOG(INFO) << "[turbo-perf] enter getTurboModule";
  auto scope_wrapper = reinterpret_cast<ScopeWrapper*>(std::any_cast<void*>(info.GetSlot()));
  auto scope = scope_wrapper->scope.lock();
  FOOTSTONE_CHECK(scope);
  auto ctx = scope->GetContext();

  if (!info[0] || !ctx->IsString(info[0])) {
    FOOTSTONE_LOG(ERROR) << "cannot find TurboModule as param is invalid";
    info.GetReturnValue()->SetUndefined();
  }

  string_view name;
  ctx->GetValueString(info[0], &name);
  auto turbo_manager = std::any_cast<std::shared_ptr<Turbo>>(scope->GetTurbo());
  if (!turbo_manager) {
    FOOTSTONE_LOG(ERROR) << "turbo_manager error";
    info.GetReturnValue()->SetUndefined();
    return;
  }
  auto u8_name = StringViewUtils::ToStdString(StringViewUtils::ConvertEncoding(name, string_view::Encoding::Utf8).utf8_value());
  std::shared_ptr<CtxValue> result;
//   close cache temporary， need find a solution on JSVM     
//   auto has_instance = scope->HasTurboInstance(u8_name);
//   if (!has_instance) {
    // 2. if not cached, query from ArkTs
    auto env = s_env;
    std::shared_ptr<Turbo> module_object;
    OhNapiTaskRunner *taskRunner = OhNapiTaskRunner::Instance(env);
    taskRunner->RunSyncTask([env, scope, u8_name, name, ctx, &module_object]() {
        auto turbo = std::any_cast<std::shared_ptr<Turbo>>(scope->GetTurbo());
        ArkTS arkTs(env);
        napi_ref object_ref = turbo->GetRef();
        auto turboManager = arkTs.GetObject(object_ref);
        std::vector<napi_value> args = {
            arkTs.CreateString(u8_name),
        };
        auto module = turboManager.Call("get", args);
        auto module_object_ref = arkTs.CreateReference(module);
        module_object = std::make_shared<Turbo>(module_object_ref);
    });
  // 3. constructor c++ JavaTurboModule - on js thread
  auto arkTs_turbo_module = std::make_shared<ArkTsTurboModule>(u8_name, module_object, ctx, env);
    
  // 4. bind c++ JavaTurboModule to js
  result = ctx->NewInstance(arkTs_turbo_module->constructor, 0, nullptr, arkTs_turbo_module.get());

  // 5. add To Cache
  scope->SetTurboInstance(u8_name, result);
  scope->SetTurboHostObject(u8_name, arkTs_turbo_module);

  FOOTSTONE_DLOG(INFO) << "return module = " << name;
  info.GetReturnValue()->Set(result);
  //   } else {
  //     result = scope->GetTurboInstance(u8_name);
  //     info.GetReturnValue()->Set(result);
  //     FOOTSTONE_DLOG(INFO) << "return cached module = " << name;
  //   }
  FOOTSTONE_DLOG(INFO) << "[turbo-perf] exit getTurboModule";
}

void TurboModuleManager::Destroy(napi_env env, napi_callback_info info) {

}

int Install(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info);
  auto object_ref = arkTs.CreateReference(args[0]);
  uint32_t ori_scope_id = static_cast<uint32_t>(arkTs.GetInteger(args[1]));
  FOOTSTONE_LOG(INFO) << "install TurboModuleManager";
  std::any scope_object;
  auto scope_id = footstone::checked_numeric_cast<long, uint32_t>(ori_scope_id);
  auto flag = hippy::global_data_holder.Find(scope_id, scope_object);
  FOOTSTONE_CHECK(flag);
  auto scope = std::any_cast<std::shared_ptr<Scope>>(scope_object);
  auto turbo = std::make_shared<Turbo>(object_ref);
  scope->SetTurbo(turbo);
  InitTurbo(env);

  auto runner = scope->GetTaskRunner();
  if (!runner) {
    FOOTSTONE_LOG(WARNING) << "TurboModuleManager install, runner invalid";
    return -1;
  }

  std::weak_ptr<Scope> weak_scope = scope;
  auto callback = [weak_scope, scope_id] {
    auto scope = weak_scope.lock();
    if (!scope) {
      return;
    }
    auto context = scope->GetContext();
    auto wrapper = std::make_unique<FunctionWrapper>(GetTurboModule, reinterpret_cast<void*>(scope_id));
    auto func = context->CreateFunction(wrapper);
    scope->SaveFunctionWrapper(std::move(wrapper));
    auto global_object = context->GetGlobalObject();
    auto key = context->CreateString(kTurboKey);
    context->SetProperty(global_object, key, func);
  };
  runner->PostTask(std::move(callback));
  return 0;
}

REGISTER_OH_NAPI("TurboModuleManager", "TurboModuleManager_Install", Install)
}
}
}
