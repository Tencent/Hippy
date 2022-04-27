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

#pragma once

#include <string>

#include "api/adapter/devtools_screen_adapter.h"

namespace hippy {
namespace devtools {
class HippyScreenAdapter : public hippy::devtools::ScreenAdapter {
 public:
  explicit HippyScreenAdapter(int32_t dom_id) : dom_id_(dom_id) {}

  void GetScreenShot(const hippy::devtools::ScreenRequest& request, CoreScreenshotCallback callback) override;

  uint64_t AddPostFrameCallback(std::function<void()> callback) override;

  void RemovePostFrameCallback(uint64_t id) override;

  double GetScreenScale() override { return screen_scale; }

 private:
  int32_t dom_id_;
  int32_t frame_callback_id_;
  static double screen_scale;
};
}  // namespace devtools
}  // namespace hippy
