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
using hippy::OnShowEventListener;
using hippy::ShowEvent;

class VoltronRenderManager : public RenderManager, private VoltronRenderTaskRunner {
 public:
  explicit VoltronRenderManager(int32_t root_id, int32_t engine_id);
  ~VoltronRenderManager() override;
  void CreateRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) override;
  void UpdateRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) override;
  void DeleteRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) override;
  void UpdateLayout(const std::vector<std::shared_ptr<DomNode>>& nodes) override;
  void MoveRenderNode(std::vector<int32_t>&& ids, int32_t pid, int32_t id) override;

  void Batch() override;

  void CallFunction(std::weak_ptr<DomNode> domNode, const std::string& name,
                    std::unordered_map<std::string, std::shared_ptr<DomValue>> param,
                    DispatchFunctionCallback cb) override;

  void SetClickEventListener(int32_t id, OnClickEventListener listener) override;
  void RemoveClickEventListener(int32_t id) override;
  void SetLongClickEventListener(int32_t id, OnLongClickEventListener listener) override;
  void RemoveLongClickEventListener(int32_t id) override;
  void SetTouchEventListener(int32_t id, TouchEvent event, OnTouchEventListener listener) override;
  void RemoveTouchEventListener(int32_t id, TouchEvent event) override;
  void SetShowEventListener(int32_t id, ShowEvent event, OnShowEventListener listener) override;
  void RemoveShowEventListener(int32_t id, ShowEvent event) override;

  int32_t GetRootId() {
    return root_id_;
  }

  std::unique_ptr<std::vector<uint8_t>> Consume() {
    return ConsumeQueue();
  }

 private:
  int32_t root_id_;
};

}  // namespace voltron
