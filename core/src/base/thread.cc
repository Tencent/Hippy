/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#include "core/base/thread.h"

#include <climits>
#include <cstdio>
#include <cstring>

#include "base/logging.h"
#include "core/base/macros.h"

namespace hippy {
namespace base {

static void* ThreadEntry(void* arg);

Thread::Thread(const Options& options) : stack_size_(options.stack_size()) {
  if (stack_size_ > 0 && static_cast<size_t>(stack_size_) < PTHREAD_STACK_MIN) {
    stack_size_ = PTHREAD_STACK_MIN;
  }

  SetName(options.name());
}

Thread::~Thread() = default;

void Thread::Start() {
  pthread_attr_t attr;
  memset(&attr, 0, sizeof(attr));
  int result = pthread_attr_init(&attr);
  if (result != 0) {
    return;
  }

  size_t stack_size = stack_size_;
  if (stack_size > 0) {
    result = pthread_attr_setstacksize(&attr, stack_size);
    if (result != 0) {
      pthread_attr_destroy(&attr);
      return;
    }
  }

  result = pthread_create(&thread_, &attr, ThreadEntry, this);
  thread_id_.InitId(thread_);
  HIPPY_USE(result);
}

void Thread::Join() const {
  int ret = pthread_join(thread_, nullptr);
  TDF_BASE_DLOG(INFO) << "Thread::Join ret = " << ret;
}

void Thread::SetName(const char* name) {
  strncpy(name_, name, arraysize(name_));
  name_[arraysize(name_) - 1] = '\0';
}

static void SetThreadName(const char* name) {
#ifdef OS_ANDROID
  pthread_setname_np(pthread_self(), name);
#else
  pthread_setname_np(name);
#endif
}

static void* ThreadEntry(void* arg) {
  if (arg == nullptr) {
    return nullptr;
  }

  auto* thread = reinterpret_cast<Thread*>(arg);
  SetThreadName(thread->name());
  thread->Run();

  return nullptr;
}

ThreadId Thread::GetCurrent() {
  return ThreadId::GetCurrent();
}

}  // namespace base
}  // namespace hippy
