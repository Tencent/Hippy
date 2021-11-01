//
// Created by longquan on 2020/8/22.
//


#include "bridge/bridge_extension.h"

#include <utility>
#include <base/logging.h>

#if defined(__ANDROID__) || defined(_WIN32)
#include "bridge/android/bridge_impl.h"
#else
#include "bridge_impl_ios.h"
#endif

#include "bridge/string_util.h"

EXTERN_C int64_t initJSFrameworkEx(const std::shared_ptr<PlatformRuntime>& platformRuntime,
                                   const char16_t *globalConfig,
                                   bool singleThreadMode,
                                   bool bridgeParamJson,
                                   bool isDevModule,
                                   int64_t groupId,
                                   std::function<void(int64_t)> callback) {
  return BridgeImpl::InitJsFrameWork(platformRuntime,
                                     singleThreadMode,
                                     bridgeParamJson,
                                     isDevModule,
                                     groupId,
                                     globalConfig,
                                     [
                                         callback_ = std::move(callback)](
                                         int64_t value) {
                                       callback_(value);
                                     });
}

EXTERN_C bool runScriptFromFileEx(int64_t runtimeId,
                                  const char16_t *filePath,
                                  const char16_t *scriptName,
                                  const char16_t *codeCacheDir,
                                  bool canUseCodeCache,
                                  std::function<void(int64_t)> callback) {

  return BridgeImpl::RunScriptFromFile(runtimeId, filePath,
                                       scriptName, codeCacheDir,
                                       canUseCodeCache,
                                       [
                                           callback_ = std::move(callback)](
                                           int64_t value) {
                                         callback_(value);
                                       });
}

EXTERN_C bool runScriptFromAssetsEx(int64_t runtimeId,
                                    const char16_t *assetName,
                                    const char16_t *codeCacheDir,
                                    bool canUseCodeCache,
                                    const char16_t *assetContent,
                                    std::function<void(int64_t)> callback) {

  return BridgeImpl::RunScriptFromAssets(runtimeId,
                                         canUseCodeCache,
                                         assetName,
                                         codeCacheDir,
                                         [
                                             callback_ = std::move(callback)](
                                             int value) {
                                           callback_(value);
                                         },
                                         assetContent);
}

EXTERN_C void callFunctionEx(int64_t runtimeId,
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

EXTERN_C void runNativeRunnableEx(int64_t runtimeId,
                                  const char16_t *codeCachePath,
                                  int64_t runnableId,
                                  std::function<void(int64_t)> callback) {

  BridgeImpl::RunNativeRunnable(runtimeId,
                                codeCachePath,
                                runnableId,
                                [callback_ = std::move(callback)](int value) {
                                  callback_(value);
                                });
}

EXTERN_C const char *getCrashMessageEx() {
  return "lucas_crash_report_test";
}

EXTERN_C void destroyEx(int64_t runtimeId,
                        bool singleThreadMode,
                        std::function<void(int64_t)> callback) {

  BridgeImpl::Destroy(runtimeId,
                      singleThreadMode,
                      [callback_ = std::move(callback)](int64_t value) {
                        callback_(value);
                      });
}
