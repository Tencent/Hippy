#include "footstone/worker.h"

#include <android/looper.h>

namespace footstone {
inline namespace runner {

class LoopWorkerImpl: public Worker {
 public:
  LoopWorkerImpl(bool is_schedulable = true, std::string name = "");
  virtual ~LoopWorkerImpl();

  virtual void RunLoop() override;
  virtual void TerminateWorker() override;
  virtual void Notify() override;
  virtual void WaitFor(const TimeDelta& delta) override;
  virtual void Start() override;

 private:
  void OnEventFired();

  ALooper* looper_;
  int32_t fd_;
  bool has_task_pending_;
};

}
}