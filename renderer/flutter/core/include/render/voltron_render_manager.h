#pragma once

#include "dom/render_manager.h"
#include "render/common.h"
#include "render/render_task_runner.h"

namespace voltron {

using hippy::DispatchFunctionCallback;
using hippy::LayoutDiffMapKey;
using hippy::LayoutResult;
using hippy::OnClickEventListener;
using hippy::OnLongClickEventListener;
using hippy::OnTouchEventListener;
using hippy::RenderManager;
using hippy::TouchEvent;

class VoltronRenderManager : public RenderManager, private VoltronRenderTaskRunner {
 public:
  explicit VoltronRenderManager(int32_t root_id);
  ~VoltronRenderManager() override;
  void CreateRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) override;
  void UpdateRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) override;
  void DeleteRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) override;
  void MoveRenderNode(std::vector<int32_t>&& ids, int32_t pid, int32_t id) override;

  void Batch() override;

  void DispatchFunction(int32_t id, const std::string& name,
                        std::unordered_map<std::string, std::shared_ptr<DomValue>> param,
                        DispatchFunctionCallback cb) override;

  void AddTouchEventListener(int32_t id, TouchEvent event, OnTouchEventListener listener) override;
  void RemoveTouchEventListener(int32_t id, TouchEvent event) override;

  void UpdateLayout(std::shared_ptr<LayoutResult> result) override {}
  void UpdateLayout(std::unordered_map<LayoutDiffMapKey, float> diff) override {}
  int32_t AddClickEventListener(int32_t id, OnClickEventListener listener) override {}
  void RemoveClickEventListener(int32_t id, int32_t listener_id) override {}
  int32_t AddLongClickEventListener(int32_t id, OnLongClickEventListener listener) override {}
  void RemoveLongClickEventListener(int32_t id, int32_t listener_id) override {}

 private:
  int32_t root_id_;
};

}  // namespace voltron
