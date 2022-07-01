#include "dom/scene_builder.h"

#include "dom/dom_listener.h"

#include "footstone/logging.h"
#include "footstone/string_view_utils.h"
#include "core/scope.h"

const uint64_t kInvalidListenerId = 0;

namespace hippy {
inline namespace dom {

void SceneBuilder::Create(const std::weak_ptr<DomManager>& dom_manager,
                          const std::weak_ptr<RootNode>& root_node,
                          std::vector<std::shared_ptr<DomInfo>>&& nodes) {
  std::lock_guard<std::mutex> lock(mutex_);

  ops_.emplace_back([dom_manager, root_node, move_nodes = std::move(nodes)]() mutable {
    auto manager = dom_manager.lock();
    if (manager) {
      manager->CreateDomNodes(root_node, std::move(move_nodes));
    }
  });
}

void SceneBuilder::Update(const std::weak_ptr<DomManager>& dom_manager,
                          const std::weak_ptr<RootNode>& root_node,
                          std::vector<std::shared_ptr<DomInfo>>&& nodes) {
  std::lock_guard<std::mutex> lock(mutex_);

  ops_.emplace_back([dom_manager, root_node, move_nodes = std::move(nodes)]() mutable {
    auto manager = dom_manager.lock();
    if (manager) {
      manager->UpdateDomNodes(root_node, std::move(move_nodes));
    }
  });
}

void SceneBuilder::Move(const std::weak_ptr<DomManager>& dom_manager,
                        const std::weak_ptr<RootNode>& root_node,
                        std::vector<std::shared_ptr<DomInfo>>&& nodes) {
  std::lock_guard<std::mutex> lock(mutex_);

  ops_.emplace_back([dom_manager, root_node, move_nodes = std::move(nodes)]() mutable {
    auto manager = dom_manager.lock();
    if (manager) {
      manager->MoveDomNodes(root_node, std::move(move_nodes));
    }
  });
}

void SceneBuilder::Delete(const std::weak_ptr<DomManager>& dom_manager,
                          const std::weak_ptr<RootNode>& root_node,
                          std::vector<std::shared_ptr<DomInfo>>&& nodes) {
  std::lock_guard<std::mutex> lock(mutex_);

  ops_.emplace_back([dom_manager, root_node, move_nodes = std::move(nodes)]() mutable {
    auto manager = dom_manager.lock();
    if (manager) {
      manager->DeleteDomNodes(root_node, std::move(move_nodes));
    }
  });
}

void SceneBuilder::AddEventListener(const std::weak_ptr<Scope>& weak_scope,
                                    const EventListenerInfo& event_listener_info) {
  std::lock_guard<std::mutex> lock(mutex_);
  auto scope = weak_scope.lock();
  if (scope == nullptr) return;
  // 是否已经注册了,已经注册了不在注册
  bool added = scope->HasListener(event_listener_info);
  if (added) return;
  uint64_t listener_id = hippy::dom::FetchListenerId();
  scope->AddListener(event_listener_info, listener_id);

  ops_.emplace_back([weak_scope, event_listener_info, listener_id]() mutable {
    auto scope = weak_scope.lock();
    if (scope == nullptr) return;

    auto dom_manager = scope->GetDomManager().lock();
    if (dom_manager) {
      uint32_t dom_id = event_listener_info.dom_id;
      std::string event_name = event_listener_info.event_name;
      bool use_capture = event_listener_info.use_capture;
      const auto js_callback = event_listener_info.callback;
      auto root_node = scope->GetRootNode();


      dom_manager->AddEventListener(root_node,
          dom_id, event_name, listener_id, use_capture,
          [weak_scope, js_callback](std::shared_ptr<DomEvent>& event) {
            auto scope = weak_scope.lock();
            if (scope == nullptr) return;
            auto context = scope->GetContext();
            if (context) {
              context->RegisterDomEvent(scope, js_callback, event);
            }
          });
    }
  });
}

void SceneBuilder::RemoveEventListener(const std::weak_ptr<Scope>& weak_scope,
                                       const EventListenerInfo& event_listener_info) {
  std::lock_guard<std::mutex> lock(mutex_);
  auto scope = weak_scope.lock();
  if (scope == nullptr) return;

  uint64_t listener_id = scope->GetListenerId(event_listener_info);
  if (listener_id == kInvalidListenerId) return;
  scope->RemoveListener(event_listener_info, listener_id);

  ops_.emplace_back([weak_scope, event_listener_info, listener_id]() mutable {
    auto scope = weak_scope.lock();
    if (scope == nullptr) return;

    uint32_t dom_id = event_listener_info.dom_id;
    std::string event_name = event_listener_info.event_name;
    auto dom_manager = scope->GetDomManager().lock();
    if (dom_manager) {
      dom_manager->RemoveEventListener(scope->GetRootNode(), dom_id, event_name, listener_id);
    }
  });
}

Scene SceneBuilder::Build(const std::weak_ptr<Scope>& weak_scope,
                          const std::weak_ptr<DomManager>& dom_manager) {
  std::lock_guard<std::mutex> lock(mutex_);

  ops_.emplace_back([weak_scope, dom_manager] {
    auto scope = weak_scope.lock();
    auto manager = dom_manager.lock();
    if (manager && scope) {
      manager->EndBatch(scope->GetRootNode());
    }
  });
  return Scene(std::move(ops_));
}

}  // namespace dom
}  // namespace hippy
