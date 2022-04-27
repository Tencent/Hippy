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
#include "module/model/dom_model.h"
#include "module/request/dom_node_data_request.h"
#include "module/request/dom_node_for_location_request.h"
#include "module/request/domain_base_request.h"

namespace hippy::devtools {
/**
 * @brief DOM domain 处理类
 *        处理 frontend 分发过来的 DOM 相关的 method
 */
class DOMDomain : public BaseDomain {
 public:
  using DomDataCallback = std::function<void(DOMModel model)>;
  using DomDataRequestCallback =
      std::function<void(int32_t node_id, bool is_root, uint32_t depth, const DomDataCallback& callback)>;
  using LocationForNodeDataCallback = std::function<void(double x, double y, const DomDataCallback& callback)>;
  explicit DOMDomain(std::weak_ptr<DomainDispatch> dispatch);
  std::string_view GetDomainName() override;
  void RegisterMethods() override;
  void SetDomDataRequestCallback(DomDataRequestCallback call_back) { dom_data_call_back_ = call_back; }

 private:
  void GetDocument(const Deserializer& request);
  void RequestChildNodes(const DomNodeDataRequest& request);
  void GetBoxModel(const DomNodeDataRequest& request);
  void GetNodeForLocation(const DomNodeForLocationRequest& request);
  void RemoveNode(const Deserializer& request);
  void SetInspectedNode(const Deserializer& request);
  void HandleDocumentUpdate();
  void CacheDocumentNode(DOMModel model);
  void SetChildNodesEvent(DOMModel model);
  int32_t SearchNearlyCacheNode(nlohmann::json relation_tree);

  // <node_id, children_size>
  std::map<int32_t, int32_t> element_tree_cache_;
  DomDataRequestCallback dom_data_call_back_;
  LocationForNodeDataCallback location_for_node_call_back_;
};
}  // namespace devtools::devtools
