/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#pragma once

#include <sys/types.h>
#include <vector>
#include "dom/root_node.h"

namespace hippy {
inline namespace render {
inline namespace native {

using HippyValueObjectType = footstone::value::HippyValue::HippyValueObjectType;

class HRVirtualView {
public:
  uint32_t root_id_ = 0;
  uint32_t id_ = 0;
  uint32_t pid_ = 0;
  int32_t index_ = -1;
  bool dirty_ = false;
  std::vector<std::shared_ptr<HRVirtualView>> children_;
  std::weak_ptr<HRVirtualView> parent_;
  HippyValueObjectType props_;
  std::string view_name_;
};

} // namespace native
} // namespace render
} // namespace hippy
