//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2022/2/24.
//

#pragma once

#include <string>
#include <utility>
#include <vector>
#include "api/adapter/data/serializable.h"
#include "api/notification/data/devtools_network_enum.h"

namespace tdf {
namespace devtools {
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
        timestamp_(time(0)),
        wall_time_(time(0)),
        initiator_({}),
        redirect_has_extra_info_(false),
        type_(ResourceType::kFetch),
        frame_id_(request.url),
        has_user_gesture_(false) {}
  void SetDocumentUrl(std::string document_url) { document_url_ = document_url; }
  void SetTimestamp(uint64_t timestamp) { timestamp_ = timestamp; }
  void SetWallTime(uint64_t wall_time) { wall_time_ = wall_time; }
  void SetInitiator(Initiator initiator) { initiator_ = initiator; }
  void SetRedirectHasExtraInfo(bool redirect_has_extra_info) { redirect_has_extra_info_ = redirect_has_extra_info; }
  void SetResourceType(ResourceType type) { type_ = type; }
  void SetFrameId(std::string frame_id) { frame_id_ = frame_id; }
  void SetHasUserGesture(bool has_user_gesture) { has_user_gesture_ = has_user_gesture; }
  std::string Serialize() const override;

 private:
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
}  // namespace devtools
}  // namespace tdf
