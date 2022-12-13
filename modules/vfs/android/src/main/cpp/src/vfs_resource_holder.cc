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

#include "vfs/vfs_resource_holder.h"

#include "footstone/check.h"
#include "jni/jni_env.h"
#include "jni/jni_invocation.h"

namespace hippy {
inline namespace vfs {
static jclass j_resource_data_holder_clazz;
static jmethodID j_resource_data_holder_init_method_id;
static jfieldID j_holder_uri_field_id;
static jfieldID j_holder_buffer_field_id;
static jfieldID j_holder_bytes_field_id;
static jfieldID j_holder_req_header_field_id;
static jfieldID j_holder_req_param_field_id;
static jfieldID j_holder_rsp_header_field_id;
static jfieldID j_holder_transfer_type_field_id;
static jfieldID j_holder_ret_code_field_id;
static jfieldID j_holder_native_id_field_id;
static jfieldID j_holder_error_message_field_id;
static jfieldID j_holder_processor_tag_field_id;

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

std::shared_ptr<ResourceHolder> ResourceHolder::Create(jobject j_holder) {
  return std::make_shared<ResourceHolder>(j_holder);
}

std::shared_ptr<ResourceHolder> ResourceHolder::CreateNewHolder(jobject j_holder) {
  JNIEnv* j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  auto j_uri = reinterpret_cast<jstring>(j_env->GetObjectField(j_holder, j_holder_uri_field_id));
  auto j_headers_map = j_env->GetObjectField(j_holder, j_holder_req_header_field_id);
  auto j_params_map = j_env->GetObjectField(j_holder, j_holder_req_param_field_id);
  auto j_new_holder = j_env->NewObject(j_resource_data_holder_clazz, j_resource_data_holder_init_method_id,
                                       j_uri, j_headers_map, j_params_map, j_request_from_native_value);
  return ResourceHolder::Create(j_new_holder);
}

static jint JNI_OnLoad(__unused JavaVM* j_vm, __unused void* reserved) {
  JNIEnv* j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();

  j_resource_data_holder_clazz = reinterpret_cast<jclass>(
      j_env->NewGlobalRef(j_env->FindClass("com/tencent/vfs/ResourceDataHolder")));
  j_resource_data_holder_init_method_id =
      j_env->GetMethodID(j_resource_data_holder_clazz,
                         "<init>",
                         "(Ljava/lang/String;Ljava/util/HashMap;Ljava/util/HashMap;Lcom/tencent/vfs/ResourceDataHolder$RequestFrom;)V");
  j_holder_uri_field_id = j_env->GetFieldID(j_resource_data_holder_clazz, "uri", "Ljava/lang/String;");
  j_holder_buffer_field_id = j_env->GetFieldID(j_resource_data_holder_clazz, "buffer", "Ljava/nio/ByteBuffer;");
  j_holder_bytes_field_id = j_env->GetFieldID(j_resource_data_holder_clazz, "bytes", "[B");
  j_holder_transfer_type_field_id = j_env->GetFieldID(j_resource_data_holder_clazz, "transferType",
                                                      "Lcom/tencent/vfs/ResourceDataHolder$TransferType;");
  j_holder_req_header_field_id = j_env->GetFieldID(j_resource_data_holder_clazz, "requestHeaders", "Ljava/util/HashMap;");
  j_holder_req_param_field_id = j_env->GetFieldID(j_resource_data_holder_clazz, "requestParams", "Ljava/util/HashMap;");
  j_holder_rsp_header_field_id = j_env->GetFieldID(j_resource_data_holder_clazz, "responseHeaders", "Ljava/util/HashMap;");
  j_holder_ret_code_field_id = j_env->GetFieldID(j_resource_data_holder_clazz, "resultCode", "I");
  j_holder_native_id_field_id = j_env->GetFieldID(j_resource_data_holder_clazz, "nativeRequestId", "I");
  j_holder_error_message_field_id = j_env->GetFieldID(j_resource_data_holder_clazz, "errorMessage", "Ljava/lang/String;");
  j_holder_processor_tag_field_id = j_env->GetFieldID(j_resource_data_holder_clazz, "processorTag", "Ljava/lang/String;");

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
  j_map_put_method_id = j_env->GetMethodID(j_util_map_clazz,
                                           "put",
                                           "(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;");
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

  j_fetch_resource_cb_interface_clazz = j_env->FindClass("com/tencent/vfs/VfsManager$FetchResourceCallback");
  j_interface_cb_method_id = j_env->GetMethodID(
      j_fetch_resource_cb_interface_clazz,
      "onFetchCompleted",
      "(Lcom/tencent/vfs/ResourceDataHolder;)V");

  return JNI_VERSION_1_4;
}

static void JNI_OnUnload(__unused JavaVM* j_vm, __unused void* reserved) {
  JNIEnv* j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();

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
}

REGISTER_JNI_ONLOAD(JNI_OnLoad)
REGISTER_JNI_ONUNLOAD(JNI_OnUnload)

ResourceHolder::~ResourceHolder() {
  if (j_holder_) {
    JNIEnv *j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
    j_env->DeleteLocalRef(j_holder_);
  }
}

UriHandler::RetCode CovertToUriHandlerRetCode(jint code) {
  return (code == 0) ? UriHandler::RetCode::Success : UriHandler::RetCode::Failed;
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
  for (const auto &p : map) {
    auto j_key = JniUtils::StrViewToJString(j_env, footstone::string_view::new_from_utf8(
        p.first.c_str(), p.first.length()));
    auto j_value = JniUtils::StrViewToJString(j_env, footstone::string_view::new_from_utf8(
        p.second.c_str(), p.second.length()));
    j_env->CallObjectMethod(j_map, j_map_put_method_id, j_key, j_value);
  }
  return j_map;
}

uint32_t ResourceHolder::GetNativeId(JNIEnv* j_env) {
  FOOTSTONE_DCHECK(j_holder_);
  auto j_native_id = j_env->GetIntField(j_holder_, j_holder_native_id_field_id);
  return footstone::checked_numeric_cast<jint, uint32_t>(j_native_id);
}

string_view ResourceHolder::GetUri(JNIEnv* j_env) {
  FOOTSTONE_DCHECK(j_holder_);
  auto j_uri = reinterpret_cast<jstring>(j_env->GetObjectField(j_holder_, j_holder_uri_field_id));
  return JniUtils::ToStrView(j_env, j_uri);
}

RetCode ResourceHolder::GetCode(JNIEnv* j_env) {
  FOOTSTONE_DCHECK(j_holder_);
  auto j_ret_code = j_env->GetIntField(j_holder_, j_holder_ret_code_field_id);
  return CovertToUriHandlerRetCode(j_ret_code);
}

void ResourceHolder::SetCode(JNIEnv* j_env, RetCode code) {
  FOOTSTONE_DCHECK(j_holder_);
  j_env->SetIntField(j_holder_, j_holder_ret_code_field_id, static_cast<jint>(code));
}

std::unordered_map<std::string, std::string> ResourceHolder::GetReqMeta(JNIEnv* j_env) {
  FOOTSTONE_DCHECK(j_holder_);
  auto j_req_map = j_env->GetObjectField(j_holder_, j_holder_req_header_field_id);
  return JavaMapToUnorderedMap(j_env, j_req_map);
}

std::unordered_map<std::string, std::string> ResourceHolder::GetRspMeta(JNIEnv* j_env) {
  FOOTSTONE_DCHECK(j_holder_);
  auto j_rsp_map = j_env->GetObjectField(j_holder_, j_holder_rsp_header_field_id);
  return JavaMapToUnorderedMap(j_env, j_rsp_map);
}

void ResourceHolder::SetRspMeta(JNIEnv* j_env, std::unordered_map<std::string, std::string> rsp_meta) {
  FOOTSTONE_DCHECK(j_holder_);
  auto j_map = UnorderedMapToJavaMap(j_env, rsp_meta);
  j_env->SetObjectField(j_holder_, j_holder_rsp_header_field_id, j_map);
  j_env->DeleteLocalRef(j_map);
}

byte_string ResourceHolder::GetContent(JNIEnv* j_env) {
  FOOTSTONE_DCHECK(j_holder_);
  byte_string content;
  auto j_type = j_env->GetObjectField(j_holder_, j_holder_transfer_type_field_id);
  if (j_env->IsSameObject(j_type, j_transfer_type_normal_value)) {
    auto j_bytes = reinterpret_cast<jbyteArray>(j_env->GetObjectField(j_holder_, j_holder_bytes_field_id));
    content = JniUtils::AppendJavaByteArrayToBytes(j_env, j_bytes);
  } else if (j_env->IsSameObject(j_type, j_transfer_type_nio_value)) {
    auto j_buffer = j_env->GetObjectField(j_holder_, j_holder_buffer_field_id);
    if (j_buffer) {
      char* buffer_address = static_cast<char*>(j_env->GetDirectBufferAddress(j_buffer));
      FOOTSTONE_CHECK(buffer_address);
      auto capacity = j_env->GetDirectBufferCapacity(j_buffer);
      if (capacity >= 0) {
        content = std::string(buffer_address, footstone::checked_numeric_cast<jlong, size_t>(capacity));
      }
    }
  } else {
    FOOTSTONE_UNREACHABLE();
  }
  return content;
}

void ResourceHolder::SetContent(JNIEnv* j_env, byte_string content) {
  FOOTSTONE_DCHECK(j_holder_);
  bool is_direct_buffer = content.length() >= std::numeric_limits<uint32_t>::max();;
  if (is_direct_buffer) {
    auto j_buffer = j_env->NewDirectByteBuffer(const_cast<void*>(reinterpret_cast<const void*>(content.c_str())),
                                               footstone::check::checked_numeric_cast<size_t, jsize>(content.length()));
    j_env->SetObjectField(j_holder_, j_holder_buffer_field_id, j_buffer);
    j_env->SetObjectField(j_holder_, j_holder_transfer_type_field_id, j_transfer_type_nio_value);
    j_env->DeleteLocalRef(j_buffer);
  } else {
    auto len = footstone::check::checked_numeric_cast<size_t, jsize>(content.length());
    auto j_bytes = j_env->NewByteArray(len);
    j_env->SetByteArrayRegion(
        reinterpret_cast<jbyteArray>(j_bytes), 0, len,
        reinterpret_cast<const jbyte*>(content.c_str()));
    j_env->SetObjectField(j_holder_, j_holder_bytes_field_id, j_bytes);
    j_env->SetObjectField(j_holder_, j_holder_transfer_type_field_id, j_transfer_type_normal_value);
    j_env->DeleteLocalRef(j_bytes);
  }
}

void ResourceHolder::FetchComplete(JNIEnv* j_env, jobject obj) {
  FOOTSTONE_DCHECK(j_holder_);
  j_env->CallVoidMethod(obj, j_interface_cb_method_id, j_holder_);
}
}
}  // namespace hippy
