#pragma once

#include <cstdint>

namespace voltron {
struct VoltronLayoutContext {
  int32_t engine_id;
  int32_t root_id;
  int32_t node_id;
};
}  // namespace voltron
