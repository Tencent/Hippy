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

#include "renderer/api/hippy_view_provider.h"

namespace hippy {
inline namespace render {
inline namespace native {

static std::map<std::string, CustomViewCreatorFunction> *sHippyCustomViewCreatorMapPtr = nullptr;
static std::set<std::string> *sHippyCustomMeasureViewSetPtr = nullptr;

static std::map<std::string, CustomViewCreatorFunction> sHippyEmptyCustomViewCreatorMap;
static std::set<std::string> sHippyEmptyCustomMeasureViewSet;

void HippyViewProvider::RegisterCustomViewCreator(const std::string &view_name, const CustomViewCreatorFunction &custom_view_creator) {
  static std::map<std::string, CustomViewCreatorFunction> sHippyCustomViewCreatorMap;
  sHippyCustomViewCreatorMapPtr = &sHippyCustomViewCreatorMap;
  if (view_name.length() == 0) {
    return;
  }
  sHippyCustomViewCreatorMap[view_name] = custom_view_creator;
}

void HippyViewProvider::RegisterCustomMeasureViews(const std::vector<std::string> &view_names) {
  static std::set<std::string> sHippyCustomMeasureViewSet;
  sHippyCustomMeasureViewSetPtr = &sHippyCustomMeasureViewSet;
  for (auto name : view_names) {
    sHippyCustomMeasureViewSet.insert(name);
  }
}

std::map<std::string, CustomViewCreatorFunction> &HippyViewProvider::GetCustomViewCreatorMap() {
  return sHippyCustomViewCreatorMapPtr ? *sHippyCustomViewCreatorMapPtr : sHippyEmptyCustomViewCreatorMap;
}

std::set<std::string> &HippyViewProvider::GetCustomMeasureViews() {
  return sHippyCustomMeasureViewSetPtr ? *sHippyCustomMeasureViewSetPtr : sHippyEmptyCustomMeasureViewSet;
}

} // namespace native
} // namespace render
} // namespace hippy