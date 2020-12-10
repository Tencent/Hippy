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

#include "core/base/thread_id.h"

#include "core/base/logging.h"

namespace hippy {
namespace base {

pthread_t ThreadId::kInvalidId = 0;

ThreadId::~ThreadId() {}

void ThreadId::InitId(pthread_t id) {
  if (id_ != kInvalidId) {
    return;
  }

  HIPPY_CHECK(id != (pthread_t)(0));
  id_ = id;
}

ThreadId ThreadId::GetCurrent() {
  ThreadId id;
  pthread_t tid = pthread_self();
  id.InitId(tid);
  return id;
}

}  // namespace base
}  // namespace hippy
