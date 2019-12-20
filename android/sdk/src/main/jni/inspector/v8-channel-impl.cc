#include "inspector/v8-channel-impl.h"

#include <string>
#include "core/base/logging.h"
#include "jni-env.h"  // NOLINT(build/include_subdir)

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
  jbyteArray jMessage = JNIEnvironment::AttachCurrentThread()->NewByteArray(len * sizeof(*source));
  JNIEnvironment::AttachCurrentThread()->SetByteArrayRegion(
      jMessage, 0, len * sizeof(*source),
      reinterpret_cast<const jbyte*>(reinterpret_cast<const char*>(source)));

  if (JNIEnvironment::getInstance()->wrapper.inspectorChannelMethodID) {
    JNIEnvironment::AttachCurrentThread()->CallVoidMethod(V8ChannelImpl::runtime_->hippyBridge, JNIEnvironment::getInstance()->wrapper.inspectorChannelMethodID, jMessage);
  }

  JNIEnvironment::AttachCurrentThread()->DeleteLocalRef(jMessage);
}

void V8ChannelImpl::sendNotification(
    std::unique_ptr<v8_inspector::StringBuffer> message) {

  if (message->string().is8Bit()) {
    return;
  }

  const uint16_t* source = message->string().characters16();
  int len = message->string().length();
  jbyteArray jMessage = JNIEnvironment::AttachCurrentThread()->NewByteArray(len * sizeof(*source));
  JNIEnvironment::AttachCurrentThread()->SetByteArrayRegion(
      jMessage, 0, len * sizeof(*source),
      reinterpret_cast<const jbyte*>(reinterpret_cast<const char*>(source)));

  if (JNIEnvironment::getInstance()->wrapper.inspectorChannelMethodID) {
    JNIEnvironment::AttachCurrentThread()->CallVoidMethod(V8ChannelImpl::runtime_->hippyBridge,
        JNIEnvironment::getInstance()->wrapper.inspectorChannelMethodID,
                           jMessage);
  }

  JNIEnvironment::AttachCurrentThread()->DeleteLocalRef(jMessage);
}
