/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
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

#include "api/notification/data/devtools_http_response.h"
#include "module/util/transform_string_util.h"

constexpr char kHttpResponseRequestId[] = "requestId";
constexpr char kHttpResponseLoaderId[] = "loaderId";
constexpr char kHttpResponseTimestamp[] = "timestamp";
constexpr char kHttpResponseType[] = "type";
constexpr char kHttpResponseResponse[] = "response";
constexpr char kHttpResponseHasExtraInfo[] = "hasExtraInfo";
constexpr char kHttpResponseFrameId[] = "frameId";
constexpr char kHttpResponseUrl[] = "url";
constexpr char kHttpResponseStatus[] = "status";
constexpr char kHttpResponseStatusText[] = "statusText";
constexpr char kHttpResponseHeaders[] = "headers";
constexpr char kHttpResponseMimeType[] = "mimeType";
constexpr char kHttpResponseRequestHeaders[] = "requestHeaders";
constexpr char kHttpResponseConnectionReused[] = "connectionReused";
constexpr char kHttpResponseConnectionId[] = "connectionId";
constexpr char kHttpResponseRemoteIPAddress[] = "remoteIPAddress";
constexpr char kHttpResponseRemotePort[] = "remotePort";
constexpr char kHttpResponseFromDiskCache[] = "fromDiskCache";
constexpr char kHttpResponseFromServiceWorker[] = "fromServiceWorker";
constexpr char kHttpResponseFromPrefetchCache[] = "fromPrefetchCache";
constexpr char kHttpResponseEncodedDataLength[] = "encodedDataLength";
constexpr char kHttpResponseServiceWorkerResponseSource[] = "serviceWorkerResponseSource";
constexpr char kHttpResponseResponseTime[] = "responseTime";
constexpr char kHttpResponseCacheStorageCacheName[] = "cacheStorageCacheName";
constexpr char kHttpResponseProtocol[] = "protocol";
constexpr char kHttpResponseSecurityState[] = "securityState";

constexpr char kRspMetaStatusCode[] = "statusCode";
constexpr char kRspMetaContentType[] = "content-type";
constexpr char kMimeTypeBase64Text[] = "text";
constexpr char kMimeTypeBase64Json[] = "application/json";

namespace hippy::devtools {
Response::Response(int32_t code, uint64_t encoded_data_length,
                   const std::unordered_map<std::string, std::string>& rsp_meta,
                   const std::unordered_map<std::string, std::string>& req_meta)
    : status_(code), encoded_data_length_(encoded_data_length) {
  headers_ = "{";
  auto has_header = false;
  for (auto& meta : rsp_meta) {
    if (meta.first == kRspMetaStatusCode) {
      status_ = std::stoi(meta.second);
      continue;
    }
    if (TransformStringUtil::ToLower(meta.first) == kRspMetaContentType) {
      std::size_t pos = meta.second.find_first_of(";");
      if (pos != std::string::npos) {
        mime_type_ = {reinterpret_cast<const char*>(meta.second.c_str()), pos};
      } else {
        mime_type_ = meta.second;
      }
    }
    headers_ += "\"";
    headers_ += meta.first;
    headers_ += "\":\"";
    headers_ += meta.second;
    headers_ += "\",";
    has_header = true;
  }
  if (has_header) {
    headers_ = headers_.substr(0, headers_.length() - 1);  // remove last ","
  }
  headers_ += "}";

  request_headers_ = "{";
  auto has_request_header = false;
  for (auto& meta : req_meta) {
    request_headers_ += "\"";
    request_headers_ += meta.first;
    request_headers_ += "\":\"";
    request_headers_ += meta.second;
    request_headers_ += "\",";
    has_request_header = true;
  }
  if (has_request_header) {
    request_headers_ = request_headers_.substr(0, request_headers_.length() - 1);
  }
  request_headers_ += "}";
}

std::string Response::Serialize() const {
  std::string result = "{\"";
  result += kHttpResponseUrl;
  result += "\":\"";
  result += url_;
  result += "\",\"";
  result += kHttpResponseStatus;
  result += "\":";
  result += std::to_string(status_);
  result += ",\"";
  result += kHttpResponseStatusText;
  result += "\":\"";
  result += status_text_;
  result += "\",\"";
  result += kHttpResponseHeaders;
  result += "\":";
  result += headers_;
  result += ",\"";
  result += kHttpResponseConnectionReused;
  result += "\":";
  result += connection_reused_ ? "true" : "false";
  result += ",\"";
  result += kHttpResponseMimeType;
  result += "\":\"";
  result += mime_type_;
  result += "\",\"";
  result += kHttpResponseRequestHeaders;
  result += "\":";
  result += request_headers_;
  result += ",\"";
  result += kHttpResponseConnectionId;
  result += "\":";
  result += std::to_string(connection_id_);
  result += ",\"";
  result += kHttpResponseRemoteIPAddress;
  result += "\":\"";
  result += remote_ip_address_;
  result += "\",\"";
  result += kHttpResponseRemotePort;
  result += "\":";
  result += std::to_string(remote_port_);
  result += ",\"";
  result += kHttpResponseServiceWorkerResponseSource;
  result += "\":\"";
  result +=
      TransformStringUtil::ReplaceUnderLine(TransformStringUtil::ToLower(ServiceWorkerResponseSourceToString(source_)));
  result += "\",\"";
  result += kHttpResponseCacheStorageCacheName;
  result += "\":\"";
  result += cache_storage_cache_name_;
  result += "\",\"";
  result += kHttpResponseFromDiskCache;
  result += "\":";
  result += from_disk_cache_ ? "true" : "false";
  result += ",\"";
  result += kHttpResponseFromServiceWorker;
  result += "\":";
  result += from_service_worker_ ? "true" : "false";
  result += ",\"";
  result += kHttpResponseFromPrefetchCache;
  result += "\":";
  result += from_prefetch_cache_ ? "true" : "false";
  result += ",\"";
  result += kHttpResponseEncodedDataLength;
  result += "\":";
  result += std::to_string(encoded_data_length_);
  result += ",\"";
  result += kHttpResponseResponseTime;
  result += "\":";
  result += std::to_string(response_time_);
  result += ",\"";
  result += kHttpResponseProtocol;
  result += "\":\"";
  result += protocol_;
  result += "\",\"";
  result += kHttpResponseSecurityState;
  result += "\":\"";
  result += TransformStringUtil::ReplaceUnderLine(TransformStringUtil::ToLower(SecurityStateToString(security_state_)));
  result += "\"}";
  return result;
}

std::string DevtoolsHttpResponse::Serialize() const {
  if (!content_.empty()) {
    return content_;
  }
  std::string result = "{\"";
  result += kHttpResponseRequestId;
  result += "\":\"";
  result += request_id_;
  result += "\",\"";
  result += kHttpResponseLoaderId;
  result += "\":\"";
  result += loader_id_;
  result += "\",\"";
  result += kHttpResponseTimestamp;
  result += "\":";
  result += std::to_string(static_cast<double>(timestamp_) / 1000);
  result += ",\"";
  result += kHttpResponseType;
  result += "\":\"";
  result += ResourceTypeToString(type_);
  result += "\",\"";
  result += kHttpResponseResponse;
  result += "\":";
  result += response_.Serialize();
  result += ",\"";
  result += kHttpResponseHasExtraInfo;
  result += "\":";
  result += has_extra_info_ ? "true" : "false";
  result += ",\"";
  result += kHttpResponseFrameId;
  result += "\":\"";
  result += frame_id_;
  result += "\"}";
  return result;
}

bool DevtoolsHttpResponse::IsBodyBase64() const {
  if (response_.mime_type_.empty()) {
    return true;
  }
  std::size_t pos = response_.mime_type_.find(kMimeTypeBase64Text);
  if (pos != std::string::npos) {
    return false;
  }
  pos = response_.mime_type_.find(kMimeTypeBase64Json);
  if (pos != std::string::npos) {
    return false;
  }
  return true;
}
}  // namespace hippy::devtools
