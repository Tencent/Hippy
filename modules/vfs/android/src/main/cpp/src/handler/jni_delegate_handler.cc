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

#include "vfs/handler/jni_delegate_handler.h"

#include "footstone/check.h"
#include "footstone/logging.h"
#include "footstone/string_view_utils.h"
#include "jni/data_holder.h"
#include "jni/jni_invocation.h"
#include "jni/jni_env.h"
#include "jni/jni_register.h"
#include "jni/jni_utils.h"
#include "vfs/uri_loader.h"
#include "vfs/handler/asset_handler.h"
#include "vfs/handler/file_handler.h"
#include "vfs/job_response.h"
#include "vfs/request_job.h"
#include "vfs/vfs_resource_holder.h"


namespace hippy {
inline namespace vfs {

// call from c++
REGISTER_JNI("com/tencent/vfs/VfsManager", // NOLINT(cert-err58-cpp)
                    "onTraversalsEndAsync",
                    "(Lcom/tencent/vfs/ResourceDataHolder;)V",
                    OnJniDelegateCallback)

// call from java
REGISTER_JNI("com/tencent/vfs/VfsManager", // NOLINT(cert-err58-cpp)
             "onProgress",
             "(IJJ)V",
             OnJniDelegateInvokeProgress)

// call from java
REGISTER_JNI("com/tencent/vfs/VfsManager", // NOLINT(cert-err58-cpp)
             "doNativeTraversalsAsync",
             "(ILcom/tencent/vfs/ResourceDataHolder;Lcom/tencent/vfs/VfsManager$FetchResourceCallback;)V",
             OnJniDelegateInvokeAsync)

// call from java
REGISTER_JNI("com/tencent/vfs/VfsManager", // NOLINT(cert-err58-cpp)
             "doNativeTraversalsSync",
             "(ILcom/tencent/vfs/ResourceDataHolder;)V",
             OnJniDelegateInvokeSync)

static jclass j_vfs_manager_clazz;
static jmethodID j_call_jni_delegate_sync_method_id;
static jmethodID j_call_jni_delegate_async_method_id;

static jclass j_util_map_clazz;
static jmethodID j_map_init_method_id;
static jmethodID j_map_put_method_id;

JniDelegateHandler::AsyncWrapperMap JniDelegateHandler::wrapper_map_;
std::atomic<uint32_t> JniDelegateHandler::request_id_ = 1;

std::atomic<uint32_t> g_delegate_id = 1;

constexpr char kCallFromKey[] = "__Hippy_call_from";
constexpr char kCallFromJavaValue[] = "java";

namespace {

static jint JNI_OnLoad(__unused JavaVM* j_vm, __unused void* reserved) {
  auto j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();

  j_util_map_clazz =
      reinterpret_cast<jclass>(j_env->NewGlobalRef(j_env->FindClass("java/util/HashMap")));
  j_map_init_method_id = j_env->GetMethodID(j_util_map_clazz, "<init>", "()V");
  j_map_put_method_id = j_env->GetMethodID(j_util_map_clazz,
                                           "put",
                                           "(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;");

  j_vfs_manager_clazz =
      reinterpret_cast<jclass>(j_env->NewGlobalRef(j_env->FindClass("com/tencent/vfs/VfsManager")));
  j_call_jni_delegate_sync_method_id =
      j_env->GetMethodID(j_vfs_manager_clazz, "doLocalTraversalsSync",
                         "(Ljava/lang/String;Ljava/util/HashMap;Ljava/util/HashMap;)Lcom/tencent/vfs/ResourceDataHolder;");
  j_call_jni_delegate_async_method_id =
      j_env->GetMethodID(j_vfs_manager_clazz, "doLocalTraversalsAsync",
                         "(Ljava/lang/String;Ljava/util/HashMap;Ljava/util/HashMap;II)V");

  return JNI_VERSION_1_4;
}

static void JNI_OnUnload(__unused JavaVM* j_vm, __unused void* reserved) {
  auto j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();

  j_env->DeleteGlobalRef(j_vfs_manager_clazz);
  j_env->DeleteGlobalRef(j_util_map_clazz);
}

REGISTER_JNI_ONLOAD(JNI_OnLoad)
REGISTER_JNI_ONUNLOAD(JNI_OnUnload)

}

JniDelegateHandler::JniDelegateHandler(JNIEnv* j_env, jobject j_delegate) {
  delegate_ = std::make_shared<JavaRef>(j_env, j_delegate);
}

std::shared_ptr<UriLoader> GetUriLoader(jint j_id) {
  std::any loader_object;
  bool flag = hippy::global_data_holder.Find(
      footstone::checked_numeric_cast<jint, uint32_t>(j_id),
      loader_object);
  if (!flag) {
    return nullptr;
  }
  return std::any_cast<std::shared_ptr<UriLoader>>(loader_object);
}

void JniDelegateHandler::RequestUntrustedContent(
    std::shared_ptr<RequestJob> request,
    std::shared_ptr<JobResponse> response,
    std::function<std::shared_ptr<UriHandler>()> next) {
  FOOTSTONE_DCHECK(!next()) << "jni delegate must be the last handler";
  auto req_meta = request->GetMeta();
  if (req_meta[kCallFromKey] == kCallFromJavaValue) {  // call from java
    response->SetRetCode(RetCode::SchemeNotRegister);
    return;
  }
  JNIEnv* j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  auto j_uri = JniUtils::StrViewToJString(j_env, request->GetUri());
  auto j_headers_map = j_env->NewObject(j_util_map_clazz, j_map_init_method_id);
  auto j_params_map = j_env->NewObject(j_util_map_clazz, j_map_init_method_id);
  for (auto [key, value]: req_meta) {
    auto j_key = JniUtils::StrViewToJString(j_env, string_view::new_from_utf8(key.c_str(), key.length()));
    auto j_value = JniUtils::StrViewToJString(j_env, string_view::new_from_utf8(value.c_str(), value.length()));
    j_env->CallObjectMethod(j_headers_map, j_map_put_method_id, j_key, j_value);
  }
  auto j_holder = j_env->CallObjectMethod(delegate_->GetObj(), j_call_jni_delegate_sync_method_id, j_uri, j_headers_map, j_params_map);
  auto resource_holder = ResourceHolder::Create(j_holder);
  RetCode ret_code = resource_holder->GetCode(j_env);
  response->SetRetCode(ret_code);
  if (ret_code != RetCode::Success) {
    return;
  }
  response->SetMeta(resource_holder->GetRspMeta(j_env));
  response->SetContent(resource_holder->GetContent(j_env));
}

void JniDelegateHandler::RequestUntrustedContent(
    std::shared_ptr<RequestJob> request,
    std::function<void(std::shared_ptr<JobResponse>)> cb,
    std::function<std::shared_ptr<UriHandler>()> next) {
  FOOTSTONE_DCHECK(!next()) << "jni delegate must be the last handler";
  auto req_meta = request->GetMeta();
  if (req_meta[kCallFromKey] == kCallFromJavaValue) {  // call from java
    cb(std::make_shared<JobResponse>(hippy::JobResponse::RetCode::SchemeNotRegister));
    return;
  }
  JNIEnv* j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  auto j_uri = JniUtils::StrViewToJString(j_env, request->GetUri());
  auto id = request_id_.fetch_add(1);
  auto wrapper = std::make_shared<JniDelegateHandlerAsyncWrapper>(shared_from_this(), request, cb);
  auto flag = GetAsyncWrapperMap().Insert(id, wrapper);
  FOOTSTONE_CHECK(flag);
  auto j_headers_map = j_env->NewObject(j_util_map_clazz, j_map_init_method_id);
  auto j_params_map = j_env->NewObject(j_util_map_clazz, j_map_init_method_id);
  for (auto [key, value]: req_meta) {
    auto j_key = JniUtils::StrViewToJString(j_env, string_view::new_from_utf8(key.c_str(), key.length()));
    auto j_value = JniUtils::StrViewToJString(j_env, string_view::new_from_utf8(value.c_str(), value.length()));
    j_env->CallObjectMethod(j_headers_map, j_map_put_method_id, j_key, j_value);
  }
  j_env->CallVoidMethod(delegate_->GetObj(),
                        j_call_jni_delegate_async_method_id,
                        j_uri,
                        j_headers_map,
                        j_params_map,
                        footstone::checked_numeric_cast<uint32_t, jint>(id), -1);
}

// call from c++
void OnJniDelegateCallback(JNIEnv* j_env, __unused jobject j_object, jobject j_holder) {
  auto resource_holder = ResourceHolder::Create(j_holder);
  auto request_id = resource_holder->GetNativeId(j_env);
  std::shared_ptr<JniDelegateHandler::JniDelegateHandlerAsyncWrapper> wrapper;
  auto flag = JniDelegateHandler::GetAsyncWrapperMap().Find(request_id, wrapper);
  if (!flag) {
    FOOTSTONE_LOG(WARNING) << "onTraversalsEndAsync native id error, id = " << request_id;
    return;
  }
  auto weak = wrapper->delegate;
  auto delegate = weak.lock();
  if (!delegate) {
    return;
  }
  auto request = wrapper->request;
  auto cb = wrapper->cb;
  FOOTSTONE_CHECK(cb);
  UriHandler::RetCode ret_code = resource_holder->GetCode(j_env);
  if (ret_code != UriHandler::RetCode::Success) {
    cb(std::make_shared<JobResponse>(ret_code));
    return;
  }
  auto rsp_map = resource_holder->GetRspMeta(j_env);
  auto content = resource_holder->GetContent(j_env);
  cb(std::make_shared<JobResponse>(ret_code, "",
                                   std::move(rsp_map), std::move(content)));
}

void OnJniDelegateInvokeProgress(JNIEnv* j_env, __unused jobject j_object, jint j_id, jlong j_total, jlong j_loaded) {
  auto request_id = footstone::checked_numeric_cast<jint, uint32_t>(j_id);
  std::shared_ptr<JniDelegateHandler::JniDelegateHandlerAsyncWrapper> wrapper;
  auto flag = JniDelegateHandler::GetAsyncWrapperMap().Find(request_id, wrapper);
  if (!flag) {
    FOOTSTONE_LOG(WARNING) << "OnJniDelegateInvokeProgress id error, id = " << request_id;
    return;
  }
  auto cb = wrapper->request->GetProgressCallback();
  if (cb) {
    cb(static_cast<int64_t>(j_loaded), static_cast<int64_t>(j_total));
  }
}

// call from java
void OnJniDelegateInvokeAsync(JNIEnv* j_env, __unused jobject j_object, jint j_id, jobject j_holder, jobject j_cb) {
  auto resource_holder_req = ResourceHolder::Create(j_holder);
  auto uri = resource_holder_req->GetUri(j_env);
  auto req_meta = resource_holder_req->GetReqMeta(j_env);
  req_meta[kCallFromKey] = kCallFromJavaValue;
  auto java_cb = std::make_shared<JavaRef>(j_env, j_cb);
  auto cb = [java_cb, j_holder](
                UriLoader::RetCode code,
                const std::unordered_map<std::string, std::string> &rsp_meta,
                const UriLoader::bytes &content) {
    auto j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
    auto resource_holder = ResourceHolder::Create(j_holder);
    resource_holder->SetContent(j_env, content);
    resource_holder->SetRspMeta(j_env, rsp_meta);
    resource_holder->SetCode(j_env, code);
    resource_holder->FetchComplete(j_env, java_cb->GetObj());
    JNIEnvironment::ClearJEnvException(j_env);
  };
  auto loader = GetUriLoader(j_id);
  if (loader == nullptr) {
    FOOTSTONE_LOG(ERROR) << "uri loader is null, uri loader id " << j_id;
    return;
  }
  loader->RequestUntrustedContent(uri, req_meta, cb);
}

// call from java
void OnJniDelegateInvokeSync(JNIEnv* j_env, __unused jobject j_object, jint j_id, jobject j_holder) {
  auto resource_holder = ResourceHolder::Create(j_holder);
  auto uri = resource_holder->GetUri(j_env);
  auto req_meta = resource_holder->GetReqMeta(j_env);
  UriLoader::RetCode code;
  std::unordered_map<std::string, std::string> rsp_meta;
  UriLoader::bytes content;
  req_meta[kCallFromKey] = kCallFromJavaValue;
  auto loader = GetUriLoader(j_id);
  if (loader == nullptr) {
    FOOTSTONE_LOG(ERROR) << "uri loader is null, uri loader id " << j_id;
    JNIEnvironment::ClearJEnvException(j_env);
    return;
  }
  loader->RequestUntrustedContent(uri, req_meta, code, rsp_meta, content);
  resource_holder->SetRspMeta(j_env, rsp_meta);
  resource_holder->SetContent(j_env, content);
  resource_holder->SetCode(j_env, code);
  JNIEnvironment::ClearJEnvException(j_env);
}
}
}
