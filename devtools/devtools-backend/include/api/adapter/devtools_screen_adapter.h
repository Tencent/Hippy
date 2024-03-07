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

#include <chrono>
#include <string>
#include <functional>

namespace hippy::devtools {
/**
 * picture encoder format enum
 */
enum class PicFormat {
  kPng,
  kJpeg,
  kWebp
};

/**
 * @brief Screenshot data request parameters
 */
struct ScreenRequest {
  int32_t quality;
  int32_t req_width;
  int32_t req_height;
  PicFormat encode_format{PicFormat::kJpeg};
};

/**
 * screen shot data adapter,
 * Provide real-time rendering callback capability
 */
class ScreenAdapter {
 public:
  using CoreScreenshotCallback = std::function<void(const std::string& image_base64, int32_t width, int32_t height)>;
  virtual ~ScreenAdapter() {}
  /**
   * @brief Get screenshot data of current interface
   * @param request request body
   * @param callback data callback
   */
  virtual void GetScreenShot(const ScreenRequest& request, CoreScreenshotCallback callback) = 0;

  /**
   * Register page frame callback
   * @param callback post render callback
   * @return register id
   */
  virtual uint64_t AddPostFrameCallback(std::function<void()> callback) = 0;

   /**
    * unregister page frame callback
    * @param id register id
    */
  virtual void RemovePostFrameCallback(uint64_t id) = 0;

  /**
   * Obtain the screen pixel ratio subclass, which can be implemented according to requirements
   * @return scale factor
   */
  virtual double GetScreenScale() { return 1.0f; }

  virtual bool SupportDirtyCallback() {return false; }
};
}  // namespace hippy::devtools
