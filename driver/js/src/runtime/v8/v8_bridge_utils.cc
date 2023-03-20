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

#include "driver/runtime/v8/v8_bridge_utils.h"

#include <sys/stat.h>

#include <any>
#include <functional>
#include <future>
#include <utility>

#include "driver/napi/callback_info.h"
#include "driver/napi/js_ctx.h"
#include "driver/napi/js_ctx_value.h"
#include "driver/napi/js_try_catch.h"
#include "driver/napi/callback_info.h"
#include "driver/scope.h"
#include "footstone/check.h"
#include "footstone/deserializer.h"
#include "footstone/hippy_value.h"
#include "footstone/logging.h"
#include "footstone/string_view_utils.h"
#include "footstone/task.h"
#include "footstone/task_runner.h"
#include "footstone/worker_impl.h"
#include "vfs/file.h"

#ifdef JS_V8
#include "driver/napi/v8/v8_ctx.h"
#include "driver/napi/v8/v8_ctx_value.h"
#include "driver/napi/v8/v8_try_catch.h"
#include "driver/vm/v8/v8_vm.h"
#include "driver/napi/v8/serializer.h"
#endif

namespace hippy {
inline namespace driver {
inline namespace runtime {

using byte_string = std::string;
using string_view = footstone::stringview::string_view;
using StringViewUtils = footstone::stringview::StringViewUtils;
using TaskRunner = footstone::runner::TaskRunner;
using WorkerManager = footstone::runner::WorkerManager;
using string_view = footstone::string_view;
using u8string = string_view::u8string;
using Ctx = hippy::Ctx;
using V8Ctx = hippy::V8Ctx;
using CtxValue = hippy::napi::CtxValue;
using Deserializer = footstone::value::Deserializer;
using HippyValue = footstone::value::HippyValue;
using HippyFile = hippy::vfs::HippyFile;
using RegisterMap = hippy::RegisterMap;
using RegisterFunction = hippy::RegisterFunction;
using V8VM = hippy::V8VM;
using ScopeWrapper = hippy::ScopeWrapper;
using CallbackInfo = hippy::CallbackInfo;

constexpr int64_t kDefaultGroupId = -1;
constexpr int64_t kDebuggerGroupId = -9999;
constexpr uint32_t kRuntimeSlotIndex = 0;
constexpr uint8_t kBridgeSlot = 1;

constexpr char kBridgeName[] = "hippyBridge";
constexpr char kWorkerRunnerName[] = "hippy_worker";
constexpr char kGlobalKey[] = "global";
constexpr char kHippyKey[] = "Hippy";
constexpr char kNativeGlobalKey[] = "__HIPPYNATIVEGLOBAL__";
constexpr char kCallNativesKey[] = "hippyCallNatives";

#if defined(ENABLE_INSPECTOR) && !defined(V8_WITHOUT_INSPECTOR)
using V8InspectorClientImpl = hippy::inspector::V8InspectorClientImpl;
#endif

static std::unordered_map<int64_t, std::pair<std::shared_ptr<Engine>, uint32_t>> reuse_engine_map;
static std::mutex engine_mutex;

std::function<void(std::shared_ptr<Runtime>,
                   string_view,
                   string_view)> V8BridgeUtils::on_throw_exception_to_js_ = [](
    const std::shared_ptr<Runtime>&,
    const string_view&,
    const string_view&) {};

int32_t V8BridgeUtils::InitInstance(bool enable_v8_serialization,
                                    bool is_dev_module,
                                    const string_view& global_config,
                                    int64_t group,
                                    const std::shared_ptr<WorkerManager>& worker_manager,
                                    const std::shared_ptr<TaskRunner>& task_runner,
                                    const std::shared_ptr<V8VMInitParam>& param,
                                    const std::any& bridge,
                                    const RegisterFunction& scope_cb,
                                    const JsCallback& call_native_cb,
                                    uint32_t devtools_id) {
  auto runtime = std::make_shared<Runtime>(enable_v8_serialization, is_dev_module);
  runtime->SetData(kBridgeSlot, std::move(bridge));
  int32_t runtime_id = runtime->GetId();
  Runtime::Insert(runtime);
  auto vm_cb = [runtime_id](void* vm) {
    V8VM* v8_vm = reinterpret_cast<V8VM*>(vm);
    v8::Isolate* isolate = v8_vm->isolate_;
    v8::HandleScope handle_scope(isolate);
    isolate->AddMessageListener(V8BridgeUtils::HandleUncaughtJsError);
    isolate->SetData(kRuntimeSlotIndex, reinterpret_cast<void*>(runtime_id));
#if defined(ENABLE_INSPECTOR) && !defined(V8_WITHOUT_INSPECTOR)
    std::shared_ptr<Runtime> runtime = Runtime::Find(runtime_id);
    if (runtime->IsDebug() && !runtime->GetEngine()->GetInspectorClient()) {
      auto inspector = std::make_shared<V8InspectorClientImpl>(runtime->GetEngine()->GetJsTaskRunner());
      runtime->GetEngine()->SetInspectorClient(inspector);
    }
#endif
  };

  std::unique_ptr<RegisterMap> engine_cb_map = std::make_unique<RegisterMap>();
  engine_cb_map->insert(std::make_pair(hippy::kVMCreateCBKey, vm_cb));

#if defined(ENABLE_INSPECTOR) && !defined(V8_WITHOUT_INSPECTOR)
  if (is_dev_module) {
    auto devtools_data_source = devtools::DevtoolsDataSource::Find(devtools_id);
    runtime->SetDevtoolsDataSource(devtools_data_source);
  }
#endif
  FOOTSTONE_LOG(INFO) << "global_config = " << global_config;
  auto context_cb = [runtime, global_config, runtime_id, call_native_cb](void* scopeWrapper) {
    FOOTSTONE_LOG(INFO) << "InitInstance register hippyCallNatives, runtime_id = " << runtime_id;
    FOOTSTONE_CHECK(scopeWrapper);
    auto* wrapper = reinterpret_cast<ScopeWrapper*>(scopeWrapper);
    FOOTSTONE_CHECK(wrapper);
    std::shared_ptr<Scope> scope = wrapper->scope.lock();
    if (!scope) {
      FOOTSTONE_DLOG(ERROR) << "register hippyCallNatives, scope error";
      return;
    }
#if defined(ENABLE_INSPECTOR) && !defined(V8_WITHOUT_INSPECTOR)
    if (runtime->IsDebug()) {
      auto inspector_client = runtime->GetEngine()->GetInspectorClient();
      if (inspector_client) {
        inspector_client->CreateInspector(scope);
        auto inspector_context = inspector_client->CreateInspectorContext(scope, runtime->GetDevtoolsDataSource());
        runtime->SetInspectorContext(inspector_context);
      }
    }
#endif
    auto ctx = scope->GetContext();
    auto global_object = ctx->GetGlobalObject();
    auto user_global_object_key = ctx->CreateString(kGlobalKey);
    ctx->SetProperty(global_object, user_global_object_key, global_object);
    auto hippy_key = ctx->CreateString(kHippyKey);
    ctx->SetProperty(global_object, hippy_key, ctx->CreateObject());
    scope->RegisterJsClasses();
    auto func_wrapper = std::make_unique<hippy::napi::FunctionWrapper>(call_native_cb,
                                                                       reinterpret_cast<void*>(runtime_id));
    auto native_func_cb = ctx->CreateFunction(func_wrapper);
    scope->SaveFunctionWrapper(std::move(func_wrapper));
    auto call_natives_key = ctx->CreateString(kCallNativesKey);
    ctx->SetProperty(global_object, call_natives_key, native_func_cb, hippy::napi::PropertyAttribute::ReadOnly);
    auto native_global_key = ctx->CreateString(kNativeGlobalKey);
    auto global_config_object = runtime->GetEngine()->GetVM()->ParseJson(ctx, global_config);
    auto flag = ctx->SetProperty(global_object, native_global_key, global_config_object);
    if (!flag) {
      FOOTSTONE_DLOG(ERROR) << "register HippyNativeGlobal failed";
      V8BridgeUtils::on_throw_exception_to_js_(runtime,
                                               u"global_config parse error",
                                               global_config);
    }
  };
  std::unique_ptr<RegisterMap> scope_cb_map = std::make_unique<RegisterMap>();
  scope_cb_map->insert(std::make_pair(hippy::kContextCreatedCBKey, context_cb));
  scope_cb_map->insert(std::make_pair(hippy::KScopeInitializedCBKey, scope_cb));
  std::unordered_map<int64_t, std::pair<std::shared_ptr<Engine>, uint32_t>>::iterator it;
  std::shared_ptr<Engine> engine = nullptr;
  if (is_dev_module) {
    group = kDebuggerGroupId;
  }
  {
    std::lock_guard<std::mutex> lock(engine_mutex);
    it = reuse_engine_map.find(group);
    if (it != reuse_engine_map.end()) {
      engine = std::get<std::shared_ptr<Engine>>(it->second);
      std::get<uint32_t>(it->second) += 1;
      std::shared_ptr<V8VM> v8_vm = std::static_pointer_cast<V8VM>(engine->GetVM());
      v8::Isolate* isolate = v8_vm->isolate_;
      if (is_dev_module) {
        isolate->SetData(kRuntimeSlotIndex, reinterpret_cast<void*>(runtime_id));
      } else {
        isolate->SetData(kRuntimeSlotIndex, reinterpret_cast<void*>(-1));
      }
      // -1 means single isolate multi-context mode
      FOOTSTONE_DLOG(INFO) << "engine cnt = " << std::get<uint32_t>(it->second)
                           << ", use_count = " << engine.use_count();
    }
  }
  if (!engine) {
    engine = std::make_shared<Engine>();
    if (group != kDefaultGroupId) {
      std::lock_guard<std::mutex> lock(engine_mutex);
      reuse_engine_map[group] = std::make_pair(engine, 1);
    }
  }
  runtime->SetEngine(engine);
  auto worker_runner = worker_manager->CreateTaskRunner(kWorkerRunnerName);
  engine->AsyncInit(task_runner, worker_runner, std::move(engine_cb_map), param);
  auto scope = engine->AsyncCreateScope("", std::move(scope_cb_map));
  runtime->SetScope(scope);
  FOOTSTONE_DLOG(INFO) << "group = " << group;
  runtime->SetGroupId(group);
  FOOTSTONE_LOG(INFO) << "InitInstance end, runtime_id = " << runtime_id;

#ifdef ENABLE_INSPECTOR
  if (is_dev_module) {
    scope->SetDevtoolsDataSource(runtime->GetDevtoolsDataSource());
#ifndef V8_WITHOUT_INSPECTOR
    scope->GetDevtoolsDataSource()->SetVmRequestHandler([runtime_id](std::string data) {
      std::shared_ptr<Runtime> runtime = Runtime::Find(runtime_id);
      if (!runtime) {
        FOOTSTONE_DLOG(FATAL) << "RunApp send_v8_func_ j_runtime_id invalid or not debugger";
        return;
      }
      auto inspector_client = runtime->GetEngine()->GetInspectorClient();
      if (inspector_client) {
        auto u16str = StringViewUtils::ConvertEncoding(string_view(data), string_view::Encoding::Utf16);
        inspector_client->SendMessageToV8(runtime->GetInspectorContext(), std::move(u16str));
      }
    });
  }
#endif
#endif

  return runtime_id;
}

bool V8BridgeUtils::RunScript(const std::shared_ptr<Runtime>& runtime,
                              const string_view& file_name,
                              bool is_use_code_cache,
                              const string_view& code_cache_dir,
                              const string_view& uri,
                              bool is_local_file) {
  return RunScriptWithoutLoader(
      runtime, file_name, is_use_code_cache, code_cache_dir, uri, is_local_file,
      [uri_ = uri, runtime_ = runtime]() {
        auto loader = runtime_->GetScope()->GetUriLoader().lock();
        if (loader) {
          UriLoader::RetCode code;
          std::unordered_map<std::string, std::string> meta;
          UriLoader::bytes content;
          loader->RequestUntrustedContent(uri_, {}, code, meta, content);
          return string_view::new_from_utf8(content.c_str(), content.length());
        }

        return string_view{};
      });
}

bool V8BridgeUtils::RunScriptWithoutLoader(const std::shared_ptr<Runtime>& runtime,
                                           const string_view& file_name,
                                           bool is_use_code_cache,
                                           const string_view& code_cache_dir,
                                           const string_view& uri,
                                           bool is_local_file,
                                           std::function<string_view()> content_cb) {
  FOOTSTONE_LOG(INFO) << "RunScript begin, file_name = " << file_name
                      << ", is_use_code_cache = " << is_use_code_cache
                      << ", code_cache_dir = " << code_cache_dir
                      << ", uri = " << uri
                      << ", is_local_file = " << is_local_file;
  string_view script_content;
  bool read_script_flag = false;
  string_view code_cache_content;
  uint64_t modify_time = 0;

  std::shared_ptr<TaskRunner> worker_runner;
  string_view code_cache_path;
  if (is_use_code_cache) {
    if (is_local_file) {
      modify_time = HippyFile::GetFileModifyTime(uri);
    }

    code_cache_path = code_cache_dir + file_name + string_view("_") +
        string_view(std::to_string(modify_time));

    std::promise<u8string> read_file_promise;
    std::future<u8string> read_file_future = read_file_promise.get_future();
    auto func = hippy::MakeCopyable([p = std::move(read_file_promise),
                                      code_cache_path, code_cache_dir]() mutable {
          u8string content;
          HippyFile::ReadFile(code_cache_path, content, true);
          if (content.empty()) {
            FOOTSTONE_DLOG(INFO) << "Read code cache failed";
            int ret = HippyFile::RmFullPath(code_cache_dir);
            FOOTSTONE_DLOG(INFO) << "RmFullPath ret = " << ret;
            FOOTSTONE_USE(ret);
          } else {
            FOOTSTONE_DLOG(INFO) << "Read code cache succ";
          }
          p.set_value(std::move(content));
        });

    auto engine = runtime->GetEngine();
    worker_runner = engine->GetWorkerTaskRunner();
    worker_runner->PostTask(std::move(func));
    script_content = content_cb();
    if (!StringViewUtils::IsEmpty(script_content)) {
      read_script_flag = true;
    }
    code_cache_content = read_file_future.get();
  } else {
    script_content = content_cb();
    if (!StringViewUtils::IsEmpty(script_content)) {
      read_script_flag = true;
    }
  }

  FOOTSTONE_DLOG(INFO) << "uri = " << uri
                       << "read_script_flag = " << read_script_flag
                       << ", script content = " << script_content;

  if (!read_script_flag || StringViewUtils::IsEmpty(script_content)) {
    FOOTSTONE_LOG(WARNING) << "read_script_flag = " << read_script_flag
                           << ", script content empty, uri = " << uri;
    return false;
  }

  auto ret = std::static_pointer_cast<hippy::napi::V8Ctx>(
      runtime->GetScope()->GetContext())->RunScript(script_content, file_name, is_use_code_cache,
                                                    &code_cache_content, true);
  if (is_use_code_cache) {
    if (!StringViewUtils::IsEmpty(code_cache_content)) {
      auto func = [code_cache_path, code_cache_dir, code_cache_content] {
        int check_dir_ret = HippyFile::CheckDir(code_cache_dir, F_OK);
        FOOTSTONE_DLOG(INFO) << "check_parent_dir_ret = " << check_dir_ret;
        if (check_dir_ret) {
          HippyFile::CreateDir(code_cache_dir, S_IRWXU);
        }

        size_t pos = StringViewUtils::FindLastOf(code_cache_path, EXTEND_LITERAL('/'));
        string_view code_cache_parent_dir = StringViewUtils::SubStr(code_cache_path, 0, pos);
        int check_parent_dir_ret = HippyFile::CheckDir(code_cache_parent_dir, F_OK);
        FOOTSTONE_DLOG(INFO) << "check_parent_dir_ret = " << check_parent_dir_ret;
        if (check_parent_dir_ret) {
          HippyFile::CreateDir(code_cache_parent_dir, S_IRWXU);
        }

        std::string u8_code_cache_content = StringViewUtils::ToStdString(StringViewUtils::ConvertEncoding(
            code_cache_content, string_view::Encoding::Utf8).utf8_value());
        bool save_file_ret = HippyFile::SaveFile(code_cache_path, u8_code_cache_content);
        FOOTSTONE_LOG(INFO) << "code cache save_file_ret = " << save_file_ret;
        FOOTSTONE_USE(save_file_ret);
      };
      worker_runner->PostTask(std::move(func));
    }
  }

  bool flag = (ret != nullptr);
  FOOTSTONE_LOG(INFO) << "runScript end, flag = " << flag;
  return flag;
}

void V8BridgeUtils::HandleUncaughtJsError(v8::Local<v8::Message> message,
                                          v8::Local<v8::Value> error) {
  FOOTSTONE_DLOG(INFO) << "HandleUncaughtJsError begin";

  if (error.IsEmpty()) {
    FOOTSTONE_DLOG(ERROR) << "HandleUncaughtJsError error is empty";
    return;
  }

  v8::Isolate* isolate = message->GetIsolate();
  std::shared_ptr<Runtime> runtime = Runtime::Find(isolate);
  if (!runtime) {
    return;
  }

  auto context = runtime->GetScope()->GetContext();
//  V8BridgeUtils::on_throw_exception_to_js_(runtime, ctx->GetMsgDesc(message),
//                                           ctx->GetStackInfo(message));
  VM::HandleUncaughtException(context, std::make_shared<hippy::napi::V8CtxValue>(isolate, error));

  FOOTSTONE_DLOG(INFO) << "HandleUncaughtJsError end";
}

void V8BridgeUtils::DestroyInstance(int64_t runtime_id, const std::function<void(bool)>& callback, bool is_reload) {
  FOOTSTONE_DLOG(INFO) << "DestroyInstance begin, runtime_id = " << runtime_id;
  std::shared_ptr<Runtime> runtime = Runtime::Find(
      footstone::check::checked_numeric_cast<int64_t, int32_t>(runtime_id));
  if (!runtime) {
    FOOTSTONE_DLOG(WARNING) << "HippyBridgeImpl destroy, runtime_id invalid";
    callback(false);
    return;
  }

  auto cb = [runtime, runtime_id, is_reload, callback] {
    FOOTSTONE_LOG(INFO) << "js destroy begin, runtime_id = " << runtime_id << ", is_reload = " << is_reload;
#if defined(ENABLE_INSPECTOR) && !defined(V8_WITHOUT_INSPECTOR)
    if (runtime->IsDebug()) {
      auto inspector_client = runtime->GetEngine()->GetInspectorClient();
      if (inspector_client) {
        auto inspector_context = runtime->GetInspectorContext();
        inspector_client->DestroyInspectorContext(is_reload, inspector_context);
      }
    } else {
      runtime->GetScope()->WillExit();
    }
#else
    runtime->GetScope()->WillExit();
#endif
    FOOTSTONE_LOG(INFO) << "SetScope nullptr";
    runtime->SetScope(nullptr);
    FOOTSTONE_LOG(INFO) << "erase runtime";
    Runtime::Erase(runtime);
    FOOTSTONE_LOG(INFO) << "js destroy end";
    callback(true);
  };
  int64_t group = runtime->GetGroupId();
  if (group == kDebuggerGroupId) {
    runtime->GetScope()->WillExit();
  }
  auto runner = runtime->GetEngine()->GetJsTaskRunner();
  runner->PostTask(std::move(cb));
  FOOTSTONE_DLOG(INFO) << "destroy, group = " << group;
  if ((group == kDebuggerGroupId && !is_reload) || (group != kDebuggerGroupId && group != kDefaultGroupId)) {
    std::lock_guard<std::mutex> lock(engine_mutex);
    auto it = reuse_engine_map.find(group);
    if (it != reuse_engine_map.end()) {
      auto engine = std::get<std::shared_ptr<Engine>>(it->second);
      uint32_t cnt = std::get<uint32_t>(it->second);
      FOOTSTONE_DLOG(INFO) << "reuse_engine_map cnt = " << cnt;
      if (cnt == 1) {
        reuse_engine_map.erase(it);
      } else {
        std::get<uint32_t>(it->second) = cnt - 1;
      }
    } else {
      FOOTSTONE_DLOG(FATAL) << "engine not find";
    }
  }
  FOOTSTONE_DLOG(INFO) << "destroy end";
}

void V8BridgeUtils::CallJs(const string_view& action,
                           int32_t runtime_id,
                           std::function<void(CALL_FUNCTION_CB_STATE, string_view)> cb,
                           byte_string buffer_data,
                           std::function<void()> on_js_runner) {
  FOOTSTONE_DLOG(INFO) << "CallJs runtime_id = " << runtime_id;
  std::shared_ptr<Runtime> runtime = Runtime::Find(runtime_id);
  if (!runtime) {
    FOOTSTONE_DLOG(WARNING) << "CallJs runtime_id invalid";
    return;
  }
  auto runner = runtime->GetEngine()->GetJsTaskRunner();
  auto callback = [runtime, cb = std::move(cb), action,
      buffer_data_ = std::move(buffer_data),
      on_js_runner = std::move(on_js_runner)] {
    on_js_runner();
    auto scope = runtime->GetScope();
    if (!scope) {
      FOOTSTONE_DLOG(WARNING) << "CallJs scope invalid";
      return;
    }
    auto context = scope->GetContext();
    if (!runtime->GetBridgeFunc()) {
      FOOTSTONE_DLOG(INFO) << "init bridge func";
      auto func_name = context->CreateString(kBridgeName);
      auto global_object = context->GetGlobalObject();
      auto fn = context->GetProperty(global_object, func_name);
      bool is_fn = context->IsFunction(fn);
      FOOTSTONE_DLOG(INFO) << "is_fn = " << is_fn;
      if (!is_fn) {
        cb(CALL_FUNCTION_CB_STATE::NO_METHOD_ERROR, u"hippyBridge not find");
        return;
      } else {
        runtime->SetBridgeFunc(fn);
      }
    }
    FOOTSTONE_DCHECK(action.encoding() == string_view::Encoding::Utf16);
    std::shared_ptr<CtxValue> action_value = context->CreateString(action);
    std::shared_ptr<CtxValue> params;
    if (runtime->IsEnableV8Serialization()) {
#ifdef JS_V8
      auto isolate = std::static_pointer_cast<V8VM>(runtime->GetEngine()->GetVM())->isolate_;
      v8::HandleScope handle_scope(isolate);
      auto ctx = std::static_pointer_cast<hippy::napi::V8Ctx>(
          runtime->GetScope()->GetContext())->context_persistent_.Get(isolate);
      hippy::napi::V8TryCatch try_catch(true, context);
      v8::ValueDeserializer deserializer(
          isolate, reinterpret_cast<const uint8_t*>(buffer_data_.c_str()),
          buffer_data_.length());
      FOOTSTONE_CHECK(deserializer.ReadHeader(ctx).FromMaybe(false));
      auto ret = deserializer.ReadValue(ctx);
      if (!ret.IsEmpty()) {
        params = std::make_shared<hippy::napi::V8CtxValue>(isolate, ret.ToLocalChecked());
      } else {
        string_view msg;
        if (try_catch.HasCaught()) {
          msg = try_catch.GetExceptionMsg();
        } else {
          msg = u"deserializer error";
        }
        cb(CALL_FUNCTION_CB_STATE::DESERIALIZER_FAILED, msg);
        return;
      }
#elif
#error runtime->IsEnableV8Serialization() must be false
#endif
    } else {
      std::u16string str(reinterpret_cast<const char16_t*>(&buffer_data_[0]),
                         buffer_data_.length() / sizeof(char16_t));
      string_view buf_str(std::move(str));
      FOOTSTONE_DLOG(INFO) << "action = " << action
                          << ", buf_str = " << buf_str;
      params = runtime->GetEngine()->GetVM()->ParseJson(context, buf_str);
    }
    if (!params) {
      params = context->CreateNull();
    }
    std::shared_ptr<CtxValue> argv[] = {action_value, params};
    context->CallFunction(runtime->GetBridgeFunc(), 2, argv);
    cb(CALL_FUNCTION_CB_STATE::SUCCESS, "");
  };

  runner->PostTask(std::move(callback));
}

void V8BridgeUtils::CallNative(hippy::napi::CallbackInfo& info, int32_t runtime_id, const std::function<void(
    std::shared_ptr<Runtime>,
    string_view,
    string_view,
    string_view,
    bool,
    byte_string)>& cb) {
  FOOTSTONE_DLOG(INFO) << "CallNative";
  std::shared_ptr<Runtime> runtime = Runtime::Find(runtime_id);
  if (!runtime) {
    return;
  }

  auto scope_wrapper = reinterpret_cast<ScopeWrapper*>(std::any_cast<void*>(info.GetSlot()));
  auto scope = scope_wrapper->scope.lock();
  FOOTSTONE_CHECK(scope);
  auto context = scope->GetContext();

  string_view module_name;
  if (info[0]) {
    if (!context->GetValueString(info[0], &module_name)) {
      info.GetExceptionValue()->Set(context,"module name error");
      return;
    }
    FOOTSTONE_DLOG(INFO) << "CallJava module_name = " << module_name;
  } else {
    info.GetExceptionValue()->Set(context, "info error");
    return;
  }

  string_view fn_name;
  if (info[1]) {
    if (!context->GetValueString(info[1], &fn_name)) {
      info.GetExceptionValue()->Set(context,"func name error");
      return;
    }
    FOOTSTONE_DLOG(INFO) << "CallJava fn_name = " << fn_name;
  } else {
    info.GetExceptionValue()->Set(context, "info error");
    return;
  }

  string_view cb_id_str;
  if (info[2]) {
    double cb_id;
    if (context->GetValueString(info[2], &cb_id_str)) {
      FOOTSTONE_DLOG(INFO) << "CallJava cb_id = " << cb_id_str;
    } else if (context->GetValueNumber(info[2], &cb_id)) {
      cb_id_str = std::to_string(cb_id);
      FOOTSTONE_DLOG(INFO) << "CallJava cb_id = " << cb_id_str;
    }
  }

  std::string buffer_data;
  if (info[3] && context->IsObject(info[3])) {
    if (runtime->IsEnableV8Serialization()) {
#ifdef JS_V8
      auto v8_ctx = std::static_pointer_cast<hippy::napi::V8Ctx>(context);
      buffer_data = v8_ctx->GetSerializationBuffer(info[3], runtime->GetBuffer());
#else
    #error runtime->IsEnableV8Serialization() must be false
#endif
    } else {
      string_view json;
      auto flag = context->GetValueJson(info[3], &json);
      FOOTSTONE_DCHECK(flag);
      FOOTSTONE_DLOG(INFO) << "CallJava json = " << json;
      buffer_data = StringViewUtils::ToStdString(
          StringViewUtils::ConvertEncoding(json, string_view::Encoding::Utf8).utf8_value());
    }
  }

  int32_t transfer_type = 0;
  if (info[4]) {
    context->GetValueNumber(info[4], &transfer_type);
  }
  cb(runtime, module_name, fn_name, cb_id_str, transfer_type != 0,  buffer_data);
}

void V8BridgeUtils::LoadInstance(int32_t runtime_id, byte_string&& buffer_data) {
  FOOTSTONE_DLOG(INFO) << "LoadInstance runtime_id = " << runtime_id;
  std::shared_ptr<Runtime> runtime = Runtime::Find(runtime_id);
  if (!runtime) {
    return;
  }

  auto runner = runtime->GetEngine()->GetJsTaskRunner();
  std::weak_ptr<Scope> weak_scope = runtime->GetScope();
  auto callback = [weak_scope, buffer_data_ = std::move(buffer_data)] {
    std::shared_ptr<Scope> scope = weak_scope.lock();
    if (!scope) {
      return;
    }
    Deserializer deserializer(
        reinterpret_cast<const uint8_t*>(buffer_data_.c_str()),
        buffer_data_.length());
    HippyValue value;
    deserializer.ReadHeader();
    auto ret = deserializer.ReadValue(value);
    if (ret) {
      scope->LoadInstance(std::make_shared<HippyValue>(std::move(value)));
    } else {
      scope->GetContext()->ThrowException("LoadInstance param error");
    }
  };
  runner->PostTask(std::move(callback));
}

void V8BridgeUtils::UnloadInstance(int32_t runtime_id, byte_string&& buffer_data) {
    FOOTSTONE_DLOG(INFO) << "UnloadInstance runtime_id = " << runtime_id;
    std::shared_ptr<Runtime> runtime = Runtime::Find(runtime_id);
    if (!runtime) {
        return;
    }

    auto runner = runtime->GetEngine()->GetJsTaskRunner();
    std::weak_ptr<Scope> weak_scope = runtime->GetScope();
    auto callback = [weak_scope, buffer_data_ = std::move(buffer_data)] {
        std::shared_ptr<Scope> scope = weak_scope.lock();
        if (!scope) {
            return;
        }
        Deserializer deserializer(
                reinterpret_cast<const uint8_t*>(buffer_data_.c_str()),
                buffer_data_.length());
        HippyValue value;
        deserializer.ReadHeader();
        auto ret = deserializer.ReadValue(value);
        if (ret) {
            scope->UnloadInstance(std::make_shared<HippyValue>(std::move(value)));
        } else {
            scope->GetContext()->ThrowException("UnloadInstance param error");
        }
    };
    runner->PostTask(std::move(callback));
}
}
}
}
