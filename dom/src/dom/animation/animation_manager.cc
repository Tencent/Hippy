//
// Copyright (c) 2022 Tencent. All rights reserved.
// Created by omegaxiao on 2022/4/14.
//

#include "dom/animation/animation_manager.h"

#include <cstdint>
#include <unordered_map>
#include <utility>

#include "core/base/base_time.h"
#include "dom/dom_node.h"
#include "dom/macro.h"
#include "dom/node_props.h"
#include "dom/render_manager.h"

#ifdef ANDROID
constexpr char kVSyncKey[] = "frameUpdated";
#else
constexpr char KVSyncKey[] = "AnimationVSyncKey"
#endif

namespace hippy {
inline namespace dom {
using Scene = hippy::dom::Scene;

AnimationManager::AnimationManager() {}

void AnimationManager::OnDomNodeCreate(const std::vector<std::shared_ptr<DomInfo>>& nodes) {
  for (const std::shared_ptr<DomInfo>& node : nodes) {
    ParseAnimation(node->dom_node);
  }
}

void AnimationManager::OnDomNodeUpdate(const std::vector<std::shared_ptr<DomInfo>>& nodes) {
  for (const std::shared_ptr<DomInfo>& node : nodes) {
    ParseAnimation(node->dom_node);
  }
}

void AnimationManager::OnDomNodeMove(const std::vector<std::shared_ptr<DomInfo>>& nodes) {}

void AnimationManager::OnDomNodeDelete(const std::vector<std::shared_ptr<DomInfo>>& nodes) {
  for (const std::shared_ptr<DomInfo>& node : nodes) {
    DeleteAnimationMap(node->dom_node);
  }
}

void AnimationManager::ParseAnimation(const std::shared_ptr<DomNode>& node) {
  auto dom_ext_map_ = node->GetExtStyle();
  auto use_animation_it = dom_ext_map_->find(kUseAnimation);
  if (use_animation_it != dom_ext_map_->end()) {
    auto style_map_ = node->GetStyleMap();
    std::unordered_map<uint32_t, std::string> animation_prop_map;
    for (auto& style : *style_map_) {
      if (style.second->IsObject()) {
        FetchAnimationsFromObject(style.first, style.second, animation_prop_map);
      } else if (style.second->IsArray()) {
        FetchAnimationsFromArray(*style.second, animation_prop_map);
      }
    }
    for (auto& style : *dom_ext_map_) {
      if (style.second->IsObject()) {
        FetchAnimationsFromObject(style.first, style.second, animation_prop_map);
      } else if (style.second->IsArray()) {
        FetchAnimationsFromArray(*style.second, animation_prop_map);
      }
    }
    DeleteAnimationMap(node);
    if (!animation_prop_map.empty()) {
      node_animation_props_map_.insert({node->GetId(), animation_prop_map});
      for (const auto& prop : animation_prop_map) {
        auto animation = animation_nodes_map_.find(prop.first);
        if (animation != animation_nodes_map_.end()) {
          animation->second.insert(node->GetId());
        } else {
          std::set<uint32_t> nodeIds;
          nodeIds.insert(node->GetId());
          animation_nodes_map_.insert({prop.first, nodeIds});
        }
      }
    }
  } else {
    DeleteAnimationMap(node);
  }
}

void AnimationManager::FetchAnimationsFromObject(
    const std::string& prop,
    std::shared_ptr<DomValue> value,
    std::unordered_map<uint32_t, std::string>& result) {
  if (value->IsObject()) {
    tdf::base::DomValue::DomValueObjectType obj;
    if (value->ToObject(obj)) {
      for (auto item : obj) {
        if (item.first == kAnimationId) {
          auto id = item.second;
          if (id.IsNumber()) {
            double number_animation_id;
            if (id.ToDouble(number_animation_id)) {
              auto animation_id = static_cast<uint32_t>(number_animation_id);
              result.insert({animation_id, prop});
              auto animation = GetAnimation(animation_id);
              if (animation) {
                *value = DomValue(animation->GetStartValue());
              } else {
                auto animation_set = GetAnimationSet(animation_id);
                if (animation_set) {
                  *value = DomValue(animation_set->GetStartValue());
                }
              }
            }
          }
        } else {
          if (item.second.IsObject()) {
            FetchAnimationsFromObject(item.first, std::make_shared<DomValue>(item.second), result);
          } else if (item.second.IsArray()) {
            FetchAnimationsFromArray(item.second, result);
          }
        }
      }
    }
  }
}

void AnimationManager::FetchAnimationsFromArray(DomValue& value,
                                                std::unordered_map<uint32_t, std::string>& result) {
  if (value.IsArray()) {
    tdf::base::DomValue::DomValueArrayType array;
    if (value.ToArray(array)) {
      for (auto& val : array) {
        if (val.IsObject()) {
          tdf::base::DomValue::DomValueObjectType obj;
          if (val.ToObject(obj)) {
            for (auto& item : obj) {
              if (item.second.IsObject()) {
                FetchAnimationsFromObject(item.first,
                                          std::make_shared<DomValue>(item.second), result);
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
    auto dom_manager = dom_manager_.lock();
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
  TDF_BASE_DLOG(INFO) << "animation active cnt = " << active_animations_.size();
  if (active_animations_.size() == 1) {
    auto render_manager = render_manager_.lock();
    if (!render_manager) {
      return;
    }
    auto dom_manager = dom_manager_.lock();
    if (!dom_manager) {
      return;
    }
    auto weak_animation_manager = weak_from_this();
#ifdef ANDROID
    dom_manager->AddEventListener(dom_manager->GetRootId(),
                                  kVSyncKey,
                                  hippy::dom::FetchListenerId(),
                                  false,
                                  [weak_dom_manager = dom_manager_, weak_animation_manager]
                                  (std::shared_ptr<DomEvent>&) {
#else
    render_manager->RegisterVsyncSignal(kVSyncKey, 60.0,
                                        [dom_manager_, weak_animation_manager]() {
#endif
      auto dom_manager = weak_dom_manager.lock();
      if (!dom_manager) {
        return;
      }
      std::vector<std::function<void()>> ops = {[weak_animation_manager] {
        auto animation_manager = weak_animation_manager.lock();
        if (!animation_manager) {
          return;
        }
        animation_manager->UpdateAnimation();
      }};
      dom_manager->PostTask(Scene(std::move(ops)));
    });
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
  TDF_BASE_DLOG(INFO) << "animation remove cnt = " << active_animations_.size();
  if (size == 1 && active_animations_.empty()) {
    auto render_manager = render_manager_.lock();
    if (render_manager) {
      render_manager->UnregisterVsyncSignal(kVSyncKey);
    }
  }
}

void AnimationManager::DeleteAnimationMap(const std::shared_ptr<DomNode>& dom_node) {
  auto dom_node_id = dom_node->GetId();
  auto animation_it = node_animation_props_map_.find(dom_node_id);
  if (animation_it != node_animation_props_map_.end()) {
    for (const auto& animation_props : animation_it->second) {
      auto node_ids_it = animation_nodes_map_.find(animation_props.first);
      if (node_ids_it != animation_nodes_map_.end()) {
        for (auto node_id : node_ids_it->second) {
          if (node_id == dom_node_id) {
            node_ids_it->second.erase(node_id);
          }
        }
        if (node_ids_it->second.empty()) {
          animation_nodes_map_.erase(animation_props.first);
        }
      }
    }
    node_animation_props_map_.erase(dom_node->GetId());
  }
}

void AnimationManager::RepeatAnimation(std::shared_ptr<Animation> animation, uint64_t now) {
  if (!animation) {
    return;
  }
  animation->Repeat(now);
  auto delay = animation->GetDelay();
  if (delay == 0) {
    AddActiveAnimation(animation);
  } else {
    auto dom_manager = dom_manager_.lock();
    if (!dom_manager) {
      return;
    }
    std::weak_ptr<Animation> weak_animation = animation;
    auto weak_dom_manager = dom_manager_;
    std::vector<std::function<void()>> ops = {[weak_animation, weak_dom_manager] {
      auto animation = weak_animation.lock();
      if (!animation) {
        return;
      }
      auto dom_manager = weak_dom_manager.lock();
      if (!dom_manager) {
        return;
      }
      auto animation_manager = dom_manager->GetAnimationManager();
      auto now = hippy::base::MonotonicallyIncreasingTime();
      auto exec_time = animation->GetExecTime();
      exec_time += (now - animation->GetLastBeginTime());
      animation->SetExecTime(exec_time);
      animation->SetLastBeginTime(now);
      animation_manager->RemoveDelayedAnimationRecord(animation->GetId());
      animation_manager->AddActiveAnimation(animation);
    }};
    auto task = dom_manager->PostDelayedTask(Scene(std::move(ops)), delay);
    AddDelayedAnimationRecord(animation->GetId(), task);
    animation->SetStatus(Animation::Status::kStart);
  }
}

void AnimationManager::UpdateAnimation() {
  auto dom_manager = dom_manager_.lock();
  if (!dom_manager) {
    return;
  }

  std::vector<Animation::AnimationCb> cbs;
  auto now = hippy::base::MonotonicallyIncreasingTime();
  std::vector<std::shared_ptr<DomNode>> update_nodes;
  // todo for : crash 问题
  for (uint32_t i = 0; i < active_animations_.size(); ++i) {
    auto animation = active_animations_[i];
    auto value = animation->Calculate(now);
    auto animation_id = animation->GetId();
    auto animation_set_id = animation->GetAnimationSetId();
    auto id = animation_set_id;
    if (id == kInvalidAnimationSetId) {
      id = animation_id;
    }
    auto dom_nodes_it = animation_nodes_map_.find(id);
    if (dom_nodes_it == animation_nodes_map_.end()) {
      continue;
    }
    for (auto dom_node_id : dom_nodes_it->second) {
      auto node_props_it = node_animation_props_map_.find(dom_node_id);
      if (node_props_it == node_animation_props_map_.end()) {
        continue;
      }
      auto props = node_props_it->second;
      auto prop_it = props.find(id);
      if (prop_it == props.end()) {
        continue;
      }
      auto dom_node = dom_manager->GetNode(node_props_it->first);
      if (!dom_node) {
        continue;
      }
      DomValue prop_value(value);
      dom_node->EmplaceStyleMap(prop_it->second, prop_value);
      TDF_BASE_DLOG(INFO) << "animation key = " << prop_it->second << ", value = " << prop_value;
      std::unordered_map<std::string, std::shared_ptr<DomValue>> diff_value = {
          { prop_it->second, std::make_shared<DomValue>(std::move(prop_value)) }
      };
      dom_node->SetDiffStyle(std::make_shared<
          std::unordered_map<std::string, std::shared_ptr<DomValue>>>(std::move(diff_value)));
      update_nodes.push_back(dom_node);
    }
    auto status = animation->GetStatus();
    TDF_BASE_DLOG(INFO) << "animation status = " << static_cast<int>(status);
    switch (status) {
      case Animation::Status::kResume: {
        animation->SetStatus(Animation::Status::kRunning);
        break;
      }
      case Animation::Status::kStart: {
        animation->SetStatus(Animation::Status::kRunning);
        cbs.push_back(animation->GetAnimationStartCb());
        break;
      }
      case Animation::Status::kRunning: {
        break;
      }
      case Animation::Status::kCreated:
      case Animation::Status::kPause:
      case Animation::Status::kEnd:
      case Animation::Status::kDestroy:
      default:
        TDF_BASE_UNREACHABLE();
        break;
    }

    auto exec_time = animation->GetExecTime();
    if (exec_time >= animation->GetDuration() + animation->GetDelay()) {
      animation->SetStatus(Animation::Status::kEnd);
      RemoveActiveAnimation(animation_id);
      auto on_end = animation->GetAnimationEndCb();
      if (on_end) {
        cbs.push_back(on_end);
      }
      auto cnt = animation->GetRepeatCnt();
      if (cnt > 0 || cnt == -1) {
        RepeatAnimation(animation, now);
      }
    }
  }
  auto task_runner = dom_manager->GetDelegateTaskRunner().lock();
  if (task_runner) {
    auto task = std::make_shared<CommonTask>();
    task->func_ = [cbs = std::move(cbs)]() {
      for (const auto& cb: cbs) {
        cb();
      }
    };
  }
  dom_manager->UpdateAnimation(std::move(update_nodes));
  dom_manager->EndBatch();
}

}  // namespace dom
}  // namespace hippy
