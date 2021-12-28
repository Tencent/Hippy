#pragma once

#include <cstdint>
#include <future>
#include <map>
#include <memory>
#include <vector>

#include "base/logging.h"
#include "dom/dom_event.h"
#include "dom/dom_listener.h"
#include "dom/dom_value.h"
#include "dom/layout_node.h"
#include "dom/dom_argument.h"
#include "core/base/task_runner.h"
#include "core/task/common_task.h"

namespace hippy {
inline namespace dom {

class DomNode;
class RenderManager;

class DomManager: public std::enable_shared_from_this<DomManager> {
 public:
  using DomValue = tdf::base::DomValue;

  DomManager(uint32_t root_id);
  ~DomManager();



  static void HandleListener(const std::weak_ptr<DomNode>& weak_target,
                             const std::string& name,
                             const std::shared_ptr<DomArgument>& param);

  inline std::shared_ptr<RenderManager> GetRenderManager() { return render_manager_.lock(); }
  inline void SetRenderManager(std::shared_ptr<RenderManager> render_manager) {
    render_manager_ = render_manager;
  }
  inline uint32_t GetRootId() { return root_id_; }
  inline std::shared_ptr<DomNode> GetNode(uint32_t id) { return dom_node_registry_.GetNode(id); }

  void CreateDomNodes(std::vector<std::shared_ptr<DomNode>> &&nodes);
  void UpdateDomNodes(std::vector<std::shared_ptr<DomNode>> &&nodes);
  void DeleteDomNodes(std::vector<std::shared_ptr<DomNode>> &&nodes);
  void BeginBatch();
  void EndBatch();
  // 返回0代表失败，正常id从1开始
  void AddEventListener(uint32_t id, const std::string &name, bool use_capture,
                            const EventCallback &cb, const CallFunctionCallback& callback);
  void RemoveEventListener(uint32_t id, const std::string &name, uint32_t listener_id);
  // RenderListener 没有捕获冒泡流程，EventListener 拥有捕获冒泡流程
  void AddRenderListener(uint32_t id, const std::string &name,
                             const RenderCallback &cb, const CallFunctionCallback& callback);
  void RemoveRenderListener(uint32_t id, const std::string &name, uint32_t listener_id);
  void CallFunction(uint32_t id, const std::string &name,
                    const DomArgument &param, const CallFunctionCallback &cb);
  std::tuple<float, float> GetRootSize();
  void SetRootSize(float width, float height);
  void SetRootNode(const std::shared_ptr<DomNode> &root_node);
  void DoLayout();
  void PostTask(std::function<void()> func);

 private:
  uint32_t root_id_;
  std::shared_ptr<DomNode> root_node_;
  std::weak_ptr<RenderManager> render_manager_;
  std::shared_ptr<hippy::base::TaskRunner> dom_task_runner_;

  class DomNodeRegistry {
   public:
    void AddNode(const std::shared_ptr<DomNode> &node);
    std::shared_ptr<DomNode> GetNode(int32_t id);
    void RemoveNode(int32_t id);

   private:
    std::map<int32_t, std::shared_ptr<DomNode>> nodes_;
  };

  DomNodeRegistry dom_node_registry_;

  using DomOperation = std::function<void(void)>;
  std::vector<DomOperation> batched_operations_;
  std::vector<DomOperation> add_listener_operations_;
  std::vector<std::shared_ptr<DomNode>> layout_changed_nodes_;
  void HandleEvent(const std::shared_ptr<DomEvent>& event);
  void AddLayoutChangedNode(const std::shared_ptr<DomNode>& node);
  void AddEventListenerOperation(const std::shared_ptr<DomNode>& node, const std::string& name);
  void AddRenderListenerOperation(const std::shared_ptr<DomNode>& node, const std::string& name);
  friend DomNode;
};

}  // namespace dom
}  // namespace hippy
