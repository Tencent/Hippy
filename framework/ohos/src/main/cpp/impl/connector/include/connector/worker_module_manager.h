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

#include "oh_napi/ark_ts.h"
#include <set>
#include <mutex>
#include <node_api.h>

namespace hippy {
inline namespace framework {
inline namespace worker {

class WorkerFnContextData {
public:
  uint32_t scope_id_ = 0;
  std::u16string module_str_;
  std::u16string func_str_;
  std::u16string cb_id_str_;
  std::pair<uint8_t*, size_t> buffer_pair_;
};

class MainThreadFnContextData {
public:
  std::string worker_name_;
};

WorkerFnContextData *CreateWorkerFnContext();
void DestroyWorkerFnContext(WorkerFnContextData *contextData);
MainThreadFnContextData *CreateMainThreadFnContext();
void DestroyMainThreadFnContext(MainThreadFnContextData *contextData);

class WorkerModuleOwner {
public:
  WorkerModuleOwner(napi_env env, napi_threadsafe_function func): ts_worker_env_(env), ts_func_(func) {}
  napi_env ts_worker_env_ = 0;
  napi_threadsafe_function ts_func_ = 0;
};

class WorkerModuleManager {
public:
  static std::shared_ptr<WorkerModuleManager> GetInstance();
  
  void RecordMainThreadTsEnvInfo(napi_env ts_main_env, napi_threadsafe_function ts_main_notify_func);
  void NotifyMainThreadRegisterWModulesFinished(const std::string &worker_name);
  
  void SetWModules(napi_env ts_worker_env, napi_threadsafe_function ts_func, std::set<std::string> &names);
  void UnsetWModules(std::set<std::string> &names);
  WorkerModuleOwner *GetWModule(const std::string &name);
  size_t GetWModuleTotalNumber();
  
private:
  std::unordered_map<std::string, WorkerModuleOwner> module_map_;
  std::mutex mutex_;
  
  napi_env ts_main_env_ = 0;
  napi_threadsafe_function ts_main_notify_func_ = 0;
};

}
}
}