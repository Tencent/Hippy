//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/10/15.
//

#pragma once

#include <string>
#include "api/adapter/data/dom_node_location.h"
#include "api/adapter/data/domain_metas.h"

namespace tdf {
namespace devtools {
class ElementsRequestAdapter {
 public:
  using DomainDataCallback = std::function<void(const DomainMetas& data)>;
  using NodeLocationCallback = std::function<void(const DomNodeLocation& data)>;
  /**
   * @brief 获取domain数据
   */
  virtual void GetDomainData(int32_t node_id, bool is_root, uint32_t depth, DomainDataCallback callback) = 0;

  /**
   * @brief 根据location坐标获取NodeId
   */
  virtual void GetNodeIdByLocation(double x, double y, NodeLocationCallback callback) = 0;
  virtual ~ElementsRequestAdapter() {}
};
}  // namespace devtools
}  // namespace tdf
