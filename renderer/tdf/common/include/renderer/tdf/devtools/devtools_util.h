/**
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

#pragma once

#include "renderer/tdf/viewnode/view_node.h"
#include "renderer/tdf/viewnode/root_view_node.h"

namespace hippy {
inline namespace render {
inline namespace tdf {
inline namespace devtools {

class DevtoolsUtil {
 public:
  static void CallDevtoolsFunction(const std::weak_ptr<RootViewNode>&,
                                   const std::shared_ptr<ViewNode>&,
                                   const std::string& name,
                                   const DomArgument& param,
                                   const uint32_t call_back_id);

  static void GetScreenshot(const std::weak_ptr<RootViewNode>&,
                            const std::shared_ptr<ViewNode>&,
                            const std::string& name,
                            const DomArgument& param,
                            const uint32_t call_back_id);
};
}  // namespace devtools
}  // namespace tdf
}  // namespace render
}  // namespace hippy
