#include "core/runtime/v8/v8_bridge_utils.h"

#include <functional>
#include <future>
#include <utility>
#include <sys/stat.h>

#include "base/logging.h"
#include "core/base/file.h"
#include "core/base/string_view_utils.h"
#include "core/napi/v8/js_native_api_v8.h"
#include "core/napi/v8/serializer.h"
#include "devtools/devtools_macro.h"
#include "dom/deserializer.h"
#include "dom/dom_value.h"

namespace hippy::runtime {

using bytes = std::string;
using unicode_string_view = tdf::base::unicode_string_view;
using u8string = unicode_string_view::u8string;
using Ctx = hippy::napi::Ctx;
using CtxValue = hippy::napi::CtxValue;
using Deserializer = tdf::base::Deserializer;
using DomValue = tdf::base::DomValue;
using HippyFile = hippy::base::HippyFile;
using StringViewUtils = hippy::base::StringViewUtils;
using RegisterMap = hippy::base::RegisterMap;
using RegisterFunction = hippy::base::RegisterFunction;
using V8VM = hippy::napi::V8VM;

static const int64_t kDefaultEngineId = -1;
static const int64_t kDebuggerEngineId = -9999;
static const uint32_t kRuntimeSlotIndex = 0;

constexpr char kHippyBridgeName[] = "hippyBridge";
constexpr char kHippyNativeGlobalKey[] = "__HIPPYNATIVEGLOBAL__";
constexpr char kHippyCallNativeKey[] = "hippyCallNatives";

#if defined(ENABLE_INSPECTOR) && !defined(V8_WITHOUT_INSPECTOR)
using V8InspectorClientImpl = hippy::inspector::V8InspectorClientImpl;
std::shared_ptr<V8InspectorClientImpl> global_inspector = nullptr;
#endif

static std::unordered_map<int64_t, std::pair<std::shared_ptr<Engine>, uint32_t>>
    reuse_engine_map;
static std::mutex engine_mutex;

std::function<void(std::shared_ptr<Runtime>,
                   unicode_string_view,
                   unicode_string_view)> V8BridgeUtils::on_throw_exception_to_js_ = [](
    const std::shared_ptr<Runtime>&,
    const unicode_string_view&,
    const unicode_string_view&) {};

int64_t V8BridgeUtils::InitInstance(bool enable_v8_serialization,
                                    bool is_dev_module,
                                    const unicode_string_view& global_config,
                                    int64_t group,
                                    const std::shared_ptr<V8VMInitParam>& param,
                                    std::shared_ptr<Bridge> bridge,
                                    const RegisterFunction& scope_cb,
                                    const RegisterFunction& call_native_cb,
                                    const unicode_string_view& data_dir,
                                    const unicode_string_view& ws_url) {
  std::shared_ptr<Runtime> runtime = std::make_shared<Runtime>(enable_v8_serialization,
                                                               is_dev_module);
  runtime->SetBridge(std::move(bridge));
  int32_t runtime_id = runtime->GetId();
  Runtime::Insert(runtime);
  RegisterFunction vm_cb = [runtime_id](void* vm) {
    V8VM* v8_vm = reinterpret_cast<V8VM*>(vm);
    v8::Isolate* isolate = v8_vm->isolate_;
    v8::HandleScope handle_scope(isolate);
    isolate->AddMessageListener(V8BridgeUtils::HandleUncaughtJsError);
    isolate->SetData(kRuntimeSlotIndex, reinterpret_cast<void*>(runtime_id));
  };

  std::unique_ptr<RegisterMap> engine_cb_map = std::make_unique<RegisterMap>();
  engine_cb_map->insert(std::make_pair(hippy::base::kVMCreateCBKey, vm_cb));

  TDF_BASE_LOG(INFO) << "global_config = " << global_config;
  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();

  RegisterFunction context_cb = [runtime, global_config,
      runtime_id, call_native_cb](void* scopeWrapper) {
    TDF_BASE_LOG(INFO) << "InitInstance register hippyCallNatives, runtime_id = " << runtime_id;
    TDF_BASE_CHECK(scopeWrapper);
    auto* wrapper = reinterpret_cast<ScopeWrapper*>(scopeWrapper);
    TDF_BASE_CHECK(wrapper);
    std::shared_ptr<Scope> scope = wrapper->scope_.lock();
    if (!scope) {
      TDF_BASE_DLOG(ERROR) << "register hippyCallNatives, scope error";
      return;
    }
#if defined(ENABLE_INSPECTOR) && !defined(V8_WITHOUT_INSPECTOR)
    if (runtime->IsDebug()) {
      if (!global_inspector) {
        global_inspector = std::make_shared<V8InspectorClientImpl>(scope);
        global_inspector->Connect(runtime->GetBridge());
      } else {
        global_inspector->Reset(scope, runtime->GetBridge());
      }
      global_inspector->CreateContext();
    }
#endif
    std::shared_ptr<Ctx> ctx = scope->GetContext();
    ctx->RegisterGlobalInJs();
    ctx->RegisterClasses(scope);
    ctx->RegisterNativeBinding(kHippyCallNativeKey,
                               call_native_cb,
                               reinterpret_cast<void*>(runtime_id));
    bool ret = ctx->SetGlobalJsonVar(kHippyNativeGlobalKey, global_config);
    if (!ret) {
      TDF_BASE_DLOG(ERROR) << "register HippyNativeGlobal failed";
      V8BridgeUtils::on_throw_exception_to_js_(runtime,
                                               u"global_config parse error",
                                               global_config);
    }
  };
  std::unique_ptr<RegisterMap> scope_cb_map = std::make_unique<RegisterMap>();
  scope_cb_map->insert(std::make_pair(hippy::base::kContextCreatedCBKey, context_cb));
  scope_cb_map->insert(std::make_pair(hippy::base::KScopeInitializedCBKey, scope_cb));
  std::shared_ptr<Engine> engine;
  if (is_dev_module) {
    std::lock_guard<std::mutex> lock(engine_mutex);
    TDF_BASE_DLOG(INFO) << "debug mode";
    group = kDebuggerEngineId;
    auto it = reuse_engine_map.find(group);
    if (it != reuse_engine_map.end()) {
      engine = std::get<std::shared_ptr<Engine>>(it->second);
      runtime->SetEngine(engine);

      std::shared_ptr<V8VM> v8_vm = std::static_pointer_cast<V8VM>(engine->GetVM());
      v8::Isolate* isolate = v8_vm->isolate_;
      isolate->SetData(kRuntimeSlotIndex, reinterpret_cast<void*>(runtime_id));
    } else {
      engine = std::make_shared<Engine>(std::move(engine_cb_map), param);
      runtime->SetEngine(engine);
      reuse_engine_map[group] = std::make_pair(engine, 1);
    }
  } else if (group != kDefaultEngineId) {
    std::lock_guard<std::mutex> lock(engine_mutex);
    auto it = reuse_engine_map.find(group);
    if (it != reuse_engine_map.end()) {
      TDF_BASE_DLOG(INFO) << "engine reuse";
      engine = std::get<std::shared_ptr<Engine>>(it->second);
      runtime->SetEngine(engine);
      std::get<uint32_t>(it->second) += 1;
      std::shared_ptr<V8VM> v8_vm = std::static_pointer_cast<V8VM>(engine->GetVM());
      v8::Isolate* isolate = v8_vm->isolate_;
      isolate->SetData(kRuntimeSlotIndex, reinterpret_cast<void*>(-1));
      // -1 means single isolate multi-context mode
      TDF_BASE_DLOG(INFO) << "engine cnt = " << std::get<uint32_t>(it->second)
                          << ", use_count = " << engine.use_count();
    } else {
      TDF_BASE_DLOG(INFO) << "engine create";
      engine = std::make_shared<Engine>(std::move(engine_cb_map), param);
      runtime->SetEngine(engine);
      reuse_engine_map[group] = std::make_pair(engine, 1);
    }
  } else {  // kDefaultEngineId
    TDF_BASE_DLOG(INFO) << "default create engine";
    engine = std::make_shared<Engine>(std::move(engine_cb_map), param);
    runtime->SetEngine(engine);
  }
  auto scope = runtime->GetEngine()->CreateScope("", std::move(scope_cb_map));
  runtime->SetScope(scope);
  TDF_BASE_DLOG(INFO) << "group = " << group;
  runtime->SetGroupId(group);
  TDF_BASE_LOG(INFO) << "InitInstance end, runtime_id = " << runtime_id;

#ifdef ENABLE_INSPECTOR
  DEVTOOLS_INIT_VM_TRACING_CACHE(StringViewUtils::ToU8StdStr(data_dir));
  auto devtools_data_source = std::make_shared<hippy::devtools::DevtoolsDataSource>(StringViewUtils::ToU8StdStr(ws_url));
  devtools_data_source->SetRuntimeDebugMode(is_dev_module);
  scope->SetDevtoolsDataSource(devtools_data_source);
#ifndef V8_WITHOUT_INSPECTOR
  scope->GetDevtoolsDataSource()->SetVmRequestHandler([runtime_id](std::string data) {
    std::shared_ptr<Runtime> runtime = Runtime::Find(runtime_id);
    if (!runtime || !runtime->IsDebug()) {
      TDF_BASE_DLOG(FATAL) << "RunApp send_v8_func_ j_runtime_id invalid or not debugger";
      return;
    }
    std::shared_ptr<JavaScriptTaskRunner> runner = runtime->GetEngine()->GetJSRunner();
    std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
    task->callback = [runtime, data] {
      // convert to utf-16 for v8, otherwise utf-8 like some protocol Runtime.enable which cause error "message must be a valid JSON"
      auto u16str = StringViewUtils::Convert(unicode_string_view(data), unicode_string_view::Encoding::Utf16);
      global_inspector->SendMessageToV8(u16str);
    };
    runner->PostTask(task);
  });
#endif
#endif

  return runtime_id;
}

bool V8BridgeUtils::RunScript(const std::shared_ptr<Runtime>& runtime,
                              const unicode_string_view& file_name,
                              bool is_use_code_cache,
                              const unicode_string_view& code_cache_dir,
                              const unicode_string_view& uri,
                              bool is_local_file) {
  return RunScriptWithoutLoader(
      runtime, file_name, is_use_code_cache, code_cache_dir, uri, is_local_file,
      [uri_ = uri, runtime_ = runtime]() {
        u8string content;
        auto loader = runtime_->GetScope()->GetUriLoader();
        if (loader) {
          bool flag =
              loader->RequestUntrustedContent(
                  uri_, content);
          if (flag) {
            return unicode_string_view(std::move(content));
          }
        }

        return unicode_string_view{};
      });
}

bool V8BridgeUtils::RunScriptWithoutLoader(const std::shared_ptr<Runtime>& runtime,
                                           const unicode_string_view& file_name,
                                           bool is_use_code_cache,
                                           const unicode_string_view& code_cache_dir,
                                           const unicode_string_view& uri,
                                           bool is_local_file,
                                           std::function<unicode_string_view()> content_cb) {
  TDF_BASE_LOG(INFO) << "RunScript begin, file_name = " << file_name
                     << ", is_use_code_cache = " << is_use_code_cache
                     << ", code_cache_dir = " << code_cache_dir
                     << ", uri = " << uri
                     << ", is_local_file = " << is_local_file;
  unicode_string_view script_content;
  bool read_script_flag = false;
  unicode_string_view code_cache_content;
  uint64_t modify_time = 0;

  std::shared_ptr<WorkerTaskRunner> task_runner;
  unicode_string_view code_cache_path;
  if (is_use_code_cache) {
    if (is_local_file) {
      modify_time = hippy::base::HippyFile::GetFileModifytime(uri);
    }

    code_cache_path = code_cache_dir + file_name + unicode_string_view("_") +
        unicode_string_view(std::to_string(modify_time));

    std::promise<u8string> read_file_promise;
    std::future<u8string> read_file_future = read_file_promise.get_future();
    std::unique_ptr<CommonTask> task = std::make_unique<CommonTask>();
    task->func_ =
        hippy::base::MakeCopyable([p = std::move(read_file_promise),
                                      code_cache_path, code_cache_dir]() mutable {
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

  TDF_BASE_DLOG(INFO) << "uri = " << uri
                      << "read_script_flag = " << read_script_flag
                      << ", script content = " << script_content;

  if (!read_script_flag || StringViewUtils::IsEmpty(script_content)) {
    TDF_BASE_LOG(WARNING) << "read_script_flag = " << read_script_flag
                          << ", script content empty, uri = " << uri;
    return false;
  }

  auto ret = std::static_pointer_cast<hippy::napi::V8Ctx>(
      runtime->GetScope()->GetContext())->RunScript(script_content, file_name, is_use_code_cache,
                                                    &code_cache_content, true);
  if (is_use_code_cache) {
    if (!StringViewUtils::IsEmpty(code_cache_content)) {
      std::unique_ptr<CommonTask> task = std::make_unique<CommonTask>();
      task->func_ = [code_cache_path, code_cache_dir, code_cache_content] {
        int check_dir_ret = HippyFile::CheckDir(code_cache_dir, F_OK);
        TDF_BASE_DLOG(INFO) << "check_parent_dir_ret = " << check_dir_ret;
        if (check_dir_ret) {
          HippyFile::CreateDir(code_cache_dir, S_IRWXU);
        }

        size_t pos =
            StringViewUtils::FindLastOf(code_cache_path, EXTEND_LITERAL('/'));
        unicode_string_view code_cache_parent_dir =
            StringViewUtils::SubStr(code_cache_path, 0, pos);
        int check_parent_dir_ret =
            HippyFile::CheckDir(code_cache_parent_dir, F_OK);
        TDF_BASE_DLOG(INFO) << "check_parent_dir_ret = " << check_parent_dir_ret;
        if (check_parent_dir_ret) {
          HippyFile::CreateDir(code_cache_parent_dir, S_IRWXU);
        }

        std::string u8_code_cache_content =
            StringViewUtils::ToU8StdStr(code_cache_content);
        bool save_file_ret =
            HippyFile::SaveFile(code_cache_path, u8_code_cache_content);
        TDF_BASE_LOG(INFO) << "code cache save_file_ret = " << save_file_ret;
        HIPPY_USE(save_file_ret);
      };
      task_runner->PostTask(std::move(task));
    }
  }

  bool flag = (ret != nullptr);
  TDF_BASE_LOG(INFO) << "runScript end, flag = " << flag;
  return flag;
}

void V8BridgeUtils::HandleUncaughtJsError(v8::Local<v8::Message> message,
                                          v8::Local<v8::Value> error) {
  TDF_BASE_DLOG(INFO) << "HandleUncaughtJsError begin";

  if (error.IsEmpty()) {
    TDF_BASE_DLOG(ERROR) << "HandleUncaughtJsError error is empty";
    return;
  }

  v8::Isolate* isolate = message->GetIsolate();
  std::shared_ptr<Runtime> runtime = Runtime::Find(isolate);
  if (!runtime) {
    return;
  }

  std::shared_ptr<hippy::napi::V8Ctx> ctx =
      std::static_pointer_cast<hippy::napi::V8Ctx>(
          runtime->GetScope()->GetContext());
  TDF_BASE_LOG(ERROR) << "HandleUncaughtJsError error desc = "
                      << ctx->GetMsgDesc(message)
                      << ", stack = " << ctx->GetStackInfo(message);
  V8BridgeUtils::on_throw_exception_to_js_(runtime, ctx->GetMsgDesc(message),
                                           ctx->GetStackInfo(message));
  ctx->HandleUncaughtException(std::make_shared<hippy::napi::V8CtxValue>(isolate, error));

  TDF_BASE_DLOG(INFO) << "HandleUncaughtJsError end";
}

bool V8BridgeUtils::DestroyInstance(int64_t runtime_id, const std::function<void()>& callback, bool is_reload) {
  TDF_BASE_DLOG(INFO) << "DestroyInstance begin, runtime_id = " << runtime_id;
  std::shared_ptr<Runtime> runtime = Runtime::Find(
      hippy::base::checked_numeric_cast<int64_t, int32_t>(runtime_id));
  if (!runtime) {
    TDF_BASE_DLOG(WARNING) << "HippyBridgeImpl destroy, runtime_id invalid";
    return false;
  }

  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
  task->callback = [runtime, runtime_id, is_reload] {
    TDF_BASE_LOG(INFO) << "js destroy begin, runtime_id " << runtime_id << "is_reload" << is_reload;
#if defined(ENABLE_INSPECTOR) && !defined(V8_WITHOUT_INSPECTOR)
    if (runtime->IsDebug()) {
      global_inspector->DestroyContext();
      global_inspector->Reset(nullptr, runtime->GetBridge());
    } else {
      runtime->GetScope()->WillExit();
    }
#else
    runtime->GetScope()->WillExit();
#endif
#ifdef ENABLE_INSPECTOR
    runtime->GetScope()->GetDevtoolsDataSource()->Destroy(is_reload);
#endif
    TDF_BASE_LOG(INFO) << "SetScope nullptr";
    runtime->SetScope(nullptr);
    TDF_BASE_LOG(INFO) << "erase runtime";
    Runtime::Erase(runtime);
    TDF_BASE_LOG(INFO) << "js destroy end";
  };
  int64_t group = runtime->GetGroupId();
  if (group == kDebuggerEngineId) {
    runtime->GetScope()->WillExit();
  }
  auto runner = runtime->GetEngine()->GetJSRunner();
  runner->PostTask(task);
  TDF_BASE_DLOG(INFO) << "destroy, group = " << group;
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
        auto detach_task = std::make_shared<JavaScriptTask>();
        detach_task->callback = [callback] {
          callback();
        };
        runner->PostTask(detach_task);
        engine->TerminateRunner();
      } else {
        std::get<uint32_t>(it->second) = cnt - 1;
      }
    } else {
      TDF_BASE_DLOG(FATAL) << "engine not find";
    }
  }
  TDF_BASE_DLOG(INFO) << "destroy end";
  return true;
}

void V8BridgeUtils::CallJs(const unicode_string_view& action,
                           int32_t runtime_id,
                           std::function<void(CALL_FUNCTION_CB_STATE, unicode_string_view)> cb,
                           bytes buffer_data,
                           std::function<void()> on_js_runner) {
  TDF_BASE_DLOG(INFO) << "CallJs runtime_id = " << runtime_id;
  std::shared_ptr<Runtime> runtime = Runtime::Find(runtime_id);
  if (!runtime) {
    TDF_BASE_DLOG(WARNING) << "CallJs runtime_id invalid";
    return;
  }
  std::shared_ptr<JavaScriptTaskRunner> runner = runtime->GetEngine()->GetJSRunner();
  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
  task->callback = [runtime, cb = std::move(cb), action,
      buffer_data_ = std::move(buffer_data),
      on_js_runner = std::move(on_js_runner)] {
    on_js_runner();
    std::shared_ptr<Scope> scope = runtime->GetScope();
    if (!scope) {
      TDF_BASE_DLOG(WARNING) << "CallJs scope invalid";
      return;
    }
    std::shared_ptr<Ctx> context = scope->GetContext();
    if (!runtime->GetBridgeFunc()) {
      TDF_BASE_DLOG(INFO) << "init bridge func";
      unicode_string_view name(kHippyBridgeName);
      std::shared_ptr<CtxValue> fn = context->GetJsFn(name);
      bool is_fn = context->IsFunction(fn);
      TDF_BASE_DLOG(INFO) << "is_fn = " << is_fn;

      if (!is_fn) {
        cb(CALL_FUNCTION_CB_STATE::NO_METHOD_ERROR, u"hippyBridge not find");
        return;
      } else {
        runtime->SetBridgeFunc(fn);
      }
    }
    TDF_BASE_DCHECK(action.encoding() ==
        unicode_string_view::Encoding::Utf16);
    if (runtime->IsDebug() &&
        action.utf16_value() == u"onWebsocketMsg") {
#if defined(ENABLE_INSPECTOR) && !defined(V8_WITHOUT_INSPECTOR)
      std::u16string str(reinterpret_cast<const char16_t*>(&buffer_data_[0]),
                         buffer_data_.length() / sizeof(char16_t));
      runtime::global_inspector->SendMessageToV8(
          unicode_string_view(std::move(str)));
#endif
      cb(CALL_FUNCTION_CB_STATE::SUCCESS, "");
      return;
    }

    std::shared_ptr<CtxValue> action_value = context->CreateString(action);
    std::shared_ptr<CtxValue> params;
    if (runtime->IsEnableV8Serialization()) {
      v8::Isolate* isolate = std::static_pointer_cast<hippy::napi::V8VM>(
          runtime->GetEngine()->GetVM())->isolate_;
      v8::HandleScope handle_scope(isolate);
      v8::Local<v8::Context> ctx = std::static_pointer_cast<hippy::napi::V8Ctx>(
          runtime->GetScope()->GetContext())->context_persistent_.Get(isolate);
      hippy::napi::V8TryCatch try_catch(true, context);
      v8::ValueDeserializer deserializer(
          isolate, reinterpret_cast<const uint8_t*>(buffer_data_.c_str()),
          buffer_data_.length());
      TDF_BASE_CHECK(deserializer.ReadHeader(ctx).FromMaybe(false));
      v8::MaybeLocal<v8::Value> ret = deserializer.ReadValue(ctx);
      if (!ret.IsEmpty()) {
        params = std::make_shared<hippy::napi::V8CtxValue>(
            isolate, ret.ToLocalChecked());
      } else {
        unicode_string_view msg;
        if (try_catch.HasCaught()) {
          msg = try_catch.GetExceptionMsg();
        } else {
          msg = u"deserializer error";
        }
        cb(CALL_FUNCTION_CB_STATE::DESERIALIZER_FAILED, msg);
        return;
      }
    } else {
      std::u16string str(reinterpret_cast<const char16_t*>(&buffer_data_[0]),
                         buffer_data_.length() / sizeof(char16_t));
      unicode_string_view buf_str(std::move(str));
      TDF_BASE_DLOG(INFO) << "action = " << action
                          << ", buf_str = " << buf_str;
      params = context->ParseJson(buf_str);
    }
    if (!params) {
      params = context->CreateNull();
    }
    std::shared_ptr<CtxValue> argv[] = {action_value, params};
    context->CallFunction(runtime->GetBridgeFunc(), 2, argv);
    cb(CALL_FUNCTION_CB_STATE::SUCCESS, "");
  };

  runner->PostTask(task);
}

void V8BridgeUtils::CallNative(hippy::napi::CBDataTuple* data, const std::function<void(
    std::shared_ptr<Runtime>,
    unicode_string_view,
    unicode_string_view,
    unicode_string_view,
    bool,
    bytes)>& cb) {
  TDF_BASE_DLOG(INFO) << "CallNative";
  auto runtime_id = static_cast<int32_t>(reinterpret_cast<int64_t>(data->cb_tuple_.data_));
  std::shared_ptr<Runtime> runtime = Runtime::Find(runtime_id);
  if (!runtime) {
    return;
  }

  const v8::FunctionCallbackInfo<v8::Value>& info = data->info_;
  v8::Isolate* isolate = info.GetIsolate();
  if (!isolate) {
    TDF_BASE_DLOG(ERROR) << "CallNative isolate error";
    return;
  }

  v8::HandleScope handle_scope(isolate);
  std::shared_ptr<hippy::napi::V8Ctx> v8_ctx =
      std::static_pointer_cast<hippy::napi::V8Ctx>(runtime->GetScope()->GetContext());
  v8::Local<v8::Context> context = v8_ctx->context_persistent_.Get(isolate);
  v8::Context::Scope context_scope(context);
  if (context.IsEmpty()) {
    TDF_BASE_DLOG(ERROR) << "CallNative context empty";
    return;
  }

  unicode_string_view module;
  if (info.Length() >= 1 && !info[0].IsEmpty()) {
    v8::MaybeLocal<v8::String> module_maybe_str = info[0]->ToString(context);
    if (module_maybe_str.IsEmpty()) {
      isolate->ThrowException(
          v8::Exception::TypeError(
              v8::String::NewFromOneByte(isolate,
                                         reinterpret_cast<const uint8_t*>("module error"))
                  .ToLocalChecked()));
      return;
    }
    module = v8_ctx->ToStringView(module_maybe_str.ToLocalChecked());
    TDF_BASE_DLOG(INFO) << "CallNative module = " << module;
  } else {
    isolate->ThrowException(
        v8::Exception::Error(
            v8::String::NewFromOneByte(isolate,
                                       reinterpret_cast<const uint8_t*>("info error"))
                .ToLocalChecked()));
    return;
  }

  unicode_string_view func;
  if (info.Length() >= 2 && !info[1].IsEmpty()) {
    v8::MaybeLocal<v8::String> func_maybe_str = info[1]->ToString(context);
    if (func_maybe_str.IsEmpty()) {
      isolate->ThrowException(
          v8::Exception::TypeError(
              v8::String::NewFromOneByte(isolate,
                                         reinterpret_cast<const uint8_t*>("func error"))
                  .ToLocalChecked()));
      return;
    }
    func = v8_ctx->ToStringView(func_maybe_str.ToLocalChecked());
    TDF_BASE_DLOG(INFO) << "CallNative func = " << func;
  } else {
    isolate->ThrowException(
        v8::Exception::Error(
            v8::String::NewFromOneByte(isolate,
                                       reinterpret_cast<const uint8_t*>("info error"))
                .ToLocalChecked()));
    return;
  }

  unicode_string_view cb_id;
  if (info.Length() >= 3 && !info[2].IsEmpty()) {
    v8::MaybeLocal<v8::String> cb_id_maybe_str = info[2]->ToString(context);
    if (!cb_id_maybe_str.IsEmpty()) {
      cb_id = v8_ctx->ToStringView(cb_id_maybe_str.ToLocalChecked());
      TDF_BASE_DLOG(INFO) << "CallNative cb_id = " << cb_id;
    }
  }

  bytes buffer;
  if (info.Length() >= 4 && !info[3].IsEmpty() && info[3]->IsObject()) {
    if (runtime->IsEnableV8Serialization()) {
      Serializer serializer(isolate, context, runtime->GetBuffer());
      serializer.WriteHeader();
      serializer.WriteValue(info[3]);
      std::pair<uint8_t*, size_t> pair = serializer.Release();
      buffer = bytes(reinterpret_cast<const char*>(pair.first), pair.second);
    } else {
      std::shared_ptr<hippy::napi::V8CtxValue> obj =
          std::make_shared<hippy::napi::V8CtxValue>(isolate, info[3]);
      unicode_string_view json;
      auto flag = v8_ctx->GetValueJson(obj, &json);
      TDF_BASE_DCHECK(flag);
      TDF_BASE_DLOG(INFO) << "CallNative json = " << json;
      buffer = StringViewUtils::ToU8StdStr(json);
    }
  }

  bool is_heap_buffer = false;
  if (info.Length() >= 5 && !info[4].IsEmpty() && info[4]->IsNumber()) {
    is_heap_buffer = (info[4]->NumberValue(context).FromMaybe(0)) != 0;
  }
  TDF_BASE_DLOG(INFO) << "CallNative is_heap_buffer = " << is_heap_buffer;
  cb(runtime, module, func, cb_id, is_heap_buffer, buffer);
}

void V8BridgeUtils::LoadInstance(int32_t runtime_id, bytes&& buffer_data) {
  TDF_BASE_DLOG(INFO) << "LoadInstance runtime_id = " << runtime_id;
  std::shared_ptr<Runtime> runtime = Runtime::Find(runtime_id);
  if (!runtime) {
    return;
  }

  auto runner = runtime->GetEngine()->GetJSRunner();
  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
  std::weak_ptr<Scope> weak_scope = runtime->GetScope();
  task->callback = [weak_scope, buffer_data_ = std::move(buffer_data)] {
    std::shared_ptr<Scope> scope = weak_scope.lock();
    if (!scope) {
      return;
    }
    Deserializer deserializer(
        reinterpret_cast<const uint8_t*>(buffer_data_.c_str()),
        buffer_data_.length());
    DomValue value;
    deserializer.ReadHeader();
    auto ret = deserializer.ReadValue(value);
    if (ret) {
      scope->LoadInstance(std::make_shared<DomValue>(std::move(value)));
    } else {
      scope->GetContext()->ThrowException("LoadInstance param error");
    }
  };
  runner->PostTask(task);
}

}
