//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/11/2.
//

#include "api/adapter/data/render_diagnostic_metas.h"
#include <sstream>
#include "devtools_base/transform_string_util.hpp"

namespace tdf {
namespace devtools {

constexpr const char* kDiagnosticsPropertyName = "name";
constexpr const char* kDiagnosticsPropertyType = "type";
constexpr const char* kDiagnosticsPropertyValue = "value";
constexpr const char* kDiagnosticsProperties = "properties";

void RenderDiagnosticMetas::AddMeta(const RenderDiagnosticMeta& meta) { metas_.emplace_back(meta); }

std::string RenderDiagnosticMetas::Serialize() const {
  std::string result_string = "{\"";
  result_string += kDiagnosticsProperties;
  result_string += "\":[";
  for (auto const& meta : metas_) {
    std::string element_string = "{\"";
    element_string += kDiagnosticsPropertyName;
    element_string += "\":\"";
    element_string += meta.name_;
    element_string += "\",\"";
    element_string += kDiagnosticsPropertyType;
    element_string += "\":\"";
    element_string += meta.type_;
    element_string += "\",\"";
    element_string += kDiagnosticsPropertyValue;
    element_string += "\":\"";
    element_string += TransformStringUtil::HandleEscapeCharacter(meta.value_);
    element_string += "\"},";
    result_string += element_string;
  }
  result_string.pop_back();
  result_string += metas_.size() ? "]}" : "[]}";
  return result_string;
}
}  // namespace devtools
}  // namespace tdf
