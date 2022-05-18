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
#include "devtools_base/transform_string_util.h"

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
constexpr char kHttpResponseTiming[] = "timing";
constexpr char kHttpResponseServiceWorkerResponseSource[] = "serviceWorkerResponseSource";
constexpr char kHttpResponseResponseTime[] = "responseTime";
constexpr char kHttpResponseCacheStorageCacheName[] = "cacheStorageCacheName";
constexpr char kHttpResponseProtocol[] = "protocol";
constexpr char kHttpResponseSecurityState[] = "securityState";

namespace hippy::devtools {
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
  result +=
      TransformStringUtil::ReplaceUnderLine(TransformStringUtil::ToLower(ServiceWorkerResponseSourceToString(source)));
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
  result += TransformStringUtil::ReplaceUnderLine(TransformStringUtil::ToLower(SecurityStateToString(security_state)));
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
}  // namespace hippy::devtools
