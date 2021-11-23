//
// Created by longquan on 2020/8/23.
// hippy bridge ffi实现
//

#ifndef ANDROID_CORE_BRIDGE_FFI_IMPL_H_
#define ANDROID_CORE_BRIDGE_FFI_IMPL_H_

#if defined(__ANDROID__) || defined(_WIN32)
#include "bridge/bridge_runtime.h"
#elif __APPLE__
#include "common_header.h"
#include "bridge/bridge_runtime.h"
#endif

#ifdef __cplusplus
extern "C" {
#endif

EXTERN_C int64_t initJSFrameworkFFI(const char16_t *globalConfig,
                                                int32_t singleThreadMode,
                                                int32_t bridgeParamJson,
                                                int32_t isDevModule,
                                                int64_t groupId,
                                                int64_t runtimeId,
                                                int32_t callbackId);

EXTERN_C int32_t runScriptFromFileFFI(int64_t runtimeId,
                                                 const char16_t *filePath,
                                                 const char16_t *scriptName,
                                                 const char16_t *codeCacheDir,
                                                 int32_t canUseCodeCache,
                                                 int32_t callbackId);

EXTERN_C int32_t runScriptFromAssetsFFI(int64_t runtimeId,
                                                         const char16_t *assetName,
                                                         const char16_t *codeCacheDir,
                                                         int32_t canUseCodeCache,
                                                         const char16_t *assetStrChar,
                                                         int32_t callbackId);

EXTERN_C void callFunctionFFI(int64_t runtimeId,
                                             const char16_t *action,
                                             const char16_t *params,
                                             int32_t callbackId);

EXTERN_C void runNativeRunnableFFI(int64_t runtimeId,
                                                  const char16_t *codeCachePath,
                                                  int64_t runnableId,
                                                  int32_t callbackId);

EXTERN_C const char *getCrashMessageFFI();

EXTERN_C void destroyFFI(int64_t runtimeId,
                                        bool singleThreadMode,
                                        int32_t callbackId);

EXTERN_C int32_t registerCallFunc(int32_t type, void *func);

bool callGlobalCallback(int32_t callbackId, int64_t value);

EXTERN_C void test();
#ifdef __cplusplus
}
#endif

#endif // ANDROID_CORE_BRIDGE_FFI_IMPL_H_

