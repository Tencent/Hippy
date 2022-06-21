#include "footstone/thread_worker.h"

#include <thread>

namespace footstone {
inline namespace runner {

class ThreadWorkerImpl: public ThreadWorker {
 public:
  ThreadWorkerImpl(bool is_schedulable = true, std::string name = ""):
    ThreadWorker(is_schedulable, std::move(name)) {}
  virtual void SetName(const std::string& name) override;
};

}
}