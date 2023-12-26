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

#include "connector/dom_manager_napi.h"
#include <js_native_api.h>
#include <js_native_api_types.h>
#include "oh_napi/data_holder.h"
#include "oh_napi/oh_napi_register.h"
#include "oh_napi/ark_ts.h"
#include "dom/dom_manager.h"
#include "dom/root_node.h"
#include "footstone/check.h"
#include "footstone/logging.h"
#include "footstone/persistent_object_map.h"
#include "footstone/task_runner.h"
#include "footstone/worker_impl.h"

namespace hippy {
inline namespace framework {
inline namespace connector {
inline namespace dom {

using WorkerImpl = footstone::WorkerImpl;
using TaskRunner = footstone::TaskRunner;

constexpr char kDomWorkerName[] = "dom_worker";
constexpr char kDomRunnerName[] = "dom_task_runner";

static napi_value SetRenderManager(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info, 2);
  uint32_t first_dom_manager_id = static_cast<uint32_t>(arkTs.GetInteger(args[0]));
  uint32_t render_id = static_cast<uint32_t>(arkTs.GetInteger(args[1]));
  std::any render_manager;
  auto flag = hippy::global_data_holder.Find(render_id, render_manager);
  FOOTSTONE_CHECK(flag);
  auto render_manager_object = std::any_cast<std::shared_ptr<RenderManager>>(render_manager);

  uint32_t dom_manager_num = 0;
  flag = hippy::global_dom_manager_num_holder.Find(first_dom_manager_id, dom_manager_num);
  FOOTSTONE_CHECK(flag);
  for (uint32_t i = 0; i < dom_manager_num; i++) {
    auto dom_manager_id = first_dom_manager_id + i;
    std::any dom_manager;
    flag = hippy::global_data_holder.Find(dom_manager_id, dom_manager);
    FOOTSTONE_CHECK(flag);
    auto dom_manager_object = std::any_cast<std::shared_ptr<DomManager>>(dom_manager);
    dom_manager_object->SetRenderManager(render_manager_object);
  }
  
  return arkTs.GetUndefined();
}

static napi_value CreateDomManager(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info);
  uint32_t dom_manager_num = static_cast<uint32_t>(arkTs.GetInteger(args[0]));
  uint32_t first_dom_manager_id = 0;
  for (uint32_t i = 0; i < dom_manager_num; i++) {
    auto dom_manager = std::make_shared<DomManager>();
    auto dom_manager_id = hippy::global_data_holder_key.fetch_add(1);
    hippy::global_data_holder.Insert(dom_manager_id, dom_manager);
    std::string worker_name = kDomWorkerName + std::to_string(dom_manager_id);
    auto worker = std::make_shared<WorkerImpl>(worker_name, false);
    worker->Start();
    auto runner = std::make_shared<TaskRunner>(kDomRunnerName);
    runner->SetWorker(worker);
    worker->Bind({runner});
    dom_manager->SetTaskRunner(runner);
    dom_manager->SetWorker(worker);
    
    if (first_dom_manager_id == 0) {
      first_dom_manager_id = dom_manager_id;
    }
  }
  
  hippy::global_dom_manager_num_holder.Insert(first_dom_manager_id, dom_manager_num);

  return arkTs.CreateInt(static_cast<int>(first_dom_manager_id));
}

static napi_value DestroyDomManager(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info, 1);
  uint32_t first_dom_manager_id = static_cast<uint32_t>(arkTs.GetInteger(args[0]));
  uint32_t dom_manager_num = 0;
  auto flag = hippy::global_dom_manager_num_holder.Find(first_dom_manager_id, dom_manager_num);
  FOOTSTONE_CHECK(flag);
  for (uint32_t i = 0; i < dom_manager_num; i++) {
    auto dom_manager_id = first_dom_manager_id + i;
    std::any dom_manager;
    flag = hippy::global_data_holder.Find(dom_manager_id, dom_manager);
    FOOTSTONE_CHECK(flag);
    auto dom_manager_object = std::any_cast<std::shared_ptr<DomManager>>(dom_manager);
    dom_manager_object->GetWorker()->Terminate();
    flag = hippy::global_data_holder.Erase(dom_manager_id);
    FOOTSTONE_DCHECK(flag);
  }
  
  return arkTs.GetUndefined();
}

static napi_value CreateRoot(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info, 2);
  uint32_t root_id = static_cast<uint32_t>(arkTs.GetInteger(args[0]));
  double density = arkTs.GetDouble(args[1]);
  auto root_node = std::make_shared<hippy::RootNode>(root_id);
  auto layout = root_node->GetLayoutNode();
  layout->SetScaleFactor(static_cast<float>(density));
  auto& persistent_map = RootNode::PersistentMap();
  auto flag = persistent_map.Insert(root_id, root_node);
  FOOTSTONE_DCHECK(flag);
  return arkTs.GetUndefined();
}

static napi_value DestroyRoot(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info, 1);
  uint32_t root_id = static_cast<uint32_t>(arkTs.GetInteger(args[0]));
  auto& persistent_map = RootNode::PersistentMap();
  auto flag = persistent_map.Erase(root_id);
  FOOTSTONE_DCHECK(flag);
  return arkTs.GetUndefined();
}

static napi_value ReleaseRootResources(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info, 1);
  auto ts_root_id = args[0];
  if (arkTs.GetType(ts_root_id) != napi_number) {
    FOOTSTONE_LOG(WARNING) << "Release root resources error, param type is not number";
    return arkTs.GetUndefined();
  }
  uint32_t root_id = static_cast<uint32_t>(arkTs.GetInteger(ts_root_id));
  auto& persistent_map = RootNode::PersistentMap();
  std::shared_ptr<RootNode> root_node;
  auto flag = persistent_map.Find(root_id, root_node);
  FOOTSTONE_CHECK(flag);
  root_node->ReleaseResources();
  return arkTs.GetUndefined();
}

static napi_value SetDomManager(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info, 2);
  uint32_t root_id = static_cast<uint32_t>(arkTs.GetInteger(args[0]));
  uint32_t first_dom_manager_id = static_cast<uint32_t>(arkTs.GetInteger(args[1]));

  std::shared_ptr<RootNode> root_node;
  auto& persistent_map = RootNode::PersistentMap();
  auto flag = persistent_map.Find(root_id, root_node);
  FOOTSTONE_CHECK(flag);
  
  if (root_node->GetDomManager().lock()) {
    return arkTs.GetUndefined();
  }
  
  uint32_t next_id = GlobalGetNextDomManagerId(first_dom_manager_id);

  std::any dom_manager;
  flag = hippy::global_data_holder.Find(next_id, dom_manager);
  FOOTSTONE_CHECK(flag);
  auto dom_manager_object = std::any_cast<std::shared_ptr<DomManager>>(dom_manager);

  root_node->SetDomManager(dom_manager_object);
  return arkTs.GetUndefined();
}

REGISTER_OH_NAPI("DomManager", "DomManager_SetRenderManager", SetRenderManager)
REGISTER_OH_NAPI("DomManager", "DomManager_CreateDomManager", CreateDomManager)
REGISTER_OH_NAPI("DomManager", "DomManager_DestroyDomManager", DestroyDomManager)
REGISTER_OH_NAPI("DomManager", "DomManager_CreateRoot", CreateRoot)
REGISTER_OH_NAPI("DomManager", "DomManager_DestroyRoot", DestroyRoot)
REGISTER_OH_NAPI("DomManager", "DomManager_ReleaseRootResources", ReleaseRootResources)
REGISTER_OH_NAPI("DomManager", "DomManager_SetDomManager", SetDomManager)

}
}
}
}
