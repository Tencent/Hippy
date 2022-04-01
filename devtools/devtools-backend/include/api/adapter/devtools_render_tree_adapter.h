//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/10/15.
//

#pragma once

#include <string>
#include "api/adapter/data/render_diagnostic_metas.h"
#include "api/adapter/data/render_node_metas.h"

namespace tdf {
namespace devtools {
class RenderTreeAdapter {
 public:
  using GetRenderTreeCallback = std::function<void(const bool is_success, const RenderNodeMetas& metas)>;
  using GetRenderDiagnosticCallback = std::function<void(const bool is_success, const RenderDiagnosticMetas& metas)>;
  /**
   * @brief 获取渲染的 Render Tree
   */
  virtual void GetRenderTree(GetRenderTreeCallback callback) = 0;

  virtual ~RenderTreeAdapter() = default;

  /**
   * @brief 获取正被选中的 Render Object 节点
   * @param render_id 渲染节点 id
   * @param callback 回调 Render 数据
   */
  virtual void GetSelectedRenderObject(int32_t render_id, GetRenderDiagnosticCallback callback) = 0;
};
}  // namespace devtools
}  // namespace tdf
