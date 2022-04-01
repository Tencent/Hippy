//
// Copyright (c) Tencent Corporation. All rights reserved.
//

#if defined(OS_WIN)
#define BASE_USED_ON_EMBEDDER

#include "devtools_base/common/thread.h"

#include <windows.h>

#include <string>
#include <thread>

namespace tdf::devtools {
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
}  // namespace tdf::devtools
#endif
