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
#include "footstone/serializer.h"
#include "footstone/deserializer.h"
#include "dom/scene_builder.h"

#ifdef HIPPY_TEST
#define DCHECK_RUN_THREAD() {}
#else
#define DCHECK_RUN_THREAD() \
  { FOOTSTONE_DCHECK(footstone::Worker::IsTaskRunning() && dom_task_runner_ == footstone::runner::TaskRunner::GetCurrentTaskRunner()); }
#endif

namespace hippy {
inline namespace dom {

using DomNode = hippy::DomNode;
using Task = footstone::Task;
using TaskRunner = footstone::TaskRunner;
using Serializer = footstone::value::Serializer;
using Deserializer = footstone::value::Deserializer;

static std::unordered_map<int32_t, std::shared_ptr<DomManager>> dom_manager_map;
static std::mutex mutex;
static std::atomic<int32_t> global_dom_manager_key{0};

using DomValueArrayType = footstone::value::HippyValue::DomValueArrayType;

DomManager::DomManager() {
  id_ = global_dom_manager_key.fetch_add(1);
}

DomManager::~DomManager() {}

void DomManager::Init() {}

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

bool DomManager::Erase(const std::shared_ptr<DomManager>& dom_manager) {
  return DomManager::Erase(dom_manager->id_);
}

void DomManager::SetRenderManager(const std::weak_ptr<RenderManager>& render_manager) {
#ifdef ENABLE_LAYER_OPTIMIZATION
  optimized_render_manager_ = std::make_shared<LayerOptimizedRenderManager>(render_manager.lock());
  render_manager_ = optimized_render_manager_;
#else
  render_manager_ = render_manager;
#endif
}

std::shared_ptr<DomNode> DomManager::GetNode(const std::weak_ptr<RootNode>& weak_root_node,
                                             uint32_t id) {
  auto root_node = weak_root_node.lock();
  if (!root_node) {
    return nullptr;
  }
  return root_node->GetNode(id);
}

void DomManager::CreateDomNodes(const std::weak_ptr<RootNode>& weak_root_node,
                                std::vector<std::shared_ptr<DomInfo>>&& nodes) {
  DCHECK_RUN_THREAD()
  auto root_node = weak_root_node.lock();
  if (!root_node) {
    return;
  }
  root_node->CreateDomNodes(std::move(nodes));
}

void DomManager::UpdateDomNodes(const std::weak_ptr<RootNode>& weak_root_node,
                                std::vector<std::shared_ptr<DomInfo>>&& nodes) {
  DCHECK_RUN_THREAD()
  auto root_node = weak_root_node.lock();
  if (!root_node) {
    return;
  }
  root_node->UpdateDomNodes(std::move(nodes));
}

void DomManager::MoveDomNodes(const std::weak_ptr<RootNode>& weak_root_node,
                              std::vector<std::shared_ptr<DomInfo>>&& nodes) {
  DCHECK_RUN_THREAD()
  auto root_node = weak_root_node.lock();
  if (!root_node) {
    return;
  }
  root_node->MoveDomNodes(std::move(nodes));
}

void DomManager::UpdateAnimation(const std::weak_ptr<RootNode>& weak_root_node,
                                 std::vector<std::shared_ptr<DomNode>>&& nodes) {
  DCHECK_RUN_THREAD()
  auto root_node = weak_root_node.lock();
  if (!root_node) {
    return;
  }
  root_node->UpdateAnimation(std::move(nodes));
}

void DomManager::DeleteDomNodes(const std::weak_ptr<RootNode>& weak_root_node,
                                std::vector<std::shared_ptr<DomInfo>>&& nodes) {
  DCHECK_RUN_THREAD()
  auto root_node = weak_root_node.lock();
  if (!root_node) {
    return;
  }
  root_node->DeleteDomNodes(std::move(nodes));
}

void DomManager::EndBatch(const std::weak_ptr<RootNode>& weak_root_node) {
  DCHECK_RUN_THREAD()
  auto render_manager = render_manager_.lock();
  FOOTSTONE_DCHECK(render_manager);
  if (!render_manager) {
    return;
  }
  auto root_node = weak_root_node.lock();
  if (!root_node) {
    return;
  }
  root_node->SyncWithRenderManager(render_manager);
}

void DomManager::AddEventListener(const std::weak_ptr<RootNode>& weak_root_node,
                                  uint32_t dom_id,
                                  const std::string& name,
                                  uint64_t listener_id,
                                  bool use_capture,
                                  const EventCallback& cb) {
  DCHECK_RUN_THREAD()
  auto root_node = weak_root_node.lock();
  if (!root_node) {
    return;
  }
  auto node = root_node->GetNode(dom_id);
  if (!node) {
    return;
  }
  node->AddEventListener(name, listener_id, use_capture, cb);
}

void DomManager::RemoveEventListener(const std::weak_ptr<RootNode>& weak_root_node,
                                     uint32_t id, const std::string& name, uint64_t listener_id) {
  DCHECK_RUN_THREAD()
  auto root_node = weak_root_node.lock();
  if (!root_node) {
    return;
  }
  auto node = root_node->GetNode(id);
  if (!node) {
    return;
  }
  node->RemoveEventListener(name, listener_id);
}

void DomManager::CallFunction(const std::weak_ptr<RootNode>& weak_root_node,
                              uint32_t id, const std::string& name, const DomArgument& param,
                              const CallFunctionCallback& cb) {
  DCHECK_RUN_THREAD()
  auto root_node = weak_root_node.lock();
  if (!root_node) {
    return;
  }
  root_node->CallFunction(id, name, param, cb);
}

void DomManager::SetRootSize(const std::weak_ptr<RootNode>& weak_root_node,
                             float width,
                             float height) {
  DCHECK_RUN_THREAD()
  auto root_node = weak_root_node.lock();
  if (!root_node) {
    return;
  }
  root_node->SetRootSize(width, height);
}

void DomManager::DoLayout(const std::weak_ptr<RootNode>& weak_root_node) {
  DCHECK_RUN_THREAD()
  auto root_node = weak_root_node.lock();
  if (!root_node) {
    return;
  }
  auto render_manager = render_manager_.lock();
  // check render_manager, measure text dependent render_manager
  FOOTSTONE_DCHECK(render_manager);
  if (!render_manager) {
    return;
  }
  root_node->DoAndFlushLayout(render_manager);
}

void DomManager::PostTask(const Scene&& scene) {
  auto func = [scene = scene] { scene.Build(); };
  dom_task_runner_->PostTask(std::move(func));
}

// todo
std::shared_ptr<Task> DomManager::PostDelayedTask(const Scene&& scene, uint64_t delay) {
  auto func = [scene = std::move(scene)] { scene.Build(); };
  dom_task_runner_->PostDelayedTask(std::move(func), footstone::TimeDelta::FromNanoseconds(
      static_cast<int64_t>(delay)));
  return nullptr;
}

void DomManager::CancelTask(std::shared_ptr<Task> task) {
  // dom_task_runner_->CancelTask(std::move(task));
}

DomManager::bytes DomManager::GetSnapShot(const std::shared_ptr<RootNode>& root_node) {
  DCHECK_RUN_THREAD()
  if (!root_node) {
    return {};
  }
  DomValueArrayType array;
  root_node->Traverse([&array](const std::shared_ptr<DomNode>& node) {
    array.emplace_back(node->Serialize());
  });
  Serializer serializer;
  serializer.WriteHeader();
  serializer.WriteValue(HippyValue(array));
  auto ret = serializer.Release();
  return {reinterpret_cast<const char*>(ret.first), ret.second};
}

bool DomManager::SetSnapShot(const std::shared_ptr<RootNode>& root_node, const bytes& buffer) {
  DCHECK_RUN_THREAD()
  Deserializer deserializer(reinterpret_cast<const uint8_t*>(buffer.c_str()), buffer.length());
  HippyValue value;
  deserializer.ReadHeader();
  auto flag = deserializer.ReadValue(value);
  if (!flag || !value.IsArray()) {
    return false;
  }
  DomValueArrayType array;
  value.ToArray(array);
  if (array.empty()) {
    return false;
  };
  auto orig_root_node = std::make_shared<DomNode>();
  flag = orig_root_node->Deserialize(array[0]);
  if (!flag) {
    return false;
  }
  if (orig_root_node->GetPid() != 0) {
    return false;
  }
  auto orig_root_id = orig_root_node->GetId();
  std::vector<std::shared_ptr<DomInfo>> nodes;
  std::weak_ptr<DomManager> weak_dom_manager = weak_from_this();
  for (uint32_t i = 1; i < array.size(); ++i) {
    auto node = array[i];
    auto dom_node = std::make_shared<DomNode>();
    flag = dom_node->Deserialize(node);
    if (!flag) {
      return false;
    }
    dom_node->SetRootNode(root_node);
    if (dom_node->GetPid() == orig_root_id) {
      dom_node->SetPid(root_node->GetId());
    }
    nodes.push_back(std::make_shared<DomInfo>(dom_node, nullptr));
  }

  CreateDomNodes(root_node, std::move(nodes));
  EndBatch(root_node);

  return true;
}

}  // namespace dom
}  // namespace hippy
