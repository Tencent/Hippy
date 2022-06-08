#pragma once

#include "dom/render_manager.h"

namespace hippy {
inline namespace dom {

class LayerOptimizedRenderManager : public RenderManager {
 public:
  LayerOptimizedRenderManager(std::shared_ptr<RenderManager> render_manager);

  void CreateRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) override;
  void UpdateRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) override;
  void MoveRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) override;
  void DeleteRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) override;
  void UpdateLayout(const std::vector<std::shared_ptr<DomNode>>& nodes) override;
  void MoveRenderNode(std::vector<int32_t>&& moved_ids, int32_t from_pid, int32_t to_pid) override;
  void EndBatch() override;

  void BeforeLayout() override;
  void AfterLayout() override;
  
  void AddEventListener(std::weak_ptr<DomNode> dom_node, const std::string& name) override;
  void RemoveEventListener(std::weak_ptr<DomNode> dom_node, const std::string& name) override;

  void CallFunction(std::weak_ptr<DomNode> dom_node, const std::string& name,
                        const DomArgument& param,
                        uint32_t cb_Id) override;

 protected:
  bool ComputeLayoutOnly(const std::shared_ptr<DomNode>& node) const;

  virtual bool CheckStyleJustLayout(const std::shared_ptr<DomNode>& node) const;

  virtual bool IsJustLayoutProp(const char *prop_name) const;

  static std::shared_ptr<DomNode> GetRenderParent(const std::shared_ptr<DomNode>& node);

  int32_t CalculateRenderNodeIndex(const std::shared_ptr<DomNode>& parent,
                                   const std::shared_ptr<DomNode>& node);

 private:
  std::shared_ptr<RenderManager> render_manager_;

  static bool CanBeEliminated(const std::shared_ptr<DomNode>& node);

  void UpdateRenderInfo(const std::shared_ptr<DomNode>& node);

  std::pair<bool, int32_t>
  CalculateRenderNodeIndex(const std::shared_ptr<DomNode>& parent,
                           const std::shared_ptr<DomNode>& node, int32_t index);

  void FindValidChildren(const std::shared_ptr<DomNode>& node,
                         std::vector<std::shared_ptr<DomNode>>& valid_children_nodes);
};

}  // namespace dom
}  // namespace hippy
