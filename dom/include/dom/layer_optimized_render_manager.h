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

#include "dom/render_manager.h"

namespace hippy {
inline namespace dom {

class LayerOptimizedRenderManager : public RenderManager {
 public:
  LayerOptimizedRenderManager(std::shared_ptr<RenderManager> render_manager);

  void CreateRenderNode(std::weak_ptr<RootNode> root_node, std::vector<std::shared_ptr<DomNode>>&& nodes) override;
  void UpdateRenderNode(std::weak_ptr<RootNode> root_node, std::vector<std::shared_ptr<DomNode>>&& nodes) override;
  void MoveRenderNode(std::weak_ptr<RootNode> root_node, std::vector<std::shared_ptr<DomNode>>&& nodes) override;
  void DeleteRenderNode(std::weak_ptr<RootNode> root_node, std::vector<std::shared_ptr<DomNode>>&& nodes) override;
  void UpdateLayout(std::weak_ptr<RootNode> root_node, const std::vector<std::shared_ptr<DomNode>>& nodes) override;
  void MoveRenderNode(std::weak_ptr<RootNode> root_node, std::vector<int32_t>&& moved_ids, int32_t from_pid, int32_t to_pid) override;
  void EndBatch(std::weak_ptr<RootNode> root_node) override;

  void BeforeLayout(std::weak_ptr<RootNode> root_node) override;
  void AfterLayout(std::weak_ptr<RootNode> root_node) override;

  void AddEventListener(std::weak_ptr<RootNode> root_node, std::weak_ptr<DomNode> dom_node, const std::string& name) override;
  void RemoveEventListener(std::weak_ptr<RootNode> root_node, std::weak_ptr<DomNode> dom_node, const std::string& name) override;

  void CallFunction(std::weak_ptr<RootNode> root_node, std::weak_ptr<DomNode> dom_node, const std::string& name,
                    const DomArgument &param,
                    uint32_t cb_Id) override;

 protected:
  bool ComputeLayoutOnly(const std::shared_ptr<DomNode>& node) const;

  virtual bool CheckStyleJustLayout(const std::shared_ptr<DomNode>& node) const;

  virtual bool IsJustLayoutProp(const char *prop_name) const;

  static std::shared_ptr<DomNode> GetRenderParent(const std::shared_ptr<DomNode>& node);

  int32_t CalculateRenderNodeIndex(const std::shared_ptr<DomNode>& parent,
                                   const std::shared_ptr<DomNode>& node);

 private:
  std::shared_ptr<RenderManager> render_manager_;

  static bool CanBeEliminated(const std::shared_ptr<DomNode>& node);

  void UpdateRenderInfo(const std::shared_ptr<DomNode>& node);

  std::pair<bool, int32_t>
  CalculateRenderNodeIndex(const std::shared_ptr<DomNode>& parent,
                           const std::shared_ptr<DomNode>& node, int32_t index);

  void FindValidChildren(const std::shared_ptr<DomNode>& node,
                         std::vector<std::shared_ptr<DomNode>>& valid_children_nodes);
};

}  // namespace dom
}  // namespace hippy
