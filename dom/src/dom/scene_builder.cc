#include "dom/scene_builder.h"

#include "dom/dom_listener.h"

#include "base/logging.h"
#include "core/base/string_view_utils.h"

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

void SceneBuilder::AddEventListener(const std::weak_ptr<DomManager>& dom_manager,
                                    const std::weak_ptr<RootNode>& root_node,
                                    const EventListenerInfo& event_listener_info) {
  std::lock_guard<std::mutex> lock(mutex_);
  if (!event_listener_info.IsValid()) {
    return;
  }
  ops_.emplace_back([weak_dom_manager = dom_manager, root_node, event_listener_info]() mutable {
    auto dom_manager = weak_dom_manager.lock();
    if (dom_manager) {
      uint32_t dom_id = event_listener_info.dom_id;
      dom_manager->AddEventListener(root_node, dom_id, event_listener_info.event_name,
                                    event_listener_info.listener_id, event_listener_info.use_capture,
                                    event_listener_info.callback);
    }
  });
}

void SceneBuilder::RemoveEventListener(const std::weak_ptr<DomManager>& dom_manager,
                                       const std::weak_ptr<RootNode>& root_node,
                                       const EventListenerInfo& event_listener_info) {
  std::lock_guard<std::mutex> lock(mutex_);
  if (!event_listener_info.IsValid()) {
    return;
  }
  ops_.emplace_back([weak_dom_manager = dom_manager, root_node, event_listener_info]() mutable {
    auto dom_manager = weak_dom_manager.lock();
    if (dom_manager) {
      uint32_t dom_id = event_listener_info.dom_id;
      dom_manager->RemoveEventListener(root_node, dom_id, event_listener_info.event_name,
                                       event_listener_info.listener_id);
    }
  });
}

Scene SceneBuilder::Build(const std::weak_ptr<DomManager>& dom_manager,
                          const std::weak_ptr<RootNode>& root_node) {
  std::lock_guard<std::mutex> lock(mutex_);

  ops_.emplace_back([weak_dom_manager = dom_manager, root_node] {
    auto dom_manager = weak_dom_manager.lock();
    if (dom_manager) {
      dom_manager->EndBatch(root_node);
    }
  });
  return Scene(std::move(ops_));
}

}  // namespace dom
}  // namespace hippy
