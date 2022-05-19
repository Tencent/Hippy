#pragma once

#include <functional>
#include <vector>
#include <mutex>

#include "dom/dom_manager.h"
#include "dom/dom_node.h"
#include "dom/scene.h"
#include "core/napi/js_native_api_types.h"

class Scope;

namespace hippy {
inline namespace dom {

struct EventListenerInfo {
  uint32_t dom_id;
  std::string event_name;
  std::shared_ptr<hippy::napi::CtxValue> callback;
};
class SceneBuilder {
 public:
  SceneBuilder() = default;
  ~SceneBuilder() = default;

  void Create(const std::weak_ptr<DomManager>& dom_manager, std::vector<std::shared_ptr<DomInfo>>&& nodes);
  void Update(const std::weak_ptr<DomManager>& dom_manager, std::vector<std::shared_ptr<DomInfo>>&& nodes);
  void Move(const std::weak_ptr<DomManager>& dom_manager, std::vector<std::shared_ptr<DomInfo>>&& nodes);
  void Delete(const std::weak_ptr<DomManager>& dom_manager, std::vector<std::shared_ptr<DomInfo>>&& nodes);
  void AddEventListener(const std::weak_ptr<Scope>& weak_scope, const EventListenerInfo& event_listener_info);
  void RemoveEventListener(const std::weak_ptr<Scope>& weak_scope, const EventListenerInfo& event_listener_info);
  Scene Build(const std::weak_ptr<DomManager>& dom_manager);
 private:
  std::vector<std::function<void()>> ops_;
  std::mutex mutex_;
};

}
}
