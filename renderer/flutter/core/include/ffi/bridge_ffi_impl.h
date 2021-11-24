//
// Created by longquan on 2020/8/23.
// hippy bridge ffi实现
//

#ifndef ANDROID_CORE_BRIDGE_FFI_IMPL_H_
#define ANDROID_CORE_BRIDGE_FFI_IMPL_H_

#if defined(__ANDROID__) || defined(_WIN32)
#  include "bridge/bridge_runtime.h"
#elif __APPLE__
#  include "bridge/bridge_runtime.h"
#  include "common_header.h"
#endif

#ifdef __cplusplus
extern "C" {
#endif

EXTERN_C int64_t InitJSFrameworkFFI(const char16_t* global_config, int32_t single_thread_mode,
                                    int32_t bridge_param_json, int32_t is_dev_module, int64_t group_id, int32_t root_id,
                                    int32_t callback_id);

EXTERN_C int32_t RunScriptFromFileFFI(int32_t root_id, const char16_t* file_path, const char16_t* script_name,
                                      const char16_t* code_cache_dir, int32_t can_use_code_cache, int32_t callback_id);

EXTERN_C int32_t RunScriptFromAssetsFFI(int32_t root_id, const char16_t* asset_name, const char16_t* code_cache_dir,
                                        int32_t can_use_code_cache, const char16_t* asset_str_char,
                                        int32_t callback_id);

EXTERN_C void CallFunctionFFI(int32_t root_id, const char16_t* action, const char16_t* params, int32_t callback_id);

EXTERN_C void RunNativeRunnableFFI(int32_t root_id, const char16_t* code_cache_path, int64_t runnable_id,
                                   int32_t callback_id);

EXTERN_C const char* GetCrashMessageFFI();

EXTERN_C void DestroyFFI(int32_t root_id, bool single_thread_mode, int32_t callback_id);

EXTERN_C int32_t RegisterCallFunc(int32_t type, void* func);

EXTERN_C void ConsumeRenderOpQueue(int32_t root_id);

bool CallGlobalCallback(int32_t callbackId, int64_t value);

EXTERN_C void Test();
#ifdef __cplusplus
}
#endif

#endif  // ANDROID_CORE_BRIDGE_FFI_IMPL_H_
