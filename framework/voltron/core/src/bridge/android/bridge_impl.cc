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

#include <sys/stat.h>
#include <functional>
#include <future>
#include <utility>

#include "vfs/file.h"
#include "bridge_impl.h"
#include "dart2js.h"
#include "voltron_bridge.h"
#include "exception_handler.h"
#include "js2dart.h"
#include "devtools/vfs/devtools_handler.h"
#include "driver/js_driver_utils.h"
#include "footstone/worker_manager.h"
#include "wrapper.h"
#include "data_holder.h"

#ifdef JS_V8
#include "driver/vm/v8/v8_vm.h"
#endif

#ifdef ENABLE_INSPECTOR
#include "devtools/devtools_data_source.h"
#include "devtools/vfs/devtools_handler.h"
#endif

using string_view = footstone::stringview::string_view;
using u8string = string_view::u8string;
using RegisterMap = hippy::base::RegisterMap;
using RegisterFunction = hippy::base::RegisterFunction;
using Ctx = hippy::napi::Ctx;
using HippyFile = hippy::vfs::HippyFile;
using V8VMInitParam = hippy::V8VMInitParam;
using voltron::VoltronBridge;
using JsDriverUtils = hippy::driver::JsDriverUtils;
using StringViewUtils = footstone::StringViewUtils;

constexpr char kHippyCurDirKey[] = "__HIPPYCURDIR__";

#ifdef JS_V8
using V8VMInitParam = hippy::V8VMInitParam;
#endif

enum INIT_CB_STATE {
  DESTROY_ERROR = -2,
  RUN_SCRIPT_ERROR = -1,
  SUCCESS = 0,
};

static std::mutex holder_mutex;
static std::unordered_map<void*, std::shared_ptr<hippy::Engine>> engine_holder;

int64_t BridgeImpl::InitJsEngine(const std::shared_ptr<JSBridgeRuntime> &platform_runtime,
                                 bool single_thread_mode,
                                 bool bridge_param_json,
                                 bool is_dev_module,
                                 int64_t group_id,
                                 const std::unique_ptr<WorkerManager> &worker_manager,
                                 uint32_t dom_manager_id,
                                 const char16_t *char_globalConfig,
                                 size_t initial_heap_size,
                                 size_t maximum_heap_size,
                                 const std::function<void(int64_t)> &callback,
                                 uint32_t devtools_id) {
  FOOTSTONE_LOG(INFO) << "LoadInstance begin, single_thread_mode = "
                      << single_thread_mode
                      << ", bridge_param_json = "
                      << bridge_param_json
                      << ", is_dev_module = "
                      << is_dev_module
                      << ", group_id = " << group_id;
#ifdef JS_V8
  auto param = std::make_shared<V8VMInitParam>();
  if (initial_heap_size > 0 && maximum_heap_size > 0 && initial_heap_size >= maximum_heap_size) {
    param->initial_heap_size_in_bytes = static_cast<size_t>(initial_heap_size);
    param->maximum_heap_size_in_bytes = static_cast<size_t>(maximum_heap_size);
  }
  param->enable_v8_serialization =  static_cast<bool>(!bridge_param_json);
  param->is_debug = static_cast<bool>(is_dev_module);
#else
  auto param = std::make_shared<VMInitParam>();
#endif

#ifdef ENABLE_INSPECTOR
  if (param->is_debug) {
    auto devtools_data_source = hippy::devtools::DevtoolsDataSource::Find(devtools_id);
    param->devtools_data_source = devtools_data_source;
  }
#endif

  auto call_native_cb = [](hippy::CallbackInfo& info, void* data) {
    voltron::bridge::CallDart(info);
  };
  param->uncaught_exception_callback = ([](const std::any& bridge, const string_view& description, const string_view& stack) {
    voltron::ExceptionHandler::ReportJsException(bridge, description, stack);
  });

  string_view global_config = string_view(char_globalConfig);
  auto dom_manager = std::any_cast<std::shared_ptr<hippy::DomManager>>(voltron::FindObject(dom_manager_id));
  FOOTSTONE_DCHECK(dom_manager);
  auto dom_task_runner = dom_manager->GetTaskRunner();
  auto scope_id = voltron::GenId();

  std::shared_ptr<VoltronBridge> bridge = std::make_shared<VoltronBridge>(platform_runtime);
  auto scope_initialized_callback = [scope_id, bridge, dart_callback = callback](const std::shared_ptr<hippy::Scope>& scope) {
    scope->SetBridge(bridge);
    voltron::InsertObject(scope_id, scope);
    FOOTSTONE_LOG(INFO) << "run scope cb";
    dart_callback(scope_id);
  };

  auto engine = JsDriverUtils::CreateEngineAndAsyncInitialize(dom_task_runner, param, group_id);
  {
    std::lock_guard<std::mutex> lock(holder_mutex);
    engine_holder[engine.get()] = engine;
  }

  JsDriverUtils::InitInstance(
      engine,
      param,
      global_config,
      scope_initialized_callback,
      call_native_cb);
  return static_cast<int64_t>(scope_id);
}

bool BridgeImpl::RunScriptFromUri(int64_t scope_id, uint32_t vfs_id, bool can_use_code_cache, bool is_local_file, const char16_t* uri,
                                  const char16_t* code_cache_dir_str, std::function<void(int64_t)> callback) {
  auto time_begin = std::chrono::time_point_cast<std::chrono::microseconds>(
      std::chrono::system_clock::now())
      .time_since_epoch()
      .count();
  if (!uri) {
    FOOTSTONE_DLOG(WARNING) << "BridgeImpl runScriptFromUri, uri invalid";
    return false;
  }
  const string_view uri_view = string_view(uri);
  const string_view code_cache_dir = string_view(code_cache_dir_str);
  auto pos = StringViewUtils::FindLastOf(uri, EXTEND_LITERAL('/'));
  size_t len = StringViewUtils::GetLength(uri);
  string_view script_name = StringViewUtils::SubStr(uri, pos + 1, len);
  string_view base_path = StringViewUtils::SubStr(uri, 0, pos + 1);
  FOOTSTONE_DLOG(INFO) << "runScriptFromUri uri = " << uri_view
                       << ", script_name = " << script_name
                       << ", base_path = " << base_path
                       << ", code_cache_dir = " << code_cache_dir;

  auto scope = GetScope(scope_id);
  if (!scope) {
    FOOTSTONE_DLOG(WARNING) << "BridgeImpl runScriptFromUri, scope id invalid";
    return false;
  }

  auto runner = scope->GetTaskRunner();
  auto ctx = scope->GetContext();
  runner->PostTask([ctx, base_path] {
    auto key = ctx->CreateString(kHippyCurDirKey);
    auto value = ctx->CreateString(base_path);
    auto global = ctx->GetGlobalObject();
    ctx->SetProperty(global, key, value);
  });

  auto wrapper = voltron::VfsWrapper::GetWrapper(vfs_id);
  FOOTSTONE_CHECK(wrapper != nullptr);
  scope->SetUriLoader(wrapper->GetLoader());

  auto engine = scope->GetEngine().lock();
  FOOTSTONE_CHECK(engine);
#ifdef ENABLE_INSPECTOR
  auto devtools_data_source = scope->GetDevtoolsDataSource();
  if (devtools_data_source) {
    auto network_notification = devtools_data_source->GetNotificationCenter()->network_notification;
    auto devtools_handler = std::make_shared<hippy::devtools::DevtoolsHandler>();
    devtools_handler->SetNetworkNotification(network_notification);
    wrapper->GetLoader()->RegisterUriInterceptor(devtools_handler);
  }
#endif
  auto func = [scope, callback_ = std::move(callback), script_name,
      can_use_code_cache, is_local_file, code_cache_dir, uri_view,
      time_begin] {
    FOOTSTONE_DLOG(INFO) << "runScriptFromUri enter";
    bool flag = JsDriverUtils::RunScript(scope, script_name, can_use_code_cache,
                                         code_cache_dir, uri_view, is_local_file);
    auto time_end = std::chrono::time_point_cast<std::chrono::microseconds>(
        std::chrono::system_clock::now())
        .time_since_epoch()
        .count();

    FOOTSTONE_DLOG(INFO) << "runScriptFromUri time = " << (time_end - time_begin) << ", uri = " << uri_view;
    int64_t value = !flag ? 0 : 1;
    callback_(value);
    return flag;
  };

  runner->PostTask(std::move(func));

  return true;
}

void BridgeImpl::CallFunction(int64_t scope_id, const char16_t *action, std::string params,
                              std::function<void(int64_t)> callback) {
  voltron::bridge::CallJSFunction(scope_id,
                                  string_view(action),
                                  std::move(params),
                                  std::move(callback));
}

void BridgeImpl::Destroy(int64_t scope_id,
                         const std::function<void(int64_t)> &callback, bool is_reload) {
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

  voltron::EraseObject(footstone::checked_numeric_cast<
      int64_t,
      uint32_t>(scope_id));
  JsDriverUtils::DestroyInstance(std::move(engine), std::move(scope), [callback](bool ret) {
    if (ret) {
      callback(INIT_CB_STATE::SUCCESS);
    } else {
      callback(INIT_CB_STATE::DESTROY_ERROR);
    }
  }, is_reload);
  scope = nullptr;
}

void BridgeImpl::LoadInstance(int64_t scope_id,
                              std::string &&buffer_data) {
  auto scope = GetScope(scope_id);
  JsDriverUtils::LoadInstance(scope, std::move(buffer_data));
}

void BridgeImpl::UnloadInstance(int64_t scope_id, byte_string &&buffer_data) {
  auto scope = GetScope(scope_id);
  JsDriverUtils::UnloadInstance(scope, std::move(buffer_data));
}

std::shared_ptr<hippy::Scope> BridgeImpl::GetScope(int64_t scope_id) {
  auto scope =
      std::any_cast<std::shared_ptr<hippy::Scope>>(voltron::FindObject(footstone::checked_numeric_cast<
          int64_t,
          uint32_t>(scope_id)));
  FOOTSTONE_CHECK(scope);
  return scope;
}
