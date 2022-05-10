#include "dom/scene_builder.h"

#include "base/logging.h"
#include "core/base/string_view_utils.h"
#include "core/scope.h"

const uint32_t kInvalidListenerId = 0;

namespace hippy {
inline namespace dom {

void SceneBuilder::Create(const std::weak_ptr<DomManager>& dom_manager,
                          std::vector<std::shared_ptr<DomNode>>&& nodes) {
  std::lock_guard<std::mutex> lock(mutex_);

  ops_.emplace_back([dom_manager, move_nodes = std::move(nodes)]() mutable {
    auto manager = dom_manager.lock();
    if (manager) {
      manager->CreateDomNodes(std::move(move_nodes));
    }
  });
}

void SceneBuilder::Update(const std::weak_ptr<DomManager>& dom_manager,
                          std::vector<std::shared_ptr<DomNode>>&& nodes) {
  std::lock_guard<std::mutex> lock(mutex_);

  ops_.emplace_back([dom_manager, move_nodes = std::move(nodes)]() mutable {
    auto manager = dom_manager.lock();
    if (manager) {
      manager->UpdateDomNodes(std::move(move_nodes));
    }
  });
}

void SceneBuilder::Delete(const std::weak_ptr<DomManager>& dom_manager,
                          std::vector<std::shared_ptr<DomNode>>&& nodes) {
  std::lock_guard<std::mutex> lock(mutex_);

  ops_.emplace_back([dom_manager, move_nodes = std::move(nodes)]() mutable {
    auto manager = dom_manager.lock();
    if (manager) {
      manager->DeleteDomNodes(std::move(move_nodes));
    }
  });
}

void SceneBuilder::AddEventListener(const std::weak_ptr<Scope>& weak_scope, const EventListenerInfo& event_listener_info) {
  std::lock_guard<std::mutex> lock(mutex_);

  ops_.emplace_back([weak_scope, event_listener_info]() mutable {
    auto scope = weak_scope.lock();
    if (scope) {
      auto dom_manager = scope->GetDomManager().lock();
      if (dom_manager) {
        uint32_t dom_id = event_listener_info.dom_id;
        std::string event_name = event_listener_info.event_name;
        auto callback = event_listener_info.callback;

        auto listener_id = scope->GetListenerId(dom_id, event_name);
        if (listener_id != kInvalidListenerId) {
          // TODO: 目前hippy上层还不支持绑定多个回调，有更新时先移除老的监听，再绑定新的
          dom_manager->RemoveEventListener(dom_id, event_name, listener_id);
        }

        dom_manager->AddEventListener(
            dom_id, event_name, true,
            [weak_scope, callback](std::shared_ptr<DomEvent>& event) {
              std::shared_ptr<Scope> scope = weak_scope.lock();
              if (scope) {
                auto context = scope->GetContext();
                if (context) {
                  context->RegisterDomEvent(scope, callback, event);
                }
              }
            },
            [weak_scope, dom_id, event_name](const std::shared_ptr<DomArgument>& arg) {
              tdf::base::DomValue dom_value;
              std::shared_ptr<Scope> scope = weak_scope.lock();
              if (scope && arg->ToObject(dom_value) && dom_value.IsUInt32()) {
                scope->AddListener(static_cast<uint32_t>(dom_id), event_name, dom_value.ToUint32Checked());
              }
            });
      }
    }
  });
}

void SceneBuilder::RemoveEventListener(const std::weak_ptr<Scope>& weak_scope,
                                       const EventListenerInfo& event_listener_info) {
  std::lock_guard<std::mutex> lock(mutex_);
  
  ops_.emplace_back([weak_scope, event_listener_info]() mutable {
    uint32_t dom_id = event_listener_info.dom_id;
    std::string event_name = event_listener_info.event_name;
    auto scope = weak_scope.lock();
    if (scope) {
      auto dom_manager = scope->GetDomManager().lock();
      if (dom_manager) {
        auto listener_id = scope->GetListenerId(static_cast<uint32_t>(dom_id), event_name);
        if (listener_id != kInvalidListenerId) {
          // 目前hippy上层还不支持绑定多个回调，有更新时先移除老的监听，再绑定新的
          dom_manager->RemoveEventListener(static_cast<uint32_t>(dom_id), event_name, listener_id);
        }
      }
    }
  });
}

Scene SceneBuilder::Build(const std::weak_ptr<DomManager>& dom_manager) {
  std::lock_guard<std::mutex> lock(mutex_);

  ops_.emplace_back([dom_manager]{
    auto manager = dom_manager.lock();
    if (manager) {
      manager->EndBatch();
    }
  });
  return Scene(std::move(ops_));
}

}
}
