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

#include "common_header.h"
#include "dom/node_props.h"
#include "dom/render_manager.h"
#include "dom/layout_node.h"
#include "dom/root_node.h"
#include "render_task_runner.h"

namespace voltron {

constexpr char kEnableScale[] = "enableScale";

class VoltronRenderManager : public hippy::RenderManager,
                             public VoltronRenderTaskRunner {
 public:
  using LayoutNode = hippy::LayoutNode;
  using DomArgument = hippy::DomArgument;
  using RootNode = hippy::RootNode;
  using HippyValue = footstone::value::HippyValue;

  explicit VoltronRenderManager(uint32_t id);
  ~VoltronRenderManager() override;
  void CreateRenderNode(std::weak_ptr<RootNode> root_node,
                        std::vector<std::shared_ptr<DomNode>> &&nodes) override;
  void UpdateRenderNode(std::weak_ptr<RootNode> root_node,
                        std::vector<std::shared_ptr<DomNode>> &&nodes) override;
  void DeleteRenderNode(std::weak_ptr<RootNode> root_node,
                        std::vector<std::shared_ptr<DomNode>> &&nodes) override;
  void UpdateLayout(std::weak_ptr<RootNode> root_node,
                    const std::vector<std::shared_ptr<DomNode>> &nodes) override;
  void MoveRenderNode(std::weak_ptr<RootNode> root_node,
                      std::vector<int32_t> &&ids,
                      int32_t pid,
                      int32_t id) override;
  void MoveRenderNode(std::weak_ptr<RootNode> root_node,
                      std::vector<std::shared_ptr<DomNode>> &&nodes) override;

  void EndBatch(std::weak_ptr<RootNode> root_node) override;
  void BeforeLayout(std::weak_ptr<RootNode> root_node) override;
  void AfterLayout(std::weak_ptr<RootNode> root_node) override;

  void AddEventListener(std::weak_ptr<RootNode> root_node, std::weak_ptr<DomNode> dom_node,
                        const std::string &name) override;
  void RemoveEventListener(std::weak_ptr<RootNode> root_node, std::weak_ptr<DomNode> dom_node,
                           const std::string &name) override;
  void CallFunction(std::weak_ptr<RootNode> root_node, std::weak_ptr<DomNode> dom_node, const std::string &name,
                    const DomArgument &param, uint32_t cb_id) override;
  void CallEvent(std::weak_ptr<DomNode> dom_node, const std::string &name,
                 bool capture, bool bubble,
                 const std::unique_ptr<EncodableValue> &params);
  void Notify();

 private:
  void MarkTextDirty(const std::weak_ptr<RootNode> &root_node, uint32_t node_id);
  static void MarkDirtyProperty(std::shared_ptr<std::unordered_map<std::string,
                                                                   std::shared_ptr<HippyValue>>> diff_style,
                                const char *prop_name,
                                std::shared_ptr<LayoutNode> layout_node);

};

} // namespace voltron
