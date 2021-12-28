#include "dom/dom_node.h"

#include <algorithm>
#include <utility>
#include "base/logging.h"
#include "dom/node_props.h"
#include "dom/render_manager.h"
#include "dom/macro.h"

namespace hippy {
inline namespace dom {

constexpr char kLayoutLayoutKey[] = "layout";
constexpr char kLayoutXKey[] = "x";
constexpr char kLayoutYKey[] = "y";
constexpr char kLayoutWidthKey[] = "width";
constexpr char kLayoutHeightKey[] = "height";

using DomValueObjectType = tdf::base::DomValue::DomValueObjectType;

DomNode::DomNode(uint32_t id,
                 uint32_t pid,
                 int32_t index,
                 std::string tag_name,
                 std::string view_name,
                 std::unordered_map<std::string, std::shared_ptr<DomValue>> &&style_map,
                 std::unordered_map<std::string, std::shared_ptr<DomValue>> &&dom_ext_map,
                 const std::shared_ptr<DomManager> &dom_manager)
    : id_(id),
      pid_(pid),
      index_(index),
      tag_name_(std::move(tag_name)),
      view_name_(std::move(view_name)),
      style_map_(std::move(style_map)),
      dom_ext_map_(std::move(dom_ext_map)),
      is_just_layout_(false),
      is_virtual_(false),
      dom_manager_(dom_manager),
      current_callback_id_(0),
      func_cb_map_(nullptr),
      event_listener_map_(nullptr) {
  layout_node_ = std::make_shared<TaitankLayoutNode>();
}

DomNode::DomNode(uint32_t id, uint32_t pid, int32_t index)
    : id_(id),
      pid_(pid),
      index_(index),
      is_just_layout_(false),
      is_virtual_(false),
      current_callback_id_(0),
      func_cb_map_(nullptr),
      event_listener_map_(nullptr) {
  layout_node_ = std::make_shared<TaitankLayoutNode>();
}

DomNode::~DomNode() = default;

int32_t DomNode::IndexOf(const std::shared_ptr<DomNode> &child) {
  for (int i = 0; i < children_.size(); i++) {
    if (children_[i] == child) {
      return i;
    }
  }
  return kInvalidIndex;
}

std::shared_ptr<DomNode> DomNode::GetChildAt(int32_t index) {
  for (auto &i : children_) {
    if (i->index_ == index) {
      return i;
    }
  }
  return nullptr;
}

void DomNode::AddChildAt(const std::shared_ptr<DomNode>& dom_node, int32_t index) {
  auto it = children_.begin();
  auto insert_index = 0;
  while (it != children_.end()) {
    if (index < it->get()->GetIndex()) {
      break;
    }
    it++;
    insert_index++;
  }
  if (it == children_.end()) {
    children_.push_back(dom_node);
  } else {
    children_.insert(it, dom_node);
  }
  dom_node->SetParent(shared_from_this());
  layout_node_->InsertChild(dom_node->layout_node_, insert_index);
}

std::shared_ptr<DomNode> DomNode::RemoveChildAt(int32_t index) {
  auto child = children_[index];
  child->SetParent(nullptr);
  children_.erase(children_.begin() + index);
  layout_node_->RemoveChild(child->layout_node_);
  return child;
}

void DomNode::DoLayout() {
  std::shared_ptr<TaitankLayoutNode> node = std::static_pointer_cast<TaitankLayoutNode>(layout_node_);
  node->CalculateLayout(0, 0);
  TransferLayoutOutputsRecursive();
}

void DomNode::HandleEvent(const std::shared_ptr<DomEvent>& event) {
  auto dom_manager = dom_manager_.lock();
  if (dom_manager) {
    dom_manager->HandleEvent(event);
  }
}

void DomNode::HandleListener(const std::string& name, std::shared_ptr<DomArgument> param) {
  DomManager::HandleListener(shared_from_this(), name, std::move(param));
}

std::tuple<float, float> DomNode::GetLayoutSize() {
  return std::make_tuple(layout_node_->GetWidth(), layout_node_->GetHeight());
}

void DomNode::SetLayoutSize(float width, float height) {
  layout_node_->SetWidth(width);
  layout_node_->SetHeight(height);
}

void DomNode::AddEventListener(const std::string& name, bool use_capture, const EventCallback& cb,
                               const CallFunctionCallback& functionCallback) {
  auto dom_manager = dom_manager_.lock();
  TDF_BASE_DCHECK(dom_manager);
  if (dom_manager) {
    dom_manager->PostTask([WEAK_THIS, name, use_capture, cb, functionCallback]() {
      DEFINE_AND_CHECK_SELF(DomNode)
      // taskRunner内置执行确保current_callback_id_无多线程问题
      self->current_callback_id_ += 1;
      TDF_BASE_DCHECK(self->current_callback_id_ <= std::numeric_limits<uint32_t>::max());
      if (!self->event_listener_map_) {
        self->event_listener_map_ = std::make_shared<
            std::unordered_map<std::string, std::array<std::vector<std::shared_ptr<EventListenerInfo>>, 2>>>();
      }
      auto it = self->event_listener_map_->find(name);
      if (it == self->event_listener_map_->end()) {
        (*self->event_listener_map_)[name] = {};
        auto dom_manager = self->dom_manager_.lock();
        TDF_BASE_DCHECK(dom_manager);
        if (dom_manager) {
          dom_manager->AddEventListenerOperation(self, name);
        }
      }
      if (use_capture) {
        (*self->event_listener_map_)[name][kCapture].push_back(
            std::make_shared<EventListenerInfo>(self->current_callback_id_, cb));
      } else {
        (*self->event_listener_map_)[name][kBubble].push_back(
            std::make_shared<EventListenerInfo>(self->current_callback_id_, cb));
      }
      if (functionCallback) {
        auto arg = std::make_shared<DomArgument>(DomValue(self->current_callback_id_));
        functionCallback(arg);
      }
    });
  }
}

void DomNode::RemoveEventListener(const std::string& name, uint32_t id) {
  auto dom_manager = dom_manager_.lock();
  TDF_BASE_DCHECK(dom_manager);
  if (dom_manager) {
    dom_manager->PostTask([WEAK_THIS, name, id]() {
      DEFINE_AND_CHECK_SELF(DomNode)
      if (!self->event_listener_map_) {
        return;
      }
      auto it = self->event_listener_map_->find(name);
      if (it == self->event_listener_map_->end()) {
        return;
      }
      auto capture_listeners = it->second[kCapture];
      auto capture_it = std::find_if(capture_listeners.begin(), capture_listeners.end(),
                                     [id](const std::shared_ptr<EventListenerInfo>& item) {
                                       if (item->id == id) {
                                         return true;
                                       }
                                       return false;
                                     });
      if (capture_it != capture_listeners.end()) {
        capture_listeners.erase(capture_it);
      }
      auto bubble_listeners = it->second[kBubble];
      auto bubble_it = std::find_if(bubble_listeners.begin(), bubble_listeners.end(),
                                    [id](const std::shared_ptr<EventListenerInfo>& item) {
                                      if (item->id == id) {
                                        return true;
                                      }
                                      return false;
                                    });
      if (bubble_it != bubble_listeners.end()) {
        bubble_listeners.erase(bubble_it);
      }
      if (capture_listeners.empty() && bubble_listeners.empty()) {
        auto dom_manager = self->dom_manager_.lock();
        TDF_BASE_DCHECK(dom_manager);
        if (dom_manager) {
          auto render_manager = dom_manager->GetRenderManager();
          TDF_BASE_DCHECK(render_manager);
          render_manager->RemoveEventListener(self, name);
        }
      }
    });
  }
}

void DomNode::AddRenderListener(const std::string& name, const RenderCallback& cb,
                                const CallFunctionCallback& functionCallback) {
  auto dom_manager = dom_manager_.lock();
  TDF_BASE_DCHECK(dom_manager);
  if (dom_manager) {
    dom_manager->PostTask([WEAK_THIS, name, cb, functionCallback]() {
      DEFINE_AND_CHECK_SELF(DomNode)
      // taskRunner内置执行确保current_callback_id_无多线程问题
      self->current_callback_id_ += 1;
      TDF_BASE_DCHECK(self->current_callback_id_ <= std::numeric_limits<uint32_t>::max());
      if (!self->render_listener_map_) {
        self->render_listener_map_ =
            std::make_shared<std::unordered_map<std::string, std::vector<std::shared_ptr<RenderListenerInfo>>>>();
      }
      auto it = self->render_listener_map_->find(name);
      if (it == self->render_listener_map_->end()) {
        (*self->render_listener_map_)[name] = {};
        auto dom_manager = self->dom_manager_.lock();
        TDF_BASE_DCHECK(dom_manager);
        if (dom_manager) {
          dom_manager->AddRenderListenerOperation(self, name);
        }
      }
      (*self->render_listener_map_)[name].push_back(
          std::make_shared<RenderListenerInfo>(self->current_callback_id_, cb));
      if (functionCallback) {
        auto arg = std::make_shared<DomArgument>(DomValue(self->current_callback_id_));
        functionCallback(arg);
      }
    });
  }
}

void DomNode::RemoveRenderListener(const std::string& name, uint32_t id) {
  auto dom_manager = dom_manager_.lock();
  TDF_BASE_DCHECK(dom_manager);
  if (dom_manager) {
    dom_manager->PostTask([WEAK_THIS, name, id]() {
      DEFINE_AND_CHECK_SELF(DomNode)
      if (!self->render_listener_map_) {
        return;
      }
      auto it = self->render_listener_map_->find(name);
      if (it == self->render_listener_map_->end()) {
        return;
      }
      auto render_listeners = it->second;
      auto listener_it = std::find_if(render_listeners.begin(), render_listeners.end(),
                                      [id](const std::shared_ptr<RenderListenerInfo>& item) {
                                        if (item->id == id) {
                                          return true;
                                        }
                                        return false;
                                      });
      if (listener_it != render_listeners.end()) {
        render_listeners.erase(listener_it);
      }
      if (render_listeners.empty()) {
        auto dom_manager = self->dom_manager_.lock();
        TDF_BASE_DCHECK(dom_manager);
        if (dom_manager) {
          auto render_manager = dom_manager->GetRenderManager();
          TDF_BASE_DCHECK(render_manager);
          render_manager->RemoveRenderListener(self, name);
        }
      }
    });
  }
}

std::vector<std::shared_ptr<DomNode::EventListenerInfo>>
DomNode::GetEventListener(const std::string &name, bool is_capture) {
    if (!event_listener_map_) {
    return {};
  }
  auto it = event_listener_map_->find(name);
  if (it == event_listener_map_->end()) {
    return {};
  }
  if (is_capture) {
    return it->second[kCapture];
  }
  return it->second[kBubble];
}

std::vector<std::shared_ptr<DomNode::RenderListenerInfo>>
DomNode::GetRenderListener(const std::string &name) {
  if (!render_listener_map_) {
    return {};
  }
  auto it = render_listener_map_->find(name);
  if (it == render_listener_map_->end()) {
    return {};
  }
  return it->second;
}

void DomNode::ParseLayoutStyleInfo() { layout_node_->SetLayoutStyles(style_map_); }

void DomNode::TransferLayoutOutputsRecursive() {
  std::shared_ptr<TaitankLayoutNode> node = std::static_pointer_cast<TaitankLayoutNode>(layout_node_);
  bool changed = layout_.left != node->GetLeft() || layout_.top != node->GetTop() ||
                 layout_.width != node->GetWidth() || layout_.height != node->GetHeight();
  layout_.left = node->GetLeft();
  layout_.top = node->GetTop();
  layout_.width = node->GetWidth();
  layout_.height = node->GetHeight();
  layout_.marginLeft = node->GetMargin(TaitankCssDirection::CSSLeft);
  layout_.marginTop = node->GetMargin(TaitankCssDirection::CSSTop);
  layout_.marginRight = node->GetMargin(TaitankCssDirection::CSSRight);
  layout_.marginBottom = node->GetMargin(TaitankCssDirection::CSSBottom);
  layout_.paddingLeft = node->GetPadding(TaitankCssDirection::CSSLeft);
  layout_.paddingTop = node->GetPadding(TaitankCssDirection::CSSTop);
  layout_.paddingRight = node->GetPadding(TaitankCssDirection::CSSRight);
  layout_.paddingBottom = node->GetPadding(TaitankCssDirection::CSSBottom);

  node->SetHasNewLayout(false);
  if (changed) {
    auto dom_manager = dom_manager_.lock();
    if (dom_manager) {
      dom_manager->AddLayoutChangedNode(shared_from_this());
      DomValueObjectType layout_param;
      layout_param[kLayoutXKey] = DomValue(layout_.left);
      layout_param[kLayoutYKey] = DomValue(layout_.top);
      layout_param[kLayoutWidthKey] = DomValue(layout_.width);
      layout_param[kLayoutHeightKey] = DomValue(layout_.height);
      DomValueObjectType layout_obj;
      layout_obj[kLayoutLayoutKey] = std::move(layout_param);
      dom_manager->HandleEvent(std::make_shared<DomEvent>(kLayoutEvent, shared_from_this(), false, false, std::make_shared<DomValue>(layout_obj)));
    }
  }
  for (auto& it : children_) {
    it->TransferLayoutOutputsRecursive();
  }
}

void DomNode::CallFunction(const std::string& name, const DomArgument& param, const CallFunctionCallback& cb) {
  if (!func_cb_map_) {
    func_cb_map_ = std::make_shared<std::unordered_map<std::string, CallFunctionCallback>>();
  }
  (*func_cb_map_)[name] = cb;
  auto dom_manager = dom_manager_.lock();
  if (dom_manager) {
    dom_manager->GetRenderManager()->CallFunction(shared_from_this(), name, param, cb);
  }
}

CallFunctionCallback DomNode::GetCallback(const std::string &name) {
  if (!func_cb_map_) {
    return nullptr;
  }
  auto it = func_cb_map_->find(name);
  if (it != func_cb_map_->end()) {
    return it->second;
  }
  return nullptr;
}

bool DomNode::HasTouchEventListeners() {
  if (!event_listener_map_) {
    return false;
  }
  if (event_listener_map_->find(kTouchStartEvent) != event_listener_map_->end()
      || event_listener_map_->find(kTouchMoveEvent) != event_listener_map_->end()
      || event_listener_map_->find(kTouchEndEvent) != event_listener_map_->end()
      || event_listener_map_->find(kTouchCancelEvent) != event_listener_map_->end()) {
    return true;
  }
  return false;
}

}  // namespace dom
}  // namespace hippy
