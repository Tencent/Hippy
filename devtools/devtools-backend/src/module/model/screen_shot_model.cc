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

#include "module/model/screen_shot_model.h"
#include "api/devtools_backend_service.h"
#include "devtools_base/logging.h"
#include "devtools_base/transform_string_util.hpp"
#include "module/inspect_props.h"

namespace hippy::devtools {
void ScreenShotModel::SetScreenShotRequest(const ScreenShotRequest &req) {
  request_ = req;
  has_set_request_ = true;
}

void ScreenShotModel::ReqScreenShotToResponse() {
  auto screen_shot_callback = [this](const std::string &image_base64, int32_t width, int32_t height) {
    if (response_callback_) {
      response_callback_(ScreenShotResponse(image_base64, width, height));
    }
    BACKEND_LOGD(TDF_BACKEND, "ScreenShotModel ReqScreenShotToResponse end");
  };
  ReqScreenShot(screen_shot_callback);
}

void ScreenShotModel::ReqScreenShotToSendEvent() {
  auto screen_shot_callback = [this](const std::string &image_base64, int32_t width, int32_t height) {
    if (send_event_callback_) {
      send_event_callback_(ScreenShotResponse(image_base64, width, height));
    }
    BACKEND_LOGD(TDF_BACKEND, "ScreenShotModel ReqScreenShotToSendEvent end");
  };
  ReqScreenShot(screen_shot_callback);
}

void ScreenShotModel::ReqScreenShot(ScreenAdapter::CoreScreenshotCallback screen_shot_callback) {
  if (!has_set_request_) {
    return;
  }
  if (!provider_) {
    BACKEND_LOGE(TDF_BACKEND, "ScreenShotModel provider is null");
    return;
  }
  BACKEND_LOGD(TDF_BACKEND, "ScreenShotModel ReqScreenShot start");
  auto screen_adapter = provider_->screen_adapter;
  if (!screen_adapter) {
    return;
  }
  screen_adapter->GetScreenShot(
      {request_.GetQuality(), request_.GetMaxWidth(), request_.GetMaxHeight()},
      screen_shot_callback);
}
}  // namespace devtools::devtools
