#pragma once

#include <vector>
#include <cstdint>
#include <memory>
#include <future>

#include "dom/dom_node.h"
#include "dom/dom_value.h"
#include "dom/dom_listener.h"
#include "dom/layout_node.h"
#include "dom/render_manager.h"


namespace hippy {
namespace dom {

class TaskRunner;

class DomManager {
 public:
  using DomValue = tdf::base::DomValue;

  static std::shared_ptr<DomManager> GetDomManager(int32_t root_id);
  static void Destroy(int32_t root_id);

  DomManager();
  ~DomManager();

  void CreateDomNodes(std::vector<std::shared_ptr<DomNode>> nodes);
  void UpdateDomNode(std::vector<std::shared_ptr<DomNode>> nodes);
  void DeleteDomNode(std::vector<std::shared_ptr<DomNode>> nodes);
  void BeginBatch();
  void EndBatch();
  void CallFunction(int32_t id,
                    const std::string& name,
                    std::unordered_map<std::string, std::shared_ptr<DomValue>> param,
                    CallFunctionCallback cb);
  void AddTouchEventListener(int32_t id,
                           std::shared_ptr<TouchEvent> event,
                           OnTouchEventListener listener);
  void RemoveTouchEventListener(std::shared_ptr<TouchEvent> event);

  int32_t AddDomTreeEventListener(DomTreeEvent event, OnDomTreeEventListener listener);
  void RemoveDomTreeEventListener(DomTreeEvent event, int32_t listener_id);

 private:
  int32_t root_id_;
  std::shared_ptr<DomNode> root_node_;
  std::shared_ptr<RenderManager> render_manager_;
  std::unordered_map<DomTreeEvent, std::vector<OnDomTreeEventListener>> dom_tree_event_listeners;
  std::unordered_map<std::shared_ptr<DomEvent>, std::vector<OnDomEventListener>>
      dom_event_listener_map_;
  std::shared_ptr<TaskRunner> runner_;
};

}
}