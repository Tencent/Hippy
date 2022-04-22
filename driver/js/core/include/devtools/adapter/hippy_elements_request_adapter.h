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
#include "devtools/devtool_data_source.h"
#include "api/adapter/devtools_elements_request_adapter.h"

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
