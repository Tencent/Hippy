#pragma once

#include <stdint.h>
#include "dom/dom_node.h"

namespace hippy {
inline namespace dom {

struct DomEventListenerInfo;

class EventNode {
 public:
  EventNode(uint32_t id, uint32_t pid);
  virtual ~EventNode() = default;

  EventNode(const EventNode& node) = delete;
  EventNode(EventNode&& node) = delete;
  EventNode& operator=(const EventNode& node) = delete;
  EventNode& operator=(EventNode&& node) = delete;

  void SetId(uint32_t id) { id_ = id; }
  uint32_t GetId() { return id_; }

  void SetPid(uint32_t pid) { pid_ = pid; }
  uint32_t GetPid() { return pid_; }

  void SetCaptureListeners(const std::vector<std::shared_ptr<DomEventListenerInfo>> listeners);
  std::vector<DomEventListenerInfo> GetCaptureListeners() { return capture_listeners_; }

  void SetBubbleListeners(const std::vector<std::shared_ptr<DomEventListenerInfo>> listeners);
  std::vector<DomEventListenerInfo> GetBubbleListeners() { return bubble_listeners_; }

 private:
  uint32_t id_;
  uint32_t pid_;
  std::vector<DomEventListenerInfo> capture_listeners_;
  std::vector<DomEventListenerInfo> bubble_listeners_;
};

}  // namespace dom
}  // namespace hippy
