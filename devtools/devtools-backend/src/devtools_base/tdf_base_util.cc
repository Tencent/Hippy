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

#include "devtools_base/tdf_base_util.h"
#include "api/devtools_backend_service.h"

namespace tdf {
namespace devtools {

double TDFBaseUtil::AddScreenScaleFactor(std::shared_ptr<ScreenAdapter> screen_adapter, double origin_value) {
  if (!screen_adapter) {
    return 1.f;
  }
  return origin_value * screen_adapter->GetScreenScale();
}

double TDFBaseUtil::RemoveScreenScaleFactor(std::shared_ptr<ScreenAdapter> screen_adapter, double origin_value) {
  if (!screen_adapter || screen_adapter->GetScreenScale() == 0) {
    return 1.f;
  }
  return origin_value / screen_adapter->GetScreenScale();
}
}  // namespace devtools
}  // namespace tdf
