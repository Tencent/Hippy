//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/10/15.
//

#pragma once

#include <string>
#include "api/adapter/data/dom_node_metas.h"
#include "api/adapter/data/update_dom_node_metas.h"

namespace tdf {
namespace devtools {
class DomTreeAdapter {
 public:
  using DumpDomTreeCallback = std::function<void(const bool is_success, const DomNodeMetas& metas)>;
  using UpdateDomTreeCallback = std::function<void(const bool is_success)>;
  /**
   * @brief 设置 JS 的 dom 节点修改
   */
  virtual void UpdateDomTree(UpdateDomNodeMetas metas, UpdateDomTreeCallback callback) = 0;

  /**
   * @brief 获取 JS 的 DOM Tree
   */
  virtual void GetDomTree(DumpDomTreeCallback callback) = 0;
  virtual ~DomTreeAdapter() {}
};
}  // namespace devtools
}  // namespace tdf
