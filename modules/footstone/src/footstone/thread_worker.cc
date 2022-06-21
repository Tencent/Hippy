#include "footstone/thread_worker.h"

#include <utility>

namespace footstone {
inline namespace runner {

ThreadWorker::ThreadWorker(bool is_schedulable,
                           std::string name): Worker(is_schedulable, std::move(name)), thread_() {

}

ThreadWorker::~ThreadWorker() = default;

void ThreadWorker::Start() {
  thread_ = std::thread([this]() -> void {
    SetName(name_);
    Run();
  });
}

void ThreadWorker::RunLoop() {
  if (is_exit_immediately_) {
    while (!is_terminated_) {
      RunTask();
    }
  } else {
    while (RunTask()) {}
  }
}

void ThreadWorker::TerminateWorker() {
  {
    std::unique_lock<std::mutex> lock(mutex_);
    if (is_terminated_) {
      return;
    }
    is_terminated_ = true;
    Notify();
  }
  Join();
}

void ThreadWorker::Notify() {
  cv_.notify_one();
}

void ThreadWorker::WaitFor(const TimeDelta& delta) {
  std::unique_lock<std::mutex> lock(mutex_);
  if (is_terminated_) {
    return;
  }
  if (delta != TimeDelta::Max() && delta != TimeDelta::Zero()) {
    cv_.wait_for(lock, std::chrono::nanoseconds(delta.ToNanoseconds()));
  } else {
    cv_.wait(lock);
  }
}

void ThreadWorker::Join() {
  if (thread_.get_id() == std::this_thread::get_id()) {
    return;
  }
  if (thread_.joinable()) {
    thread_.join();
  }
}

}
}