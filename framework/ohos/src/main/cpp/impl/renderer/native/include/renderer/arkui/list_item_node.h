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

#include "renderer/arkui/arkui_node.h"

namespace hippy {
inline namespace render {
inline namespace native {

class ListItemNodeDelegate {
public:
  virtual ~ListItemNodeDelegate() = default;
  virtual void OnItemVisibleAreaChange(int32_t index, bool isVisible, float currentRatio) {}
};

class ListItemNode : public ArkUINode {
protected:
  ListItemNodeDelegate *listItemNodeDelegate_ = nullptr;
  int32_t itemIndex_ = -1;

public:
  ListItemNode();
  ~ListItemNode();

  void OnNodeEvent(ArkUI_NodeEvent *event) override;
  void SetNodeDelegate(ListItemNodeDelegate *nodeDelegate);
  
  void SetItemIndex(int32_t index) { itemIndex_ = index; }
};

} // namespace native
} // namespace render
} // namespace hippy
