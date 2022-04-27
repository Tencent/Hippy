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

#include <string>
#include "api/adapter/data/render_diagnostic_metas.h"
#include "api/adapter/data/render_node_metas.h"

namespace hippy {
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
}  // namespace hippy
