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

  virtual void CreateRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) = 0;
  virtual void UpdateRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) = 0;
  virtual void DeleteRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) = 0;
  virtual void UpdateLayout(const std::vector<std::shared_ptr<DomNode>>& nodes) = 0;
  virtual void MoveRenderNode(std::vector<int32_t>&& moved_ids, int32_t from_pid, int32_t to_pid) = 0;
  virtual void EndBatch() = 0;

  virtual void BeforeLayout() = 0;
  virtual void AfterLayout() = 0;
  
  virtual void RegisterVsyncSignal(const std::string &key, float rate, std::function<void()> vsync_callback) = 0;
  virtual void UnregisterVsyncSignal(const std::string &key) = 0;

  using DomArgument = hippy::dom::DomArgument;
  virtual void AddEventListener(std::weak_ptr<DomNode> dom_node, const std::string& name) = 0;
  virtual void RemoveEventListener(std::weak_ptr<DomNode> dom_node, const std::string& name) = 0;
  virtual void CallFunction(std::weak_ptr<DomNode> dom_node, const std::string& name, const DomArgument& param,
                            uint32_t cb_id) = 0;
};

}  // namespace dom
}  // namespace hippy
