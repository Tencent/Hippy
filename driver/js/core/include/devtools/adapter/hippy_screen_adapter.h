//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/10/15.
//

#pragma once

#include <string>

#include "api/adapter/devtools_screen_adapter.h"

namespace hippy {
namespace devtools {
class HippyScreenAdapter : public tdf::devtools::ScreenAdapter {
 public:
  explicit HippyScreenAdapter(int32_t dom_id) : dom_id_(dom_id) {}

  void GetScreenShot(const tdf::devtools::ScreenRequest& request, CoreScreenshotCallback callback) override;

  uint64_t AddPostFrameCallback(std::function<void()> callback) override;

  void RemovePostFrameCallback(uint64_t id) override;

  double GetScreenScale() override { return screen_scale_; }

 private:
  int32_t dom_id_;
  int32_t frame_callback_id_;
  double screen_scale_ = 1.0f;
};
}  // namespace devtools
}  // namespace hippy
