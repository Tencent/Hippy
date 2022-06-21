#include "dom/root_node.h"

#include <stack>

#include "dom/animation/animation_manager.h"
#include "footstone/deserializer.h"
#include "footstone/hippy_value.h"
#include "dom/diff_utils.h"
#include "dom/render_manager.h"

namespace hippy {
inline namespace dom {

constexpr char kDomCreated[] = "DomCreated";
constexpr char kDomUpdated[] = "DomUpdated";
constexpr char kDomDeleted[] = "DomDeleted";
constexpr char kDomTreeCreated[] = "DomTreeCreated";
constexpr char kDomTreeUpdated[] = "DomTreeUpdated";
constexpr char kDomTreeDeleted[] = "DomTreeDeleted";

using Deserializer = footstone::value::Deserializer;
using Serializer = footstone::value::Serializer;
using DomValueArrayType = footstone::value::HippyValue::DomValueArrayType;
using Task = footstone::Task;

RootNode::RootNode(uint32_t id)
        : DomNode(id, 0, 0, "", "", nullptr, nullptr, {}) {
  animation_manager_ = std::make_shared<AnimationManager>();
  interceptors_.push_back(animation_manager_);
}

RootNode::RootNode(): RootNode(0) {}

void RootNode::AddEventListener(const std::string& name,
                                uint64_t listener_id,
                                bool use_capture,
                                const EventCallback& cb) {
  DomNode::AddEventListener(name, listener_id, use_capture, cb);
  AddEvent(GetId(), name);
}

void RootNode::RemoveEventListener(const std::string& name, uint64_t listener_id) {
  DomNode::RemoveEventListener(name, listener_id);
  RemoveEvent(GetId(), name);
}

void RootNode::CreateDomNodes(std::vector<std::shared_ptr<DomInfo>>&& nodes) {
  for (const auto& interceptor : interceptors_) {
    interceptor->OnDomNodeCreate(nodes);
  }
  std::vector<std::shared_ptr<DomNode>> nodes_to_create;
  for (const auto& node_info : nodes) {
    auto node = node_info->dom_node;
    std::shared_ptr<DomNode> parent_node = GetNode(node->GetPid());
    if (parent_node == nullptr) {
      continue;
    }
    nodes_to_create.push_back(node);
    // 解析布局属性
    node->ParseLayoutStyleInfo();
    parent_node->AddChildByRefInfo(node_info);
    auto event = std::make_shared<DomEvent>(kDomCreated, node, nullptr);
    node->HandleEvent(event);
    OnDomNodeCreated(node);
  }
  for(const auto& node: nodes_to_create) {
      node->SetRenderInfo({node->GetId(), node->GetPid(), node->GetSelfIndex()});
  }
  auto event = std::make_shared<DomEvent>(kDomTreeCreated, weak_from_this(), nullptr);
  HandleEvent(event);

  if (!nodes_to_create.empty()) {
    dom_operations_.push_back({DomOperation::kOpCreate, nodes_to_create});
  }
}

void RootNode::UpdateDomNodes(std::vector<std::shared_ptr<DomInfo>>&& nodes) {
  for (const auto& interceptor : interceptors_) {
    interceptor->OnDomNodeUpdate(nodes);
  }
  std::vector<std::shared_ptr<DomNode>> nodes_to_update;
  for (const auto& node_info : nodes) {
    std::shared_ptr<DomNode> dom_node = GetNode(node_info->dom_node->GetId());
    if (dom_node == nullptr) {
      continue;
    }
    nodes_to_update.push_back(dom_node);
    // diff props
    auto style_diff_value = DiffUtils::DiffProps(*dom_node->GetStyleMap(), *node_info->dom_node->GetStyleMap());
    auto ext_diff_value = DiffUtils::DiffProps(*dom_node->GetExtStyle(), *node_info->dom_node->GetExtStyle());
    auto style_update = std::get<0>(style_diff_value);
    auto ext_update = std::get<0>(ext_diff_value);
    std::shared_ptr<DomValueMap> diff_value = std::make_shared<DomValueMap>();
    if (style_update) {
      diff_value->insert(style_update->begin(), style_update->end());
    }
    if (ext_update) {
      diff_value->insert(ext_update->begin(), ext_update->end());
    }
    dom_node->SetStyleMap(node_info->dom_node->GetStyleMap());
    dom_node->SetExtStyleMap(node_info->dom_node->GetExtStyle());
    dom_node->SetDiffStyle(diff_value);
    auto style_delete = std::get<1>(style_diff_value);
    auto ext_delete = std::get<1>(ext_diff_value);
    std::shared_ptr<std::vector<std::string>> delete_value = std::make_shared<std::vector<std::string>>();
    if (style_delete) {
      delete_value->insert(delete_value->end(), style_delete->begin(), style_delete->end());
    }
    if (ext_delete) {
      delete_value->insert(delete_value->end(), ext_delete->begin(), ext_delete->end());
    }
    dom_node->SetDeleteProps(delete_value);
    node_info->dom_node->SetDiffStyle(diff_value);
    node_info->dom_node->SetDeleteProps(delete_value);
    dom_node->ParseLayoutStyleInfo();
    auto event = std::make_shared<DomEvent>(kDomUpdated, dom_node, nullptr);
    dom_node->HandleEvent(event);
  }

  auto event = std::make_shared<DomEvent>(kDomTreeUpdated, weak_from_this(), nullptr);
  HandleEvent(event);

  if (!nodes_to_update.empty()) {
    dom_operations_.push_back({DomOperation::kOpUpdate, nodes_to_update});
  }
}

void RootNode::MoveDomNodes(std::vector<std::shared_ptr<DomInfo>> &&nodes) {
  for (const auto& interceptor : interceptors_) {
    interceptor->OnDomNodeMove(nodes);
  }
  std::vector<std::shared_ptr<DomNode>> nodes_to_move;
  for (const auto& node_info : nodes) {
      std::shared_ptr<DomNode> parent_node = GetNode(node_info->dom_node->GetPid());
      if (parent_node == nullptr) {
          continue;
      }
      auto node = parent_node->RemoveChildById(node_info->dom_node->GetId());
      if (node == nullptr) {
          continue;
      }
      nodes_to_move.push_back(node);
      parent_node->AddChildByRefInfo(std::make_shared<DomInfo>(node, node_info->ref_info));
  }
  for(const auto& node: nodes_to_move) {
      node->SetRenderInfo({node->GetId(), node->GetPid(), node->GetSelfIndex()});
  }
  if (!nodes_to_move.empty()) {
      dom_operations_.push_back({DomOperation::kOpMove, nodes_to_move});
  }
}

void RootNode::DeleteDomNodes(std::vector<std::shared_ptr<DomInfo>>&& nodes) {
  for (const auto& interceptor : interceptors_) {
    interceptor->OnDomNodeDelete(nodes);
  }
  std::vector<std::shared_ptr<DomNode>> nodes_to_delete;
  for (const auto & it : nodes) {
    std::shared_ptr<DomNode> node = GetNode(it->dom_node->GetId());
    if (node == nullptr) {
      continue;
    }
    nodes_to_delete.push_back(node);
    std::shared_ptr<DomNode> parent_node = node->GetParent();
    if (parent_node != nullptr) {
      parent_node->RemoveChildAt(parent_node->IndexOf(node));
    }
    auto event = std::make_shared<DomEvent>(kDomDeleted, node, nullptr);
    node->HandleEvent(event);
    OnDomNodeDeleted(node);
  }

  auto event = std::make_shared<DomEvent>(kDomTreeDeleted, weak_from_this(), nullptr);
  HandleEvent(event);

  if (!nodes_to_delete.empty()) {
    dom_operations_.push_back({DomOperation::kOpDelete, nodes_to_delete});
  }
}

void RootNode::UpdateAnimation(std::vector<std::shared_ptr<DomNode>> &&nodes) {
    std::vector<std::shared_ptr<DomNode>> nodes_to_update;
    for (const auto& it : nodes) {
        std::shared_ptr<DomNode> node = GetNode(it->GetId());
        if (node == nullptr) {
            continue;
        }
        nodes_to_update.push_back(node);
        node->ParseLayoutStyleInfo();
        auto event = std::make_shared<DomEvent>(kDomUpdated, node, nullptr);
        node->HandleEvent(event);
    }
    auto event = std::make_shared<DomEvent>(kDomTreeUpdated, weak_from_this(), nullptr);
    HandleEvent(event);
    if (!nodes_to_update.empty()) {
        dom_operations_.push_back({DomOperation::kOpUpdate, nodes_to_update});
    }
}

void RootNode::CallFunction(uint32_t id, const std::string &name, const DomArgument &param,
                            const CallFunctionCallback &cb) {
  auto node = GetNode(id);
  if (node) {
    node->CallFunction(name, param, cb);
  }
}

void RootNode::SyncWithRenderManager(const std::shared_ptr<RenderManager>& render_manager) {
  FlushDomOperations(render_manager);
  FlushEventOperations(render_manager);
  DoAndFlushLayout(render_manager);
  render_manager->EndBatch(GetWeakSelf());
}

void RootNode::AddEvent(uint32_t id, const std::string& event_name) {
  event_operations_.push_back({EventOperation::kOpAdd, id, event_name});
}

void RootNode::RemoveEvent(uint32_t id, const std::string& event_name) {
  event_operations_.push_back({EventOperation::kOpRemove, id, event_name});
}

void RootNode::HandleEvent(const std::shared_ptr<DomEvent>& event) {
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
      auto func = [capture_list = std::move(capture_list),
                   capture_target_listeners = std::move(capture_target_listeners),
                   bubble_target_listeners = std::move(bubble_target_listeners),
                   dom_event = std::move(event),
                   event_name]() mutable {
        // 执行捕获流程
        std::stack<std::shared_ptr<DomNode>> bubble_list = {};
        while (!capture_list.empty()) {
          auto capture_node = capture_list.top();
          capture_list.pop();
          dom_event->SetCurrentTarget(capture_node);  // 设置当前节点，cb里会用到
          auto listeners = capture_node->GetEventListener(event_name, true);
          for (const auto& listener : listeners) {
            dom_event->SetEventPhase(EventPhase::kCapturePhase);
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
          dom_event->SetEventPhase(EventPhase::kAtTarget);
          listener->cb(dom_event);
        }
        if (dom_event->IsPreventCapture()) {
          return;
        }
        for (const auto& listener : bubble_target_listeners) {
          dom_event->SetEventPhase(EventPhase::kAtTarget);
          listener->cb(dom_event);
        }
        if (dom_event->IsPreventBubble()) {
          return;
        }
        // 执行冒泡流程
        while (!bubble_list.empty()) {
          auto bubble_node = bubble_list.top();
          bubble_list.pop();
          dom_event->SetCurrentTarget(bubble_node);
          auto listeners = bubble_node->GetEventListener(event_name, false);
          for (const auto& listener : listeners) {
            dom_event->SetEventPhase(EventPhase::kBubblePhase);
            listener->cb(dom_event);
          }
          if (dom_event->IsPreventBubble()) {
            break;
          }
        }
      };
      runner->PostTask(std::move(func));
    }
  }
}

void RootNode::UpdateRenderNode(const std::shared_ptr<DomNode>& node) {
  auto dom_manager = dom_manager_.lock();
  if (!dom_manager) {
    return;
  }
  auto render_manager = dom_manager->GetRenderManager().lock();
  FOOTSTONE_DCHECK(render_manager);
  if (!render_manager) {
    return;
  }
  FOOTSTONE_DCHECK(node);

  // 更新 layout tree
  node->ParseLayoutStyleInfo();

  // 更新属性
  std::vector<std::shared_ptr<DomNode>> nodes;
  nodes.push_back(node);
  render_manager->UpdateRenderNode(GetWeakSelf(), std::move(nodes));
  SyncWithRenderManager(render_manager);
}

std::shared_ptr<DomNode> RootNode::GetNode(uint32_t id) {
  if (id == GetId()) {
    return shared_from_this();
  }
  auto found = nodes_.find(id);
  if (found == nodes_.end()) {
    return nullptr;
  }
  return found->second.lock();
}

std::tuple<float, float> RootNode::GetRootSize() {
  return GetLayoutSize();
}

void RootNode::SetRootSize(float width, float height) {
  SetLayoutSize(width, height);
}

void RootNode::DoAndFlushLayout(const std::shared_ptr<RenderManager>& render_manager) {
  // Before Layout
  render_manager->BeforeLayout(GetWeakSelf());
  // 触发布局计算
  std::vector<std::shared_ptr<DomNode>> layout_changed_nodes;
  DoLayout(layout_changed_nodes);
  // After Layout
  render_manager->AfterLayout(GetWeakSelf());

  if (!layout_changed_nodes.empty()) {
    render_manager->UpdateLayout(GetWeakSelf(), layout_changed_nodes);
  }
}

void RootNode::FlushDomOperations(const std::shared_ptr<RenderManager>& render_manager) {
  for (auto& dom_operation : dom_operations_) {
    switch (dom_operation.op) {
      case DomOperation::kOpCreate:
        render_manager->CreateRenderNode(GetWeakSelf(), std::move(dom_operation.nodes));
        break;
      case DomOperation::kOpUpdate:
        render_manager->UpdateRenderNode(GetWeakSelf(), std::move(dom_operation.nodes));
        break;
      case DomOperation::kOpDelete:
        render_manager->DeleteRenderNode(GetWeakSelf(), std::move(dom_operation.nodes));
        break;
      case DomOperation::kOpMove:
        render_manager->MoveRenderNode(GetWeakSelf(), std::move(dom_operation.nodes));
        break;
      default:
        break;
    }
  }
  dom_operations_.clear();
}

void RootNode::FlushEventOperations(const std::shared_ptr<RenderManager>& render_manager) {
  for (auto& event_operation : event_operations_) {
    const auto& node = GetNode(event_operation.id);
    if (node == nullptr) {
      continue;
    }

    switch (event_operation.op) {
      case EventOperation::kOpAdd:
        render_manager->AddEventListener(GetWeakSelf(), node, event_operation.name);
        break;
      case EventOperation::kOpRemove:
        render_manager->RemoveEventListener(GetWeakSelf(), node, event_operation.name);
        break;
      default:
        break;
    }
  }
  event_operations_.clear();
}

void RootNode::OnDomNodeCreated(const std::shared_ptr<DomNode>& node) {
  nodes_.insert(std::make_pair(node->GetId(), node));
}

void RootNode::OnDomNodeDeleted(const std::shared_ptr<DomNode> &node) {
  if (node) {
    for (const auto &child : node->GetChildren()) {
      if (child) {
        OnDomNodeDeleted(child);
      }
    }
    nodes_.erase(node->GetId());
  }
}

std::weak_ptr<RootNode> RootNode::GetWeakSelf() {
  return std::static_pointer_cast<RootNode>(shared_from_this());
}

void RootNode::AddInterceptor(const std::shared_ptr<DomActionInterceptor>& interceptor) {
  interceptors_.push_back(interceptor);
}

void RootNode::Traverse(const std::function<void(const std::shared_ptr<DomNode>&)>& on_traverse) {
  std::stack<std::shared_ptr<DomNode>> stack;
  stack.push(shared_from_this());
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

}  // namespace dom
}  // namespace hippy
