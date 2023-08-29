/**
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

#include "footstone/persistent_object_map.h"
#include "renderer/tdf/viewnode/view_node.h"
#include "dom/dom_node.h"
#include "dom/render_manager.h"
#include "footstone/serializer.h"
#include "vfs/uri_loader.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-copy"
#pragma clang diagnostic ignored "-Wextra-semi"
#include "core/platform/android/tdf_engine_android.h"
#pragma clang diagnostic pop
#include "renderer/tdf/viewnode/root_view_node.h"

namespace hippy {
inline namespace render {
inline namespace tdf {

static std::map<std::string, ViewNode::node_creator> node_creator_tables_;
static ViewNode::node_creator embedded_node_creator_ = nullptr;

void InitNodeCreator();
void RegisterNodeCreator(const std::string &, const ViewNode::node_creator &);
ViewNode::node_creator GetNodeCreator(const std::string &);

class TDFRenderManager
    : public RenderManager, public std::enable_shared_from_this<TDFRenderManager> {

 public:
  static footstone::utils::PersistentObjectMap<uint32_t, std::shared_ptr<TDFRenderManager>> &
  PersistentMap() {
    return persistent_map_;
  }

  TDFRenderManager();

  uint32_t GetId() { return id_; }

  void CreateRenderNode(std::weak_ptr<RootNode> root_node,
                        std::vector<std::shared_ptr<DomNode>> &&nodes) override;
  void UpdateRenderNode(std::weak_ptr<RootNode> root_node,
                        std::vector<std::shared_ptr<DomNode>> &&nodes) override;
  void MoveRenderNode(std::weak_ptr<RootNode> root_node,
                      std::vector<std::shared_ptr<DomNode>> &&nodes) override;
  void DeleteRenderNode(std::weak_ptr<RootNode> root_node,
                        std::vector<std::shared_ptr<DomNode>> &&nodes) override;
  void UpdateLayout(std::weak_ptr<RootNode> root_node,
                    const std::vector<std::shared_ptr<DomNode>> &nodes) override;
  void MoveRenderNode(std::weak_ptr<RootNode> root_node,
                      std::vector<int32_t> &&moved_ids,
                      int32_t from_pid,
                      int32_t to_pid,
                      int32_t index) override;
  void EndBatch(std::weak_ptr<RootNode> root_node) override;
  void BeforeLayout(std::weak_ptr<RootNode> root_node) override;
  void AfterLayout(std::weak_ptr<RootNode> root_node) override;
  void AddEventListener(std::weak_ptr<RootNode> root_node, std::weak_ptr<DomNode> dom_node,
                        const std::string &name) override;

  void RemoveEventListener(std::weak_ptr<RootNode> root_node, std::weak_ptr<DomNode> dom_node,
                           const std::string &name) override;
  void CallFunction(std::weak_ptr<RootNode> root_node,
                    std::weak_ptr<DomNode> dom_node,
                    const std::string &name,
                    const DomArgument &param,
                    uint32_t cb_id) override;

  void RegisterShell(uint32_t root_id, const std::shared_ptr<tdfcore::Shell> &shell,
                     const std::shared_ptr<tdfcore::RenderContext> &render_context);

  void SetDomManager(std::weak_ptr<DomManager> dom_manager) { dom_manager_ = dom_manager; }

  std::shared_ptr<DomManager> GetDomManager() const {
    return dom_manager_.lock();
  }

  void SetUriLoader(std::weak_ptr<UriLoader> uri_loader) {
    FOOTSTONE_CHECK(uri_loader.lock());
    uri_loader_ = uri_loader;
  }
  std::shared_ptr<UriLoader> GetUriLoader() const {
    FOOTSTONE_CHECK(uri_loader_.lock());
    return uri_loader_.lock();
  }

 private:
  void UnregisterAllMeasureFunctions(uint32_t root_id, const std::shared_ptr<hippy::DomNode>& node);

  footstone::utils::PersistentObjectMap<uint32_t, std::shared_ptr<RootViewNode>>
      root_view_nodes_map_;
  uint32_t id_;
  std::weak_ptr<DomManager> dom_manager_;
  std::weak_ptr<UriLoader> uri_loader_;
  static inline footstone::utils::PersistentObjectMap<uint32_t, std::shared_ptr<TDFRenderManager>>
      persistent_map_;
};

}  // namespace tdf
}  // namespace render
}  // namespace hippy
