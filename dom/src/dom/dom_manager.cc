#include "dom/dom_manager.h"

#include <mutex>
#include <stack>
#include <utility>

#include "dom/diff_utils.h"
#include "dom/dom_event.h"
#include "dom/dom_node.h"
#include "dom/macro.h"
#include "dom/render_manager.h"

namespace hippy {
inline namespace dom {

using DomNode = hippy::DomNode;

static std::unordered_map<int32_t, std::shared_ptr<DomManager>> dom_manager_map;
static std::mutex mutex;
static std::atomic<int32_t> global_dom_manager_key{0};

constexpr uint32_t kInvalidListenerId = 0;
constexpr char kOnDomCreated[] = "onDomCreated";
constexpr char kOnDomUpdated[] = "onDomUpdate";
constexpr char kOnDomDeleted[] = "kOnDomDeleted";

DomManager::DomManager(uint32_t root_id) : root_id_(root_id) {
  root_node_ = std::make_shared<DomNode>(root_id, -1, 0);
  dom_node_registry_.AddNode(root_node_);
  dom_task_runner_ = std::make_shared<hippy::base::TaskRunner>();
  id_ = global_dom_manager_key.fetch_add(1);
}

void DomManager::Insert(const std::shared_ptr<DomManager>& dom_manager) {
  std::lock_guard<std::mutex> lock(mutex);
  dom_manager_map[dom_manager->id_] = dom_manager;
};

std::shared_ptr<DomManager> DomManager::Find(int32_t id) {
  std::lock_guard<std::mutex> lock(mutex);
  const auto it = dom_manager_map.find(id);
  if (it == dom_manager_map.end()) {
    return nullptr;
  }
  return it->second;
};

bool DomManager::Erase(int32_t id) {
  std::lock_guard<std::mutex> lock(mutex);
  const auto it = dom_manager_map.find(id);
  if (it == dom_manager_map.end()) {
    return false;
  }
  dom_manager_map.erase(it);
  return true;
};

bool DomManager::Erase(const std::shared_ptr<DomManager>& dom_manager) { return DomManager::Erase(dom_manager->id_); }

void DomManager::CreateDomNodes(std::vector<std::shared_ptr<DomNode>>&& nodes) {
  PostTask([WEAK_THIS, nodes = std::move(nodes)]() {
    DEFINE_AND_CHECK_SELF(DomManager)
    for (const auto& node : nodes) {
      std::shared_ptr<DomNode> parent_node = self->dom_node_registry_.GetNode(node->GetPid());
      if (parent_node == nullptr) {
        // it = nodes.erase(it);
        continue;
      }
      node->SetRenderInfo({node->GetPid(), node->GetIndex(), true});
      // 解析布局属性
      node->ParseLayoutStyleInfo();
      parent_node->AddChildAt(node, node->GetIndex());

      // 延迟构造layout tree
      auto layout_node = node->GetLayoutNode();
      auto parent_layout_node = parent_node->GetLayoutNode();
      uint32_t index = node->GetIndex();
      self->layout_operations_.emplace_back(
          [layout_node, parent_layout_node, index]() { parent_layout_node->InsertChild(layout_node, index); });

      self->dom_node_registry_.AddNode(node);
      self->HandleEvent(std::make_shared<DomEvent>(kOnDomCreated, node, nullptr));
    }

    if (!nodes.empty()) {
      self->batched_operations_.emplace_back([self, moved_nodes = std::move(nodes)]() mutable {
        auto render_manager = self->render_manager_.lock();
        TDF_BASE_DCHECK(render_manager);
        if (render_manager) {
          render_manager->CreateRenderNode(std::move(moved_nodes));
        }
      });
    }
  });
}

void DomManager::UpdateDomNodes(std::vector<std::shared_ptr<DomNode>>&& nodes) {
  PostTask([WEAK_THIS, nodes]() {
    DEFINE_AND_CHECK_SELF(DomManager)
    for (const auto& it : nodes) {
      std::shared_ptr<DomNode> node = self->dom_node_registry_.GetNode(it->GetId());
      if (node == nullptr) {
        continue;
      }
      // diff props
      DomValueMap style_diff = DiffUtils::DiffProps(*node->GetStyleMap(), *it->GetStyleMap());
      DomValueMap ext_diff = DiffUtils::DiffProps(*node->GetExtStyle(), *it->GetExtStyle());
      style_diff.insert(ext_diff.begin(), ext_diff.end());
      node->SetStyleMap(it->GetStyleMap());
      node->SetExtStyleMap(it->GetExtStyle());
      auto diff_ptr = std::make_shared<std::unordered_map<std::string, std::shared_ptr<DomValue>>>(std::move(style_diff));
      node->SetDiffStyle(diff_ptr);
      it->SetDiffStyle(diff_ptr);
      it->SetRenderInfo(node->GetRenderInfo());
      // node->ParseLayoutStyleInfo();
      self->HandleEvent(std::make_shared<DomEvent>(kOnDomUpdated, node, nullptr));

      // 延迟更新 layout tree
      int32_t id = node->GetId();
      self->layout_operations_.emplace_back([self, id]() {
        auto node = self->dom_node_registry_.GetNode(id);
        node->ParseLayoutStyleInfo();
      });
    }

    if (!nodes.empty()) {
      self->batched_operations_.emplace_back([self, moved_nodes = std::move(nodes)]() mutable {
        auto render_manager = self->render_manager_.lock();
        TDF_BASE_DCHECK(render_manager);
        if (render_manager) {
          render_manager->UpdateRenderNode(std::move(moved_nodes));
        }
      });
    }
  });
}

void DomManager::DeleteDomNodes(std::vector<std::shared_ptr<DomNode>>&& nodes) {
  PostTask([WEAK_THIS, nodes] {
    DEFINE_AND_CHECK_SELF(DomManager)
    for (auto it = nodes.begin(); it != nodes.end(); it++) {
      std::shared_ptr<DomNode> node = self->dom_node_registry_.GetNode((*it)->GetId());
      if (node == nullptr) {
        continue;
      }
      std::shared_ptr<DomNode> parent_node = node->GetParent();
      if (parent_node != nullptr) {
        parent_node->RemoveChildAt(parent_node->IndexOf(node));
      }
      self->DeleteDomNode(node);
      self->HandleEvent(std::make_shared<DomEvent>(kOnDomDeleted, node, nullptr));

      // 延迟删除 layout tree
      auto layout_node = node->GetLayoutNode();
      auto parent_layout_node = parent_node->GetLayoutNode();
      self->layout_operations_.emplace_back(
          [layout_node, parent_layout_node]() { parent_layout_node->RemoveChild(layout_node); });
    }

    if (!nodes.empty()) {
      self->batched_operations_.emplace_back([self, moved_nodes = std::move(nodes)]() mutable {
        auto render_manager = self->render_manager_.lock();
        TDF_BASE_DCHECK(render_manager);
        if (render_manager) {
          render_manager->DeleteRenderNode(std::move(moved_nodes));
        }
      });
    }
  });
}

void DomManager::DeleteDomNode(std::shared_ptr<DomNode> node) {
  if (node) {
    for (auto child : node->GetChildren()) {
      if (child) {
        DeleteDomNode(child);
      }
    }
    dom_node_registry_.RemoveNode(node->GetId());
  }
}

void DomManager::EndBatch() {
  PostTask([WEAK_THIS] {
    DEFINE_AND_CHECK_SELF(DomManager)
    std::vector<std::shared_ptr<DomNode>> delete_nodes;
    for (auto& batch_operation : self->batched_operations_) {
      batch_operation();
    }
    self->batched_operations_.clear();
    for (auto& listener_operation : self->listener_operations_) {
      listener_operation();
    }
    self->listener_operations_.clear();
    auto render_manager = self->render_manager_.lock();
    TDF_BASE_DCHECK(render_manager);
    if (!render_manager) {
      return;
    }
    // Before Layout
    render_manager->BeforeLayout();
    // build layout tree
    for (auto& layout_operation : self->layout_operations_) {
      layout_operation();
    }
    self->layout_operations_.clear();
    // 清理布局计算
    self->layout_changed_nodes_.clear();
    // 触发布局计算
    self->root_node_->DoLayout();
    // After Layout
    render_manager->AfterLayout();
    if (!self->layout_changed_nodes_.empty()) {
      render_manager->UpdateLayout(self->layout_changed_nodes_);
    }
    render_manager->EndBatch();
  });
}

void DomManager::AddEventListener(uint32_t id, const std::string& name, bool use_capture, const EventCallback& cb,
                                  const CallFunctionCallback& callback) {
  PostTask([WEAK_THIS, id, name, use_capture, cb, callback]() {
    DEFINE_AND_CHECK_SELF(DomManager)
    auto node = self->dom_node_registry_.GetNode(id);
    if (!node && callback) {
      callback(std::make_shared<DomArgument>(DomValue(kInvalidListenerId)));
      return;
    }
    node->AddEventListener(name, use_capture, cb, callback);
  });
}

void DomManager::RemoveEventListener(uint32_t id, const std::string& name, uint32_t listener_id) {
  PostTask([WEAK_THIS, id, name, listener_id]() {
    DEFINE_AND_CHECK_SELF(DomManager)
    auto node = self->dom_node_registry_.GetNode(id);
    if (!node) {
      return;
    }
    node->RemoveEventListener(name, listener_id);
  });
}

void DomManager::CallFunction(uint32_t id, const std::string& name, const DomArgument& param,
                              const CallFunctionCallback& cb) {
  PostTask([WEAK_THIS, id, name, param, cb]() {
    DEFINE_AND_CHECK_SELF(DomManager)
    auto node = self->dom_node_registry_.GetNode(id);
    if (node == nullptr) {
      return;
    }
    node->CallFunction(name, param, cb);
  });
}

void DomManager::AddEventListenerOperation(const std::shared_ptr<DomNode>& node, const std::string& name) {
  listener_operations_.emplace_back([this, node, name]() {
    auto render_manager = render_manager_.lock();
    TDF_BASE_DCHECK(render_manager);
    if (render_manager) {
      render_manager->AddEventListener(node, name);
    }
  });
}

void DomManager::RemoveEventListenerOperation(const std::shared_ptr<DomNode>& node, const std::string& name) {
  listener_operations_.emplace_back([this, node, name]() {
    auto render_manager = render_manager_.lock();
    TDF_BASE_DCHECK(render_manager);
    if (render_manager) {
      render_manager->RemoveEventListener(node, name);
    }
  });
}

std::tuple<float, float> DomManager::GetRootSize() {
  TDF_BASE_DCHECK(root_node_);
  return root_node_->GetLayoutSize();
}

void DomManager::SetRootSize(float width, float height) {
  PostTask([WEAK_THIS, width, height]() {
    DEFINE_AND_CHECK_SELF(DomManager)
    TDF_BASE_CHECK(self->root_node_);
    self->root_node_->SetLayoutSize(width, height);
  });
}

void DomManager::AddLayoutChangedNode(const std::shared_ptr<DomNode>& node) { layout_changed_nodes_.push_back(node); }

void DomManager::SetRootNode(const std::shared_ptr<DomNode>& root_node) {
  PostTask([WEAK_THIS, root_node]() {
    DEFINE_AND_CHECK_SELF(DomManager)
    if (root_node) {
      if (self->root_node_) {
        self->dom_node_registry_.RemoveNode(self->root_node_->GetId());
      }
      self->root_node_ = root_node;
      self->dom_node_registry_.AddNode(root_node);
    }
  });
}

void DomManager::DoLayout() {
  PostTask([WEAK_THIS]() {
    DEFINE_AND_CHECK_SELF(DomManager)
    self->layout_changed_nodes_.clear();
    auto render_manager = self->render_manager_.lock();
    TDF_BASE_DCHECK(render_manager);
    if (!render_manager) {
      return;
    }
    // Before Layout
    render_manager->BeforeLayout();
    // build layout tree
    for (auto& layout_operation : self->layout_operations_) {
      layout_operation();
    }
    self->layout_operations_.clear();

    // 触发布局计算
    self->root_node_->DoLayout();
    // After Layout
    render_manager->AfterLayout();
    if (!self->layout_changed_nodes_.empty()) {
      render_manager->UpdateLayout(self->layout_changed_nodes_);
    }
  });
}

void DomManager::HandleEvent(const std::shared_ptr<DomEvent>& event) {
  // Post 到 Dom taskRunner 避免多线程问题
  PostTask([WEAK_THIS, event]() {
    DEFINE_AND_CHECK_SELF(DomManager)
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
      auto runner = self->delegate_task_runner_.lock();
      if (runner) {
        std::shared_ptr<CommonTask> task = std::make_shared<CommonTask>();
        task->func_ = [capture_list = std::move(capture_list),
                       capture_target_listeners = std::move(capture_target_listeners),
                       bubble_target_listeners = std::move(bubble_target_listeners), event, event_name]() mutable {
          // 执行捕获流程
          std::queue<std::shared_ptr<DomNode>> bubble_list = {};
          while (!capture_list.empty()) {
            auto capture_node = capture_list.top();
            capture_list.pop();
            event->SetCurrentTarget(capture_node);  // 设置当前节点，cb里会用到
            auto listeners = capture_node->GetEventListener(event_name, true);
            for (const auto& listener : listeners) {
              listener->cb(event);  // StopPropagation并不会影响同级的回调调用
            }
            if (event->IsPreventCapture()) {  // cb 内部调用了 event.StopPropagation 会阻止捕获
              return;  // 捕获流中StopPropagation不仅会导致捕获流程结束，后面的目标事件和冒泡都会终止
            }
            bubble_list.push(std::move(capture_node));
          }
          // 执行本身节点回调
          event->SetCurrentTarget(event->GetTarget());
          for (const auto& listener : capture_target_listeners) {
            listener->cb(event);
          }
          if (event->IsPreventCapture()) {
            return;
          }
          for (const auto& listener : bubble_target_listeners) {
            listener->cb(event);
          }
          if (event->IsPreventBubble()) {
            return;
          }
          // 执行冒泡流程
          while (!bubble_list.empty()) {
            auto bubble_node = bubble_list.front();
            bubble_list.pop();
            event->SetCurrentTarget(bubble_node);
            auto listeners = bubble_node->GetEventListener(event_name, false);
            for (const auto& listener : listeners) {
              listener->cb(event);
            }
            if (event->IsPreventBubble()) {
              break;
            }
          }
        };
        runner->PostTask(std::move(task));
      }
    }
  });
}

void DomManager::DomNodeRegistry::AddNode(const std::shared_ptr<DomNode>& node) {
  nodes_.insert(std::make_pair(node->GetId(), node));
}

std::shared_ptr<DomNode> DomManager::DomNodeRegistry::GetNode(int32_t id) {
  auto found = nodes_.find(id);
  if (found == nodes_.end()) {
    return nullptr;
  }
  return found->second;
}

void DomManager::DomNodeRegistry::RemoveNode(int32_t id) { nodes_.erase(id); }

void DomManager::PostTask(std::function<void()> func) {
  if (dom_task_runner_->Id() == hippy::base::ThreadId::GetCurrent()) {
    func();
  } else {
    std::shared_ptr<CommonTask> task = std::make_shared<CommonTask>();
    task->func_ = std::move(func);
    dom_task_runner_->PostTask(std::move(task));
  }
}

}  // namespace dom
}  // namespace hippy
