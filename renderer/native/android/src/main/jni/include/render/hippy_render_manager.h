#pragma once

#include <memory>

#include "jni/scoped_java_ref.h"

#include "dom/dom_node.h"
#include "dom/render_manager.h"
#include "dom/serializer.h"

// class JavaRef;

namespace hippy {
inline namespace dom {

class HippyRenderManager : public RenderManager {
 public:
  HippyRenderManager(std::shared_ptr<JavaRef> render_delegate)
      : render_delegate_(std::move(render_delegate)), serializer_(std::make_shared<tdf::base::Serializer>()){};

  ~HippyRenderManager(){};

  void CreateRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) override;
  void UpdateRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) override;
  void DeleteRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) override;
  void UpdateLayout(const std::vector<std::shared_ptr<DomNode>>& nodes) override;
  void MoveRenderNode(std::vector<int32_t>&& moved_ids, int32_t from_pid, int32_t to_pid) override;
  void Batch() override;

  using DomValue = tdf::base::DomValue;

  void AddEventListener(std::weak_ptr<DomNode> dom_node, const std::string& name) override;

  void RemoveEventListener(std::weak_ptr<DomNode> dom_node, const std::string& name) override;

  void CallFunction(std::weak_ptr<DomNode> dom_node, const std::string& name, const DomValue& param,
                    CallFunctionCallback cb) override;

  void SetDensity(float density) { density_ = density; };

 private:
  inline float DpToPx(float dp);

  void CallNativeMethod(const std::pair<uint8_t*, size_t>& buffer, const std::string& method);

  void CallNativeMethod(const std::string& method);

  std::shared_ptr<JavaRef> render_delegate_;
  std::shared_ptr<tdf::base::Serializer> serializer_;
  float density_ = 1.0f;
};
}  // namespace dom
}  // namespace hippy