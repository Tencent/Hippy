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
/**
 * get the root DOM node (and optionally the subtree) to the caller.
 * @see https://chromedevtools.github.io/devtools-protocol/tot/DOM/#method-getDocument
 */
class ElementsRequestAdapter {
 public:
  using DomainDataCallback = std::function<void(const DomainMetas& data)>;
  using NodeLocationCallback = std::function<void(const DomNodeLocation& data)>;

  /**
   * Get the n-tier child node data of the node
   * @param node_id current node
   * @param is_root is root node
   * @param depth n-tier child node
   * @param callback finish callback
   */
  virtual void GetDomainData(int32_t node_id, bool is_root, uint32_t depth, DomainDataCallback callback) = 0;

  /**
   * Returns node id at given location.
   * Depending on whether DOM domain is enabled, nodeId is either returned or not.
   * @see https://chromedevtools.github.io/devtools-protocol/tot/DOM/#method-getNodeForLocation
   * @param x  mouse x coordinate.
   * @param y mouse y coordinate.
   * @param callback finish callback
   */
  virtual void GetNodeIdByLocation(double x, double y, NodeLocationCallback callback) = 0;

  virtual ~ElementsRequestAdapter() {}
};
}  // namespace hippy::devtools
