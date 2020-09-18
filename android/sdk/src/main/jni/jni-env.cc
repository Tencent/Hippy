/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#include "jni-env.h"  // NOLINT(build/include_subdir)

#include <sys/prctl.h>

#include "core/base/logging.h"

namespace {
JNIEnvironment* instance = nullptr;
}  // namespace

void JNIEnvironment::init(JavaVM* vm, JNIEnv* env) {
  JNIEnvironment::GetInstance()->jvm_ = vm;

  jclass hippyBridgeCls =
      env->FindClass("com/tencent/mtt/hippy/bridge/HippyBridgeImpl");
  JNIEnvironment::GetInstance()->wrapper_.call_natives_method_id =
      env->GetMethodID(
          hippyBridgeCls, "callNatives",
          "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;[B)V");
  JNIEnvironment::GetInstance()->wrapper_.report_exception_method_id =
      env->GetMethodID(hippyBridgeCls, "reportException",
                       "(Ljava/lang/String;Ljava/lang/String;)V");
  JNIEnvironment::GetInstance()->wrapper_.post_code_cache_runnable_method_id =
      env->GetMethodID(hippyBridgeCls, "postCodeCacheRunnable",
                       "(Ljava/lang/String;J)V");
  JNIEnvironment::GetInstance()->wrapper_.delete_code_cache_method_id =
      env->GetStaticMethodID(hippyBridgeCls, "deleteCodeCache",
                             "(Ljava/lang/String;)V");
  JNIEnvironment::GetInstance()->wrapper_.inspector_channel_method_id =
      env->GetMethodID(hippyBridgeCls, "InspectorChannel", "([B)V");

  env->DeleteLocalRef(hippyBridgeCls);
}

JNIEnvironment* JNIEnvironment::GetInstance() {
  if (instance == nullptr) {
    instance = new JNIEnvironment();
  }

  return instance;
}

void JNIEnvironment::DestroyInstance() {
  if (instance) {
    delete instance;
    instance = nullptr;
  }
}

bool JNIEnvironment::ClearJEnvException(JNIEnv* env) {
  jthrowable exc = env->ExceptionOccurred();

  if (exc) {
    env->ExceptionDescribe();
    env->ExceptionClear();

    return true;
  }

  return false;
}

JNIEnv* JNIEnvironment::AttachCurrentThread() {
  JavaVM* jvm_ = JNIEnvironment::GetInstance()->jvm_;
  HIPPY_CHECK(jvm_);

  JNIEnv* env = nullptr;
  jint ret = jvm_->GetEnv(reinterpret_cast<void**>(&env), JNI_VERSION_1_4);
  if (ret == JNI_EDETACHED || !env) {
    JavaVMAttachArgs args;
    args.version = JNI_VERSION_1_4;
    args.group = nullptr;

    // 16 is the maximum size for thread names on Android.
    char thread_name[16];
    int err = prctl(PR_GET_NAME, thread_name);
    if (err < 0) {
      HIPPY_LOG(hippy::Error, "prctl(PR_GET_NAME) Error = %i", err);
      args.name = nullptr;
    } else {
      // HIPPY_LOG(hippy::Debug, "prctl(PR_GET_NAME) = %s", thread_name);
      args.name = thread_name;
    }

    ret = jvm_->AttachCurrentThread(&env, &args);
    HIPPY_DCHECK(JNI_OK == ret);
  }

  return env;
}

void JNIEnvironment::DetachCurrentThread() {
  JavaVM* jvm_ = JNIEnvironment::GetInstance()->jvm_;
  HIPPY_CHECK(jvm_);

  if (jvm_) {
    jvm_->DetachCurrentThread();
  }
}