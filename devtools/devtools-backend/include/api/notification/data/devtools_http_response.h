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
#include <utility>
#include "api/adapter/data/serializable.h"
#include "api/notification/data/devtools_http_request.h"
#include "api/notification/data/devtools_network_enum.h"

namespace hippy {
namespace devtools {

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
  std::string url;
  int32_t status;
  std::string status_text;
  /**
   * headers as keys / values of JSON object.
   */
  std::string headers;
  std::string mime_type;
  std::string request_headers;
  bool connection_reused;
  uint64_t connection_id;
  std::string remote_ip_address;
  uint32_t remote_port;
  bool from_disk_cache;
  bool from_service_worker;
  bool from_prefetch_cache;
  uint32_t encoded_data_length;
  ResourceTiming timing;
  ServiceWorkerResponseSource source;
  /**
   * UTC time in seconds, counted from January 1, 1970.
   */
  uint64_t response_time = static_cast<uint64_t>(std::time(0));
  std::string cache_storage_cache_name;
  std::string protocol;
  SecurityState security_state;
};

/**
 * Fired when HTTP response is available.
 */
class DevtoolsHttpResponse : public Serializable {
 public:
  DevtoolsHttpResponse(std::string request_id, Response&& response)
      : request_id_(request_id),
        loader_id_(request_id),
        timestamp_(0),
        type_(ResourceType::kFetch),
        response_(std::move(response)),
        has_extra_info_(false),
        frame_id_(response.url) {}
  void SetTimestamp(uint64_t timestamp) { timestamp_ = timestamp; }
  void SetHasExtraInfo(bool has_extra_info) { has_extra_info_ = has_extra_info; }
  void SetResourceType(ResourceType type) { type_ = type; }
  void SetFrameId(std::string frame_id) { frame_id_ = frame_id; }
  std::string Serialize() const override;

 private:
  std::string request_id_;
  std::string loader_id_;
  uint64_t timestamp_;
  ResourceType type_;
  Response response_;
  bool has_extra_info_;
  std::string frame_id_;
};

}  // namespace devtools
}  // namespace hippy
