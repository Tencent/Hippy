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

#include "handler/jni_delegate_handler.h"

#include "handler/asset_handler.h"
#include "handler/file_handler.h"
#include "footstone/check.h"
#include "footstone/logging.h"
#include "footstone/string_view_utils.h"
#include "jni/data_holder.h"
#include "jni/jni_env.h"
#include "jni/jni_register.h"
#include "jni/jni_utils.h"
#include "vfs/uri_loader.h"

namespace hippy {
inline namespace vfs {

// call from c++
REGISTER_JNI("com/tencent/vfs/VfsManager", // NOLINT(cert-err58-cpp)
                    "onTraversalsEndAsync",
                    "(Lcom/tencent/vfs/ResourceDataHolder;)V",
                    OnJniDelegateCallback)

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

static jclass j_resource_data_holder_clazz;
static jmethodID j_resource_data_holder_init_method_id;
static jfieldID j_holder_uri_field_id;
static jfieldID j_holder_buffer_field_id;
static jfieldID j_holder_bytes_field_id;
static jfieldID j_holder_req_header_field_id;
static jfieldID j_holder_rsp_header_field_id;
static jfieldID j_holder_transfer_type_field_id;
static jfieldID j_holder_cb_field_id;
static jfieldID j_holder_err_msg_field_id;
static jfieldID j_holder_ret_code_field_id;
static jfieldID j_holder_native_id_field_id;
static jfieldID j_holder_index_field_id;

static jclass j_util_map_clazz;
static jmethodID j_map_init_method_id;
static jmethodID j_map_get_method_id;
static jmethodID j_map_put_method_id;
static jmethodID j_map_size_method_id;
static jmethodID j_map_entry_set_method_id;

static jclass j_util_map_entry_clazz;
static jmethodID j_map_entry_get_key_method_id;
static jmethodID j_map_entry_get_value_method_id;

static jclass j_util_set_clazz;
static jmethodID j_set_iterator_method_id;

static jclass j_set_iterator_clazz;
static jmethodID j_set_iterator_has_next_method_id;
static jmethodID j_set_iterator_next_method_id;

static jclass j_fetch_resource_cb_interface_clazz;
static jmethodID j_interface_cb_method_id;

static jobject j_request_from_native_value;
static jobject j_request_from_local_value;

static jobject j_transfer_type_normal_value;
static jobject j_transfer_type_nio_value;

using ASyncContext = hippy::vfs::UriHandler::ASyncContext;
using SyncContext = hippy::vfs::UriHandler::SyncContext;

JniDelegateHandler::AsyncWrapperMap JniDelegateHandler::wrapper_map_;
std::atomic<uint32_t> JniDelegateHandler::request_id_ = 1;
JniDelegateHandler::JniDelegateHandlerMap JniDelegateHandler::delegate_map_;

std::atomic<uint32_t> g_delegate_id = 1;

constexpr char kCallFromKey[] = "__Hippy_call_from";
constexpr char kCallFromJavaValue[] = "java";

bool JniDelegateHandler::Init(JNIEnv* j_env) {
  j_resource_data_holder_clazz = reinterpret_cast<jclass>(
      j_env->NewGlobalRef(j_env->FindClass("com/tencent/vfs/ResourceDataHolder")));
  j_resource_data_holder_init_method_id =
      j_env->GetMethodID(j_resource_data_holder_clazz,
                         "<init>",
                         "(Ljava/lang/String;Ljava/util/Map;Lcom/tencent/vfs/ResourceDataHolder$RequestFrom;)V");
  j_holder_uri_field_id = j_env->GetFieldID(j_resource_data_holder_clazz, "uri", "Ljava/lang/String;");
  j_holder_buffer_field_id = j_env->GetFieldID(j_resource_data_holder_clazz, "buffer", "Ljava/nio/ByteBuffer;");
  j_holder_bytes_field_id = j_env->GetFieldID(j_resource_data_holder_clazz, "bytes", "[B");
  j_holder_transfer_type_field_id = j_env->GetFieldID(j_resource_data_holder_clazz, "transferType",
                                                      "Lcom/tencent/vfs/ResourceDataHolder$TransferType;");
  j_holder_req_header_field_id = j_env->GetFieldID(j_resource_data_holder_clazz, "requestHeader", "Ljava/util/Map;");
  j_holder_rsp_header_field_id = j_env->GetFieldID(j_resource_data_holder_clazz, "responseHeader", "Ljava/util/Map;");
  j_holder_cb_field_id = j_env->GetFieldID(j_resource_data_holder_clazz, "callback", "Lcom/tencent/vfs/VfsManager$FetchResourceCallback;");
  j_holder_err_msg_field_id = j_env->GetFieldID(j_resource_data_holder_clazz, "errorMessage", "Ljava/lang/String;");
  j_holder_ret_code_field_id = j_env->GetFieldID(j_resource_data_holder_clazz, "resultCode", "I");
  j_holder_native_id_field_id = j_env->GetFieldID(j_resource_data_holder_clazz, "nativeId", "I");
  j_holder_index_field_id = j_env->GetFieldID(j_resource_data_holder_clazz, "index", "I");
  auto j_request_from_clazz = reinterpret_cast<jclass>(
      j_env->NewGlobalRef(j_env->FindClass("com/tencent/vfs/ResourceDataHolder$RequestFrom")));
  auto j_request_from_native_field_id = j_env->GetStaticFieldID(j_request_from_clazz, "NATIVE",
                                                           "Lcom/tencent/vfs/ResourceDataHolder$RequestFrom;");
  j_request_from_native_value = j_env->NewGlobalRef(
      j_env->GetStaticObjectField(j_request_from_clazz, j_request_from_native_field_id));
  auto j_request_from_local_field_id = j_env->GetStaticFieldID(j_request_from_clazz, "LOCAL",
                                                          "Lcom/tencent/vfs/ResourceDataHolder$RequestFrom;");
  j_request_from_local_value = j_env->NewGlobalRef(
      j_env->GetStaticObjectField(j_request_from_clazz, j_request_from_local_field_id));

  auto j_transfer_type_clazz = reinterpret_cast<jclass>(
      j_env->NewGlobalRef(j_env->FindClass("com/tencent/vfs/ResourceDataHolder$TransferType")));
  auto j_transfer_type_normal_field_id = j_env->GetStaticFieldID(j_transfer_type_clazz, "NORMAL",
                                                            "Lcom/tencent/vfs/ResourceDataHolder$TransferType;");
  j_transfer_type_normal_value = j_env->NewGlobalRef(
      j_env->GetStaticObjectField(j_transfer_type_clazz, j_transfer_type_normal_field_id));

  auto j_transfer_type_nio_field_id = j_env->GetStaticFieldID(j_transfer_type_clazz, "NIO",
                                                         "Lcom/tencent/vfs/ResourceDataHolder$TransferType;");
  j_transfer_type_nio_value = j_env->NewGlobalRef(
      j_env->GetStaticObjectField(j_transfer_type_clazz, j_transfer_type_nio_field_id));

  j_util_map_clazz = reinterpret_cast<jclass>(j_env->NewGlobalRef(j_env->FindClass("java/util/HashMap")));
  j_map_init_method_id = j_env->GetMethodID(j_util_map_clazz, "<init>", "()V");
  j_map_get_method_id = j_env->GetMethodID(j_util_map_clazz, "get", "(Ljava/lang/Object;)Ljava/lang/Object;");
  j_map_put_method_id = j_env->GetMethodID(j_util_map_clazz, "put", "(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;");
  j_map_size_method_id = j_env->GetMethodID(j_util_map_clazz, "size", "()I");
  j_map_entry_set_method_id = j_env->GetMethodID(j_util_map_clazz, "entrySet", "()Ljava/util/Set;");

  j_util_map_entry_clazz = reinterpret_cast<jclass>(j_env->NewGlobalRef(j_env->FindClass("java/util/Map$Entry")));
  j_map_entry_get_key_method_id = j_env->GetMethodID(j_util_map_entry_clazz, "getKey", "()Ljava/lang/Object;");
  j_map_entry_get_value_method_id = j_env->GetMethodID(j_util_map_entry_clazz, "getValue", "()Ljava/lang/Object;");

  j_util_set_clazz = reinterpret_cast<jclass>(j_env->NewGlobalRef(j_env->FindClass("java/util/Set")));
  j_set_iterator_method_id = j_env->GetMethodID(j_util_set_clazz, "iterator", "()Ljava/util/Iterator;");

  j_set_iterator_clazz = reinterpret_cast<jclass>(j_env->NewGlobalRef(j_env->FindClass("java/util/Iterator")));
  j_set_iterator_has_next_method_id = j_env->GetMethodID(j_set_iterator_clazz, "hasNext", "()Z");
  j_set_iterator_next_method_id = j_env->GetMethodID(j_set_iterator_clazz, "next", "()Ljava/lang/Object;");

  j_vfs_manager_clazz = reinterpret_cast<jclass>(j_env->NewGlobalRef(j_env->FindClass("com/tencent/vfs/VfsManager")));
  j_fetch_resource_cb_interface_clazz = j_env->FindClass("com/tencent/vfs/VfsManager$FetchResourceCallback");
  j_interface_cb_method_id = j_env->GetMethodID(j_fetch_resource_cb_interface_clazz, "onFetchCompleted", "(Lcom/tencent/vfs/ResourceDataHolder;)V");
  j_call_jni_delegate_sync_method_id = j_env->GetMethodID(j_vfs_manager_clazz,"doLocalTraversalsSync",
    "(Ljava/lang/String;Ljava/util/Map;)Lcom/tencent/vfs/ResourceDataHolder;");
  j_call_jni_delegate_async_method_id = j_env->GetMethodID(j_vfs_manager_clazz, "doLocalTraversalsAsync",
    "(Ljava/lang/String;Ljava/util/Map;I)V");

  return true;
}

bool JniDelegateHandler::Destroy() {
  JNIEnv* j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();

  j_env->DeleteGlobalRef(j_vfs_manager_clazz);
  j_env->DeleteGlobalRef(j_util_map_clazz);
  j_env->DeleteGlobalRef(j_util_map_entry_clazz);
  j_env->DeleteGlobalRef(j_resource_data_holder_clazz);
  j_env->DeleteGlobalRef(j_fetch_resource_cb_interface_clazz);
  j_env->DeleteGlobalRef(j_util_set_clazz);
  j_env->DeleteGlobalRef(j_set_iterator_clazz);
  j_env->DeleteGlobalRef(j_request_from_native_value);
  j_env->DeleteGlobalRef(j_request_from_local_value);
  j_env->DeleteGlobalRef(j_transfer_type_normal_value);
  j_env->DeleteGlobalRef(j_transfer_type_nio_value);

  return true;
}

JniDelegateHandler::JniDelegateHandler(JNIEnv* j_env, jobject j_delegate) {
  delegate_ = std::make_shared<JavaRef>(j_env, j_delegate);
}

enum class FetchResultCode {
  OK,
  ERR_OPEN_LOCAL_FILE,
  ERR_NOT_SUPPORT_SYNC_REMOTE,
  ERR_UNKNOWN_SCHEME,
  ERR_REMOTE_REQUEST_FAILED
};

UriHandler::RetCode CovertToUriHandlerRetCode(jint code) {
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
    case static_cast<int>(FetchResultCode::ERR_UNKNOWN_SCHEME): {
      return UriHandler::RetCode::SchemeError;
    }
    case static_cast<int>(FetchResultCode::ERR_REMOTE_REQUEST_FAILED): {
      return UriHandler::RetCode::Failed;
    }
    default: {
      FOOTSTONE_UNREACHABLE();
    }
  }
}

FetchResultCode CovertToFetchResultCode(UriHandler::RetCode code) {
  switch (code) {
    case UriHandler::RetCode::Success: {
      return FetchResultCode::OK;
    }
    case UriHandler::RetCode::SchemeError: {
      return FetchResultCode::ERR_UNKNOWN_SCHEME;
    }
    case UriHandler::RetCode::DelegateError:
    case UriHandler::RetCode::PathError:
    case UriHandler::RetCode::PathNotMatch:
    case UriHandler::RetCode::ResourceNotFound:
    case UriHandler::RetCode::Timeout:
    case UriHandler::RetCode::UriError:
    case UriHandler::RetCode::Failed: {
      return FetchResultCode::ERR_REMOTE_REQUEST_FAILED;
    }
    case UriHandler::RetCode::SchemeNotRegister: {
      return FetchResultCode::ERR_NOT_SUPPORT_SYNC_REMOTE;
    }
    default: {
      FOOTSTONE_UNREACHABLE();
    }
  }
}

std::unordered_map<std::string, std::string> JavaMapToUnorderedMap(JNIEnv* j_env, jobject j_map) {
  if (!j_map) {
    return {};
  }
  auto size = j_env->CallIntMethod(j_map, j_map_size_method_id);
  if (!size) {
    return {};
  }
  std::unordered_map<std::string, std::string> ret_map;
  auto j_set = j_env->CallObjectMethod(j_map, j_map_entry_set_method_id);
  auto j_iterator = j_env->CallObjectMethod(j_set, j_set_iterator_method_id);
  while (j_env->CallBooleanMethod(j_iterator, j_set_iterator_has_next_method_id)) {
    auto j_entry = j_env->CallObjectMethod(j_iterator, j_set_iterator_next_method_id);
    auto j_key = reinterpret_cast<jstring>(j_env->CallObjectMethod(j_entry, j_map_entry_get_key_method_id));
    if (!j_key) {
      continue;
    }
    auto u8_key_str = footstone::StringViewUtils::ConvertEncoding(JniUtils::ToStrView(j_env, j_key),
                                                                  footstone::string_view::Encoding::Utf8).utf8_value();
    auto j_value = reinterpret_cast<jstring>(j_env->CallObjectMethod(j_entry, j_map_entry_get_value_method_id));
    if (!j_value) {
      continue;
    }
    auto u8_value_str = footstone::StringViewUtils::ConvertEncoding(
        JniUtils::ToStrView(j_env, j_value),
        footstone::string_view::Encoding::Utf8).utf8_value();
    auto key_str = std::string(reinterpret_cast<const char*>(u8_key_str.c_str()), u8_key_str.length());
    auto value_str = std::string(reinterpret_cast<const char*>(u8_value_str.c_str()), u8_value_str.length());
    ret_map[key_str] = value_str;
  }
  return ret_map;
}

jobject UnorderedMapToJavaMap(JNIEnv* j_env, const std::unordered_map<std::string, std::string>& map) {
  auto j_map = j_env->NewObject(j_util_map_clazz,
                                j_map_init_method_id);
  for (const auto& p: map) {
    auto j_key = JniUtils::StrViewToJString(j_env,footstone::string_view::new_from_utf8(
        p.first.c_str(), p.first.length()));
    auto j_value = JniUtils::StrViewToJString(j_env,footstone::string_view::new_from_utf8(
        p.second.c_str(), p.second.length()));
    j_env->CallObjectMethod(j_map, j_map_put_method_id, j_key, j_value);
  }
  return j_map;
}

std::shared_ptr<UriLoader> GetUriLoader(jint j_id) {
  std::any loader_object;
  bool flag = hippy::global_data_holder.Find(
      footstone::checked_numeric_cast<jint, uint32_t>(j_id),
      loader_object);
  FOOTSTONE_CHECK(flag);
  return std::any_cast<std::shared_ptr<UriLoader>>(loader_object);
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
  auto j_holder = j_env->CallObjectMethod(delegate_->GetObj(), j_call_jni_delegate_sync_method_id, j_uri, j_map);
  auto j_ret_code = j_env->GetIntField(j_holder, j_holder_ret_code_field_id);
  RetCode ret_code = CovertToUriHandlerRetCode(j_ret_code);
  ctx->code = ret_code;
  if (ret_code != RetCode::Success) {
    return;
  }
  auto next_delegate = next();
  FOOTSTONE_CHECK(!next_delegate);
  auto j_type = j_env->GetObjectField(j_holder, j_holder_transfer_type_field_id);
  if (j_env->IsSameObject(j_type, j_transfer_type_normal_value)) {
    auto j_bytes = reinterpret_cast<jbyteArray>(j_env->GetObjectField(j_holder, j_holder_bytes_field_id));
    ctx->content = JniUtils::AppendJavaByteArrayToBytes(j_env, j_bytes);
  } else if (j_env->IsSameObject(j_type, j_transfer_type_nio_value)) {
    auto j_buffer = j_env->GetObjectField(j_holder, j_holder_buffer_field_id);
    if (j_buffer) {
      char* buffer_address = static_cast<char*>(j_env->GetDirectBufferAddress(j_buffer));
      FOOTSTONE_CHECK(buffer_address);
      auto capacity = j_env->GetDirectBufferCapacity(j_buffer);
      if (capacity >= 0) {
        ctx->content = bytes(buffer_address, footstone::checked_numeric_cast<jlong, size_t>(capacity));
        return;
      }
    }
    ctx->code = RetCode::DelegateError;
  } else {
    FOOTSTONE_UNREACHABLE();
  }
}

void JniDelegateHandler::RequestUntrustedContent(
    std::shared_ptr<ASyncContext> ctx,
    std::function<std::shared_ptr<UriHandler>()> next) {
  FOOTSTONE_DCHECK(!next());
  if (ctx->req_meta[kCallFromKey] == kCallFromJavaValue) {  // call from java
    ctx->cb(UriHandler::RetCode::SchemeNotRegister, {}, {});
    return;
  }
  JNIEnv* j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  auto j_uri = JniUtils::StrViewToJString(j_env, ctx->uri);
  auto id = request_id_.fetch_add(1);
  auto wrapper = std::make_shared<JniDelegateHandlerAsyncWrapper>(shared_from_this(),ctx);
  auto flag = GetAsyncWrapperMap().Insert(id, wrapper);
  FOOTSTONE_CHECK(flag);
  jobject j_map = j_env->NewObject(j_util_map_clazz, j_map_init_method_id);
  for (auto [key, value]: ctx->req_meta) {
    auto j_key = JniUtils::StrViewToJString(j_env, string_view::new_from_utf8(key.c_str(), key.length()));
    auto j_value = JniUtils::StrViewToJString(j_env, string_view::new_from_utf8(value.c_str(), value.length()));
    j_env->CallObjectMethod(j_map, j_map_put_method_id, j_key, j_value);
  }
  j_env->CallVoidMethod(delegate_->GetObj(),
                        j_call_jni_delegate_async_method_id,
                        j_uri,
                        j_map,
                        footstone::checked_numeric_cast<uint32_t, jint>(id));
}

// call from c++
void OnJniDelegateCallback(JNIEnv* j_env, __unused jobject j_object, jobject j_holder) {
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
  UriHandler::RetCode ret_code = CovertToUriHandlerRetCode(j_ret_code);
  if (ret_code != UriHandler::RetCode::Success) {
    cb(ret_code, {}, UriHandler::bytes());
    return;
  }
  auto rsp_map = JavaMapToUnorderedMap(
      j_env, j_env->GetObjectField(j_holder, j_holder_rsp_header_field_id));
  auto j_type = j_env->GetObjectField(j_holder, j_holder_transfer_type_field_id);
  if (j_env->IsSameObject(j_type, j_transfer_type_normal_value)) {
    auto j_bytes = reinterpret_cast<jbyteArray>(j_env->GetObjectField(j_holder, j_holder_bytes_field_id));
    cb(ret_code, rsp_map, JniUtils::AppendJavaByteArrayToBytes(j_env, j_bytes));
    return;
  } else if (j_env->IsSameObject(j_type, j_transfer_type_nio_value)) {
    auto j_buffer = j_env->GetObjectField(j_holder, j_holder_buffer_field_id);
    if (j_buffer) {
      char* buffer_address = static_cast<char*>(j_env->GetDirectBufferAddress(j_buffer));
      FOOTSTONE_CHECK(buffer_address);
      auto capacity = j_env->GetDirectBufferCapacity(j_buffer);
      if (capacity >= 0) {
        cb(ret_code, rsp_map, UriHandler::bytes(buffer_address,
                                                footstone::checked_numeric_cast<jlong, size_t>(capacity)));
        return;
      }
    }
    cb(UriHandler::RetCode::DelegateError, rsp_map, {});
  } else {
    FOOTSTONE_UNREACHABLE();
  }
}

// call from java
void OnJniDelegateInvokeAsync(JNIEnv* j_env, __unused jobject j_object, jint j_id, jobject j_holder, jobject j_cb) {
  auto loader = GetUriLoader(j_id);
  auto j_uri = reinterpret_cast<jstring>(j_env->GetObjectField(j_holder, j_holder_uri_field_id));
  auto uri = JniUtils::ToStrView(j_env, j_uri);
  auto req_meta = JavaMapToUnorderedMap(j_env,
                                        j_env->GetObjectField(j_holder, j_holder_req_header_field_id));
  req_meta[kCallFromKey] = kCallFromJavaValue;
  auto java_cb = std::make_shared<JavaRef>(j_env, j_cb);
  auto cb = [java_cb, j_uri](
      UriLoader::RetCode, const std::unordered_map<std::string, std::string>& rsp_meta, const UriLoader::bytes& content) {
    auto j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
    auto j_rsp_meta = UnorderedMapToJavaMap(j_env, rsp_meta);
    auto j_holder = j_env->NewObject(j_resource_data_holder_clazz, j_resource_data_holder_init_method_id,
                                     j_uri, j_rsp_meta, j_request_from_native_value);
    bool is_direct_buffer = content.length() >= std::numeric_limits<uint32_t>::max();
    if (is_direct_buffer) {
      auto j_buffer = j_env->NewDirectByteBuffer(const_cast<void*>(reinterpret_cast<const void*>(content.c_str())),
                                                 footstone::check::checked_numeric_cast<size_t, jsize>(content.length()));
      j_env->SetObjectField(j_holder, j_holder_buffer_field_id, j_buffer);
      j_env->SetObjectField(j_holder, j_holder_transfer_type_field_id, j_transfer_type_nio_value);
    } else {
      auto len = footstone::check::checked_numeric_cast<size_t, jsize>(content.length());
      auto j_bytes = j_env->NewByteArray(len);
      j_env->SetByteArrayRegion(
          reinterpret_cast<jbyteArray>(j_bytes), 0, len,
          reinterpret_cast<const jbyte*>(content.c_str()));
      j_env->SetObjectField(j_holder, j_holder_bytes_field_id, j_bytes);
      j_env->SetObjectField(j_holder, j_holder_transfer_type_field_id, j_transfer_type_normal_value);
    }
    j_env->CallVoidMethod(java_cb->GetObj(), j_interface_cb_method_id, j_holder);
    JNIEnvironment::ClearJEnvException(j_env);
  };
  loader->RequestUntrustedContent(uri, req_meta, cb);

}

// call from java
void OnJniDelegateInvokeSync(JNIEnv* j_env, __unused jobject j_object, jint j_id, jobject j_holder) {
  auto loader = GetUriLoader(j_id);
  auto j_uri = reinterpret_cast<jstring>(j_env->GetObjectField(j_holder, j_holder_uri_field_id));
  auto uri = JniUtils::ToStrView(j_env, j_uri);
  auto j_map = j_env->GetObjectField(j_holder, j_holder_req_header_field_id);
  auto req_meta = JavaMapToUnorderedMap(j_env, j_map);
  UriLoader::RetCode code;
  std::unordered_map<std::string, std::string> rsp_meta;
  UriLoader::bytes content;
  req_meta[kCallFromKey] = kCallFromJavaValue;
  loader->RequestUntrustedContent(uri, req_meta, code, rsp_meta, content);
  j_env->SetObjectField(j_holder, j_holder_rsp_header_field_id, UnorderedMapToJavaMap(j_env, rsp_meta));
  bool is_direct_buffer = content.length() >= std::numeric_limits<uint32_t>::max();;
  if (is_direct_buffer) {
    auto j_buffer = j_env->NewDirectByteBuffer(const_cast<void*>(reinterpret_cast<const void*>(content.c_str())),
                                             footstone::check::checked_numeric_cast<size_t, jsize>(content.length()));
    j_env->SetObjectField(j_holder, j_holder_buffer_field_id, j_buffer);
    j_env->SetObjectField(j_holder, j_holder_transfer_type_field_id, j_transfer_type_nio_value);
  } else {
    auto len = footstone::check::checked_numeric_cast<size_t, jsize>(content.length());
    auto j_bytes = j_env->NewByteArray(len);
    j_env->SetByteArrayRegion(
        reinterpret_cast<jbyteArray>(j_bytes), 0, len,
        reinterpret_cast<const jbyte*>(content.c_str()));
    j_env->SetObjectField(j_holder, j_holder_bytes_field_id, j_bytes);
    j_env->SetObjectField(j_holder, j_holder_transfer_type_field_id, j_transfer_type_normal_value);
  }
  j_env->SetIntField(j_holder, j_holder_ret_code_field_id, static_cast<jint>(CovertToFetchResultCode(code)));
  JNIEnvironment::ClearJEnvException(j_env);
}

}
}
