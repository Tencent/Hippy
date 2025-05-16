/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#include "connector/worker_module_manager.h"
#include <js_native_api.h>
#include <js_native_api_types.h>
#include <node_api.h>
#include "oh_napi/oh_napi_register.h"
#include "oh_napi/ark_ts.h"
#include "footstone/check.h"
#include "footstone/logging.h"
#include "driver/js_driver_utils.h"


namespace hippy {
inline namespace framework {
inline namespace connector {
inline namespace worker {

static void CallTs(napi_env env, napi_value ts_cb, void *context, void *data) {
  if (env == nullptr || data == nullptr) {
    return;
  }
  MainThreadFnContextData *contextData = static_cast<MainThreadFnContextData*>(data);
  
  ArkTS arkTs(env);
  std::vector<napi_value> args = {
    arkTs.CreateString(contextData->worker_name_),
  };
  arkTs.Call(ts_cb, args, nullptr);
  
  DestroyMainThreadFnContext(contextData);
}

static napi_value InitWModuleManager(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info);
  auto ts_cb = args[0];

  // 使用回调ts的函数创建一个线程安全函数
  napi_threadsafe_function func = nullptr;
  napi_value resource_name = arkTs.CreateString("Thread-safe Function notifyMain");
  auto status = napi_create_threadsafe_function(env, ts_cb, nullptr, resource_name, 0, 1, nullptr, nullptr,
    nullptr, CallTs, &func);
  if (status != napi_ok) {
    FOOTSTONE_LOG(ERROR) << "ArkTS: Failed to create thread safe func notifyMain, status: " << status;
    return arkTs.GetUndefined();
  }
  
  WorkerModuleManager::GetInstance()->RecordMainThreadTsEnvInfo(env, func);
  
  return arkTs.GetUndefined();
}

REGISTER_OH_NAPI("WorkerManager", "WorkerManager_InitWModuleManager", InitWModuleManager)

}
}
}
}
