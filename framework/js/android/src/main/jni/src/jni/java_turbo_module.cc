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

#include "jni/java_turbo_module.h"

#include "core/base/string_view_utils.h"
#include "core/napi/js_native_api_types.h"
#include "core/napi/v8/js_native_turbo_v8.h"
#include "hippy.h"
#include "jni/convert_utils.h"

using namespace hippy::napi;
using unicode_string_view = tdf::base::unicode_string_view;
using StringViewUtils = hippy::base::StringViewUtils;

static jclass argument_utils_clazz;
static jmethodID get_methods_signature;

std::shared_ptr<CtxValue> JavaTurboModule::InvokeJavaMethod(
    TurboEnv &turbo_env,
    const std::shared_ptr<CtxValue> &prop_name,
    const std::shared_ptr<CtxValue> &this_val,
    const std::shared_ptr<CtxValue> *args,
    size_t count) {
  TDF_BASE_DLOG(INFO) << "[turbo-perf] enter invokeJavaMethod";

  std::shared_ptr<Ctx> ctx = turbo_env.context_;
  std::shared_ptr<V8Ctx> v8_ctx = std::static_pointer_cast<V8Ctx>(ctx);
  v8::HandleScope handle_scope(v8_ctx->isolate_);
  v8::Local<v8::Context> context =
      v8_ctx->context_persistent_.Get(v8_ctx->isolate_);
  v8::Context::Scope context_scope(context);

  // methodName & signature
  unicode_string_view str_view;
  std::string method;
  if (v8_ctx->GetValueString(prop_name, &str_view)) {
    method = StringViewUtils::ToU8StdStr(str_view);
  }

  MethodInfo method_info = method_map_[method];
  if (method_info.signature_.empty()) {
    std::string exception_info = std::string("MethodUnsupportedException: ")
                                     .append(name_)
                                     .append(".")
                                     .append(method);
    ConvertUtils::ThrowException(ctx, exception_info);
    return ctx->CreateUndefined();
  }
  TDF_BASE_DLOG(INFO) << "invokeJavaMethod, method= %s", method.c_str();

  // arguments count
  std::vector<std::shared_ptr<CtxValue>> arg_values;
  arg_values.reserve(count);
  for (int i = 0; i < count; i++) {
    arg_values.push_back(args[i]);
  }
  std::string call_info = std::string(name_).append(".").append(method);
  std::vector<std::string> method_arg_types =
      ConvertUtils::GetMethodArgTypesFromSignature(method_info.signature_);
  int expected_count = method_arg_types.size();
  int actual_count = arg_values.size();
  if (expected_count != actual_count) {
    std::string exception_info = std::string("ArgCountException: ")
                                     .append(call_info)
                                     .append(": ExpectedArgCount=")
                                     .append(ToString(expected_count))
                                     .append(", ActualArgCount = ")
                                     .append(ToString(actual_count));
    ConvertUtils::ThrowException(ctx, exception_info);
    return ctx->CreateUndefined();
  }

  // methodId
  JNIEnv *env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  if (!method_info.method_id_) {
    method_info.method_id_ = env->GetMethodID(impl_j_clazz_, method.c_str(),
                                              method_info.signature_.c_str());

    if (!method_info.method_id_) {
      JNIEnvironment::ClearJEnvException(env);

      std::string exception_info = std::string("NullMethodIdException: ")
                                       .append(call_info)
                                       .append(": Signature=")
                                       .append(method_info.signature_);
      ConvertUtils::ThrowException(ctx, exception_info);
      return ctx->CreateUndefined();
    }

    method_map_[method] = method_info;
  }

  std::shared_ptr<JNIArgs> jni_args = nullptr;
  std::shared_ptr<CtxValue> ret = ctx->CreateUndefined();

  try {
    // args convert
    TDF_BASE_DLOG(INFO) << "[turbo-perf] enter convertJSIArgsToJNIArgs";
    jni_args = ConvertUtils::ConvertJSIArgsToJNIArgs(
        turbo_env, name_, method, method_arg_types, arg_values);
    TDF_BASE_DLOG(INFO) << "[turbo-perf] exit convertJSIArgsToJNIArgs";

    TDF_BASE_DLOG(INFO) << "[turbo-perf] enter convertMethodResultToJSValue";

    // call method
    ret = ConvertUtils::ConvertMethodResultToJSValue(
        turbo_env, impl_->GetObj(), method_info, jni_args->args_.data());
    TDF_BASE_DLOG(INFO) << "[turbo-perf] exit convertMethodResultToJSValue";

  } catch (std::runtime_error &e) {
    std::string exception_info =
        std::string(call_info).append(" ").append(e.what());
    ConvertUtils::ThrowException(ctx, exception_info);
    ret = ctx->CreateUndefined();
  }

  DeleteGlobalRef(jni_args);
  TDF_BASE_DLOG(INFO) << "[turbo-perf] exit invokeJavaMethod";

  if (JNIEnvironment::ClearJEnvException(
          JNIEnvironment::GetInstance()->AttachCurrentThread())) {
    TDF_BASE_LOG(ERROR) << "ClearJEnvException when %s", call_info.c_str();
    return ctx->CreateUndefined();
  }

  return ret;
}

void JavaTurboModule::DeleteGlobalRef(const std::shared_ptr<JNIArgs> &jni_args) {
  TDF_BASE_DLOG(INFO) << "enter deleteGlobalRef";
  JNIEnv *env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  if (!jni_args || jni_args->global_refs_.empty()) {
    return;
  }

  TDF_BASE_DLOG(INFO) << "deleteGlobalRef size %d",
      jni_args->global_refs_.size();
  for (auto global_ref : jni_args->global_refs_) {
    if (global_ref) {
      env->DeleteGlobalRef(global_ref);
    }
  }
}

void JavaTurboModule::InitPropertyMap() {
  JNIEnv *env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  jclass obj_clazz = env->GetObjectClass(impl_->GetObj());
  impl_j_clazz_ = (jclass)env->NewGlobalRef(obj_clazz);
  auto methods_sig = (jstring)env->CallStaticObjectMethod(
      argument_utils_clazz, get_methods_signature, impl_->GetObj());
  if (methods_sig) {
    unicode_string_view str_view = JniUtils::ToStrView(env, methods_sig);
    std::string method_map_str = StringViewUtils::ToU8StdStr(str_view);
    method_map_ = ConvertUtils::GetMethodMap(method_map_str);
    env->DeleteLocalRef(methods_sig);
  }

  env->DeleteLocalRef(obj_clazz);
}

JavaTurboModule::JavaTurboModule(const std::string &name,
                                 std::shared_ptr<JavaRef> &impl)
    : HippyTurboModule(name), impl_(impl) {
  InitPropertyMap();
}

JavaTurboModule::~JavaTurboModule() {
  TDF_BASE_DLOG(INFO) << "~JavaTurboModule %s", name_.c_str();

  if (impl_) {
    impl_.reset();
  }

  if (impl_j_clazz_) {
    JNIEnvironment::GetInstance()->AttachCurrentThread()->DeleteGlobalRef(
        impl_j_clazz_);
  }

  if (!method_map_.empty()) {
    method_map_.clear();
  }
}

std::shared_ptr<CtxValue> JavaTurboModule::Get(
    TurboEnv &turbo_env,
    const std::shared_ptr<CtxValue> &prop_name) {
  return turbo_env.CreateFunction(
      prop_name, 0,
      [=](TurboEnv &env, const std::shared_ptr<CtxValue> &thisVal,
          const std::shared_ptr<CtxValue> *args, size_t count) {
        return InvokeJavaMethod(env, prop_name, thisVal, args, count);
      });
}

void JavaTurboModule::Init() {
  JNIEnv *env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  jclass argument_utils_clazz_local =
      env->FindClass("com/tencent/mtt/hippy/utils/ArgumentUtils");
  argument_utils_clazz =
      (jclass)(env->NewGlobalRef(argument_utils_clazz_local));
  get_methods_signature =
      env->GetStaticMethodID(argument_utils_clazz, "getMethodsSignature",
                             "(Ljava/lang/Object;)Ljava/lang/String;");
  env->DeleteLocalRef(argument_utils_clazz_local);
}

void JavaTurboModule::Destory() {
  JNIEnv *env = JNIEnvironment::GetInstance()->AttachCurrentThread();

  if (argument_utils_clazz) {
    env->DeleteGlobalRef(argument_utils_clazz);
  }

  get_methods_signature = nullptr;
}
