#pragma once

#if defined(__ANDROID__) || defined(_WIN32)
#  include "bridge/bridge_runtime.h"
#elif __APPLE__
#  include "bridge/bridge_runtime.h"
#  include "common_header.h"
#endif
#include "bridge_define.h"

namespace voltron {
class FFIPlatformRuntime : public PlatformRuntime {
 private:
  int32_t engine_id_ = 0;
  int64_t runtime_id_ = 0;

 public:
  explicit FFIPlatformRuntime(int32_t engine_id);
  ~FFIPlatformRuntime() override = default;
  void CallNaive(const char16_t* moduleName, const char16_t* moduleFunc, const char16_t* callId, const void* paramsData,
                 uint32_t paramsLen, bool bridgeParamJson, std::function<void()> callback, bool autoFree) override;
  void PostCodeCacheRunnable(const char* codeCacheDirChar, int64_t runnableId, bool needClearException) override;
  void ReportJSONException(const char* jsonValue) override;
  void ReportJSException(const char16_t* description_stream, const char16_t* stack_stream) override;
  void CheckCodeCacheSanity(const char* scriptMd5) override;
  void SendResponse(const uint16_t* source, int len) override;
  void SendNotification(const uint16_t* source, int len) override;
  int64_t CalculateNodeLayout(int32_t instance_id, int32_t node_id, double width, int32_t width_mode, double height,
                              int32_t height_mode) override;
  void Destroy() override;
  void SetRuntimeId(int64_t runtime_id) override;
  int64_t GetRuntimeId() override;

 private:
  static const void* copyParamsData(const void* form, uint32_t length);
};
}  // namespace voltron
