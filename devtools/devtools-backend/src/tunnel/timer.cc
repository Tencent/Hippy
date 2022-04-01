//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by jerrylei on 2021/8/13
//

#include "tunnel/timer.h"

namespace tdf {
namespace devtools {

Timer::Timer(const Timer::Timeout &timeout, const std::chrono::milliseconds &interval)
    : interval_(interval), timeout_(timeout) {
  std::thread(&Timer::ThreadRun, this).detach();
}

void Timer::Start() {
  this->running_ = true;
}

void Timer::Stop() {
  this->running_ = false;
}

void Timer::ThreadRun() { this->SleepThenTimeout(); }

void Timer::SleepThenTimeout() {
  std::this_thread::sleep_for(interval_);
  if (this->IsRunning()) {
    this->timeout_();
    this->SleepThenTimeout();
  }
}

bool Timer::IsRunning() const {
  return this->running_;
}
}  // namespace devtools
}  // namespace tdf
