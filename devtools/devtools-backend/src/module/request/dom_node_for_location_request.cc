//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
//

#include "module/request/dom_node_for_location_request.h"
#include "devtools_base/parse_json_util.h"
#include "devtools_base/tdf_base_util.h"
#include "module/inspect_props.h"

namespace tdf {
namespace devtools {

constexpr const char* kParamsX = "x";
constexpr const char* kParamsY = "y";

void DomNodeForLocationRequest::RefreshParams(const std::string& params) {
  auto params_json = nlohmann::json::parse(params);
  if (!params_json.is_object()) {
    return;
  }
  double x = TDFParseJSONUtil::GetJSONValue(params_json, kParamsX, 0.0);
  double y = TDFParseJSONUtil::GetJSONValue(params_json, kParamsY, 0.0);
  x_ = x;
  y_ = y;
  has_set_xy_ = true;
}

}  // namespace devtools
}  // namespace tdf
