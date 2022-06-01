#define ENABLE_LAYER_OPTIMIZATION

#include "dom/dom_manager.h"

#include <mutex>
#include <stack>
#include <utility>

#include "dom/animation/animation_manager.h"
#include "dom/diff_utils.h"
#include "dom/dom_action_interceptor.h"
#include "dom/dom_event.h"
#include "dom/dom_node.h"
#include "dom/layer_optimized_render_manager.h"
#include "dom/macro.h"
#include "dom/render_manager.h"
#include "dom/root_node.h"

#ifdef HIPPY_TEST
#define DCHECK_RUN_THREAD() {}
#else
#define DCHECK_RUN_THREAD() \
  { TDF_BASE_DCHECK(dom_task_runner_->Id() == hippy::base::ThreadId::GetCurrent()); }
#endif

namespace hippy {
inline namespace dom {

using DomNode = hippy::DomNode;

static std::unordered_map<int32_t, std::shared_ptr<DomManager>> dom_manager_map;
static std::mutex mutex;
static std::atomic<int32_t> global_dom_manager_key{0};

DomManager::DomManager(uint32_t root_id) {
  id_ = global_dom_manager_key.fetch_add(1);
  root_node_ = std::make_shared<RootNode>(root_id);
  animation_manager_ = std::make_shared<AnimationManager>();
  dom_task_runner_ = std::make_shared<hippy::base::TaskRunner>();
}

void DomManager::Init() {
  animation_manager_->SetDomManager(weak_from_this());
  AddInterceptor(animation_manager_);
  StartTaskRunner();
}

void DomManager::Insert(const std::shared_ptr<DomManager>& dom_manager) {
  std::lock_guard<std::mutex> lock(mutex);
  dom_manager_map[dom_manager->id_] = dom_manager;
}

std::shared_ptr<DomManager> DomManager::Find(int32_t id) {
  std::lock_guard<std::mutex> lock(mutex);
  const auto it = dom_manager_map.find(id);
  if (it == dom_manager_map.end()) {
    return nullptr;
  }
  return it->second;
}

bool DomManager::Erase(int32_t id) {
  std::lock_guard<std::mutex> lock(mutex);
  const auto it = dom_manager_map.find(id);
  if (it == dom_manager_map.end()) {
    return false;
  }
  dom_manager_map.erase(it);
  return true;
}

bool DomManager::Erase(const std::shared_ptr<DomManager>& dom_manager) { return DomManager::Erase(dom_manager->id_); }

void DomManager::SetRenderManager(std::shared_ptr<RenderManager> render_manager) {
  root_node_->SetDomManager(weak_from_this());
#ifdef ENABLE_LAYER_OPTIMIZATION
  optimized_render_manager_ = std::make_shared<LayerOptimizedRenderManager>(render_manager);
  render_manager_ = optimized_render_manager_;
#else
  render_manager_ = render_manager;
#endif
  animation_manager_->SetRenderManager(render_manager);
}

uint32_t DomManager::GetRootId() const { return root_node_->GetId(); }

std::shared_ptr<DomNode> DomManager::GetNode(uint32_t id) const { return root_node_->GetNode(id); }

void DomManager::CreateDomNodes(std::vector<std::shared_ptr<DomInfo>>&& nodes) {
  DCHECK_RUN_THREAD()
  for (const std::shared_ptr<DomActionInterceptor>& interceptor : interceptors_) {
    interceptor->OnDomNodeCreate(nodes);
  }
  root_node_->CreateDomNodes(std::move(nodes));
}

void DomManager::UpdateDomNodes(std::vector<std::shared_ptr<DomInfo>>&& nodes) {
  DCHECK_RUN_THREAD()
  for (const std::shared_ptr<DomActionInterceptor>& interceptor : interceptors_) {
    interceptor->OnDomNodeUpdate(nodes);
  }
  root_node_->UpdateDomNodes(std::move(nodes));
}

void DomManager::MoveDomNodes(std::vector<std::shared_ptr<DomInfo>>&& nodes) {
  DCHECK_RUN_THREAD()
  for (std::shared_ptr<DomActionInterceptor> interceptor : interceptors_) {
    interceptor->OnDomNodeMove(nodes);
  }
  root_node_->MoveDomNodes(std::move(nodes));
}

void DomManager::UpdateAnimation(std::vector<std::shared_ptr<DomNode>>&& nodes) {
  DCHECK_RUN_THREAD()
  root_node_->UpdateAnimation(std::move(nodes));
}

void DomManager::DeleteDomNodes(std::vector<std::shared_ptr<DomInfo>>&& nodes) {
  DCHECK_RUN_THREAD()
  for (const std::shared_ptr<DomActionInterceptor>& interceptor : interceptors_) {
    interceptor->OnDomNodeDelete(nodes);
  }
  root_node_->DeleteDomNodes(std::move(nodes));
}

void DomManager::EndBatch() {
  DCHECK_RUN_THREAD()
  auto render_manager = render_manager_.lock();
  TDF_BASE_DCHECK(render_manager);
  if (!render_manager) {
    return;
  }
  root_node_->SyncWithRenderManager(render_manager);
}

void DomManager::AddEventListener(uint32_t dom_id, const std::string& event_name, uint64_t listener_id,
                                  bool use_capture, const EventCallback& cb) {
  DCHECK_RUN_THREAD()
  auto node = root_node_->GetNode(dom_id);
  if (!node) return;
  node->AddEventListener(event_name, listener_id, use_capture, cb);
}

void DomManager::RemoveEventListener(uint32_t id, const std::string& name, uint64_t listener_id) {
  DCHECK_RUN_THREAD()
  auto node = root_node_->GetNode(id);
  if (!node) {
    return;
  }
  node->RemoveEventListener(name, listener_id);
}

void DomManager::CallFunction(uint32_t id, const std::string& name, const DomArgument& param,
                              const CallFunctionCallback& cb) {
  DCHECK_RUN_THREAD()
  auto node = root_node_->GetNode(id);
  if (node == nullptr) {
    return;
  }
  node->CallFunction(name, param, cb);
}

void DomManager::AddEventListenerOperation(const std::shared_ptr<DomNode>& node, const std::string& name) {
  root_node_->AddEvent(node->GetId(), name);
}

void DomManager::RemoveEventListenerOperation(const std::shared_ptr<DomNode>& node, const std::string& name) {
  root_node_->RemoveEvent(node->GetId(), name);
}

std::tuple<float, float> DomManager::GetRootSize() {
  TDF_BASE_DCHECK(root_node_);
  return root_node_->GetLayoutSize();
}

void DomManager::SetRootSize(float width, float height) {
  DCHECK_RUN_THREAD()
  TDF_BASE_CHECK(root_node_);
  root_node_->SetLayoutSize(width, height);
}

void DomManager::SetRootNode(const std::shared_ptr<RootNode>& root_node) {
  DCHECK_RUN_THREAD()
  if (root_node) {
    root_node_ = root_node;
    root_node->SetDomManager(weak_from_this());
  }
}

void DomManager::DoLayout() {
  DCHECK_RUN_THREAD()
  auto render_manager = render_manager_.lock();
  // check render_manager, measure text dependent render_manager
  TDF_BASE_DCHECK(render_manager);
  if (!render_manager) {
    return;
  }
  root_node_->DoAndFlushLayout(render_manager);
}

void DomManager::HandleEvent(const std::shared_ptr<DomEvent>& event) {
  DCHECK_RUN_THREAD()
  auto weak_target = event->GetTarget();
  auto event_name = event->GetType();
  auto target = weak_target.lock();
  if (target) {
    std::stack<std::shared_ptr<DomNode>> capture_list = {};
    // 执行捕获流程，注：target节点event.StopPropagation并不会阻止捕获流程
    if (event->CanCapture()) {
      // 获取捕获列表
      auto parent = target->GetParent();
      while (parent) {
        capture_list.push(parent);
        parent = parent->GetParent();
      }
    }
    auto capture_target_listeners = target->GetEventListener(event_name, true);
    auto bubble_target_listeners = target->GetEventListener(event_name, false);
    // 捕获列表反过来就是冒泡列表，不需要额外遍历生成
    auto runner = delegate_task_runner_.lock();
    if (runner) {
      std::shared_ptr<CommonTask> task = std::make_shared<CommonTask>();
      task->func_ = [capture_list = std::move(capture_list),
                     capture_target_listeners = std::move(capture_target_listeners),
                     bubble_target_listeners = std::move(bubble_target_listeners), dom_event = event,
                     event_name]() mutable {
        // 执行捕获流程
        std::queue<std::shared_ptr<DomNode>> bubble_list = {};
        while (!capture_list.empty()) {
          auto capture_node = capture_list.top();
          capture_list.pop();
          dom_event->SetCurrentTarget(capture_node);  // 设置当前节点，cb里会用到
          auto listeners = capture_node->GetEventListener(event_name, true);
          for (const auto& listener : listeners) {
            listener->cb(dom_event);  // StopPropagation并不会影响同级的回调调用
          }
          if (dom_event->IsPreventCapture()) {  // cb 内部调用了 event.StopPropagation 会阻止捕获
            return;  // 捕获流中StopPropagation不仅会导致捕获流程结束，后面的目标事件和冒泡都会终止
          }
          bubble_list.push(std::move(capture_node));
        }
        // 执行本身节点回调
        dom_event->SetCurrentTarget(dom_event->GetTarget());
        for (const auto& listener : capture_target_listeners) {
          listener->cb(dom_event);
        }
        if (dom_event->IsPreventCapture()) {
          return;
        }
        for (const auto& listener : bubble_target_listeners) {
          listener->cb(dom_event);
        }
        if (dom_event->IsPreventBubble()) {
          return;
        }
        // 执行冒泡流程
        while (!bubble_list.empty()) {
          auto bubble_node = bubble_list.front();
          bubble_list.pop();
          dom_event->SetCurrentTarget(bubble_node);
          auto listeners = bubble_node->GetEventListener(event_name, false);
          for (const auto& listener : listeners) {
            listener->cb(dom_event);
          }
          if (dom_event->IsPreventBubble()) {
            break;
          }
        }
      };
      runner->PostTask(std::move(task));
    }
  }
}

void DomManager::PostTask(const Scene&& scene) {
  std::shared_ptr<CommonTask> task = std::make_shared<CommonTask>();
  task->func_ = [scene = scene] { scene.Build(); };
  dom_task_runner_->PostTask(std::move(task));
}

std::shared_ptr<CommonTask> DomManager::PostDelayedTask(const Scene&& scene, uint64_t delay) {
  std::shared_ptr<CommonTask> task = std::make_shared<CommonTask>();
  task->func_ = [scene = std::move(scene)] { scene.Build(); };
  dom_task_runner_->PostDelayedTask(task, delay);
  return task;
}

void DomManager::CancelTask(std::shared_ptr<CommonTask> task) {
  dom_task_runner_->CancelTask(std::move(task));
}

void DomManager::UpdateRenderNode(const std::shared_ptr<DomNode>& node) {
  auto render_manager = render_manager_.lock();
  TDF_BASE_DCHECK(render_manager);
  if (!render_manager) {
    return;
  }
  TDF_BASE_DCHECK(node);

  // 更新 layout tree
  node->ParseLayoutStyleInfo();

  // 更新属性
  std::vector<std::shared_ptr<DomNode>> nodes;
  nodes.push_back(node);
  render_manager->UpdateRenderNode(std::move(nodes));

  root_node_->SyncWithRenderManager(render_manager);
}

void DomManager::AddInterceptor(const std::shared_ptr<DomActionInterceptor>& interceptor) {
  interceptors_.push_back(interceptor);
}

}  // namespace dom
}  // namespace hippy
