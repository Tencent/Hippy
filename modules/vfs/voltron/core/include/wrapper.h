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

#pragma once

#include <any>

#include "common_header.h"
#include "encodable_value.h"
#include "footstone/persistent_object_map.h"
#include "vfs/uri_loader.h"

namespace voltron {

extern std::atomic<uint32_t> global_data_holder_key;
extern footstone::utils::PersistentObjectMap<uint32_t, std::any> global_data_holder;

constexpr char kCallFromKey[] = "from";
constexpr char kCallFromDart[] = "call_from_dart";

using InvokeDartCallback = std::function<void(hippy::UriHandler::RetCode,
                                              std::unordered_map<std::string, std::string>,
                                              std::string)>;

enum class FetchResultCode {
  OK,
  ERR_OPEN_LOCAL_FILE,
  ERR_SUPPORT_SYNC_REMOTE,
  ERR_UNKNOWN_SCHEME,
  ERR_REMOTE_REQUEST_FAILED,
  ERR_FFI,
  ERR_ENCODE_PARAMS,
  ERR_INVALID_RESULT
};

constexpr char kFileSchema[] = "file";
constexpr char kUriKey[] = "url";
constexpr char kBufferKey[] = "buffer";
constexpr char kReqHeadersKey[] = "req_headers";
constexpr char kRspHeadersKey[] = "rsp_headers";
constexpr char kResultCodeKey[] = "result_code";
constexpr char kVfsFileRunnerName[] = "vfs_file";

class VfsWrapper {
 public:
  static std::shared_ptr<VfsWrapper> GetWrapper(uint32_t id);
  static std::unordered_map<std::string,
                            std::string> ParseHeaders(voltron::EncodableMap *meta_map, const char* header_key);
  static EncodableMap UnorderedMapToEncodableMap(const std::unordered_map<std::string, std::string>& map);
  static hippy::UriLoader::RetCode ParseResultCode(int32_t code);
  static std::unique_ptr<EncodableValue> DecodeBytes(const uint8_t *source_bytes, size_t length);
  static std::unique_ptr<std::vector<uint8_t>> EncodeValue(const EncodableValue &value);

  VfsWrapper();
  virtual ~VfsWrapper();

  void InvokeNative(EncodableMap *req_map,
                    int32_t callback_id);

  void InvokeDart(const footstone::string_view& uri,
                  const std::unordered_map<std::string, std::string> &req_meta,
                  const InvokeDartCallback& cb);

  void OnInvokeDartCallback(
      uint32_t request_id,
      EncodableMap *rsp_map);

  uint32_t GetId() const;
  std::shared_ptr<hippy::UriLoader> GetLoader();
 private:
  std::shared_ptr<hippy::UriLoader> loader_;
  uint32_t id_{};
  footstone::PersistentObjectMap<uint32_t, InvokeDartCallback> callback_map_;
  std::atomic<uint32_t> request_id_ = 1;
};

}

#ifdef __cplusplus
extern "C" {
#endif

enum VfsFFIRegisterFuncType {
  kInvokeDart,
};

typedef void(*invoke_dart)(uint32_t wrapper_id,
                           uint32_t request_id,
                           const char16_t *uri,
                           const void *rsp_meta,
                           int32_t len);

extern invoke_dart invoke_dart_func;

EXTERN_C int32_t RegisterVoltronVfsCallFunc(int32_t type, void *func);

EXTERN_C int32_t CreateVfsWrapper();

EXTERN_C void DestroyVfsWrapper(uint32_t id);

EXTERN_C void OnDartInvoke(uint32_t id,
                           const uint8_t *req_meta_data,
                           int32_t req_meta_data_length,
                           int32_t
                                callback_id);

EXTERN_C void OnInvokeDartCallback(uint32_t id,
                                   uint32_t request_id,
                                   const uint8_t *rsp_meta_data,
                                   int32_t rsp_meta_data_length);

#ifdef __cplusplus
}
#endif
