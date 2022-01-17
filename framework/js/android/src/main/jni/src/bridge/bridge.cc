#include "bridge/bridge.h"

#include "jni/jni_env.h"

namespace hippy {

void ADRBridge::SendResponse(std::unique_ptr<v8_inspector::StringBuffer> message) {
  if (message->string().is8Bit()) {
    return;
  }

  const uint16_t* source = message->string().characters16();
  int len = message->string().length();
  std::shared_ptr<JNIEnvironment> instance = JNIEnvironment::GetInstance();
  JNIEnv* j_env = instance->AttachCurrentThread();
  jbyteArray msg = j_env->NewByteArray(len * sizeof(*source));
  j_env->SetByteArrayRegion(
      msg, 0, len * sizeof(*source),
      reinterpret_cast<const jbyte*>(reinterpret_cast<const char*>(source)));

  if (instance->GetMethods().j_inspector_channel_method_id && ref_) {
    j_env->CallVoidMethod(ref_->GetObj(),
                          instance->GetMethods().j_inspector_channel_method_id,
                          msg);
  }

  j_env->DeleteLocalRef(msg);
};

void ADRBridge::SendNotification(std::unique_ptr<v8_inspector::StringBuffer> message) {
  if (message->string().is8Bit()) {
    return;
  }

  const uint16_t* source = message->string().characters16();
  int len = message->string().length();
  std::shared_ptr<JNIEnvironment> instance = JNIEnvironment::GetInstance();
  JNIEnv* j_env = instance->AttachCurrentThread();
  jbyteArray msg = j_env->NewByteArray(len * sizeof(*source));
  j_env->SetByteArrayRegion(
      msg, 0, len * sizeof(*source),
      reinterpret_cast<const jbyte*>(reinterpret_cast<const char*>(source)));

  if (instance->GetMethods().j_inspector_channel_method_id && ref_) {
    j_env->CallVoidMethod(ref_->GetObj(),
                          instance->GetMethods().j_inspector_channel_method_id,
                          msg);
  }

  j_env->DeleteLocalRef(msg);
}

}
