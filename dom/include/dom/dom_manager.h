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

#include <cstdint>
#include <future>
#include <map>
#include <memory>
#include <vector>

#include "footstone/logging.h"
#include "footstone/macros.h"
#include "footstone/task_runner.h"
#include "footstone/worker_manager.h"
#include "dom/animation/animation_manager.h"
#include "dom/dom_action_interceptor.h"
#include "dom/dom_argument.h"
#include "dom/dom_event.h"
#include "dom/dom_listener.h"
#include "footstone/hippy_value.h"
#include "dom/layout_node.h"
#include "dom/scene.h"

namespace hippy {
inline namespace dom {

class AnimationManager;
class DomNode;
class RenderManager;
class RootNode;
class LayerOptimizedRenderManager;

struct DomInfo;

// This class is used to mainpulate dom. Please note that the member
// function of this class must be run in dom thread. If you want to call
// in other thread please use PostTask.
// Example:
//    std::vector<std::function<void()>> ops;
//    ops.emplace_back([]() {
//      some_ops();
//    });
//    dom_manager->PostTask(Scene(std::move(ops)));
class DomManager : public std::enable_shared_from_this<DomManager> {
 public:
  using bytes = std::string;
  using HippyValue = footstone::value::HippyValue;
  using TaskRunner = footstone::runner::TaskRunner;
  using Task = footstone::Task;

  struct RootInfo {
    uint32_t root_id;
    float width;
    float height;
  };

  DomManager();
  ~DomManager();

  inline int32_t GetId() { return id_; }
  inline std::weak_ptr<RenderManager> GetRenderManager() { return render_manager_; }
  inline std::shared_ptr<TaskRunner> GetTaskRunner() { return dom_task_runner_; }
  inline void SetTaskRunner(std::shared_ptr<TaskRunner> runner) {
    dom_task_runner_ =  runner;
  }

  void Init();
  void SetRenderManager(const std::weak_ptr<RenderManager>& render_manager);
  static std::shared_ptr<DomNode> GetNode(const std::weak_ptr<RootNode>& weak_root_node,
                                   uint32_t id) ;

  void CreateDomNodes(const std::weak_ptr<RootNode>& weak_root_node,
                      std::vector<std::shared_ptr<DomInfo>>&& nodes);
  void UpdateDomNodes(const std::weak_ptr<RootNode>& weak_root_node,
                      std::vector<std::shared_ptr<DomInfo>>&& nodes);
  void MoveDomNodes(const std::weak_ptr<RootNode>& weak_root_node,
                    std::vector<std::shared_ptr<DomInfo>>&& nodes);
  void DeleteDomNodes(const std::weak_ptr<RootNode>& weak_root_node,
                      std::vector<std::shared_ptr<DomInfo>>&& nodes);
  void UpdateAnimation(const std::weak_ptr<RootNode>& weak_root_node,
                       std::vector<std::shared_ptr<DomNode>>&& nodes);
  void EndBatch(const std::weak_ptr<RootNode>& root_node);
  // 返回0代表失败，正常id从1开始
  void AddEventListener(const std::weak_ptr<RootNode>& weak_root_node,
                        uint32_t dom_id,
                        const std::string& event_name,
                        uint64_t listener_id,
                        bool use_capture,
                        const EventCallback& cb);
  void RemoveEventListener(const std::weak_ptr<RootNode>& weak_root_node,
                           uint32_t id,
                           const std::string& name,
                           uint64_t listener_id);
  void CallFunction(const std::weak_ptr<RootNode>& weak_root_node,
                    uint32_t id,
                    const std::string& name,
                    const DomArgument& param,
                    const CallFunctionCallback& cb);
  void SetRootSize(const std::weak_ptr<RootNode>& weak_root_node, float width, float height);
  void DoLayout(const std::weak_ptr<RootNode>& weak_root_node);
  void PostTask(const Scene&& scene);
  std::shared_ptr<Task> PostDelayedTask(const Scene&& scene, uint64_t delay);
  void CancelTask(std::shared_ptr<Task> task);

  bytes GetSnapShot(const std::shared_ptr<RootNode>& root_node);
  bool SetSnapShot(const std::shared_ptr<RootNode>& root_node, const bytes& buffer);

  static void Insert(const std::shared_ptr<DomManager>& dom_manager);
  static std::shared_ptr<DomManager> Find(int32_t id);
  static bool Erase(int32_t id);
  static bool Erase(const std::shared_ptr<DomManager>& dom_manager);

 private:
  int32_t id_;
  std::shared_ptr<LayerOptimizedRenderManager> optimized_render_manager_;
  std::weak_ptr<RenderManager> render_manager_;
  std::shared_ptr<TaskRunner> dom_task_runner_;

  FOOTSTONE_DISALLOW_COPY_AND_ASSIGN(DomManager);

  friend DomNode;
};

}  // namespace dom
}  // namespace hippy
