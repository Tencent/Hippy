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

#include "module/model/tdf_inspector_model.h"
#include <sstream>
#include "module/inspect_props.h"

namespace hippy::devtools {

std::string TDFInspectorModel::GetRenderTree(const std::string& render_tree) {  /* NOLINT */
  std::string result_string;
  std::stringstream sstream;
  sstream << "{\"" << kFrontendKeyRtree << "\":";
  sstream >> result_string;
  result_string += render_tree + "}";
  return result_string;
}

}  // namespace hippy::devtools
