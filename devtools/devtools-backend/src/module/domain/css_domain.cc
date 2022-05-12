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
#include "devtools_base/common/macros.h"
#include "devtools_base/logging.h"
#include "devtools_base/tdf_string_util.h"
#include "module/domain_register.h"

namespace hippy::devtools {

// rsp json key
constexpr char kCssStyles[] = "styles";

// default value
constexpr uint32_t kCssStyleNodeDepth = 1;

CssDomain::CssDomain(std::weak_ptr<DomainDispatch> dispatch) : BaseDomain(std::move(dispatch)) {}

std::string CssDomain::GetDomainName() { return kFrontendKeyDomainNameCSS; }

void CssDomain::RegisterMethods() {
  REGISTER_DOMAIN(CssDomain, GetMatchedStylesForNode, CssNodeDataRequest);
  REGISTER_DOMAIN(CssDomain, GetComputedStyleForNode, CssNodeDataRequest);
  REGISTER_DOMAIN(CssDomain, GetInlineStylesForNode, CssNodeDataRequest);
  REGISTER_DOMAIN(CssDomain, SetStyleTexts, CssEditStyleTextsRequest);
}

void CssDomain::RegisterCallback() {
  css_data_call_back_ = [DEVTOOLS_WEAK_THIS](int32_t node_id, CssStyleDataCallback callback) {
    DEVTOOLS_DEFINE_AND_CHECK_SELF(CssDomain)
    auto elements_request_adapter = self->GetDataProvider()->elements_request_adapter;
    if (!elements_request_adapter) {
      if (callback) {
        callback(CssModel());
      }
      return;
    }
    auto response_callback = [callback, provider = self->GetDataProvider()](const DomainMetas& data) {
      auto model = CssModel::CreateModel(nlohmann::json::parse(data.Serialize()));
      model.SetDataProvider(provider);
      if (callback) {
        callback(model);
      }
    };
    elements_request_adapter->GetDomainData(node_id, false, kCssStyleNodeDepth, response_callback);
  };
}

void CssDomain::GetMatchedStylesForNode(const CssNodeDataRequest& request) {
  if (!css_data_call_back_) {
    ResponseErrorToFrontend(request.GetId(), kErrorFailCode,
                            "CSSDomain, GetMatchedStyles, css_data_call_back_ is null");
    return;
  }
  if (!request.HasSetNodeId()) {
    ResponseErrorToFrontend(request.GetId(), kErrorParams, "CSSDomain, GetMatchedStyles, params isn't object");
    return;
  }
  css_data_call_back_(request.GetNodeId(), [DEVTOOLS_WEAK_THIS, request](CssModel model) {
    DEVTOOLS_DEFINE_AND_CHECK_SELF(CssDomain)
    self->ResponseResultToFrontend(request.GetId(), model.BuildMatchedStylesJSON().dump());
  });
}

void CssDomain::GetComputedStyleForNode(const CssNodeDataRequest& request) {
  if (!css_data_call_back_) {
    ResponseErrorToFrontend(request.GetId(), kErrorFailCode,
                            "CSSDomain, GetComputedStyle, css_data_call_back_ is null");
    return;
  }
  if (!request.HasSetNodeId()) {
    ResponseErrorToFrontend(request.GetId(), kErrorParams, "CSSDomain, GetComputedStyle, params isn't object");
    return;
  }
  css_data_call_back_(request.GetNodeId(), [DEVTOOLS_WEAK_THIS, request](CssModel model) {
    DEVTOOLS_DEFINE_AND_CHECK_SELF(CssDomain)
    self->ResponseResultToFrontend(request.GetId(), model.BuildComputedStyleJSON().dump());
  });
}

void CssDomain::GetInlineStylesForNode(const CssNodeDataRequest& request) {
  if (!css_data_call_back_) {
    ResponseErrorToFrontend(request.GetId(), kErrorFailCode, "CSSDomain, GetInlineStyles, css_data_call_back_ is null");
    return;
  }
  if (!request.HasSetNodeId()) {
    ResponseErrorToFrontend(request.GetId(), kErrorParams, "CSSDomain, GetInlineStyles, params isn't object");
    return;
  }
  css_data_call_back_(request.GetNodeId(), [DEVTOOLS_WEAK_THIS, request](const CssModel& model) {
    DEVTOOLS_DEFINE_AND_CHECK_SELF(CssDomain)
    self->ResponseResultToFrontend(request.GetId(), CssModel::BuildInlineStylesJSON().dump());
  });
}

void CssDomain::SetStyleTexts(const CssEditStyleTextsRequest& request) {
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
    css_data_call_back_(node_id, [DEVTOOLS_WEAK_THIS, request, edit_value](CssModel model) {
      DEVTOOLS_DEFINE_AND_CHECK_SELF(CssDomain)
      auto style_texts = self->style_text_map_[request.GetId()];
      auto request_call_back_count = self->request_call_back_count_map_[request.GetId()];
      auto style_json = model.UpdateDomTreeAndGetStyleTextJSON(edit_value);
      if (!style_json.is_null()) {
        style_texts.push_back(style_json);
      }
      request_call_back_count--;
      if (request_call_back_count > 0) {
        self->request_call_back_count_map_[request.GetId()] = request_call_back_count;
        self->style_text_map_[request.GetId()] = style_texts;
        return;
      }
      auto style_result = nlohmann::json::object();
      style_result[kCssStyles] = style_texts;
      self->ResponseResultToFrontend(request.GetId(), style_result.dump());
      // clear data
      self->style_text_map_.erase(request.GetId());
      self->request_call_back_count_map_.erase(request.GetId());
    });
  }
}

}  // namespace hippy::devtools
