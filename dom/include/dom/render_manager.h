#pragma once

#include <any>
#include <cstdint>
#include <memory>

#include "dom/dom_listener.h"
#include "dom/dom_value.h"
#include "dom/dom_node.h"

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
  virtual void MoveRenderNode(std::vector<int32_t>&& ids, int32_t pid, int32_t id) = 0;
  virtual void Batch() = 0;

  using DomValue = tdf::base::DomValue;
  virtual void CallFunction(std::weak_ptr<DomNode> domNode, const std::string& name,
                                std::unordered_map<std::string, std::shared_ptr<DomValue>> param,
                                DispatchFunctionCallback cb) = 0;

  virtual void SetClickEventListener(int32_t id, OnClickEventListener listener) = 0;
  virtual void RemoveClickEventListener(int32_t id) = 0;
  virtual void SetLongClickEventListener(int32_t id, OnLongClickEventListener listener) = 0;
  virtual void RemoveLongClickEventListener(int32_t id) = 0;
  virtual void SetTouchEventListener(int32_t id, TouchEvent event, OnTouchEventListener listener) = 0;
  virtual void RemoveTouchEventListener(int32_t id, TouchEvent event) = 0;
  virtual void SetShowEventListener(int32_t id, ShowEvent event, OnShowEventListener listener) = 0;
  virtual void RemoveShowEventListener(int32_t id, ShowEvent event) = 0;
};

}  // namespace dom
}  // namespace hippy
