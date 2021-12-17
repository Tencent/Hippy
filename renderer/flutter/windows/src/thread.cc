//
// Created by Administrator on 2021/9/1.
//

#include "core/base/thread.h"
#include "base/macros.h"
#include "base/thread_util.h"

namespace hippy {
namespace base {

static void* ThreadEntry(void* arg);

Thread::Thread(const Options& options) {
  SetName(options.name());
}

Thread::~Thread() {
  Join();
}

void Thread::Start() {
  thread_ = MK_UP<std::thread>(ThreadEntry, this);
}

void Thread::Join() {
    if (thread_ != nullptr && thread_->joinable() && thread_->get_id() != std::this_thread::get_id()) {
      thread_->join();
    }
}

void Thread::SetName(const char* name) {
  strncpy(name_, name, arraysize(name_));
  name_[arraysize(name_) - 1] = '\0';
}

static void SetThreadName(const char* name) {
  ThreadUtil::SetCurrentThreadName(name);
}

ThreadId Thread::GetCurrent() {
  return ThreadUtil::GetThreadId();
}

static void* ThreadEntry(void* arg) {
  if (arg == nullptr) {
    return nullptr;
  }

  auto* thread = reinterpret_cast<Thread*>(arg);
  SetThreadName(thread->name());
  thread->SetId(Thread::GetCurrent());
  thread->Run();

  return nullptr;
}

}  // namespace base
}  // namespace hippy
