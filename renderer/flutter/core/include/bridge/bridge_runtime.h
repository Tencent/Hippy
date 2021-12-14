#pragma once

#include <functional>

#if defined(_WIN32)
#  define EXTERN_C extern "C" __declspec(dllexport)
#  define EXPORT
#else
#  define EXTERN_C extern "C" __attribute__((visibility("default"))) __attribute__((used))
#  define EXPORT __attribute__((visibility("default")))
#endif

namespace voltron {
class EXPORT PlatformRuntime {
 public:
  EXPORT PlatformRuntime() = default;
  EXPORT virtual ~PlatformRuntime() = default;

 public:
  EXPORT virtual void CallNaive(const char16_t* moduleName, const char16_t* moduleFunc, const char16_t* callId,
                                const void* paramsData, uint32_t paramsLen, bool bridgeParamJson,
                                std::function<void()> callback, bool autoFree) = 0;
  EXPORT virtual void PostCodeCacheRunnable(const char* codeCacheDirChar, int64_t runnableId,
                                            bool needClearException) = 0;
  EXPORT virtual void ReportJSONException(const char* jsonValue) = 0;
  EXPORT virtual void ReportJSException(const char16_t* description_stream, const char16_t* stack_stream) = 0;
  EXPORT virtual void CheckCodeCacheSanity(const char* scriptMd5) = 0;
  EXPORT virtual void SendResponse(const uint16_t* source, int len) = 0;
  EXPORT virtual void SendNotification(const uint16_t* source, int len) = 0;
  EXPORT virtual int64_t CalculateNodeLayout(int32_t instance_id, int32_t node_id, double width, int32_t width_mode,
                                             double height, int32_t height_mode) = 0;
  EXPORT virtual void Destroy() = 0;
  virtual void SetRuntimeId(int64_t runtime_id) = 0;
  virtual int64_t GetRuntimeId() = 0;
};
}  // namespace voltron
