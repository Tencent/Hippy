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
#include "driver/runtime/v8/runtime.h"
#include "driver/runtime/v8/v8_bridge_utils.h"
#include "bridge_impl.h"
#include "dart2js.h"
#include "voltron_bridge.h"
#include "exception_handler.h"
#include "js2dart.h"
#include "devtools/vfs/devtools_handler.h"
#include "footstone/worker_manager.h"
#include "wrapper.h"
#include "data_holder.h"

using string_view = footstone::stringview::string_view;
using u8string = string_view::u8string;
using RegisterMap = hippy::base::RegisterMap;
using RegisterFunction = hippy::base::RegisterFunction;
using Ctx = hippy::napi::Ctx;
using HippyFile = hippy::vfs::HippyFile;
using V8VMInitParam = hippy::V8VMInitParam;
using voltron::VoltronBridge;
using V8BridgeUtils = hippy::runtime::V8BridgeUtils;
using StringViewUtils = footstone::StringViewUtils;

constexpr char kHippyCurDirKey[] = "__HIPPYCURDIR__";


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

  std::shared_ptr<V8VMInitParam> param = std::make_shared<V8VMInitParam>();
  if (initial_heap_size > 0 && maximum_heap_size > 0 && initial_heap_size >= maximum_heap_size) {
    param->initial_heap_size_in_bytes = static_cast<size_t>(initial_heap_size);
    param->maximum_heap_size_in_bytes = static_cast<size_t>(maximum_heap_size);
  }
  int64_t runtime_id = 0;
  RegisterFunction scope_cb = [runtime_id, outerCallback = callback](void *) {
    FOOTSTONE_LOG(INFO) << "run scope cb";
    outerCallback(runtime_id);
  };
  auto call_native_cb = [](hippy::CallbackInfo& info, void* data) {
    auto scope_wrapper = reinterpret_cast<hippy::ScopeWrapper*>(std::any_cast<void*>(info.GetSlot()));
    auto scope = scope_wrapper->scope.lock();
    FOOTSTONE_CHECK(scope);
    auto runtime_id = static_cast<int32_t>(reinterpret_cast<size_t>(data));
    voltron::bridge::CallDart(info, runtime_id);
  };
  V8BridgeUtils::SetOnThrowExceptionToJS([](const std::shared_ptr<hippy::Runtime> &runtime,
                                            const string_view &desc,
                                            const string_view &stack) {
    voltron::ExceptionHandler::ReportJsException(runtime, desc, stack);
  });
  std::shared_ptr<VoltronBridge> bridge = std::make_shared<VoltronBridge>(platform_runtime);
  string_view global_config = string_view(char_globalConfig);
  auto dom_manager = voltron::FindObject<std::shared_ptr<hippy::DomManager>>(dom_manager_id);
  FOOTSTONE_DCHECK(dom_manager);
  auto dom_task_runner = dom_manager->GetTaskRunner();
  runtime_id = V8BridgeUtils::InitInstance(
      true,
      static_cast<bool>(is_dev_module),
      global_config,
      static_cast<int32_t>(group_id),
      worker_manager,
      dom_task_runner,
      param,
      bridge,
      scope_cb,
      call_native_cb,
      devtools_id);
  return static_cast<int64_t>(runtime_id);
}

bool BridgeImpl::RunScriptFromUri(int64_t runtime_id, uint32_t vfs_id, bool can_use_code_cache, bool is_local_file, const char16_t* uri,
                                  const char16_t* code_cache_dir_str, std::function<void(int64_t)> callback) {
  FOOTSTONE_DLOG(INFO) << "runScriptFromUri begin, j_runtime_id = "
                       << runtime_id;
  std::shared_ptr<hippy::Runtime>
      runtime = hippy::Runtime::Find(footstone::check::checked_numeric_cast<int64_t, int32_t>(runtime_id));
  if (!runtime) {
    FOOTSTONE_DLOG(WARNING)
    << "BridgeImpl RunScriptFromFile, runtime_id invalid";
    return false;
  }

  auto time_begin = std::chrono::time_point_cast<std::chrono::microseconds>(
      std::chrono::system_clock::now())
      .time_since_epoch()
      .count();
  if (!uri) {
    FOOTSTONE_DLOG(WARNING) << "BridgeImpl runScriptFromUri, j_uri invalid";
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

  auto runner = runtime->GetEngine()->GetJsTaskRunner();
  auto ctx = runtime->GetScope()->GetContext();
  runner->PostTask([ctx, base_path] {
    auto key = ctx->CreateString(kHippyCurDirKey);
    auto value = ctx->CreateString(base_path);
    auto global = ctx->GetGlobalObject();
    ctx->SetProperty(global, key, value);
  });
  auto wrapper = voltron::VfsWrapper::GetWrapper(vfs_id);
  FOOTSTONE_CHECK(wrapper != nullptr);
  FOOTSTONE_CHECK(runtime->HasData(kBridgeSlot));
  runtime->GetScope()->SetUriLoader(wrapper->GetLoader());

#ifdef ENABLE_INSPECTOR
  auto devtools_data_source = runtime->GetDevtoolsDataSource();
  if (devtools_data_source) {
    auto network_notification = devtools_data_source->GetNotificationCenter()->network_notification;
    auto devtools_handler = std::make_shared<hippy::devtools::DevtoolsHandler>();
    devtools_handler->SetNetworkNotification(network_notification);
    wrapper->GetLoader()->RegisterUriInterceptor(devtools_handler);
  }
#endif
  auto func = [runtime, callback_ = std::move(callback), script_name,
      can_use_code_cache, is_local_file, code_cache_dir, uri_view,
      time_begin] {
    FOOTSTONE_DLOG(INFO) << "runScriptFromUri enter";
    bool flag = V8BridgeUtils::RunScript(runtime, script_name, can_use_code_cache,
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

void BridgeImpl::CallFunction(int64_t runtime_id, const char16_t *action, std::string params,
                              std::function<void(int64_t)> callback) {
  voltron::bridge::CallJSFunction(runtime_id,
                                  string_view(action),
                                  std::move(params),
                                  std::move(callback));
}

void BridgeImpl::Destroy(int64_t runtimeId,
                         const std::function<void(int64_t)> &callback, bool is_reload) {
  V8BridgeUtils::DestroyInstance(runtimeId, [callback](bool ret) {
    if (ret) {
      callback(0);
    } else {
      callback(-2);
    }
  }, is_reload);
}

void BridgeImpl::LoadInstance(int64_t runtime_id,
                              std::string &&buffer_data) {
  V8BridgeUtils::LoadInstance(footstone::check::checked_numeric_cast<int64_t, int32_t>(runtime_id),
                              std::move(buffer_data));
}

void BridgeImpl::UnloadInstance(int64_t runtime_id, byte_string &&buffer_data) {
  V8BridgeUtils::UnloadInstance(footstone::check::checked_numeric_cast<int64_t,
                                                                       int32_t>(runtime_id),
                                std::move(buffer_data));
}

std::shared_ptr<hippy::Scope> BridgeImpl::GetScope(int64_t runtime_id) {
  std::shared_ptr<hippy::Runtime>
      runtime = hippy::Runtime::Find(footstone::check::checked_numeric_cast<int64_t, int32_t>(runtime_id));
  if (!runtime) {
    FOOTSTONE_DLOG(WARNING) << "GetScope failed, runtime_id invalid";
    return nullptr;
  }
  return runtime->GetScope();
}
