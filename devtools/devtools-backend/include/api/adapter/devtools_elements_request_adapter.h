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
#include "api/adapter/data/dom_node_location.h"
#include "api/adapter/data/domain_metas.h"

namespace hippy::devtools {
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
}  // namespace hippy::devtools
