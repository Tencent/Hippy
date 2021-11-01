//
// Created by longquan on 2020/8/31.
//

#ifndef ANDROID_CORE_BRIDGE_DEFINE_H_
#define ANDROID_CORE_BRIDGE_DEFINE_H_

#include <cstdint>

#define CALL_NATIVE_FUNC_TYPE 0
#define POST_CODE_CACHE_RUNNABLE_FUNC_TYPE 1
#define REPORT_JSON_EXCEPTION_FUNC_TYPE 2
#define REPORT_JS_EXCEPTION_FUNC_TYPE 3
#define CHECK_CODE_CACHE_SANITY_FUNC_TYPE 4
#define SEND_RESPONSE_FUNC_TYPE 5
#define SEND_NOTIFICATION_FUNC_TYPE 6
#define DESTROY_FUNC_TYPE 7
#define GLOBAL_CALLBACK_TYPE 8

// hippy call native方法
typedef void (*call_native)(int64_t runtimeId,
                            const char16_t *moduleName,
                            const char16_t *moduleFunc,
                            const char16_t *callId,
                            const void *paramsData,
                            uint32_t paramsLen,
                            int32_t bridgeParamJson);
typedef void (*post_code_cache_runnable)(int64_t runtimeId,
                                         const char *codeCacheDirChar,
                                         int64_t runnableId,
                                         int32_t needClearException);
typedef void (*report_json_exception)(int64_t runtimeId, const char *jsonValue);
typedef void (*report_js_exception)(int64_t runtimeId, const char16_t *description_stream, const char16_t *stack_stream);
typedef void (*check_code_cache_sanity)(int64_t runtimeId, const char *scriptMd5);
typedef void (*send_response)(int64_t runtimeId, const uint16_t *source, int32_t len);
typedef void (*send_notification)(int64_t runtimeId, const uint16_t *source, int32_t len);
// 销毁
typedef void (*destroy_function)(int64_t runtimeId);
typedef void (*global_callback)(int32_t callbackId, int64_t value);

extern call_native callNativeFunc;
extern post_code_cache_runnable postCodeCacheRunnableFunc;
extern report_json_exception reportJsonExceptionFunc;
extern report_js_exception reportJsExceptionFunc;
extern check_code_cache_sanity checkCodeCacheSanityFunc;
extern send_response sendResponseFunc;
extern send_notification sendNotificationFunc;
extern destroy_function destroyFunc;
extern global_callback globalCallbackFunc;

#endif //ANDROID_CORE_BRIDGE_DEFINE_H_
