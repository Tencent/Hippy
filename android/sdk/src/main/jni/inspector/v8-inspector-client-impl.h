#ifndef INSPECTOR_V8_INSPECTOR_CLIENT_IMPL_H_
#define INSPECTOR_V8_INSPECTOR_CLIENT_IMPL_H_

#include <memory>
#include <string>

#include "jni-env.h"  // NOLINT(build/include_subdir)
#include "runtime.h"  // NOLINT(build/include_subdir)

class V8InspectorClientImpl : public v8_inspector::V8InspectorClient {
 public:
  V8InspectorClientImpl() = default;
  ~V8InspectorClientImpl() override = default;

  static void initInspectorClient(V8Runtime* runtime);
  static void sendMessageToV8(char* params);
  static void onContextDestroyed(V8Runtime* runtime);

  void runMessageLoopOnPause(int contextGroupId) override;
  void quitMessageLoopOnPause() override;
  void runIfWaitingForDebugger(int contextGroupId) override;

  void muteMetrics(int contextGroupId) override {}
  void unmuteMetrics(int contextGroupId) override {}

  void beginUserGesture() override {}
  void endUserGesture() override {}

  std::unique_ptr<v8_inspector::StringBuffer> valueSubtype(
      v8::Local<v8::Value>) override {
    return nullptr;
  }
  bool formatAccessorsAsProperties(v8::Local<v8::Value>) override {
    return false;
  }
  bool isInspectableHeapObject(v8::Local<v8::Object>) override { return true; }

  v8::Local<v8::Context> ensureDefaultContextInGroup(
      int contextGroupId) override {
    return v8::Local<v8::Context>();
  }
  void beginEnsureAllContextsInGroup(int contextGroupId) override {}
  void endEnsureAllContextsInGroup(int contextGroupId) override {}

  void installAdditionalCommandLineAPI(v8::Local<v8::Context>,
                                       v8::Local<v8::Object>) override {}
  void consoleAPIMessage(int contextGroupId,
                         v8::Isolate::MessageErrorLevel level,
                         const v8_inspector::StringView& message,
                         const v8_inspector::StringView& url,
                         unsigned lineNumber, unsigned columnNumber,
                         v8_inspector::V8StackTrace*) override {}

  v8::MaybeLocal<v8::Value> memoryInfo(v8::Isolate*,
                                       v8::Local<v8::Context>) override {
    return v8::MaybeLocal<v8::Value>();
  }

  void consoleTime(const v8_inspector::StringView& title) override {}
  void consoleTimeEnd(const v8_inspector::StringView& title) override {}
  void consoleTimeStamp(const v8_inspector::StringView& title) override {}
  void consoleClear(int contextGroupId) override {}
  double currentTimeMS() override { return 0; }
  typedef void (*TimerCallback)(void*);
  void startRepeatingTimer(double, TimerCallback, void* data) override {}
  void cancelTimer(void* data) override {}

  // TODO(dgozman): this was added to support service worker shadow page. We
  // should not connect at all.
  bool canExecuteScripts(int contextGroupId) override { return true; }

  void maxAsyncCallStackDepthChanged(int depth) override {}
};

#endif  // INSPECTOR_V8_INSPECTOR_CLIENT_IMPL_H_
