#ifndef INSPECTOR_V8_CHANNEL_IMPL_H_
#define INSPECTOR_V8_CHANNEL_IMPL_H_

#include <memory>

#include "jni-utils.h"  // NOLINT(build/include_subdir)
#include "runtime.h"    // NOLINT(build/include_subdir)
#include "third_party/v8/v8-inspector.h"

class JNIEnvironment;

class V8ChannelImpl : public v8_inspector::V8Inspector::Channel {
 public:
  V8ChannelImpl(V8Runtime* runtime);
  ~V8ChannelImpl() override = default;

  inline const char* ToCString(const v8::String::Utf8Value& value) {
    JniUtils utils;
    return utils.ToCString(value);
  }

  void sendResponse(
      int callId, std::unique_ptr<v8_inspector::StringBuffer> message) override;
  void sendNotification(
      std::unique_ptr<v8_inspector::StringBuffer> message) override;
  void flushProtocolNotifications() override {}

 public:
  static std::unique_ptr<v8_inspector::V8Inspector> inspector_;
  static V8ChannelImpl* channel_;
  static V8Runtime* runtime_;

 public:
  std::unique_ptr<v8_inspector::V8InspectorSession> session_;
};

#endif  // INSPECTOR_V8_CHANNEL_IMPL_H_
