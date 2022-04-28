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

#include "module/request/selected_render_object_request.h"
#include "module/inspect_props.h"

namespace hippy::devtools {

void SelectedRenderObjectRequest::Deserialize(const std::string& params) {
  nlohmann::json params_json = nlohmann::json::parse(params);
  int32_t render_id = params_json[kFrontendKeyId];
  render_id_ = render_id;
}

}  // namespace hippy::devtools
