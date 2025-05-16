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

#include "connector/js_driver_napi.h"
#include "connector/ark2js.h"
#include "connector/js2ark.h"
#include "connector/bridge.h"
#include "connector/exception_handler.h"
#include <js_native_api.h>
#include <js_native_api_types.h>
// #include "devtools/vfs/devtools_handler.h"
#include "oh_napi/data_holder.h"
#include "oh_napi/oh_napi_invocation.h"
#include "oh_napi/oh_napi_register.h"
#include "oh_napi/ark_ts.h"
#include "driver/js_driver_utils.h"
#include "footstone/check.h"
#include "footstone/logging.h"
#include "footstone/persistent_object_map.h"
#include "footstone/string_view_utils.h"
#include "footstone/worker_manager.h"
#include "vfs/handler/asset_handler.h"
#include "renderer/native_render_provider_manager.h"

#ifdef JS_V8
#include "driver/vm/v8/v8_vm.h"
#elif JS_JSH
#include "driver/vm/jsh/jsh_vm.h"
#endif

#ifdef ENABLE_INSPECTOR
#include "devtools/devtools_data_source.h"
#include "devtools/vfs/devtools_handler.h"
#endif

namespace hippy {
inline namespace framework {
inline namespace connector {
inline namespace driver {

using string_view = footstone::stringview::string_view;
using byte_string = std::string;
using u8string = footstone::string_view::u8string;
using StringViewUtils = footstone::stringview::StringViewUtils;
using Ctx = hippy::Ctx;
using Bridge = hippy::Bridge;
using JsDriverUtils = hippy::JsDriverUtils;
using WorkerManager = footstone::WorkerManager;
using TaskRunner = footstone::TaskRunner;

#ifdef JS_V8
using V8VMInitParam = hippy::V8VMInitParam;
#elif JS_JSH
using JSHVMInitParam = hippy::JSHVMInitParam;
#endif

enum INIT_CB_STATE {
  DESTROY_ERROR = -2,
  RUN_SCRIPT_ERROR = -1,
  SUCCESS = 0,
};

constexpr char kHippyCurDirKey[] = "__HIPPYCURDIR__";
constexpr char kAssetSchema[] = "asset";

static std::mutex holder_mutex;
static std::mutex scope_mutex;
// scope has two phases:
// 1. create scope object.
// 2. Initializing scope object in JS thread.
// scope_initialized true means scope finished in js thread.
// destroy js driver should wait after scope initialization.
static std::unordered_map<uint32_t, bool> scope_initialized_map;
static std::unordered_map<uint32_t, std::unique_ptr<std::condition_variable>> scope_cv_map;
static std::unordered_map<void*, std::shared_ptr<Engine>> engine_holder;

std::shared_ptr<Scope> GetScope(uint32_t scope_id) {
  std::any scope_object;
  auto flag = hippy::global_data_holder.Find(scope_id, scope_object);
  if (!flag) {
    FOOTSTONE_LOG(ERROR) << "Can't find scope, scope id = " << scope_id;
    return nullptr;
  }
  return std::any_cast<std::shared_ptr<Scope>>(scope_object);
}

static napi_value CreateJsDriver(napi_env env, napi_callback_info info) {
  // perfromance start time
  auto perf_start_time = footstone::TimePoint::SystemNow();

  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info);
  auto object_ref = arkTs.CreateReference(args[0]);
  std::string global_config_str = arkTs.GetString(args[1]);
  // auto single_thread_mode = arkTs.GetBoolean(args[2]);
  auto enable_v8_serialization = arkTs.GetBoolean(args[3]);
  auto is_dev_module = arkTs.GetBoolean(args[4]);
  auto callback_ref = arkTs.CreateReference(args[5]);
  int64_t group_id = static_cast<int64_t>(arkTs.GetInteger(args[6]));
  uint32_t dom_manager_id = static_cast<uint32_t>(arkTs.GetInteger(args[7]));
  auto has_vm_init_param = false;
  const int vm_param_index = 8;
  if (arkTs.IsArray(args[vm_param_index]) && arkTs.GetArrayLength(args[vm_param_index]) >= 2) {
    has_vm_init_param = true;
  }
    
  #ifdef ENABLE_INSPECTOR
//     auto vfs_id = arkTs.GetInteger(args[9]);
    auto devtools_id = arkTs.GetInteger(args[10]);
  #endif  
  auto is_reload = arkTs.GetBoolean(args[11]);

  FOOTSTONE_LOG(INFO) << "CreateJsDriver begin, enable_v8_serialization = " << static_cast<uint32_t>(enable_v8_serialization)
                      << ", is_dev_module = " << static_cast<uint32_t>(is_dev_module)
                      << ", group_id = " << group_id;

  string_view global_config(global_config_str);

#ifdef JS_V8
  auto param = std::make_shared<V8VMInitParam>();
  param->enable_v8_serialization = enable_v8_serialization;
  param->is_debug = is_dev_module;
  if (has_vm_init_param) {
    auto ts_value0 = arkTs.GetArrayElement(args[vm_param_index], 0);
    auto ts_value1 = arkTs.GetArrayElement(args[vm_param_index], 1);
    auto initial_heap_size_in_bytes = arkTs.GetInteger(ts_value0);
    auto maximum_heap_size_in_bytes = arkTs.GetInteger(ts_value1);
    param->initial_heap_size_in_bytes =
      footstone::check::checked_numeric_cast<int, size_t>(initial_heap_size_in_bytes);
    param->maximum_heap_size_in_bytes =
      footstone::check::checked_numeric_cast<int, size_t>(maximum_heap_size_in_bytes);
    FOOTSTONE_CHECK(initial_heap_size_in_bytes <= maximum_heap_size_in_bytes);
  }
#elif JS_JSH
  auto param = std::make_shared<JSHVMInitParam>();
  param->is_debug = is_dev_module;
  if (has_vm_init_param) {
    
  }
#else
  auto param = std::make_shared<VMInitParam>();
#endif
#ifdef ENABLE_INSPECTOR
  if (param->is_debug) {
    auto devtools_data_source =
      devtools::DevtoolsDataSource::Find(footstone::checked_numeric_cast<int, uint32_t>(devtools_id));
    param->devtools_data_source = devtools_data_source;
  }
#endif
  auto call_host_callback = [](CallbackInfo& info, void* data) {
    hippy::bridge::CallHost(info);
  };
  param->uncaught_exception_callback = ([](const std::any& bridge, const string_view& description, const string_view& stack) {
    ExceptionHandler::ReportJsException(bridge, description, stack);
  });

  std::any dom_manager;
  auto flag = hippy::global_data_holder.Find(dom_manager_id, dom_manager);
  FOOTSTONE_CHECK(flag);
  auto dom_manager_object = std::any_cast<std::shared_ptr<DomManager>>(dom_manager);
  auto dom_task_runner = dom_manager_object->GetTaskRunner();
  auto bridge = std::make_shared<Bridge>(object_ref);
  auto scope_id = hippy::global_data_holder_key.fetch_add(1);
  scope_initialized_map.insert({scope_id, false});
  scope_cv_map.insert({scope_id, std::make_unique<std::condition_variable>()});

  auto scope_initialized_callback = [perf_start_time,
      scope_id, env, callback_ref, bridge, &holder = hippy::global_data_holder](std::shared_ptr<Scope> scope) {
    scope->SetBridge(bridge);
    scope->SetScopeId(scope_id);
    holder.Insert(scope_id, scope);

    // perfromance end time
    auto entry = scope->GetPerformance()->PerformanceNavigation("hippyInit");
    entry->SetHippyJsEngineInitStart(perf_start_time);
    entry->SetHippyJsEngineInitEnd(footstone::TimePoint::SystemNow());

    FOOTSTONE_LOG(INFO) << "run scope cb";
    hippy::bridge::CallArkMethod(env, callback_ref, INIT_CB_STATE::SUCCESS);

    {
      std::unique_lock<std::mutex> lock(scope_mutex);
      scope_initialized_map[scope_id] = true;
      scope_cv_map[scope_id]->notify_all();
    }
  };
  auto engine = JsDriverUtils::CreateEngineAndAsyncInitialize(
      dom_task_runner, param, group_id, is_reload);
  {
    std::lock_guard<std::mutex> lock(holder_mutex);
    engine_holder[engine.get()] = engine;
  }
  JsDriverUtils::InitInstance(
      engine,
      param,
      global_config,
      scope_initialized_callback,
      call_host_callback);
  return arkTs.CreateInt(static_cast<int>(scope_id));
}

static napi_value DestroyJsDriver(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info);
  uint32_t scope_id = static_cast<uint32_t>(arkTs.GetInteger(args[0]));
  // auto single_thread_mode = arkTs.GetBoolean(args[1]);
  auto is_reload = arkTs.GetBoolean(args[2]);
  auto callback_ref = arkTs.CreateReference(args[3]);

  {
    std::unique_lock<std::mutex> lock(scope_mutex);
    if (!scope_initialized_map[scope_id]) {
      auto iter = scope_cv_map.find(scope_id);
      if (iter != scope_cv_map.end()) {
        auto &cv = iter->second;
        cv->wait(lock, [scope_id] { return scope_initialized_map[scope_id]; });
      }
    }
    scope_initialized_map.erase(scope_id);
    scope_cv_map.erase(scope_id);
  }
  auto scope = GetScope(scope_id);
  auto engine = scope->GetEngine().lock();
  FOOTSTONE_CHECK(engine);
  {
    std::lock_guard<std::mutex> lock(holder_mutex);
    auto it = engine_holder.find(engine.get());
    if (it != engine_holder.end()) {
      engine_holder.erase(it);
    }
  }
  auto flag = hippy::global_data_holder.Erase(scope_id);
  FOOTSTONE_CHECK(flag);
  JsDriverUtils::DestroyInstance(
    std::move(engine), std::move(scope),
    [env, callback_ref](bool ret) {
      if (ret) {
        hippy::bridge::CallArkMethod(env, callback_ref, INIT_CB_STATE::SUCCESS);
      } else {
        hippy::bridge::CallArkMethod(env, callback_ref, INIT_CB_STATE::DESTROY_ERROR);
      }
    },
    is_reload);

  return arkTs.GetUndefined();
}

static napi_value LoadInstance(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info);
  uint32_t scope_id = static_cast<uint32_t>(arkTs.GetInteger(args[0]));

  void *buffer_data = NULL;
  size_t byte_length = 0;
  if (arkTs.IsArrayBuffer(args[1])) {
    arkTs.GetArrayBufferInfo(args[1], &buffer_data, &byte_length);
  }
  FOOTSTONE_CHECK(byte_length > 0);

  byte_string buffer;
  if (buffer_data && byte_length > 0) {
    buffer.assign(static_cast<char *>(buffer_data), byte_length);
  }

  auto scope = GetScope(scope_id);
  JsDriverUtils::LoadInstance(scope, std::move(buffer));
  return arkTs.GetUndefined();
}

static napi_value UnloadInstance(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info);
  uint32_t scope_id = static_cast<uint32_t>(arkTs.GetInteger(args[0]));
    void *buffer_data = NULL;
  size_t byte_length = 0;
  if (arkTs.IsArrayBuffer(args[1])) {
    arkTs.GetArrayBufferInfo(args[1], &buffer_data, &byte_length);
  }
  FOOTSTONE_CHECK(byte_length > 0);

  byte_string buffer;
  if (buffer_data && byte_length > 0) {
    buffer.assign(static_cast<char *>(buffer_data), byte_length);
  }
  auto scope = GetScope(scope_id);
  if (scope == nullptr) {
    return arkTs.GetUndefined();
  }
  JsDriverUtils::UnloadInstance(scope, std::move(buffer));
  return arkTs.GetUndefined();
}

static napi_value RunScriptFromUri(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info);
  uint32_t scope_id = static_cast<uint32_t>(arkTs.GetInteger(args[0]));
  std::string uri_str = arkTs.GetString(args[1]);
  bool is_rawfile = arkTs.GetBoolean(args[2]);
  auto asset_manager = args[3];
  auto res_module_name = arkTs.GetString(args[4]);
  bool can_use_code_cache = arkTs.GetBoolean(args[5]);
  std::string code_cache_dir_str = arkTs.GetString(args[6]);
  auto vfs_id = static_cast<uint32_t>(arkTs.GetInteger(args[7]));
  auto callback_ref = arkTs.CreateReference(args[8]);

  auto time_begin = std::chrono::time_point_cast<std::chrono::microseconds>(
      std::chrono::system_clock::now())
      .time_since_epoch()
      .count();
  if (uri_str.empty()) {
    FOOTSTONE_DLOG(WARNING) << "runScriptFromUri, uri invalid";
    return arkTs.CreateBoolean(false);
  }
  auto uri = string_view(uri_str);
  auto code_cache_dir = string_view(code_cache_dir_str);
  auto pos = StringViewUtils::FindLastOf(uri, EXTEND_LITERAL('/'));
  auto len = StringViewUtils::GetLength(uri);
  auto script_name = StringViewUtils::SubStr(uri, pos + 1, len);
  auto base_path = StringViewUtils::SubStr(uri, 0, pos + 1);
  FOOTSTONE_DLOG(INFO) << "runScriptFromUri, uri = " << uri
                       << ", script_name = " << script_name
                       << ", base_path = " << base_path
                       << ", code_cache_dir = " << code_cache_dir;
  auto scope = GetScope(scope_id);
  auto runner = scope->GetTaskRunner();
  auto ctx = scope->GetContext();
  runner->PostTask([ctx, base_path] {
    auto key = ctx->CreateString(kHippyCurDirKey);
    auto value = ctx->CreateString(base_path);
    auto global = ctx->GetGlobalObject();
    ctx->SetProperty(global, key, value);
  });

  std::any vfs_instance;
  auto flag = hippy::global_data_holder.Find(vfs_id, vfs_instance);
  FOOTSTONE_CHECK(flag);
  auto loader = std::any_cast<std::shared_ptr<UriLoader>>(vfs_instance);
//  auto bridge = std::any_cast<std::shared_ptr<Bridge>>(scope->GetBridge());
//  auto ref = bridge->GetRef();
  scope->SetUriLoader(loader);
  auto engine = scope->GetEngine().lock();
  FOOTSTONE_CHECK(engine);
  if (asset_manager) {
    auto asset_handler = std::make_shared<hippy::AssetHandler>();
    asset_handler->Init(env, is_rawfile, asset_manager, res_module_name);
    loader->RegisterUriHandler(kAssetSchema, asset_handler);
  }
#ifdef ENABLE_INSPECTOR
  auto devtools_data_source = scope->GetDevtoolsDataSource();
  if (devtools_data_source) {
    auto network_notification = devtools_data_source->GetNotificationCenter()->network_notification;
    auto devtools_handler = std::make_shared<hippy::devtools::DevtoolsHandler>();
    devtools_handler->SetNetworkNotification(network_notification);
    loader->RegisterUriInterceptor(devtools_handler);
  }
#endif
  auto is_local_file = asset_manager ? true : false;
  auto func = [scope, env, callback_ref, script_name,
      can_use_code_cache, code_cache_dir, uri, is_local_file,
      time_begin] {
    FOOTSTONE_DLOG(INFO) << "runScriptFromUri enter";
    bool flag = JsDriverUtils::RunScript(scope, script_name, can_use_code_cache,
                                         code_cache_dir, uri, is_local_file);
    auto time_end = std::chrono::time_point_cast<std::chrono::microseconds>(
        std::chrono::system_clock::now())
        .time_since_epoch()
        .count();

    FOOTSTONE_DLOG(INFO) << "runScriptFromUri time = " << (time_end - time_begin) << ", uri = " << uri;
    if (flag) {
      hippy::bridge::CallArkMethod(env, callback_ref, INIT_CB_STATE::SUCCESS);
    } else {
      hippy::bridge::CallArkMethod(env, callback_ref, INIT_CB_STATE::RUN_SCRIPT_ERROR, "run script error");
    }
    return flag;
  };
  runner->PostTask(std::move(func));
  return arkTs.CreateBoolean(true);
}

static napi_value SetRootNode(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info);
  uint32_t scope_id = static_cast<uint32_t>(arkTs.GetInteger(args[0]));
  uint32_t root_id = static_cast<uint32_t>(arkTs.GetInteger(args[1]));
  auto scope = GetScope(scope_id);
  if (scope == nullptr) {
    return arkTs.GetUndefined();
  }
  std::shared_ptr<RootNode> root_node;
  auto& persistent_map = RootNode::PersistentMap();
  auto flag = persistent_map.Find(root_id, root_node);
  FOOTSTONE_CHECK(flag);
  scope->SetRootNode(root_node);
  NativeRenderProviderManager::SaveRootIdWithScopeId(root_id, scope_id);
  return arkTs.GetUndefined();
}

static napi_value OnNativeInitEnd(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info);
  uint32_t scope_id = static_cast<uint32_t>(arkTs.GetInteger(args[0]));
  int64_t startTime = arkTs.GetInt64(args[1]);
  int64_t endTime = arkTs.GetInt64(args[2]);

  auto scope = GetScope(scope_id);
  if (!scope) {
    return arkTs.GetUndefined();
  }
  auto runner = scope->GetEngine().lock()->GetJsTaskRunner();
  if (runner) {
    std::weak_ptr<Scope> weak_scope = scope;
    auto task = [weak_scope, startTime, endTime]() {
      auto scope = weak_scope.lock();
      if (scope) {
        auto entry = scope->GetPerformance()->PerformanceNavigation("hippyInit");
        entry->SetHippyNativeInitStart(footstone::TimePoint::FromEpochDelta(footstone::TimeDelta::FromMilliseconds(startTime)));
        entry->SetHippyNativeInitEnd(footstone::TimePoint::FromEpochDelta(footstone::TimeDelta::FromMilliseconds(endTime)));
      }
    };
    runner->PostTask(std::move(task));
  }
  return arkTs.GetUndefined();
}

// Ohos上，View都是C语言的，在Render模块，直接调用JSDriver不方便，所以这里定义，Render里声明使用
extern "C" void OnFirstPaintEndForView(uint32_t scope_id, uint32_t root_id, int64_t time) {
  auto scope = GetScope(scope_id);
  if (!scope) {
    return;
  }
  auto runner = scope->GetEngine().lock()->GetJsTaskRunner();
  if (runner) {
    std::weak_ptr<Scope> weak_scope = scope;
    auto task = [weak_scope, root_id, time]() {
      auto scope = weak_scope.lock();
      if (!scope) {
        return;
      }
      auto dom_manager = scope->GetDomManager().lock();
      if (!dom_manager) {
        return;
      }
      auto entry = scope->GetPerformance()->PerformanceNavigation("hippyInit");
      entry->SetHippyRunApplicationEnd(dom_manager->GetDomStartTimePoint(root_id));
      entry->SetHippyDomStart(dom_manager->GetDomStartTimePoint(root_id));
      entry->SetHippyDomEnd(dom_manager->GetDomEndTimePoint(root_id));
      entry->SetHippyFirstFrameStart(dom_manager->GetDomEndTimePoint(root_id));
      entry->SetHippyFirstFrameEnd(footstone::TimePoint::FromEpochDelta(footstone::TimeDelta::FromMilliseconds(time)));
    };
    runner->PostTask(std::move(task));
  }
}

extern "C" void OnFirstContentfulPaintEndForView(uint32_t scope_id, int64_t time) {
  auto scope = GetScope(scope_id);
  if (!scope) {
    return;
  }
  auto runner = scope->GetEngine().lock()->GetJsTaskRunner();
  if (runner) {
    std::weak_ptr<Scope> weak_scope = scope;
    auto task = [weak_scope, time]() {
      auto scope = weak_scope.lock();
      if (!scope) {
        return;
      }
      auto entry = scope->GetPerformance()->PerformanceNavigation("hippyInit");
      entry->SetHippyFirstContentfulPaintEnd(footstone::TimePoint::FromEpochDelta(footstone::TimeDelta::FromMilliseconds(time)));
    };
    runner->PostTask(std::move(task));
  }
}

static napi_value OnResourceLoadEnd(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info);
  uint32_t scope_id = static_cast<uint32_t>(arkTs.GetInteger(args[0]));
  std::string uri_str = arkTs.GetString(args[1]);
  int64_t start_time = arkTs.GetInt64(args[2]);
  int64_t end_time = arkTs.GetInt64(args[3]);
  int32_t ret_code = static_cast<int32_t>(arkTs.GetInteger(args[4]));
  std::string error_msg_str = arkTs.GetString(args[5]);

  if (uri_str.empty()) {
    return arkTs.GetUndefined();
  }
  auto uri = string_view(uri_str);
  auto error_msg = string_view(error_msg_str);
  auto scope = GetScope(scope_id);
  if (!scope) {
    return arkTs.GetUndefined();
  }
  auto runner = scope->GetEngine().lock()->GetJsTaskRunner();
  if (runner) {
    std::weak_ptr<Scope> weak_scope = scope;
    auto task = [weak_scope, uri, start_time, end_time, ret_code, error_msg]() {
      auto scope = weak_scope.lock();
      if (scope) {
        auto entry = scope->GetPerformance()->PerformanceResource(uri);
        if (entry) {
          entry->SetLoadSourceStart(footstone::TimePoint::FromEpochDelta(footstone::TimeDelta::FromMilliseconds(start_time)));
          entry->SetLoadSourceEnd(footstone::TimePoint::FromEpochDelta(footstone::TimeDelta::FromMilliseconds(end_time)));
        }
        if (ret_code != 0) {
          scope->HandleUriLoaderError(uri, ret_code, error_msg);
        }
      }
    };
    runner->PostTask(std::move(task));
  }
  return arkTs.GetUndefined();
}

REGISTER_OH_NAPI("JsDriver", "JsDriver_CreateJsDriver", CreateJsDriver)
REGISTER_OH_NAPI("JsDriver", "JsDriver_DestroyJsDriver", DestroyJsDriver)
REGISTER_OH_NAPI("JsDriver", "JsDriver_LoadInstance", LoadInstance)
REGISTER_OH_NAPI("JsDriver", "JsDriver_UnloadInstance", UnloadInstance)
REGISTER_OH_NAPI("JsDriver", "JsDriver_RunScriptFromUri", RunScriptFromUri)
REGISTER_OH_NAPI("JsDriver", "JsDriver_SetRootNode", SetRootNode)
REGISTER_OH_NAPI("JsDriver", "JsDriver_OnNativeInitEnd", OnNativeInitEnd)
REGISTER_OH_NAPI("JsDriver", "JsDriver_OnResourceLoadEnd", OnResourceLoadEnd)

napi_value OhNapi_OnLoad(napi_env env, napi_value exports) {
  hippy::ExceptionHandler::Init(env);
  hippy::InitBridge(env);
  return exports;
}

REGISTER_OH_NAPI_ONLOAD(hippy::OhNapi_OnLoad)

}
}
}
}
