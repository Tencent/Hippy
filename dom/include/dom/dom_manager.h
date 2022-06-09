#pragma once

#include <cstdint>
#include <future>
#include <map>
#include <memory>
#include <vector>

#include "base/logging.h"
#include "base/macros.h"
#include "core/base/common.h"
#include "core/base/task_runner.h"
#include "core/task/common_task.h"
#include "dom/animation/animation_manager.h"
#include "dom/dom_action_interceptor.h"
#include "dom/dom_argument.h"
#include "dom/dom_event.h"
#include "dom/dom_listener.h"
#include "dom/dom_value.h"
#include "dom/layout_node.h"
#include "dom/scene.h"

namespace hippy {
inline namespace dom {

class AnimationManager;
class DomNode;
class RenderManager;
class RootNode;
class LayerOptimizedRenderManager;

struct DomInfo;

// This class is used to mainpulate dom. Please note that the member
// function of this class must be run in dom thread. If you want to call
// in other thread please use PostTask.
// Example:
//    std::vector<std::function<void()>> ops;
//    ops.emplace_back([]() {
//      some_ops();
//    });
//    dom_manager->PostTask(Scene(std::move(ops)));
class DomManager : public std::enable_shared_from_this<DomManager> {
 public:
  using DomValue = tdf::base::DomValue;
  using TaskRunner = hippy::base::TaskRunner;
  using bytes = std::string;

  DomManager(uint32_t root_id);
  ~DomManager() = default;

  int32_t GetId() { return id_; }

  inline std::shared_ptr<RenderManager> GetRenderManager() { return render_manager_.lock(); }
  inline std::shared_ptr<AnimationManager> GetAnimationManager() { return animation_manager_; }
  inline void SetDelegateTaskRunner(std::shared_ptr<TaskRunner> runner) {
    delegate_task_runner_ = runner;
  }
  inline std::weak_ptr<TaskRunner> GetDelegateTaskRunner() {
    return delegate_task_runner_;
  }

  void Init();
  void SetRenderManager(std::shared_ptr<RenderManager> render_manager);
  uint32_t GetRootId() const;
  std::shared_ptr<DomNode> GetNode(uint32_t id) const;

  void CreateDomNodes(std::vector<std::shared_ptr<DomInfo>>&& nodes);
  void UpdateDomNodes(std::vector<std::shared_ptr<DomInfo>>&& nodes);
  void MoveDomNodes(std::vector<std::shared_ptr<DomInfo>>&& nodes);
  void DeleteDomNodes(std::vector<std::shared_ptr<DomInfo>>&& nodes);
  void UpdateAnimation(std::vector<std::shared_ptr<DomNode>>&& nodes);
  void EndBatch();
  // 返回0代表失败，正常id从1开始
  void AddEventListener(uint32_t dom_id, const std::string& event_name, uint64_t listener_id, bool use_capture,
                        const EventCallback& cb);
  void RemoveEventListener(uint32_t id, const std::string& name, uint64_t listener_id);
  void CallFunction(uint32_t id, const std::string& name, const DomArgument& param, const CallFunctionCallback& cb);
  std::tuple<float, float> GetRootSize();
  void SetRootSize(float width, float height);
  void SetRootNode(const std::shared_ptr<RootNode>& root_node);
  void DoLayout();
  void PostTask(const Scene&& scene);
  std::shared_ptr<CommonTask> PostDelayedTask(const Scene&& scene, uint64_t delay);
  void CancelTask(std::shared_ptr<CommonTask> task);
  void StartTaskRunner() { dom_task_runner_->Start(); }
  void TerminateTaskRunner() { dom_task_runner_->Terminate(); }
  void Traverse(const std::function<void(const std::shared_ptr<DomNode>&)>& on_traverse);

  bytes GetSnapShot();
  bool SetSnapShot(const bytes& buffer);
  static void Insert(const std::shared_ptr<DomManager>& dom_manager);
  static std::shared_ptr<DomManager> Find(int32_t id);
  static bool Erase(int32_t id);
  static bool Erase(const std::shared_ptr<DomManager>& dom_manager);
  void AddInterceptor(const std::shared_ptr<DomActionInterceptor>& interceptor);

 private:
  int32_t id_;
  std::shared_ptr<RootNode> root_node_;
  std::shared_ptr<LayerOptimizedRenderManager> optimized_render_manager_;
  std::weak_ptr<RenderManager> render_manager_;
  std::weak_ptr<TaskRunner> delegate_task_runner_;
  std::shared_ptr<TaskRunner> dom_task_runner_;
  std::vector<std::shared_ptr<DomActionInterceptor>> interceptors_;
  std::shared_ptr<AnimationManager> animation_manager_;

  void HandleEvent(const std::shared_ptr<DomEvent>& event);
  void AddEventListenerOperation(const std::shared_ptr<DomNode>& node, const std::string& name);
  void RemoveEventListenerOperation(const std::shared_ptr<DomNode>& node, const std::string& name);
  void UpdateRenderNode(const std::shared_ptr<DomNode>& node);

  TDF_BASE_DISALLOW_COPY_AND_ASSIGN(DomManager);

  friend DomNode;
};

}  // namespace dom
}  // namespace hippy
