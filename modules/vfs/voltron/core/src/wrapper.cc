/*
 *
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
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#include "wrapper.h"

#include "vfs/uri_loader.h"
#include "footstone/check.h"
#include "handler/file_handler.h"
#include "handler/ffi_delegate_handler.h"
#include "standard_message_codec.h"

namespace voltron {

constexpr char kFileSchema[] = "file";
constexpr char kUriKey[] = "url";
//constexpr char kBufferKey[] = "buffer";
constexpr char kReqHeadersKey[] = "req_headers";
//constexpr char kRspHeadersKey[] = "rsp_headers";
//constexpr char kTransTypeKey[] = "trans_type";
//constexpr char kCallFromKey[] = "from";
//constexpr char kResultCodeKey[] = "result_code";
//constexpr char kErrorMsgKey[] = "err_msg";
//constexpr char kCallFromDart[] = "call_from_dart";

std::atomic<uint32_t> global_data_holder_key{1};
footstone::utils::PersistentObjectMap<uint32_t, std::any> global_data_holder;

std::shared_ptr<hippy::UriLoader> GetUriLoader(int32_t id) {
  std::any loader_object;
  bool flag = global_data_holder.Find(
      footstone::checked_numeric_cast<int32_t, uint32_t>(id),
      loader_object);
  FOOTSTONE_CHECK(flag);
  return std::any_cast<std::shared_ptr<hippy::UriLoader>>(loader_object);
}

std::unique_ptr<EncodableValue> DecodeBytes(const uint8_t* source_bytes, size_t length) {
  return StandardMessageCodec::GetInstance().DecodeMessage(source_bytes, length);
}
std::unique_ptr<std::vector<uint8_t>> EncodeMessage(const EncodableValue& message) {
  return StandardMessageCodec::GetInstance().EncodeMessage(message);
}

std::unordered_map<std::string, std::string> ParseReqHeaders(voltron::EncodableMap* holder_map) {
  if (!holder_map) {
    return {};
  }
  auto size = holder_map->size();
  if (!size) {
    return {};
  }
  auto d_req_headers_iter = holder_map->find(voltron::EncodableValue(voltron::kReqHeadersKey));
  if (d_req_headers_iter != holder_map->end()) {
    auto d_req_headers = std::get<voltron::EncodableMap>(d_req_headers_iter->second);
    auto headers_length = d_req_headers.size();
    if (!headers_length) {
      return {};
    }

    std::unordered_map<std::string, std::string> ret_map;
    auto headers_iter = d_req_headers.begin();
    while (headers_iter != d_req_headers.end()) {
      auto key = std::get<std::string>(headers_iter->first);
      auto value = std::get<std::string>(headers_iter->second);
      ret_map[key] = value;
    }
    return ret_map;
  } else {
    return {};
  }
}


}

#ifdef __cplusplus
extern "C" {
#endif

EXTERN_C int32_t CreateVfsWrapper() {
  auto delegate = std::make_shared<voltron::FfiDelegateHandler>();
  auto id = voltron::global_data_holder_key.fetch_add(1);
  auto loader = std::make_shared<hippy::UriLoader>();
  auto file_delegate = std::make_shared<voltron::FileHandler>();
  loader->RegisterUriHandler(voltron::kFileSchema, file_delegate);
  loader->SetDefaultHandler(delegate);

  voltron::global_data_holder.Insert(id, loader);
  return footstone::checked_numeric_cast<uint32_t, int32_t>(id);
}

EXTERN_C void DestroyVfsWrapper(int32_t id) {
  auto id_ = footstone::checked_numeric_cast<int32_t , uint32_t>(id);
  bool flag = voltron::global_data_holder.Erase(id_);
  FOOTSTONE_DCHECK(flag);
}

EXTERN_C void OnDartInvokeAsync(int32_t id,
                                const uint8_t *params,
                                int32_t params_len,
                                int32_t callback_id) {
  auto loader = voltron::GetUriLoader(id);
  auto params_value_ptr = voltron::DecodeBytes(params, footstone::checked_numeric_cast<int32_t , size_t>(params_len));
  auto holder_map = std::get_if<voltron::EncodableMap>(params_value_ptr.get());
  if (holder_map && loader) {
    auto d_uri_iter = holder_map->find(voltron::EncodableValue(voltron::kUriKey));
    if (d_uri_iter != holder_map->end()) {
//      auto d_uri = std::get<std::string>(d_uri_iter->second);
//      auto req_meta = voltron::ParseReqHeaders(holder_map);
//      req_meta[voltron::kCallFromKey] = voltron::kCallFromDart;

//      auto cb = [callback_id, d_uri](
//          hippy::UriLoader::RetCode, const std::unordered_map<std::string, std::string>& rsp_meta, const hippy::UriLoader::bytes& content) {
//        auto j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
//        auto j_rsp_meta = UnorderedMapToJavaMap(j_env, rsp_meta);
//        auto j_holder = j_env->NewObject(j_resource_data_holder_clazz, j_resource_data_holder_init_method_id,
//                                         j_uri, j_rsp_meta, j_request_from_native_value);
//        bool is_direct_buffer = content.length() >= std::numeric_limits<uint32_t>::max();
//        if (is_direct_buffer) {
//          auto j_buffer = j_env->NewDirectByteBuffer(const_cast<void*>(reinterpret_cast<const void*>(content.c_str())),
//                                                     footstone::check::checked_numeric_cast<size_t, jsize>(content.length()));
//          j_env->SetObjectField(j_holder, j_holder_buffer_field_id, j_buffer);
//          j_env->SetObjectField(j_holder, j_holder_transfer_type_field_id, j_transfer_type_nio_value);
//        } else {
//          auto len = footstone::check::checked_numeric_cast<size_t, jsize>(content.length());
//          auto j_bytes = j_env->NewByteArray(len);
//          j_env->SetByteArrayRegion(
//              reinterpret_cast<jbyteArray>(j_bytes), 0, len,
//              reinterpret_cast<const jbyte*>(content.c_str()));
//          j_env->SetObjectField(j_holder, j_holder_bytes_field_id, j_bytes);
//          j_env->SetObjectField(j_holder, j_holder_transfer_type_field_id, j_transfer_type_normal_value);
//        }
//        j_env->CallVoidMethod(java_cb->GetObj(), j_interface_cb_method_id, j_holder);
//        JNIEnvironment::ClearJEnvException(j_env);
//      };
//      loader->RequestUntrustedContent(uri, req_meta, cb);
    }
  }
}

#ifdef __cplusplus
}
#endif
