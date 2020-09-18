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

#include "exception-handler.h"  // NOLINT(build/include_subdir)

#include "core/base/logging.h"
#include "jni-env.h"    // NOLINT(build/include_subdir)
#include "jni-utils.h"  // NOLINT(build/include_subdir)

void ExceptionHandler::ReportJsException(std::shared_ptr<V8Runtime> runtime,
                                         std::stringstream& description_stream,
                                         std::stringstream& stack_stream) {
  HIPPY_DLOG(hippy::Debug, "ReportJsException begin");

  JNIEnv* env = JNIEnvironment::AttachCurrentThread();

  jstring jException = env->NewStringUTF(description_stream.str().c_str());
  jstring jStackTrace = env->NewStringUTF(stack_stream.str().c_str());

  if (runtime->bridge_) {
    env->CallVoidMethod(
        runtime->bridge_->GetObj(),
        JNIEnvironment::GetInstance()->wrapper_.report_exception_method_id,
        jException, jStackTrace);
  }

  // delete local ref
  env->DeleteLocalRef(jException);
  env->DeleteLocalRef(jStackTrace);

  HIPPY_DLOG(hippy::Debug, "ReportJsException end");
}

void ExceptionHandler::JSONException(std::shared_ptr<V8Runtime> runtime,
                                     const char* jsonValue) {
  if (!runtime) {  // nullptr
    return;
  }

  if (!jsonValue) {  // nullptr
    return;
  }

  JNIEnv* env = JNIEnvironment::AttachCurrentThread();

  jstring jException = env->NewStringUTF("Hippy Bridge parse json error_");
  jstring jStackTrace = env->NewStringUTF(jsonValue);

  // call function
  if (runtime->bridge_) {
    env->CallVoidMethod(
        runtime->bridge_->GetObj(),
        JNIEnvironment::GetInstance()->wrapper_.report_exception_method_id,
        jException, jStackTrace);
  }

  // delete local ref
  env->DeleteLocalRef(jException);
  env->DeleteLocalRef(jStackTrace);
}
