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

#include "dom/layout_node.h"
#include "renderer/components/base_view.h"
#include "renderer/arkui/stack_node.h"

namespace hippy {
inline namespace render {
inline namespace native {

class CustomView : public BaseView {
public:
  CustomView(std::shared_ptr<NativeRenderContext> &ctx);
  ~CustomView();
  
  // 自定义测量方法。只有 HippyViewProvider::RegisterCustomMeasureViews 方法里指定的自定义组件才会调用该方法。
  virtual LayoutSize CustomMeasure(float width, LayoutMeasureMode width_measure_mode,
                                   float height, LayoutMeasureMode height_measure_mode) {
    return {0, 0};
  }
};

} // namespace native
} // namespace render
} // namespace hippy
