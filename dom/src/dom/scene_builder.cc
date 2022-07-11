#include "dom/scene_builder.h"

#include "dom/dom_listener.h"

#include "footstone/logging.h"
#include "footstone/string_view_utils.h"

namespace hippy {
inline namespace dom {

void SceneBuilder::Create(const std::weak_ptr<DomManager>& weak_dom_manager,
                          const std::weak_ptr<RootNode>& root_node,
                          std::vector<std::shared_ptr<DomInfo>>&& nodes) {
  auto dom_manager = weak_dom_manager.lock();
  if (dom_manager) {
    dom_manager->CreateDomNodes(root_node, std::move(nodes));
  }
}

void SceneBuilder::Update(const std::weak_ptr<DomManager>& weak_dom_manager,
                          const std::weak_ptr<RootNode>& root_node,
                          std::vector<std::shared_ptr<DomInfo>>&& nodes) {
  auto dom_manager = weak_dom_manager.lock();
  if (dom_manager) {
    dom_manager->UpdateDomNodes(root_node, std::move(nodes));
  }
}

void SceneBuilder::Move(const std::weak_ptr<DomManager>& weak_dom_manager,
                        const std::weak_ptr<RootNode>& root_node,
                        std::vector<std::shared_ptr<DomInfo>>&& nodes) {
  auto dom_manager = weak_dom_manager.lock();
  if (dom_manager) {
    dom_manager->MoveDomNodes(root_node, std::move(nodes));
  }
}

void SceneBuilder::Delete(const std::weak_ptr<DomManager>& weak_dom_manager,
                          const std::weak_ptr<RootNode>& root_node,
                          std::vector<std::shared_ptr<DomInfo>>&& nodes) {
  auto dom_manager = weak_dom_manager.lock();
  if (dom_manager) {
    dom_manager->DeleteDomNodes(root_node, std::move(nodes));
  }
}

void SceneBuilder::AddEventListener(const std::weak_ptr<DomManager>& weak_dom_manager,
                                    const std::weak_ptr<RootNode>& root_node,
                                    const EventListenerInfo& event_listener_info) {
  if (!event_listener_info.IsValid()) {
    return;
  }
  auto dom_manager = weak_dom_manager.lock();
  if (dom_manager) {
    uint32_t dom_id = event_listener_info.dom_id;
    dom_manager->AddEventListener(root_node, dom_id, event_listener_info.event_name,
                                  event_listener_info.listener_id, event_listener_info.use_capture,
                                  event_listener_info.callback);
  }
}

void SceneBuilder::RemoveEventListener(const std::weak_ptr<DomManager>& weak_dom_manager,
                                       const std::weak_ptr<RootNode>& root_node,
                                       const EventListenerInfo& event_listener_info) {
  if (!event_listener_info.IsValid()) {
    return;
  }
  auto dom_manager = weak_dom_manager.lock();
  if (dom_manager) {
    uint32_t dom_id = event_listener_info.dom_id;
    dom_manager->RemoveEventListener(root_node, dom_id, event_listener_info.event_name,
                                     event_listener_info.listener_id);
  }
}

void SceneBuilder::Build(const std::weak_ptr<DomManager>& weak_dom_manager,
                          const std::weak_ptr<RootNode>& root_node) {
  auto dom_manager = weak_dom_manager.lock();
  if (dom_manager) {
    dom_manager->EndBatch(root_node);
  }
}

}  // namespace dom
}  // namespace hippy
