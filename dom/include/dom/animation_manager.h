#pragma once

#include "dom/dom_action_interceptor.h"
#include "dom/dom_manager.h"
#include "base/macros.h"

#include <set>

namespace hippy {
inline namespace dom {
class AnimationManager : public DomActionInterceptor, public std::enable_shared_from_this<AnimationManager> {
  using DomValue = tdf::base::DomValue;

 public:
  AnimationManager(const std::shared_ptr<DomManager>& dom_manager);
  void OnDomNodeCreate(const std::vector<std::shared_ptr<DomNode>>& nodes) override;

  void OnDomNodeUpdate(const std::vector<std::shared_ptr<DomNode>>& nodes) override;

  void OnDomNodeDelete(const std::vector<std::shared_ptr<DomNode>>& nodes) override;

  void OnAnimationUpdate(const std::vector<std::pair<uint32_t, std::shared_ptr<tdf::base::DomValue>>>& ani_data);

  void DeleteAnimation(const std::shared_ptr<DomNode>& node);

  int32_t GetId() { return id_; }
  static void Insert(const std::shared_ptr<AnimationManager>& animation_manager);
  static bool Erase(int32_t id);

  static std::shared_ptr<AnimationManager> Find(const int32_t id);
  ~AnimationManager() {}

 private:
  std::weak_ptr<DomManager> dom_manager_;
  /**
   * One animation can be used for multiple nodes,
   * the key of this map is animation id and the value is the set of domNodes.
   */
  std::map<uint32_t, std::set<uint32_t>> animations_;

  /**
   *   One dom node contains multiple animations,
   *   the key of this map is dom node id and the value are all animation properties of the node
   *   the key of props' map is animation id and value is ths name of prop.
   */
  std::map<uint32_t, std::map<uint32_t, std::string>> animation_nodes_;
  int32_t id_;
  void ParseAnimation(const std::shared_ptr<DomNode>& node);
  void FetchAnimationsFromObj(const DomValue& value, const std::string& prop, std::map<uint32_t, std::string>& result);
  void FetchAnimationsFromArray(const DomValue& value, std::map<uint32_t, std::string>& result);

  TDF_BASE_DISALLOW_COPY_AND_ASSIGN(AnimationManager);
};
}  // namespace dom
}  // namespace hippy
