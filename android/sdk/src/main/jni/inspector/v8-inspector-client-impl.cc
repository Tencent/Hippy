#include "inspector/v8-inspector-client-impl.h"

#include "core/base/logging.h"
#include "core/engine.h"
#include "core/environment.h"
#include "core/napi/v8/js-native-api-v8.h"
#include "core/task/javascript-task-runner.h"
#include "inspector/v8-channel-impl.h"
#include "jni-utils.h"  // NOLINT(build/include_subdir)
#include "runtime.h"    // NOLINT(build/include_subdir)

namespace napi = ::hippy::napi;

void V8InspectorClientImpl::initInspectorClient(V8Runtime* runtime) {
  v8::Isolate* isolate = runtime->isolate;
  v8::HandleScope handle_scope(isolate);

  napi::napi_context napi_ctx = nullptr;
  std::shared_ptr<Environment> environment = runtime->env.lock();
  if (environment) {
    napi_ctx = environment->getContext();
  }
  if (napi_ctx == nullptr) {
    HIPPY_LOG(hippy::Error,
              "initJSFramework initInspectorClient, napi_ctx is null");
    return;
  }

  v8::Local<v8::Context> context =
      v8::Local<v8::Context>::New(isolate, napi_ctx->context_persistent);
  v8::Context::Scope context_scope(context);

  // when reload, inspector_ & channel_ can use cached data
  if (V8ChannelImpl::inspector_ == nullptr) {
    v8_inspector::V8InspectorClient* inspectorClient =
        new V8InspectorClientImpl();
    V8ChannelImpl::inspector_ =
        v8_inspector::V8Inspector::create(isolate, inspectorClient);
  }

  if (V8ChannelImpl::inspector_ == nullptr) {
    HIPPY_LOG(hippy::Error,
              "initJSFramework initInspectorClient, inspector_ is null");
  } else {
    if (V8ChannelImpl::channel_ == nullptr) {
      V8ChannelImpl::channel_ = new V8ChannelImpl(runtime);
    }

    if (V8ChannelImpl::channel_ == nullptr) {
      HIPPY_LOG(hippy::Error,
                "initJSFramework initInspectorClient, channel_ is null");
    } else {
      V8ChannelImpl::runtime_ = runtime;

      const char* name = "Hippy";
      char* name_copy = const_cast<char*>(name);
      uint8_t* name_uint8 = reinterpret_cast<uint8_t*>(name_copy);
      V8ChannelImpl::inspector_->contextCreated(v8_inspector::V8ContextInfo(
          context, 1, v8_inspector::StringView(name_uint8, strlen(name))));
    }
  }
}

void V8InspectorClientImpl::sendMessageToV8(const char* params) {
  if (V8ChannelImpl::channel_ != nullptr) {
    if (strcmp(params, "chrome_socket_closed") == 0) {
      delete V8ChannelImpl::channel_;
      V8ChannelImpl::channel_ =
          new V8ChannelImpl(V8ChannelImpl::runtime_);
    } else {
      auto debug_msg = reinterpret_cast<const uint8_t*>(params);
      v8_inspector::StringView message_view(debug_msg, strlen(params));
      V8ChannelImpl::channel_->session_->dispatchProtocolMessage(message_view);
    }
  }
}

void V8InspectorClientImpl::onContextDestroyed(V8Runtime* runtime) {
  //HIPPY_LOG(hippy::Debug, "hippycoretest initJSFramework onContextDestroyed");

  v8::Isolate* isolate = runtime->isolate;
  v8::HandleScope handle_scope(isolate);

  napi::napi_context napi_ctx = nullptr;
  std::shared_ptr<Environment> environment = runtime->env.lock();
  if (environment) {
    napi_ctx = environment->getContext();
  }
  if (napi_ctx == nullptr) {
    HIPPY_LOG(hippy::Error,
              "initJSFramework onContextDestroyed, napi_ctx is null");
    return;
  }

  v8::Local<v8::Context> context =
      v8::Local<v8::Context>::New(isolate, napi_ctx->context_persistent);
  v8::Context::Scope context_scope(context);

  if (V8ChannelImpl::inspector_ != nullptr) {
    V8ChannelImpl::inspector_->contextDestroyed(context);
  }
}

void V8InspectorClientImpl::runMessageLoopOnPause(int contextGroupId) {
  std::shared_ptr<Engine> engine = V8ChannelImpl::runtime_->pEngine.lock();
  if (engine) {
    engine->jsRunner()->pauseThreadForInspector();
  }
}

void V8InspectorClientImpl::quitMessageLoopOnPause() {
  std::shared_ptr<Engine> engine = V8ChannelImpl::runtime_->pEngine.lock();
  if (engine) {
    engine->jsRunner()->resumeThreadForInspector();
  }
}

void V8InspectorClientImpl::runIfWaitingForDebugger(int contextGroupId) {
  std::shared_ptr<Engine> engine = V8ChannelImpl::runtime_->pEngine.lock();
  if (engine) {
    engine->jsRunner()->resumeThreadForInspector();
  }
  //V8ChannelImpl::runtime_->pEngine->jsRunner()->resumeThreadForInspector();
}
