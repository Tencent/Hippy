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

namespace hippy {
namespace devtools {
/**
 * picture encoder format enum
 */
enum class PicFormat {
  kPng,
  kJpeg,
  kWebp
};

/**
 * @brief 截屏数据请求参数
 */
struct ScreenRequest {
  int32_t quality;
  int32_t req_width;
  int32_t req_height;
  PicFormat encode_format{PicFormat::kJpeg};
};

class ScreenAdapter {
 public:
  using CoreScreenshotCallback = std::function<void(const std::string& image_base64, int32_t width, int32_t height)>;
  virtual ~ScreenAdapter() {}
  /**
   * @brief 获取当前界面截图
   * @param request 请求参数
   * @param callback 回调
   */
  virtual void GetScreenShot(const ScreenRequest& request, CoreScreenshotCallback callback) = 0;

  /**
   * 注册core帧回调
   * @param name 注册key
   * @param callback core每帧绘制后回调
   */
  virtual uint64_t AddPostFrameCallback(std::function<void()> callback) = 0;

  /**
   * 取消注册core帧监听
   * @param name 注册的key
   */
  virtual void RemovePostFrameCallback(uint64_t id) = 0;

  /**
   * 获取屏幕像素比 子类可根据需求实现
   * @return
   */
  virtual double GetScreenScale() { return 1.0f; }
};
}  // namespace devtools
}  // namespace hippy
