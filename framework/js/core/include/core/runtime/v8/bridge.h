#pragma once

#include <memory>
#include "v8/v8-inspector.h"

namespace hippy {

class Bridge {
 public:
  Bridge() = default;
  virtual ~Bridge() = default;

  virtual void SendResponse(std::unique_ptr<v8_inspector::StringBuffer> message) = 0;
  virtual void SendNotification(std::unique_ptr<v8_inspector::StringBuffer> message) = 0;
};

}
