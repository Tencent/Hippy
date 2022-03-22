//
// Created by thomasyqguo on 2022/3/4.
//

#pragma once

#if TDF_SERVICE_ENABLED

#include <memory>
#include "api/adapter/data/dom_node_location.h"
#include "api/adapter/data/dom_node_metas.h"
#include "api/adapter/data/domain_metas.h"
#include "dom/dom_manager.h"
#include "dom/dom_node.h"
#include "dom/dom_value.h"

namespace hippy {
namespace devtools {

class DomDevtoolsUtils {
 public:
  static tdf::devtools::DomNodeMetas ToDomNodeMetas(std::shared_ptr<DomNode> dom_node);
  static tdf::devtools::DomainMetas GetDomDomainData(std::shared_ptr<DomNode> dom_node, uint32_t depth,
                                                     std::shared_ptr<DomManager> dom_manager);
  static tdf::devtools::DomNodeLocation GetNodeIdByDomLocation(std::shared_ptr<DomNode> dom_node, double x, double y);
  static bool IsLocationHitNode(std::shared_ptr<DomNode> dom_node, double x, double y);
  static std::shared_ptr<DomNode> GetSmallerAreaNode(std::shared_ptr<DomNode> old_node,
                                                     std::shared_ptr<DomNode> new_node);
  static std::shared_ptr<DomNode> GetMaxDepthAndMinAreaHitNode(std::shared_ptr<DomNode> node, double x, double y);
  static std::string ParseNodeProps(
      const std::shared_ptr<std::unordered_map<std::string, std::shared_ptr<tdf::base::DomValue>>>& node_props);
  static std::string ParseDomValue(const tdf::base::DomValue& value);
};
}  // namespace devtools
}  // namespace hippy
#endif
