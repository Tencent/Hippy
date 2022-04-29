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

namespace hippy::devtools {
/**
 * Custom extension protocol data of render tree， for more see CDP protocol
 */
class RenderTreeAdapter {
 public:
  using GetRenderTreeCallback = std::function<void(const bool is_success, const RenderNodeMetas& metas)>;
  using GetRenderDiagnosticCallback = std::function<void(const bool is_success, const RenderDiagnosticMetas& metas)>;

  /**
   * get current page render node tree
   * @param callback render tree data callback
   */
  virtual void GetRenderTree(GetRenderTreeCallback callback) = 0;

  /**
   * @brief Get the render node of the object being selected
   * @param render_id  mouse selected render object id
   * @param callback detail data callback
   */
  virtual void GetSelectedRenderObject(int32_t render_id, GetRenderDiagnosticCallback callback) = 0;

  virtual ~RenderTreeAdapter() = default;
};
}  // namespace hippy::devtools
