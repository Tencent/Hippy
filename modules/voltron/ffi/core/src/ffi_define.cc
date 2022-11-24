/*
 *
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
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#include "ffi_define.h"

#include "footstone/logging.h"
#include "footstone/persistent_object_map.h"

global_callback global_callback_func = nullptr;

namespace voltron{
using RegisterCallFuncExMap = footstone::utils::PersistentObjectMap<std::string , register_call_func_ex>;
static RegisterCallFuncExMap register_call_func_ex_map_;

using WorkManagerMap = footstone::utils::PersistentObjectMap<uint32_t , std::shared_ptr<footstone::WorkerManager>>;
constexpr uint32_t kDefaultNumberOfThreads = 2;
static WorkManagerMap worker_manager_map_;
static std::atomic<uint32_t> global_worker_manager_key_{1};

uint32_t FfiCreateWorkerManager() {
  auto worker_manager = std::make_shared<footstone::WorkerManager>(kDefaultNumberOfThreads);
  auto id = global_worker_manager_key_.fetch_add(1);
  worker_manager_map_.Insert(id, worker_manager);
  return id;
}

void FfiDestroyWorkerManager(uint32_t worker_manager_id) {
  std::shared_ptr<footstone::WorkerManager> worker_manager;
  auto flag = worker_manager_map_.Find(worker_manager_id, worker_manager);
  if (flag && worker_manager) {
    worker_manager->Terminate();
    worker_manager_map_.Erase(worker_manager_id);
  }
}

Sp<footstone::WorkerManager> FfiFindWorkerManager(uint32_t worker_manager_id) {
  std::shared_ptr<footstone::WorkerManager> worker_manager;
  auto flag = worker_manager_map_.Find(worker_manager_id, worker_manager);
  if (flag && worker_manager) {
    return worker_manager;
  }
  return nullptr;
}
}


#ifdef __cplusplus
extern "C" {
#endif

constexpr char kDefaultRegisterHeader[] = "default";

EXTERN_C int32_t InitFfi(dart_post_c_object_type dart_post_c_object, int64_t port) {
  VoltronRegisterDartPostCObject(dart_post_c_object, port);
  return 0;
}

EXTERN_C int32_t AddCallFunc(const char16_t *register_header, int32_t type, void *func) {
  FOOTSTONE_DLOG(INFO) << "start register func header: " << register_header << ", type: " << type << ", func:" << func;
  auto header_str = voltron::C16CharToString(register_header);
  if (header_str == kDefaultRegisterHeader) {
    if (type == static_cast<int>(DefaultRegisterFuncType::kGlobalCallback)) {
      global_callback_func = reinterpret_cast<global_callback>(func);
      return true;
    }
    FOOTSTONE_DLOG(ERROR) << "register func error header: " << register_header << ", unknown type: " << type;
    return false;
  } else {
    register_call_func_ex register_call_func_ex;
    voltron::register_call_func_ex_map_.Find(header_str, register_call_func_ex);
    if (register_call_func_ex) {
      register_call_func_ex(type, func);
      return true;
    }
  }

  FOOTSTONE_DLOG(ERROR) << "register func error header: " << register_header << ", unknown type: " << type;
  return false;
}

EXTERN_C int32_t AddCallFuncRegister(const char16_t *register_header, register_call_func_ex func) {
  FOOTSTONE_DLOG(INFO) << "start func register extension  header: " << register_header;
  auto header_str = voltron::C16CharToString(register_header);
  return voltron::register_call_func_ex_map_.Insert(header_str, func);
}

#ifdef __cplusplus
}
#endif
