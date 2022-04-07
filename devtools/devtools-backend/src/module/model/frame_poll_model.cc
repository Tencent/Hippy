//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/7/16.
//

#include "module/model/frame_poll_model.h"
#include "api/devtools_backend_service.h"
#include "devtools_base/common/worker_pool.h"
#include "devtools_base/logging.h"

namespace tdf {
namespace devtools {
static constexpr const int32_t kRefreshIntervalMilliSeconds = 500;

FramePollModel::FramePollModel() {
  refresh_task_runner_ = WorkerPool::GetInstance(1)->CreateTaskRunner();
  refresh_task_ = [this]() {
    BACKEND_LOGD(TDF_BACKEND, "refresh_task run");
    if (frame_is_dirty_) {
      if (response_handler_) {
        response_handler_();
      }
      frame_is_dirty_ = false;
    }
    refresh_task_runner_->Clear();
    refresh_task_runner_->PostDelayedTask(refresh_task_, TimeDelta::FromMilliseconds(kRefreshIntervalMilliSeconds));
  };
}

void FramePollModel::StartPoll() {
  AddFrameCallback();
  ScheduleRefreshTimer();
  frame_is_dirty_ = true;
}

void FramePollModel::ScheduleRefreshTimer() {
  refresh_task_runner_->Clear();
  refresh_task_runner_->PostDelayedTask(refresh_task_, TimeDelta::FromMilliseconds(kRefreshIntervalMilliSeconds));
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
  refresh_task_runner_->Clear();
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
  WorkerPool::GetInstance(0)->RemoveTaskRunner(refresh_task_runner_);
}
}  // namespace devtools
}  // namespace tdf
