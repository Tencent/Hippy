//
// Created by longquan on 2020/8/22.
//


#include "bridge/bridge_extension.h"

#include <utility>

#if defined(__ANDROID__) || defined(_WIN32)
#include "bridge_impl.h"
#else
#include "bridge_impl_ios.h"
#endif

EXTERN_C int64_t InitJSFrameworkEx(const std::shared_ptr<PlatformRuntime>& platform_runtime,
                                   const char16_t *global_config,
                                   bool single_thread_mode,
                                   bool bridge_param_json,
                                   bool is_dev_module,
                                   int64_t group_id,
                                   std::function<void(int64_t)> callback) {
  return BridgeImpl::InitJsFrameWork(platform_runtime,
                                     single_thread_mode,
                                     bridge_param_json,
                                     is_dev_module,
                                     group_id,
                                     global_config,
                                     [
                                         callback_ = std::move(callback)](
                                         int64_t value) {
                                       callback_(value);
                                     });
}

EXTERN_C bool RunScriptFromFileEx(int64_t runtime_id,
                                  const char16_t *file_path,
                                  const char16_t *script_name,
                                  const char16_t *code_cache_dir,
                                  bool can_use_code_cache,
                                  std::function<void(int64_t)> callback) {

  return BridgeImpl::RunScriptFromFile(runtime_id, file_path,
                                       script_name, code_cache_dir,
                                       can_use_code_cache,
                                       [
                                           callback_ = std::move(callback)](
                                           int64_t value) {
                                         callback_(value);
                                       });
}

EXTERN_C bool RunScriptFromAssetsEx(int64_t runtime_id, const char16_t* asset_name, const char16_t* code_cache_dir,
                                    bool can_use_code_cache, const char16_t* asset_content,
                                    std::function<void(int64_t)> callback) {
  return BridgeImpl::RunScriptFromAssets(
      runtime_id, can_use_code_cache, asset_name, code_cache_dir,
      [callback_ = std::move(callback)](int value) { callback_(value); }, asset_content);
}

EXTERN_C void CallFunctionEx(int64_t runtimeId,
                             const char16_t *action,
                             const char16_t *params,
                             std::function<void(int64_t)> callback) {

  BridgeImpl::CallFunction(runtimeId,
                           action,
                           params,
                           [callback_ = std::move(callback)](int64_t value) {
                             callback_(value);
                           });
}

EXTERN_C void RunNativeRunnableEx(int64_t runtime_id,
                                  const char16_t *code_cache_path,
                                  int64_t runnable_id,
                                  std::function<void(int64_t)> callback) {

  BridgeImpl::RunNativeRunnable(runtime_id,
                                code_cache_path,
                                runnable_id,
                                [callback_ = std::move(callback)](int value) {
                                  callback_(value);
                                });
}

EXTERN_C const char *GetCrashMessageEx() {
  return "lucas_crash_report_test";
}

EXTERN_C void DestroyEx(int64_t runtime_id,
                        bool single_thread_mode,
                        std::function<void(int64_t)> callback) {

  BridgeImpl::Destroy(runtime_id,
                      single_thread_mode,
                      [callback_ = std::move(callback)](int64_t value) {
                        callback_(value);
                      });
}
