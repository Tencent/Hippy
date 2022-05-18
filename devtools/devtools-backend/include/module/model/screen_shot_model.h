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

#include <memory>
#include <string>
#include "api/adapter/devtools_screen_adapter.h"
#include "module/model/base_model.h"
#include "module/model/screen_shot_response.h"
#include "module/request/screen_shot_request.h"

namespace hippy::devtools {

/**
 * @brief screenshot model
 */
class ScreenShotModel : public BaseModel, public std::enable_shared_from_this<ScreenShotModel> {
 public:
  ScreenShotModel() : has_set_request_(false) {}

  using ScreenShotCallback = std::function<void(const ScreenShotResponse& response)>;
  void SetResponseScreenShotCallback(ScreenShotCallback callback) { response_callback_ = callback; }
  void SetSendEventScreenShotCallback(ScreenShotCallback callback) { send_event_callback_ = callback; }

  /**
   * @brief set screenshot request params
   * @param req model
   */
  void SetScreenShotRequest(const ScreenShotRequest& req);

  /**
   * @brief response screenshot result
   */
  void ReqScreenShotToResponse();

  /**
   * @brief request screenshot and response
   */
  void ReqScreenShotToSendEvent();

 private:
  void ReqScreenShot(ScreenAdapter::CoreScreenshotCallback screen_shot_callback);

  bool has_set_request_;
  ScreenShotRequest request_;
  ScreenShotCallback response_callback_;
  ScreenShotCallback send_event_callback_;
  std::recursive_mutex mutex_;
};
}  // namespace hippy::devtools
