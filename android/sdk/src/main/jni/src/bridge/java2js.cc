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
    "(Ljava/lang/String;JLcom/tencent/mtt/hippy/bridge/NativeCallback;[BII)V",
    CallFunctionByByteArray)

REGISTER_JNI("com/tencent/mtt/hippy/bridge/HippyBridgeImpl",
             "callFunction",
             "(Ljava/lang/String;JLcom/tencent/mtt/hippy/bridge/"
             "NativeCallback;Ljava/nio/ByteBuffer;II)V",
             CallFunctionByBuffer)

using Ctx = hippy::napi::Ctx;
using V8InspectorClientImpl = hippy::inspector::V8InspectorClientImpl;

extern std::shared_ptr<V8InspectorClientImpl> global_inspector;

const char kHippyBridgeName[] = "hippyBridge";

void CallFunction(JNIEnv* j_env,
                  jobject j_obj,
                  jstring j_action,
                  jlong j_runtime_id,
                  jobject j_callback,
                  std::string buffer_data,
                  std::shared_ptr<JavaRef> buffer_owner) {
  HIPPY_DLOG(hippy::Debug, "CallFunction j_runtime_id = %lld", j_runtime_id);
  std::shared_ptr<Runtime> runtime = Runtime::Find(j_runtime_id);
  if (!runtime) {
    HIPPY_LOG(hippy::Warning, "CallFunction j_runtime_id invalid");
    return;
  }

  std::shared_ptr<JavaScriptTaskRunner> runner =
      runtime->GetEngine()->GetJSRunner();
  if (!runner) {
    TDF_BASE_DLOG(WARNING) << "CallFunction runner invalid";
    return;
  }
  std::string action_name = JniUtils::CovertJavaStringToString(j_env, j_action);
  std::shared_ptr<JavaRef> cb = std::make_shared<JavaRef>(j_env, j_callback);
  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
  task->callback = [runtime, cb_ = std::move(cb), action_name,
                    buffer_data_ = std::move(buffer_data),
                    buffer_owner_ = std::move(buffer_owner)] {
    std::shared_ptr<Scope> scope = runtime->GetScope();
    if (!scope) {
      TDF_BASE_DLOG(WARNING) << "CallFunction scope invalid";
      return;
    }
    std::shared_ptr<Ctx> context = scope->GetContext();
    if (runtime->IsDebug() && !action_name.compare("onWebsocketMsg")) {
      global_inspector->SendMessageToV8(buffer_data_);
    } else {
      if (!runtime->GetBridgeFunc()) {
        TDF_BASE_DLOG(INFO) << "bridge_func_ init";
        std::string name(kHippyBridgeName);
        std::shared_ptr<CtxValue> fn = context->GetJsFn(name);
        bool is_fn = context->IsFunction(fn);
        TDF_BASE_DLOG(INFO) << "is_fn = " << is_fn;
        if (!is_fn) {
          CallJavaMethod(cb_->GetObj(), 0);
          return;
        } else {
          runtime->SetBridgeFunc(fn);
        }
      }

      std::shared_ptr<CtxValue> action =
          context->CreateString(action_name.c_str());
      std::shared_ptr<CtxValue> params = nullptr;
      if (runtime->IsParamJson()) {
        params =
            context->CreateObject(buffer_data_.c_str(), buffer_data_.length());
      } else {
        v8::Isolate* isolate = std::static_pointer_cast<hippy::napi::V8VM>(
                                   runtime->GetEngine()->GetVM())
                                   ->isolate_;
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> ctx =
            std::static_pointer_cast<hippy::napi::V8Ctx>(
                runtime->GetScope()->GetContext())
                ->context_persistent_.Get(isolate);

        v8::ValueDeserializer deserializer(
            isolate, reinterpret_cast<const uint8_t*>(buffer_data_.c_str()),
            buffer_data_.length());
        HIPPY_CHECK(deserializer.ReadHeader(ctx).FromMaybe(false));
        v8::MaybeLocal<v8::Value> ret = deserializer.ReadValue(ctx);
        if (!ret.IsEmpty()) {
          params = std::make_shared<hippy::napi::V8CtxValue>(
              isolate, ret.ToLocalChecked());
        }
      }

      std::shared_ptr<CtxValue> argv[] = {action, params};
      context->CallFunction(runtime->GetBridgeFunc(), 2, argv);
    }

    CallJavaMethod(cb_->GetObj(), 1);
  };

  runner->PostTask(task);
}

void CallFunctionByByteArray(JNIEnv* j_env,
                             jobject j_obj,
                             jstring j_action,
                             jlong j_runtime_id,
                             jobject j_callback,
                             jbyteArray j_byte_array,
                             jint j_offset,
                             jint j_length) {
  CallFunction(j_env, j_obj, j_action, j_runtime_id, j_callback,
               JniUtils::AppendJavaByteArrayToString(j_env, j_byte_array,
                                                     j_offset, j_length),
               nullptr);
}

void CallFunctionByBuffer(JNIEnv* j_env,
                          jobject j_obj,
                          jstring j_action,
                          jlong j_runtime_id,
                          jobject j_callback,
                          jobject j_buffer,
                          jint j_offset,
                          jint j_length) {
  char* buffer_address =
      static_cast<char*>(j_env->GetDirectBufferAddress(j_buffer));
  HIPPY_DCHECK(buffer_address != nullptr);
  CallFunction(j_env, j_obj, j_action, j_runtime_id, j_callback,
               std::string(buffer_address + j_offset, j_length),
               std::make_shared<JavaRef>(j_env, j_buffer));
}

}  // namespace bridge
}  // namespace hippy
