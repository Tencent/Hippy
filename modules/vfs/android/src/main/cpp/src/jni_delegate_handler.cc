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

#include "android_vfs/jni_delegate_handler.h"

#include "android_vfs/android_uri_loader.h"
#include "android_vfs/asset_handler.h"
#include "android_vfs/file_handler.h"
#include "footstone/check.h"
#include "footstone/logging.h"
#include "jni/data_holder.h"
#include "jni/jni_env.h"
#include "jni/jni_register.h"
#include "jni/jni_utils.h"

namespace hippy {
inline namespace vfs {

char16_t kAssetSchema[] = u"asset";
char16_t kFileSchema[] = u"file";
char16_t kHttpSchema[] = u"http";
char16_t kHttpsSchema[] = u"https";

REGISTER_STATIC_JNI("com/tencent/vfs/VfsManager", // NOLINT(cert-err58-cpp)
                    "onCreateVfs",
                    "()I",
                    OnCreateVfs)

REGISTER_STATIC_JNI("com/tencent/vfs/VfsManager", // NOLINT(cert-err58-cpp)
                    "onDestroyVfs",
                    "(I)V",
                    OnDestroyVfs)

REGISTER_STATIC_JNI("com/tencent/vfs/VfsManager", // NOLINT(cert-err58-cpp)
                    "onTraversalsEndAsync",
                    "(Lcom/tencent/vfs/ResourceDataHolder;)V",
                    OnTraversalsEndAsync)

REGISTER_STATIC_JNI("com/tencent/vfs/VfsManager", // NOLINT(cert-err58-cpp)
                    "doNativeTraversalsAsync",
                    "(ILcom/tencent/vfs/ResourceDataHolder;Lcom/tencent/vfs/VfsManager$FetchResourceCallback;)V",
                    DoNativeTraversalsAsync)

REGISTER_STATIC_JNI("com/tencent/vfs/VfsManager", // NOLINT(cert-err58-cpp)
                    "doNativeTraversalsSync",
                    "(ILcom/tencent/vfs/ResourceDataHolder;)Lcom/tencent/vfs/ResourceDataHolder;",
                    DoNativeTraversalsSync)

static jclass j_vfs_manager_clazz;
static jmethodID j_fetch_resource_sync_method_id;
static jmethodID j_fetch_resource_async_method_id;

static jclass j_resource_data_holder_clazz;
static jfieldID j_holder_uri_field_id;
static jfieldID j_holder_data_field_id;
static jfieldID j_holder_params_field_id;
static jfieldID j_holder_cb_field_id;
static jfieldID j_holder_err_msg_field_id;
static jfieldID j_holder_ret_code_field_id;
static jfieldID j_holder_native_id_field_id;
static jfieldID j_holder_index_field_id;

static jclass j_util_map_clazz;
static jmethodID j_map_init_method_id;
static jmethodID j_map_get_method_id;
static jmethodID j_map_put_method_id;

static jclass j_fetch_resource_cb_clazz;

JniDelegateHandler::AsyncWrapperMap JniDelegateHandler::wrapper_map_;
std::atomic<uint32_t> JniDelegateHandler::request_id_ = 1;
JniDelegateHandler::JniDelegateHandlerMap JniDelegateHandler::delegate_map_;

std::atomic<uint32_t> g_delegate_id = 1;

bool JniDelegateHandler::Init(JNIEnv* j_env) {
  j_resource_data_holder_clazz = j_env->FindClass("com/tencent/vfs/ResourceDataHolder");
  j_holder_uri_field_id = j_env->GetFieldID(j_resource_data_holder_clazz, "uri", "Ljava/lang/String;");
  j_holder_data_field_id = j_env->GetFieldID(j_resource_data_holder_clazz, "data", "Ljava/nio/ByteBuffer;");
  j_holder_params_field_id = j_env->GetFieldID(j_resource_data_holder_clazz, "params", "Ljava/util/Map;");
  j_holder_cb_field_id = j_env->GetFieldID(j_resource_data_holder_clazz, "callback", "Lcom/tencent/vfs/VfsManager$FetchResourceCallback");
  j_holder_err_msg_field_id = j_env->GetFieldID(j_resource_data_holder_clazz, "errorMessage", "Ljava/lang/String;");
  j_holder_ret_code_field_id = j_env->GetFieldID(j_resource_data_holder_clazz, "resultCode", "I");
  j_holder_native_id_field_id = j_env->GetFieldID(j_resource_data_holder_clazz, "nativeId", "I");
  j_holder_index_field_id = j_env->GetFieldID(j_resource_data_holder_clazz, "index", "I");

  j_util_map_clazz = j_env->FindClass("java/util/Map");
  j_map_init_method_id = j_env->GetMethodID(j_util_map_clazz, "<init>", "()V");
  j_map_get_method_id = j_env->GetMethodID(j_util_map_clazz, "get", "(Ljava/lang/Object;)Ljava/lang/Object");
  j_map_put_method_id = j_env->GetMethodID(j_util_map_clazz, "put", "(Ljava/lang/String;Ljava/lang/Object;)Ljava/lang/Object");

  j_vfs_manager_clazz = j_env->FindClass("com/tencent/vfs/VfsManager");
  j_fetch_resource_cb_clazz = j_env->FindClass("com/tencent/vfs/VfsManager$FetchResourceCallback");
  j_fetch_resource_sync_method_id = j_env->GetMethodID(j_vfs_manager_clazz,"fetchResourceSync",
    "(Ljava/lang/String;Ljava/util/Map;)Lcom/tencent/vfs/ResourceDataHolder;");
  j_fetch_resource_async_method_id = j_env->GetMethodID(j_vfs_manager_clazz, "fetchResourceAsync",
    "(Ljava/lang/String;Ljava/util/Map;Ljava/nio/ByteBuffer;I)V");
  return true;
}

bool JniDelegateHandler::Destroy() {
  JNIEnv* j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();

  j_env->DeleteGlobalRef(j_vfs_manager_clazz);
  j_env->DeleteGlobalRef(j_util_map_clazz);
  j_env->DeleteGlobalRef(j_resource_data_holder_clazz);
  j_env->DeleteGlobalRef(j_fetch_resource_cb_clazz);

  return true;
}

JniDelegateHandler::JniDelegateHandler(JNIEnv* j_env, jobject j_delegate) {
  delegate_ = std::make_shared<JavaRef>(j_env, j_delegate);
}

enum class FetchResultCode {
  OK,
  ERR_OPEN_LOCAL_FILE,
  ERR_NOT_SUPPORT_SYNC_REMOTE,
};

UriHandler::RetCode ConvertJniRetCode(jint code) {
  switch (static_cast<int>(code)) {
    case static_cast<int>(FetchResultCode::OK): {
      return UriHandler::RetCode::Success;
    }
    case static_cast<int>(FetchResultCode::ERR_OPEN_LOCAL_FILE): {
      return UriHandler::RetCode::Failed;
    }
    case static_cast<int>(FetchResultCode::ERR_NOT_SUPPORT_SYNC_REMOTE): {
      return UriHandler::RetCode::SchemeNotRegister;
    }
    default: {
      FOOTSTONE_UNREACHABLE();
    }
  }
}

void JniDelegateHandler::RequestUntrustedContent(
    std::shared_ptr<SyncContext> ctx,
    std::function<std::shared_ptr<UriHandler>()> next) {
  FOOTSTONE_DCHECK(ctx);

  JNIEnv* j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  auto j_uri = JniUtils::StrViewToJString(j_env, ctx->uri);
  auto j_map = j_env->NewObject(j_util_map_clazz, j_map_init_method_id);
  for (auto [key, value]: ctx->req_meta) {
    auto j_key = JniUtils::StrViewToJString(j_env, string_view::new_from_utf8(key.c_str(), key.length()));
    auto j_value = JniUtils::StrViewToJString(j_env, string_view::new_from_utf8(value.c_str(), value.length()));
    j_env->CallObjectMethod(j_map, j_map_put_method_id, j_key, j_value);
  }
  auto j_obj = j_env->CallObjectMethod(delegate_->GetObj(), j_fetch_resource_sync_method_id, j_uri, j_map);
  auto j_ret_code = j_env->GetIntField(j_obj, j_holder_ret_code_field_id);
  RetCode ret_code = ConvertJniRetCode(j_ret_code);
  ctx->code = ret_code;
  if (ret_code != RetCode::Success) {
    return;
  }
  auto j_data = j_env->GetObjectField(j_obj, j_holder_data_field_id);
  auto next_delegate = next();
  if (next_delegate) {
    FOOTSTONE_UNREACHABLE();
  }
  char* buffer_address = static_cast<char*>(j_env->GetDirectBufferAddress(j_data));
  auto capacity = j_env->GetDirectBufferCapacity(j_data);
  if (capacity < 0) {
    ctx->code = RetCode::DelegateError;
    return;
  }
  ctx->content = bytes(buffer_address, static_cast<uint32_t>(capacity));
}

void JniDelegateHandler::RequestUntrustedContent(
    std::shared_ptr<ASyncContext> ctx,
    std::function<std::shared_ptr<UriHandler>()> next) {
  FOOTSTONE_DCHECK(ctx);
  auto next_delegate = next();
  if (next_delegate) {
    FOOTSTONE_UNREACHABLE();
  }

  JNIEnv* j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  auto j_uri = JniUtils::StrViewToJString(j_env, ctx->uri);
  auto id = request_id_.fetch_add(1);
  auto wrapper = std::make_shared<JniDelegateHandlerAsyncWrapper>(
    weak_from_this(),
    ctx
  );
  GetAsyncWrapperMap().Insert(id, wrapper);
  j_env->CallVoidMethod(delegate_->GetObj(), j_fetch_resource_async_method_id, j_uri, nullptr, nullptr, id);
}

jint OnCreateVfs(JNIEnv* j_env, jobject j_object) {
  auto delegate = std::make_shared<JniDelegateHandler>(j_env, j_object);
  auto id = hippy::global_data_holder_key.fetch_add(1);
  auto loader = std::make_shared<AndroidUriLoader>();
  auto file_delegate = std::make_shared<FileHandler>();
  std::shared_ptr<AssetHandler> asset_delegate = std::make_shared<AssetHandler>();
  loader->RegisterUriHandler(kAssetSchema, asset_delegate);
  loader->RegisterUriHandler(kFileSchema, file_delegate);
  loader->RegisterUriHandler(kHttpSchema, delegate);
  loader->RegisterUriHandler(kHttpsSchema, delegate);
  hippy::global_data_holder.Insert(id, loader);
  return footstone::checked_numeric_cast<uint32_t, jint>(id);
}

void OnDestroyVfs(JNIEnv* j_env, __unused jobject j_object, jint j_id) {
  auto id = footstone::checked_numeric_cast<jint, uint32_t>(j_id);
  bool flag = JniDelegateHandler::GetJniDelegateHandlerMap().Erase(id);
  FOOTSTONE_DCHECK(flag);
}

void OnTraversalsEndAsync(JNIEnv* j_env, __unused jobject j_object, jobject j_holder) {
  auto j_native_id = j_env->GetIntField(j_holder, j_holder_native_id_field_id);
  auto request_id = footstone::checked_numeric_cast<jint, uint32_t>(j_native_id);
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
  auto ctx = wrapper->context;
  auto cb = ctx->cb;
  FOOTSTONE_CHECK(cb);
  auto j_ret_code = j_env->GetIntField(j_holder, j_holder_ret_code_field_id);
  UriHandler::RetCode ret_code = ConvertJniRetCode(j_ret_code);
  if (ret_code != UriHandler::RetCode::Success) {
    cb(ret_code, {}, UriHandler::bytes());
    return;
  }
  auto j_data = j_env->GetObjectField(j_holder, j_holder_data_field_id);
  char* buffer_address = static_cast<char*>(j_env->GetDirectBufferAddress(j_data));
  auto capacity = j_env->GetDirectBufferCapacity(j_data);
  if (capacity < 0) {
    cb(UriHandler::RetCode::DelegateError, {}, UriHandler::bytes());
    return;
  }
  //todo java map
  cb(ret_code, {}, UriHandler::bytes(buffer_address, static_cast<uint32_t>(capacity)));
}

void DoNativeTraversalsAsync(JNIEnv* j_env, __unused jobject j_object, jint j_id, jobject j_holder, jobject j_cb) {
  auto id = footstone::checked_numeric_cast<jint, uint32_t>(j_id);
  std::any delegate_object;
  bool flag = hippy::global_data_holder.Find(id, delegate_object);
  FOOTSTONE_CHECK(flag);
  auto delegate = std::any_cast<std::shared_ptr<JniDelegateHandler>>(delegate_object);

}

jobject DoNativeTraversalsSync(JNIEnv* j_env, __unused jobject j_object, jint j_id, jobject j_holder) {
  return nullptr;
}

}
}
