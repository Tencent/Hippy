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
#include "../include/example_view_a.h"
#include "../include/example_view_b.h"

namespace hippy {
inline namespace render {
inline namespace native {

auto RegisterCustomViewCreatorsOnLoad = []() {
  HippyViewProvider::RegisterCustomViewCreator("ExampleViewA", [](std::shared_ptr<NativeRenderContext> &ctx) -> std::shared_ptr<BaseView> {
    return std::make_shared<ExampleViewA>(ctx);
  });
  HippyViewProvider::RegisterCustomViewCreator("ExampleViewB", [](std::shared_ptr<NativeRenderContext> &ctx) -> std::shared_ptr<BaseView> {
    return std::make_shared<ExampleViewB>(ctx);
  });
  HippyViewProvider::RegisterCustomMeasureViews({"ExampleViewB"});
  return 0;
}();

} // namespace native
} // namespace render
} // namespace hippy
