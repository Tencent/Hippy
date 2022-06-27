#pragma once

#include <functional>
#include <vector>
#include <mutex>

#include "dom/dom_manager.h"
#include "dom/dom_node.h"
#include "dom/scene.h"
#include "core/napi/js_native_api_types.h"

namespace hippy {
inline namespace dom {

struct EventListenerInfo {
  static constexpr uint64_t kInvalidListenerId = 0;

  uint32_t dom_id;
  std::string event_name;
  bool use_capture;
  uint64_t listener_id;
  EventCallback callback;

  bool IsValid() const { return listener_id != kInvalidListenerId; }
};
class SceneBuilder {
 public:
  SceneBuilder() = default;
  ~SceneBuilder() = default;

  void Create(const std::weak_ptr<DomManager>& dom_manager,
              const std::weak_ptr<RootNode>& root_node,
              std::vector<std::shared_ptr<DomInfo>>&& nodes);
  void Update(const std::weak_ptr<DomManager>& dom_manager,
              const std::weak_ptr<RootNode>& root_node,
              std::vector<std::shared_ptr<DomInfo>>&& nodes);
  void Move(const std::weak_ptr<DomManager>& dom_manager,
            const std::weak_ptr<RootNode>& root_node,
            std::vector<std::shared_ptr<DomInfo>>&& nodes);
  void Delete(const std::weak_ptr<DomManager>& dom_manager,
              const std::weak_ptr<RootNode>& root_node,
              std::vector<std::shared_ptr<DomInfo>>&& nodes);
  void AddEventListener(const std::weak_ptr<DomManager>& dom_manager,
                        const std::weak_ptr<RootNode>& root_node,
                        const EventListenerInfo& event_listener_info);
  void RemoveEventListener(const std::weak_ptr<DomManager>& dom_manager,
                           const std::weak_ptr<RootNode>& root_node,
                           const EventListenerInfo& event_listener_info);
  Scene Build(const std::weak_ptr<DomManager>& dom_manager,
              const std::weak_ptr<RootNode>& root_node);
 private:
  std::vector<std::function<void()>> ops_;
  std::mutex mutex_;
};

}
}
