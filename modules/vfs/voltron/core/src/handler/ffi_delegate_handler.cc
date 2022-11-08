/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#include "handler/ffi_delegate_handler.h"

#include "footstone/check.h"
#include "footstone/logging.h"

namespace voltron {

void FfiDelegateHandler::RequestUntrustedContent(std::shared_ptr<SyncContext> ctx,
                                          std::function<std::shared_ptr<UriHandler>()> next) {
//  FOOTSTONE_DCHECK(!next()) << "jni delegate must be the last handler";
//  if (ctx->req_meta[kCallFromKey] == kCallFromJavaValue) {  // call from java
//    ctx->code = RetCode::SchemeNotRegister;
//    return;
//  }
//  JNIEnv* j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
//  auto j_uri = JniUtils::StrViewToJString(j_env, ctx->uri);
//  auto j_map = j_env->NewObject(j_util_map_clazz, j_map_init_method_id);
//  for (auto [key, value]: ctx->req_meta) {
//    auto j_key = JniUtils::StrViewToJString(j_env, string_view::new_from_utf8(key.c_str(), key.length()));
//    auto j_value = JniUtils::StrViewToJString(j_env, string_view::new_from_utf8(value.c_str(), value.length()));
//    j_env->CallObjectMethod(j_map, j_map_put_method_id, j_key, j_value);
//  }
//  auto j_holder = j_env->CallObjectMethod(delegate_->GetObj(), j_call_jni_delegate_sync_method_id, j_uri, j_map);
//  auto j_ret_code = j_env->GetIntField(j_holder, j_holder_ret_code_field_id);
//  RetCode ret_code = CovertToUriHandlerRetCode(j_ret_code);
//  ctx->code = ret_code;
//  if (ret_code != RetCode::Success) {
//    return;
//  }
//  auto next_delegate = next();
//  FOOTSTONE_CHECK(!next_delegate);
//  auto j_type = j_env->GetObjectField(j_holder, j_holder_transfer_type_field_id);
//  if (j_env->IsSameObject(j_type, j_transfer_type_normal_value)) {
//    auto j_bytes = reinterpret_cast<jbyteArray>(j_env->GetObjectField(j_holder, j_holder_bytes_field_id));
//    ctx->content = JniUtils::AppendJavaByteArrayToBytes(j_env, j_bytes);
//  } else if (j_env->IsSameObject(j_type, j_transfer_type_nio_value)) {
//    auto j_buffer = j_env->GetObjectField(j_holder, j_holder_buffer_field_id);
//    if (j_buffer) {
//      char* buffer_address = static_cast<char*>(j_env->GetDirectBufferAddress(j_buffer));
//      FOOTSTONE_CHECK(buffer_address);
//      auto capacity = j_env->GetDirectBufferCapacity(j_buffer);
//      if (capacity >= 0) {
//        ctx->content = bytes(buffer_address, footstone::checked_numeric_cast<jlong, size_t>(capacity));
//        return;
//      }
//    }
//    ctx->code = RetCode::DelegateError;
//  } else {
//    FOOTSTONE_UNREACHABLE();
//  }
}

void FfiDelegateHandler::RequestUntrustedContent(
    std::shared_ptr<ASyncContext> ctx,
    std::function<std::shared_ptr<UriHandler>()> next) {
//  FOOTSTONE_DCHECK(!next()) << "jni delegate must be the last handler";
//  if (ctx->req_meta[kCallFromKey] == kCallFromJavaValue) {  // call from java
//    ctx->cb(UriHandler::RetCode::SchemeNotRegister, {}, {});
//    return;
//  }
//  JNIEnv* j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
//  auto j_uri = JniUtils::StrViewToJString(j_env, ctx->uri);
//  auto id = request_id_.fetch_add(1);
//  auto wrapper = std::make_shared<JniDelegateHandlerAsyncWrapper>(shared_from_this(),ctx);
//  auto flag = GetAsyncWrapperMap().Insert(id, wrapper);
//  FOOTSTONE_CHECK(flag);
//  jobject j_map = j_env->NewObject(j_util_map_clazz, j_map_init_method_id);
//  for (auto [key, value]: ctx->req_meta) {
//    auto j_key = JniUtils::StrViewToJString(j_env, string_view::new_from_utf8(key.c_str(), key.length()));
//    auto j_value = JniUtils::StrViewToJString(j_env, string_view::new_from_utf8(value.c_str(), value.length()));
//    j_env->CallObjectMethod(j_map, j_map_put_method_id, j_key, j_value);
//  }
//  j_env->CallVoidMethod(delegate_->GetObj(),
//                        j_call_jni_delegate_async_method_id,
//                        j_uri,
//                        j_map,
//                        footstone::checked_numeric_cast<uint32_t, jint>(id));
}

void FfiDelegateHandler::Lock() {
  // 在dom的css layout开始前，要保证dom
  // op全部执行完成，否则自定义测量的节点测量数据会不准确
  notified_ = false;
  std::unique_lock<std::mutex> lock(mutex_);
  while (!notified_) {
    FOOTSTONE_DLOG(INFO) << "Run Ffi Delegate Handler Wait Lock";
    cv_.wait(lock);
  }
}

void FfiDelegateHandler::Unlock() {
  if (!notified_) {
    notified_ = true;
    cv_.notify_one();
    FOOTSTONE_DLOG(INFO) << "Run Ffi Delegate Handler Wait Unlock";
  }
}

}
