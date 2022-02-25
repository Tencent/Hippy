#pragma once

#include <memory>
#ifdef ENABLE_INSPECTOR
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wconversion"
#include "v8/v8-inspector.h"
#pragma clang diagnostic pop
#endif

namespace hippy {

class Bridge {
 public:
  Bridge() = default;
  virtual ~Bridge() = default;

#ifdef ENABLE_INSPECTOR
  virtual void SendResponse(std::unique_ptr<v8_inspector::StringBuffer> message) = 0;
  virtual void SendNotification(std::unique_ptr<v8_inspector::StringBuffer> message) = 0;
#endif
};

}
