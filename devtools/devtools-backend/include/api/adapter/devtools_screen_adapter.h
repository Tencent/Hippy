//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/10/15.
//

#pragma once

#include <chrono>
#include <string>

namespace tdf {
namespace devtools {

constexpr const char* kEncodeFormatPNG = "png";
constexpr const char* kEncodeFormatJPEG = "jpeg";
constexpr const char* kEncodeFormatWEBP = "webp";

/**
 * @brief 截屏数据请求参数
 */
struct ScreenRequest {
  int32_t quality;
  int32_t req_width;
  int32_t req_height;
  std::string encode_format;
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
}  // namespace tdf
