#include "dom/dom_listener.h"

namespace hippy {
inline namespace dom {

static std::atomic<uint64_t> global_listener_id{1};

uint64_t FetchListenerId() { return global_listener_id.fetch_add(1); }

}  // namespace dom
}  // namespace hippy
