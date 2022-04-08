//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
//

#include "module/request/dom_node_data_request.h"
#include "module/inspect_props.h"

namespace tdf {
namespace devtools {

void DomNodeDataRequest::RefreshParams(const std::string& params) {
  auto params_json = nlohmann::json::parse(params);
  if (!params_json.is_object() || params_json.find(kFrontendKeyNodeId) == params_json.end()) {
    return;
  }
  node_id_ = params_json[kFrontendKeyNodeId];
  has_set_node_id_ = true;
}

}  // namespace devtools
}  // namespace tdf
