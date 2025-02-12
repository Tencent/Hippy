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

#include "renderer/virtual/hr_virtual_view.h"

namespace hippy {
inline namespace render {
inline namespace native {

using HippyValueObjectType = footstone::value::HippyValue::HippyValueObjectType;

class HRVirtualViewManager {
public:
  HRVirtualViewManager();
  ~HRVirtualViewManager() = default;
  
  std::shared_ptr<HRVirtualView> CreateVirtualNode(uint32_t root_id, uint32_t id, uint32_t pid, int32_t index, HippyValueObjectType &props);
  void AddVirtualNode(uint32_t id, std::shared_ptr<HRVirtualView> &view);
  void RemoveVirtualNode(uint32_t id);
  std::shared_ptr<HRVirtualView> GetVirtualNode(uint32_t id);
  std::vector<std::shared_ptr<HRVirtualView>> GetVirtualChildrenNode(uint32_t id);
  
private:
  std::map<uint32_t, std::shared_ptr<HRVirtualView>> virtual_views_;
};

} // namespace native
} // namespace render
} // namespace hippy
