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

#include "inspector/v8_channel_impl.h"

#include <string>

#include "jni/jni_env.h"

V8ChannelImpl::V8ChannelImpl(std::shared_ptr<JavaRef> bridge)
    : bridge_(bridge) {}

void V8ChannelImpl::sendResponse(
    int callId,
    std::unique_ptr<v8_inspector::StringBuffer> message) {
  if (message->string().is8Bit()) {
    return;
  }

  const uint16_t* source = message->string().characters16();
  int len = message->string().length();
  jbyteArray msg = JNIEnvironment::AttachCurrentThread()->NewByteArray(
      len * sizeof(*source));
  JNIEnvironment::AttachCurrentThread()->SetByteArrayRegion(
      msg, 0, len * sizeof(*source),
      reinterpret_cast<const jbyte*>(reinterpret_cast<const char*>(source)));

  if (JNIEnvironment::GetInstance()->wrapper_.inspector_channel_method_id &&
      bridge_) {
    JNIEnvironment::AttachCurrentThread()->CallVoidMethod(
        bridge_->GetObj(),
        JNIEnvironment::GetInstance()->wrapper_.inspector_channel_method_id,
        msg);
  }

  JNIEnvironment::AttachCurrentThread()->DeleteLocalRef(msg);
}

void V8ChannelImpl::sendNotification(
    std::unique_ptr<v8_inspector::StringBuffer> message) {
  if (message->string().is8Bit()) {
    return;
  }

  const uint16_t* source = message->string().characters16();
  int len = message->string().length();
  jbyteArray msg = JNIEnvironment::AttachCurrentThread()->NewByteArray(
      len * sizeof(*source));
  JNIEnvironment::AttachCurrentThread()->SetByteArrayRegion(
      msg, 0, len * sizeof(*source),
      reinterpret_cast<const jbyte*>(reinterpret_cast<const char*>(source)));

  if (JNIEnvironment::GetInstance()->wrapper_.inspector_channel_method_id &&
      bridge_) {
    JNIEnvironment::AttachCurrentThread()->CallVoidMethod(
        bridge_->GetObj(),
        JNIEnvironment::GetInstance()->wrapper_.inspector_channel_method_id,
        msg);
  }

  JNIEnvironment::AttachCurrentThread()->DeleteLocalRef(msg);
}
