#pragma once

#include <set>
#include <unordered_map>

#include "base/macros.h"
#include "dom/animation/animation.h"
#include "dom/animation/cubic_bezier_animation.h"
#include "dom/animation/animation_set.h"
#include "dom/dom_action_interceptor.h"
#include "dom/dom_manager.h"
#include "dom/dom_value.h"

namespace hippy {
inline namespace dom {

class DomManager;
class RenderManager;
class RootNode;

class AnimationManager
    : public DomActionInterceptor, public std::enable_shared_from_this<AnimationManager> {
  using DomValue = tdf::base::DomValue;
  using Animation = hippy::Animation;

 public:
  AnimationManager();

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

  inline void AddDelayedAnimationRecord(uint32_t id, std::weak_ptr<CommonTask> task) {
    delayed_animation_task_map_[id] = task;
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
                                 const std::shared_ptr<DomValue>& value,
                                 std::unordered_map<uint32_t, std::string>& result);
  void FetchAnimationsFromArray(DomValue& value,
                                std::unordered_map<uint32_t, std::string>& result);
  void UpdateCubicBezierAnimation(double current,
                                  uint32_t related_animation_id,
                                  std::vector<std::shared_ptr<DomNode>>& update_nodes);
  std::shared_ptr<RenderManager> GetRenderManager();

  std::weak_ptr<RootNode> root_node_;
  std::unordered_map<uint32_t, std::shared_ptr<Animation>> animation_map_;
  std::unordered_map<uint32_t, std::weak_ptr<CommonTask>> delayed_animation_task_map_;
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

  TDF_BASE_DISALLOW_COPY_AND_ASSIGN(AnimationManager);
};
}  // namespace dom
}  // namespace hippy
