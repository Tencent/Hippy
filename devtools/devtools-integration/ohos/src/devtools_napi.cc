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

#include "footstone/string_view_utils.h"
#include "napi/native_api.h"
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
#include "devtools_napi.h"
#include "devtools/devtools_data_source.h"

namespace hippy::devtools {

using WorkerManager = footstone::runner::WorkerManager;
using string_view = footstone::stringview::string_view;
using StringViewUtils = footstone::stringview::StringViewUtils;
constexpr uint32_t kPoolSize = 1;
constexpr char kDevToolsNapiTag[] = "DevTools-Napi:";
std::shared_ptr<WorkerManager> worker_manager;
using DevtoolsDataSource = hippy::devtools::DevtoolsDataSource;

static napi_value OnCreateDevtools(napi_env env, napi_callback_info info) {
    //     size_t requireArgc = 2;
    ArkTS arkTs(env);
    size_t argc = 2;
    napi_value args[2] = {nullptr};

    napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);
    std::vector<napi_value> argVector = arkTs.GetCallbackArgs(info);
    FOOTSTONE_DLOG(INFO) << "devtools napi::OnCreateDevtools::" << argVector.size();

    if (argc != 2) {
      napi_throw_error(env, nullptr, " Requires 2 arguments: data directory and WebSocket URL.");
      return nullptr;
    }

    napi_valuetype dirType = arkTs.GetType(args[0]);
    napi_valuetype wsType = arkTs.GetType(args[1]);
    if (!(dirType == napi_string && wsType == napi_string)) {
      napi_throw_error(env, nullptr, "Both arguments must be strings.");
      return nullptr;
    }

    std::string data_dir = arkTs.GetString(args[0]);
    std::string ws_url = arkTs.GetString(args[1]);

    worker_manager = std::make_shared<WorkerManager>(kPoolSize);

    DevtoolsDataSource::SetFileCacheDir(data_dir);

    auto devtools_data_source =
        std::make_shared<hippy::devtools::DevtoolsDataSource>();
    devtools_data_source->CreateDevtoolsService(ws_url, worker_manager);
    uint32_t id = devtools::DevtoolsDataSource::Insert(devtools_data_source);

    napi_value result = arkTs.CreateInt(static_cast<int>(id));
    
    return result;
}

static napi_value OnDestroyDevtools(napi_env env, napi_callback_info info) {
    ArkTS arkTs(env);
    size_t argc = 2;
    napi_value args[2] = {nullptr};

    napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);
    std::vector<napi_value> argVector = arkTs.GetCallbackArgs(info);
    FOOTSTONE_DLOG(INFO) << "devtools napi::OnDestroyDevtools::" << argVector.size();

    if (argc != 2) {
      napi_throw_error(env, nullptr, " Requires 2 arguments: data directory and WebSocket URL.");
      return nullptr;
    }

    napi_valuetype devtoolsIdType = arkTs.GetType(args[0]);
    napi_valuetype isReloadType = arkTs.GetType(args[1]);
    if (!(devtoolsIdType == napi_number && isReloadType == napi_boolean)) {
      napi_throw_error(env, nullptr, "Both arguments must be strings.");
      return nullptr;
    }

    int devtools_id = arkTs.GetInteger(args[0]);
    bool is_reload = arkTs.GetBoolean(args[1]);
    std::shared_ptr<DevtoolsDataSource> devtools_data_source = DevtoolsDataSource::Find(footstone::checked_numeric_cast<int, uint32_t>(devtools_id));
    devtools_data_source->Destroy(is_reload);
    bool flag = DevtoolsDataSource::Erase(footstone::checked_numeric_cast<int, uint32_t>(devtools_id));
    FOOTSTONE_DLOG(INFO) << kDevToolsNapiTag << "OnDestroyDevtools devtools_id=" << devtools_id << ",flag=" << flag;
    FOOTSTONE_DCHECK(flag);
    worker_manager->Terminate();
    napi_value result = arkTs.GetUndefined();
    return result;
}


static napi_value OnBindDevtools(napi_env env, napi_callback_info info) {
    ArkTS arkTs(env);
    size_t argc = 4;
    napi_value args[4] = {nullptr};

    napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);
    std::vector<napi_value> argVector = arkTs.GetCallbackArgs(info);
    FOOTSTONE_DLOG(INFO) << "devtools napi::OnBindDevtools::" << argVector.size();

    if (argc != 4) {
      napi_throw_error(env, nullptr, " Requires 4 arguments: data directory and WebSocket URL.");
      return nullptr;
    }

    napi_valuetype devtoolsIdType = arkTs.GetType(args[0]);
    //     napi_valuetype driverIdType = arkTs.GetType(args[1]);
    napi_valuetype domIdType = arkTs.GetType(args[2]);
    //     napi_valuetype renderIdType = arkTs.GetType(args[3]);
    if (!(devtoolsIdType == napi_number && domIdType == napi_number)) {
      napi_throw_error(env, nullptr, "Both arguments must be strings.");
      return nullptr;
    }

    int devtools_id = arkTs.GetInteger(args[0]);
    //     int driver_id = arkTs.GetInteger(args[1]);
    int dom_id = arkTs.GetInteger(args[2]);
    //     int render_id = arkTs.GetInteger(args[3]);
    std::shared_ptr<DevtoolsDataSource> devtools_data_source =
        DevtoolsDataSource::Find(footstone::checked_numeric_cast<int, uint32_t>(devtools_id));
    std::any dom_manager;
    auto flag = hippy::global_data_holder.Find(footstone::checked_numeric_cast<int, uint32_t>(dom_id), dom_manager);
    FOOTSTONE_CHECK(flag);
    auto dom_manager_object = std::any_cast<std::shared_ptr<DomManager>>(dom_manager);
    devtools_data_source->Bind(dom_manager_object);

    napi_value result = arkTs.GetUndefined();
    return result;
}

static napi_value OnAttachToRoot(napi_env env, napi_callback_info info) {
    ArkTS arkTs(env);
    size_t argc = 2;
    napi_value args[2] = {nullptr};

    napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);
    std::vector<napi_value> argVector = arkTs.GetCallbackArgs(info);
    FOOTSTONE_DLOG(INFO) << "devtools napi::OnAttachToRoot::" << argVector.size();

    if (argc != 2) {
      napi_throw_error(env, nullptr, " Requires 2 arguments: data directory and WebSocket URL.");
      return nullptr;
    }

    napi_valuetype devtoolsIdType = arkTs.GetType(args[0]);
    napi_valuetype rootIdType = arkTs.GetType(args[1]);
    if (!(devtoolsIdType == napi_number && rootIdType == napi_number)) {
      napi_throw_error(env, nullptr, "Both arguments must be number.");
      return nullptr;
    }

    int devtools_id = arkTs.GetInteger(args[0]);
    int root_id = arkTs.GetInteger(args[1]);

    auto &root_map = RootNode::PersistentMap();
    std::shared_ptr<RootNode> root_node;
    auto ret = root_map.Find(footstone::checked_numeric_cast<int, uint32_t>(root_id), root_node);
    if (!ret) {
      FOOTSTONE_DLOG(WARNING) << kDevToolsTag << "OnAttachToRoot root_node is nullptr";
      return nullptr;
    }

    FOOTSTONE_DLOG(INFO) << kDevToolsTag << "OnAttachToRoot root_id=" << root_id;
    std::shared_ptr<DevtoolsDataSource> devtools_data_source =
        DevtoolsDataSource::Find(footstone::checked_numeric_cast<int, uint32_t>(devtools_id));
    devtools_data_source->SetRootNode(root_node);
    napi_value result = arkTs.GetUndefined();
    return result;
}

REGISTER_OH_NAPI("Devtools", "Devtools_OnCreateDevtools", OnCreateDevtools)
REGISTER_OH_NAPI("Devtools", "Devtools_OnDestroyDevtools", OnDestroyDevtools)
REGISTER_OH_NAPI("Devtools", "Devtools_OnBindDevtools", OnBindDevtools)
REGISTER_OH_NAPI("Devtools", "Devtools_OnAttachToRoot", OnAttachToRoot)

} // namespace devtools
