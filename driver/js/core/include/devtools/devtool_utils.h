//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2022/1/19.
//

#pragma once

#ifdef OS_ANDROID
#include "core/runtime/v8/runtime.h"
#else
#include "dom/dom_manager.h"
#include "dom/dom_node.h"
#endif

namespace hippy {
namespace devtools {
/**
 * devtools 的工具类
 * 处理 DomNode 数据读取转换等
 */
class DevToolUtils {
 public:
  static tdf::devtools::DomNodeMetas ToDomNodeMetas(const std::shared_ptr<DomNode>& dom_node);
  static tdf::devtools::DomainMetas GetDomDomainData(const std::shared_ptr<DomNode>& dom_node, uint32_t depth,
                                                     const std::shared_ptr<DomManager>& dom_manager);
  static tdf::devtools::DomNodeLocation GetNodeIdByDomLocation(const std::shared_ptr<DomNode>& dom_node, double x,
                                                               double y);
  static bool IsLocationHitNode(const std::shared_ptr<DomNode>& dom_node, double x, double y);
  static std::shared_ptr<DomNode> GetSmallerAreaNode(const std::shared_ptr<DomNode>& old_node,
                                                     const std::shared_ptr<DomNode>& new_node);
  static std::shared_ptr<DomNode> GetMaxDepthAndMinAreaHitNode(const std::shared_ptr<DomNode>& node, double x,
                                                               double y);
  static std::string ParseNodeProps(
      const std::shared_ptr<std::unordered_map<std::string, std::shared_ptr<tdf::base::DomValue>>>& node_props);
  static std::string ParseDomValue(const tdf::base::DomValue& value);
  static void PostDomTask(int32_t dom_id, std::function<void()> func);
};
}  // namespace devtools
}  // namespace hippy
