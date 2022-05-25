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

#include "module/domain/dom_domain.h"
#include <cassert>
#include <utility>
#include "api/devtools_backend_service.h"
#include "api/notification/default/default_dom_tree_notification.h"
#include "devtools_base/common/macros.h"
#include "devtools_base/logging.h"
#include "devtools_base/parse_json_util.h"
#include "devtools_base/tdf_base_util.h"
#include "devtools_base/tdf_string_util.h"
#include "module/domain_register.h"

namespace hippy::devtools {

constexpr char kHitNodeId[] = "hitNodeId";
constexpr char kRelationNodes[] = "relationNodes";

// params key
constexpr char kParamsHitNodeRelationTree[] = "hitNodeRelationTree";

// DOM event method name
constexpr char kEventMethodSetChildNodes[] = "DOM.setChildNodes";
constexpr char kEventMethodDocumentUpdated[] = "DOM.documentUpdated";

// default value
constexpr uint32_t kDocumentNodeDepth = 3;
constexpr uint32_t kNormalNodeDepth = 2;
constexpr int32_t kInvalidNodeId = -1;

std::string DomDomain::GetDomainName() { return kFrontendKeyDomainNameDOM; }

void DomDomain::RegisterMethods() {
  REGISTER_DOMAIN(DomDomain, GetDocument, BaseRequest);
  REGISTER_DOMAIN(DomDomain, RequestChildNodes, DomNodeDataRequest);
  REGISTER_DOMAIN(DomDomain, GetBoxModel, DomNodeDataRequest);
  REGISTER_DOMAIN(DomDomain, GetNodeForLocation, DomNodeForLocationRequest);
  REGISTER_DOMAIN(DomDomain, RemoveNode, BaseRequest);
  REGISTER_DOMAIN(DomDomain, SetInspectedNode, BaseRequest);
  REGISTER_DOMAIN(DomDomain, PushNodesByBackendIdsToFrontend, DomPushNodesRequest);
  REGISTER_DOMAIN(DomDomain, PushNodeByPathToFrontend, DomPushNodeByPathRequest);
}

void DomDomain::RegisterCallback() {
  dom_data_call_back_ = [DEVTOOLS_WEAK_THIS](int32_t node_id, bool is_root, uint32_t depth, DomDataCallback callback) {
    DEVTOOLS_DEFINE_AND_CHECK_SELF(DomDomain)
    auto dom_tree_adapter = self->GetDataProvider()->dom_tree_adapter;
    if (dom_tree_adapter) {
      auto response_callback = [callback, provider = self->GetDataProvider()](const DomainMetas& data) {
        auto model = DomModel::CreateModel(nlohmann::json::parse(data.Serialize(), nullptr, false));
        model.SetDataProvider(provider);
        if (callback) {
          callback(model);
        }
      };
      dom_tree_adapter->GetDomainData(node_id, is_root, depth, response_callback);
    } else if (callback) {
      callback(DomModel());
    }
  };

  location_for_node_call_back_ = [DEVTOOLS_WEAK_THIS](int32_t x, int32_t y, DomDataCallback callback) {
    DEVTOOLS_DEFINE_AND_CHECK_SELF(DomDomain)
    auto dom_tree_adapter = self->GetDataProvider()->dom_tree_adapter;
    if (dom_tree_adapter) {
      auto node_callback = [callback, provider = self->GetDataProvider()](const DomNodeLocation& metas) {
        DomModel model;
        model.SetDataProvider(provider);
        nlohmann::json data = nlohmann::json::parse(metas.Serialize(), nullptr, false);
        model.SetNodeId(data[kFrontendKeyNodeId]);
        if (data.find(kParamsHitNodeRelationTree) != data.end()) {
          model.SetRelationTree(data[kParamsHitNodeRelationTree]);
        }
        if (callback) {
          callback(model);
        }
      };
      dom_tree_adapter->GetNodeIdByLocation(x, y, node_callback);
    } else if (callback) {
      callback(DomModel());
    }
  };
  auto update_handler = [DEVTOOLS_WEAK_THIS]() {
    DEVTOOLS_DEFINE_AND_CHECK_SELF(DomDomain)
    self->HandleDocumentUpdate();
  };
  GetNotificationCenter()->dom_tree_notification = std::make_shared<DefaultDomTreeNotification>(update_handler);

  dom_push_node_by_path_call_back_ = [DEVTOOLS_WEAK_THIS](PushNodePath path, DomPushNodeByPathDataCallback callback) {
    DEVTOOLS_DEFINE_AND_CHECK_SELF(DomDomain)
    auto dom_tree_adapter = self->GetDataProvider()->dom_tree_adapter;
    if (dom_tree_adapter) {
      auto push_node_call_back = [callback](const DomPushNodePathMetas& data) {
        nlohmann::json result_data = nlohmann::json::parse(data.Serialize(), nullptr, false);
        auto hit_node_id = result_data[kHitNodeId];
        std::vector<int32_t> relation_nodes;
        if (result_data.find(kRelationNodes) != result_data.end()) {
          auto nodes = result_data[kRelationNodes];
          for (auto node_id : nodes) {
            relation_nodes.emplace_back(node_id);
          }
        }
        if (callback) {
          callback(hit_node_id, relation_nodes);
        }
      };
      dom_tree_adapter->GetPushNodeByPath(path, push_node_call_back);
    } else if (callback) {
      callback(kInvalidNodeId, std::vector<int32_t>());
    }
  };
}

void DomDomain::GetDocument(const BaseRequest& request) {
  if (!dom_data_call_back_) {
    ResponseErrorToFrontend(request.GetId(), kErrorFailCode, "GetDocument, dom_data_callback is null");
    return;
  }
  // getDocument gets the data from the root node without the nodeId
  dom_data_call_back_(kInvalidNodeId, true, kDocumentNodeDepth, [DEVTOOLS_WEAK_THIS, request](DomModel model) {
    DEVTOOLS_DEFINE_AND_CHECK_SELF(DomDomain)
    //  need clear first
    self->element_node_children_count_cache_.clear();
    self->backend_node_id_map_.clear();
    // cache node that has obtain
    self->CacheEntireDocumentTree(model);
    // response to frontend
    self->ResponseResultToFrontend(request.GetId(), model.BuildDocumentJson().dump());
  });
}

void DomDomain::RequestChildNodes(const DomNodeDataRequest& request) {
  if (!dom_data_call_back_) {
    ResponseErrorToFrontend(request.GetId(), kErrorFailCode, "RequestChildNodes, dom_data_callback is null");
    return;
  }
  if (!request.HasSetNodeId()) {
    ResponseErrorToFrontend(request.GetId(), kErrorParams, "DOMDomain, RequestChildNodes, without nodeId");
    return;
  }
  dom_data_call_back_(request.GetNodeId(), false, kNormalNodeDepth, [DEVTOOLS_WEAK_THIS, request](DomModel model) {
    DEVTOOLS_DEFINE_AND_CHECK_SELF(DomDomain)
    self->SetChildNodesEvent(model);
    self->ResponseResultToFrontend(request.GetId(), nlohmann::json::object().dump());
  });
}

void DomDomain::GetBoxModel(const DomNodeDataRequest& request) {
  if (!dom_data_call_back_) {
    ResponseErrorToFrontend(request.GetId(), kErrorFailCode, "GetBoxModel, dom_data_callback is null");
    return;
  }
  if (!request.HasSetNodeId()) {
    ResponseErrorToFrontend(request.GetId(), kErrorParams, "DOMDomain, GetBoxModel, without nodeId");
    return;
  }
  dom_data_call_back_(request.GetNodeId(), false, kNormalNodeDepth, [DEVTOOLS_WEAK_THIS, request](DomModel model) {
    DEVTOOLS_DEFINE_AND_CHECK_SELF(DomDomain)
    auto cache_it = self->element_node_children_count_cache_.find(model.GetNodeId());
    bool in_cache = cache_it != self->element_node_children_count_cache_.end();
    if ((in_cache && cache_it->second == 0) || !in_cache) {
      // if not in cache, then should send to frontend
      self->SetChildNodesEvent(model);
    }
    self->ResponseResultToFrontend(request.GetId(), model.BuildBoxModelJson().dump());
  });
}

void DomDomain::GetNodeForLocation(const DomNodeForLocationRequest& request) {
  if (!dom_data_call_back_) {
    ResponseErrorToFrontend(request.GetId(), kErrorFailCode, "GetNodeForLocation, dom_data_callback is null");
    return;
  }
  if (!request.HasSetXY()) {
    ResponseErrorToFrontend(request.GetId(), kErrorParams, "DOMDomain, GetNodeForLocation, without X, Y");
    return;
  }
  if (!GetDataProvider() || !GetDataProvider()->screen_adapter) {
    ResponseErrorToFrontend(request.GetId(), kErrorNotSupport, "screenAdapter is null");
    return;
  }
  int32_t x =
      static_cast<int32_t>(TdfBaseUtil::RemoveScreenScaleFactor(GetDataProvider()->screen_adapter, request.GetX()));
  int32_t y =
      static_cast<int32_t>(TdfBaseUtil::RemoveScreenScaleFactor(GetDataProvider()->screen_adapter, request.GetY()));
  location_for_node_call_back_(x, y, [DEVTOOLS_WEAK_THIS, request](const DomModel& model) {
    DEVTOOLS_DEFINE_AND_CHECK_SELF(DomDomain)
    auto node_id = self->SearchNearlyCacheNode(model.GetRelationTree());
    if (node_id != kInvalidNodeId) {
      self->ResponseResultToFrontend(request.GetId(), DomModel::BuildNodeForLocation(node_id).dump());
    } else {
      self->ResponseErrorToFrontend(request.GetId(), kErrorFailCode,
                                    "DOMDomain, GetNodeForLocation, nodeId is invalid");
    }
  });
}

void DomDomain::RemoveNode(const BaseRequest& request) {}

void DomDomain::SetInspectedNode(const BaseRequest& request) {
  ResponseResultToFrontend(request.GetId(), nlohmann::json::object().dump());
}

void DomDomain::PushNodesByBackendIdsToFrontend(DomPushNodesRequest& request) {
  if (request.GetBackendIds().empty()) {
    ResponseErrorToFrontend(request.GetId(), kErrorParams,
                            "DOMDomain, pushNodesByBackendIdsToFrontend, without backendNodeIds");
    return;
  }
  std::vector<int32_t> node_ids;
  for (auto backend_id : request.GetBackendIds()) {
    if (backend_node_id_map_.find(backend_id) == backend_node_id_map_.end()) {
      continue;
    }
    node_ids.emplace_back(backend_node_id_map_[backend_id]);
  }
  if (node_ids.empty()) {
    ResponseErrorToFrontend(request.GetId(), kErrorFailCode,
                            "DOMDomain, pushNodesByBackendIdsToFrontend, nodeIds is invalid");
    return;
  }
  ResponseResultToFrontend(request.GetId(), DomModel::BuildPushNodeIdsJson(node_ids).dump());
}

void DomDomain::PushNodeByPathToFrontend(DomPushNodeByPathRequest& request) {
  if (request.GetNodePath().empty()) {
    ResponseErrorToFrontend(request.GetId(), kErrorParams, "DOMDomain, pushNodeByPathToFrontend, without node path");
    return;
  }
  auto path_string = request.GetNodePath();
  auto path_vector = TdfStringUtil::SplitString(path_string, ",");
  PushNodePath node_path;
  for (size_t index = 0; index < path_vector.size() - 1; index += 2) {
    std::string child_index = path_vector[index];
    std::string tag_name = path_vector[index + 1];
    std::map<std::string, int32_t> node_tag_name_id_map;
    node_tag_name_id_map[tag_name] = std::stoi(child_index);
    node_path.emplace_back(node_tag_name_id_map);
  }
  dom_push_node_by_path_call_back_(node_path, [DEVTOOLS_WEAK_THIS, request](int32_t hit_node_id,
                                                                            std::vector<int32_t> relation_nodes) {
    DEVTOOLS_DEFINE_AND_CHECK_SELF(DomDomain)
    auto temp_relation_nodes = relation_nodes;
    std::vector<int32_t> no_need_replenish_nodes;
    for (int32_t node_id : temp_relation_nodes) {
      if (self->element_node_children_count_cache_.find(node_id) == self->element_node_children_count_cache_.end()) {
        continue;
      }
      no_need_replenish_nodes.emplace_back(node_id);
    }
    if (no_need_replenish_nodes.size() == temp_relation_nodes.size()) {
      self->ResponseResultToFrontend(request.GetId(), DomModel::BuildPushNodeByPathJson(hit_node_id).dump());
    } else {
      auto depth = static_cast<unsigned int>(temp_relation_nodes.size() - no_need_replenish_nodes.size() + 1);
      self->dom_data_call_back_(no_need_replenish_nodes[no_need_replenish_nodes.size() - 1], false, depth,
                                [self, request, hit_node_id](DomModel model) {
                                  self->SetChildNodesEvent(model);
                                  self->CacheEntireDocumentTree(model);
                                  self->ResponseResultToFrontend(request.GetId(),
                                                                 DomModel::BuildPushNodeByPathJson(hit_node_id).dump());
                                });
    }
  });
}

void DomDomain::HandleDocumentUpdate() { SendEventToFrontend(InspectEvent(kEventMethodDocumentUpdated, "{}")); }

void DomDomain::CacheEntireDocumentTree(DomModel root_model) {
  element_node_children_count_cache_[root_model.GetNodeId()] = static_cast<uint32_t>(root_model.GetChildren().size());
  backend_node_id_map_[root_model.GetBackendNodeId()] = root_model.GetNodeId();
  for (auto& child : root_model.GetChildren()) {
    CacheEntireDocumentTree(child);
  }
}

void DomDomain::SetChildNodesEvent(DomModel model) {
  if (model.GetChildren().empty()) {
    return;
  }
  SendEventToFrontend(InspectEvent(kEventMethodSetChildNodes, model.BuildChildNodesJson().dump()));
  // SendEvent only replenishes one layer of child node data, so only one layer is cached here
  element_node_children_count_cache_[model.GetNodeId()] = static_cast<uint32_t>(model.GetChildren().size());
  backend_node_id_map_[model.GetBackendNodeId()] = model.GetNodeId();
  for (auto& child : model.GetChildren()) {
    element_node_children_count_cache_[child.GetNodeId()] = static_cast<uint32_t>(child.GetChildren().size());
    backend_node_id_map_[child.GetBackendNodeId()] = child.GetNodeId();
  }
}

int32_t DomDomain::SearchNearlyCacheNode(nlohmann::json relation_tree) {
  if (!relation_tree.is_array()) {
    return kInvalidNodeId;
  }
  // search for the nearest cached node in relation_tree
  auto node_id = 0;
  for (auto& child : relation_tree.items()) {
    auto relation_node = child.value();
    if (element_node_children_count_cache_.find(relation_node) != element_node_children_count_cache_.end()) {
      node_id = relation_node;
      break;
    }
  }
  return node_id;
}

}  // namespace hippy::devtools
