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

#include "api/notification/data/devtools_http_request.h"

constexpr const char* kHttpRequestRequestId = "requestId";
constexpr const char* kHttpRequestLoaderId = "loaderId";
constexpr const char* kHttpRequestDocumentUrl = "documentURL";
constexpr const char* kHttpRequestTAG = "request";
constexpr const char* kHttpRequestTimestamp = "timestamp";
constexpr const char* kHttpRequestWallTime = "wallTime";
constexpr const char* kHttpRequestInitiator = "initiator";
constexpr const char* kHttpRequestRedirectHasExtraInfo = "redirectHasExtraInfo";
constexpr const char* kHttpRequestFrameId = "frameId";
constexpr const char* kHttpRequestHasUserGesture = "hasUserGesture";
constexpr const char* kHttpRequestUrl = "url";
constexpr const char* kHttpRequestUrlFragment = "urlFragment";
constexpr const char* kHttpRequestMethod = "method";
constexpr const char* kHttpRequestHeaders = "headers";
constexpr const char* kHttpRequestHasPostData = "hasPostData";
constexpr const char* kHttpRequestPostData = "postData";
constexpr const char* kHttpRequestPostDataEntries = "postDataEntries";
constexpr const char* kHttpRequestMixedContentType = "mixedContentType";
constexpr const char* kHttpRequestInitialPriority = "initialPriority";
constexpr const char* kHttpRequestReferrerPolicy = "referrerPolicy";
constexpr const char* kHttpRequestIsLinkPreload = "isLinkPreload";
constexpr const char* kHttpRequestTrustTokenParams = "trustTokenParams";
constexpr const char* kHttpRequestIsSameSite = "isSameSite";
constexpr const char* kHttpRequestType = "type";
constexpr const char* kHttpRequestBytes = "bytes";

namespace tdf {
namespace devtools {
std::string Initiator::Serialize() const {
  std::string result = "{\"";
  result += kHttpRequestType;
  result += "\":\"";
  result += type;
  result += "\"";
  result += "}";
  return result;
}

std::string TrustTokenParams::Serialize() const { return ""; }

std::string Request::Serialize() const {
  std::string result = "{\"";
  result += kHttpRequestUrl;
  result += "\":\"";
  result += url;
  result += "\",\"";
  result += kHttpRequestUrlFragment;
  result += "\":\"";
  result += url_fragment;
  result += "\",\"";
  result += kHttpRequestMethod;
  result += "\":\"";
  result += method;
  result += "\",\"";
  result += kHttpRequestHeaders;
  result += "\":";
  result += headers;
  result += ",\"";
  result += kHttpRequestPostData;
  result += "\":\"";
  result += post_data;
  result += "\",\"";
  result += kHttpRequestHasPostData;
  result += "\":";
  result += has_post_data ? "true" : "false";
  result += ",\"";
  result += kHttpRequestPostDataEntries;
  result += "\":[";
  for (auto it = post_data_entries.begin(); it != post_data_entries.end(); ++it) {
    result += "{\"";
    result += kHttpRequestBytes;
    result += "\":\"";
    result += (*it);
    result += "\"}";
    if (it != post_data_entries.end() - 1) {
      result += ",";
    }
  }
  result += "],\"";
  result += kHttpRequestMixedContentType;
  result += "\":\"";
  result += NetworkEnumUtils::SecurityMixedContentTypeToString(mixed_content_type);
  result += "\",\"";
  result += kHttpRequestInitialPriority;
  result += "\":\"";
  result += NetworkEnumUtils::ResourcePriorityToString(initial_priority);
  result += "\",\"";
  result += kHttpRequestReferrerPolicy;
  result += "\":\"";
  result += referrer_policy;
  result += "\",\"";
  result += kHttpRequestIsLinkPreload;
  result += "\":";
  result += is_link_preload ? "true" : "false";
  result += ",\"";
  result += kHttpRequestIsSameSite;
  result += "\":";
  result += is_same_site ? "true" : "false";
  result += "}";
  return result;
}

std::string DevtoolsHttpRequest::Serialize() const {
  std::string result = "{\"";
  result += kHttpRequestRequestId;
  result += "\":\"";
  result += request_id_;
  result += "\",\"";
  result += kHttpRequestLoaderId;
  result += "\":\"";
  result += loader_id_;
  result += "\",\"";
  result += kHttpRequestDocumentUrl;
  result += "\":\"";
  result += document_url_;
  result += "\",\"";
  result += kHttpRequestTAG;
  result += "\":";
  result += request_.Serialize();
  result += ",\"";
  result += kHttpRequestTimestamp;
  result += "\":";
  result += std::to_string(timestamp_);
  result += ",\"";
  result += kHttpRequestWallTime;
  result += "\":";
  result += std::to_string(wall_time_);
  result += ",\"";
  result += kHttpRequestInitiator;
  result += "\":";
  result += initiator_.Serialize();
  result += ",\"";
  result += kHttpRequestRedirectHasExtraInfo;
  result += "\":";
  result += redirect_has_extra_info_ ? "true" : "false";
  result += ",\"";
  result += kHttpRequestType;
  result += "\":\"";
  result += NetworkEnumUtils::ResourceTypeToString(type_);
  result += "\",\"";
  result += kHttpRequestFrameId;
  result += "\":\"";
  result += frame_id_;
  result += "\",\"";
  result += kHttpRequestHasUserGesture;
  result += "\":";
  result += has_user_gesture_ ? "true" : "false";
  result += "}";
  return result;
}
}  // namespace devtools
}  // namespace tdf
