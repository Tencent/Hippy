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

using u8string = unicode_string_view::u8string;
using RegisterMap = hippy::base::RegisterMap;
using RegisterFunction = hippy::base::RegisterFunction;
using Ctx = hippy::napi::Ctx;
using HippyFile = hippy::base::HippyFile;
using V8VMInitParam = hippy::napi::V8VMInitParam;
using voltron::VoltronBridge;
using V8BridgeUtils = hippy::runtime::V8BridgeUtils;

constexpr char kHippyCurDirKey[] = "__HIPPYCURDIR__";

#ifdef V8_HAS_INSPECTOR
using V8InspectorClientImpl = hippy::inspector::V8InspectorClientImpl;
std::shared_ptr<V8InspectorClientImpl> global_inspector = nullptr;
#endif

static std::unordered_map<int64_t, std::pair<std::shared_ptr<Engine>, uint32_t>> reuse_engine_map;
static std::mutex engine_mutex;

int64_t BridgeImpl::InitJsEngine(const std::shared_ptr<PlatformRuntime> &platform_runtime,
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
  int32_t runtime_id = 0;
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
    ExceptionHandler::ReportJsException(runtime, desc, stack);
  });
  std::shared_ptr<VoltronBridge> bridge = std::make_shared<VoltronBridge>(platform_runtime);
  unicode_string_view global_config = CU16StringToStrView(char_globalConfig);
  runtime_id = V8BridgeUtils::InitInstance(
      true,
      static_cast<bool>(is_dev_module),
      global_config,
      group_id,
      param,
      bridge,
      scope_cb,
      call_native_cb);
  return static_cast<jlong>(runtime_id);
}

bool BridgeImpl::RunScript(int64_t runtime_id,
                           const unicode_string_view &script_content,
                           const unicode_string_view &script_name,
                           const unicode_string_view &script_path,
                           bool can_use_code_cache,
                           const unicode_string_view &code_cache_dir,
                           bool fromAssets) {
  TDF_BASE_LOG(INFO) << "RunScript begin, file_name = " << script_name << ", is_use_code_cache = "
                     << can_use_code_cache
                     << ", code_cache_dir = " << code_cache_dir;

  std::shared_ptr<Runtime> runtime = Runtime::Find(runtime_id);
  if (!runtime) {
    TDF_BASE_DLOG(WARNING) << "runScript runtime_id invalid";
    return false;
  }

  unicode_string_view code_cache_content;
  uint64_t modify_time = 0;

  std::shared_ptr<WorkerTaskRunner> task_runner;
  unicode_string_view code_cache_path;
  if (can_use_code_cache) {
    if (!fromAssets) {
      auto time1 =
          std::chrono::time_point_cast<std::chrono::microseconds>(std::chrono::system_clock::now())
              .time_since_epoch()
              .count();
      modify_time = HippyFile::GetFileModifytime(script_path);
      auto time2 =
          std::chrono::time_point_cast<std::chrono::microseconds>(std::chrono::system_clock::now())
              .time_since_epoch()
              .count();
      TDF_BASE_DLOG(INFO) << "GetFileModifyTime cost %lld microseconds" << time2 - time1;
    }

    code_cache_path =
        code_cache_dir + script_name + unicode_string_view("_")
            + unicode_string_view(std::to_string(modify_time));

    std::promise<u8string> read_file_promise;
    std::future<u8string> read_file_future = read_file_promise.get_future();
    std::unique_ptr<CommonTask> task = std::make_unique<CommonTask>();
    task->func_ =
        hippy::base::MakeCopyable([p =
        std::move(read_file_promise), code_cache_path, code_cache_dir]() mutable {
          u8string content;
          HippyFile::ReadFile(code_cache_path, content, true);
          if (content.empty()) {
            TDF_BASE_DLOG(INFO) << "Read code cache failed";
            int ret = HippyFile::RmFullPath(code_cache_dir);
            TDF_BASE_DLOG(INFO) << "RmFullPath ret = " << ret;
            HIPPY_USE(ret);
          } else {
            TDF_BASE_DLOG(INFO) << "Read code cache succ";
          }
          p.set_value(std::move(content));
        });

    std::shared_ptr<Engine> engine = runtime->GetEngine();
    task_runner = engine->GetWorkerTaskRunner();
    task_runner->PostTask(std::move(task));
    code_cache_content = read_file_future.get();
  }

  TDF_BASE_DLOG(INFO) << "uri = " << script_path << ", script content = " << script_content;

  if (StringViewUtils::IsEmpty(script_content)) {
    TDF_BASE_LOG(WARNING) << "script content empty, uri = " << script_path;
    return false;
  }

  auto ret = std::static_pointer_cast<hippy::napi::V8Ctx>(runtime->GetScope()->GetContext())
      ->RunScript(script_content, script_name, can_use_code_cache, &code_cache_content);

  if (can_use_code_cache) {
    if (!StringViewUtils::IsEmpty(code_cache_content)) {
      std::unique_ptr<CommonTask> task = std::make_unique<CommonTask>();
      task->func_ = [code_cache_path, code_cache_dir, code_cache_content] {
        int check_dir_ret = HippyFile::CheckDir(code_cache_dir, F_OK);
        TDF_BASE_DLOG(INFO) << "check_parent_dir_ret = " << check_dir_ret;
        if (check_dir_ret) {
          HippyFile::CreateDir(code_cache_dir, S_IRWXU);
        }

        size_t pos = StringViewUtils::FindLastOf(code_cache_path, EXTEND_LITERAL('/'));
        unicode_string_view
            code_cache_parent_dir = StringViewUtils::SubStr(code_cache_path, 0, pos);
        int check_parent_dir_ret = HippyFile::CheckDir(code_cache_parent_dir, F_OK);
        TDF_BASE_DLOG(INFO) << "check_parent_dir_ret = " << check_parent_dir_ret;
        if (check_parent_dir_ret) {
          HippyFile::CreateDir(code_cache_parent_dir, S_IRWXU);
        }

        std::string u8_code_cache_content = StringViewUtils::ToU8StdStr(code_cache_content);
        bool save_file_ret = HippyFile::SaveFile(code_cache_path, u8_code_cache_content);
        TDF_BASE_LOG(INFO) << "code cache save_file_ret = " << save_file_ret;
        HIPPY_USE(save_file_ret);
      };
      task_runner->PostTask(std::move(task));
    }
  }
  bool flag = !!ret;
  TDF_BASE_LOG(INFO) << "runScript end, flag = " << flag;
  return flag;
}

bool BridgeImpl::RunScriptFromFile(int64_t runtime_id,
                                   const char16_t *script_path_str,
                                   const char16_t *script_name_str,
                                   const char16_t *code_cache_dir_str,
                                   bool can_use_code_cache,
                                   std::function<void(int64_t)> callback) {
  TDF_BASE_DLOG(INFO) << "RunScriptFromFile begin, runtime_id = "
                      << runtime_id;
  std::shared_ptr<Runtime> runtime = Runtime::Find(runtime_id);
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
  unicode_string_view script_path = CU16StringToStrView(script_path_str);
  unicode_string_view script_name = CU16StringToStrView(script_name_str);
  unicode_string_view code_cache_dir = CU16StringToStrView(code_cache_dir_str);
  auto pos = StringViewUtils::FindLastOf(script_path, EXTEND_LITERAL('/'));
  size_t len = StringViewUtils::GetLength(script_path);
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
      time_begin] {
    TDF_BASE_DLOG(INFO) << "RunScriptFromFile enter";
    u8string content;
    HippyFile::ReadFile(script_path, content, false);
    unicode_string_view scrip_content = unicode_string_view(std::move(content));
    bool flag = V8BridgeUtils::RunScript(runtime, script_name, can_use_code_cache,
                                         code_cache_dir, uri, !(aasset_manager == nullptr));
    auto time_end = std::chrono::time_point_cast<std::chrono::microseconds>(
        std::chrono::system_clock::now())
        .time_since_epoch()
        .count();

    TDF_BASE_DLOG(INFO) << "runScriptFromUri = " << (time_end - time_begin) << ", uri = " << uri;
    if (flag) {
      hippy::bridge::CallJavaMethod(save_object_->GetObj(), INIT_CB_STATE::SUCCESS);
    } else {
      JNIEnv* j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
      jstring j_msg = JniUtils::StrViewToJString(j_env, u"run script error");
      CallJavaMethod(save_object_->GetObj(), INIT_CB_STATE::RUN_SCRIPT_ERROR, j_msg);
      j_env->DeleteLocalRef(j_msg);
    }
    return flag;
  };

  runner->PostTask(task);

  return true;


  // todo delete
  std::shared_ptr<Runtime> runtime = Runtime::Find(runtime_id);
  if (!runtime) {
    TDF_BASE_DLOG(WARNING) << "runScriptFromFile runtime_id invalid";
    return false;
  }

  unicode_string_view script_path = CU16StringToStrView(script_path_str);
  unicode_string_view script_name = CU16StringToStrView(script_name_str);
  unicode_string_view code_cache_dir = CU16StringToStrView(code_cache_dir_str);

  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
  task->callback = [runtime_id, script_path, script_name, code_cache_dir, can_use_code_cache,
      callBack_ = std::move(callback)] {
    u8string content;
    HippyFile::ReadFile(script_path, content, false);
    unicode_string_view scrip_content = unicode_string_view(std::move(content));

    bool flag =
        RunScript(runtime_id,
                  scrip_content,
                  script_name,
                  script_path,
                  can_use_code_cache,
                  code_cache_dir,
                  false);

    int64_t value = !flag ? 0 : 1;
    callBack_(value);
    return true;
  };
  runtime->GetEngine()->GetJSRunner()->PostTask(task);
  return true;
}

bool BridgeImpl::RunScriptFromAssets(int64_t runtime_id,
                                     bool can_use_code_cache,
                                     const char16_t *asset_name_str,
                                     const char16_t *code_cache_dir_str,
                                     std::function<void(int64_t)> callback,
                                     const char16_t *asset_content_str) {
  std::shared_ptr<Runtime> runtime = Runtime::Find(runtime_id);
  if (!runtime) {
    TDF_BASE_DLOG(WARNING) << "RunScriptFromAssets runtime_id invalid";
    return false;
  }

  unicode_string_view asset_name = CU16StringToStrView(asset_name_str);
  unicode_string_view code_cache_dir = CU16StringToStrView(code_cache_dir_str);
  unicode_string_view asset_content = CU16StringToStrView(asset_content_str);

  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
  task->callback =
      [runtime_id, callback_ = std::move(callback), asset_content, can_use_code_cache, asset_name,
          code_cache_dir] {
        bool flag = RunScript(runtime_id,
                              asset_content,
                              asset_name,
                              "",
                              can_use_code_cache,
                              code_cache_dir,
                              true);

        int64_t value = flag ? 1 : 0;
        callback_(value);
      };

  runtime->GetEngine()->GetJSRunner()->PostTask(task);
  return true;
}

void BridgeImpl::CallFunction(int64_t runtime_id, const char16_t *action, const char16_t *params,
                              std::function<void(int64_t)> callback) {
  voltron::bridge::CallJSFunction(runtime_id,
                                  CU16StringToStrView(action),
                                  CU16StringToStrView(params),
                                  std::move(callback));
}

void BridgeImpl::Destroy(int64_t runtimeId,
                         bool singleThreadMode,
                         std::function<void(int64_t)> callback) {
  TDF_BASE_DLOG(INFO) << "DestroyInstance begin, runtime_id = " << runtimeId;

  std::shared_ptr<Runtime> runtime = Runtime::Find(runtimeId);
  if (!runtime) {
    TDF_BASE_DLOG(WARNING) << "BridgeImpl Destroy, runtime_id invalid";
    return;
  }
  runtime->GetScope()->SetDomManager(nullptr);
  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
  task->callback = [runtime, runtimeId, callback_ = std::move(callback)] {
    TDF_BASE_LOG(INFO) << "js Destroy begin, runtime_id " << runtimeId;
#ifdef V8_HAS_INSPECTOR
    if (runtime->IsDebug()) {
      global_inspector->DestroyContext();
      global_inspector->Reset(nullptr, runtime->GetPlatformRuntime());
    } else {
      runtime->GetScope()->WillExit();
    }
#else
    runtime->GetScope()->WillExit();
#endif
    TDF_BASE_LOG(INFO) << "SetScope nullptr";
    runtime->SetScope(nullptr);
    TDF_BASE_LOG(INFO) << "erase runtime";
    Runtime::Erase(runtime);
    TDF_BASE_LOG(INFO) << "ReleaseKey";
    Runtime::ReleaseKey(runtimeId);
    TDF_BASE_LOG(INFO) << "js Destroy end";

    callback_(1);
  };

  int64_t group = runtime->GetGroupId();
  if (group == kDebuggerEngineId) {
    runtime->GetScope()->WillExit();
  }
  runtime->GetEngine()->GetJSRunner()->PostTask(task);
  TDF_BASE_DLOG(INFO) << "Destroy, group = " << group;
  if (group == kDebuggerEngineId) {
  } else if (group == kDefaultEngineId) {
    runtime->GetEngine()->TerminateRunner();
  } else {
    std::lock_guard<std::mutex> lock(engine_mutex);
    auto it = reuse_engine_map.find(group);
    if (it != reuse_engine_map.end()) {
      auto engine = std::get<std::shared_ptr<Engine>>(it->second);
      uint32_t cnt = std::get<uint32_t>(it->second);
      TDF_BASE_DLOG(INFO) << "reuse_engine_map cnt = " << cnt;
      if (cnt == 1) {
        reuse_engine_map.erase(it);
        engine->TerminateRunner();
      } else {
        std::get<uint32_t>(it->second) = cnt - 1;
      }
    } else {
      TDF_BASE_DLOG(FATAL) << "engine not find";
    }
  }
}

void BridgeImpl::BindDomManager(int64_t runtime_id,
                                const std::shared_ptr<DomManager> &dom_manager) {
  std::shared_ptr<Runtime> runtime = Runtime::Find(runtime_id);
  if (!runtime) {
    TDF_BASE_DLOG(WARNING) << "Bind dom Manager failed, runtime_id invalid";
    return;
  }
  runtime->GetScope()->SetDomManager(dom_manager);
  dom_manager->SetDelegateTaskRunner(runtime->GetScope()->GetTaskRunner());
}
