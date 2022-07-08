/**
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#pragma once

#include "core/common/listener.h"
#include "core/tdfi/view/view.h"
#include "dom/dom_argument.h"
#include "dom/dom_node.h"
#include "footstone/hippy_value.h"
#include "footstone/logging.h"
#include "render/tdf/tdf_render_context.h"

#define TDF_RENDER_CHECK_ATTACH \
  if (!IsAttached()) {          \
    return;                     \
  }

namespace tdfrender {
using DomValueObjectType = footstone::HippyValue::HippyValueObjectType;
using hippy::dom::DomArgument;
using DomStyleMap = std::unordered_map<std::string, std::shared_ptr<footstone::HippyValue>>;

using RenderInfo = hippy::dom::DomNode::RenderInfo;
class ViewNode;
using node_creator = std::function<std::shared_ptr<ViewNode>(RenderInfo)>;
using Point = tdfcore::TPoint;

/*
 * Binding a tdfcore::View with  a hippy::DomNode.
 */
class ViewNode : public tdfcore::Object, public std::enable_shared_from_this<ViewNode> {
 public:
  ViewNode(const RenderInfo info, std::shared_ptr<tdfcore::View> view = nullptr);
  virtual ~ViewNode() = default;

  static node_creator GetViewNodeCreator();

  template <class T>
  std::shared_ptr<T> GetView() {
    if (auto view = attached_view_.lock(); view != nullptr) {
      return std::static_pointer_cast<T>(view);
    } else {
      assert(false);
    }
    return nullptr;
  }

  std::shared_ptr<tdfcore::View> GetView() { return GetView<tdfcore::View>(); }

  /**
   * @brief Be called when a related DomNode is Created.
   */
  virtual void OnCreate();

  /**
   * @brief Be called when a related DomNode is Updated.
   */
  void OnUpdate(hippy::DomNode& dom_node);

  /**
   * @brief Be called when a related DomNode is Deleted.
   */
  void OnDelete();

  virtual void HandleLayoutUpdate(hippy::LayoutResult layout_result);

  virtual void OnAddEventListener(uint32_t id, const std::string& name);

  virtual void OnRemoveEventListener(uint32_t id, const std::string& name);

  virtual std::string GetViewName() const { return "View"; }

  virtual void CallFunction(const std::string& name, const DomArgument& param, const uint32_t call_back_id) {}

  void SetRenderContext(std::weak_ptr<TDFRenderContext> context) { render_context_ = context; }

  static tdfcore::Color ParseToColor(const std::shared_ptr<footstone::HippyValue>& value);

  std::shared_ptr<ViewNode> GetSharedPtr() { return shared_from_this(); }

  uint64_t AddLayoutUpdateListener(const std::function<void(tdfcore::TRect)>& listener) {
    return layout_listener_.Add(listener);
  }

  void RemoveLayoutUpdateListener(uint64_t id) { layout_listener_.Remove(id); }

  const RenderInfo& GetRenderInfo() const { return render_info_; }

  std::shared_ptr<hippy::DomNode> GetDomNode() const;

  std::vector<std::shared_ptr<ViewNode>> GetChildren() const { return children_; }

  /**
   * @brief attach current ViewNode to a tdfcore::View
   *        if view != nullptr(ListViewItem for example),then reuse it.Otherwise create a new tdfcore::View
   */
  void Attach(const std::shared_ptr<tdfcore::View>& view = nullptr);

  /**
   * @brief detach current ViewNode to a tdfcore::View.
   *        if sync_to_view_tree is false(ListViewItem for example), do not destroy the view tree, it will be
   *        reused for next Attach action.
   */
  void Detach(bool sync_to_view_tree = true);

  /**
   * @brief wheather current ViewNode is attached to a tdfcore::View
   */
  bool IsAttached() { return is_attached_; }

  void SetCorrectedIndex(int32_t index) { corrected_index_ = index; }

 protected:
  /**
   * @brief notify after the attach action
   */
  virtual void OnAttach(){}

  /**
   * @brief notify before the detach action
   */
  virtual void OnDetach(){}

  int32_t GetCorrectedIndex() const { return corrected_index_; }

  std::shared_ptr<TDFRenderContext> GetRenderContext() const;

  virtual void HandleStyleUpdate(const DomStyleMap& dom_style);

  /**
   * @brief create the related tdfcore::View when attach if needed.
   */
  virtual std::shared_ptr<tdfcore::View> CreateView();

  void SendGestureDomEvent(std::string type, const std::shared_ptr<footstone::HippyValue>& value = nullptr);

  void SendUIDomEvent(std::string type, const std::shared_ptr<footstone::HippyValue>& value = nullptr);

  /**
   * @brief Be called in ViewNode::OnCreate(mount in the ViewNode Tree immediately after create)
   */
  void AddChildAt(const std::shared_ptr<ViewNode>& dom_node, int32_t index);

  /**
   * @brief Be called in ViewNode::OnDelete(unmount in the ViewNode Tree immediately after create)
   */
  void RemoveChild(const std::shared_ptr<ViewNode>& child);

  /**
   * @brief Be called in ViewNode::OnDelete(unmount in the ViewNode Tree immediately after create)
   *        Not work for now.Because sometimes OnCreate is before OnDelete,which make index conflict.
   */
  std::shared_ptr<ViewNode> RemoveChildAt(int32_t index);

  /**
   * @brief notify after the AddChild action(sync the tdfcore::View Tree)
   */
  virtual void OnChildAdd(ViewNode& child, int64_t index);

  /**
   * @brief notify before the RemoveChild action(sync the tdfcore::View Tree)
   */
  virtual void OnChildRemove(ViewNode& child);

  void SetParent(std::shared_ptr<ViewNode> parent) { parent_ = parent; }

  inline std::shared_ptr<ViewNode> GetParent() { return parent_.lock(); }

  uint32_t GetChildCount() const { return footstone::checked_numeric_cast<size_t, uint32_t>(children_.size()); }

  /**
   * @brief merge the style info in DomNode
   */
  DomStyleMap GenerateStyleInfo();

  const RenderInfo render_info_;

  std::set<std::string> GetSupportedEvents() { return supported_events_; }

 protected:
  // set as protected for root node
  bool is_attached_ = false;

  virtual void HandleEventInfoUpdate();

 private:
  std::weak_ptr<tdfcore::View> attached_view_;

  /**
   * @brief DomNode's RenderInfo.index is not always the related View's index, it may need to be corrected.
   */
  int32_t corrected_index_;

  std::weak_ptr<TDFRenderContext> render_context_;

  tdfcore::Listener<tdfcore::TRect> layout_listener_;

  std::weak_ptr<ViewNode> parent_;
  std::vector<std::shared_ptr<ViewNode>> children_;

  std::set<std::string> supported_events_;
};

}  // namespace tdfrender
