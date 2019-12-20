//
// Created by howlpan on 2019/4/17.
//

#include "jni-env.h"  // NOLINT(build/include_subdir)

#include<sys/prctl.h>

#include "core/base/logging.h"

namespace {
  JNIEnvironment* instance = nullptr;
} // namespace

void JNIEnvironment::init(JavaVM* vm, JNIEnv* env) {
  JNIEnvironment::getInstance()->jvm = vm;

  jclass hippyBridgeCls =
      env->FindClass("com/tencent/mtt/hippy/bridge/HippyBridgeImpl");
  JNIEnvironment::getInstance()->wrapper.callNativesMethodID = env->GetMethodID(
      hippyBridgeCls, "callNatives",
      "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;[B)V");
  JNIEnvironment::getInstance()->wrapper.reportExceptionMethodID =
      env->GetMethodID(hippyBridgeCls, "reportException",
                       "(Ljava/lang/String;Ljava/lang/String;)V");
  JNIEnvironment::getInstance()->wrapper.postCodeCacheRunnableMethodID =
      env->GetMethodID(hippyBridgeCls, "postCodeCacheRunnable",
                       "(Ljava/lang/String;J)V");
  JNIEnvironment::getInstance()->wrapper.deleteCodeCacheMethodID =
      env->GetStaticMethodID(hippyBridgeCls, "deleteCodeCache",
                             "(Ljava/lang/String;)V");
  JNIEnvironment::getInstance()->wrapper.inspectorChannelMethodID =
      env->GetMethodID(hippyBridgeCls, "InspectorChannel", "([B)V");

  env->DeleteLocalRef(hippyBridgeCls);
}

JNIEnvironment* JNIEnvironment::getInstance() {
  if (instance == nullptr) {
    instance = new JNIEnvironment();
  }

  return instance;
}

void JNIEnvironment::destroyInstance() {
  if (instance == nullptr) {
    delete instance;
    instance = nullptr;
  }
}

bool JNIEnvironment::clearJEnvException(JNIEnv* env) {
  jthrowable exc = env->ExceptionOccurred();

  if (exc) {
    env->ExceptionDescribe();
    env->ExceptionClear();

    return true;
  }

  return false;
}

JNIEnv* JNIEnvironment::AttachCurrentThread() {

  JavaVM* jvm = JNIEnvironment::getInstance()->jvm;
  HIPPY_CHECK(jvm);

  JNIEnv* env = nullptr;
  jint ret = jvm->GetEnv(reinterpret_cast<void**>(&env), JNI_VERSION_1_4);
  if (ret == JNI_EDETACHED || !env) {
    JavaVMAttachArgs args;
    args.version = JNI_VERSION_1_4;
    args.group = nullptr;

    // 16 is the maximum size for thread names on Android.
    char thread_name[16];
    int err = prctl(PR_GET_NAME, thread_name);
    if (err < 0 ) {
      HIPPY_LOG(hippy::Error, "prctl(PR_GET_NAME) Error = %i", err);
      args.name = nullptr;
    } else {
      //HIPPY_LOG(hippy::Debug, "prctl(PR_GET_NAME) = %s", thread_name);
      args.name = thread_name;
    }

    ret = jvm->AttachCurrentThread(&env, &args);
    HIPPY_DCHECK(JNI_OK == ret);
  }

  return env;
}

void JNIEnvironment::DetachCurrentThread() {
  JavaVM* jvm = JNIEnvironment::getInstance()->jvm;
  HIPPY_CHECK(jvm);

  if (jvm) {
    jvm->DetachCurrentThread();
  }
}
/*
JNIEnvPtr::JNIEnvPtr() {
  if (JNIEnvironment::getInstance()->jvm->GetEnv((void**)&env_, JNI_VERSION_1_4) == JNI_EDETACHED) {
    JNIEnvironment::getInstance()->jvm->AttachCurrentThread(&env_, nullptr);
    need_detach_ = true;
  }
}

JNIEnvPtr::~JNIEnvPtr() {
  if (need_detach_) {
    JNIEnvironment::getInstance()->jvm->DetachCurrentThread();
  }
}
*/