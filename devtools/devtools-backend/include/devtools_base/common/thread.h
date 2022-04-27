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
#include <atomic>
#include <future>
#include <memory>
#include <string>
#include <thread>

#include "devtools_base/common/macros.h"

namespace hippy {
namespace devtools {
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
}  // namespace devtools
}  // namespace hippy
