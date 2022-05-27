#pragma once

#include "dom/dom_node.h"

namespace hippy {
inline namespace dom {

class RootNode : public DomNode {
 public:
  RootNode(uint32_t id);

  void CreateDomNodes(std::vector<std::shared_ptr<DomNode>>&& nodes);
  void UpdateDomNodes(std::vector<std::shared_ptr<DomNode>>&& nodes);
  void DeleteDomNodes(std::vector<std::shared_ptr<DomNode>>&& nodes);
  void UpdateAnimation(std::vector<std::shared_ptr<DomNode>>&& nodes);
  void SyncWithRenderManager(const std::shared_ptr<RenderManager>& render_manager);
  void DoAndFlushLayout(const std::shared_ptr<RenderManager>& render_manager);

  void AddEvent(uint32_t id, const std::string& event_name);
  void RemoveEvent(uint32_t id, const std::string& event_name);

  std::shared_ptr<DomNode> GetNode(uint32_t id);

 private:
  struct DomOperation {
    static constexpr int kOpCreate = 1;
    static constexpr int kOpUpdate = 2;
    static constexpr int kOpDelete = 3;

    int32_t op;
    std::vector<std::shared_ptr<DomNode>> nodes;
  };

  struct EventOperation {
    static constexpr int kOpAdd = 1;
    static constexpr int kOpRemove = 2;

    int32_t op;
    uint32_t id;
    std::string name;
  };

  std::vector<DomOperation> dom_operations_;
  std::vector<EventOperation> event_operations_;

  void FlushDomOperations(const std::shared_ptr<RenderManager>& render_manager);
  void FlushEventOperations(const std::shared_ptr<RenderManager>& render_manager);

  void OnDomNodeCreated(const std::shared_ptr<DomNode>& node);
  void OnDomNodeDeleted(const std::shared_ptr<DomNode>& node);

  std::unordered_map<uint32_t, std::weak_ptr<DomNode>> nodes_;
};

}  // namespace dom
}  // namespace hippy
