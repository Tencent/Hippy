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

#include "connector/turbo_module_manager.h"

#include <cstdint>

#include "connector/java_turbo_module.h"
#include "footstone/logging.h"
#include "footstone/string_view.h"
#include "footstone/string_view_utils.h"
#include "jni/data_holder.h"
#include "jni/jni_env.h"
#include "jni/jni_register.h"
#include "jni/jni_utils.h"
#include "jni/scoped_java_ref.h"

using namespace hippy::napi;
using string_view = footstone::string_view;
using StringViewUtils = footstone::StringViewUtils;

constexpr char kTurboKey[] = "getTurboModule";

namespace hippy {
inline namespace framework {
inline namespace turbo {

REGISTER_JNI("com/tencent/mtt/hippy/bridge/jsi/TurboModuleManager",  // NOLINT(cert-err58-cpp)
             "install", "(J)I", Install)

jclass turbo_module_manager_clazz;
jmethodID get_method_id;

/**
 * com.tencent.mtt.hippy.bridge.jsi.TurboModuleManager.get
 */
std::shared_ptr<JavaRef> QueryTurboModuleImpl(std::shared_ptr<Scope>& scope, const std::string& module_name) {
  FOOTSTONE_DLOG(INFO) << "enter QueryTurboModuleImpl " << module_name.c_str();
  JNIEnv* j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  jstring name = j_env->NewStringUTF(module_name.c_str());
  auto turbo_manager = std::any_cast<std::shared_ptr<JavaRef>>(scope->GetTurbo());
  jobject module_impl = j_env->CallObjectMethod(turbo_manager->GetObj(), get_method_id, name);
  auto result = std::make_shared<JavaRef>(j_env, module_impl);
  j_env->DeleteLocalRef(name);
  j_env->DeleteLocalRef(module_impl);
  return result;
}

void GetTurboModule(CallbackInfo& info, void* data) {
  FOOTSTONE_DLOG(INFO) << "[turbo-perf] enter getTurboModule";
  auto scope_wrapper = reinterpret_cast<ScopeWrapper*>(std::any_cast<void*>(info.GetSlot()));
  auto scope = scope_wrapper->scope.lock();
  FOOTSTONE_CHECK(scope);
  auto ctx = scope->GetContext();

  if (!info[0] || !ctx->IsString(info[0])) {
    FOOTSTONE_LOG(ERROR) << "cannot find TurboModule as param is invalid";
    info.GetReturnValue()->SetUndefined();
  }

  string_view name;
  ctx->GetValueString(info[0], &name);
  auto turbo_manager = std::any_cast<std::shared_ptr<JavaRef>>(scope->GetTurbo());
  if (!turbo_manager) {
    FOOTSTONE_LOG(ERROR) << "turbo_manager error";
    info.GetReturnValue()->SetUndefined();
    return;
  }
  auto u8_name =
      StringViewUtils::ToStdString(StringViewUtils::ConvertEncoding(name, string_view::Encoding::Utf8).utf8_value());
  std::shared_ptr<CtxValue> result;
  auto has_instance = scope->HasTurboInstance(u8_name);
  if (!has_instance) {
    // 2. if not cached, query from Java
    auto module_impl = QueryTurboModuleImpl(scope, u8_name);
    if (!module_impl->GetObj()) {
      FOOTSTONE_LOG(ERROR) << "cannot find TurboModule = " << name;
      ctx->ThrowException("Cannot find TurboModule: " + name);
      return info.GetReturnValue()->SetUndefined();
    }

    // 3. constructor c++ JavaTurboModule
    auto java_turbo_module = std::make_shared<JavaTurboModule>(u8_name, module_impl, ctx);

    // 4. bind c++ JavaTurboModule to js
#ifdef JS_V8
    result = ctx->NewInstance(java_turbo_module->constructor, 0, nullptr, java_turbo_module.get());
#elif defined(JS_HERMES)
    std::shared_ptr<CtxValue> argv[] = {java_turbo_module->proxy_handler};
    result = ctx->NewInstance(java_turbo_module->constructor, 1, argv, java_turbo_module.get());
#else
    FOOTSTONE_LOG(ERROR) << "js engine not support jsi";
    return info.GetReturnValue()->SetUndefined();
#endif

    // 5. add To Cache
    scope->SetTurboInstance(u8_name, result);
    scope->SetTurboHostObject(u8_name, java_turbo_module);

    FOOTSTONE_DLOG(INFO) << "return module = " << name;
  } else {
    result = scope->GetTurboInstance(u8_name);
    FOOTSTONE_DLOG(INFO) << "return cached module = " << name;
  }

  info.GetReturnValue()->Set(result);
  FOOTSTONE_DLOG(INFO) << "[turbo-perf] exit getTurboModule";
}

void TurboModuleManager::Init(JNIEnv* j_env) {
  jclass clazz = j_env->FindClass("com/tencent/mtt/hippy/bridge/jsi/TurboModuleManager");
  turbo_module_manager_clazz = reinterpret_cast<jclass>(j_env->NewGlobalRef(clazz));
  j_env->DeleteLocalRef(clazz);

  get_method_id = j_env->GetMethodID(turbo_module_manager_clazz, "get",
                                     "(Ljava/lang/String;)Lcom/tencent/mtt/hippy/modules/"
                                     "nativemodules/HippyNativeModuleBase;");
}

void TurboModuleManager::Destroy(JNIEnv* j_env) {
  if (turbo_module_manager_clazz) {
    j_env->DeleteGlobalRef(turbo_module_manager_clazz);
  }

  get_method_id = nullptr;
}

int Install(JNIEnv* j_env, jobject j_obj, jlong j_scope_id) {
  FOOTSTONE_LOG(INFO) << "install TurboModuleManager";
  std::any scope_object;
  auto scope_id = footstone::checked_numeric_cast<jlong, uint32_t>(j_scope_id);
  auto flag = hippy::global_data_holder.Find(scope_id, scope_object);
  FOOTSTONE_CHECK(flag);
  auto scope = std::any_cast<std::shared_ptr<Scope>>(scope_object);
  scope->SetTurbo(std::make_shared<JavaRef>(j_env, j_obj));

  // v8的操作放到js线程
  auto runner = scope->GetTaskRunner();
  if (!runner) {
    FOOTSTONE_LOG(WARNING) << "TurboModuleManager install, runner invalid";
    return -1;
  }

  std::weak_ptr<Scope> weak_scope = scope;
  auto callback = [weak_scope, scope_id] {
    auto scope = weak_scope.lock();
    if (!scope) {
      return;
    }
    auto context = scope->GetContext();
    auto wrapper = std::make_unique<FunctionWrapper>(GetTurboModule, reinterpret_cast<void*>(scope_id));
    auto func = context->CreateFunction(wrapper);
    scope->SaveFunctionWrapper(std::move(wrapper));
    auto global_object = context->GetGlobalObject();
    auto key = context->CreateString(kTurboKey);
    context->SetProperty(global_object, key, func);
  };
  runner->PostTask(std::move(callback));
  return 0;
}

}  // namespace turbo
}  // namespace framework
}  // namespace hippy
