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

#include "dom/node_props.h"
#include "dom/render_manager.h"
#include "dom/layout_node.h"
#include "render/ffi/common_header.h"
#include "render_task_runner.h"

namespace voltron {

constexpr char kEnableScale[] = "enableScale";

 class VoltronRenderManager : public hippy::RenderManager,
                             private VoltronRenderTaskRunner {
public:
  using LayoutNode = hippy::LayoutNode;
  using DomArgument = hippy::DomArgument;

  explicit VoltronRenderManager(int32_t root_id, int32_t engine_id);
  ~VoltronRenderManager() override;
  void CreateRenderNode(std::vector<std::shared_ptr<DomNode>> &&nodes) override;
  void UpdateRenderNode(std::vector<std::shared_ptr<DomNode>> &&nodes) override;
  void DeleteRenderNode(std::vector<std::shared_ptr<DomNode>> &&nodes) override;
  void UpdateLayout(const std::vector<std::shared_ptr<DomNode>> &nodes) override;
  void MoveRenderNode(std::vector<int32_t> &&ids, int32_t pid,
                      int32_t id) override;
  void MoveRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) override;

  void EndBatch() override;
  void BeforeLayout() override;
  void AfterLayout() override;

  void AddEventListener(std::weak_ptr<DomNode> dom_node,
                        const std::string &name) override;
  void RemoveEventListener(std::weak_ptr<DomNode> dom_node,
                           const std::string &name) override;
  void CallFunction(std::weak_ptr<DomNode> dom_node, const std::string &name,
                    const DomArgument &param, uint32_t cb_id) override;
  void CallEvent(std::weak_ptr<DomNode> dom_node, const std::string &name,
                 const std::unique_ptr<EncodableValue> &params);
  void Notify();

  int32_t GetRootId() const { return root_id_; }

private:
  void MarkTextDirty(uint32_t node_id);
  static void MarkDirtyProperty(std::shared_ptr<std::unordered_map<std::string, std::shared_ptr<DomValue>>> diff_style,
                         const char *prop_name,
                         std::shared_ptr<LayoutNode> layout_node);

  int32_t root_id_;

  std::mutex mutex_;
  std::condition_variable cv_;
  bool notified_ = false;
};

} // namespace voltron
