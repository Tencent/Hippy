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

#include <functional>
#include <map>
#include <memory>
#include <string>
#include "module/domain/base_domain.h"
#include "module/model/css_model.h"
#include "module/request/css_edit_style_texts_request.h"
#include "module/request/css_node_data_request.h"

namespace hippy::devtools {

/**
 * @brief CssModel callback
 */
using CssStyleDataCallback = std::function<void(const CssModel& model)>;

/**
 * @brief css style by node id
 * @param node_id node id
 * @param callback data callback
 */
using CssDataRequestCallback = std::function<void(int32_t node_id, CssStyleDataCallback callback)>;

/**
 * @brief Css domain
 */
class CssDomain : public BaseDomain, public std::enable_shared_from_this<CssDomain> {
 public:
  explicit CssDomain(std::weak_ptr<DomainDispatch> dispatch) : BaseDomain(std::move(dispatch)){};
  std::string GetDomainName() override;
  void RegisterMethods() override;
  void RegisterCallback() override;

 private:
  void GetMatchedStylesForNode(const CssNodeDataRequest& request);
  void GetComputedStyleForNode(const CssNodeDataRequest& request);
  void GetInlineStylesForNode(const CssNodeDataRequest& request);
  void SetStyleTexts(const CssEditStyleTextsRequest& request);

  CssDataRequestCallback css_data_call_back_;
  std::map<int32_t, nlohmann::json> style_text_map_;
  std::map<int32_t, uint32_t> request_call_back_count_map_;
};
}  // namespace hippy::devtools
