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

#include <any>
#include <cstdint>
#include <memory>

#include "dom/dom_argument.h"
#include "dom/dom_listener.h"
#include "dom/dom_node.h"
#include "footstone/hippy_value.h"

namespace hippy {
inline namespace dom {

class DomNode;

class RenderManager {
 public:
  RenderManager(const std::string& name): density_(1.0f), name_(name){}

  virtual ~RenderManager() = default;

  virtual void CreateRenderNode(std::weak_ptr<RootNode> root_node,
                                std::vector<std::shared_ptr<DomNode>>&& nodes) = 0;
  virtual void UpdateRenderNode(std::weak_ptr<RootNode> root_node,
                                std::vector<std::shared_ptr<DomNode>>&& nodes) = 0;
  virtual void MoveRenderNode(std::weak_ptr<RootNode> root_node,
                              std::vector<std::shared_ptr<DomNode>>&& nodes) = 0;
  virtual void DeleteRenderNode(std::weak_ptr<RootNode> root_node,
                                std::vector<std::shared_ptr<DomNode>>&& nodes) = 0;
  virtual void UpdateLayout(std::weak_ptr<RootNode> root_node,
                            const std::vector<std::shared_ptr<DomNode>>& nodes) = 0;
  virtual void MoveRenderNode(std::weak_ptr<RootNode> root_node,
                              std::vector<int32_t>&& moved_ids,
                              int32_t from_pid,
                              int32_t to_pid) = 0;
  virtual void EndBatch(std::weak_ptr<RootNode> root_node) = 0;

  virtual void BeforeLayout(std::weak_ptr<RootNode> root_node) = 0;
  virtual void AfterLayout(std::weak_ptr<RootNode> root_node) = 0;

  using DomArgument = hippy::dom::DomArgument;
  virtual void AddEventListener(std::weak_ptr<RootNode> root_node,
                                std::weak_ptr<DomNode> dom_node,
                                const std::string& name) = 0;
  virtual void RemoveEventListener(std::weak_ptr<RootNode> root_node,
                                   std::weak_ptr<DomNode> dom_node,
                                   const std::string& name) = 0;
  virtual void CallFunction(std::weak_ptr<RootNode> root_node,
                            std::weak_ptr<DomNode> dom_node,
                            const std::string& name,
                            const DomArgument& param,
                            uint32_t cb_id) = 0;

  void SetDensity(float density) { density_ = density; }
  float GetDensity() { return density_; }
  void SetName(const std::string& name) { name_ = name; }
  std::string GetName() { return name_; }

protected:
  float density_;
  std::string name_;
};

}  // namespace dom
}  // namespace hippy
