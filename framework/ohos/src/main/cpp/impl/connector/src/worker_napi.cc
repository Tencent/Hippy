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

#include "connector/worker_napi.h"
#include "connector/worker_module_manager.h"
#include <set>
#include <js_native_api.h>
#include <js_native_api_types.h>
#include <node_api.h>
#include "oh_napi/data_holder.h"
#include "oh_napi/oh_napi_register.h"
#include "oh_napi/ark_ts.h"
#include "footstone/check.h"
#include "footstone/logging.h"
#include "driver/js_driver_utils.h"

using string_view = footstone::stringview::string_view;
using byte_string = std::string;
using CALLFUNCTION_CB_STATE = hippy::CALL_FUNCTION_CB_STATE;

namespace hippy {
inline namespace framework {
inline namespace connector {
inline namespace worker {

static void GetModuleNamesFromTsArray(napi_env env, napi_value ts_array, std::set<std::string> &module_names) {
  ArkTS arkTs(env);
  if (arkTs.IsArray(ts_array)) {
    auto length = arkTs.GetArrayLength(ts_array);
    if (length > 0) {
      for (uint32_t i = 0; i < length; i ++) {
        auto ts_name = arkTs.GetArrayElement(ts_array, i);
        auto name = arkTs.GetString(ts_name);
        if (name.length() > 0) {
          module_names.insert(name);
        }
      }
    }
  }
}

static void CallTs(napi_env env, napi_value ts_cb, void *context, void *data) {
  if (env == nullptr || data == nullptr) {
    return;
  }
  WorkerFnContextData *contextData = static_cast<WorkerFnContextData*>(data);
  
  ArkTS arkTs(env);
  std::vector<napi_value> args = {
    arkTs.CreateUint32(contextData->scope_id_),
    arkTs.CreateStringUtf16(contextData->module_str_),
    arkTs.CreateStringUtf16(contextData->func_str_),
    arkTs.CreateStringUtf16(contextData->cb_id_str_),
    arkTs.CreateExternalArrayBuffer(contextData->buffer_pair_.first, contextData->buffer_pair_.second)
  };
  arkTs.Call(ts_cb, args, nullptr);
  
  DestroyWorkerFnContext(contextData);
}

static napi_value RegisterWModules(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info);
  auto worker_name = arkTs.GetString(args[0]);
  auto ts_cb = args[1];
  auto ts_array = args[2];
  
  // 使用回调ts的函数创建一个线程安全函数
  napi_threadsafe_function func = nullptr;
  napi_value resource_name = arkTs.CreateString("Thread-safe Function callNatives");
  auto status = napi_create_threadsafe_function(env, ts_cb, nullptr, resource_name, 0, 1, nullptr, nullptr,
    nullptr, CallTs, &func);
  if (status != napi_ok) {
    FOOTSTONE_LOG(ERROR) << "ArkTS: Failed to create thread safe func, status: " << status;
    return arkTs.GetUndefined();
  }
  
  // 模块名数组
  std::set<std::string> module_names;
  GetModuleNamesFromTsArray(env, ts_array, module_names);
  
  if (module_names.size() > 0) {
    WorkerModuleManager::GetInstance()->SetWModules(env, func, module_names);
  }
  
  WorkerModuleManager::GetInstance()->NotifyMainThreadRegisterWModulesFinished(worker_name);
  
  return arkTs.GetUndefined();
}

static napi_value UnregisterWModules(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info);
  auto ts_array = args[0];
  
  // 模块名数组
  std::set<std::string> module_names;
  GetModuleNamesFromTsArray(env, ts_array, module_names);
  
  if (module_names.size() > 0) {
    napi_threadsafe_function ts_func = nullptr;
    WorkerModuleOwner *one_owner = WorkerModuleManager::GetInstance()->GetWModule(*(module_names.begin()));
    if (one_owner) {
      ts_func = one_owner->ts_func_;
    }
    WorkerModuleManager::GetInstance()->UnsetWModules(module_names);
    if (ts_func) {
      napi_release_threadsafe_function(ts_func, napi_tsfn_abort);
    }
  }
  
  return arkTs.GetUndefined();
}

static napi_value CallJsFunction(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info);
  uint32_t scope_id = static_cast<uint32_t>(arkTs.GetInteger(args[0]));
  auto action_name = string_view(arkTs.GetString(args[1]));
  void *buffer_data = NULL;
  size_t byte_length = 0;
  if (arkTs.IsArrayBuffer(args[2])) {
    arkTs.GetArrayBufferInfo(args[2], &buffer_data, &byte_length);
  }
  byte_string buffer;
  if (buffer_data && byte_length > 0) {
    buffer.assign(static_cast<char*>(buffer_data), byte_length);
  }

  std::any scope_object;
  auto flag = hippy::global_data_holder.Find(scope_id, scope_object);
  if (!flag)  {
    FOOTSTONE_LOG(ERROR) << "worker scope can not found, scope id = " << scope_id << "!!!";
    return arkTs.GetUndefined();
  }
  auto scope = std::any_cast<std::shared_ptr<Scope>>(scope_object);
  JsDriverUtils::CallJs(
    action_name, scope,
    [](CALLFUNCTION_CB_STATE state, const string_view &msg) {
      FOOTSTONE_LOG(INFO) << "worker callFunctionCallBack, result: " << (int)state << ", msg: " << msg;
    },
    std::move(buffer),
    []() {});
  return arkTs.GetUndefined();
}

REGISTER_OH_NAPI("Worker", "Worker_RegisterWModules", RegisterWModules)
REGISTER_OH_NAPI("Worker", "Worker_UnregisterWModules", UnregisterWModules)
REGISTER_OH_NAPI("Worker", "Worker_CallJsFunction", CallJsFunction)

}
}
}
}
