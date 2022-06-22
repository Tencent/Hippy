#pragma once

#include <memory>

#include "jni/scoped_java_ref.h"

#include "dom/dom_node.h"
#include "base/macros.h"
#include "dom/render_manager.h"
#include "dom/serializer.h"

namespace hippy {
inline namespace dom {

class NativeRenderManager : public RenderManager {
 public:
  NativeRenderManager(std::shared_ptr<JavaRef> render_delegate);

  virtual ~NativeRenderManager() = default;
  NativeRenderManager(const NativeRenderManager &) = delete;
  NativeRenderManager &operator=(const NativeRenderManager &) = delete;
  NativeRenderManager(NativeRenderManager &&) = delete;
  NativeRenderManager &operator=(NativeRenderManager &&) = delete;

  int32_t GetId() { return id_; }

  void CreateRenderNode(std::weak_ptr<RootNode> root_node, std::vector<std::shared_ptr<DomNode>>&& nodes) override;
  void UpdateRenderNode(std::weak_ptr<RootNode> root_node, std::vector<std::shared_ptr<DomNode>>&& nodes) override;
  void DeleteRenderNode(std::weak_ptr<RootNode> root_node, std::vector<std::shared_ptr<DomNode>>&& nodes) override;
  void MoveRenderNode(std::weak_ptr<RootNode> root_node, std::vector<std::shared_ptr<DomNode>>&& nodes) override;
  void UpdateLayout(std::weak_ptr<RootNode> root_node, const std::vector<std::shared_ptr<DomNode>>& nodes) override;
  void MoveRenderNode(std::weak_ptr<RootNode> root_node, std::vector<int32_t>&& moved_ids, int32_t from_pid, int32_t to_pid) override;
  void EndBatch(std::weak_ptr<RootNode> root_node) override;

  void BeforeLayout(std::weak_ptr<RootNode> root_node) override;
  void AfterLayout(std::weak_ptr<RootNode> root_node) override;

  using DomValue = tdf::base::DomValue;

  void AddEventListener(std::weak_ptr<RootNode> root_node, std::weak_ptr<DomNode> dom_node, const std::string& name) override;

  void RemoveEventListener(std::weak_ptr<RootNode> root_node, std::weak_ptr<DomNode> dom_node, const std::string& name) override;

  void CallFunction(std::weak_ptr<RootNode> root_node, std::weak_ptr<DomNode> dom_node, const std::string& name, const DomArgument& param,
                    uint32_t cb_id) override;

  void SetDensity(float density) { density_ = density; }
  float GetDensity() { return density_; }

  void SetDomManager(std::weak_ptr<DomManager> dom_manager) { dom_manager_ = dom_manager; }
  std::shared_ptr<DomManager> GetDomManager() const { return dom_manager_.lock(); }

  static void Insert(const std::shared_ptr<NativeRenderManager>& render_manager);
  static std::shared_ptr<NativeRenderManager> Find(int32_t id);
  static bool Erase(int32_t id);
  static bool Erase(const std::shared_ptr<NativeRenderManager>& render_manager);

 private:
  inline void MarkTextDirty(std::weak_ptr<RootNode> weak_root_node, uint32_t node_id);

  inline float DpToPx(float dp) const;

  inline float PxToDp(float px) const;

  void CallNativeMethod(const std::string& method, uint32_t root_id, const std::pair<uint8_t*, size_t>& buffer);

  void CallNativeMethod(const std::string& method, uint32_t root_id);

  void CallNativeMeasureMethod(const uint32_t root_id, const int32_t id, const float width, const int32_t width_mode, const float height,
                               const int32_t height_mode, int64_t& result);

  struct ListenerOp {
    bool add;
    std::weak_ptr<DomNode> dom_node;
    std::string name;

    ListenerOp(bool add, std::weak_ptr<DomNode> dom_node, const std::string& name) {
      this->add = add;
      this->dom_node = dom_node;
      this->name = name;
    }
  };

  void HandleListenerOps(std::weak_ptr<RootNode> root_node, std::map<uint32_t, std::vector<ListenerOp>>& ops, const std::string& method_name);

 private:
  int32_t id_;
  std::shared_ptr<JavaRef> render_delegate_;
  std::shared_ptr<tdf::base::Serializer> serializer_;
  float density_ = 1.0f;
  std::map<uint32_t, std::vector<ListenerOp>> event_listener_ops_;

  std::weak_ptr<DomManager> dom_manager_;
};
}  // namespace dom
}  // namespace hippy
