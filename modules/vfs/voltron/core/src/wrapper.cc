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
#include "footstone/string_view_utils.h"
#include "ffi_define.h"
#include "handler/file_handler.h"
#include "handler/ffi_delegate_handler.h"
#include "standard_message_codec.h"
#include "callback_manager.h"
#include "data_holder.h"

namespace voltron {

std::unique_ptr<EncodableValue> VfsWrapper::DecodeBytes(const uint8_t *source_bytes, size_t length) {
  return StandardMessageCodec::GetInstance().DecodeMessage(source_bytes, length);
}

std::unique_ptr<std::vector<uint8_t>> VfsWrapper::EncodeValue(const EncodableValue &value) {
  return StandardMessageCodec::GetInstance().EncodeMessage(value);
}

std::unordered_map<std::string,
                   std::string> VfsWrapper::ParseHeaders(voltron::EncodableMap *meta_map, const char* header_key) {
  auto size = meta_map->size();
  if (!size) {
    return {};
  }
  auto d_headers_iter = meta_map->find(voltron::EncodableValue(header_key));
  if (d_headers_iter != meta_map->end()) {
    auto d_headers = std::get<voltron::EncodableMap>(d_headers_iter->second);
    auto headers_length = d_headers.size();
    if (!headers_length) {
      return {};
    }

    std::unordered_map<std::string, std::string> ret_map;
    auto headers_iter = d_headers.begin();
    while (headers_iter != d_headers.end()) {
      auto key = std::get<std::string>(headers_iter->first);
      auto value = std::get<std::string>(headers_iter->second);
      ret_map[key] = value;
      headers_iter++;
    }
    return ret_map;
  } else {
    return {};
  }
}

EncodableMap VfsWrapper::UnorderedMapToEncodableMap(const std::unordered_map<std::string,
                                                                             std::string> &map) {
  auto encodable_map = EncodableMap();
  for (const auto &p: map) {
    auto encodable_key = EncodableValue(p.first);
    auto encodable_value = EncodableValue(p.second);
    encodable_map[encodable_key] = encodable_value;
  }
  return encodable_map;
}

hippy::UriLoader::RetCode VfsWrapper::ParseResultCode(int32_t code) {
  switch (static_cast<int>(code)) {
    case static_cast<int>(FetchResultCode::OK): {
      return hippy::UriHandler::RetCode::Success;
    }
    case static_cast<int>(FetchResultCode::ERR_UNKNOWN_SCHEME): {
      return hippy::UriHandler::RetCode::SchemeError;
    }
    default: {
      return hippy::UriHandler::RetCode::Failed;
    }
  }
}

VfsWrapper::VfsWrapper() {
  id_ = voltron::GenId();
  auto delegate = std::make_shared<voltron::FfiDelegateHandler>(id_);
  loader_ = std::make_shared<hippy::UriLoader>();
  auto file_delegate = std::make_shared<voltron::FileHandler>();
  loader_->RegisterUriHandler(voltron::kFileSchema, file_delegate);
  loader_->PushDefaultHandler(delegate);
}

VfsWrapper::~VfsWrapper() {
  loader_ = nullptr;
  callback_map_.Clear();
}

uint32_t VfsWrapper::GetId() const {
  return id_;
}

std::shared_ptr<hippy::UriLoader> VfsWrapper::GetLoader() {
  return loader_;
}

std::shared_ptr<VfsWrapper> VfsWrapper::GetWrapper(uint32_t id) {
  return voltron::FindObject<std::shared_ptr<VfsWrapper>>(id);
}

void VfsWrapper::InvokeNative(EncodableMap *req_map,
                              int32_t callback_id) {
  auto d_uri_iter = req_map->find(voltron::EncodableValue(voltron::kUriKey));
  if (d_uri_iter != req_map->end()) {
    auto d_uri = std::get<std::string>(d_uri_iter->second);
    auto req_meta = ParseHeaders(req_map, kReqHeadersKey);
    req_meta[voltron::kCallFromKey] = voltron::kCallFromDart;

    auto cb = [callback_id](
        hippy::UriLoader::RetCode ret_code,
        const std::unordered_map<std::string, std::string> &rsp_meta,
        const hippy::UriLoader::bytes &content) {
      auto result_map = voltron::EncodableMap();
      result_map[voltron::EncodableValue(voltron::kRspHeadersKey)] =
          voltron::EncodableValue(UnorderedMapToEncodableMap(rsp_meta));
      std::vector<uint8_t> buffer(content.begin(), content.end());
      result_map[voltron::EncodableValue(voltron::kBufferKey)] = voltron::EncodableValue(buffer);
      result_map[voltron::EncodableValue(voltron::kResultCodeKey)] =
          voltron::EncodableValue(static_cast<int32_t>(ret_code));
      CallGlobalCallbackWithValue(callback_id, voltron::EncodableValue(result_map));
    };
    loader_->RequestUntrustedContent(footstone::string_view::new_from_utf8(d_uri.c_str()),
                                     req_meta,
                                     cb);
  }
}

void VfsWrapper::OnInvokeDartCallback(uint32_t request_id, EncodableMap *rsp_map) {
  InvokeDartCallback callback;
  auto flag = callback_map_.Find(request_id, callback);
  if (flag) {
    auto result_code = hippy::UriLoader::RetCode::Failed;
    auto result_code_iter = rsp_map->find(EncodableValue(kResultCodeKey));
    if (result_code_iter != rsp_map->end()) {
      result_code = ParseResultCode(std::get<int32_t>(result_code_iter->second));
    }

    if (result_code == hippy::UriLoader::RetCode::Success) {
      auto rsp_meta = ParseHeaders(rsp_map, kRspHeadersKey);
      auto buffer_iter = rsp_map->find(EncodableValue(kBufferKey));
      if (buffer_iter != rsp_map->end()) {
        auto buffer = std::get<std::vector<uint8_t>>(buffer_iter->second);
        char* buffer_address = reinterpret_cast<char*>(buffer.data());
        auto content = std::string(buffer_address, buffer.size());
        callback(result_code, rsp_meta, content);
      } else {
        FOOTSTONE_UNREACHABLE();
      }
    } else {
      callback(result_code, {}, hippy::UriHandler::bytes());
    }
  } else {
    FOOTSTONE_UNREACHABLE();
  }
}

void VfsWrapper::InvokeDart(const footstone::string_view& uri,
                            const std::unordered_map<std::string, std::string> &req_meta,
                            const InvokeDartCallback& cb) {
  auto request_id = request_id_.fetch_add(1);
  auto vfs_id = id_;
  callback_map_.Insert(request_id, cb);
  FOOTSTONE_DLOG(INFO) << "start invoke dart";
  auto work = [vfs_id, uri, req_meta, request_id]() {
    FOOTSTONE_DLOG(INFO) << "invoke dart inner";
    auto uri_16 = footstone::StringViewUtils::CovertToUtf16(uri, uri.encoding()).utf16_value();
    auto req_meta_data = EncodeValue(EncodableValue(UnorderedMapToEncodableMap(req_meta)));
    invoke_dart_func(vfs_id,
                     request_id,
                     uri_16.c_str(),
                     req_meta_data->data(),
                     footstone::checked_numeric_cast<size_t, int32_t>(req_meta_data->size()));
    FOOTSTONE_DLOG(INFO) << "invoke dart end";
  };
  const Work *work_ptr = new Work(work);
  PostWorkToDart(work_ptr);
}

}

#ifdef __cplusplus
extern "C" {
#endif

extern invoke_dart invoke_dart_func = nullptr;

EXTERN_C int32_t RegisterVoltronVfsCallFunc(int32_t type, void *func) {
  FOOTSTONE_DLOG(INFO) << "start register vfs func, type " << type;
  if (type == VfsFFIRegisterFuncType::kInvokeDart) {
    invoke_dart_func = reinterpret_cast<invoke_dart>(func);
    return true;
  }
  FOOTSTONE_DLOG(ERROR) << "register func error, unknown type " << type;
  return false;
}

EXTERN_C int32_t CreateVfsWrapper() {
  auto wrapper = std::make_shared<voltron::VfsWrapper>();
  voltron::InsertObject(wrapper->GetId(), wrapper);
  return footstone::checked_numeric_cast<uint32_t, int32_t>(wrapper->GetId());
}

EXTERN_C void DestroyVfsWrapper(uint32_t id) {
  bool flag = voltron::EraseObject(id);
  FOOTSTONE_DCHECK(flag);
}

EXTERN_C void OnDartInvoke(uint32_t id,
                           const uint8_t *req_meta_data,
                           int32_t req_meta_data_length,
                           int32_t callback_id) {
  auto wrapper = voltron::VfsWrapper::GetWrapper(id);
  auto params_value_ptr = voltron::VfsWrapper::DecodeBytes(req_meta_data,
                                               footstone::checked_numeric_cast<int32_t, size_t>(
                                                   req_meta_data_length));
  auto holder_map = std::get_if<voltron::EncodableMap>(params_value_ptr.get());
  if (holder_map && wrapper) {
    wrapper->InvokeNative(holder_map, callback_id);
  }
}

EXTERN_C void OnInvokeDartCallback(uint32_t id,
                                   uint32_t request_id,
                                   const uint8_t *rsp_meta_data,
                                   int32_t rsp_meta_data_length) {
  auto wrapper = voltron::VfsWrapper::GetWrapper(id);
  auto rsp_ptr = voltron::VfsWrapper::DecodeBytes(rsp_meta_data,
                                      footstone::checked_numeric_cast<int32_t, size_t>(
                                          rsp_meta_data_length));
  auto rsp_map = std::get_if<voltron::EncodableMap>(rsp_ptr.get());
  if (rsp_map && wrapper) {
    wrapper->OnInvokeDartCallback(request_id, rsp_map);
  }
}

#ifdef __cplusplus
}
#endif
