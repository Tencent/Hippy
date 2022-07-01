#include "footstone/platform/adr/loop_worker_impl.h"

#include <android/looper.h>
#include <sys/timerfd.h>
#include <ctime>

namespace footstone {
inline namespace runner {

static ALooper *AcquireLooperForThread() {
  ALooper *looper = ALooper_forThread();
  if (looper == nullptr) {
    looper = ALooper_prepare(0);
  }
  ALooper_acquire(looper);
  return looper;
}

LoopWorkerImpl::LoopWorkerImpl(bool is_schedulable,
                               std::string name) : Worker(is_schedulable, std::move(name)),
                                                   looper_(AcquireLooperForThread()),
                                                   fd_(timerfd_create(CLOCK_MONOTONIC,TFD_NONBLOCK | TFD_CLOEXEC)),
                                                   has_task_pending_(true) {
  static const int kWakeEvents = ALOOPER_EVENT_INPUT;

  ALooper_callbackFunc cb = [](int, int events, void *data) -> int {
    if (events & kWakeEvents) {
      reinterpret_cast<LoopWorkerImpl *>(data)->OnEventFired();
    }
    return 1;
  };

  ::ALooper_addFd(looper_,
                  fd_,
                  ALOOPER_POLL_CALLBACK,
                  kWakeEvents,
                  cb,
                  this);
}

void LoopWorkerImpl::Start() {}

void LoopWorkerImpl::RunLoop() {
  if (is_exit_immediately_) {
    while (!is_terminated_) {
      int result = ::ALooper_pollOnce(-1, nullptr, nullptr, nullptr);
      if (result == ALOOPER_POLL_TIMEOUT || result == ALOOPER_POLL_ERROR) {
        is_terminated_ = true;
      }
    }
  } else {
    while(!is_terminated_ || has_task_pending_) {
      int result = ::ALooper_pollOnce(-1, nullptr, nullptr, nullptr);
      if (result == ALOOPER_POLL_TIMEOUT || result == ALOOPER_POLL_ERROR) {
        is_terminated_ = true;
      }
    }
  }
}

void LoopWorkerImpl::TerminateWorker() {
  is_terminated_ = true;
}

itimerspec SetItimerspec(uint64_t nano_secs) {
  struct itimerspec spec{};
  spec.it_value.tv_sec = static_cast<time_t>(nano_secs / 1000000000);
  spec.it_value.tv_nsec = static_cast<long>(nano_secs % 1000000000);
  spec.it_interval = spec.it_value;
  return spec;
}

void LoopWorkerImpl::Notify() {
  itimerspec spec = SetItimerspec(1);
  timerfd_settime(fd_, TFD_TIMER_ABSTIME, &spec, nullptr);
}

LoopWorkerImpl::~LoopWorkerImpl() {
  ALooper_removeFd(looper_, fd_);
  ALooper_wake(looper_);
}

void LoopWorkerImpl::WaitFor(const TimeDelta &delta) {
  auto nano_secs = delta.ToNanoseconds();
  if (nano_secs < 1) {
    nano_secs = 1;
  }
  itimerspec spec = SetItimerspec(static_cast<uint64_t>(nano_secs));
  timerfd_settime(fd_, TFD_TIMER_ABSTIME, &spec, nullptr);
}

void LoopWorkerImpl::OnEventFired() {
  has_task_pending_ = RunTask();
}

}
}