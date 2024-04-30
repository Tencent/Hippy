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
using unicode_string_view = tdf::base::unicode_string_view;
using StringViewUtils = hippy::base::StringViewUtils;

static jclass argument_utils_clazz;
static jmethodID get_methods_signature;

std::shared_ptr<CtxValue> JavaTurboModule::InvokeJavaMethod(const std::shared_ptr<CtxValue>& prop_name,
                                                            const CallbackInfo& info,
                                                            void* data) {
  TDF_BASE_DLOG(INFO) << "[turbo-perf] enter invokeJavaMethod";

  auto scope_wrapper = reinterpret_cast<ScopeWrapper*>(std::any_cast<void*>(info.GetSlot()));
  auto scope = scope_wrapper->scope.lock();
  TDF_BASE_CHECK(scope);
  auto context = scope->GetContext();
  // methodName & signature
  unicode_string_view str_view;
  std::string method;
  if (context->GetValueString(prop_name, &str_view)) {
    method = StringViewUtils::ToU8StdStr(str_view);
  }

  auto method_info = method_map_[method];
  if (method_info.signature_.empty()) {
    std::string exception_info = "MethodUnsupportedException: " + name + "." + method;
    context->ThrowException(unicode_string_view(exception_info));
    return context->CreateUndefined();
  }
  TDF_BASE_DLOG(INFO) << "invokeJavaMethod, method = " << method.c_str();

  // arguments count
  std::vector<std::shared_ptr<CtxValue>> argv;
  for (size_t i = 0; i < info.Length(); ++i) {
    argv.push_back(info[i]);
  }
  std::string call_info = name + "." + method;
  std::vector<std::string> method_arg_types = ConvertUtils::GetMethodArgTypesFromSignature(method_info.signature_);
  auto expected_count = method_arg_types.size();
  if (expected_count != info.Length()) {
    std::string exception = "ArgCountException: " + call_info + ": ExpectedArgCount = " + std::to_string(expected_count)
        + ", ActualArgCount = " + std::to_string(info.Length());
    context->ThrowException(unicode_string_view(exception));
    return context->CreateUndefined();
  }

  // methodId
  JNIEnv *env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  if (!method_info.method_id_) {
    method_info.method_id_ = env->GetMethodID((jclass)(impl_j_clazz_->GetObj()),
                                              method.c_str(),
                                              method_info.signature_.c_str());

    if (!method_info.method_id_) {
      JNIEnvironment::ClearJEnvException(env);
      std::string exception = "NullMethodIdException: " + call_info + ": Signature = " + method_info.signature_;
      context->ThrowException(unicode_string_view(exception));
      return context->CreateUndefined();
    }

    method_map_[method] = method_info;
  }

  std::shared_ptr<JNIArgs> jni_args;
  // args convert
  TDF_BASE_DLOG(INFO) << "[turbo-perf] enter convertJSIArgsToJNIArgs";
  auto jni_tuple = ConvertUtils::ConvertJSIArgsToJNIArgs(
      context, name, method, method_arg_types, argv);
  TDF_BASE_DLOG(INFO) << "[turbo-perf] exit convertJSIArgsToJNIArgs";
  if (!std::get<0>(jni_tuple)) {
    context->ThrowException(unicode_string_view(std::get<1>(jni_tuple)));
    return context->CreateUndefined();
  }
  jni_args = std::get<2>(jni_tuple);
  TDF_BASE_DLOG(INFO) << "[turbo-perf] enter convertMethodResultToJSValue";

  // call method
  auto js_tuple = ConvertUtils::ConvertMethodResultToJSValue(
      context, impl_, method_info, jni_args->args_.data(), scope);
  TDF_BASE_DLOG(INFO) << "[turbo-perf] exit convertMethodResultToJSValue";
  if (!std::get<0>(js_tuple)) {
    context->ThrowException(unicode_string_view(std::get<1>(js_tuple)));
    return context->CreateUndefined();
  }

  TDF_BASE_DLOG(INFO) << "[turbo-perf] exit invokeJavaMethod";

  if (JNIEnvironment::ClearJEnvException(
      JNIEnvironment::GetInstance()->AttachCurrentThread())) {
    TDF_BASE_LOG(ERROR) << "ClearJEnvException when %s", call_info.c_str();
    return context->CreateUndefined();
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

JavaTurboModule::JavaTurboModule(const std::string& name,
                                 std::shared_ptr<JavaRef>& impl,
                                 const std::shared_ptr<Ctx>& ctx)
    : impl_(impl), impl_j_clazz_(nullptr), name(name) {
  InitPropertyMap();
  auto getter = std::make_unique<FuncWrapper>([](const CallbackInfo& info, void* data) {
    auto scope_wrapper = reinterpret_cast<ScopeWrapper*>(std::any_cast<void*>(info.GetSlot()));
    auto scope = scope_wrapper->scope.lock();
    TDF_BASE_CHECK(scope);
    auto ctx = scope->GetContext();
    auto module = reinterpret_cast<JavaTurboModule*>(data);
    auto name = info[0];
    if (!name) {
      return;
    }
    auto func_object = module->func_map[name];
    if (func_object) {
      info.GetReturnValue()->Set(func_object);
      return;
    }
    auto turbo_wrapper = std::make_unique<TurboWrapper>(module, name);
    auto func_wrapper = std::make_unique<FuncWrapper>([](const CallbackInfo& info, void* data) {
      auto scope_wrapper = reinterpret_cast<ScopeWrapper*>(std::any_cast<void*>(info.GetSlot()));
      auto scope = scope_wrapper->scope.lock();
      TDF_BASE_CHECK(scope);
      auto ctx = scope->GetContext();
      auto v8_ctx = std::static_pointer_cast<V8Ctx>(ctx);
      TDF_BASE_CHECK(v8_ctx->HasFuncExternalData(data));
      auto wrapper = reinterpret_cast<TurboWrapper*>(v8_ctx->GetFuncExternalData(data));
      TDF_BASE_CHECK(wrapper && wrapper->module && wrapper->name);
      auto result = wrapper->module->InvokeJavaMethod(wrapper->name, info, data);
      info.GetReturnValue()->Set(result);
    }, turbo_wrapper.get());
    func_object = ctx->CreateFunction(func_wrapper);
    turbo_wrapper->SetFunctionWrapper(std::move(func_wrapper));
    module->turbo_wrapper_map[name] = std::move(turbo_wrapper);
    module->func_map[name] = func_object;
    info.GetReturnValue()->Set(func_object);
  }, this);
  constructor = ctx->DefineProxy(getter);
  constructor_wrapper = std::move(getter);
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
