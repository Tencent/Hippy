#include "atomic/atomic_unique_id.h"

#include <atomic>

namespace modules {
inline namespace atomic {
static std::atomic<uint32_t> unique_render_manager_id{0};

uint32_t FetchAddUniqueRenderManagerId() { return unique_render_manager_id.fetch_add(1); }
}  // namespace atomic
}  // namespace modules
