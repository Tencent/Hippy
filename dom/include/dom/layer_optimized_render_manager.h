#pragma once

#include "dom/render_manager.h"

namespace hippy {
inline namespace dom {

class LayerOptimizedRenderManager : public RenderManager {
 public:
  LayerOptimizedRenderManager(std::shared_ptr<RenderManager> render_manager);

  void CreateRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) override;
  void UpdateRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) override;
  void DeleteRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) override;
  void UpdateLayout(const std::vector<std::shared_ptr<DomNode>>& nodes) override;
  void MoveRenderNode(std::vector<int32_t>&& moved_ids, int32_t from_pid, int32_t to_pid) override;

  void Batch() override;
  void OnLayoutBefore() override;
  void OnLayoutFinish() override;
  void AddEventListener(std::weak_ptr<DomNode> dom_node, const std::string& name) override;
  void RemoveEventListener(std::weak_ptr<DomNode> dom_node, const std::string& name) override;

  void CallFunction(std::weak_ptr<DomNode> dom_node, const std::string& name,
                        const DomValue& param,
                        CallFunctionCallback cb) override;

 protected:
  bool ComputeIsLayoutOnly(const std::shared_ptr<DomNode>& node) const;

  virtual bool CheckStyleJustLayout(std::shared_ptr<DomNode> node) const;

  virtual bool IsJustLayoutProp(const char *prop_name) const;

  static std::shared_ptr<DomNode> GetRenderParent(const std::shared_ptr<DomNode>& node);

  int32_t CalculateRenderNodeIndex(const std::shared_ptr<DomNode>& parent,
                                   const std::shared_ptr<DomNode>& node);

 private:
  std::shared_ptr<RenderManager> render_manager_;

  bool UpdateRenderInfo(const std::shared_ptr<DomNode>& node);

  std::pair<bool, int32_t>
  CalculateRenderNodeIndex(const std::shared_ptr<DomNode>& parent,
                           const std::shared_ptr<DomNode>& node, int32_t index);

  void FindMoveChildren(const std::shared_ptr<DomNode>& node,
                        std::vector<int32_t> &removes);

  void ApplyLayoutRecursive(const std::shared_ptr<DomNode>& node);
};

}  // namespace dom
}  // namespace hippy
