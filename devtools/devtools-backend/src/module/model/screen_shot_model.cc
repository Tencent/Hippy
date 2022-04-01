//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by sicilyliu on 2021/12/8.
//

#include "module/model/screen_shot_model.h"
#include "api/devtools_backend_service.h"
#include "devtools_base/logging.h"
#include "devtools_base/transform_string_util.hpp"
#include "module/inspect_props.h"

namespace tdf {
namespace devtools {

void ScreenShotModel::SetScreenShotRequest(const ScreenShotRequest &req) {
  request_ = req;
  has_set_request_ = true;
}

void ScreenShotModel::ReqScreenShotToResponse() {
  auto screen_shot_callback = [this](const std::string &image_base64, int32_t width, int32_t height) {
    if (response_callback_) {
      response_callback_(ScreenShotResponse(std::move(image_base64), width, height));
    }
    BACKEND_LOGD(TDF_BACKEND, "ScreenShotModel ReqScreenShotToResponse end");
  };
  ReqScreenShot(screen_shot_callback);
}

void ScreenShotModel::ReqScreenShotToSendEvent() {
  auto screen_shot_callback = [this](const std::string &image_base64, int32_t width, int32_t height) {
    if (send_event_callback_) {
      send_event_callback_(ScreenShotResponse(std::move(image_base64), width, height));
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
  auto screen_adapter = provider_->GetScreenAdapter();
  if (!screen_adapter) {
    return;
  }
  screen_adapter->GetScreenShot(
      {request_.GetQuality(), request_.GetMaxWidth(), request_.GetMaxHeight(), request_.GetFormat()},
      screen_shot_callback);
}

}  // namespace devtools
}  // namespace tdf
