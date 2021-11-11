#pragma once

#include <any>
#include <cstdint>
#include <memory>

#include "dom/dom_listener.h"
#include "dom/dom_value.h"
#include "dom/dom_node.h"

namespace hippy {
inline namespace dom {

class RenderManager {
 public:
  virtual ~RenderManager();

  virtual void CreateRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) = 0;
  virtual void UpdateRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) = 0;
  virtual void DeleteRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) = 0;
  virtual void MoveRenderNode(std::vector<int32_t>&& ids, int32_t pid, int32_t id) = 0;
  virtual void Batch() = 0;

  virtual void UpdateLayout(std::shared_ptr<LayoutResult> result) = 0;
  virtual void UpdateLayout(std::unordered_map<LayoutDiffMapKey, float> diff) = 0;
  using DomValue = tdf::base::DomValue;
  virtual void DispatchFunction(int32_t id, const std::string& name,
                                std::unordered_map<std::string, std::shared_ptr<DomValue>> param,
                                DispatchFunctionCallback cb) = 0;

  virtual int32_t AddClickEventListener(int32_t id, OnClickEventListener listener);
  virtual void RemoveClickEventListener(int32_t id, int32_t listener_id);
  virtual int32_t AddLongClickEventListener(int32_t id, OnLongClickEventListener listener);
  virtual void RemoveLongClickEventListener(int32_t id, int32_t listener_id);
  virtual void AddTouchEventListener(int32_t id, TouchEvent event, OnTouchEventListener listener) = 0;
  virtual void RemoveTouchEventListener(int32_t id, TouchEvent event) = 0;
};

}  // namespace dom
}  // namespace hippy
