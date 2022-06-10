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
#include <vector>
#include "api/adapter/data/serializable.h"
#include "api/notification/data/devtools_network_enum.h"

namespace hippy::devtools {
/**
 * Information about the request initiator.
 * @see https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-Initiator
 */
struct Initiator : public Serializable {
  std::string Serialize() const;
  /**
   * Type of this initiator. Allowed Values: parser, script, preload, SignedExchange, preflight, other
   */
  std::string type = "other";
  std::string url;
  uint32_t line_number;
  uint32_t column_number;
  /**
   * Set if another request triggered this request (e.g. preflight).
   */
  std::string request_id;
};

/**
 * Determines what type of Trust Token operation is executed and depending on the type, some additional parameters. The
 * values are specified in third_party/blink/renderer/core/fetch/trust_token.idl.
 * @see https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-TrustTokenParams
 */
struct TrustTokenParams : public Serializable {
  std::string Serialize() const override;
  std::string type;
  std::string refresh_policy;
  std::vector<std::string> issuers;
};

/**
 * HTTP request data.
 * @see https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-Request
 */
struct Request : public Serializable {
  std::string Serialize() const override;
  std::string url;
  std::string url_fragment;
  std::string method;
  /**
   * headers as keys / values of JSON object.
   */
  std::string headers;
  std::string post_data;
  bool has_post_data;
  std::vector<std::string> post_data_entries;
  SecurityMixedContentType mixed_content_type = SecurityMixedContentType::kNone;
  ResourcePriority initial_priority = ResourcePriority::kVeryHigh;
  bool is_link_preload;
  TrustTokenParams trust_token_params;
  /**
   * The referrer policy of the request, as defined in https://www.w3.org/TR/referrer-policy/ Allowed Values:
   * unsafe-url, no-referrer-when-downgrade, no-referrer, origin, origin-when-cross-origin, same-origin, strict-origin,
   * strict-origin-when-cross-origin
   */
  std::string referrer_policy;
  bool is_same_site;
};

/**
 * Fired when page is about to send HTTP request.
 */
class DevtoolsHttpRequest : public Serializable {
 public:
  DevtoolsHttpRequest(std::string request_id, Request&& request)
      : request_id_(request_id),
        request_(std::move(request)),
        loader_id_(request_id),
        timestamp_(static_cast<uint64_t>(std::time(nullptr))),
        wall_time_(static_cast<uint64_t>(std::time(nullptr))),
        initiator_({}),
        redirect_has_extra_info_(false),
        type_(ResourceType::kFetch),
        frame_id_(request.url),
        has_user_gesture_(false) {}
  inline void SetDocumentUrl(std::string document_url) { document_url_ = document_url; }
  inline void SetTimestamp(uint64_t timestamp) { timestamp_ = timestamp; }
  inline void SetWallTime(uint64_t wall_time) { wall_time_ = wall_time; }
  inline void SetInitiator(Initiator initiator) { initiator_ = initiator; }
  inline void SetRedirectHasExtraInfo(bool redirect_has_extra_info) {
    redirect_has_extra_info_ = redirect_has_extra_info;
  }
  inline void SetResourceType(ResourceType type) { type_ = type; }
  inline void SetFrameId(std::string frame_id) { frame_id_ = frame_id; }
  inline void SetHasUserGesture(bool has_user_gesture) { has_user_gesture_ = has_user_gesture; }
  explicit DevtoolsHttpRequest(std::string content) : content_(std::move(content)) {}
  std::string Serialize() const override;

 private:
  std::string content_;
  std::string request_id_;
  Request request_;
  std::string loader_id_;
  std::string document_url_;
  uint64_t timestamp_;
  uint64_t wall_time_;
  Initiator initiator_;
  bool redirect_has_extra_info_;
  ResourceType type_;
  std::string frame_id_;
  bool has_user_gesture_;
};
}  // namespace hippy::devtools
