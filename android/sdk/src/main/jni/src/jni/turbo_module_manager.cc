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

#include "bridge/runtime.h"
#include "core/vm/v8/snapshot_collector.h"
#include "jni/java_turbo_module.h"
#include "jni/jni_env.h"
#include "jni/jni_register.h"
#include "jni/jni_utils.h"

REGISTER_JNI("com/tencent/mtt/hippy/bridge/jsi/TurboModuleManager", // NOLINT(cert-err58-cpp)
             "install",
             "(J)I",
             Install)

using namespace hippy::napi;
using unicode_string_view = tdf::base::unicode_string_view;
using StringViewUtils = hippy::base::StringViewUtils;

constexpr char kTurboKey[] = "getTurboModule";

jclass turbo_module_manager_clazz;
jmethodID get_method_id;

/**
 * com.tencent.mtt.hippy.bridge.jsi.TurboModuleManager.get
 */
std::shared_ptr<JavaRef> QueryTurboModuleImpl(std::shared_ptr<Runtime> &runtime,
                                              const std::string &module_name) {
  TDF_BASE_DLOG(INFO) << "enter QueryTurboModuleImpl " << module_name.c_str();
  JNIEnv *env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  jstring name = env->NewStringUTF(module_name.c_str());
  jobject module_impl = env->CallObjectMethod(runtime->GetTurboManager()->GetObj(),get_method_id, name);
  auto result = std::make_shared<JavaRef>(env, module_impl);
  env->DeleteLocalRef(name);
  env->DeleteLocalRef(module_impl);
  return result;
}

void GetTurboModule(const CallbackInfo& info, void* data) {
  TDF_BASE_DLOG(INFO) << "[turbo-perf] enter getTurboModule";
  auto scope_wrapper = reinterpret_cast<ScopeWrapper*>(std::any_cast<void*>(info.GetSlot()));
  auto scope = scope_wrapper->scope.lock();
  TDF_BASE_CHECK(scope);
  auto v8_ctx = std::static_pointer_cast<V8Ctx>(scope->GetContext());
  TDF_BASE_CHECK(v8_ctx->HasFuncExternalData(data));
  auto runtime_id = static_cast<int32_t>(reinterpret_cast<size_t>(v8_ctx->GetFuncExternalData(data)));
  auto runtime = Runtime::Find(runtime_id);
  if (!runtime) {
    return;
  }
  auto ctx = scope->GetContext();
  v8::HandleScope handle_scope(v8_ctx->isolate_);
  auto context = v8_ctx->context_persistent_.Get(v8_ctx->isolate_);
  v8::Context::Scope context_scope(context);

  if (!info[0] || !ctx->IsString(info[0])) {
    TDF_BASE_LOG(ERROR) << "cannot find TurboModule as param is invalid";
    info.GetReturnValue()->SetUndefined();
  }

  unicode_string_view name;
  ctx->GetValueString(info[0], &name);
  auto turbo_manager = runtime->GetTurboManager();
  if (!turbo_manager) {
    TDF_BASE_LOG(ERROR) << "turbo_manager error";
    info.GetReturnValue()->SetUndefined();
    return;
  }

  auto u8_name = StringViewUtils::ToU8StdStr(name);
  std::shared_ptr<CtxValue> result;
  auto has_instance = scope->HasTurboInstance(u8_name);
  if (!has_instance) {
    // 2. if not cached, query from Java
    auto module_impl = QueryTurboModuleImpl(runtime, u8_name);
    if (!module_impl->GetObj()) {
      TDF_BASE_LOG(ERROR) << "cannot find TurboModule = " << name;
      ctx->ThrowException("Cannot find TurboModule: " + name);
      return info.GetReturnValue()->SetUndefined();
    }

    // 3. constructor c++ JavaTurboModule
    auto java_turbo_module = std::make_shared<JavaTurboModule>(u8_name, module_impl, ctx);

    // 4. bind c++ JavaTurboModule to js
    result = ctx->NewInstance(java_turbo_module->constructor, 0, nullptr, java_turbo_module.get());

    // 5. add To Cache
    scope->SetTurboInstance(u8_name, result);
    scope->SetTurboHostObject(u8_name, java_turbo_module);

    TDF_BASE_DLOG(INFO) << "return module = " << name;
  } else {
    result = scope->GetTurboInstance(u8_name);
    TDF_BASE_DLOG(INFO) << "return cached module = " << name;
  }

  info.GetReturnValue()->Set(result);
  TDF_BASE_DLOG(INFO) << "[turbo-perf] exit getTurboModule";
}

void TurboModuleManager::Init() {
  JNIEnv *env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  jclass clazz =
      env->FindClass("com/tencent/mtt/hippy/bridge/jsi/TurboModuleManager");
  turbo_module_manager_clazz = reinterpret_cast<jclass>(env->NewGlobalRef(clazz));
  env->DeleteLocalRef(clazz);

  get_method_id =
      env->GetMethodID(turbo_module_manager_clazz, "get",
                       "(Ljava/lang/String;)Lcom/tencent/mtt/hippy/modules/"
                       "nativemodules/HippyNativeModuleBase;");
}

void TurboModuleManager::Destroy() {
  JNIEnv *env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  if (turbo_module_manager_clazz) {
    env->DeleteGlobalRef(turbo_module_manager_clazz);
  }

  get_method_id = nullptr;
}

int Install(JNIEnv* j_env, jobject j_obj, jlong j_runtime_id) {
  TDF_BASE_LOG(INFO) << "install TurboModuleManager";
  auto runtime = Runtime::Find(hippy::base::checked_numeric_cast<jlong, int32_t>(j_runtime_id));
  if (!runtime) {
    TDF_BASE_LOG(ERROR) << "TurboModuleManager install, j_runtime_id invalid";
    return -1;
  }

  runtime->SetTurboModuleManager(std::make_shared<JavaRef>(j_env, j_obj));

  // v8的操作放到js线程
  auto runner = runtime->GetEngine()->GetJSRunner();
  if (!runner) {
    TDF_BASE_LOG(WARNING) << "TurboModuleManager install, runner invalid";
    return -1;
  }

  auto task = std::make_shared<JavaScriptTask>();
  std::weak_ptr<Scope> weak_scope = runtime->GetScope();
  auto runtime_id = runtime->GetId();
  task->callback = [weak_scope, runtime_id] {
    auto scope = weak_scope.lock();
    if (!scope) {
      return;
    }
    auto context = scope->GetContext();
    auto wrapper = std::make_unique<FuncWrapper>(GetTurboModule, reinterpret_cast<void*>(runtime_id));
    auto func = context->CreateFunction(wrapper);
    scope->SaveFuncWrapper(std::move(wrapper));
    auto global_object = context->GetGlobalObject();
    auto key = context->CreateString(kTurboKey);
    context->SetProperty(global_object, key, func);
  };
  runner->PostTask(task);
  return 0;
}
