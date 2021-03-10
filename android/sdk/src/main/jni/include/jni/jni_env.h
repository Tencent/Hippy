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

#include <jni.h>

#include "core/core.h"

class JNIEnvironment {
 public:
  struct JemthodID_Wrapper {
    JemthodID_Wrapper() {
      call_natives_method_id = nullptr;
      report_exception_method_id = nullptr;
      inspector_channel_method_id = nullptr;
      get_uri_content_method_id = nullptr;
    }

    jmethodID call_natives_method_id;
    jmethodID report_exception_method_id;
    jmethodID inspector_channel_method_id;
    jmethodID get_uri_content_method_id;
  };

 public:
  JNIEnvironment() = default;
  ~JNIEnvironment() = default;

  void init(JavaVM* vm, JNIEnv* env);

  static bool ClearJEnvException(JNIEnv* env);
  static JNIEnvironment* GetInstance();
  static void DestroyInstance();
  static JNIEnv* AttachCurrentThread();
  static void DetachCurrentThread();

 public:
  JavaVM* jvm_;
  JemthodID_Wrapper wrapper_;
};
