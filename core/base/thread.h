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

#ifndef CORE_BASE_THREAD_H_
#define CORE_BASE_THREAD_H_

#include <pthread.h>

#include "core/base/thread-id.h"

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

 protected:
  char name_[kMaxThreadNameLength];
  int stack_size_;
  pthread_t thread_;

  ThreadId thread_id_;
};

}  // namespace base
}  // namespace hippy

#endif  // CORE_BASE_THREAD_H_
