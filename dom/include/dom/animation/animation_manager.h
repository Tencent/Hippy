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

#include <set>
#include <unordered_map>

#include "footstone/macros.h"
#include "footstone/task.h"
#include "dom/animation/animation.h"
#include "dom/animation/cubic_bezier_animation.h"
#include "dom/animation/animation_set.h"
#include "dom/dom_action_interceptor.h"
#include "dom/dom_manager.h"
#include "footstone/hippy_value.h"

namespace hippy {
inline namespace dom {

class DomManager;
class RenderManager;
class RootNode;

class AnimationManager
    : public DomActionInterceptor, public std::enable_shared_from_this<AnimationManager> {
  using HippyValue = footstone::value::HippyValue;
  using Animation = hippy::Animation;
  using Task = footstone::Task;

 public:
  AnimationManager();

  AnimationManager(AnimationManager&) = delete;
  AnimationManager& operator=(AnimationManager&) = delete;

  inline std::weak_ptr<RootNode> GetRootNode() {
    return root_node_;
  }

  inline void SetRootNode(std::weak_ptr<RootNode> root_node) {
    root_node_ = root_node;
  }

  void OnDomNodeCreate(const std::vector<std::shared_ptr<DomInfo>>& nodes) override;
  void OnDomNodeUpdate(const std::vector<std::shared_ptr<DomInfo>>& nodes) override;
  void OnDomNodeMove(const std::vector<std::shared_ptr<DomInfo>>& nodes) override;
  void OnDomNodeDelete(const std::vector<std::shared_ptr<DomInfo>>& nodes) override;

  inline void AddAnimation(std::shared_ptr<Animation> animation) {
    if (animation) {
      animation_map_[animation->GetId()] = animation;
    }
  }

  inline std::shared_ptr<Animation> GetAnimation(uint32_t id) {
    return animation_map_[id];
  }

  inline void RemoveAnimation(std::shared_ptr<Animation> animation) {
    auto it = animation_map_.find(animation->GetId());
    if (it != animation_map_.end()) {
      animation_map_.erase(it);
    }
  }

  inline void AddDelayedAnimationRecord(uint32_t animation_id, uint32_t task_id) {
    delayed_animation_task_map_[animation_id] = task_id;
  }

  inline void RemoveDelayedAnimationRecord(uint32_t id) {
    auto it = delayed_animation_task_map_.find(id);
    if (it != delayed_animation_task_map_.end()) {
      delayed_animation_task_map_.erase(it);
    }
  }

  void CancelDelayedAnimation(uint32_t id);

  bool IsActive(uint32_t id);

  void AddActiveAnimation(const std::shared_ptr<Animation>& animation);

  void RemoveActiveAnimation(uint32_t id);

  void UpdateAnimation();

  void DeleteAnimationMap(const std::shared_ptr<DomNode>& dom_node);

  ~AnimationManager() {}

 private:
  void ParseAnimation(const std::shared_ptr<DomNode>& node);
  void FetchAnimationsFromObject(const std::string& prop,
                                 const std::shared_ptr<HippyValue>& value,
                                 std::unordered_map<uint32_t, std::string>& result);
  void FetchAnimationsFromArray(HippyValue& value,
                                std::unordered_map<uint32_t, std::string>& result);
  void UpdateCubicBezierAnimation(double current,
                                  uint32_t related_animation_id,
                                  std::vector<std::shared_ptr<DomNode>>& update_nodes);
  std::shared_ptr<RenderManager> GetRenderManager();

  std::weak_ptr<RootNode> root_node_;
  std::unordered_map<uint32_t, std::shared_ptr<Animation>> animation_map_;
  /**
   * the key of delayed_animation_task_map_ is the animation id and the value is the task_id.
   */
  std::unordered_map<uint32_t, uint32_t> delayed_animation_task_map_;
  std::vector<std::shared_ptr<Animation>> active_animations_;
  /**
   * One animation can be used for multiple nodes,
   * the key of this map is animation id and the value is the set of domNodes.
   */
  std::unordered_map<uint32_t, std::set<uint32_t>> animation_nodes_map_;

  /**
   *   One dom node contains multiple animations,
   *   the key of this map is dom node id and the value are all animation properties of the node
   *   the key of props' map is animation id and value is ths name of prop.
   */
  std::unordered_map<uint32_t, std::unordered_map<uint32_t, std::string>> node_animation_props_map_;
  uint64_t listener_id_;
};
}  // namespace dom
}  // namespace hippy
