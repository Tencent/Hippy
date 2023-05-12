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

#include "connector/exception_handler.h"

#include "connector/bridge.h"
#include "footstone/string_view_utils.h"
#include "jni/jni_env.h"
#include "jni/jni_utils.h"

namespace hippy {
inline namespace framework {

using StringViewUtils = footstone::stringview::StringViewUtils;

jmethodID j_report_exception_method_id;

void ExceptionHandler::ReportJsException(const std::any& bridge,
                                         const string_view& description,
                                         const string_view& stack) {
  FOOTSTONE_DLOG(INFO) << "ReportJsException begin";

  auto j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  auto j_exception = JniUtils::StrViewToJString(j_env, description);
  auto j_stack_trace = JniUtils::StrViewToJString(j_env, stack);

  auto bridge_object = std::any_cast<std::shared_ptr<hippy::Bridge>>(bridge);
  j_env->CallVoidMethod(bridge_object->GetObj(),j_report_exception_method_id,
                        j_exception, j_stack_trace);
  JNIEnvironment::ClearJEnvException(j_env);

  j_env->DeleteLocalRef(j_exception);
  j_env->DeleteLocalRef(j_stack_trace);

  FOOTSTONE_DLOG(INFO) << "ReportJsException end";
}

void ExceptionHandler::Init(JNIEnv* j_env) {
  auto j_hippy_bridge_cls = j_env->FindClass("com/openhippy/connector/JsDriver");
  j_report_exception_method_id = j_env->GetMethodID(j_hippy_bridge_cls, "reportException",
                                                    "(Ljava/lang/String;Ljava/lang/String;)V");
  j_env->DeleteLocalRef(j_hippy_bridge_cls);

  if (j_env->ExceptionCheck()) {
    j_env->ExceptionClear();
  }
}

}
}
