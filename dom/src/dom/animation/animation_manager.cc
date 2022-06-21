//
// Copyright (c) 2022 Tencent. All rights reserved.
// Created by omegaxiao on 2022/4/14.
//

#include "dom/animation/animation_manager.h"

#include <cstdint>
#include <unordered_map>
#include <utility>

#include "footstone/base_time.h"
#include "dom/dom_node.h"
#include "dom/macro.h"
#include "dom/node_props.h"
#include "dom/render_manager.h"
#include "dom/root_node.h"

constexpr char kVSyncKey[] = "frameupdate";

namespace hippy {
inline namespace dom {
using Scene = hippy::dom::Scene;

AnimationManager::AnimationManager() : listener_id_(0) {}

void AnimationManager::OnDomNodeCreate(const std::vector<std::shared_ptr<DomInfo>>& nodes) {
  for (const std::shared_ptr<DomInfo>& node: nodes) {
    ParseAnimation(node->dom_node);
  }
}

void AnimationManager::OnDomNodeUpdate(const std::vector<std::shared_ptr<DomInfo>>& nodes) {
  for (const std::shared_ptr<DomInfo>& node: nodes) {
    ParseAnimation(node->dom_node);
  }
}

void AnimationManager::OnDomNodeMove(const std::vector<std::shared_ptr<DomInfo>>& nodes) {}

void AnimationManager::OnDomNodeDelete(const std::vector<std::shared_ptr<DomInfo>>& nodes) {
  for (const std::shared_ptr<DomInfo>& node: nodes) {
    DeleteAnimationMap(node->dom_node);
  }
}

void AnimationManager::ParseAnimation(const std::shared_ptr<DomNode>& node) {
  auto dom_ext_map_ = node->GetExtStyle();
  auto use_animation_it = dom_ext_map_->find(kUseAnimation);
  if (use_animation_it != dom_ext_map_->end()) {
    auto style_map_ = node->GetStyleMap();
    std::unordered_map<uint32_t, std::string> animation_prop_map;
    for (auto& style: *style_map_) {
      if (style.second->IsObject()) {
        FetchAnimationsFromObject(style.first, style.second, animation_prop_map);
      } else if (style.second->IsArray()) {
        FetchAnimationsFromArray(*style.second, animation_prop_map);
      }
    }
    for (auto& style: *dom_ext_map_) {
      if (style.second->IsObject()) {
        FetchAnimationsFromObject(style.first, style.second, animation_prop_map);
      } else if (style.second->IsArray()) {
        FetchAnimationsFromArray(*style.second, animation_prop_map);
      }
    }
    DeleteAnimationMap(node);
    if (!animation_prop_map.empty()) {
      auto node_id = node->GetId();
      node_animation_props_map_.insert({node_id, animation_prop_map});
      for (const auto& pair: animation_prop_map) {
        auto animation_id = pair.first;
        auto it = animation_nodes_map_.find(animation_id);
        if (it != animation_nodes_map_.end()) {
          it->second.insert(node_id);
        } else {
          std::set<uint32_t> nodeIds;
          nodeIds.insert(node_id);
          animation_nodes_map_.insert({animation_id, nodeIds});
        }
        auto animation = GetAnimation(animation_id);
        node->EmplaceStyleMap(pair.second, HippyValue(animation->GetStartValue()));
      }
    }
  } else {
    DeleteAnimationMap(node);
  }
}

void AnimationManager::FetchAnimationsFromObject(
    const std::string& prop,
    const std::shared_ptr<HippyValue>& value,
    std::unordered_map<uint32_t, std::string>& result) {
  if (value->IsObject()) {
    footstone::value::HippyValue::HippyValueObjectType obj;
    if (value->ToObject(obj)) {
      for (auto item: obj) {
        if (item.first == kAnimationId) {
          auto id = item.second;
          if (id.IsNumber()) {
            double animation_id;
            if (id.ToDouble(animation_id)) {
              result.insert({static_cast<uint32_t>(animation_id), prop});
            }
          }
        } else {
          if (item.second.IsObject()) {
            FetchAnimationsFromObject(item.first, std::make_shared<HippyValue>(item.second), result);
          } else if (item.second.IsArray()) {
            FetchAnimationsFromArray(item.second, result);
          }
        }
      }
    }
  }
}

void AnimationManager::FetchAnimationsFromArray(HippyValue& value,
                                                std::unordered_map<uint32_t, std::string>& result) {
  if (value.IsArray()) {
    footstone::value::HippyValue::DomValueArrayType array;
    if (value.ToArray(array)) {
      for (auto& val: array) {
        if (val.IsObject()) {
          footstone::value::HippyValue::HippyValueObjectType obj;
          if (val.ToObject(obj)) {
            for (auto& item: obj) {
              if (item.second.IsObject()) {
                FetchAnimationsFromObject(item.first,
                                          std::make_shared<HippyValue>(item.second), result);
              } else if (item.second.IsArray()) {
                FetchAnimationsFromArray(item.second, result);
              }
            }
          }
        } else if (value.IsArray()) {
          FetchAnimationsFromArray(value, result);
        }
      }
    }
  }
}

void AnimationManager::CancelDelayedAnimation(uint32_t id) {
  auto it = delayed_animation_task_map_.find(id);
  if (it != delayed_animation_task_map_.end()) {
    delayed_animation_task_map_.erase(it);
    auto root_node = root_node_.lock();
    if (!root_node) {
      return;
    }
    auto dom_manager = root_node->GetDomManager().lock();
    if (dom_manager) {
      auto task = it->second.lock();
      if (task) {
        dom_manager->CancelTask(task);
      }
    }
  }
}

bool AnimationManager::IsActive(uint32_t id) {
  return std::any_of(active_animations_.begin(), active_animations_.end(),
                     [id](const std::shared_ptr<Animation>& animation) {
                       if (animation->GetId() == id) {
                         return true;
                       }
                       return false;
                     });
}

void AnimationManager::AddActiveAnimation(const std::shared_ptr<Animation>& animation) {
  animation->SetStatus(Animation::Status::kRunning);
  active_animations_.push_back(animation);
  if (active_animations_.size() == 1) {
    auto render_manager = GetRenderManager();
    if (!render_manager) {
      return;
    }
    auto root_node = root_node_.lock();
    if (!root_node) {
      return;
    }
    auto weak_dom_manager = root_node->GetDomManager();
    auto dom_manager = weak_dom_manager.lock();
    if (!dom_manager) {
      return;
    }
    listener_id_ = hippy::dom::FetchListenerId();
    auto weak_animation_manager = weak_from_this();
    dom_manager->AddEventListener(root_node,
                                  root_node->GetId(),
                                  kVSyncKey,
                                  listener_id_,
                                  false,
                                  [weak_dom_manager, weak_animation_manager]
                                      (std::shared_ptr<DomEvent>&) {
                                    auto dom_manager = weak_dom_manager.lock();
                                    if (!dom_manager) {
                                      return;
                                    }
                                    std::vector<std::function<void()>>
                                        ops = {[weak_animation_manager] {
                                      auto animation_manager = weak_animation_manager.lock();
                                      if (!animation_manager) {
                                        return;
                                      }
                                      animation_manager->UpdateAnimation();
                                    }};
                                    dom_manager->PostTask(Scene(std::move(ops)));
                                  });
    dom_manager->EndBatch(root_node);
  }
}

void AnimationManager::RemoveActiveAnimation(uint32_t id) {
  auto size = active_animations_.size();
  for (auto it = active_animations_.begin(); it != active_animations_.end(); ++it) {
    if ((*it)->GetId() == id) {
      active_animations_.erase(it);
      break;
    }
  }
  if (size == 1 && active_animations_.empty()) {
    auto root_node = root_node_.lock();
    if (!root_node) {
      return;
    }
    auto weak_dom_manager = root_node->GetDomManager();
    auto dom_manager = weak_dom_manager.lock();
    if (!dom_manager) {
      return;
    }
    if (dom_manager) {
      dom_manager->RemoveEventListener(root_node, root_node->GetId(), kVSyncKey, listener_id_);
    }
  }
}

void AnimationManager::DeleteAnimationMap(const std::shared_ptr<DomNode>& dom_node) {
  auto dom_node_id = dom_node->GetId();
  auto animation_it = node_animation_props_map_.find(dom_node_id);
  if (animation_it != node_animation_props_map_.end()) {
    for (const auto& animation_props: animation_it->second) {
      auto node_ids_it = animation_nodes_map_.find(animation_props.first);
      if (node_ids_it != animation_nodes_map_.end()) {
        for (auto node_id: node_ids_it->second) {
          if (node_id == dom_node_id) {
            node_ids_it->second.erase(node_id);
            break;
          }
        }
        if (node_ids_it->second.empty()) {
          animation_nodes_map_.erase(animation_props.first);
        }
      }
    }
    node_animation_props_map_.erase(animation_it);
  }
}

void AnimationManager::UpdateCubicBezierAnimation(double current,
                                                  uint32_t related_animation_id,
                                                  std::vector<std::shared_ptr<DomNode>>& update_nodes) {
  auto root_node = root_node_.lock();
  if (!root_node) {
    return;
  }
  auto dom_nodes_it = animation_nodes_map_.find(related_animation_id);
  if (dom_nodes_it == animation_nodes_map_.end()) {
    return;
  }
  for (auto dom_node_id: dom_nodes_it->second) {
    auto node_props_it = node_animation_props_map_.find(dom_node_id);
    if (node_props_it == node_animation_props_map_.end()) {
      continue;
    }
    auto props = node_props_it->second;
    auto prop_it = props.find(related_animation_id);
    if (prop_it == props.end()) {
      continue;
    }
    auto dom_node = root_node->GetNode(node_props_it->first);
    if (!dom_node) {
      continue;
    }
    HippyValue prop_value(current);
    dom_node->EmplaceStyleMap(prop_it->second, prop_value);
    FOOTSTONE_DLOG(INFO) << "animation related_animation_id = " << related_animation_id
                        << ", key = " << prop_it->second << ", value = " << prop_value;
    std::unordered_map<std::string, std::shared_ptr<HippyValue>> diff_value = {
        {prop_it->second, std::make_shared<HippyValue>(std::move(prop_value))}
    };
    dom_node->SetDiffStyle(std::make_shared<
        std::unordered_map<std::string, std::shared_ptr<HippyValue>>>(std::move(diff_value)));
    update_nodes.push_back(dom_node);
  }
}

std::shared_ptr<RenderManager> AnimationManager::GetRenderManager() {
  auto root_node = root_node_.lock();
  if (!root_node) {
    return nullptr;
  }
  auto dom_manager = root_node->GetDomManager().lock();
  if (!dom_manager) {
    return nullptr;
  }
  return dom_manager->GetRenderManager().lock();
}

void AnimationManager::UpdateAnimation() {
  auto root_node = root_node_.lock();
  if (!root_node) {
    return;
  }
  auto dom_manager = root_node->GetDomManager().lock();
  if (!dom_manager) {
    return;
  }

  auto now = footstone::time::MonotonicallyIncreasingTime();
  std::vector<std::shared_ptr<DomNode>> update_nodes;
  for (std::vector<std::shared_ptr<Animation>>::size_type i = 0; i < active_animations_.size(); ++i) {
    auto animation = active_animations_[i];
    auto animation_id = animation->GetId();
    auto parent_id = animation->GetParentId();
    auto related_animation_id = parent_id;
    if (related_animation_id == hippy::kInvalidAnimationParentId) {
      related_animation_id = animation_id;
    }
    // on_run is called synchronously
    animation->Run(now, [this, related_animation_id, &update_nodes](double current) {
      UpdateCubicBezierAnimation(current, related_animation_id, update_nodes);
    });
  }
  dom_manager->UpdateAnimation(root_node_, std::move(update_nodes));
  dom_manager->EndBatch(root_node_);
}

}  // namespace dom
}  // namespace hippy
