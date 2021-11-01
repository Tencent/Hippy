//
// Created by longquan on 2020/8/23.
//

#include <vector>
#include <memory>
#include "bridge/bridge_extension.h"
#include "ffi/ffi_platform_runtime.h"
#include "ffi/bridge_ffi_impl.h"
#include "ffi/logging.h"
#include "ffi/callback_manager.h"

#ifdef __cplusplus
extern "C" {
#endif

EXTERN_C int64_t initJSFrameworkFFI(const char16_t *globalConfig,
                                      int32_t singleThreadMode,
                                      int32_t bridgeParamJson,
                                      int32_t isDevModule,
                                      int64_t groupId,
                                      int64_t runtimeId,
                                      int32_t callbackId) {
  std::shared_ptr<PlatformRuntime>
      ffiRuntime = std::make_shared<FFIPlatformRuntime>(runtimeId);
  return initJSFrameworkEx(ffiRuntime,
                           globalConfig,
                           singleThreadMode,
                           bridgeParamJson,
                           isDevModule,
                           groupId,
                           [callbackId](int64_t value) {
                             callGlobalCallback(callbackId, value);
                           });
}

EXTERN_C int32_t runScriptFromFileFFI(int64_t runtimeId,
                                        const char16_t *filePath,
                                        const char16_t *scriptName,
                                        const char16_t *codeCacheDir,
                                        int32_t canUseCodeCache,
                                        int32_t callbackId) {
  return runScriptFromFileEx(runtimeId,
                             filePath,
                             scriptName,
                             codeCacheDir,
                             canUseCodeCache,
                             [callbackId](int64_t value) {
                               callGlobalCallback(callbackId, value);
                             });
}

EXTERN_C int32_t runScriptFromAssetsFFI(int64_t runtimeId,
                                          const char16_t *assetName,
                                          const char16_t *codeCacheDir,
                                          int32_t canUseCodeCache,
                                          const char16_t *assetStrChar,
                                          int32_t callbackId) {

  bool result = runScriptFromAssetsEx(runtimeId,
                                      assetName,
                                      codeCacheDir,
                                      canUseCodeCache,

                                      assetStrChar,
                                      [callbackId](int64_t value) {
                                        callGlobalCallback(callbackId, value);
                                      });
  if (!result) {
    delete assetStrChar;
  }
  return result;
}

EXTERN_C void callFunctionFFI(int64_t runtimeId,
                              const char16_t *action,
                              const char16_t *params,
                              int32_t callbackId) {
  callFunctionEx(runtimeId,
                 action,
                 params,
                 [callbackId](int64_t value) {
                   callGlobalCallback(callbackId, value);
                 });
}

EXTERN_C void runNativeRunnableFFI(int64_t runtimeId,
                                   const char16_t *codeCachePath,
                                   int64_t runnableId,
                                   int32_t callbackId) {
  runNativeRunnableEx(runtimeId,
                      codeCachePath,
                      runnableId,
                      [callbackId](int64_t value) {
                        callGlobalCallback(callbackId, value);
                      });
}

EXTERN_C const char *getCrashMessageFFI() {
  return getCrashMessageEx();
}

EXTERN_C void destroyFFI(int64_t runtimeId,
                         bool singleThreadMode,
                         int32_t callbackId) {
  destroyEx(runtimeId, singleThreadMode, [callbackId](int64_t value) {
    callGlobalCallback(callbackId, value);
  });
}

EXTERN_C int32_t registerCallFunc(int32_t type, void *func) {
  RENDER_CORE_LOG(rendercore::LoggingLevel::Info,
                  "start register func, type %d",
                  type);
  if (type == CALL_NATIVE_FUNC_TYPE) {
    callNativeFunc = reinterpret_cast<call_native>(func);
    return true;
  } else if (type == CHECK_CODE_CACHE_SANITY_FUNC_TYPE) {
    checkCodeCacheSanityFunc = reinterpret_cast<check_code_cache_sanity>(func);
    return true;
  } else if (type == POST_CODE_CACHE_RUNNABLE_FUNC_TYPE) {
    postCodeCacheRunnableFunc =
        reinterpret_cast<post_code_cache_runnable>(func);
    return true;
  } else if (type == REPORT_JSON_EXCEPTION_FUNC_TYPE) {
    reportJsonExceptionFunc = reinterpret_cast<report_json_exception>(func);
    return true;
  } else if (type == REPORT_JS_EXCEPTION_FUNC_TYPE) {
    reportJsExceptionFunc = reinterpret_cast<report_js_exception>(func);
    return true;
  } else if (type == SEND_RESPONSE_FUNC_TYPE) {
    sendResponseFunc = reinterpret_cast<send_response>(func);
    return true;
  } else if (type == SEND_NOTIFICATION_FUNC_TYPE) {
    sendNotificationFunc = reinterpret_cast<send_notification >(func);
    return true;
  } else if (type == DESTROY_FUNC_TYPE) {
    destroyFunc = reinterpret_cast<destroy_function>(func);
    return true;
  } else if (type == GLOBAL_CALLBACK_TYPE) {
    globalCallbackFunc = reinterpret_cast<global_callback>(func);
    return true;
  }
  RENDER_CORE_LOG(rendercore::LoggingLevel::Error,
                  "register func error, unknown type %d",
                  type);
  return false;
}

bool callGlobalCallback(int32_t callbackId, int64_t value) {
  if (globalCallbackFunc) {
    const Work work = [value, callbackId]() {
      globalCallbackFunc(callbackId, value);
    };
    const Work *work_ptr = new Work(work);
    RENDER_CORE_LOG(rendercore::LoggingLevel::Info, "start callback");
    postWorkToDart(work_ptr);
    return true;
  } else {
    RENDER_CORE_LOG(rendercore::LoggingLevel::Error,
                    "call callback error, func not found");
  }
  return false;
}

EXTERN_C void test() {
//  const char16_t *params =
//      "[10,[{\"index\":0,\"props\":{\"onPressIn\":true,\"style\":{\"width\":250,\"marginTop\":30,\"borderColor\":-11756806,\"alignItems\":\"center\",\"borderRadius\":8,\"height\":50,\"opacity\":1.0,\"borderWidth\":2,\"justifyContent\":\"center\"},\"onPressOut\":true,\"onClick\":true},\"name\":\"View\",\"id\":108,\"pId\":109}]]";
//  int paramLen = strlen(params);
//  const void *paramsData = reinterpret_cast<const void *>(params);
//  callNativeFunc(0,
//                 "moduleName",
//                 "moduleFunc",
//                 "callId",
//                 paramsData,
//                 paramLen,
//                 true);
//
//  const int length = 223;
//  int8_t a[length] =
//      {6, 2, 4, 20, 6, 1, 7, 5, 2, 105, 100, 4, -40, 1, 3, 112, 73, 100, 4, -38,
//       1, 5, 105, 110, 100, 101, 120, 4, 0, 4, 110, 97, 109, 101, 8, 4, 86, 105,
//       101, 119, 5, 112, 114, 111, 112, 115, 7, 4, 9, 111, 110, 80, 114, 101,
//       115, 115, 73, 110, 2, 10, 111, 110, 80, 114, 101, 115, 115, 79, 117, 116,
//       2, 7, 111, 110, 67, 108, 105, 99, 107, 2, 5, 115, 116, 121, 108, 101, 7,
//       9, 11, 98, 111, 114, 100, 101, 114, 67, 111, 108, 111, 114, 4, -117,
//       -108, -101, 11, 11, 98, 111, 114, 100, 101, 114, 87, 105, 100, 116, 104,
//       4, 4, 12, 98, 111, 114, 100, 101, 114, 82, 97, 100, 105, 117, 115, 4, 16,
//       14, 106, 117, 115, 116, 105, 102, 121, 67, 111, 110, 116, 101, 110, 116,
//       8, 6, 99, 101, 110, 116, 101, 114, 10, 97, 108, 105, 103, 110, 73, 116,
//       101, 109, 115, 8, 6, 99, 101, 110, 116, 101, 114, 5, 119, 105, 100, 116,
//       104, 4, -12, 3, 6, 104, 101, 105, 103, 104, 116, 4, 100, 9, 109, 97, 114,
//       103, 105, 110, 84, 111, 112, 4, 60, 7, 111, 112, 97, 99, 105, 116, 121,
//       5, 63, -16, 0, 0, 0, 0, 0, 0};
//  int8_t *data = new int8_t[length];
//  for (int i = 0; i < length; i++) {
//    data[i] = a[i];
//  }
//  int paramLenData = length;
//  const void *paramsDataByte = reinterpret_cast<const void *>(data);
//  callNativeFunc(0,
//                 "moduleName",
//                 "moduleFunc",
//                 "callId",
//                 paramsDataByte,
//                 paramLenData,
//                 false);
}

#ifdef __cplusplus
}
#endif
