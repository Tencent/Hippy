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

#include "module/domain/css_domain.h"
#include "api/devtools_backend_service.h"
#include "devtools_base/logging.h"
#include "module/domain_register.h"

namespace hippy::devtools {

// rsp json key
constexpr char kCSSStyles[] = "styles";

// default value
constexpr uint32_t kCSSStyleNodeDepth = 1;

CSSDomain::CSSDomain(std::weak_ptr<DomainDispatch> dispatch) : BaseDomain(std::move(dispatch)) {
  css_data_call_back_ = [this](int32_t node_id, const CSSStyleDataCallback& callback) {
    auto elements_request_adapter = GetDataProvider()->elements_request_adapter;
    if (elements_request_adapter) {
      auto response_callback = [callback, provider = GetDataProvider()](const DomainMetas& data) {
        auto model = CSSModel::CreateModelByJSON(nlohmann::json::parse(data.Serialize()));
        model.SetDataProvider(provider);
        if (callback) {
          callback(model);
        }
      };
      elements_request_adapter->GetDomainData(node_id, false, kCSSStyleNodeDepth, response_callback);
    }
  };
}

std::string_view CSSDomain::GetDomainName() { return kFrontendKeyDomainNameCSS; }

void CSSDomain::RegisterMethods() {
  REGISTER_DOMAIN(CSSDomain, GetMatchedStylesForNode, CSSNodeDataRequest);
  REGISTER_DOMAIN(CSSDomain, GetComputedStyleForNode, CSSNodeDataRequest);
  REGISTER_DOMAIN(CSSDomain, GetInlineStylesForNode, CSSNodeDataRequest);
  REGISTER_DOMAIN(CSSDomain, SetStyleTexts, CSSEditStyleTextsRequest);
}

void CSSDomain::GetMatchedStylesForNode(const CSSNodeDataRequest& request) {
  if (!css_data_call_back_) {
    ResponseErrorToFrontend(request.GetId(), kErrorFailCode,
                            "CSSDomain, GetMatchedStyles, css_data_call_back_ is null");
    return;
  }
  if (!request.HasSetNodeId()) {
    ResponseErrorToFrontend(request.GetId(), kErrorParams, "CSSDomain, GetMatchedStyles, params isn't object");
    return;
  }
  css_data_call_back_(request.GetNodeId(), [this, request](CSSModel model) {
    ResponseResultToFrontend(request.GetId(), model.GetMatchedStylesJSON().dump());
  });
}

void CSSDomain::GetComputedStyleForNode(const CSSNodeDataRequest& request) {
  if (!css_data_call_back_) {
    ResponseErrorToFrontend(request.GetId(), kErrorFailCode,
                            "CSSDomain, GetComputedStyle, css_data_call_back_ is null");
    return;
  }
  if (!request.HasSetNodeId()) {
    ResponseErrorToFrontend(request.GetId(), kErrorParams, "CSSDomain, GetComputedStyle, params isn't object");
    return;
  }
  css_data_call_back_(request.GetNodeId(), [this, request](CSSModel model) {
    ResponseResultToFrontend(request.GetId(), model.GetComputedStyleJSON().dump());
  });
}

void CSSDomain::GetInlineStylesForNode(const CSSNodeDataRequest& request) {
  if (!css_data_call_back_) {
    ResponseErrorToFrontend(request.GetId(), kErrorFailCode, "CSSDomain, GetInlineStyles, css_data_call_back_ is null");
    return;
  }
  if (!request.HasSetNodeId()) {
    ResponseErrorToFrontend(request.GetId(), kErrorParams, "CSSDomain, GetInlineStyles, params isn't object");
    return;
  }
  css_data_call_back_(request.GetNodeId(), [this, request](const CSSModel& model) {
    ResponseResultToFrontend(request.GetId(), CSSModel::GetInlineStylesJSON().dump());
  });
}

void CSSDomain::SetStyleTexts(const CSSEditStyleTextsRequest& request) {
  if (!css_data_call_back_) {
    ResponseErrorToFrontend(request.GetId(), kErrorFailCode, "CSSDomain, SetStyleTexts, css_data_call_back_ is null");
    return;
  }
  if (!request.HasSetEdits()) {
    ResponseErrorToFrontend(request.GetId(), kErrorParams, "CSSDomain, SetStyleTexts, params isn't object");
    return;
  }

  auto edits = request.GetEdits();
  auto style_texts = nlohmann::json::array();
  auto request_call_back_count = edits.size();
  // use id not object to record style data
  style_text_map_[request.GetId()] = style_texts;
  request_call_back_count_map_[request.GetId()] = request_call_back_count;

  for (auto& edit : edits.items()) {
    auto edit_value = edit.value();
    auto node_id = edit_value[kFrontendKeyStyleSheetId];
    css_data_call_back_(node_id, [this, request, edit_value](CSSModel model) {
      auto style_texts = style_text_map_[request.GetId()];
      auto request_call_back_count = request_call_back_count_map_[request.GetId()];
      auto style_json = model.GetStyleTextJSON(edit_value);
      if (!style_json.is_null()) {
        style_texts.push_back(style_json);
      }
      request_call_back_count--;
      if (request_call_back_count > 0) {
        request_call_back_count_map_[request.GetId()] = request_call_back_count;
        style_text_map_[request.GetId()] = style_texts;
        return;
      }
      auto style_result = nlohmann::json::object();
      style_result[kCSSStyles] = style_texts;
      ResponseResultToFrontend(request.GetId(), style_result.dump());
      // clear data
      style_text_map_.erase(request.GetId());
      request_call_back_count_map_.erase(request.GetId());
    });
  }
}

}  // namespace hippy::devtools
