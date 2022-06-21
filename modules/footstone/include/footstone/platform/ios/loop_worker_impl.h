#include "footstone/thread_worker_impl.h"

#include <CoreFoundation/CoreFoundation.h>

namespace footstone {
inline namespace runner {

class LoopWorkerImpl: public Worker {
 public:
  LoopWorkerImpl();
  virtual ~LoopWorkerImpl();

  virtual void RunLoop() override;
  virtual void TerminateWorker() override;
  virtual void Notify() override;
  virtual void WaitFor(const TimeDelta& delta) override;
  virtual void Start() override;
 private:
  static void OnTimerFire(CFRunLoopTimerRef timer, LoopWorkerImpl* loop);

  CFRunLoopTimerRef delayed_wake_timer_;
  CFRunLoopRef loop_;
};

}
}
