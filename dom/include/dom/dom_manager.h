#pragma once

#include <cstdint>
#include <future>
#include <map>
#include <memory>
#include <vector>

#include "base/logging.h"
#include "dom/dom_listener.h"
#include "dom/dom_node.h"
#include "dom/dom_value.h"
#include "dom/layout_node.h"
#include "dom/render_manager.h"

namespace hippy {
inline namespace dom {

class TaskRunner;
class DomNode;
class RenderManager;

class DomManager {
 public:
  using DomValue = tdf::base::DomValue;

  DomManager(int32_t root_id);
  ~DomManager();

  void CreateDomNodes(std::vector<std::shared_ptr<DomNode>> nodes);
  void UpdateDomNodes(std::vector<std::shared_ptr<DomNode>> nodes);
  void DeleteDomNodes(std::vector<std::shared_ptr<DomNode>> nodes);
  void BeginBatch();
  void EndBatch();
  void CallFunction(int32_t id, const std::string& name,
                    std::unordered_map<std::string, std::shared_ptr<DomValue>> param, CallFunctionCallback cb);
  int32_t AddDomTreeEventListener(DomTreeEvent event, OnDomTreeEventListener listener);
  void RemoveDomTreeEventListener(DomTreeEvent event, int32_t listener_id);

  std::shared_ptr<RenderManager> GetRenderManager() { return render_manager_; }
  void SetRootSize(int32_t width, int32_t height);
  inline int32_t GetRooId() { return root_id_; }

 protected:
  void OnDomNodeCreated(std::shared_ptr<DomNode> node);
  void OnDomNodeUpdated(std::shared_ptr<DomNode> node);
  void OnDomNodeDeleted(std::shared_ptr<DomNode> node);

 private:
  int32_t root_id_;
  std::shared_ptr<DomNode> root_node_;
  std::shared_ptr<RenderManager> render_manager_;
  std::unordered_map<DomTreeEvent, std::vector<OnDomTreeEventListener>> dom_tree_event_listeners;
  std::unordered_map<DomEvent, std::vector<OnDomEventListener>> dom_event_listener_map_;
  std::shared_ptr<TaskRunner> runner_;

  class DomNodeRegistry {
   public:
    void AddNode(std::shared_ptr<DomNode> node);
    std::shared_ptr<DomNode> GetNode(int32_t id);
    void RemoveNode(int32_t id);

   private:
    std::map<int32_t, std::shared_ptr<DomNode>> nodes_;
  };

  DomNodeRegistry dom_node_registry_;

  using DomOperation = std::function<void(void)>;
  std::vector<DomOperation> batch_operations_;
};

}  // namespace dom
}  // namespace hippy
