//
// Created by longquan on 2020/8/22.
// 对外扩展hippy bridge api调用
//

#ifndef BRIDGE_EXTENSION_H_
#define BRIDGE_EXTENSION_H_

#if defined(__ANDROID__) || defined(_WIN32)
#include "bridge_runtime.h"
#include <stdint.h>
#include <memory>
#elif __APPLE__
#include "ffi/common_header.h"
#include "bridge_runtime.h"
#endif

using voltron::PlatformRuntime;

EXTERN_C int64_t InitJSFrameworkEx(const std::shared_ptr<PlatformRuntime>& platform_runtime,
                                   const char16_t *global_config,
                                   bool single_thread_mode,
                                   bool bridge_param_json,
                                   bool is_dev_module,
                                   int64_t group_id,
                                   std::function<void(int64_t)> callback);

EXTERN_C bool RunScriptFromFileEx(int64_t runtime_id,
                                  const char16_t *file_path,
                                  const char16_t *script_name,
                                  const char16_t *code_cache_dir,
                                  bool can_use_code_cache,
                                  std::function<void(int64_t)> callback);

EXTERN_C bool RunScriptFromAssetsEx(int64_t runtime_id,
                                    const char16_t *asset_name,
                                    const char16_t *code_cache_dir,
                                    bool can_use_code_cache,
                                    const char16_t *asset_content,
                                    std::function<void(int64_t)> callback);

EXTERN_C void CallFunctionEx(int64_t runtime_id,
                             const char16_t *action,
                             const char16_t *params,
                             std::function<void(int64_t)> callback);

EXTERN_C void RunNativeRunnableEx(int64_t runtime_id,
                                  const char16_t *code_cache_path,
                                  int64_t runnable_id,
                                  std::function<void(int64_t)> callback);

EXTERN_C const char *GetCrashMessageEx();

EXTERN_C void DestroyEx(int64_t runtime_id,
                        bool single_thread_mode,
                        std::function<void(int64_t)> callback);

#endif // BRIDGE_EXTENSION_H_
