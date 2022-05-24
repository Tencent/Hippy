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
#if defined(ANDROID)
#define BASE_USED_ON_EMBEDDER

#include "devtools_base/common/thread.h"
#include <pthread.h>
#include <string>
#include <thread>

namespace hippy::devtools {
inline namespace runner {
Thread::Thread(const std::string& name) : name_(name) {}

void Thread::Start() {
  thread_ = std::make_unique<std::thread>([this]() -> void {
    SetCurrentThreadName(name_);
    Run();
  });
}

Thread::~Thread() {}

void Thread::Join() {
  if (thread_->joinable()) {
    thread_->join();
  }
}

void Thread::SetCurrentThreadName(const std::string& name) {
  if (name.empty()) {
    return;
  }
  pthread_setname_np(pthread_self(), name.c_str());
}
}  // namespace runner
}  // namespace hippy::devtools
#endif
