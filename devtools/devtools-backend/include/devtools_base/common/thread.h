//
// Copyright (c) Tencent Corporation. All rights reserved.
//

#pragma once
#include <atomic>
#include <future>
#include <memory>
#include <string>
#include <thread>

#include "devtools_base/common/macros.h"

namespace tdf::devtools {
inline namespace runner {
class Thread {
 public:
  explicit Thread(const std::string& name = "");

  ~Thread();

  void Start();

  void Join();

  static void SetCurrentThreadName(const std::string& name);

  virtual void Run() = 0;

 private:
  std::string name_;
  std::unique_ptr<std::thread> thread_;

  TDF_BASE_DISALLOW_COPY_AND_ASSIGN(Thread);
};
}  // namespace runner
}  // namespace tdf::devtools
