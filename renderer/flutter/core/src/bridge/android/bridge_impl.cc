//
// Created by longquan on 2020/8/21.
//


#include <functional>
#include <utility>
#include <future>
#include <sys/stat.h>

#include "bridge_impl.h"
#include "exception_handler.h"
#include "bridge/string_util.h"
#include "js2dart.h"
#include "dart2js.h"
#ifdef V8_HAS_INSPECTOR
#include "inspector/v8_inspector_client_impl.h"
#endif

using u8string = unicode_string_view::u8string;
using RegisterMap = hippy::base::RegisterMap;
using RegisterFunction = hippy::base::RegisterFunction;
using Ctx = hippy::napi::Ctx;
using StringViewUtil = hippy::base::StringViewUtils;
using HippyFile = hippy::base::HippyFile;

#ifdef V8_HAS_INSPECTOR
using V8InspectorClientImpl = hippy::inspector::V8InspectorClientImpl;
std::shared_ptr<V8InspectorClientImpl> global_inspector = nullptr;
#endif

static std::unordered_map<int64_t, std::pair<std::shared_ptr<Engine>, uint32_t>>
    reuse_engine_map;
static std::mutex engine_mutex;

static const int64_t kDefaultEngineId = -1;
static const int64_t kDebuggerEngineId = -9999;
static const uint32_t kRuntimeKeyIndex = 0;

int64_t BridgeImpl::InitJsFrameWork(const std::shared_ptr<PlatformRuntime> &platform_runtime,
                                    bool single_thread_mode,
                                    bool bridge_param_json,
                                    bool is_dev_module,
                                    int64_t group_id,
                                    const char16_t *char_globalConfig,
                                    const std::function<void(int64_t)> &callback) {

  std::shared_ptr<Runtime> runtime =
      std::make_shared<Runtime>(platform_runtime,
                                !bridge_param_json, is_dev_module);
  int64_t runtime_id = runtime->GetId();
  Runtime::Insert(runtime);
  std::shared_ptr<int64_t> runtime_key = Runtime::GetKey(runtime);
  RegisterFunction vm_cb = [runtime_key](void *vm) {
    auto *v8_vm = reinterpret_cast<hippy::napi::V8VM *>(vm);
    v8::Isolate *isolate = v8_vm->isolate_;
    v8::HandleScope handle_scope(isolate);
    isolate->AddMessageListener(ExceptionHandler::HandleUncaughtJsError);
    isolate->SetData(kRuntimeKeyIndex, runtime_key.get());
  };

  std::unique_ptr<RegisterMap> engine_cb_map = std::make_unique<RegisterMap>();
  engine_cb_map->insert(std::make_pair(hippy::base::kVMCreateCBKey, vm_cb));

  unicode_string_view global_config = CU16StringToStrView(char_globalConfig);

  TDF_BASE_LOG(INFO) << "global_config = " << global_config;
  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();

  RegisterFunction context_cb = [runtime, global_config,
      runtime_key](void *scopeWrapper) {
    TDF_BASE_LOG(INFO)
    << "InitInstance register hippyCallNatives, runtime_key = "
    << *runtime_key;

    TDF_BASE_DCHECK(scopeWrapper);
    auto *wrapper = reinterpret_cast<ScopeWrapper *>(scopeWrapper);
    TDF_BASE_DCHECK(wrapper);
    std::shared_ptr<Scope> scope = wrapper->scope_.lock();
    if (!scope) {
      TDF_BASE_DLOG(ERROR) << "register hippyCallNatives, scope error";
      return;
    }

#ifdef V8_HAS_INSPECTOR
    if (runtime->IsDebug()) {
      if (!global_inspector) {
        global_inspector = std::make_shared<V8InspectorClientImpl>(scope);
        global_inspector->Connect(runtime->GetPlatformRuntime());
      } else {
        global_inspector->Reset(scope, runtime->GetPlatformRuntime());
      }
      global_inspector->CreateContext();
    }
#endif

    std::shared_ptr<Ctx> ctx = scope->GetContext();
    ctx->RegisterGlobalInJs();
    hippy::base::RegisterFunction fn =
    TO_REGISTER_FUNCTION(voltron::bridge::callDartMethod,
                         hippy::napi::CBDataTuple)
    ctx->RegisterNativeBinding("hippyCallNatives", fn,
                               static_cast<void *>(runtime_key.get()));
    bool ret = ctx->SetGlobalJsonVar("__HIPPYNATIVEGLOBAL__", global_config);
    if (!ret) {
      TDF_BASE_DLOG(ERROR) << "register __HIPPYNATIVEGLOBAL__ failed";
      ExceptionHandler::ReportJsException(runtime, u"global_config parse error",
                                          global_config);
    }
  };
  std::unique_ptr<RegisterMap> scope_cb_map = std::make_unique<RegisterMap>();
  scope_cb_map->insert(
      std::make_pair(hippy::base::kContextCreatedCBKey, context_cb));

  RegisterFunction
      scope_cb = [runtime_id, outerCallback = callback](void *) {
    TDF_BASE_LOG(INFO) << "run scope cb";
    outerCallback(runtime_id);
  };

  scope_cb_map->insert(
      std::make_pair(hippy::base::KScopeInitializedCBKey, scope_cb));

  std::shared_ptr<Engine> engine;
  if (is_dev_module) {
    std::lock_guard<std::mutex> lock(engine_mutex);
    TDF_BASE_DLOG(INFO) << "debug mode";
    group_id = kDebuggerEngineId;
    auto it = reuse_engine_map.find(group_id);
    if (it != reuse_engine_map.end()) {
      engine = std::get<std::shared_ptr<Engine>>(it->second);
      runtime->SetEngine(engine);
    } else {
      engine = std::make_shared<Engine>(std::move(engine_cb_map));
      runtime->SetEngine(engine);
      reuse_engine_map[group_id] = std::make_pair(engine, 1);
    }
  } else if (group_id != kDefaultEngineId) {
    std::lock_guard<std::mutex> lock(engine_mutex);
    auto it = reuse_engine_map.find(group_id);
    if (it != reuse_engine_map.end()) {
      TDF_BASE_DLOG(INFO) << "engine reuse";
      engine = std::get<std::shared_ptr<Engine>>(it->second);
      runtime->SetEngine(engine);
      std::get<uint32_t>(it->second) += 1;
      TDF_BASE_DLOG(INFO) << "engine cnt = " << std::get<uint32_t>(it->second)
                          << ", use_count = " << engine.use_count();
    } else {
      TDF_BASE_DLOG(INFO) << "engine create";
      engine = std::make_shared<Engine>(std::move(engine_cb_map));
      runtime->SetEngine(engine);
      reuse_engine_map[group_id] = std::make_pair(engine, 1);
    }
  } else {
    TDF_BASE_DLOG(INFO) << "default create engine";
    engine = std::make_shared<Engine>(std::move(engine_cb_map));
    runtime->SetEngine(engine);
  }

  auto scope = runtime->GetEngine()->CreateScope("", std::move(scope_cb_map));
//  TDF_BASE_DCHECK(j_root_view_id <= std::numeric_limits<std::int32_t>::max());
//  scope->SetDomManager(std::make_shared<DomManager>(static_cast<int32_t>(j_root_view_id)));
  runtime->SetScope(scope);
  runtime->SetScope(
      runtime->GetEngine()->CreateScope("", std::move(scope_cb_map)));
  TDF_BASE_DLOG(INFO) << "group = " << group_id;
  runtime->SetGroupId(group_id);
  TDF_BASE_LOG(INFO) << "InitInstance end, runtime_id = " << runtime_id;

  return runtime_id;
}

bool BridgeImpl::RunScript(
    int64_t runtime_id,
    const unicode_string_view &script_content,
    const unicode_string_view &script_name,
    const unicode_string_view &script_path,
    bool can_use_code_cache,
    const unicode_string_view &code_cache_dir,
    bool fromAssets) {
  TDF_BASE_LOG(INFO) << "RunScript begin, file_name = " << script_name
                     << ", is_use_code_cache = " << can_use_code_cache
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
      auto time1 = std::chrono::time_point_cast<std::chrono::microseconds>(
          std::chrono::system_clock::now())
          .time_since_epoch()
          .count();
      modify_time = HippyFile::GetFileModifytime(script_path);
      auto time2 = std::chrono::time_point_cast<std::chrono::microseconds>(
          std::chrono::system_clock::now())
          .time_since_epoch()
          .count();
      TDF_BASE_DLOG(INFO) << "GetFileModifyTime cost %lld microseconds"
                          << time2 - time1;
    }

    code_cache_path = code_cache_dir + script_name + unicode_string_view("_") +
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
    code_cache_content = read_file_future.get();
  }

  TDF_BASE_DLOG(INFO) << "uri = " << script_path
                      << ", script content = " << script_content;

  if (StringViewUtils::IsEmpty(script_content)) {
    TDF_BASE_LOG(WARNING) << "script content empty, uri = " << script_path;
    return false;
  }

  auto ret = std::static_pointer_cast<hippy::napi::V8Ctx>(
      runtime->GetScope()->GetContext())
      ->RunScript(script_content, script_name, can_use_code_cache,
                  &code_cache_content);

  if (can_use_code_cache) {
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
        TDF_BASE_DLOG(INFO)
        << "check_parent_dir_ret = " << check_parent_dir_ret;
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

  std::shared_ptr<Runtime> runtime = Runtime::Find(runtime_id);
  if (!runtime) {
    TDF_BASE_DLOG(WARNING) << "runScriptFromFile runtime_id invalid";
    return false;
  }

  unicode_string_view script_path = CU16StringToStrView(script_path_str);
  unicode_string_view script_name = CU16StringToStrView(script_name_str);
  unicode_string_view code_cache_dir = CU16StringToStrView(code_cache_dir_str);

  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
  task->callback = [runtime_id, script_path, script_name,
      code_cache_dir, can_use_code_cache, callBack_ = std::move(callback)] {

    u8string content;
    HippyFile::ReadFile(script_path, content, false);
    unicode_string_view scrip_content = unicode_string_view(std::move(content));

    bool flag = RunScript(runtime_id,
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
  task->callback = [runtime_id, callback_ = std::move(callback), asset_content,
      can_use_code_cache, asset_name,
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

void BridgeImpl::RunNativeRunnable(int64_t runtime_id,
                                   const char16_t *code_cache_path,
                                   int64_t runnable_id,
                                   std::function<void(int64_t)> callback) {
}

void BridgeImpl::CallFunction(int64_t runtime_id,
                              const char16_t *action,
                              const char16_t *params,
                              std::function<void(int64_t)> callback) {
  voltron::bridge::CallJSFunction(runtime_id, CU16StringToStrView(action), CU16StringToStrView(params), std::move(callback));
}

void BridgeImpl::Destroy(int64_t runtimeId, bool singleThreadMode,
                         std::function<void(int64_t)> callback) {

  TDF_BASE_DLOG(INFO) << "DestroyInstance begin, runtime_id = "
                      << runtimeId;

  std::shared_ptr<Runtime> runtime = Runtime::Find(runtimeId);
  if (!runtime) {
    TDF_BASE_DLOG(WARNING) << "BridgeImpl Destroy, runtime_id invalid";
    return;
  }

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

