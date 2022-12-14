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
#include "footstone/macros.h"
#include "module/util/transform_string_util.h"
#include "footstone/logging.h"
#include "module/inspect_props.h"

namespace hippy::devtools {
void ScreenShotModel::SetScreenShotRequest(const ScreenShotRequest &req) {
  request_ = req;
  has_set_request_ = true;
}

void ScreenShotModel::ReqScreenShotToResponse() {
  ReqScreenShot([WEAK_THIS, response_callback = response_callback_](const std::string &image, int32_t width,
                                                                             int32_t height) {
    DEFINE_AND_CHECK_SELF(ScreenShotModel)
    if (response_callback) {
      response_callback(ScreenShotResponse(image, width, height));
    }
    FOOTSTONE_DLOG(INFO) << kDevToolsTag << "ScreenShotModel ReqScreenShotToResponse end";
  });
}

void ScreenShotModel::ReqScreenShotToSendEvent() {
  ReqScreenShot([WEAK_THIS, event_callback = send_event_callback_](const std::string &image_base64,
                                                                            int32_t width, int32_t height) {
    DEFINE_AND_CHECK_SELF(ScreenShotModel)
    if (event_callback) {
      event_callback(ScreenShotResponse(image_base64, width, height));
    }
    FOOTSTONE_DLOG(INFO) << kDevToolsTag << "ScreenShotModel ReqScreenShotToSendEvent end";
  });
}

void ScreenShotModel::ReqScreenShot(ScreenAdapter::CoreScreenshotCallback screen_shot_callback) {
  std::lock_guard<std::recursive_mutex> lock(mutex_);
  if (!has_set_request_) {
    return;
  }
  if (!provider_) {
    FOOTSTONE_DLOG(ERROR) << kDevToolsTag << "ScreenShotModel provider is null";
    return;
  }
  auto screen_adapter = provider_->screen_adapter;
  if (!screen_adapter) {
    return;
  }
  screen_adapter->GetScreenShot({request_.GetQuality(), request_.GetMaxWidth(), request_.GetMaxHeight()},
                                screen_shot_callback);
}
}  // namespace hippy::devtools
