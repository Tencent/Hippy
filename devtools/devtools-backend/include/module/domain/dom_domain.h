//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by ivanfanwu on 2021/7/13.
//

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

namespace tdf {
namespace devtools {

/**
 * @brief DomMode数据回调
 */
using DomDataCallback = std::function<void(DOMModel model)>;

/**
 * @brief 请求DomModel数据，支持单个节点或者是整棵树
 * @param node_id 节点id
 * @param is_root 是否是root节点，true则直接取root_node节点数据
 * @param depth 节点深度
 * @param callback 数据回调
 */
using DomDataRequestCallback =
    std::function<void(int32_t node_id, bool is_root, uint32_t depth, DomDataCallback callback)>;

/**
 * @brief 根据Location坐标请求node id回调
 * @param callback 数据回调，这里只用到了node id数据，DOMModel里面的其他数据为初始值，不可直接使用
 */
using LocationForNodeDataCallback = std::function<void(double x, double y, DomDataCallback callback)>;

/**
 * @brief DOM domain 处理类
 *        处理 frontend 分发过来的 DOM 相关的 method
 */
class DOMDomain : public BaseDomain {
 public:
  explicit DOMDomain(std::weak_ptr<DomainDispatch> dispatch);
  std::string_view GetDomainName() override;
  void RegisterMethods() override;
  void SetDomDataRequestCallback(DomDataRequestCallback call_back) { dom_data_call_back_ = call_back; }

 private:
  void GetDocument(const DomainBaseRequest& request);
  void RequestChildNodes(const DomNodeDataRequest& request);
  void GetBoxModel(const DomNodeDataRequest& request);
  void GetNodeForLocation(const DomNodeForLocationRequest& request);
  void RemoveNode(const DomainBaseRequest& request);
  void SetInspectedNode(const DomainBaseRequest& request);
  void HandleDocumentUpdate();
  void CacheDocumentNode(DOMModel model);
  void SetChildNodesEvent(DOMModel model);
  int32_t SearchNearlyCacheNode(nlohmann::json relation_tree);

  typedef void (DOMDomain::*DOMFunction)(int32_t id, const std::string& params);
  // <node_id, children_size>
  std::map<int32_t, int32_t> element_tree_cache_;
  DomDataRequestCallback dom_data_call_back_;
  LocationForNodeDataCallback location_for_node_call_back_;
};

}  // namespace devtools
}  // namespace tdf
