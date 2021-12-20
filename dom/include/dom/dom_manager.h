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

namespace hippy {
inline namespace dom {

class TaskRunner;
class DomNode;
class RenderManager;

class DomManager {
 public:
  using DomValue = tdf::base::DomValue;

  DomManager(uint32_t root_id);
  ~DomManager();

  static void HandleEvent(const std::shared_ptr<DomEvent> &event);

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
  uint32_t AddEventListener(uint32_t id, const std::string &name, bool use_capture,
                            const EventCallback &cb);
  void RemoveEventListener(uint32_t id, const std::string &name, bool use_capture);
  void CallFunction(uint32_t id, const std::string &name,
                    const DomValue &param, const CallFunctionCallback &cb);
  void AddListenerOperation(std::shared_ptr<DomNode> node, const std::string& name);
  std::tuple<float, float> GetRootSize();
  void SetRootSize(float width, float height);
  void AddLayoutChangedNode(const std::shared_ptr<DomNode> &node);
  void SetRootNode(const std::shared_ptr<DomNode> &root_node);
  void DoLayout();

 private:
  uint32_t root_id_;
  std::shared_ptr<DomNode> root_node_;
  std::weak_ptr<RenderManager> render_manager_;
  std::shared_ptr<TaskRunner> runner_;

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
};

}  // namespace dom
}  // namespace hippy
