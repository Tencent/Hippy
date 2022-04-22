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

constexpr const char* kHttpResponseRequestId = "requestId";
constexpr const char* kHttpResponseLoaderId = "loaderId";
constexpr const char* kHttpResponseTimestamp = "timestamp";
constexpr const char* kHttpResponseType = "type";
constexpr const char* kHttpResponseResponse = "response";
constexpr const char* kHttpResponseHasExtraInfo = "hasExtraInfo";
constexpr const char* kHttpResponseFrameId = "frameId";
constexpr const char* kHttpResponseUrl = "url";
constexpr const char* kHttpResponseStatus = "status";
constexpr const char* kHttpResponseStatusText = "statusText";
constexpr const char* kHttpResponseHeaders = "headers";
constexpr const char* kHttpResponseMimeType = "mimeType";
constexpr const char* kHttpResponseRequestHeaders = "requestHeaders";
constexpr const char* kHttpResponseConnectionReused = "connectionReused";
constexpr const char* kHttpResponseConnectionId = "connectionId";
constexpr const char* kHttpResponseRemoteIPAddress = "remoteIPAddress";
constexpr const char* kHttpResponseRemotePort = "remotePort";
constexpr const char* kHttpResponseFromDiskCache = "fromDiskCache";
constexpr const char* kHttpResponseFromServiceWorker = "fromServiceWorker";
constexpr const char* kHttpResponseFromPrefetchCache = "fromPrefetchCache";
constexpr const char* kHttpResponseEncodedDataLength = "encodedDataLength";
constexpr const char* kHttpResponseTiming = "timing";
constexpr const char* kHttpResponseServiceWorkerResponseSource = "serviceWorkerResponseSource";
constexpr const char* kHttpResponseResponseTime = "responseTime";
constexpr const char* kHttpResponseCacheStorageCacheName = "cacheStorageCacheName";
constexpr const char* kHttpResponseProtocol = "protocol";
constexpr const char* kHttpResponseSecurityState = "securityState";

namespace tdf {
namespace devtools {
std::string Response::Serialize() const {
  std::string result = "{\"";
  result += kHttpResponseUrl;
  result += "\":\"";
  result += url;
  result += "\",\"";
  result += kHttpResponseStatus;
  result += "\":";
  result += std::to_string(status);
  result += ",\"";
  result += kHttpResponseStatusText;
  result += "\":\"";
  result += status_text;
  result += "\",\"";
  result += kHttpResponseHeaders;
  result += "\":";
  result += headers;
  result += ",\"";
  result += kHttpResponseConnectionReused;
  result += "\":";
  result += connection_reused ? "true" : "false";
  result += ",\"";
  result += kHttpResponseMimeType;
  result += "\":\"";
  result += mime_type;
  result += "\",\"";
  result += kHttpResponseRequestHeaders;
  result += "\":";
  result += request_headers;
  result += ",\"";
  result += kHttpResponseConnectionId;
  result += "\":";
  result += std::to_string(connection_id);
  result += ",\"";
  result += kHttpResponseRemoteIPAddress;
  result += "\":\"";
  result += remote_ip_address;
  result += "\",\"";
  result += kHttpResponseRemotePort;
  result += "\":";
  result += std::to_string(remote_port);
  result += ",\"";
  result += kHttpResponseServiceWorkerResponseSource;
  result += "\":\"";
  result += NetworkEnumUtils::ServiceWorkerResponseSourceToString(source);
  result += "\",\"";
  result += kHttpResponseCacheStorageCacheName;
  result += "\":\"";
  result += cache_storage_cache_name;
  result += "\",\"";
  result += kHttpResponseFromDiskCache;
  result += "\":";
  result += from_disk_cache ? "true" : "false";
  result += ",\"";
  result += kHttpResponseFromServiceWorker;
  result += "\":";
  result += from_service_worker ? "true" : "false";
  result += ",\"";
  result += kHttpResponseFromPrefetchCache;
  result += "\":";
  result += from_prefetch_cache ? "true" : "false";
  result += ",\"";
  result += kHttpResponseEncodedDataLength;
  result += "\":";
  result += std::to_string(encoded_data_length);
  result += ",\"";
  result += kHttpResponseResponseTime;
  result += "\":";
  result += std::to_string(response_time);
  result += ",\"";
  result += kHttpResponseProtocol;
  result += "\":\"";
  result += protocol;
  result += "\",\"";
  result += kHttpResponseSecurityState;
  result += "\":\"";
  result += NetworkEnumUtils::SecurityStateToString(security_state);
  result += "\"}";
  return result;
}

std::string DevtoolsHttpResponse::Serialize() const {
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
  result += std::to_string(timestamp_);
  result += ",\"";
  result += kHttpResponseType;
  result += "\":\"";
  result += NetworkEnumUtils::ResourceTypeToString(type_);
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
}  // namespace devtools
}  // namespace tdf
