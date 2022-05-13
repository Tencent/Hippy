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

#include "module/model/frame_poll_model.h"
#include "api/devtools_backend_service.h"
#include "devtools_base/common/macros.h"
#include "devtools_base/common/worker_pool.h"
#include "devtools_base/logging.h"

namespace hippy::devtools {
constexpr int32_t kRefreshIntervalMilliSeconds = 2000;

void FramePollModel::InitTask() {
  refresh_task_runner_ = WorkerPool::GetInstance(1)->CreateTaskRunner();
  refresh_task_ = [DEVTOOLS_WEAK_THIS]() {
    DEVTOOLS_DEFINE_AND_CHECK_SELF(FramePollModel)
    std::lock_guard<std::recursive_mutex> lock(self->mutex_);
    if (self->frame_is_dirty_) {
      if (self->response_handler_) {
        self->response_handler_();
      }
      self->frame_is_dirty_ = false;
    }
    self->refresh_task_runner_->Clear();
    self->refresh_task_runner_->PostDelayedTask(self->refresh_task_,
                                                TimeDelta::FromMilliseconds(kRefreshIntervalMilliSeconds));
  };
}

void FramePollModel::StartPoll() {
  std::lock_guard<std::recursive_mutex> lock(mutex_);
  AddFrameCallback();
  ScheduleRefreshTimer();
  frame_is_dirty_ = true;
}

void FramePollModel::ScheduleRefreshTimer() {
  std::lock_guard<std::recursive_mutex> lock(mutex_);
  refresh_task_runner_->Clear();
  refresh_task_runner_->PostDelayedTask(refresh_task_, TimeDelta::FromMilliseconds(kRefreshIntervalMilliSeconds));
}

void FramePollModel::AddFrameCallback() {
  if (!provider_) {
    BACKEND_LOGE(TDF_BACKEND, "AddFrameCallback provider is null");
    return;
  }
  if (!had_add_frame_callback_) {
    if (provider_->screen_adapter) {
      frame_callback_handler_ = provider_->screen_adapter->AddPostFrameCallback([DEVTOOLS_WEAK_THIS]() {
        DEVTOOLS_DEFINE_AND_CHECK_SELF(FramePollModel)
        std::lock_guard<std::recursive_mutex> lock(self->mutex_);
        self->frame_is_dirty_ = true;
        BACKEND_LOGD(TDF_BACKEND, "AddFrameCallback frame dirty callback");
      });
    }
    had_add_frame_callback_ = true;
  }
}

void FramePollModel::StopPoll() {
  std::lock_guard<std::recursive_mutex> lock(mutex_);
  RemoveFrameCallback();
  frame_is_dirty_ = true;
  refresh_task_runner_->Clear();
}

void FramePollModel::RemoveFrameCallback() {
  std::lock_guard<std::recursive_mutex> lock(mutex_);
  if (had_add_frame_callback_) {
    auto screen_adapter = provider_->screen_adapter;
    if (screen_adapter) {
      screen_adapter->RemovePostFrameCallback(frame_callback_handler_);
    }
    had_add_frame_callback_ = false;
  }
}

FramePollModel::~FramePollModel() {
  RemoveFrameCallback();
  WorkerPool::GetInstance(1)->RemoveTaskRunner(refresh_task_runner_);
}
}  // namespace hippy::devtools
