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

#include "bridge/java2js.h"

#include "bridge/js2java.h"
#include "bridge/runtime.h"
#include "jni/jni_register.h"

namespace hippy {
namespace bridge {

REGISTER_JNI(
    "com/tencent/mtt/hippy/bridge/HippyBridgeImpl",
    "callFunction",
    "(Ljava/lang/String;[BIIJLcom/tencent/mtt/hippy/bridge/NativeCallback;)V",
    CallFunction)

using Ctx = hippy::napi::Ctx;
using V8InspectorClientImpl = hippy::inspector::V8InspectorClientImpl;

extern std::shared_ptr<V8InspectorClientImpl> global_inspector;

const char kHippyBridgeName[] = "hippyBridge";

void CallFunction(JNIEnv* j_env,
                  jobject j_obj,
                  jstring j_action,
                  jbyteArray j_params,
                  jint j_offset,
                  jint j_length,
                  jlong j_runtime_id,
                  jobject j_callback) {
  HIPPY_DLOG(hippy::Debug, "CallFunction j_runtime_id = %lld", j_runtime_id);
  std::shared_ptr<Runtime> runtime = Runtime::Find(j_runtime_id);
  if (!runtime) {
    HIPPY_LOG(hippy::Warning, "CallFunction j_runtime_id invalid");
    return;
  }

  std::shared_ptr<JavaScriptTaskRunner> runner =
      runtime->GetEngine()->GetJSRunner();
  if (!runner) {
    HIPPY_LOG(hippy::Warning, "CallFunction runner invalid");
    return;
  }
  std::string action_name = JniUtils::CovertJavaStringToString(j_env, j_action);

  std::string hippy_params =
      JniUtils::AppendJavaByteArrayToString(j_env, j_params);
  HIPPY_DLOG(hippy::Debug, "CallFunction action_name = %s, hippy_params = %s",
             action_name.c_str(), hippy_params.c_str());
  std::shared_ptr<JavaRef> save_object =
      std::make_shared<JavaRef>(j_env, j_callback);
  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
  task->callback = [runtime, save_object_ = std::move(save_object), action_name,
                    hippy_params] {
    HIPPY_DLOG(hippy::Debug,
               "js CallFunction action_name = %s, hippy_params = %s",
               action_name.c_str(), hippy_params.c_str());
    std::shared_ptr<Scope> scope = runtime->GetScope();
    if (!scope) {
      HIPPY_LOG(hippy::Warning, "CallFunction scope invalid");
      return;
    }
    std::shared_ptr<Ctx> context = scope->GetContext();
    if (runtime->IsDebug() && !action_name.compare("onWebsocketMsg")) {
      global_inspector->SendMessageToV8(hippy_params);
    } else {
      if (!runtime->GetBridgeFunc()) {
        HIPPY_DLOG(hippy::Debug, "bridge_func_ init");
        std::string name(kHippyBridgeName);
        std::shared_ptr<CtxValue> fn = context->GetJsFn(name);
        bool is_fn = context->IsFunction(fn);
        HIPPY_DLOG(hippy::Debug, "is_fn = %d", is_fn);
        if (!is_fn) {
          CallJavaMethod(save_object_->GetObj(), 0);
          return;
        } else {
          runtime->SetBridgeFunc(fn);
        }
      }
      // to do params_str invalid
      std::shared_ptr<CtxValue> action =
          context->CreateString(action_name.c_str());
      std::shared_ptr<CtxValue> params =
          context->CreateObject(hippy_params.c_str());
      std::shared_ptr<CtxValue> argv[] = {action, params};
      context->CallFunction(runtime->GetBridgeFunc(), 2, argv);
    }

    CallJavaMethod(save_object_->GetObj(), 1);
  };

  runner->PostTask(task);
}

}  // namespace bridge
}  // namespace hippy
