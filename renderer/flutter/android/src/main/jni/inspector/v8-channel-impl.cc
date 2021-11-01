#include "inspector/v8-channel-impl.h"

#include <string>
#include "base/logging.h"

std::unique_ptr<v8_inspector::V8Inspector> V8ChannelImpl::inspector_ = nullptr;
V8ChannelImpl* V8ChannelImpl::channel_ = nullptr;
V8Runtime* V8ChannelImpl::runtime_ = nullptr;

V8ChannelImpl::V8ChannelImpl(V8Runtime* runtime) {
  V8ChannelImpl::runtime_ = runtime;
  V8ChannelImpl::channel_ = this;
  session_ =
      V8ChannelImpl::inspector_->connect(1, this, v8_inspector::StringView());
}

void V8ChannelImpl::sendResponse(
    int callId, std::unique_ptr<v8_inspector::StringBuffer> message) {

  if (message->string().is8Bit()) {
    return;
  }

  const uint16_t* source = message->string().characters16();
  int len = message->string().length();

  if (runtime_ != nullptr) {
    runtime_->platformRuntime->sendResponse(source, len);
  }
}

void V8ChannelImpl::sendNotification(
    std::unique_ptr<v8_inspector::StringBuffer> message) {

  if (message->string().is8Bit()) {
    return;
  }

  const uint16_t* source = message->string().characters16();
  int len = message->string().length();

  if (runtime_ != nullptr) {
    runtime_->platformRuntime->sendNotification(source, len);
  }
}
