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
#include "dom/serializer.h"
#include "dom/deserializer.h"
#include "dom/scene_builder.h"

#ifdef HIPPY_TEST
#define DCHECK_RUN_THREAD() {}
#else
#define DCHECK_RUN_THREAD() \
  { TDF_BASE_DCHECK(dom_task_runner_->Id() == hippy::base::ThreadId::GetCurrent()); }
#endif

namespace hippy {
inline namespace dom {

using DomNode = hippy::DomNode;
using Serializer = tdf::base::Serializer;
using Deserializer = tdf::base::Deserializer;

static std::unordered_map<int32_t, std::shared_ptr<DomManager>> dom_manager_map;
static std::mutex mutex;
static std::atomic<int32_t> global_dom_manager_key{0};

using DomValueArrayType = tdf::base::DomValue::DomValueArrayType;

DomManager::DomManager() {
  id_ = global_dom_manager_key.fetch_add(1);
  animation_manager_ = std::make_shared<AnimationManager>();
  interceptors_.push_back(animation_manager_);
  dom_task_runner_ = std::make_shared<hippy::base::TaskRunner>();
}

void DomManager::Init(uint32_t root_id) {
  root_id_ = root_id;
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
#ifdef ENABLE_LAYER_OPTIMIZATION
  optimized_render_manager_ = std::make_shared<LayerOptimizedRenderManager>(render_manager);
  render_manager_ = optimized_render_manager_;
#else
  render_manager_ = render_manager;
#endif
  animation_manager_->SetRenderManager(render_manager);
}

uint32_t DomManager::GetRootId() const { return root_id_; }

std::shared_ptr<DomNode> DomManager::GetNode(std::weak_ptr<RootNode> root_node, uint32_t id) const {
  auto host = root_node.lock();
  if (!host) {
    return nullptr;
  }
  return host->GetNode(id);
}

void DomManager::CreateDomNodes(std::weak_ptr<RootNode> root_node,
                                std::vector<std::shared_ptr<DomInfo>>&& nodes) {
  DCHECK_RUN_THREAD()
  auto host = root_node.lock();
  if (!host) {
    return;
  }
  for (const std::shared_ptr<DomActionInterceptor>& interceptor : interceptors_) {
    interceptor->OnDomNodeCreate(nodes);
  }
  host->CreateDomNodes(std::move(nodes));
}

void DomManager::UpdateDomNodes(std::weak_ptr<RootNode> root_node,
                                std::vector<std::shared_ptr<DomInfo>>&& nodes) {
  DCHECK_RUN_THREAD()
  auto host = root_node.lock();
  if (!host) {
    return;
  }
  for (const std::shared_ptr<DomActionInterceptor>& interceptor : interceptors_) {
    interceptor->OnDomNodeUpdate(nodes);
  }
  host->UpdateDomNodes(std::move(nodes));
}

void DomManager::MoveDomNodes(std::weak_ptr<RootNode> root_node,
                              std::vector<std::shared_ptr<DomInfo>>&& nodes) {
  DCHECK_RUN_THREAD()
  auto host = root_node.lock();
  if (!host) {
    return;
  }
  for (std::shared_ptr<DomActionInterceptor> interceptor : interceptors_) {
    interceptor->OnDomNodeMove(nodes);
  }
  host->MoveDomNodes(std::move(nodes));
}

void DomManager::UpdateAnimation(std::weak_ptr<RootNode> root_node,
                                 std::vector<std::shared_ptr<DomNode>>&& nodes) {
  DCHECK_RUN_THREAD()
  auto host = root_node.lock();
  if (!host) {
    return;
  }
  host->UpdateAnimation(std::move(nodes));
}

void DomManager::DeleteDomNodes(std::weak_ptr<RootNode> root_node,
                                std::vector<std::shared_ptr<DomInfo>>&& nodes) {
  DCHECK_RUN_THREAD()
  auto host = root_node.lock();
  if (!host) {
    return;
  }
  for (const std::shared_ptr<DomActionInterceptor>& interceptor : interceptors_) {
    interceptor->OnDomNodeDelete(nodes);
  }
  host->DeleteDomNodes(std::move(nodes));
}

void DomManager::EndBatch(std::weak_ptr<RootNode> root_node) {
  DCHECK_RUN_THREAD()
  auto render_manager = render_manager_.lock();
  TDF_BASE_DCHECK(render_manager);
  if (!render_manager) {
    return;
  }
  auto host = root_node.lock();
  if (!host) {
    return;
  }
  host->SyncWithRenderManager(render_manager);
}

void DomManager::AddEventListener(std::weak_ptr<RootNode> root_node,
                                  uint32_t dom_id, const std::string& event_name, uint64_t listener_id,
                                  bool use_capture, const EventCallback& cb) {
  DCHECK_RUN_THREAD()
  auto host = root_node.lock();
  if (!host) {
    return;
  }
  auto node = host->GetNode(dom_id);
  if (!node) {
    return;
  }
  node->AddEventListener(event_name, listener_id, use_capture, cb);
}

void DomManager::RemoveEventListener(std::weak_ptr<RootNode> root_node,
                                     uint32_t id, const std::string& name, uint64_t listener_id) {
  DCHECK_RUN_THREAD()
  auto host = root_node.lock();
  if (!host) {
    return;
  }
  auto node = host->GetNode(id);
  if (!node) {
    return;
  }
  node->RemoveEventListener(name, listener_id);
}

void DomManager::CallFunction(std::weak_ptr<RootNode> root_node,
                              uint32_t id, const std::string& name, const DomArgument& param,
                              const CallFunctionCallback& cb) {
  DCHECK_RUN_THREAD()
  auto host = root_node.lock();
  if (!host) {
    return;
  }
  host->CallFunction(id, name, param, cb);
}

void DomManager::SetRootSize(std::weak_ptr<RootNode> root_node, float width, float height) {
  DCHECK_RUN_THREAD()
  auto host = root_node.lock();
  if (!host) {
    return;
  }
  host->SetRootSize(width, height);
}

void DomManager::DoLayout(std::weak_ptr<RootNode> root_node) {
  DCHECK_RUN_THREAD()
  auto host = root_node.lock();
  if (!host) {
    return;
  }
  auto render_manager = render_manager_.lock();
  // check render_manager, measure text dependent render_manager
  TDF_BASE_DCHECK(render_manager);
  if (!render_manager) {
    return;
  }
  host->DoAndFlushLayout(render_manager);
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

void DomManager::AddInterceptor(const std::shared_ptr<DomActionInterceptor>& interceptor) {
  interceptors_.push_back(interceptor);
}

void DomManager::Traverse(const std::function<void(const std::shared_ptr<DomNode>&)>& on_traverse) {
 if (!root_node_) {
   return;
 }

 std::stack<std::shared_ptr<DomNode>> stack;
 stack.push(root_node_);
 while(!stack.empty()) {
   auto top = stack.top();
   stack.pop();
   on_traverse(top);
   auto children = top->GetChildren();
   if (!children.empty()) {
     for (auto it = children.rbegin(); it != children.rend(); ++it) {
       stack.push(*it);
     }
   }
 }
}

DomManager::bytes DomManager::GetSnapShot() {
  DomValueArrayType array;
  Traverse([&array](const std::shared_ptr<DomNode>& node) {
    array.emplace_back(node->Serialize());
  });
  Serializer serializer;
  serializer.WriteHeader();
  serializer.WriteValue(DomValue(array));
  auto ret = serializer.Release();
  return {reinterpret_cast<const char*>(ret.first), ret.second};
}

bool DomManager::SetSnapShot(const bytes& buffer, const RootInfo& root_info) {
  Deserializer deserializer(reinterpret_cast<const uint8_t*>(buffer.c_str()), buffer.length());
  DomValue value;
  deserializer.ReadHeader();
  auto flag = deserializer.ReadValue(value);
  if (!flag || !value.IsArray()) {
    return false;
  }
  DomValueArrayType array;
  value.ToArray(array);
  if (array.empty()) {
    return false;
  }
  auto weak_dom_manager = weak_from_this();
  auto root_node = std::make_shared<DomNode>();
  flag = root_node->Deserialize(array[0]);
  if (!flag) {
    return false;
  }
  if (root_node->GetPid() != 0) {
    return false;
  }
  auto orig_root_id = root_node->GetId();
  root_node_ = std::make_shared<RootNode>(root_info.root_id);
  root_node_->SetDomManager(weak_dom_manager);
  root_node_->SetLayoutSize(root_info.width, root_info.height);
  std::vector<std::shared_ptr<DomInfo>> nodes;
  for (uint32_t i = 1; i < array.size(); ++i) {
    auto node = array[i];
    auto dom_node = std::make_shared<DomNode>();
    flag = dom_node->Deserialize(node);
    if (!flag) {
      return false;
    }

    dom_node->SetDomManager(weak_dom_manager);
    if (dom_node->GetPid() == orig_root_id) {
      dom_node->SetPid(root_info.root_id);
    }
    nodes.push_back(std::make_shared<DomInfo>(dom_node, nullptr));
  }

  std::vector<std::function<void()>> ops = {
      [weak_dom_manager, nodes{std::move(nodes)}]() mutable {
        auto dom_manager = weak_dom_manager.lock();
        if (!dom_manager) {
          return;
        }
        dom_manager->CreateDomNodes(std::move(nodes));
        dom_manager->EndBatch();
      }
  };
  PostTask(Scene(std::move(ops)));

  return true;
}

}  // namespace dom
}  // namespace hippy
