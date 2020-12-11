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

#include "jni/exception_handler.h"  // NOLINT(build/include_subdir)

<<<<<<< HEAD:android/sdk/src/main/jni/exception-handler.cc
#include "core/base/logging.h"
#include "jni-env.h"    // NOLINT(build/include_subdir)
#include "jni-utils.h"  // NOLINT(build/include_subdir)
=======
#include "core/core.h"
#include "jni/jni_env.h"    // NOLINT(build/include_subdir)
#include "jni/jni_utils.h"  // NOLINT(build/include_subdir)
>>>>>>> 7419592... feat(core): add dynamic load:android/sdk/src/main/jni/jni/exception_handler.cc

void ExceptionHandler::ReportJsException(std::shared_ptr<Runtime> runtime,
                                         const std::string desc,
                                         const std::string stack) {
  HIPPY_DLOG(hippy::Debug, "ReportJsException begin");

  JNIEnv* env = JNIEnvironment::AttachCurrentThread();

  jstring jException = env->NewStringUTF(desc.c_str());
  jstring jStackTrace = env->NewStringUTF(stack.c_str());

  if (runtime->GetBridge()) {
    env->CallVoidMethod(
        runtime->GetBridge()->GetObj(),
        JNIEnvironment::GetInstance()->wrapper_.report_exception_method_id,
        jException, jStackTrace);
  }

  // delete local ref
  env->DeleteLocalRef(jException);
  env->DeleteLocalRef(jStackTrace);

  HIPPY_DLOG(hippy::Debug, "ReportJsException end");
}

void ExceptionHandler::JSONException(std::shared_ptr<Runtime> runtime,
                                     const char* jsonValue) {
  if (!runtime) {  // nullptr
    return;
  }

  if (!jsonValue) {  // nullptr
    return;
  }

  JNIEnv* env = JNIEnvironment::AttachCurrentThread();

  jstring jException = env->NewStringUTF("Hippy Bridge parse json error");
  jstring jStackTrace = env->NewStringUTF(jsonValue);

  // call function
  if (runtime->GetBridge()) {
    env->CallVoidMethod(
        runtime->GetBridge()->GetObj(),
        JNIEnvironment::GetInstance()->wrapper_.report_exception_method_id,
        jException, jStackTrace);
  }

  // delete local ref
  env->DeleteLocalRef(jException);
  env->DeleteLocalRef(jStackTrace);
}
