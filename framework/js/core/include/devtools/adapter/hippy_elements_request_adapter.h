//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/10/15.
//

#pragma once

#include <string>
#include "devtools/devtool_data_source.h"
#include "devtools_backend/provider/devtools_elements_request_adapter.h"

namespace hippy {
namespace devtools {
class HippyElementsRequestAdapter : public tdf::devtools::ElementsRequestAdapter {
 public:
  using DomainHandler = std::function<void(int32_t node_id, bool is_root, uint32_t depth, DomainDataCallback callback)>;
  using NodeHandler = std::function<void(double x, double y, DomainDataCallback callback)>;
  explicit HippyElementsRequestAdapter(int32_t dom_id) : dom_id_(dom_id) {}
  void SetDomainHandler(DomainHandler domain_handler) { domain_handler_ = domain_handler; }
  void SetNodeHandler(NodeHandler node_handler) { node_handler_ = node_handler; }

  /**
   * @brief 获取domain数据
   */
  void GetDomainData(int32_t node_id, bool is_root, uint32_t depth, DomainDataCallback callback) override;

  /**
   * @brief 根据location坐标获取NodeId
   */
  void GetNodeIdByLocation(double x, double y, NodeLocationCallback callback) override;

 private:
  DomainHandler domain_handler_;
  NodeHandler node_handler_;
  int32_t dom_id_;
};
}  // namespace devtools
}  // namespace hippy
