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

#pragma once

#include <ctime>
#include <string>
#include "api/adapter/data/serializable.h"
#include "api/notification/data/devtools_http_request.h"
#include "api/notification/data/devtools_network_enum.h"

namespace hippy::devtools {

/**
 * Timing information for the given request.
 */
struct ResourceTiming {
  uint64_t request_time;
  uint64_t proxy_start;
  uint64_t proxy_end;
  uint64_t dns_start;
  uint64_t dns_end;
  uint64_t connect_start;
  uint64_t connect_end;
  uint64_t ssl_start;
  uint64_t ssl_end;
  uint64_t worker_start;
  uint64_t worker_ready;
  uint64_t worker_fetch_start;
  uint64_t worker_respond_with_settled;
  uint64_t send_start;
  uint64_t send_end;
  uint64_t push_start;
  uint64_t push_end;
  uint64_t receive_headers_end;
};

/**
 * http response data
 * @see https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-Response
 */
struct Response : public Serializable {
  std::string Serialize() const override;
  Response() {}
  explicit Response(int32_t code,
                    uint64_t encoded_data_length,
                    const std::unordered_map<std::string, std::string>& rsp_meta,
                    const std::unordered_map<std::string, std::string>& req_meta);
  std::string url_;
  int32_t status_;
  std::string status_text_;
  /**
   * headers as keys / values of JSON object.
   */
  std::string headers_;
  std::string mime_type_;
  std::string request_headers_;
  bool connection_reused_ = false;
  uint64_t connection_id_{};
  std::string remote_ip_address_;
  uint32_t remote_port_{};
  bool from_disk_cache_ = false;
  bool from_service_worker_ = false;
  bool from_prefetch_cache_ = false;
  uint64_t encoded_data_length_;
  ResourceTiming timing_{};
  ServiceWorkerResponseSource source_ = ServiceWorkerResponseSource::kNetwork;
  /**
   * UTC time in seconds, counted from January 1, 1970.
   */
  uint64_t response_time_ = static_cast<uint64_t>(std::chrono::time_point_cast<std::chrono::milliseconds>(
      std::chrono::system_clock::now()).time_since_epoch().count());
  std::string cache_storage_cache_name_;
  std::string protocol_;
  SecurityState security_state_ = SecurityState::kSecure;
};

/**
 * Fired when HTTP response is available.
 */
class DevtoolsHttpResponse : public Serializable {
 public:
  DevtoolsHttpResponse(std::string request_id, Response&& response)
      : request_id_(request_id),
        loader_id_(request_id),
        timestamp_(static_cast<uint64_t>(std::chrono::time_point_cast<std::chrono::milliseconds>(
            std::chrono::system_clock::now()).time_since_epoch().count())),
        type_(ResourceType::kFetch),
        response_(std::move(response)),
        has_extra_info_(false),
        frame_id_(response.url_) {}
  DevtoolsHttpResponse() {}
  explicit DevtoolsHttpResponse(std::string content) : content_(std::move(content)) {}
  inline void SetTimestamp(uint64_t timestamp) { timestamp_ = timestamp; }
  inline void SetHasExtraInfo(bool has_extra_info) { has_extra_info_ = has_extra_info; }
  inline void SetResourceType(ResourceType type) { type_ = type; }
  inline void SetFrameId(std::string frame_id) { frame_id_ = frame_id; }
  inline void SetBodyData(std::string&& body_data) { body_data_ = std::move(body_data); }
  inline std::string GetBodyData() const { return body_data_; }
  bool IsBodyBase64() const;
  std::string Serialize() const override;

 private:
  std::string body_data_;
  std::string content_;
  std::string request_id_;
  std::string loader_id_;
  uint64_t timestamp_;
  ResourceType type_;
  Response response_;
  bool has_extra_info_;
  std::string frame_id_;
};

}  // namespace hippy::devtools
