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

#if defined(OS_WIN)
#define BASE_USED_ON_EMBEDDER

#include "devtools_base/common/thread.h"

#include <windows.h>

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

// The information on how to set the thread name comes from
// a MSDN article: http://msdn2.microsoft.com/en-us/library/xcb2z8hs.aspx
const DWORD kVCThreadNameException = 0x406D1388;
typedef struct tagTHREADNAME_INFO {
  DWORD dwType;      // Must be 0x1000.
  LPCSTR szName;     // Pointer to name (in user addr space).
  DWORD dwThreadID;  // Thread ID (-1=caller thread).
  DWORD dwFlags;     // Reserved for future use, must be zero.
} THREADNAME_INFO;

void Thread::SetCurrentThreadName(const std::string& name) {
  if (name == "") {
    return;
  }

  THREADNAME_INFO info;
  info.dwType = 0x1000;
  info.szName = name.c_str();
  info.dwThreadID = GetCurrentThreadId();
  info.dwFlags = 0;
  __try {
    RaiseException(kVCThreadNameException, 0, sizeof(info) / sizeof(DWORD),
                   reinterpret_cast<DWORD_PTR*>(&info));
  } __except (EXCEPTION_CONTINUE_EXECUTION) {  // NOLINT
  }
}
}  // namespace runner
}  // namespace hippy::devtools
#endif
