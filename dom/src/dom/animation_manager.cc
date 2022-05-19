//
// Copyright (c) 2022 Tencent. All rights reserved.
// Created by omegaxiao on 2022/4/14.
//

#include "dom/animation_manager.h"

#include <cstdint>
#include <unordered_map>
#include "dom/dom_node.h"
#include "dom/macro.h"
#include "dom/node_props.h"

namespace hippy {
inline namespace dom {
using Scene = hippy::dom::Scene;

static std::unordered_map<int32_t, std::shared_ptr<AnimationManager>> ani_manager_map;
static std::mutex mutex;
static std::atomic<int32_t> global_ani_manager_key{0};

std::shared_ptr<AnimationManager> AnimationManager::Find(const int32_t id) {
  std::lock_guard<std::mutex> lock(mutex);
  auto ani_manager = ani_manager_map.find(id);
  if (ani_manager != ani_manager_map.end()) {
    return ani_manager->second;
  }
  return nullptr;
}

void AnimationManager::Insert(const std::shared_ptr<AnimationManager>& animation_manager) {
  std::lock_guard<std::mutex> lock(mutex);
  ani_manager_map.insert({animation_manager->GetId(), animation_manager});
}

bool AnimationManager::Erase(int32_t id) {
  std::lock_guard<std::mutex> lock(mutex);
  const auto it = ani_manager_map.find(id);
  if (it == ani_manager_map.end()) {
    return false;
  }
  ani_manager_map.erase(it);
  return true;
}

AnimationManager::AnimationManager(const std::shared_ptr<DomManager>& dom_manager) {
  dom_manager_ = dom_manager;
  id_ = global_ani_manager_key.fetch_add(1);
}

void AnimationManager::OnDomNodeCreate(const std::vector<std::shared_ptr<DomInfo>>& nodes) {
  for (const std::shared_ptr<DomInfo>& node : nodes) {
    ParseAnimation(node->domNode);
  }
}

void AnimationManager::OnDomNodeUpdate(const std::vector<std::shared_ptr<DomInfo>>& nodes) {
  for (const std::shared_ptr<DomInfo>& node : nodes) {
    ParseAnimation(node->domNode);
  }
}

void AnimationManager::OnDomNodeMove(const std::vector<std::shared_ptr<DomInfo>>& nodes) {}

void AnimationManager::OnDomNodeDelete(const std::vector<std::shared_ptr<DomInfo>>& nodes) {
  for (const std::shared_ptr<DomInfo>& node : nodes) {
    DeleteAnimation(node->domNode);
  }
}

void AnimationManager::ParseAnimation(const std::shared_ptr<DomNode>& node) {
  auto dom_ext_map_ = node->GetExtStyle();
  auto useAnimation = dom_ext_map_->find(kUseAnimation);
  if (useAnimation != dom_ext_map_->end()) {
    auto style_map_ = node->GetStyleMap();
    std::map<uint32_t, std::string> ani_props;
    for (auto& style : *style_map_) {
      if ((*style.second).IsObject()) {
        FetchAnimationsFromObj(*style.second, style.first, ani_props);
      } else if ((*style.second).IsArray()) {
        FetchAnimationsFromArray(*style.second, ani_props);
      }
    }
    for (auto& style : *dom_ext_map_) {
      if ((*style.second).IsObject()) {
        FetchAnimationsFromObj(*style.second, style.first, ani_props);
      } else if ((*style.second).IsArray()) {
        FetchAnimationsFromArray(*style.second, ani_props);
      }
    }
    DeleteAnimation(node);
    if (!ani_props.empty()) {
      animation_nodes_.insert({node->GetId(), ani_props});
      for (const auto& prop : ani_props) {
        auto animation = animations_.find(prop.first);
        if (animation != animations_.end()) {
          animation->second.insert(node->GetId());
        } else {
          std::set<uint32_t> nodeIds;
          nodeIds.insert(node->GetId());
          animations_.insert({prop.first, nodeIds});
        }
      }
    }
  } else {
    DeleteAnimation(node);
  }
}

void AnimationManager::FetchAnimationsFromObj(const DomValue& value, const std::string& prop,
                                              std::map<uint32_t, std::string>& result) {
  if (value.IsObject()) {
    tdf::base::DomValue::DomValueObjectType obj;
    if (value.ToObject(obj)) {
      for (auto& ky : obj) {
        if (ky.first == kAnimationId) {
          auto id = ky.second;
          if (id.IsNumber()) {
            double ani_id;
            if (id.ToDouble(ani_id)) {
              result.insert({static_cast<uint32_t>(ani_id), prop});
            }
          }
        } else {
          if (ky.second.IsObject()) {
            FetchAnimationsFromObj(ky.second, ky.first, result);
          } else if (ky.second.IsArray()) {
            FetchAnimationsFromArray(ky.second, result);
          }
        }
      }
    }
  }
}

void AnimationManager::FetchAnimationsFromArray(const DomValue& value, std::map<uint32_t, std::string>& result) {
  if (value.IsArray()) {
    tdf::base::DomValue::DomValueArrayType array;
    if (value.ToArray(array)) {
      for (auto& val : array) {
        if (val.IsObject()) {
          tdf::base::DomValue::DomValueObjectType obj;
          if (val.ToObject(obj)) {
            for (auto& ky : obj) {
              if (ky.second.IsObject()) {
                FetchAnimationsFromObj(ky.second, ky.first, result);
              } else if (ky.second.IsArray()) {
                FetchAnimationsFromArray(ky.second, result);
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

void AnimationManager::DeleteAnimation(const std::shared_ptr<DomNode>& dom_node) {
  auto ani = animation_nodes_.find(dom_node->GetId());
  if (ani != animation_nodes_.end()) {
    for (const auto& ani_prop : ani->second) {
      auto node_ids = animations_.find(ani_prop.first);
      if (node_ids != animations_.end()) {
        for (auto node_id : node_ids->second) {
          if (node_id == dom_node->GetId()) {
            node_ids->second.erase(node_id);
          }
        }
        if (node_ids->second.empty()) {
          animations_.erase(ani_prop.first);
        }
      }
    }
    animation_nodes_.erase(dom_node->GetId());
  }
}

void AnimationManager::OnAnimationUpdate(const std::vector<std::pair<uint32_t, std::shared_ptr<DomValue>>>& ani_data) {
  auto dom_manager = dom_manager_.lock();
  if (dom_manager) {
    std::vector<std::function<void()>> ops = {[WEAK_THIS, ani_data] {
      DEFINE_AND_CHECK_SELF(AnimationManager)
      std::vector<std::shared_ptr<DomNode>> update_nodes;
      auto dom_manager = self->dom_manager_.lock();
      for (const auto& pair : ani_data) {
        uint32_t ani_id = pair.first;
        auto ani_nodes = self->animations_.find(ani_id);
        if (ani_nodes != self->animations_.end()) {
          for (auto node_id : ani_nodes->second) {
            auto ani_node = self->animation_nodes_.find(node_id);
            if (ani_node != self->animation_nodes_.end()) {
              std::map<uint32_t, std::string> props = ani_node->second;
              if (props.find(ani_id) != props.end()) {
                auto prop = props.find(ani_id);
                auto dom_node = dom_manager->GetNode(node_id);
                if (dom_node == nullptr) {
                  continue;
                }
                dom_node->EmplaceStyleMap(prop->second, *pair.second);
                std::shared_ptr<std::unordered_map<std::string, std::shared_ptr<DomValue>>> diff_value =
                    std::make_shared<std::unordered_map<std::string, std::shared_ptr<DomValue>>>();
                diff_value->insert({prop->second, pair.second});
                dom_node->SetDiffStyle(diff_value);
                update_nodes.push_back(dom_node);
              }
            }
          }
        }
      }
      dom_manager->UpdateAnimation(std::move(update_nodes));
      dom_manager->EndBatch();
    }};
    dom_manager->PostTask(Scene(std::move(ops)));
  }
}
}  // namespace dom
}  // namespace hippy
