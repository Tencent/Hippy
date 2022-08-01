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
#include "jni/jni_env.h"
#include "jni/jni_utils.h"

using namespace hippy::napi;
using unicode_string_view = footstone::stringview::unicode_string_view;
using StringViewUtils = hippy::base::StringViewUtils;

static jclass argument_utils_clazz;
static jmethodID get_methods_signature;

std::shared_ptr<CtxValue> JavaTurboModule::InvokeJavaMethod(
    TurboEnv &turbo_env,
    const std::shared_ptr<CtxValue> &prop_name,
    const std::shared_ptr<CtxValue> &this_val,
    const std::shared_ptr<CtxValue> *args,
    size_t count) {
  FOOTSTONE_DLOG(INFO) << "[turbo-perf] enter invokeJavaMethod";

  std::shared_ptr<Ctx> ctx = turbo_env.context_;
  std::shared_ptr<V8Ctx> v8_ctx = std::static_pointer_cast<V8Ctx>(ctx);
  auto isolate = v8_ctx->isolate_;
  v8::HandleScope handle_scope(isolate);
  v8::Local<v8::Context> context = v8_ctx->context_persistent_.Get(isolate);
  v8::Context::Scope context_scope(context);

  // methodName & signature
  unicode_string_view str_view;
  std::string method;
  if (v8_ctx->GetValueString(prop_name, &str_view)) {
    method = StringViewUtils::ToU8StdStr(str_view);
  }

  MethodInfo method_info = method_map_[method];
  if (method_info.signature_.empty()) {
    std::string exception_info = "MethodUnsupportedException: " + name_ +  "." + method;
    v8_ctx->ThrowException(unicode_string_view((std::move(exception_info))));
    return v8_ctx->CreateUndefined();
  }
  FOOTSTONE_DLOG(INFO) << "invokeJavaMethod, method = " << method.c_str();

  // arguments count
  std::vector<std::shared_ptr<CtxValue>> arg_values;
  arg_values.reserve(count);
  for (size_t i = 0; i < count; i++) {
    arg_values.push_back(args[i]);
  }
  std::string call_info = std::string(name_).append(".").append(method);
  std::vector<std::string> method_arg_types =
      ConvertUtils::GetMethodArgTypesFromSignature(method_info.signature_);
  auto expected_count = method_arg_types.size();
  auto actual_count = arg_values.size();
  if (expected_count != actual_count) {
    std::string exception_info = "ArgCountException: " +
        call_info + ": ExpectedArgCount=" + std::to_string(expected_count) +
        ", ActualArgCount = " + std::to_string(actual_count);
    v8_ctx->ThrowException(unicode_string_view((std::move(exception_info))));
    return v8_ctx->CreateUndefined();
  }

  // methodId
  JNIEnv *env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  if (!method_info.method_id_) {
    method_info.method_id_ = env->GetMethodID((jclass)(impl_j_clazz_->GetObj()),
                                              method.c_str(),
                                              method_info.signature_.c_str());

    if (!method_info.method_id_) {
      JNIEnvironment::ClearJEnvException(env);
      std::string exception_info = "NullMethodIdException: " + call_info +
          ": Signature=" + method_info.signature_;
      v8_ctx->ThrowException(unicode_string_view((std::move(exception_info))));
      return v8_ctx->CreateUndefined();
    }

    method_map_[method] = method_info;
  }

  std::shared_ptr<JNIArgs> jni_args;
  std::shared_ptr<CtxValue> ret = v8_ctx->CreateUndefined();

  // args convert
  FOOTSTONE_DLOG(INFO) << "[turbo-perf] enter convertJSIArgsToJNIArgs";
  auto jni_tuple = ConvertUtils::ConvertJSIArgsToJNIArgs(
      turbo_env, name_, method, method_arg_types, arg_values);
  FOOTSTONE_DLOG(INFO) << "[turbo-perf] exit convertJSIArgsToJNIArgs";
  if (!std::get<0>(jni_tuple)) {
    v8_ctx->ThrowException(unicode_string_view(std::get<1>(jni_tuple)));
    return v8_ctx->CreateUndefined();
  }
  jni_args = std::get<2>(jni_tuple);
  FOOTSTONE_DLOG(INFO) << "[turbo-perf] enter convertMethodResultToJSValue";

  // call method
  auto js_tuple = ConvertUtils::ConvertMethodResultToJSValue(
      turbo_env, impl_->GetObj(), method_info, jni_args->args_.data());
  FOOTSTONE_DLOG(INFO) << "[turbo-perf] exit convertMethodResultToJSValue";
  if (!std::get<0>(js_tuple)) {
    v8_ctx->ThrowException(unicode_string_view(std::get<1>(js_tuple)));
    return v8_ctx->CreateUndefined();
  }

  FOOTSTONE_DLOG(INFO) << "[turbo-perf] exit invokeJavaMethod";

  if (JNIEnvironment::ClearJEnvException(
      JNIEnvironment::GetInstance()->AttachCurrentThread())) {
    FOOTSTONE_LOG(ERROR) << "ClearJEnvException when %s", call_info.c_str();
    return v8_ctx->CreateUndefined();
  }

  return std::get<2>(js_tuple);
}

void JavaTurboModule::InitPropertyMap() {
  JNIEnv *j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  jclass obj_clazz = j_env->GetObjectClass(impl_->GetObj());
  impl_j_clazz_ = std::make_shared<JavaRef>(j_env, j_env->NewGlobalRef(obj_clazz));
  auto methods_sig = (jstring) j_env->CallStaticObjectMethod(
      argument_utils_clazz, get_methods_signature, impl_->GetObj());
  if (methods_sig) {
    unicode_string_view str_view = JniUtils::ToStrView(j_env, methods_sig);
    std::string method_map_str = StringViewUtils::ToU8StdStr(str_view);
    method_map_ = ConvertUtils::GetMethodMap(method_map_str);
    j_env->DeleteLocalRef(methods_sig);
  }

  j_env->DeleteLocalRef(obj_clazz);
}

JavaTurboModule::JavaTurboModule(const std::string &name,
                                 std::shared_ptr<JavaRef> &impl)
    : HippyTurboModule(name), impl_(impl), impl_j_clazz_(nullptr) {
  InitPropertyMap();
}

JavaTurboModule::~JavaTurboModule() {
  FOOTSTONE_DLOG(INFO) << "~JavaTurboModule " << name_.c_str();
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
      (jclass) (env->NewGlobalRef(argument_utils_clazz_local));
  get_methods_signature =
      env->GetStaticMethodID(argument_utils_clazz, "getMethodsSignature",
                             "(Ljava/lang/Object;)Ljava/lang/String;");
  env->DeleteLocalRef(argument_utils_clazz_local);
}

void JavaTurboModule::Destroy() {
  JNIEnv *env = JNIEnvironment::GetInstance()->AttachCurrentThread();

  if (argument_utils_clazz) {
    env->DeleteGlobalRef(argument_utils_clazz);
  }

  get_methods_signature = nullptr;
}
