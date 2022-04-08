//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
//

#include "module/domain/dom_domain.h"
#include <cassert>
#include <utility>
#include "api/devtools_backend_service.h"
#include "api/notification/default/default_elements_response_notification.h"
#include "devtools_base/logging.h"
#include "devtools_base/parse_json_util.h"
#include "devtools_base/tdf_base_util.h"
#include "module/domain_register.h"

namespace tdf {
namespace devtools {

// params key
constexpr const char* kParamsHitNodeRelationTree = "hitNodeRelationTree";

// DOM event method name
constexpr const char* kEventMethodSetChildNodes = "DOM.setChildNodes";
constexpr const char* kEventMethodDocumentUpdated = "DOM.documentUpdated";

// default value
constexpr uint32_t kDocumentNodeDepth = 3;
constexpr uint32_t kNormalNodeDepth = 2;
constexpr int32_t kInvalidNodeId = -1;

DOMDomain::DOMDomain(std::weak_ptr<DomainDispatch> dispatch) : BaseDomain(dispatch) {
  // 注册dom data回调
  dom_data_call_back_ = [this](int32_t node_id, bool is_root, uint32_t depth, DomDataCallback callback) {
    auto elements_request_adapter = GetDataProvider()->GetElementsRequestAdapter();
    if (elements_request_adapter) {
      auto response_callback = [callback, provider = GetDataProvider()](const DomainMetas& data) {
        auto model = DOMModel::CreateModelByJSON(nlohmann::json::parse(data.Serialize()));
        model.SetDataProvider(provider);
        if (callback) {
          callback(model);
        }
      };
      elements_request_adapter->GetDomainData(node_id, is_root, depth, response_callback);
    } else if (callback) {
      callback(DOMModel());
    }
  };

  // location for node回调
  location_for_node_call_back_ = [this](int32_t x, int32_t y, DomDataCallback callback) {
    auto elements_request_adapter = GetDataProvider()->GetElementsRequestAdapter();
    if (elements_request_adapter) {
      auto node_callback = [callback, provider = GetDataProvider()](const DomNodeLocation& metas) {
        DOMModel model;
        model.SetDataProvider(provider);
        nlohmann::json data = nlohmann::json::parse(metas.Serialize());
        model.SetNodeId(data[kFrontendKeyNodeId]);
        if (data.find(kParamsHitNodeRelationTree) != data.end()) {
          model.SetRelationTree(data[kParamsHitNodeRelationTree]);
        }
        if (callback) {
          callback(model);
        }
      };
      elements_request_adapter->GetNodeIdByLocation(x, y, node_callback);
    } else if (callback) {
      callback(DOMModel());
    }
  };
}

std::string_view DOMDomain::GetDomainName() { return kFrontendKeyDomainNameDOM; }

void DOMDomain::RegisterMethods() {
  REGISTER_DOMAIN(DOMDomain, GetDocument, DomainBaseRequest);
  REGISTER_DOMAIN(DOMDomain, RequestChildNodes, DomNodeDataRequest);
  REGISTER_DOMAIN(DOMDomain, GetBoxModel, DomNodeDataRequest);
  REGISTER_DOMAIN(DOMDomain, GetNodeForLocation, DomNodeForLocationRequest);
  REGISTER_DOMAIN(DOMDomain, RemoveNode, DomainBaseRequest);
  REGISTER_DOMAIN(DOMDomain, SetInspectedNode, DomainBaseRequest);
}

void DOMDomain::GetDocument(const DomainBaseRequest& request) {
  if (!dom_data_call_back_) {
    ResponseErrorToFrontend(request.GetId(), kErrorFailCode, "GetDocument, dom_data_callback is null");
    return;
  }
  // 触发回调并且获取 dom 结构数据
  dom_data_call_back_(-1, true, kDocumentNodeDepth, [this, request](DOMModel model) {
    // 触发GetDocument先清空缓存
    element_tree_cache_.clear();
    // 缓存下已获取孩子数据的节点
    CacheDocumentNode(model);
    // 回包给 frontend
    ResponseResultToFrontend(request.GetId(), model.GetDocumentJSON().dump());
  });
}

void DOMDomain::RequestChildNodes(const DomNodeDataRequest& request) {
  if (!dom_data_call_back_) {
    ResponseErrorToFrontend(request.GetId(), kErrorFailCode, "RequestChildNodes, dom_data_callback is null");
    return;
  }
  if (!request.HasSetNodeId()) {
    ResponseErrorToFrontend(request.GetId(), kErrorParams, "DOMDomain, RequestChildNodes, without nodeId");
    return;
  }
  dom_data_call_back_(request.GetNodeId(), false, kNormalNodeDepth, [this, request](DOMModel model) {
    SetChildNodesEvent(std::move(model));
    ResponseResultToFrontend(request.GetId(), nlohmann::json::object().dump());
  });
}

void DOMDomain::GetBoxModel(const DomNodeDataRequest& request) {
  if (!dom_data_call_back_) {
    ResponseErrorToFrontend(request.GetId(), kErrorFailCode, "GetBoxModel, dom_data_callback is null");
    return;
  }
  if (!request.HasSetNodeId()) {
    ResponseErrorToFrontend(request.GetId(), kErrorParams, "DOMDomain, GetBoxModel, without nodeId");
    return;
  }
  dom_data_call_back_(request.GetNodeId(), false, kNormalNodeDepth, [this, request](DOMModel model) {
    auto cache_it = element_tree_cache_.find(model.GetNodeId());
    bool in_cache = cache_it != element_tree_cache_.end();
    if ((in_cache && cache_it->second == 0) || !in_cache) {
      // GetBoxModel的时候如果已经给过数据了，就不要再给了
      SetChildNodesEvent(model);
    }
    ResponseResultToFrontend(request.GetId(), model.GetBoxModelJSON().dump());
  });
}

void DOMDomain::GetNodeForLocation(const DomNodeForLocationRequest& request) {
  if (!dom_data_call_back_) {
    ResponseErrorToFrontend(request.GetId(), kErrorFailCode, "GetNodeForLocation, dom_data_callback is null");
    return;
  }
  if (!request.HasSetXY()) {
    ResponseErrorToFrontend(request.GetId(), kErrorParams, "DOMDomain, GetNodeForLocation, without X, Y");
    return;
  }
  if (!GetDataProvider() || !GetDataProvider()->GetScreenAdapter()) {
    ResponseErrorToFrontend(request.GetId(), kErrorNotSupport, "screenAdapter is null");
    return;
  }
  int32_t x = TDFBaseUtil::RemoveScreenScaleFactor(GetDataProvider()->GetScreenAdapter(), request.GetX());
  int32_t y = TDFBaseUtil::RemoveScreenScaleFactor(GetDataProvider()->GetScreenAdapter(), request.GetY());
  location_for_node_call_back_(x, y, [this, request](DOMModel model) {
    auto node_id = SearchNearlyCacheNode(model.GetRelationTree());
    if (node_id != kInvalidNodeId) {
      ResponseResultToFrontend(request.GetId(), model.GetNodeForLocation(node_id).dump());
    } else {
      ResponseErrorToFrontend(request.GetId(), kErrorFailCode, "DOMDomain, GetNodeForLocation, nodeId is invalid");
    }
  });
}

void DOMDomain::RemoveNode(const DomainBaseRequest& request) {}

void DOMDomain::SetInspectedNode(const DomainBaseRequest& request) {
  ResponseResultToFrontend(request.GetId(), nlohmann::json::object().dump());
}

void DOMDomain::HandleDocumentUpdate() { SendEventToFrontend(InspectEvent(kEventMethodDocumentUpdated, "{}")); }

void DOMDomain::CacheDocumentNode(DOMModel model) {
  element_tree_cache_[model.GetNodeId()] = model.GetChildren().size();
  for (auto& child : model.GetChildren()) {
    CacheDocumentNode(child);
  }
}

void DOMDomain::SetChildNodesEvent(DOMModel model) {
  if (model.GetChildren().empty()) {
    // 空的就不设置了
    return;
  }
  SendEventToFrontend(InspectEvent(kEventMethodSetChildNodes, model.GetChildNodesJSON().dump()));
  element_tree_cache_[model.GetNodeId()] = model.GetChildren().size();
  for (auto& child : model.GetChildren()) {
    element_tree_cache_[child.GetNodeId()] = child.GetChildren().size();
  }
}

int32_t DOMDomain::SearchNearlyCacheNode(nlohmann::json relation_tree) {
  if (!relation_tree.is_array()) {
    return kInvalidNodeId;
  }
  auto node_id = 0;
  for (auto& child : relation_tree.items()) {
    auto relation_node = child.value();
    // 找离得最近的
    if (element_tree_cache_.find(relation_node) != element_tree_cache_.end()) {
      node_id = relation_node;
      break;
    }
  }
  return node_id;
}

}  // namespace devtools
}  // namespace tdf
