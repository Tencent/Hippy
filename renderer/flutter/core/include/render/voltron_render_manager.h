#pragma once

#include "dom/render_manager.h"
#include "render/common.h"
#include "render/render_task_runner.h"

namespace voltron {

using hippy::CallFunctionCallback;
using hippy::LayoutDiffMapKey;
using hippy::LayoutResult;
using hippy::RenderManager;

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
  void OnLayoutBefore() override;
  void OnLayoutFinish() override;

  void AddEventListener(std::weak_ptr<DomNode> dom_node, const std::string& name) override;
  void RemoveEventListener(std::weak_ptr<DomNode> dom_node, const std::string& name) override;
  void CallFunction(std::weak_ptr<DomNode> dom_node, const std::string& name, const DomValue& param,
                    CallFunctionCallback cb) override;
  void Notify();

  int32_t GetRootId() const {
    return root_id_;
  }

 private:
  int32_t root_id_;

  std::mutex mutex_;
  std::condition_variable cv_;
  bool notified_ = false;
};

}  // namespace voltron
