//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/10/15.
//

#include "devtools/adapter/hippy_dom_tree_adapter.h"

#include <string>

#include "devtools/devtool_utils.h"
#include "dom/devtools/dom_devtools_utils.h"
#include "dom/dom_value.h"
#include "dom/node_props.h"

#if TDF_SERVICE_ENABLED
#include "nlohmann/json.hpp"
#endif

namespace hippy {
namespace devtools {

void HippyDomTreeAdapter::UpdateDomTree(std::string tree_data, UpdateDomTreeCallback callback) {
#if TDF_SERVICE_ENABLED
  if (!callback) {
    return;
  }
  using json = nlohmann::json;
  json params_json = json::parse(tree_data.data());
  json update_info = params_json["updateInfo"];
  if (!update_info.is_array()) {
    return;
  }

  bool is_success = false;
  for (auto &json_obj : update_info) {
    int32_t node_id = 0;
    std::unordered_map<std::string, std::shared_ptr<tdf::base::DomValue>> style_map{};
    for (auto &item : json_obj.items()) {
      auto key = item.key();
      auto value = item.value();

      if (key == kId) {
        node_id = value;
      } else {
        // 过滤掉字符串中的\"
        std::string value_str = value.dump();
        std::string src = "\"";
        std::string dest = "";
        std::string::size_type pos(0);
        while ((pos = value_str.find(src, pos)) != std::string::npos) {
          value_str.replace(pos, src.length(), dest);
        }

        // 按属性定义的类型来转换，目前支持修改的属性都是浮点型的
        double double_value = atof(value_str.c_str());
        style_map.insert({key, std::make_shared<tdf::base::DomValue>(double_value)});
      }
    }

    if (node_id > 0) {
      std::shared_ptr<DomManager> dom_manager = DomManager::Find(static_cast<int32_t>(dom_id_));
      if (dom_manager) {
        auto node = dom_manager->GetNode(node_id);
        node->UpdateProperties(style_map, std::unordered_map<std::string, std::shared_ptr<tdf::base::DomValue>>{});
        is_success = true;
      }
    }
  }
  callback(is_success);
#endif
}

void HippyDomTreeAdapter::GetDomTree(DumpDomTreeCallback callback) {
  if (callback) {
#if TDF_SERVICE_ENABLED
    std::function func = [this, callback] {
      std::shared_ptr<DomManager> dom_manager = DomManager::Find(static_cast<int32_t>(dom_id_));
      if (dom_manager) {
        auto root_node = dom_manager->GetNode(dom_manager->GetRootId());
        tdf::devtools::DomNodeMetas metas = DomDevtoolsUtils::ToDomNodeMetas(root_node);
        callback(true, metas);
      }
    };
    DevToolUtils::PostDomTask(dom_id_, func);
#endif
  }
}

}  // namespace devtools
}  // namespace hippy
