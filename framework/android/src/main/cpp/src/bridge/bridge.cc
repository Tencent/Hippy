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

#include "bridge/bridge.h"

#include "driver/base/common.h"
#include "footstone/check.h"
#include "jni/jni_env.h"

namespace hippy {

#if defined(ENABLE_INSPECTOR) && !defined(V8_WITHOUT_INSPECTOR)
void ADRBridge::SendResponse(std::unique_ptr<v8_inspector::StringBuffer> message) {
  if (message->string().is8Bit()) {
    return;
  }

  const uint16_t* source = message->string().characters16();
  auto len = footstone::check::checked_numeric_cast<size_t, jsize>(
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
    JNIEnvironment::ClearJEnvException(j_env);
  }

  j_env->DeleteLocalRef(msg);
}

void ADRBridge::SendNotification(std::unique_ptr<v8_inspector::StringBuffer> message) {
  if (message->string().is8Bit()) {
    return;
  }

  const uint16_t* source = message->string().characters16();
  auto len = footstone::check::checked_numeric_cast<size_t, jsize>(
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
    JNIEnvironment::ClearJEnvException(j_env);
  }

  j_env->DeleteLocalRef(msg);
}
#endif

}
