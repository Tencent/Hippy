#pragma once

#include <atomic>
#include <cstdint>
#include <functional>

#include "time_delta.h"

namespace footstone {
inline namespace runner {

class IdleTask {
 public:
  struct IdleCbParam {
    bool did_time_out;
    TimeDelta res_time;
  };
  IdleTask();
  IdleTask(std::function<void(const IdleCbParam &)> unit);
  ~IdleTask() = default;

  inline uint32_t GetId() { return id_; }
  inline auto GetUnit() { return unit_; }
  inline void SetUnit(std::function<void(const IdleCbParam &)> unit) { unit_ = unit; }
  inline void Run(const IdleCbParam &param) {
    if (unit_) {
      unit_(param);
    }
  }

 private:
  uint32_t id_;
  std::function<void(const IdleCbParam &)> unit_;  // A unit of work to be processed
};

}
}
