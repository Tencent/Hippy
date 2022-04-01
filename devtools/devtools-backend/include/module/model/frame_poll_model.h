//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
//

#pragma once

#include <memory>
#include <string>
#include "tunnel/timer.h"
#include "module/model/base_model.h"

namespace tdf {
namespace devtools {

/**
 * @brief 定时轮询帧是否有刷新
 */
class FramePollModel : public BaseModel{
 public:
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
  std::unique_ptr<Timer> refresh_timer_;
};

}  // namespace devtools
}  // namespace tdf
