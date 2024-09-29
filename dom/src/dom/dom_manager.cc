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

#include "dom/dom_manager.h"

#include <mutex>
#include <stack>
#include <utility>

#include "dom/animation/animation_manager.h"
#include "dom/diff_utils.h"
#include "dom/dom_action_interceptor.h"
#include "dom/dom_event.h"
#include "dom/dom_node.h"
#include "dom/layer_optimized_render_manager.h"
#include "dom/render_manager.h"
#include "dom/root_node.h"
#include "dom/scene_builder.h"
#include "footstone/serializer.h"
#include "footstone/deserializer.h"
#include "footstone/one_shot_timer.h"
#include "footstone/time_delta.h"

namespace hippy {
inline namespace dom {

using DomNode = hippy::DomNode;
using Task = footstone::Task;
using TaskRunner = footstone::TaskRunner;
using TimeDelta = footstone::TimeDelta;
using OneShotTimer = footstone::timer::OneShotTimer;
using Serializer = footstone::value::Serializer;
using Deserializer = footstone::value::Deserializer;

using HippyValueArrayType = footstone::value::HippyValue::HippyValueArrayType;

void DomManager::SetRenderManager(const std::weak_ptr<RenderManager>& render_manager) {
#ifdef HIPPY_EXPERIMENT_LAYER_OPTIMIZATION
  optimized_render_manager_ = std::make_shared<LayerOptimizedRenderManager>(render_manager.lock());
  render_manager_ = optimized_render_manager_;
#else
  render_manager_ = render_manager.lock();
#endif
}

std::shared_ptr<DomNode> DomManager::GetNode(const std::weak_ptr<RootNode>& weak_root_node, uint32_t id) {
  auto root_node = weak_root_node.lock();
  if (!root_node) {
    return nullptr;
  }
  return root_node->GetNode(id);
}

void DomManager::CreateDomNodes(const std::weak_ptr<RootNode>& weak_root_node,
                                std::vector<std::shared_ptr<DomInfo>>&& nodes,
                                bool needSortByIndex) {
  auto root_node = weak_root_node.lock();
  if (!root_node) {
    return;
  }
  size_t create_size = nodes.size();
  root_node->CreateDomNodes(std::move(nodes), needSortByIndex);
  FOOTSTONE_DLOG(INFO) << "[Hippy Statistic] create node size = " << create_size << ", total node size = " << root_node->GetChildCount();
}

void DomManager::UpdateDomNodes(const std::weak_ptr<RootNode>& weak_root_node,
                                std::vector<std::shared_ptr<DomInfo>>&& nodes) {
  auto root_node = weak_root_node.lock();
  if (!root_node) {
    return;
  }
  size_t update_size = nodes.size();
  root_node->UpdateDomNodes(std::move(nodes));
  FOOTSTONE_DLOG(INFO) << "[Hippy Statistic] update node size = " << update_size << ", total node size = " << root_node->GetChildCount();
}

void DomManager::MoveDomNodes(const std::weak_ptr<RootNode>& weak_root_node,
                              std::vector<std::shared_ptr<DomInfo>>&& nodes) {
  auto root_node = weak_root_node.lock();
  if (!root_node) {
    return;
  }
  size_t move_size = nodes.size();
  root_node->MoveDomNodes(std::move(nodes));
  FOOTSTONE_DLOG(INFO) << "[Hippy Statistic] move node size = " << move_size << ", total node size = " << root_node->GetChildCount();
}

void DomManager::UpdateAnimation(const std::weak_ptr<RootNode>& weak_root_node,
                                 std::vector<std::shared_ptr<DomNode>>&& nodes) {
  auto root_node = weak_root_node.lock();
  if (!root_node) {
    return;
  }
  root_node->UpdateAnimation(std::move(nodes));
}

void DomManager::DeleteDomNodes(const std::weak_ptr<RootNode>& weak_root_node,
                                std::vector<std::shared_ptr<DomInfo>>&& nodes) {
  auto root_node = weak_root_node.lock();
  if (!root_node) {
    return;
  }
  size_t delete_size = nodes.size();
  root_node->DeleteDomNodes(std::move(nodes));
  FOOTSTONE_DLOG(INFO) << "[Hippy Statistic] delete node size = " << delete_size << ", total node size = " << root_node->GetChildCount();
}

void DomManager::EndBatch(const std::weak_ptr<RootNode>& weak_root_node) {
  auto render_manager = render_manager_;
  FOOTSTONE_DCHECK(render_manager);
  if (!render_manager) {
    return;
  }
  auto root_node = weak_root_node.lock();
  if (!root_node) {
    return;
  }
  FOOTSTONE_DLOG(INFO) << "[Hippy Statistic] total node size = " << root_node->GetChildCount();
  root_node->SyncWithRenderManager(render_manager);
}

void DomManager::AddEventListener(const std::weak_ptr<RootNode>& weak_root_node, uint32_t dom_id,
                                  const std::string& name, uint64_t listener_id, bool use_capture,
                                  const EventCallback& cb) {
  auto root_node = weak_root_node.lock();
  if (!root_node) {
    return;
  }
  auto node = root_node->GetNode(dom_id);
  if (!node) {
    return;
  }
  node->AddEventListener(name, listener_id, use_capture, cb);
}

void DomManager::RemoveEventListener(const std::weak_ptr<RootNode>& weak_root_node, uint32_t id,
                                     const std::string& name, uint64_t listener_id) {
  auto root_node = weak_root_node.lock();
  if (!root_node) {
    return;
  }
  auto node = root_node->GetNode(id);
  if (!node) {
    return;
  }
  node->RemoveEventListener(name, listener_id);
}

void DomManager::CallFunction(const std::weak_ptr<RootNode>& weak_root_node, uint32_t id, const std::string& name,
                              const DomArgument& param, const CallFunctionCallback& cb) {
  auto root_node = weak_root_node.lock();
  if (!root_node) {
    return;
  }
  root_node->CallFunction(id, name, param, cb);
}

void DomManager::SetRootSize(const std::weak_ptr<RootNode>& weak_root_node, float width, float height) {
  auto root_node = weak_root_node.lock();
  if (!root_node) {
    return;
  }
  root_node->SetRootSize(width, height);
}

void DomManager::DoLayout(const std::weak_ptr<RootNode>& weak_root_node) {
  auto root_node = weak_root_node.lock();
  if (!root_node) {
    return;
  }
  auto render_manager = render_manager_;
  // check render_manager, measure text dependent render_manager
  FOOTSTONE_DCHECK(render_manager);
  if (!render_manager) {
    return;
  }
  root_node->DoAndFlushLayout(render_manager);
}

void DomManager::PostTask(const Scene&& scene) {
  auto func = [scene = scene] { scene.Build(); };
  task_runner_->PostTask(std::move(func));
}

uint32_t DomManager::PostDelayedTask(const Scene&& scene, TimeDelta delay) {
  auto func = [scene] { scene.Build(); };
  auto task = std::make_unique<Task>(std::move(func));
  auto id = task->GetId();
  std::shared_ptr<OneShotTimer> timer = std::make_unique<OneShotTimer>(task_runner_);
  timer->Start(std::move(task), delay);
  timer_map_.insert({id, timer});
  return id;
}

void DomManager::CancelTask(uint32_t id) {
  timer_map_.erase(id);
}

DomManager::byte_string DomManager::GetSnapShot(const std::shared_ptr<RootNode>& root_node) {
  if (!root_node) {
    return {};
  }
  HippyValueArrayType array;
  root_node->Traverse([&array](const std::shared_ptr<DomNode>& node) { array.emplace_back(node->Serialize()); });
  Serializer serializer;
  serializer.WriteHeader();
  serializer.WriteValue(HippyValue(array));
  auto buffer_pair = serializer.Release();
  byte_string bs =  {reinterpret_cast<const char*>(buffer_pair.first), buffer_pair.second};
  footstone::value::SerializerHelper::DestroyBuffer(buffer_pair);
  return bs;
}

bool DomManager::SetSnapShot(const std::shared_ptr<RootNode>& root_node, const byte_string& buffer) {
  Deserializer deserializer(reinterpret_cast<const uint8_t*>(buffer.c_str()), buffer.length());
  HippyValue value;
  deserializer.ReadHeader();
  auto flag = deserializer.ReadValue(value);
  if (!flag || !value.IsArray()) {
    return false;
  }
  HippyValueArrayType array;
  value.ToArray(array);
  if (array.empty()) {
    return false;
  }
  auto orig_root_node = std::make_shared<DomNode>();
  flag = orig_root_node->Deserialize(array[0]);
  if (!flag) {
    return false;
  }
  if (orig_root_node->GetPid() != 0) {
    return false;
  }
  auto orig_root_id = orig_root_node->GetId();
  std::vector<std::shared_ptr<DomInfo>> nodes;
  std::weak_ptr<DomManager> weak_dom_manager = weak_from_this();
  for (uint32_t i = 1; i < array.size(); ++i) {
    auto node = array[i];
    auto dom_node = std::make_shared<DomNode>();
    flag = dom_node->Deserialize(node);
    if (!flag) {
      return false;
    }
    dom_node->SetRootNode(root_node);
    if (dom_node->GetPid() == orig_root_id) {
      dom_node->SetPid(root_node->GetId());
    }
    nodes.push_back(std::make_shared<DomInfo>(dom_node, nullptr, nullptr));
  }

  CreateDomNodes(root_node, std::move(nodes), false);
  EndBatch(root_node);

  return true;
}

void DomManager::RecordDomStartTimePoint() {
  if (dom_start_time_point_.ToEpochDelta() == TimeDelta::Zero()) {
    dom_start_time_point_ = footstone::TimePoint::SystemNow();
  }
}

void DomManager::RecordDomEndTimePoint() {
  if (dom_end_time_point_.ToEpochDelta() == TimeDelta::Zero()
  && dom_start_time_point_.ToEpochDelta() != TimeDelta::Zero()) {
    dom_end_time_point_ = footstone::TimePoint::SystemNow();
  }
}

}  // namespace dom
}  // namespace hippy
