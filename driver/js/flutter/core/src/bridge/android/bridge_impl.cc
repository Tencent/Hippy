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

#include "core/runtime/v8/runtime.h"
#include "core/runtime/v8/v8_bridge_utils.h"
#include "bridge_impl.h"
#include "dart2js.h"
#include "voltron_bridge.h"
#include "exception_handler.h"
#include "js2dart.h"

using unicode_string_view = tdf::base::unicode_string_view;
using u8string = unicode_string_view::u8string;
using RegisterMap = hippy::base::RegisterMap;
using RegisterFunction = hippy::base::RegisterFunction;
using Ctx = hippy::napi::Ctx;
using HippyFile = hippy::base::HippyFile;
using V8VMInitParam = hippy::napi::V8VMInitParam;
using voltron::VoltronBridge;
using V8BridgeUtils = hippy::runtime::V8BridgeUtils;
using StringViewUtils = hippy::base::StringViewUtils;


constexpr char kHippyCurDirKey[] = "__HIPPYCURDIR__";

int64_t BridgeImpl::InitJsEngine(const std::shared_ptr<JSBridgeRuntime> &platform_runtime,
                                 bool single_thread_mode,
                                 bool bridge_param_json,
                                 bool is_dev_module,
                                 int64_t group_id,
                                 const char16_t *char_globalConfig,
                                 size_t initial_heap_size,
                                 size_t maximum_heap_size,
                                 const std::function<void(int64_t)> &callback) {
  TDF_BASE_LOG(INFO) << "InitInstance begin, single_thread_mode = "
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
    TDF_BASE_LOG(INFO) << "run scope cb";
    outerCallback(runtime_id);
  };
  auto call_native_cb = [](void* p) {
    auto* data = reinterpret_cast<hippy::napi::CBDataTuple*>(p);
    voltron::bridge::CallDart(data);
  };
  V8BridgeUtils::SetOnThrowExceptionToJS([](const std::shared_ptr<Runtime>& runtime,
                                            const unicode_string_view& desc,
                                            const unicode_string_view& stack) {
    voltron::ExceptionHandler::ReportJsException(runtime, desc, stack);
  });
  std::shared_ptr<VoltronBridge> bridge = std::make_shared<VoltronBridge>(platform_runtime);
  unicode_string_view global_config = unicode_string_view(char_globalConfig);
  runtime_id = V8BridgeUtils::InitInstance(
      true,
      static_cast<bool>(is_dev_module),
      global_config,
      static_cast<int32_t>(group_id),
      param,
      bridge,
      scope_cb,
      call_native_cb, unicode_string_view(""), unicode_string_view(""));
  return static_cast<int64_t>(runtime_id);
}

bool BridgeImpl::RunScriptFromFile(int64_t runtime_id,
                                   const char16_t *script_path_str,
                                   const char16_t *script_name_str,
                                   const char16_t *code_cache_dir_str,
                                   bool can_use_code_cache,
                                   std::function<void(int64_t)> callback) {
  TDF_BASE_DLOG(INFO) << "RunScriptFromFile begin, runtime_id = "
                      << runtime_id;
  std::shared_ptr<Runtime> runtime = Runtime::Find(static_cast<int32_t>(runtime_id));
  if (!runtime) {
    TDF_BASE_DLOG(WARNING)
    << "BridgeImpl RunScriptFromFile, runtime_id invalid";
    return false;
  }

  auto time_begin = std::chrono::time_point_cast<std::chrono::microseconds>(
      std::chrono::system_clock::now())
      .time_since_epoch()
      .count();
  if (!script_path_str) {
    TDF_BASE_DLOG(WARNING) << "HippyBridgeImpl runScriptFromUri, j_uri invalid";
    return false;
  }
  unicode_string_view script_path = unicode_string_view(script_path_str);
  unicode_string_view script_name = unicode_string_view(script_name_str);
  unicode_string_view code_cache_dir = unicode_string_view(code_cache_dir_str);
  auto pos = StringViewUtils::FindLastOf(script_path, EXTEND_LITERAL('/'));
  unicode_string_view base_path = StringViewUtils::SubStr(script_path, 0, pos + 1);

  TDF_BASE_DLOG(INFO) << "RunScriptFromFile path = " << script_path
                      << ", script_name = " << script_name
                      << ", base_path = " << base_path
                      << ", code_cache_dir = " << code_cache_dir;

  auto runner = runtime->GetEngine()->GetJSRunner();
  std::shared_ptr<Ctx> ctx = runtime->GetScope()->GetContext();
  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();

  task->callback = [ctx, base_path] {
    ctx->SetGlobalStrVar(kHippyCurDirKey, base_path);
  };
  runner->PostTask(task);

  task = std::make_shared<JavaScriptTask>();
  task->callback = [runtime, script_path, script_name,
      can_use_code_cache, code_cache_dir,
      time_begin, callBack_ = std::move(callback)] {
    TDF_BASE_DLOG(INFO) << "RunScriptFromFile enter";

    bool flag = V8BridgeUtils::RunScriptWithoutLoader(runtime,
                                                      script_name,
                                                      can_use_code_cache,
                                                      code_cache_dir,
                                                      script_path,
                                                      false,
                                                      [script_path]() {
                                                        u8string content;
                                                        HippyFile::ReadFile(script_path,
                                                                            content,
                                                                            false);
                                                        if (!content.empty()) {
                                                          return unicode_string_view(std::move(content));
                                                        } else {
                                                          return unicode_string_view{};
                                                        }
                                                      });
    auto time_end = std::chrono::time_point_cast<std::chrono::microseconds>(
        std::chrono::system_clock::now())
        .time_since_epoch()
        .count();

    TDF_BASE_DLOG(INFO) << "runScriptFromFile = " << (time_end - time_begin) << ", uri = " << script_path;
    int64_t value = !flag ? 0 : 1;
    callBack_(value);
    return flag;
  };

  runner->PostTask(task);

  return true;
}

bool BridgeImpl::RunScriptFromAssets(int64_t runtime_id,
                                     bool can_use_code_cache,
                                     const char16_t *asset_name_str,
                                     const char16_t *code_cache_dir_str,
                                     std::function<void(int64_t)> callback,
                                     const char16_t *asset_content_str) {
  TDF_BASE_DLOG(INFO) << "RunScriptFromFile begin, runtime_id = "
                      << runtime_id;
  std::shared_ptr<Runtime> runtime = Runtime::Find(static_cast<int32_t>(runtime_id));
  if (!runtime) {
    TDF_BASE_DLOG(WARNING)
    << "BridgeImpl RunScriptFromFile, runtime_id invalid";
    return false;
  }

  auto time_begin = std::chrono::time_point_cast<std::chrono::microseconds>(
      std::chrono::system_clock::now())
      .time_since_epoch()
      .count();
  unicode_string_view asset_name = unicode_string_view(asset_name_str);
  unicode_string_view code_cache_dir = unicode_string_view(code_cache_dir_str);
  unicode_string_view asset_content = unicode_string_view(asset_content_str);

  TDF_BASE_DLOG(INFO) << "RunScriptFromAssets asset_name = " << asset_name_str
                      << ", code_cache_dir = " << code_cache_dir;

  auto runner = runtime->GetEngine()->GetJSRunner();
  std::shared_ptr<Ctx> ctx = runtime->GetScope()->GetContext();
  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();

  task->callback = [runtime, asset_name,
      can_use_code_cache, code_cache_dir, asset_content,
      time_begin, callBack_ = std::move(callback)] {
    TDF_BASE_DLOG(INFO) << "RunScriptFromFile enter";

    bool flag = V8BridgeUtils::RunScriptWithoutLoader(runtime,
                                                      asset_name,
                                                      can_use_code_cache,
                                                      code_cache_dir,
                                                      asset_name,
                                                      false,
                                                      [asset_content]() {
                                                        return asset_content;
                                                      });

    auto time_end = std::chrono::time_point_cast<std::chrono::microseconds>(
        std::chrono::system_clock::now())
        .time_since_epoch()
        .count();

    TDF_BASE_DLOG(INFO)
    << "runScriptFromAsset = " << (time_end - time_begin) << ", asset_name = " << asset_name;
    int64_t value = !flag ? 0 : 1;
    callBack_(value);
    return flag;
  };

  runner->PostTask(task);

  return true;
}

void BridgeImpl::CallFunction(int64_t runtime_id, const char16_t *action, std::string params,
                              std::function<void(int64_t)> callback) {
  voltron::bridge::CallJSFunction(runtime_id,
                                  unicode_string_view(action),
                                  std::move(params),
                                  std::move(callback));
}

void BridgeImpl::Destroy(int64_t runtimeId,
                         const std::function<void(int64_t)>& callback) {
  V8BridgeUtils::DestroyInstance(runtimeId, []() {}, false);
  callback(1);
}

void BridgeImpl::BindDomManager(int64_t runtime_id,
                                const std::shared_ptr<DomManager> &dom_manager) {
  std::shared_ptr<Runtime> runtime = Runtime::Find(static_cast<int32_t>(runtime_id));
  if (!runtime) {
    TDF_BASE_DLOG(WARNING) << "Bind dom Manager failed, runtime_id invalid";
    return;
  }
  runtime->GetScope()->SetDomManager(dom_manager);
  dom_manager->SetDelegateTaskRunner(runtime->GetScope()->GetTaskRunner());
}
