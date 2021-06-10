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
#include "core/base/string_view_utils.h"
#include "jni/jni_register.h"

namespace hippy {
namespace bridge {

enum CALLFUNCTION_CB_STATE {
  NO_METHOD_ERROR = -2,
  DESERIALIZER_FAILED = -1,
  SUCCESS = 0,
};

REGISTER_JNI(
    "com/tencent/mtt/hippy/bridge/HippyBridgeImpl",
    "callFunction",
    "(Ljava/lang/String;JLcom/tencent/mtt/hippy/bridge/NativeCallback;[BII)V",
    CallFunctionByHeapBuffer)

REGISTER_JNI("com/tencent/mtt/hippy/bridge/HippyBridgeImpl",
             "callFunction",
             "(Ljava/lang/String;JLcom/tencent/mtt/hippy/bridge/"
             "NativeCallback;Ljava/nio/ByteBuffer;II)V",
             CallFunctionByDirectBuffer)

using unicode_string_view = tdf::base::unicode_string_view;
using bytes = std::string;

using Ctx = hippy::napi::Ctx;
using CtxValue = hippy::napi::CtxValue;
using V8InspectorClientImpl = hippy::inspector::V8InspectorClientImpl;
using StringViewUtils = hippy::base::StringViewUtils;

extern std::shared_ptr<V8InspectorClientImpl> global_inspector;

const char kHippyBridgeName[] = "hippyBridge";

void CallFunction(JNIEnv* j_env,
                  jobject j_obj,
                  jstring j_action,
                  jlong j_runtime_id,
                  jobject j_callback,
                  bytes buffer_data,
                  std::shared_ptr<JavaRef> buffer_owner) {
  TDF_BASE_DLOG(INFO) << "CallFunction j_runtime_id = " << j_runtime_id;
  std::shared_ptr<Runtime> runtime = Runtime::Find(j_runtime_id);
  if (!runtime) {
    TDF_BASE_DLOG(WARNING) << "CallFunction j_runtime_id invalid";
    return;
  }

  std::shared_ptr<JavaScriptTaskRunner> runner =
      runtime->GetEngine()->GetJSRunner();
  unicode_string_view action_name = JniUtils::ToStrView(j_env, j_action);
  std::shared_ptr<JavaRef> cb = std::make_shared<JavaRef>(j_env, j_callback);
  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
  task->callback = [runtime, cb_ = std::move(cb), action_name,
                    buffer_data_ = std::move(buffer_data),
                    buffer_owner_ = std::move(buffer_owner)] {
    JNIEnv* j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
    std::shared_ptr<Scope> scope = runtime->GetScope();
    if (!scope) {
      TDF_BASE_DLOG(WARNING) << "CallFunction scope invalid";
      return;
    }
    std::shared_ptr<Ctx> context = scope->GetContext();
    if (!runtime->GetBridgeFunc()) {
      TDF_BASE_DLOG(INFO) << "init bridge func";
      unicode_string_view name(kHippyBridgeName);
      std::shared_ptr<CtxValue> fn = context->GetJsFn(name);
      bool is_fn = context->IsFunction(fn);
      TDF_BASE_DLOG(INFO) << "is_fn = " << is_fn;

      if (!is_fn) {
        jstring j_msg =
            JniUtils::StrViewToJString(j_env, u"hippyBridge not find");
        CallJavaMethod(cb_->GetObj(), CALLFUNCTION_CB_STATE::NO_METHOD_ERROR,
                       j_msg);
        j_env->DeleteLocalRef(j_msg);
        return;
      } else {
        runtime->SetBridgeFunc(fn);
      }
    }
    TDF_BASE_DCHECK(action_name.encoding() ==
                    unicode_string_view::Encoding::Utf16);
    if (runtime->IsDebug() &&
        !action_name.utf16_value().compare(u"onWebsocketMsg")) {
      std::u16string str(reinterpret_cast<const char16_t*>(&buffer_data_[0]),
                         buffer_data_.length() / sizeof(char16_t));
      global_inspector->SendMessageToV8(
          std::move(unicode_string_view(std::move(str))));
      CallJavaMethod(cb_->GetObj(), CALLFUNCTION_CB_STATE::SUCCESS);
      return;
    }

    std::shared_ptr<CtxValue> action = context->CreateString(action_name);
    std::shared_ptr<CtxValue> params = nullptr;
    if (runtime->IsEnableV8Serialization()) {
      v8::Isolate* isolate = std::static_pointer_cast<hippy::napi::V8VM>(
                                 runtime->GetEngine()->GetVM())
                                 ->isolate_;
      v8::HandleScope handle_scope(isolate);
      v8::Local<v8::Context> ctx = std::static_pointer_cast<hippy::napi::V8Ctx>(
                                       runtime->GetScope()->GetContext())
                                       ->context_persistent_.Get(isolate);

      v8::ValueDeserializer deserializer(
          isolate, reinterpret_cast<const uint8_t*>(buffer_data_.c_str()),
          buffer_data_.length());
      TDF_BASE_CHECK(deserializer.ReadHeader(ctx).FromMaybe(false));
      v8::MaybeLocal<v8::Value> ret = deserializer.ReadValue(ctx);
      if (!ret.IsEmpty()) {
        params = std::make_shared<hippy::napi::V8CtxValue>(
            isolate, ret.ToLocalChecked());
      } else {
        jstring j_msg =
            JniUtils::StrViewToJString(j_env, u"deserializer error");
        CallJavaMethod(
            cb_->GetObj(),
            hippy::bridge::CALLFUNCTION_CB_STATE::DESERIALIZER_FAILED, j_msg);
        j_env->DeleteLocalRef(j_msg);
        return;
      }
    } else {
      std::u16string str(reinterpret_cast<const char16_t*>(&buffer_data_[0]),
                         buffer_data_.length() / sizeof(char16_t));
      unicode_string_view buf_str(std::move(str));
      TDF_BASE_DLOG(INFO) << "action_name = " << action_name
                          << ", buf_str = " << buf_str;
      params = context->CreateObject(buf_str);
    }
    std::shared_ptr<CtxValue> argv[] = {action, params};
    context->CallFunction(runtime->GetBridgeFunc(), 2, argv);

    CallJavaMethod(cb_->GetObj(), CALLFUNCTION_CB_STATE::SUCCESS);
  };

  runner->PostTask(task);
}

void CallFunctionByHeapBuffer(JNIEnv* j_env,
                              jobject j_obj,
                              jstring j_action,
                              jlong j_runtime_id,
                              jobject j_callback,
                              jbyteArray j_byte_array,
                              jint j_offset,
                              jint j_length) {
  CallFunction(j_env, j_obj, j_action, j_runtime_id, j_callback,
               JniUtils::AppendJavaByteArrayToBytes(j_env, j_byte_array,
                                                    j_offset, j_length),
               nullptr);
}

void CallFunctionByDirectBuffer(JNIEnv* j_env,
                                jobject j_obj,
                                jstring j_action,
                                jlong j_runtime_id,
                                jobject j_callback,
                                jobject j_buffer,
                                jint j_offset,
                                jint j_length) {
  char* buffer_address =
      static_cast<char*>(j_env->GetDirectBufferAddress(j_buffer));
  TDF_BASE_CHECK(buffer_address != nullptr);
  CallFunction(j_env, j_obj, j_action, j_runtime_id, j_callback,
               bytes(buffer_address + j_offset, j_length),
               std::make_shared<JavaRef>(j_env, j_buffer));
}

void CallJavaMethod(jobject j_obj, jlong j_value, jstring j_msg) {
  if (!j_obj) {
    TDF_BASE_DLOG(INFO) << "CallJavaMethod j_obj is nullptr";
    return;
  }

  JNIEnv* j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  jclass j_class = j_env->GetObjectClass(j_obj);
  if (!j_class) {
    TDF_BASE_LOG(ERROR) << "CallJavaMethod j_class error";
    return;
  }

  jmethodID j_cb_id =
      j_env->GetMethodID(j_class, "Callback", "(JLjava/lang/String;)V");
  if (!j_cb_id) {
    TDF_BASE_LOG(ERROR) << "CallJavaMethod j_cb_id error";
    return;
  }

  j_env->CallVoidMethod(j_obj, j_cb_id, j_value, j_msg);
  JNIEnvironment::ClearJEnvException(j_env);
  if (j_class) {
    j_env->DeleteLocalRef(j_class);
  }
}

}  // namespace bridge
}  // namespace hippy
