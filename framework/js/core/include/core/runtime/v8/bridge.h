#pragma once

#include <memory>
#ifdef ENABLE_INSPECTOR
#include "v8/v8-inspector.h"
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
