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

#include "jni/exception_handler.h"

#include "core/base/string_view_utils.h"
#include "core/core.h"
#include "jni/jni_env.h"
#include "jni/jni_utils.h"

using StringViewUtils = hippy::base::StringViewUtils;

void ExceptionHandler::ReportJsException(const std::shared_ptr<Runtime>& runtime,
                                         const unicode_string_view& desc,
                                         const unicode_string_view& stack) {
  TDF_BASE_DLOG(INFO) << "ReportJsException begin";

  JNIEnv* j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  jstring j_exception = JniUtils::StrViewToJString(j_env, desc);
  jstring j_stack_trace = JniUtils::StrViewToJString(j_env, stack);

  if (runtime->GetBridge()) {
    j_env->CallVoidMethod(runtime->GetBridge()->GetObj(),
                          JNIEnvironment::GetInstance()
                              ->GetMethods()
                              .j_report_exception_method_id,
                          j_exception, j_stack_trace);
  }

  j_env->DeleteLocalRef(j_exception);
  j_env->DeleteLocalRef(j_stack_trace);

  TDF_BASE_DLOG(INFO) << "ReportJsException end";
}
