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

  void BeforeLayout() override;
  void AfterLayout() override;

  using DomValue = tdf::base::DomValue;

  void AddEventListener(std::weak_ptr<DomNode> dom_node, const std::string& name) override;

  void RemoveEventListener(std::weak_ptr<DomNode> dom_node, const std::string& name) override;

  void AddRenderListener(std::weak_ptr<DomNode> dom_node, const std::string& name) override {};

  void RemoveRenderListener(std::weak_ptr<DomNode> dom_node, const std::string& name) override {};

  void CallFunction(std::weak_ptr<DomNode> dom_node, const std::string& name, const DomArgument& param,
                    CallFunctionCallback cb) override;

  void SetDensity(float density) { density_ = density; };

 private:
  inline float DpToPx(float dp);

  inline float PxToDp(float px);

  void CallNativeMethod(const std::pair<uint8_t*, size_t>& buffer, const std::string& method);

  void CallNativeMethod(const std::string& method);

  void CallNativeMeasureMethod(const int32_t id, const float width, const int32_t width_mode, const float height,
                               const int32_t height_mode, int64_t& result);

  std::shared_ptr<JavaRef> render_delegate_;
  std::shared_ptr<tdf::base::Serializer> serializer_;
  float density_ = 1.0f;

  struct EventListenerOp {
    bool add;
    std::weak_ptr<DomNode> dom_node;
    std::string name;

    EventListenerOp(bool add, std::weak_ptr<DomNode> dom_node, const std::string& name) {
      this->add = add;
      this->dom_node = dom_node;
      this->name = name;
    }
  };

  void HandleEventListenerOps();

  std::vector<EventListenerOp> event_listener_ops_;
};
}  // namespace dom
}  // namespace hippy
