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

#include <stack>

#include "dom/diff_utils.h"
#include "dom/dom_node.h"
#include "footstone/persistent_object_map.h"
#include "footstone/task_runner.h"

namespace hippy {
inline namespace dom {

class RootNode;

/**
 * In HippyVue/HippyReact, updating node styles can be intricate.
 * This class is specifically designed to compute the differences when updating DOM node styles.
 */
class DomNodeStyleDiffer {
 public:
  DomNodeStyleDiffer() = default;
  ~DomNodeStyleDiffer() = default;

  bool Calculate(const std::shared_ptr<hippy::dom::RootNode>& root_node, const std::shared_ptr<DomInfo>& dom_info,
                 hippy::dom::DiffValue& style_diff, hippy::dom::DiffValue& ext_style_diff);
  void Reset() {
    node_ext_style_map_.clear();
    node_style_map_.clear();
  }

 private:
  std::unordered_map<uint32_t, std::unordered_map<std::string, std::shared_ptr<HippyValue>>> node_style_map_;
  std::unordered_map<uint32_t, std::unordered_map<std::string, std::shared_ptr<HippyValue>>> node_ext_style_map_;
};

struct ListenerOp {
  bool add;
  std::weak_ptr<DomNode> dom_node;
  std::string name;

  ListenerOp(bool add, std::weak_ptr<DomNode> dom_node, const std::string& name) {
    this->add = add;
    this->dom_node = dom_node;
    this->name = name;
  }
};

enum VSyncEventNeedSource {
  VSyncEventNeedByAnimation = 1,
  VSyncEventNeedByFrame     = 1<<1
};

class RootNode : public DomNode {
 public:
  using TaskRunner = footstone::runner::TaskRunner;
  using EventCallback = std::function<void(const std::shared_ptr<DomEvent>&)>;
  using EventCallBackRunner = std::function<void(const std::shared_ptr<DomEvent>&)>;

  RootNode(uint32_t id, LayoutEngineType layout_engine_type = LayoutEngineDefault, void* layout_config = nullptr);
  RootNode();
  ~RootNode();

  inline std::weak_ptr<DomManager> GetDomManager() { return dom_manager_; }
  inline void SetDomManager(std::weak_ptr<DomManager> dom_manager) {
    animation_manager_->SetRootNode(GetWeakSelf());
    dom_manager_ = dom_manager;
  }
  inline std::shared_ptr<AnimationManager> GetAnimationManager() { return animation_manager_; }

  virtual void AddEventListener(const std::string& name, uint64_t listener_id, bool use_capture,
                                const EventCallback& cb) override;
  virtual void RemoveEventListener(const std::string& name, uint64_t listener_id) override;

  std::map<uint32_t, std::vector<ListenerOp>> &EventListenerOps() { return event_listener_ops_; }

  void ReleaseResources();
  void CreateDomNodes(std::vector<std::shared_ptr<DomInfo>>&& nodes, bool needSortByIndex);
  void UpdateDomNodes(std::vector<std::shared_ptr<DomInfo>>&& nodes);
  void MoveDomNodes(std::vector<std::shared_ptr<DomInfo>>&& nodes);
  void DeleteDomNodes(std::vector<std::shared_ptr<DomInfo>>&& nodes);
  void UpdateAnimation(std::vector<std::shared_ptr<DomNode>>&& nodes);
  void CallFunction(uint32_t id, const std::string& name, const DomArgument& param, const CallFunctionCallback& cb);
  void SyncWithRenderManager(const std::shared_ptr<RenderManager>& render_manager);
  void DoAndFlushLayout(const std::shared_ptr<RenderManager>& render_manager);
  void AddEvent(uint32_t id, const std::string& event_name);
  void RemoveEvent(uint32_t id, const std::string& event_name);
  void HandleEvent(const std::shared_ptr<DomEvent>& event) override;
  void UpdateRenderNode(const std::shared_ptr<DomNode>& node);
  uint32_t GetChildCount();

  std::shared_ptr<DomNode> GetNode(uint32_t id);
  std::tuple<float, float> GetRootSize();
  void SetRootSize(float width, float height);
  void SetRootOrigin(float x, float y);
  void Traverse(const std::function<void(const std::shared_ptr<DomNode>&)>& on_traverse);
  void AddInterceptor(const std::shared_ptr<DomActionInterceptor>& interceptor);
  void SetDisableSetRootSize(bool disable) {
    disable_set_root_size_ = disable;
  }

  static footstone::utils::PersistentObjectMap<uint32_t, std::shared_ptr<RootNode>>& PersistentMap() {
    return persistent_map_;
  }

  std::vector<std::weak_ptr<DomNode>> GetAllTextNodes();

  LayoutEngineType GetLayoutEngineType() { return layout_engine_type_; }

  void* GetLayoutConfig() { return layout_config_; }

  void SetVSyncEventNeedSource(VSyncEventNeedSource source) { vSyncEventNeedSourceBits_ |= source; }
  void UnsetVSyncEventNeedSource(VSyncEventNeedSource source) { vSyncEventNeedSourceBits_ &= (~source); }
  bool HasVSyncEventNeedSource() { return vSyncEventNeedSourceBits_ != 0; }

 private:
  static void MarkLayoutNodeDirty(const std::vector<std::shared_ptr<DomNode>>& nodes);

  struct DomOperation {
    enum class Op { kOpCreate, kOpUpdate, kOpDelete, kOpMove } op;
    std::vector<std::shared_ptr<DomNode>> nodes;
  };

  struct EventOperation {
    enum class Op { kOpAdd, kOpRemove } op;
    uint32_t id;
    std::string name;
  };

  std::vector<DomOperation> dom_operations_;
  std::vector<EventOperation> event_operations_;
  std::map<uint32_t, std::vector<ListenerOp>> event_listener_ops_;

  void FlushDomOperations(const std::shared_ptr<RenderManager>& render_manager);
  void FlushEventOperations(const std::shared_ptr<RenderManager>& render_manager);
  void OnDomNodeCreated(const std::shared_ptr<DomNode>& node);
  void OnDomNodeDeleted(const std::shared_ptr<DomNode>& node);
  std::weak_ptr<RootNode> GetWeakSelf();

  std::unordered_map<uint32_t, std::weak_ptr<DomNode>> nodes_;
  std::weak_ptr<DomManager> dom_manager_;
  std::vector<std::shared_ptr<DomActionInterceptor>> interceptors_;
  std::shared_ptr<AnimationManager> animation_manager_;
  std::unique_ptr<DomNodeStyleDiffer> style_differ_;

  bool disable_set_root_size_ { false };

  LayoutEngineType layout_engine_type_ = LayoutEngineDefault;

  // 布局引擎配置结构优先存在RootNode里，避免存在全局static区
  void* layout_config_ = nullptr;

  int32_t vSyncEventNeedSourceBits_ = 0;

  static footstone::utils::PersistentObjectMap<uint32_t, std::shared_ptr<RootNode>> persistent_map_;
};

}  // namespace dom
}  // namespace hippy
