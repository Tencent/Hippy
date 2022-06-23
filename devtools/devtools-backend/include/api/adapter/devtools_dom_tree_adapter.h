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
#include <vector>
#include <map>

#include "api/adapter/data/dom_node_metas.h"
#include "api/adapter/data/update_dom_node_metas.h"
#include "api/adapter/data/dom_node_location.h"
#include "api/adapter/data/domain_metas.h"
#include "api/adapter/data/dom_push_node_path_metas.h"

namespace hippy::devtools {
/**
 * Dom node tree data adapter, get or update dom node interface declare
 * @see https://chromedevtools.github.io/devtools-protocol/tot/DOM/
 */
class DomTreeAdapter {
 public:
  using DumpDomTreeCallback = std::function<void(const bool is_success, const DomNodeMetas& metas)>;
  using UpdateDomTreeCallback = std::function<void(const bool is_success)>;
  using DomainDataCallback = std::function<void(const DomainMetas& data)>;
  using NodeLocationCallback = std::function<void(const DomNodeLocation& data)>;
  using PushNodePath = std::vector<std::map<std::string, int32_t>>;
  using PushNodeByPathCallback = std::function<void(const DomPushNodePathMetas& data)>;

  /**
   * get current page dom node tree
   * @param callback finish callback
   */
  virtual void GetDomTree(DumpDomTreeCallback callback) = 0;

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

  /**
   *  Get push node by path
   *  @see https://chromedevtools.github.io/devtools-protocol/tot/DOM/#method-pushNodeByPathToFrontend
   *  @param path node path
   */
  virtual void GetPushNodeByPath(PushNodePath path, PushNodeByPathCallback callback) = 0;

  /**
    * @brief update current page dom node tree
    * @param metas dom node properties metas
    * @param callback  finish callback
    */
  virtual void UpdateDomTree(UpdateDomNodeMetas metas, UpdateDomTreeCallback callback) = 0;

  virtual ~DomTreeAdapter() {}
};
}  // namespace hippy::devtools
