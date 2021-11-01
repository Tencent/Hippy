/*****************************************************************************
 * @copyright Copyright (C), 1998-2021, Tencent Tech. Co., Ltd.
 * @file     bridge_runtime.h
 * @brief    <简单描述>
 * @author   sshsong
 * @version  1.0.0
 * @date     11/1/2021
 *****************************************************************************/

#ifndef BRIDGE_RUNTIME_H
#define BRIDGE_RUNTIME_H

#include <functional>

#if defined(_WIN32)
#define EXTERN_C extern "C" __declspec(dllexport)
#define EXPORT
#else
#define EXTERN_C extern "C" __attribute__((visibility("default"))) __attribute__((used))
#define EXPORT __attribute__((visibility("default")))
#endif

class EXPORT PlatformRuntime {
public:
  EXPORT PlatformRuntime() = default;
  EXPORT virtual ~PlatformRuntime() = default;
public:
  EXPORT virtual void CallNaive(const char16_t *moduleName,
                                const char16_t *moduleFunc,
                                const char16_t *callId,
                                const void *paramsData,
                                uint32_t paramsLen,
                                bool bridgeParamJson,
                                std::function<void()> callback,
                                bool autoFree) = 0;
  EXPORT virtual void PostCodeCacheRunnable(const char *codeCacheDirChar,
                                            int64_t runnableId,
                                            bool needClearException) = 0;
  EXPORT virtual void ReportJSONException(const char *jsonValue) = 0;
  EXPORT virtual void ReportJSException(const char16_t *description_stream,
                                        const char16_t *stack_stream) = 0;
  EXPORT virtual void CheckCodeCacheSanity(const char *scriptMd5) = 0;
  EXPORT virtual void SendResponse(const uint16_t *source, int len) = 0;
  EXPORT virtual void SendNotification(const uint16_t *source, int len) = 0;
  EXPORT virtual void Destroy() = 0;
};


#endif // BRIDGE_RUNTIME_H
