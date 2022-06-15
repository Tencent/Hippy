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
  using bytes = std::string;
  using DomValue = tdf::base::DomValue;
  using TaskRunner = hippy::base::TaskRunner;

  struct RootInfo {
    uint32_t root_id;
    float width;
    float height;
  };

  DomManager();
  ~DomManager() = default;

  inline int32_t GetId() { return id_; }
  inline std::weak_ptr<RenderManager> GetRenderManager() { return render_manager_; }

  void Init();
  void SetRenderManager(const std::weak_ptr<RenderManager>& render_manager);
  static std::shared_ptr<DomNode> GetNode(const std::weak_ptr<RootNode>& weak_root_node,
                                   uint32_t id) ;

  void CreateDomNodes(const std::weak_ptr<RootNode>& weak_root_node,
                      std::vector<std::shared_ptr<DomInfo>>&& nodes);
  void UpdateDomNodes(const std::weak_ptr<RootNode>& weak_root_node,
                      std::vector<std::shared_ptr<DomInfo>>&& nodes);
  void MoveDomNodes(const std::weak_ptr<RootNode>& weak_root_node,
                    std::vector<std::shared_ptr<DomInfo>>&& nodes);
  void DeleteDomNodes(const std::weak_ptr<RootNode>& weak_root_node,
                      std::vector<std::shared_ptr<DomInfo>>&& nodes);
  void UpdateAnimation(const std::weak_ptr<RootNode>& weak_root_node,
                       std::vector<std::shared_ptr<DomNode>>&& nodes);
  void EndBatch(const std::weak_ptr<RootNode>& root_node);
  // 返回0代表失败，正常id从1开始
  void AddEventListener(const std::weak_ptr<RootNode>& weak_root_node,
                        uint32_t dom_id,
                        const std::string& event_name,
                        uint64_t listener_id,
                        bool use_capture,
                        const EventCallback& cb);
  void RemoveEventListener(const std::weak_ptr<RootNode>& weak_root_node,
                           uint32_t id,
                           const std::string& name,
                           uint64_t listener_id);
  void CallFunction(const std::weak_ptr<RootNode>& weak_root_node,
                    uint32_t id,
                    const std::string& name,
                    const DomArgument& param,
                    const CallFunctionCallback& cb);
  void SetRootSize(const std::weak_ptr<RootNode>& weak_root_node, float width, float height);
  void DoLayout(const std::weak_ptr<RootNode>& weak_root_node);
  void PostTask(const Scene&& scene);
  std::shared_ptr<CommonTask> PostDelayedTask(const Scene&& scene, uint64_t delay);
  void CancelTask(std::shared_ptr<CommonTask> task);
  void StartTaskRunner() { dom_task_runner_->Start(); }
  void TerminateTaskRunner() { dom_task_runner_->Terminate(); }

  bytes GetSnapShot(const std::shared_ptr<RootNode>& root_node);
  bool SetSnapShot(const std::shared_ptr<RootNode>& root_node,
                   const bytes& buffer,
                   const RootInfo& root_info);

  static void Insert(const std::shared_ptr<DomManager>& dom_manager);
  static std::shared_ptr<DomManager> Find(int32_t id);
  static bool Erase(int32_t id);
  static bool Erase(const std::shared_ptr<DomManager>& dom_manager);

 private:
  int32_t id_;
  std::shared_ptr<LayerOptimizedRenderManager> optimized_render_manager_;
  std::weak_ptr<RenderManager> render_manager_;
  std::shared_ptr<TaskRunner> dom_task_runner_;

  TDF_BASE_DISALLOW_COPY_AND_ASSIGN(DomManager);

  friend DomNode;
};

}  // namespace dom
}  // namespace hippy
