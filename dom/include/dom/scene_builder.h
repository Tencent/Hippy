/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
