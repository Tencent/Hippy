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

#include <cstdint>

#include "driver/runtime/v8/runtime.h"
#include "driver/napi/v8/js_native_api_v8.h"
#include "driver/napi/v8/js_native_turbo_v8.h"
#include "footstone/string_view_utils.h"
#include "jni/java_turbo_module.h"
#include "jni/jni_env.h"
#include "jni/jni_register.h"
#include "jni/jni_utils.h"
#include "jni/turbo_module_runtime.h"


namespace hippy {
inline namespace framework {
inline namespace turbo {

REGISTER_JNI("com/tencent/mtt/hippy/bridge/jsi/TurboModuleManager", // NOLINT(cert-err58-cpp)
             "install",
             "(J)I",
             Install)

using namespace hippy::napi;
using unicode_string_view = footstone::stringview::unicode_string_view;
using StringViewUtils = footstone::stringview::StringViewUtils;
using Runtime = hippy::Runtime;

jclass turbo_module_manager_clazz;
jmethodID j_method_id;

/**
 * com.tencent.mtt.hippy.bridge.jsi.TurboModuleManager.get
 */
std::shared_ptr<JavaRef> QueryTurboModuleImpl(std::shared_ptr<Runtime> &runtime,
                                              const std::string &module_name) {
  FOOTSTONE_DLOG(INFO) << "enter QueryTurboModuleImpl " << module_name.c_str();
  JNIEnv *j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  jstring j_name = j_env->NewStringUTF(module_name.c_str());
  FOOTSTONE_DCHECK(runtime->HasData(kTurboSlot));
  auto turbo_runtime = std::any_cast<std::shared_ptr<TurboModuleRuntime>>(runtime->GetData(kTurboSlot));
  jobject module_impl = j_env->CallObjectMethod(turbo_runtime->turbo_module_manager_obj_, j_method_id, j_name);
  auto result = std::make_shared<JavaRef>(j_env, module_impl);
  j_env->DeleteLocalRef(j_name);
  j_env->DeleteLocalRef(module_impl);
  return result;
}

void GetTurboModule(const v8::FunctionCallbackInfo<v8::Value> &info) {
  FOOTSTONE_DLOG(INFO) << "[turbo-perf] enter getTurboModule";
  auto data = info.Data().As<v8::External>();
  int64_t runtime_key = (reinterpret_cast<int64_t>(data->Value()));

  auto runtime = Runtime::Find(footstone::check::checked_numeric_cast<int64_t, int32_t>(runtime_key));
  std::shared_ptr<Ctx> ctx = std::static_pointer_cast<Ctx>(runtime->GetScope()->GetContext());
  std::shared_ptr<V8Ctx> v8_ctx = std::static_pointer_cast<V8Ctx>(ctx);
  auto isolate = v8_ctx->isolate_;
  v8::HandleScope handle_scope(isolate);
  v8::Local<v8::Context> context =
      v8_ctx->context_persistent_.Get(isolate);
  v8::Context::Scope context_scope(context);

  if (info.Length() == 1 && !info[0].IsEmpty() && info[0]->IsString()) {
    // 1. moduleName
    v8::String::Utf8Value module_name(info.GetIsolate(), info[0]);
    std::string name = module_name.operator*();

    if (!runtime->HasData(kTurboSlot)) {
      FOOTSTONE_LOG(ERROR) << "getTurboModule but turboModuleRuntime is null";
      info.GetReturnValue().SetUndefined();
      return;
    }
    auto slot = runtime->GetData(kTurboSlot);
    auto turbo_module_runtime = std::any_cast<std::shared_ptr<TurboModuleRuntime>>(slot);
    std::shared_ptr<CtxValue> result = turbo_module_runtime->module_cache_[name];
    if (!result) {
      // 2. if not cached, query from Java
      std::shared_ptr<JavaRef> module_impl =
          QueryTurboModuleImpl(runtime, name);
      if (!module_impl->GetObj()) {
        std::string exception_info = std::string("Cannot find TurboModule: ").append(name);
        FOOTSTONE_LOG(ERROR) << "cannot find TurboModule = " << name.c_str();
        v8_ctx->ThrowException(unicode_string_view(exception_info));
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
      result = turbo_module_runtime->turbo_env_->CreateObject(java_turbo_module);

      // 6. add To Cache
      turbo_module_runtime->module_cache_[name] = result;
      FOOTSTONE_DLOG(INFO) << "return module= " << name.c_str();
    } else {
      FOOTSTONE_DLOG(INFO) << "return cached module = " << name.c_str();
    }

    std::shared_ptr<V8CtxValue> v8_result =
        std::static_pointer_cast<V8CtxValue>(result);
    info.GetReturnValue().Set(v8_result->global_value_);
  } else {
    FOOTSTONE_LOG(ERROR) << "cannot find TurboModule as param is invalid";
    info.GetReturnValue().SetUndefined();
  }
  FOOTSTONE_DLOG(INFO) << "[turbo-perf] exit getTurboModule";
}

void BindNativeFunction(const std::shared_ptr<Runtime>& runtime,
                        const unicode_string_view &name,
                        v8::FunctionCallback function_callback) {
  FOOTSTONE_DLOG(INFO) << "enter bindNativeFunction name "
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
  FOOTSTONE_DLOG(INFO) << "exit bindNativeFunction name "
                      << StringViewUtils::ToU8StdStr(name);
}

void TurboModuleManager::Init() {
  JNIEnv *j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  jclass j_class = j_env->FindClass("com/tencent/mtt/hippy/bridge/jsi/TurboModuleManager");
  turbo_module_manager_clazz = reinterpret_cast<jclass>(j_env->NewGlobalRef(j_class));
  j_env->DeleteLocalRef(j_class);

  j_method_id = j_env->GetMethodID(turbo_module_manager_clazz, "get",
                                     "(Ljava/lang/String;)Lcom/tencent/mtt/hippy/modules/"
                                     "nativemodules/HippyNativeModuleBase;");
}

void TurboModuleManager::Destroy() {
  JNIEnv *env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  if (turbo_module_manager_clazz) {
    env->DeleteGlobalRef(turbo_module_manager_clazz);
  }

  j_method_id = nullptr;
}

int Install(JNIEnv *, jobject j_obj, jlong j_runtime_id) {
  FOOTSTONE_LOG(INFO) << "install TurboModuleManager";
  auto runtime = Runtime::Find(footstone::check::checked_numeric_cast<jlong, int32_t>(j_runtime_id));
  if (!runtime) {
    FOOTSTONE_LOG(ERROR) << "TurboModuleManager install, v8RuntimePtr invalid";
    return -1;
  }

  runtime->SetData(kTurboSlot, std::make_shared<TurboModuleRuntime>(j_obj));

  // v8的操作放到js线程
  auto runner = runtime->GetEngine()->GetJsTaskRunner();
  if (!runner) {
    FOOTSTONE_LOG(WARNING) << "TurboModuleManager install, runner invalid";
    return -1;
  }

  auto callback = [runtime] {
    BindNativeFunction(runtime, "getTurboModule", GetTurboModule);
  };
  runner->PostTask(std::move(callback));
  return 0;
}

}
}
}
