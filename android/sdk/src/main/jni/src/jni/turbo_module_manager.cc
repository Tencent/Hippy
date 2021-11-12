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

#include "jni/turbo_module_manager.h"

#include <jni.h>

#include <cstdint>

#include "bridge/runtime.h"
#include "core/core.h"
#include "core/napi/v8/js_native_api_v8.h"
#include "jni/java_turbo_module.h"
#include "jni/jni_utils.h"
#include "jni/scoped_java_ref.h"

REGISTER_JNI("com/tencent/mtt/hippy/bridge/jsi/TurboModuleManager",
             "install",
             "(J)I",
             Install)

REGISTER_JNI("com/tencent/mtt/hippy/bridge/jsi/TurboModuleManager",
             "uninstall",
             "(J)V",
             Uninstall)

using namespace hippy::napi;
using unicode_string_view = tdf::base::unicode_string_view;
using StringViewUtils = hippy::base::StringViewUtils;

jclass turbo_module_manager_clazz;
jmethodID get_method_id;

/**
 * com.tencent.mtt.hippy.bridge.jsi.TurboModuleManager.get
 */
std::shared_ptr<JavaRef> QueryTurboModuleImpl(std::shared_ptr<Runtime> &runtime,
                                              const std::string &module_name) {
  TDF_BASE_DLOG(INFO) << "enter QueryTurboModuleImpl %s", module_name.c_str();
  JNIEnv *env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  jstring name = env->NewStringUTF(module_name.c_str());
  jobject module_impl = env->CallObjectMethod(
      runtime->GetTurboModuleRuntime()->turbo_module_manager_obj_,
      get_method_id, name);
  auto result = std::make_shared<JavaRef>(env, module_impl);
  env->DeleteLocalRef(name);
  env->DeleteLocalRef(module_impl);
  return result;
}

void GetTurboModule(const v8::FunctionCallbackInfo<v8::Value> &info) {
  TDF_BASE_DLOG(INFO) << "[turbo-perf] enter getTurboModule";
  auto data = info.Data().As<v8::External>();
  int64_t runtime_key = *(reinterpret_cast<int64_t *>(data->Value()));

  std::shared_ptr<Runtime> runtime = Runtime::Find(runtime_key);
  std::shared_ptr<Ctx> ctx =
      std::static_pointer_cast<Ctx>(runtime->GetScope()->GetContext());
  std::shared_ptr<V8Ctx> v8_ctx = std::static_pointer_cast<V8Ctx>(ctx);
  v8::HandleScope handle_scope(v8_ctx->isolate_);
  v8::Local<v8::Context> context =
      v8_ctx->context_persistent_.Get(v8_ctx->isolate_);
  v8::Context::Scope context_scope(context);

  if (info.Length() == 1 && !info[0].IsEmpty() && info[0]->IsString()) {
    // 1. moduleName
    v8::String::Utf8Value module_name(info.GetIsolate(), info[0]);
    std::string name = module_name.operator*();

    std::shared_ptr<TurboModuleRuntime> turbo_module_runtime =
        runtime->GetTurboModuleRuntime();
    if (!turbo_module_runtime) {
      TDF_BASE_LOG(ERROR) << "getTurboModule but turboModuleRuntime is null";
      info.GetReturnValue().SetUndefined();
      return;
    }

    std::shared_ptr<CtxValue> result =
        turbo_module_runtime->module_cache_[name];
    if (!result) {
      // 2. if not cached, query from Java
      std::shared_ptr<JavaRef> module_impl =
          QueryTurboModuleImpl(runtime, name);
      if (!module_impl->GetObj()) {
        std::string exception_info =
            std::string("Cannot find TurboModule: ").append(name);
        TDF_BASE_LOG(ERROR) << "cannot find TurboModule = %s", name.c_str();
        ConvertUtils::ThrowException(ctx, exception_info);
        return info.GetReturnValue().SetUndefined();
      }

      // 3. constructor c++ JavaTurboModule
      std::shared_ptr<JavaTurboModule> java_turbo_module =
          std::make_shared<JavaTurboModule>(name, module_impl);

      // 4. init v8TurboEnv
      if (!turbo_module_runtime->turbo_env_) {
        turbo_module_runtime->turbo_env_ = std::make_shared<V8TurboEnv>(ctx);
      }

      // 5. bind c++ JavaTurboModule to js
      result =
          turbo_module_runtime->turbo_env_->CreateObject(java_turbo_module);

      // 6. add To Cache
      turbo_module_runtime->module_cache_[name] = result;
      TDF_BASE_DLOG(INFO) << "return module=%s", name.c_str();
    } else {
      TDF_BASE_DLOG(INFO) << "return cached module=%s", name.c_str();
    }

    std::shared_ptr<V8CtxValue> v8_result =
        std::static_pointer_cast<V8CtxValue>(result);
    info.GetReturnValue().Set(v8_result->global_value_);
  } else {
    TDF_BASE_LOG(ERROR) << "cannot find TurboModule as param is invalid";
    info.GetReturnValue().SetUndefined();
  }
  TDF_BASE_DLOG(INFO) << "[turbo-perf] exit getTurboModule";
}

void BindNativeFunction(std::shared_ptr<Runtime> runtime,
                        const unicode_string_view &name,
                        v8::FunctionCallback function_callback) {
  TDF_BASE_DLOG(INFO) << "enter bindNativeFunction name "
                      << StringViewUtils::ToU8StdStr(name);
  std::shared_ptr<V8Ctx> v8_ctx =
      std::static_pointer_cast<V8Ctx>(runtime->GetScope()->GetContext());
  v8::HandleScope handle_scope(v8_ctx->isolate_);
  v8::Local<v8::Context> context =
      v8_ctx->context_persistent_.Get(v8_ctx->isolate_);
  v8::Context::Scope context_scope(context);

  v8::Local<v8::FunctionTemplate> function_template = v8::FunctionTemplate::New(
      v8_ctx->isolate_, function_callback,
      v8::External::New(v8_ctx->isolate_, reinterpret_cast<void *>(runtime->GetId())));
  function_template->RemovePrototype();

  v8::Local<v8::String> function_name = v8_ctx->CreateV8String(name);
  v8::Local<v8::Function> function =
      function_template->GetFunction(context).ToLocalChecked();
  context->Global()->Set(context, function_name, function).ToChecked();
  TDF_BASE_DLOG(INFO) << "exit bindNativeFunction name "
                      << StringViewUtils::ToU8StdStr(name);
}

void TurboModuleManager::Init() {
  JNIEnv *env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  jclass clazz =
      env->FindClass("com/tencent/mtt/hippy/bridge/jsi/TurboModuleManager");
  turbo_module_manager_clazz = static_cast<jclass>(env->NewGlobalRef(clazz));
  env->DeleteLocalRef(clazz);

  get_method_id =
      env->GetMethodID(turbo_module_manager_clazz, "get",
                       "(Ljava/lang/String;)Lcom/tencent/mtt/hippy/modules/"
                       "nativemodules/HippyNativeModuleBase;");
}

void TurboModuleManager::Destory() {
  JNIEnv *env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  if (turbo_module_manager_clazz) {
    env->DeleteGlobalRef(turbo_module_manager_clazz);
  }

  get_method_id = nullptr;
}

int Install(JNIEnv *, jobject j_obj, jlong j_runtime_id) {
  TDF_BASE_LOG(INFO) << "install TurboModuleManager";
  std::shared_ptr<Runtime> runtime = Runtime::Find(j_runtime_id);
  if (!runtime) {
    TDF_BASE_LOG(ERROR) << "TurboModuleManager install, v8RuntimePtr invalid";
    return -1;
  }

  runtime->SetTurboModuleRuntime(std::make_shared<TurboModuleRuntime>(j_obj));

  // v8的操作放到js线程
  std::shared_ptr<JavaScriptTaskRunner> runner =
      runtime->GetEngine()->GetJSRunner();
  if (!runner) {
    TDF_BASE_LOG(WARNING) << "TurboModuleManager install, runner invalid";
    return -1;
  }

  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
  task->callback = [runtime] {
    BindNativeFunction(runtime, "getTurboModule", GetTurboModule);
  };
  runner->PostTask(task);
  return 0;
}

void Uninstall(JNIEnv *, jobject, jlong j_runtime_id) {
  TDF_BASE_LOG(INFO) << "uninstall install TurboModuleManager";
  std::shared_ptr<Runtime> runtime = Runtime::Find(j_runtime_id);
  if (!runtime) {
    TDF_BASE_LOG(ERROR) << "TurboModuleManager install, v8RuntimePtr invalid";
    return;
  }
  if (runtime->GetTurboModuleRuntime()) {
    runtime->GetTurboModuleRuntime().reset();
  }
}
