#include <thread>

#include "footstone/worker.h"

namespace footstone {
inline namespace runner {

class ThreadWorker: public Worker {
 public:
  ThreadWorker(bool is_schedulable, std::string name = "");
  virtual ~ThreadWorker();

 protected:
  virtual void Start() override;
  virtual void RunLoop() override;
  virtual void TerminateWorker() override;
  virtual void Notify() override;
  virtual void WaitFor(const TimeDelta& delta) override;
  virtual void Join();
  virtual void SetName(const std::string& name) = 0;

 private:
  std::thread thread_;
  std::condition_variable cv_;
  std::mutex mutex_; // 任意PV操作和终止判断一体，不可打断，否则会出现先Notify再Wait，线程永远无法退出
};

}
}
