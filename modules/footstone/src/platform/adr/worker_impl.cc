#include "footstone/worker_impl.h"

#include <pthread.h>

namespace footstone {
inline namespace runner {

void WorkerImpl::SetName(const std::string& name) {
  if (name.empty()) {
    return;
  }
  pthread_setname_np(pthread_self(), name.c_str());
}

}
}
