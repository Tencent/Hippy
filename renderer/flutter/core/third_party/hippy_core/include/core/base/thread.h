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

#pragma once

#if defined(_WIN32)
#include <thread>
#include "core/base/macros.h"
typedef uint64_t ThreadId;
#else
#include <pthread.h>
#include "core/base/thread_id.h"
#endif

namespace hippy {
namespace base {

class Thread {
 public:
  class Options {
   public:
    Options() : name_("hippy:<unknown>"), stack_size_(0) {}
    explicit Options(const char* name, int stack_size = 0)
        : name_(name), stack_size_(stack_size) {}

    const char* name() const { return name_; }
    int stack_size() const { return stack_size_; }

   private:
    const char* name_;
    int stack_size_;
  };

 public:
  explicit Thread(const Options& options);
  virtual ~Thread();

  void SetName(const char* name);
  inline ThreadId Id() { return thread_id_; }
  static ThreadId GetCurrent();

  virtual void Run() = 0;
  void Start();
  void Join();

  inline const char* name() const { return name_; }

  static const int kMaxThreadNameLength = 16;

#if defined(_WIN32)
  void SetId(ThreadId thread_id) { thread_id_ = thread_id; };
#endif

 protected:
  char name_[kMaxThreadNameLength];
#if defined(_WIN32)
  UP<std::thread> thread_;
#else
  int stack_size_;
  pthread_t thread_;
#endif
  ThreadId thread_id_;
};

}  // namespace base
}  // namespace hippy
