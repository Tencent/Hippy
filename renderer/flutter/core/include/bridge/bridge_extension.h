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

EXTERN_C int64_t initJSFrameworkEx(const std::shared_ptr<PlatformRuntime>& platformRuntime,
                                   const char16_t *globalConfig,
                                   bool singleThreadMode,
                                   bool bridgeParamJson,
                                   bool isDevModule,
                                   int64_t groupId,
                                   std::function<void(int64_t)> callback);

EXTERN_C bool runScriptFromFileEx(int64_t runtimeId,
                                  const char16_t *filePath,
                                  const char16_t *scriptName,
                                  const char16_t *codeCacheDir,
                                  bool canUseCodeCache,
                                  std::function<void(int64_t)> callback);

EXTERN_C bool runScriptFromAssetsEx(int64_t runtimeId,
                                    const char16_t *assetName,
                                    const char16_t *codeCacheDir,
                                    bool canUseCodeCache,
                                    const char16_t *assetContent,
                                    std::function<void(int64_t)> callback);

EXTERN_C void callFunctionEx(int64_t runtimeId,
                             const char16_t *action,
                             const char16_t *params,
                             std::function<void(int64_t)> callback);

EXTERN_C void runNativeRunnableEx(int64_t runtimeId,
                                  const char16_t *codeCachePath,
                                  int64_t runnableId,
                                  std::function<void(int64_t)> callback);

EXTERN_C const char *getCrashMessageEx();

EXTERN_C void destroyEx(int64_t runtimeId,
                        bool singleThreadMode,
                        std::function<void(int64_t)> callback);

#endif // BRIDGE_EXTENSION_H_
