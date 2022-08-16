/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#pragma once

#include <atomic>
#include <memory>

#include "dom/dom_node.h"
#include "dom/render_manager.h"
#include "footstone/persistent_object_map.h"
#include "footstone/serializer.h"
#include "footstone/macros.h"
#include "jni/scoped_java_ref.h"

namespace hippy {
inline namespace render {
inline namespace native {
class NativeRenderManager : public RenderManager, public std::enable_shared_from_this<NativeRenderManager> {
 public:
  NativeRenderManager(std::shared_ptr<JavaRef> render_delegate);

  virtual ~NativeRenderManager() = default;
  NativeRenderManager(const NativeRenderManager &) = delete;
  NativeRenderManager &operator=(const NativeRenderManager &) = delete;
  NativeRenderManager(NativeRenderManager &&) = delete;
  NativeRenderManager &operator=(NativeRenderManager &&) = delete;

  uint32_t GetId() { return id_; }

  void CreateRenderNode(std::weak_ptr<RootNode> root_node, std::vector<std::shared_ptr<DomNode>>&& nodes) override;
  void UpdateRenderNode(std::weak_ptr<RootNode> root_node, std::vector<std::shared_ptr<DomNode>>&& nodes) override;
  void DeleteRenderNode(std::weak_ptr<RootNode> root_node, std::vector<std::shared_ptr<DomNode>>&& nodes) override;
  void MoveRenderNode(std::weak_ptr<RootNode> root_node, std::vector<std::shared_ptr<DomNode>>&& nodes) override;
  void UpdateLayout(std::weak_ptr<RootNode> root_node, const std::vector<std::shared_ptr<DomNode>>& nodes) override;
  void MoveRenderNode(std::weak_ptr<RootNode> root_node, std::vector<int32_t>&& moved_ids, int32_t from_pid, int32_t to_pid) override;
  void EndBatch(std::weak_ptr<RootNode> root_node) override;

  void BeforeLayout(std::weak_ptr<RootNode> root_node) override;
  void AfterLayout(std::weak_ptr<RootNode> root_node) override;

  using HippyValue = footstone::value::HippyValue;

  void AddEventListener(std::weak_ptr<RootNode> root_node, std::weak_ptr<DomNode> dom_node, const std::string& name) override;

  void RemoveEventListener(std::weak_ptr<RootNode> root_node, std::weak_ptr<DomNode> dom_node, const std::string& name) override;

  void CallFunction(std::weak_ptr<RootNode> root_node, std::weak_ptr<DomNode> dom_node, const std::string& name, const DomArgument& param,
                    uint32_t cb_id) override;

  void ReceivedEvent(std::weak_ptr<RootNode> root_node, uint32_t dom_id, const std::string& event_name,
                     const std::shared_ptr<HippyValue>& params, bool capture, bool bubble);

  void SetDensity(float density) { density_ = density; }
  float GetDensity() { return density_; }

  void SetDomManager(std::weak_ptr<DomManager> dom_manager) { dom_manager_ = dom_manager; }
  std::shared_ptr<DomManager> GetDomManager() const { return dom_manager_.lock(); }

  static footstone::utils::PersistentObjectMap<uint32_t, std::shared_ptr<NativeRenderManager>>& PersistentMap() {
    return persistent_map_;
  }

 private:
  inline void MarkTextDirty(std::weak_ptr<RootNode> weak_root_node, uint32_t node_id);

  inline float DpToPx(float dp) const;

  inline float PxToDp(float px) const;

  void CallNativeMethod(const std::string& method, uint32_t root_id, const std::pair<uint8_t*, size_t>& buffer);

  void CallNativeMethod(const std::string& method, uint32_t root_id);

  void CallNativeMeasureMethod(const uint32_t root_id, const int32_t id, const float width, const int32_t width_mode, const float height,
                               const int32_t height_mode, int64_t& result);

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

  void HandleListenerOps(std::weak_ptr<RootNode> root_node, std::map<uint32_t, std::vector<ListenerOp>>& ops, const std::string& method_name);

 private:
  uint32_t id_;
  std::shared_ptr<JavaRef> render_delegate_;
  std::shared_ptr<footstone::value::Serializer> serializer_;
  float density_ = 1.0f;
  std::map<uint32_t, std::vector<ListenerOp>> event_listener_ops_;

  std::weak_ptr<DomManager> dom_manager_;
  static std::atomic<uint32_t> unique_native_render_manager_id_;
  static footstone::utils::PersistentObjectMap<uint32_t, std::shared_ptr<NativeRenderManager>> persistent_map_;
};
}  // namespace native
}  // namespace render
}  // namespace hippy
