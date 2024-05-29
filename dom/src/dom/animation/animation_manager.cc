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

#include "dom/animation/animation_manager.h"

#include <cstdint>
#include <unordered_map>
#include <utility>

#include "footstone/base_time.h"
#include "dom/dom_node.h"
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

void AnimationManager::EmplaceNodeProp(const std::shared_ptr<DomNode>& node, const std::string& prop, uint32_t animation_id) {
  auto node_id = node->GetId();
  auto it = animation_nodes_map_.find(animation_id);
  if (it != animation_nodes_map_.end()) {
    it->second.insert(node_id);
  } else {
    std::set<uint32_t> nodeIds;
    nodeIds.insert(node_id);
    animation_nodes_map_.insert({animation_id, nodeIds});
  }
  auto animation = GetAnimation(animation_id);
  if (animation) {
    node->EmplaceStyleMap(prop, HippyValue(animation->GetStartValue()));
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

    if (!animation_prop_map.empty()) {
      auto node_id = node->GetId();
      auto node_animation_props_it = node_animation_props_map_.find(node_id);
      if (node_animation_props_it != node_animation_props_map_.end()) {
        std::vector<std::shared_ptr<DomNode>> update_nodes;
        auto& orig_animation_prop_map = node_animation_props_it->second;
        for (auto& pair: animation_prop_map) {
          auto animation_id = pair.first;
          auto prop = pair.second;
          if (orig_animation_prop_map[animation_id] == prop) {
            auto animation = GetAnimation(animation_id);
            if (animation == nullptr) continue;
            node->EmplaceStyleMap(prop, HippyValue(animation->GetCurrentValue()));
          } else {
            orig_animation_prop_map[animation_id] = animation_prop_map[animation_id];
            EmplaceNodeProp(node, pair.second, animation_id);
          }
        }
      } else {
        node_animation_props_map_.insert({node_id, animation_prop_map});
        for (const auto& pair: animation_prop_map) {
          EmplaceNodeProp(node, pair.second, pair.first);
        }
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
    footstone::value::HippyValue::HippyValueArrayType array;
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
  if (it == delayed_animation_task_map_.end()) {
    return;
  }
  delayed_animation_task_map_.erase(it);
  auto root_node = root_node_.lock();
  if (!root_node) {
    return;
  }
  auto dom_manager = root_node->GetDomManager().lock();
  if (dom_manager) {
    return;
  }
  dom_manager->CancelTask(it->second);
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
                                      (const std::shared_ptr<DomEvent>&) {
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
                                      animation_manager->UpdateAnimations();
                                    }};
                                    dom_manager->PostTask(Scene(std::move(ops)));
                                  });
    dom_manager->EndBatch(root_node);
  }
}

void AnimationManager::RemoveActiveAnimation(uint32_t id) {
  auto size = active_animations_.size();
  auto root_node = root_node_.lock();
  for (auto it = active_animations_.begin(); it != active_animations_.end(); ++it) {
    if ((*it)->GetId() == id) {
      auto node_it = animation_nodes_map_.find(id);
      if (node_it != animation_nodes_map_.end()) {
        for (auto node_id : node_it->second) {
          auto node = root_node->GetNode(node_id);
          if (node) {
            node->MarkWillChange(false);
          }
        }
      }
      active_animations_.erase(it);
      break;
    }
  }
  if (size == 1 && active_animations_.empty()) {
    RemoveVSyncEventListener();
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
                                                  std::unordered_map<uint32_t, std::shared_ptr<DomNode>>& update_node_map) {
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

    std::shared_ptr<DomNode> dom_node;
    std::unordered_map<std::string, std::shared_ptr<HippyValue>> diff_value;
    auto it = update_node_map.find(dom_node_id);
    if (it == update_node_map.end()) {
      dom_node = root_node->GetNode(dom_node_id);
      if (!dom_node) {
        continue;
      }
    } else {
      dom_node = update_node_map[dom_node_id];
      diff_value = *(dom_node->GetDiffStyle());
    }
    HippyValue prop_value(current);
    dom_node->EmplaceStyleMapAndGetDiff(prop_it->second, prop_value, diff_value);
    FOOTSTONE_DLOG(INFO) << "animation related_animation_id = " << related_animation_id
      << "node id = " << dom_node->GetId() << ", key = " << prop_it->second << ", value = " << prop_value;

    dom_node->SetDiffStyle(std::make_shared<
        std::unordered_map<std::string, std::shared_ptr<HippyValue>>>(std::move(diff_value)));
    update_node_map[dom_node_id] = dom_node;
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

void AnimationManager::RemoveVSyncEventListener() {
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
    dom_manager->EndBatch(root_node_);
  }
}

void AnimationManager::UpdateAnimation(const std::shared_ptr<Animation>& animation, uint64_t now,
                                       std::unordered_map<uint32_t, std::shared_ptr<DomNode>>& update_node_map) {
  auto animation_id = animation->GetId();
  auto parent_id = animation->GetParentId();
  auto related_animation_id = parent_id;
  if (related_animation_id == hippy::kInvalidAnimationParentId) {
    related_animation_id = animation_id;
  }

  // on_run is called synchronously
  animation->Run(now, [this, related_animation_id, &update_node_map](double current) {
    UpdateCubicBezierAnimation(current, related_animation_id, update_node_map);
  });
}

void AnimationManager::UpdateAnimations() {
  auto root_node = root_node_.lock();
  if (!root_node) {
    return;
  }
  auto dom_manager = root_node->GetDomManager().lock();
  if (!dom_manager) {
    return;
  }

  auto now = footstone::time::MonotonicallyIncreasingTime();
  std::unordered_map<uint32_t, std::shared_ptr<DomNode>> update_node_map;
  // xcode crash if we change for to loop
  for (std::vector<std::shared_ptr<Animation>>::size_type i = 0; i < active_animations_.size(); ++i) {
    UpdateAnimation(active_animations_[i], now, update_node_map);
  }
  std::vector<std::shared_ptr<DomNode>> update_nodes;
  update_nodes.reserve(update_node_map.size());
  for (const auto& [key, value]: update_node_map) {
    update_nodes.push_back(value);
  }
  dom_manager->UpdateAnimation(root_node_, std::move(update_nodes));
  dom_manager->EndBatch(root_node_);
}

}  // namespace dom
}  // namespace hippy
