#pragma once

#include "dom/render_manager.h"

#include "jni/scoped_java_ref.h"

#include "dom/dom_node.h"

// class JavaRef;

namespace hippy {
inline namespace dom {

class HippyRenderManager : public RenderManager {
public:
  HippyRenderManager(int64_t runtime_id,
                     std::shared_ptr<JavaRef> render_delegate)
      : runtime_id_(runtime_id), render_delegate_(std::move(render_delegate)){};

  ~HippyRenderManager(){};

  void CreateRenderNode(std::vector<std::shared_ptr<DomNode>> &&nodes) override;
  void UpdateRenderNode(std::vector<std::shared_ptr<DomNode>> &&nodes) override;
  void DeleteRenderNode(std::vector<std::shared_ptr<DomNode>> &&nodes) override;
  void
  UpdateLayout(const std::vector<std::shared_ptr<DomNode>> &nodes) override;
  void MoveRenderNode(std::vector<int32_t> &&moved_ids, int32_t from_pid,
                      int32_t to_pid) override;
  void Batch() override;

  using DomValue = tdf::base::DomValue;
  void
  CallFunction(std::weak_ptr<DomNode> domNode, const std::string &name,
               std::unordered_map<std::string, std::shared_ptr<DomValue>> param,
               DispatchFunctionCallback cb) override;

  void SetClickEventListener(int32_t id,
                             OnClickEventListener listener) override;
  void RemoveClickEventListener(int32_t id) override;
  void SetLongClickEventListener(int32_t id,
                                 OnLongClickEventListener listener) override;
  void RemoveLongClickEventListener(int32_t id) override;
  void SetTouchEventListener(int32_t id, TouchEvent event,
                             OnTouchEventListener listener) override;
  void RemoveTouchEventListener(int32_t id, TouchEvent event) override;
  void SetShowEventListener(int32_t id, ShowEvent event,
                            OnShowEventListener listener) override;
  void RemoveShowEventListener(int32_t id, ShowEvent event) override;

private:
  int64_t runtime_id_;
  std::shared_ptr<JavaRef> render_delegate_;
};
} // namespace dom
} // namespace hippy