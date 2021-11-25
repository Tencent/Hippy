#pragma once

#include "dom/render_manager.h"

namespace hippy {
inline namespace dom {

class RenderManagerProxy : public RenderManager {
 public:
  RenderManagerProxy(std::shared_ptr<RenderManager> render_manager);

  void CreateRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) override;
  void UpdateRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) override;
  void DeleteRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) override;
  void MoveRenderNode(std::vector<int32_t>&& ids,
                      int32_t pid,
                      int32_t id) override;

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

 protected:
  bool ComputeIsLayoutOnly(std::shared_ptr<DomNode> node) const;

  virtual bool CheckStyleJustLayout(std::shared_ptr<DomNode> node) const;

  virtual bool IsJustLayoutProp(const char *prop_name) const;

  std::shared_ptr<DomNode> GetRenderParent(std::shared_ptr<DomNode> node);

  int32_t CalculateRenderNodeIndex(std::shared_ptr<DomNode> parent,
                                   std::shared_ptr<DomNode> node);

 private:
  std::shared_ptr<RenderManager> render_manager_;

  bool UpdateRenderInfo(std::shared_ptr<DomNode> node);

  std::pair<bool, int32_t>
  CalculateRenderNodeIndex(std::shared_ptr<DomNode> parent,
                           std::shared_ptr<DomNode> node, int32_t index);

  void FindMoveChildren(std::shared_ptr<DomNode> node,
                        std::vector<int32_t> &removes);

  void ApplyLayoutRecursive(std::shared_ptr<DomNode> node);
};

}  // namespace dom
}  // namespace hippy
