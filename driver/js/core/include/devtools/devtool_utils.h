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

#ifdef JS_V8
#include "core/runtime/v8/runtime.h"
#endif

#include "api/adapter/data/dom_node_location.h"
#include "api/adapter/data/dom_node_metas.h"
#include "api/adapter/data/domain_metas.h"
#include "dom/dom_manager.h"
#include "dom/dom_node.h"

namespace hippy {
namespace devtools {
/**
 *  dom node operation util class
 */
class DevToolsUtil {
 public:
  using DomValue = tdf::base::DomValue;
  using DomNodeMetas = hippy::devtools::DomNodeMetas;
  using DomainMetas = hippy::devtools::DomainMetas;
  using DomNodeLocation = hippy::devtools::DomNodeLocation;

  static DomNodeMetas ToDomNodeMetas(const std::shared_ptr<DomNode>& dom_node);

  static DomainMetas GetDomDomainData(
      const std::shared_ptr<DomNode>& dom_node,
      uint32_t depth,
      const std::shared_ptr<DomManager>& dom_manager);

  static DomNodeLocation GetNodeIdByDomLocation(
      const std::shared_ptr<DomNode>& dom_node,
      double x,
      double y);

  static void PostDomTask(int32_t dom_id, std::function<void()> func);

 private:
  static std::shared_ptr<DomNode>
  GetHitNode(const std::shared_ptr<DomNode>& node, double x, double y);
  static bool IsLocationHitNode(const std::shared_ptr<DomNode>& dom_node,
                                double x,
                                double y);
  static std::string ParseNodeKeyProps(
      const std::string& node_key,
      const std::shared_ptr<
          std::unordered_map<std::string, std::shared_ptr<DomValue>>>&
          node_props);
  static std::string ParseNodeProps(
      const std::shared_ptr<
          std::unordered_map<std::string, std::shared_ptr<DomValue>>>&
          node_props);
  static std::string ParseNodeProps(
      const std::unordered_map<std::string, DomValue>& node_props);
  static std::string ParseDomValue(const DomValue& value);
  static void AppendDomKeyValue(std::string& node_str,
                                bool& first_object,
                                const std::string& node_key,
                                const DomValue& dom_value);
};
}  // namespace devtools
}  // namespace hippy
