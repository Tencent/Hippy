//
// Created by longquan on 2020/8/23.
//

#ifndef ANDROID_CORE_FFI_PLATFORM_RUNTIME_H_
#define ANDROID_CORE_FFI_PLATFORM_RUNTIME_H_

#if defined(__ANDROID__) || defined(_WIN32)
#include "bridge/bridge_runtime.h"
#elif __APPLE__
#include "common_header.h"
#include "bridge/bridge_runtime.h"
#endif
#include "bridge_define.h"


class FFIPlatformRuntime : public PlatformRuntime {
 private:
  long runtime_id_ = 0;
 public:
  FFIPlatformRuntime(long rid);
  ~FFIPlatformRuntime() override = default;
  void CallNaive(const char16_t *moduleName,
                 const char16_t *moduleFunc,
                 const char16_t *callId,
                 const void *paramsData,
                 uint32_t paramsLen,
                 bool bridgeParamJson, std::function<void()> callback, bool autoFree) override;
  void PostCodeCacheRunnable(const char *codeCacheDirChar,
                             int64_t runnableId,
                             bool needClearException) override;
  void ReportJSONException(const char *jsonValue) override;
  void ReportJSException(const char16_t *description_stream, const char16_t *stack_stream) override;
  void CheckCodeCacheSanity(const char *scriptMd5) override;
  void SendResponse(const uint16_t *source, int len) override;
  void SendNotification(const uint16_t *source, int len) override;
  void Destroy() override;

 private:
  static const void* copyParamsData(const void *form, uint32_t length);
};

#endif //ANDROID_CORE_FFI_PLATFORM_RUNTIME_H_
