//
// Copyright (c) Tencent Corporation. All rights reserved.
//

#pragma once

#include <atomic>
#include <cstdint>
#include <functional>

namespace tdf::devtools {
inline namespace runner {
class Task {
 public:
  Task();
  explicit Task(std::function<void()> unit);
  ~Task() = default;

  inline uint32_t GetId() { return id_; }
  inline void SetExecUnit(std::function<void()> unit) { unit_ = unit; }
  inline void Run() {
    if (unit_) {
      unit_();
    }
  }

 private:
  std::atomic<uint32_t> id_;
  std::function<void()> unit_;  // A unit of work to be processed
};
}  // namespace runner
}  // namespace tdf::devtools
