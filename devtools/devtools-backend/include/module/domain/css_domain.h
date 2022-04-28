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
 * @brief CSSModel数据回调
 */
using CSSStyleDataCallback = std::function<void(const CSSModel& model)>;

/**
 * @brief 根据node id请求单个节点的style数据
 * @param node_id 节点id
 * @param callback 数据回调
 */
using CSSDataRequestCallback = std::function<void(int32_t node_id, const CSSStyleDataCallback& callback)>;

/**
 * @brief CSS domain 处理类
 *        处理 frontend 分发过来的 CSS 相关的 method
 */
class CSSDomain : public BaseDomain {
 public:
  explicit CSSDomain(std::weak_ptr<DomainDispatch> dispatch);
  std::string_view GetDomainName() override;
  void RegisterMethods() override;

 private:
  void GetMatchedStylesForNode(const CSSNodeDataRequest& request);
  void GetComputedStyleForNode(const CSSNodeDataRequest& request);
  void GetInlineStylesForNode(const CSSNodeDataRequest& request);
  void SetStyleTexts(const CSSEditStyleTextsRequest& request);

  CSSDataRequestCallback css_data_call_back_;
  std::map<int32_t, nlohmann::json> style_text_map_;
  std::map<int32_t, uint32_t> request_call_back_count_map_;
};
}  // namespace hippy::devtools
