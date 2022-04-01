//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by ivanfanwu on 2021/7/16.
//

#include "module/model/frame_poll_model.h"
#include "api/devtools_backend_service.h"
#include "devtools_base/logging.h"

namespace tdf {
namespace devtools {
static constexpr const int32_t kRefreshIntervalMilliSeconds = 1000;

void FramePollModel::StartPoll() {
  AddFrameCallback();
  ScheduleRefreshTimer();
  frame_is_dirty_ = true;
}

void FramePollModel::ScheduleRefreshTimer() {
  if (refresh_timer_ != nullptr) {
    refresh_timer_->Stop();
    refresh_timer_.release();
  }
  refresh_timer_ = std::make_unique<Timer>(
      [this]() {
        if (frame_is_dirty_) {
          if (response_handler_) {
            response_handler_();
          }
          frame_is_dirty_ = false;
        }
      },
      std::chrono::milliseconds(kRefreshIntervalMilliSeconds));
  refresh_timer_->Start();
}

void FramePollModel::AddFrameCallback() {
  if (!had_add_frame_callback_) {
    if (!provider_) {
      BACKEND_LOGE(TDF_BACKEND, "AddFrameCallback provider is null");
      return;
    }
    auto screen_adapter = provider_->GetScreenAdapter();
    if (screen_adapter) {
      auto frame_callback = [this]() {
        frame_is_dirty_ = true;
        BACKEND_LOGD(TDF_BACKEND, "AddFrameCallback on postFrameCallBack");
      };
      frame_callback_handler_ = screen_adapter->AddPostFrameCallback(frame_callback);
    }
    had_add_frame_callback_ = true;
  }
}

void FramePollModel::StopPoll() {
  RemoveFrameCallback();
  frame_is_dirty_ = true;
  if (refresh_timer_) {
    refresh_timer_->Stop();
  }
}

void FramePollModel::RemoveFrameCallback() {
  std::lock_guard<std::mutex> lock(mutex_);
  if (had_add_frame_callback_) {
    auto screen_adapter = provider_->GetScreenAdapter();
    if (screen_adapter) {
      screen_adapter->RemovePostFrameCallback(frame_callback_handler_);
    }
    had_add_frame_callback_ = false;
  }
}

FramePollModel::~FramePollModel() {
  RemoveFrameCallback();
  if (refresh_timer_) {
    refresh_timer_->Stop();
  }
}

}  // namespace devtools
}  // namespace tdf
