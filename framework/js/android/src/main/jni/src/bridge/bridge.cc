#include "bridge/bridge.h"

#include "jni/jni_env.h"

namespace hippy {

#ifdef ENABLE_INSPECTOR
void ADRBridge::SendResponse(std::unique_ptr<v8_inspector::StringBuffer> message) {
  if (message->string().is8Bit()) {
    return;
  }

  const uint16_t* source = message->string().characters16();
  auto len = hippy::base::checked_numeric_cast<size_t, jsize>(
      message->string().length() * sizeof(*source));
  std::shared_ptr<JNIEnvironment> instance = JNIEnvironment::GetInstance();
  JNIEnv* j_env = instance->AttachCurrentThread();
  jbyteArray msg = j_env->NewByteArray(len);
  j_env->SetByteArrayRegion(
      msg, 0, len,
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
  auto len = hippy::base::checked_numeric_cast<size_t, jsize>(
      message->string().length() * sizeof(*source));
  std::shared_ptr<JNIEnvironment> instance = JNIEnvironment::GetInstance();
  JNIEnv* j_env = instance->AttachCurrentThread();
  jbyteArray msg = j_env->NewByteArray(len);
  j_env->SetByteArrayRegion(
      msg, 0, len,
      reinterpret_cast<const jbyte*>(reinterpret_cast<const char*>(source)));

  if (instance->GetMethods().j_inspector_channel_method_id && ref_) {
    j_env->CallVoidMethod(ref_->GetObj(),
                          instance->GetMethods().j_inspector_channel_method_id,
                          msg);
  }

  j_env->DeleteLocalRef(msg);
}
#endif

}
