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

#include "api/adapter/data/render_diagnostic_metas.h"
#include <sstream>
#include "devtools_base/transform_string_util.h"

namespace hippy::devtools {

constexpr char kDiagnosticsPropertyName[] = "name";
constexpr char kDiagnosticsPropertyType[] = "type";
constexpr char kDiagnosticsPropertyValue[] = "value";
constexpr char kDiagnosticsProperties[] = "properties";

void RenderDiagnosticMetas::AddMeta(const RenderDiagnosticMeta& meta) { metas_.emplace_back(meta); }

std::string RenderDiagnosticMetas::Serialize() const {
  std::string result_string = "{\"";
  result_string += kDiagnosticsProperties;
  result_string += "\":[";
  for (auto const& meta : metas_) {
    std::string element_string = "{\"";
    element_string += kDiagnosticsPropertyName;
    element_string += "\":\"";
    element_string += meta.name;
    element_string += "\",\"";
    element_string += kDiagnosticsPropertyType;
    element_string += "\":\"";
    element_string += meta.type;
    element_string += "\",\"";
    element_string += kDiagnosticsPropertyValue;
    element_string += "\":\"";
    element_string += TransformStringUtil::HandleEscapeCharacter(meta.value);
    element_string += "\"},";
    result_string += element_string;
  }
  result_string.pop_back();
  result_string += !metas_.empty() ? "]}" : "[]}";
  return result_string;
}
}  // namespace hippy::devtools
