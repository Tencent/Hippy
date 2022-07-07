#include "dom/event_node.h"

namespace hippy {
inline namespace dom {

EventNode::EventNode(uint32_t id, uint32_t pid) : id_(id), pid_(pid) {}

void EventNode::SetCaptureListeners(const std::vector<std::shared_ptr<DomEventListenerInfo>> listeners) {
  for (const auto& listener : listeners) {
    FOOTSTONE_DCHECK(listener != nullptr);
    DomEventListenerInfo info = DomEventListenerInfo(listener->id, listener->cb);
    capture_listeners_.push_back(info);
  }
}

void EventNode::SetBubbleListeners(const std::vector<std::shared_ptr<DomEventListenerInfo>> listeners) {
  for (const auto& listener : listeners) {
    FOOTSTONE_DCHECK(listener != nullptr);
    DomEventListenerInfo info = DomEventListenerInfo(listener->id, listener->cb);
    bubble_listeners_.push_back(info);
  }
}

}  // namespace dom
}  // namespace hippy
