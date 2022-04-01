//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by jerrylei on 2021/8/13
//

#pragma once

#include <atomic>
#include <chrono>
#include <functional>
#include <thread>

namespace tdf {
namespace devtools {
class Timer {
 public:
  typedef std::function<void(void)> Timeout;
  Timeout timeout_ = nullptr;
  Timer(const Timeout &timeout, const std::chrono::milliseconds &interval);

  void Start();
  void Stop();
  bool IsRunning() const;

 private:
  std::atomic<bool> running_ = false;
  std::chrono::milliseconds interval_ = std::chrono::milliseconds(1000);

  void ThreadRun();
  void SleepThenTimeout();
  void SetRunning(bool running);
};

}  // namespace devtools
}  // namespace tdf
