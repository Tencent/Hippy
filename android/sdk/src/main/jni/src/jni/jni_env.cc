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

#include "jni/jni_env.h"

#include <sys/prctl.h>

#include "core/core.h"

std::shared_ptr<JNIEnvironment> JNIEnvironment::instance_ = nullptr;
std::mutex JNIEnvironment::mutex_;

void JNIEnvironment::init(JavaVM* j_vm, JNIEnv* j_env) {
  j_vm_ = j_vm;

  jclass hippy_bridge_cls =
      j_env->FindClass("com/tencent/mtt/hippy/bridge/HippyBridgeImpl");
  wrapper_.call_natives_method_id = j_env->GetMethodID(
      hippy_bridge_cls, "callNatives",
      "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;[B)V");
  wrapper_.report_exception_method_id =
      j_env->GetMethodID(hippy_bridge_cls, "reportException",
                         "(Ljava/lang/String;Ljava/lang/String;)V");
  wrapper_.inspector_channel_method_id =
      j_env->GetMethodID(hippy_bridge_cls, "InspectorChannel", "([B)V");

  wrapper_.fetch_resource_method_id = j_env->GetMethodID(
      hippy_bridge_cls, "fetchResourceWithUri", "(Ljava/lang/String;J)V");

  j_env->DeleteLocalRef(hippy_bridge_cls);

  if (j_env->ExceptionCheck()) {
    j_env->ExceptionClear();
  }
}

std::shared_ptr<JNIEnvironment> JNIEnvironment::GetInstance() {
  std::lock_guard<std::mutex> lock(mutex_);
  if (!instance_) {
    instance_ = std::make_shared<JNIEnvironment>();
  }

  return instance_;
}

void JNIEnvironment::DestroyInstance() {
  std::lock_guard<std::mutex> lock(mutex_);
  instance_ = nullptr;
}

bool JNIEnvironment::ClearJEnvException(JNIEnv* j_env) {
  jthrowable j_exc = j_env->ExceptionOccurred();

  if (j_exc) {
    j_env->ExceptionDescribe();
    j_env->ExceptionClear();

    return true;
  }

  return false;
}

JNIEnv* JNIEnvironment::AttachCurrentThread() {
  HIPPY_CHECK(j_vm_);

  JNIEnv* j_env = nullptr;
  jint ret = j_vm_->GetEnv(reinterpret_cast<void**>(&j_env), JNI_VERSION_1_4);
  if (ret == JNI_EDETACHED || !j_env) {
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
      args.name = thread_name;
    }

    ret = j_vm_->AttachCurrentThread(&j_env, &args);
    HIPPY_DCHECK(JNI_OK == ret);
  }

  return j_env;
}

void JNIEnvironment::DetachCurrentThread() {
  HIPPY_CHECK(j_vm_);

  if (j_vm_) {
    j_vm_->DetachCurrentThread();
  }
}
