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
#include "devtools_base/common/task_runner.h"
#include "module/model/base_model.h"

namespace tdf {
namespace devtools {

/**
 * @brief 定时轮询帧是否有刷新
 */
class FramePollModel : public BaseModel{
 public:
  FramePollModel();
  using ResponseHandler = std::function<void()>;
  void SetResponseHandler(ResponseHandler handler) { response_handler_ = handler; }
  void StartPoll();
  void StopPoll();
  ~FramePollModel();

 private:
  void RemoveFrameCallback();
  void AddFrameCallback();
  void ScheduleRefreshTimer();
  std::mutex mutex_;
  bool had_add_frame_callback_ = false;
  uint64_t frame_callback_handler_;
  ResponseHandler response_handler_;
  bool frame_is_dirty_ = true;
  std::shared_ptr<TaskRunner> refresh_task_runner_;
  std::function<void()> refresh_task_;
};

}  // namespace devtools
}  // namespace tdf
