//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
//

#pragma once

#include <memory>
#include <string>
#include "api/adapter/devtools_screen_adapter.h"
#include "module/model/screen_shot_response.h"
#include "module/request/screen_shot_request.h"
#include "module/model/base_model.h"

namespace tdf {
namespace devtools {
using json = nlohmann::json;

/**
 * @brief 截屏数据model
 */
class ScreenShotModel : public BaseModel {
 public:
  ScreenShotModel() : has_set_request_(false) {}
  ~ScreenShotModel() = default;

  using ScreenShotCallback = std::function<void(ScreenShotResponse&& response)>;
  void SetResponseScreenShotCallback(ScreenShotCallback callback) { response_callback_ = callback; }
  void SetSendEventScreenShotCallback(ScreenShotCallback callback) { send_event_callback_ = callback; }

  /**
   * @brief 设置截屏请求参数
   */
  void SetScreenShotRequest(const ScreenShotRequest& req);

  /**
   * @brief 请求截屏数据，用来回包到前端
   */
  void ReqScreenShotToResponse();

  /**
   * @brief 请求截屏数据，用来发送事件到前端
   */
  void ReqScreenShotToSendEvent();

 private:
  /**
   * @brief 请求截屏数据，用来发送事件到前端
   * @param screen_shot_callback 截屏数据返回的回调
   */
  void ReqScreenShot(ScreenAdapter::CoreScreenshotCallback screen_shot_callback);

  bool has_set_request_;  // 是否已经设置过 request_ 属性
  ScreenShotRequest request_;
  ScreenShotCallback response_callback_;    // 截屏回调，用来回包到前端
  ScreenShotCallback send_event_callback_;  // 截屏回调，用来发送事件到前端
};
}  // namespace devtools
}  // namespace tdf
