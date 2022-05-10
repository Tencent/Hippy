#include "dom/scene_builder.h"

#include "base/logging.h"
#include "core/base/string_view_utils.h"
#include "core/scope.h"

const uint32_t kInvalidDomEventId = 0;

namespace hippy {
inline namespace dom {

void SceneBuilder::Create(const std::weak_ptr<DomManager>& dom_manager, std::vector<std::shared_ptr<DomNode>>&& nodes) {
  std::lock_guard<std::mutex> lock(mutex_);

  ops_.emplace_back([dom_manager, move_nodes = std::move(nodes)]() mutable {
    auto manager = dom_manager.lock();
    if (manager) {
      manager->CreateDomNodes(std::move(move_nodes));
    }
  });
}

void SceneBuilder::Update(const std::weak_ptr<DomManager>& dom_manager, std::vector<std::shared_ptr<DomNode>>&& nodes) {
  std::lock_guard<std::mutex> lock(mutex_);

  ops_.emplace_back([dom_manager, move_nodes = std::move(nodes)]() mutable {
    auto manager = dom_manager.lock();
    if (manager) {
      manager->UpdateDomNodes(std::move(move_nodes));
    }
  });
}

void SceneBuilder::Delete(const std::weak_ptr<DomManager>& dom_manager, std::vector<std::shared_ptr<DomNode>>&& nodes) {
  std::lock_guard<std::mutex> lock(mutex_);

  ops_.emplace_back([dom_manager, move_nodes = std::move(nodes)]() mutable {
    auto manager = dom_manager.lock();
    if (manager) {
      manager->DeleteDomNodes(std::move(move_nodes));
    }
  });
}

void SceneBuilder::AddEventListener(const std::weak_ptr<Scope>& weak_scope,
                                    const EventListenerInfo& event_listener_info) {
  std::lock_guard<std::mutex> lock(mutex_);
  auto scope = weak_scope.lock();
  if (scope) {
    // 是否已经注册了,已经注册了不在注册
    bool added = scope->HasListener(event_listener_info);
    if (added) return;

    ops_.emplace_back([scope, event_listener_info]() mutable {
      auto dom_manager = scope->GetDomManager().lock();
      if (dom_manager) {
        uint32_t dom_id = event_listener_info.dom_id;
        std::string event_name = event_listener_info.event_name;
        const auto js_callback = event_listener_info.callback;

        dom_manager->AddEventListener(
            dom_id, event_name, true,
            [scope, js_callback](std::shared_ptr<DomEvent>& event) {
              auto context = scope->GetContext();
              if (context) {
                context->RegisterDomEvent(scope, js_callback, event);
              }
            },
            [scope, event_listener_info](std::shared_ptr<DomArgument> arg) {
              tdf::base::DomValue dom_value;
              if (arg->ToObject(dom_value) && dom_value.IsUInt32()) {
                uint32_t dom_event_id = dom_value.ToUint32Checked();
                scope->AddListener(event_listener_info, dom_event_id);
              }
            });
      }
    });
  }
}

void SceneBuilder::RemoveEventListener(const std::weak_ptr<Scope>& weak_scope,
                                       const EventListenerInfo& event_listener_info) {
  std::lock_guard<std::mutex> lock(mutex_);
  auto scope = weak_scope.lock();
  if (scope) {
    uint32_t dom_event_id = scope->GetDomEventId(event_listener_info);
    if (dom_event_id == kInvalidDomEventId) return;
    scope->RemoveListener(event_listener_info, dom_event_id);

    ops_.emplace_back([scope, event_listener_info, dom_event_id]() mutable {
      uint32_t dom_id = event_listener_info.dom_id;
      std::string event_name = event_listener_info.event_name;
      auto dom_manager = scope->GetDomManager().lock();
      if (dom_manager) {
        dom_manager->RemoveEventListener(static_cast<uint32_t>(dom_id), event_name, dom_event_id);
      }
    });
  }
}

Scene SceneBuilder::Build(const std::weak_ptr<DomManager>& dom_manager) {
  std::lock_guard<std::mutex> lock(mutex_);

  ops_.emplace_back([dom_manager] {
    auto manager = dom_manager.lock();
    if (manager) {
      manager->EndBatch();
    }
  });
  return Scene(std::move(ops_));
}

}  // namespace dom
}  // namespace hippy
