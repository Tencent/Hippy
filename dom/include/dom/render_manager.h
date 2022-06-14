#pragma once

#include <any>
#include <cstdint>
#include <memory>

#include "dom/dom_argument.h"
#include "dom/dom_listener.h"
#include "dom/dom_node.h"
#include "dom/dom_value.h"

namespace hippy {
inline namespace dom {

class DomNode;

class RenderManager {
 public:
  virtual ~RenderManager() = default;

  virtual void CreateRenderNode(std::weak_ptr<RootNode> root_node, std::vector<std::shared_ptr<DomNode>>&& nodes) = 0;
  virtual void UpdateRenderNode(std::weak_ptr<RootNode> root_node, std::vector<std::shared_ptr<DomNode>>&& nodes) = 0;
  virtual void MoveRenderNode(std::weak_ptr<RootNode> root_node, std::vector<std::shared_ptr<DomNode>>&& nodes) = 0;
  virtual void DeleteRenderNode(std::weak_ptr<RootNode> root_node, std::vector<std::shared_ptr<DomNode>>&& nodes) = 0;
  virtual void UpdateLayout(std::weak_ptr<RootNode> root_node, const std::vector<std::shared_ptr<DomNode>>& nodes) = 0;
  virtual void MoveRenderNode(std::weak_ptr<RootNode> root_node, std::vector<int32_t>&& moved_ids, int32_t from_pid, int32_t to_pid) = 0;
  virtual void EndBatch(std::weak_ptr<RootNode> root_node) = 0;

  virtual void BeforeLayout(std::weak_ptr<RootNode> root_node) = 0;
  virtual void AfterLayout(std::weak_ptr<RootNode> root_node) = 0;

  using DomArgument = hippy::dom::DomArgument;
  virtual void AddEventListener(std::weak_ptr<RootNode> root_node, std::weak_ptr<DomNode> dom_node, const std::string& name) = 0;
  virtual void RemoveEventListener(std::weak_ptr<RootNode> root_node, std::weak_ptr<DomNode> dom_node, const std::string& name) = 0;
  virtual void CallFunction(std::weak_ptr<RootNode> root_node, std::weak_ptr<DomNode> dom_node, const std::string& name, const DomArgument& param,
                            uint32_t cb_id) = 0;
};

}  // namespace dom
}  // namespace hippy
