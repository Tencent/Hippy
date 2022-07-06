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
#include "module/request/base_request.h"
#include "module/request/dom_node_data_request.h"
#include "module/request/dom_node_for_location_request.h"
#include "module/request/dom_push_node_by_path_request.h"
#include "module/request/dom_push_nodes_request.h"

namespace hippy::devtools {
/**
 * @brief DOM domain
 */
class DomDomain : public BaseDomain, public std::enable_shared_from_this<DomDomain> {
 public:
  using PushNodePath = std::vector<std::map<std::string, int32_t>>;
  using DomDataCallback = std::function<void(DomModel model)>;
  using DomPushNodeByPathDataCallback = std::function<void(int32_t hit_node_id, std::vector<int32_t> relation_nodes)>;
  using DomDataRequestCallback =
      std::function<void(int32_t node_id, bool is_root, uint32_t depth, DomDataCallback callback)>;
  using LocationForNodeDataCallback = std::function<void(double x, double y, DomDataCallback callback)>;
  using DomPushNodeByPathCallback = std::function<void(PushNodePath path, DomPushNodeByPathDataCallback callback)>;

  explicit DomDomain(std::weak_ptr<DomainDispatch> dispatch) : BaseDomain(std::move(dispatch)) {}
  std::string GetDomainName() override;
  void RegisterMethods() override;
  void RegisterCallback() override;
  inline void SetDomDataRequestCallback(DomDataRequestCallback call_back) { dom_data_call_back_ = call_back; }

 private:
  void GetDocument(const BaseRequest& request);
  void RequestChildNodes(const DomNodeDataRequest& request);
  void GetBoxModel(const DomNodeDataRequest& request);
  void GetNodeForLocation(const DomNodeForLocationRequest& request);
  void RemoveNode(const BaseRequest& request);
  void SetInspectedNode(const BaseRequest& request);
  void PushNodesByBackendIdsToFrontend(DomPushNodesRequest& request);
  void PushNodeByPathToFrontend(DomPushNodeByPathRequest& request);
  void HandleDocumentUpdate();
  void CacheEntireDocumentTree(DomModel root_model);
  void SetChildNodesEvent(DomModel model);
  int32_t SearchNearlyCacheNode(nlohmann::json relation_tree);
  double RemoveScreenScaleFactor(const std::shared_ptr<ScreenAdapter>& screen_adapter, double origin_value);

  // <node_id, children_size>
  std::map<int32_t, uint32_t> element_node_children_count_cache_;
  // <backend_id, node_id>
  std::map<int32_t, int32_t> backend_node_id_map_;
  DomDataRequestCallback dom_data_call_back_;
  LocationForNodeDataCallback location_for_node_call_back_;
  DomPushNodeByPathCallback dom_push_node_by_path_call_back_;
};
}  // namespace hippy::devtools
