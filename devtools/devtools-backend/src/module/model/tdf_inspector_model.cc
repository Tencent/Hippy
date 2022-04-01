//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by ivanfanwu on 2021/9/16.
//

#include "module/model/tdf_inspector_model.h"
#include <sstream>
#include "module/inspect_props.h"

namespace tdf {
namespace devtools {

std::string TDFInspectorModel::GetRenderTree(const std::string& render_tree) {
  std::string result_string;
  std::stringstream sstream;
  sstream << "{\"" << kFrontendKeyRtree << "\":";
  sstream >> result_string;
  result_string += render_tree + "}";
  return result_string;
}

}  // namespace devtools
}  // namespace tdf
