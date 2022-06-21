#pragma once

#include "footstone/task_runner.h"
#include "dom/dom_node.h"

namespace hippy {
inline namespace dom {

class RootNode : public DomNode {
 public:
  using TaskRunner = footstone::runner::TaskRunner;

  RootNode(uint32_t id);
  RootNode();

  inline std::weak_ptr<DomManager> GetDomManager() {
    return dom_manager_;
  }
  inline void SetDomManager(std::weak_ptr<DomManager> dom_manager) {
    animation_manager_->SetRootNode(GetWeakSelf());
    dom_manager_ = dom_manager;
  }
  inline std::shared_ptr<AnimationManager> GetAnimationManager() { return animation_manager_; }
  inline void SetDelegateTaskRunner(std::shared_ptr<TaskRunner> runner) {
    delegate_task_runner_ = runner;
  }
  inline std::weak_ptr<TaskRunner> GetDelegateTaskRunner() {
    return delegate_task_runner_;
  }

  virtual void AddEventListener(const std::string& name,
                                uint64_t listener_id,
                                bool use_capture,
                                const EventCallback& cb) override;
  virtual void RemoveEventListener(const std::string& name, uint64_t listener_id) override;

  void CreateDomNodes(std::vector<std::shared_ptr<DomInfo>>&& nodes);
  void UpdateDomNodes(std::vector<std::shared_ptr<DomInfo>>&& nodes);
  void MoveDomNodes(std::vector<std::shared_ptr<DomInfo>>&& nodes);
  void DeleteDomNodes(std::vector<std::shared_ptr<DomInfo>>&& nodes);
  void UpdateAnimation(std::vector<std::shared_ptr<DomNode>>&& nodes);
  void CallFunction(uint32_t id, const std::string &name,
                    const DomArgument &param, const CallFunctionCallback &cb);
  void SyncWithRenderManager(const std::shared_ptr<RenderManager>& render_manager);
  void DoAndFlushLayout(const std::shared_ptr<RenderManager>& render_manager);
  void AddEvent(uint32_t id, const std::string& event_name);
  void RemoveEvent(uint32_t id, const std::string& event_name);
  void HandleEvent(const std::shared_ptr<DomEvent> &event) override;
  void UpdateRenderNode(const std::shared_ptr<DomNode> &node);

  std::shared_ptr<DomNode> GetNode(uint32_t id);
  std::tuple<float, float> GetRootSize();
  void SetRootSize(float width, float height);
  void Traverse(const std::function<void(const std::shared_ptr<DomNode>&)>& on_traverse);
  void AddInterceptor(const std::shared_ptr<DomActionInterceptor>& interceptor);

 private:
  struct DomOperation {
    static constexpr int kOpCreate = 1;
    static constexpr int kOpUpdate = 2;
    static constexpr int kOpDelete = 3;
    static constexpr int kOpMove = 4;

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
  std::weak_ptr<RootNode> GetWeakSelf();

  std::unordered_map<uint32_t, std::weak_ptr<DomNode>> nodes_;
  std::weak_ptr<TaskRunner> delegate_task_runner_;
  std::weak_ptr<DomManager> dom_manager_;
  std::vector<std::shared_ptr<DomActionInterceptor>> interceptors_;
  std::shared_ptr<AnimationManager> animation_manager_;
};

}  // namespace dom
}  // namespace hippy
