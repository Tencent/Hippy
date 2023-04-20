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

#include "renderer/tdf/viewnode/view_node.h"

#include <algorithm>
#include <utility>

#include "core/common/color.h"
#include "core/support/text/UTF.h"
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wsign-conversion"
#pragma clang diagnostic ignored "-Wsign-compare"
#pragma clang diagnostic ignored "-Wextra-semi"
#pragma clang diagnostic ignored "-Wc++98-compat-extra-semi"
#pragma clang diagnostic ignored "-Wignored-qualifiers"
#pragma clang diagnostic ignored "-Wimplicit-float-conversion"
#pragma clang diagnostic ignored "-Wimplicit-int-conversion"
#pragma clang diagnostic ignored "-Wfloat-conversion"
#pragma clang diagnostic ignored "-Wshadow"
#pragma clang diagnostic ignored "-Wdeprecated-copy"
#pragma clang diagnostic ignored "-Wshorten-64-to-32"
#include "tdfui/view/text/text_view.h"
#include "tdfui/view/text/text_input_view.h"
#include "tdfui/view/image_view.h"
#pragma clang diagnostic pop
#include "dom/node_props.h"
#include "dom/scene.h"
#include "footstone/hippy_value.h"
#include "footstone/logging.h"
#include "renderer/tdf/viewnode/node_attributes_parser.h"
#include "renderer/tdf/viewnode/root_view_node.h"
#include "renderer/tdf/viewnode/view_names.h"

namespace hippy {
inline namespace render {
inline namespace tdf {

using footstone::check::checked_numeric_cast;
using DomValueArrayType = footstone::value::HippyValue::DomValueArrayType;
using HippyValueObjectType = footstone::value::HippyValue::HippyValueObjectType;

ViewNode::ViewNode(const std::shared_ptr<hippy::dom::DomNode> &dom_node, const RenderInfo info,
                   std::shared_ptr<tdfcore::View> view)
    : dom_node_(dom_node), render_info_(info), attached_view_(std::move(view)),
    corrected_index_(info.index) {
  SetId(info.id);
}

ViewNode::DomStyleMap ViewNode::GenerateStyleInfo(const std::shared_ptr<hippy::DomNode>& dom_node) {
  DomStyleMap dom_style_map;
  auto style_map = dom_node->GetStyleMap();
  for (const auto& it : *style_map) {
    dom_style_map.insert(it);
  }
  auto ext_map = dom_node->GetExtStyle();
  for (const auto& it : *ext_map) {
    dom_style_map.insert(it);
  }
  return dom_style_map;
}

void ViewNode::OnCreate() {
  // parent可能为空的情况说明：
  // OptimizedRenderManager处理先create又delete的结点时，因为dom树上的删除，同时老pid的结点被优化掉，会传递1个没有父节点的悬空结点下来，从而找不到parent。
  auto parent = GetRootNode()->FindViewNode(GetRenderInfo().pid);
  if(!parent) {
    return;
  }
  parent->AddChildAt(shared_from_this(), render_info_.index);
}

void ViewNode::OnUpdate(const std::shared_ptr<hippy::dom::DomNode> &dom_node) {
  FOOTSTONE_DCHECK(render_info_.id == dom_node->GetRenderInfo().id);
  if (!IsAttached()) {
    return;
  }
  // only update the different part
  if (dom_node->GetDiffStyle() != nullptr) {
    HandleStyleUpdate(*(dom_node->GetDiffStyle()), *(dom_node->GetDeleteProps()));
  }
}

void ViewNode::HandleStyleUpdate(const DomStyleMap& dom_style, const DomDeleteProps& dom_delete_props) {
  FOOTSTONE_DCHECK(IsAttached());
  auto view = GetView();
  auto const map_end = dom_style.cend();

  if (auto it = dom_style.find(view::kBackgroundColor); it != map_end && it->second != nullptr) {
    FOOTSTONE_DCHECK(it->second->IsDouble());
    view->SetBackgroundColor(ViewNode::ParseToColor(it->second));
  }

  // Border Width / Border Color / Border Radius ,All in On Method
  util::ParseBorderInfo(*view, dom_style);

  if (auto it = dom_style.find(view::kLinearGradient); it != map_end && it->second != nullptr) {
    util::ParseLinearGradientInfo(*view, it->second->ToObjectChecked());
  }

  // view::kLongclick will will handled in ViewNode::OnAddEventListener

  // kNextFocusDownId  / kNextFocusLeftId  / kNextFocusRightId / kNextFocusUpId

  if (auto it = dom_style.find(hippy::dom::kOpacity); it != map_end && it->second != nullptr) {
    FOOTSTONE_DCHECK(it->second->IsDouble());
    view->SetOpacity(static_cast<float>(it->second->ToDoubleChecked()));
  }

  if (auto it = dom_style.find(hippy::dom::kOverflow); it != map_end && it->second != nullptr) {
    FOOTSTONE_DCHECK(it->second->IsString());
    auto overflow_value = it->second->ToStringChecked();
    if (overflow_value == "visible") {
      view->SetClipToBounds(false);
    } else if(overflow_value == "hidden") {
      view->SetClipToBounds(true);
    }
  }

  util::ParseShadowInfo(*view, dom_style);

  // animation
  view->SetTransform(GenerateAnimationTransform(dom_style, view).asM33());

  if (auto it = dom_style.find(hippy::dom::kZIndex); it != map_end && it->second != nullptr) {
    view->SetZIndex(static_cast<int32_t>(it->second->ToDoubleChecked()));
  }

  // kIntercepttouchevent / kInterceptpullupevent
  HandleInterceptEvent(dom_style);

  // handle props deleted
  for (auto it = dom_delete_props.begin(); it != dom_delete_props.end(); it++) {
    if (*it == view::kBackgroundColor) {
      view->SetBackgroundColor(tdfcore::Color::Transparent());
    } else if (*it == hippy::dom::kOpacity) {
      view->SetOpacity(1.f);
    } else if (*it == hippy::dom::kOverflow) {
      view->SetClipToBounds(true);
    }
  }
}

tdfcore::TM44 ViewNode::GenerateAnimationTransform(const DomStyleMap& dom_style, std::shared_ptr<tdfcore::View> view) {
  auto transform = tdfcore::TM44();
  auto transform_it = dom_style.find(kTransform);
  if (transform_it == dom_style.end()) {
    return transform;
  }

  HippyValueObjectType transform_style;
  DomValueArrayType parsed_array;
  if (!transform_it->second->ToArray(parsed_array)) {
    return transform;
  }
  if (!parsed_array[0].ToObject(transform_style)) {
    return transform;
  }

  if (auto it = transform_style.find(kMatrix); it != transform_style.end()) {
    FOOTSTONE_CHECK(it->second.IsArray());
    DomValueArrayType matrix_array;
    auto result = it->second.ToArray(matrix_array);
    if (!result) {
      return transform;
    }
    FOOTSTONE_CHECK(matrix_array.size() == 16);
    for (int i = 0; i < 4; ++i) {
      auto tv4 = tdfcore::TV4();
      tv4.x = static_cast<float>(i + 0);
      tv4.y = static_cast<float>(i + 4);
      tv4.z = static_cast<float>(i + 8);
      tv4.w = static_cast<float>(i + 12);
      transform.setRow(i, tv4);
    }
  }

  if (auto it = transform_style.find(kPerspective); it != transform_style.end()) {
    FOOTSTONE_DCHECK(it->second.IsDouble());
    // M44中 2x3对应的位置就是perspective属性
    transform.setRC(2, 3, static_cast<float>(it->second.ToDoubleChecked()));
  }

  auto tv3 = tdfcore::TV3();
  if (auto it = transform_style.find(kRotateX); it != transform_style.end()) {
    FOOTSTONE_DCHECK(it->second.IsDouble());
    auto radians = static_cast<float>(util::HippyValueToRadians(it->second));
    tv3.x = 1;
    transform.setRotateUnit(tv3, radians);
  }

  if (auto it = transform_style.find(kRotateY); it != transform_style.end()) {
    FOOTSTONE_DCHECK(it->second.IsDouble());
    auto radians = static_cast<float>(util::HippyValueToRadians(it->second));
    tv3.y = 1;
    transform.setRotateUnit(tv3, radians);
  }

  if (auto it = transform_style.find(kRotate); it != transform_style.end()) {
    auto radians = static_cast<float>(util::HippyValueToRadians(it->second));
    tv3.z = 1;
    transform.setRotateUnit(tv3, radians);
  }

  if (auto it = transform_style.find(kRotateZ); it != transform_style.end()) {
    auto radians = static_cast<float>(util::HippyValueToRadians(it->second));
    tv3.z = 1;
    transform.setRotateUnit(tv3, radians);
  }

  if (auto it = transform_style.find(kScale); it != transform_style.end()) {
    FOOTSTONE_DCHECK(it->second.IsDouble());
    auto scale = static_cast<float>(it->second.ToDoubleChecked());
    transform.setScale(scale, scale);
  }

  if (auto it = transform_style.find(kScaleX); it != transform_style.end()) {
    FOOTSTONE_DCHECK(it->second.IsDouble());
    auto scale = static_cast<float>(it->second.ToDoubleChecked());
    transform.setScale(scale, 0);
  }

  if (auto it = transform_style.find(kScaleY); it != transform_style.end()) {
    FOOTSTONE_DCHECK(it->second.IsDouble());
    auto scale = static_cast<float>(it->second.ToDoubleChecked());
    transform.setScale(0, scale);
  }

  if (auto it = transform_style.find(kTranslate); it != transform_style.end()) {
    FOOTSTONE_DCHECK(it->second.IsDouble());
    DomValueArrayType translation_array;
    auto result = it->second.ToArray(translation_array);
    if (!result) {
      return transform;
    }
    FOOTSTONE_CHECK(translation_array.size() == 3);
    auto translate_x = static_cast<float>(translation_array.at(0).ToDoubleChecked());
    auto translate_y = static_cast<float>(translation_array.at(1).ToDoubleChecked());
    auto translate_z = static_cast<float>(translation_array.at(2).ToDoubleChecked());
    transform.setTranslate(translate_x, translate_y, translate_z);
  }

  if (auto it = transform_style.find(kTranslateX); it != transform_style.end()) {
    FOOTSTONE_DCHECK(it->second.IsDouble());
    auto translate_x = static_cast<float>(it->second.ToDoubleChecked());
    transform.setTranslate(translate_x, 0);
  }

  if (auto it = transform_style.find(kTranslateY); it != transform_style.end()) {
    FOOTSTONE_DCHECK(it->second.IsDouble());
    auto translate_y = static_cast<float>(it->second.ToDoubleChecked());
    transform.setTranslate(0, translate_y);
  }

  if (auto it = transform_style.find(kSkewX); it != transform_style.end()) {
    auto skew_x = static_cast<float>(util::HippyValueToRadians(it->second));
    transform.setRC(0, 1, skew_x);
  }

  if (auto it = transform_style.find(kSkewY); it != transform_style.end()) {
    auto skew_y = static_cast<float>(util::HippyValueToRadians(it->second));
    transform.setRC(1, 0, skew_y);
  }
  return transform;
}

void ViewNode::OnDelete() {
  // recursively delete children at first(unmount the sub tree)
  for (auto it = children_.rbegin(); it != children_.rend(); it++) {
    (*it)->OnDelete();
  }
  if (!isRoot()) {
    if (!parent_.expired()) {
      parent_.lock()->RemoveChild(shared_from_this());
    }
    GetRootNode()->UnregisterViewNode(render_info_.id);
  }
}

void ViewNode::HandleLayoutUpdate(hippy::LayoutResult layout_result) {
  TDF_RENDER_CHECK_ATTACH

  if (use_view_layout_origin_) {
    auto origin_left = GetView()->GetFrame().left;
    auto origin_top = GetView()->GetFrame().top;
    layout_result.left = origin_left;
    layout_result.top = origin_top;
  }

  if (layout_result.width < 0) {
    layout_result.width = 0;
  }
  if (layout_result.height < 0) {
    layout_result.height = 0;
  }

  auto new_frame =
      tdfcore::TRect::MakeXYWH(layout_result.left, layout_result.top, layout_result.width, layout_result.height);
  GetView()->SetFrame(new_frame);
  FOOTSTONE_LOG(INFO) << "ViewNode::HandleLayoutUpdate: " << render_info_.id << " |" << new_frame.X() << " | "
                      << new_frame.Y() << " | " << new_frame.Width() << " | " << new_frame.Height() << " |  "
                      << render_info_.pid << " | " << GetViewName();
  layout_listener_.Notify(new_frame);
}

std::shared_ptr<tdfcore::View> ViewNode::CreateView() {
  auto view = TDF_MAKE_SHARED(tdfcore::View);
  view->SetClipToBounds(true);
  return view;
}

tdfcore::Color ViewNode::ParseToColor(const std::shared_ptr<footstone::HippyValue>& value) {
  // Temp solution: https://km.woa.com/articles/show/526929
  return util::ConversionIntToColor(static_cast<uint32_t>(value->ToDoubleChecked()));
}

void ViewNode::OnAddEventListener(uint32_t id, const std::string& name) {
  if(supported_events_.find(name) == supported_events_.end()) {
    supported_events_.emplace(name);
  }
  TDF_RENDER_CHECK_ATTACH
  HandleEventInfoUpdate();
}

void ViewNode::OnRemoveEventListener(uint32_t id, const std::string& name) {
  supported_events_.erase(name);
  TDF_RENDER_CHECK_ATTACH
  HandleEventInfoUpdate();
}

void ViewNode::HandleEventInfoUpdate() {
  if (supported_events_.find(hippy::kClickEvent) != supported_events_.end() ||
      supported_events_.find(hippy::kPressIn) != supported_events_.end() ||
      supported_events_.find(hippy::kPressOut) != supported_events_.end()) {
    RegisterClickEvent();
  }

  if (supported_events_.find(hippy::kLongClickEvent) != supported_events_.end()) {
    RegisterLongClickEvent();
  }

  if (supported_events_.find(hippy::kTouchStartEvent) != supported_events_.end() ||
      supported_events_.find(hippy::kTouchMoveEvent) != supported_events_.end() ||
      supported_events_.find(hippy::kTouchEndEvent) != supported_events_.end() ||
      supported_events_.find(hippy::kTouchCancelEvent) != supported_events_.end()) {
    RegisterTouchEvent();
  }
}

void ViewNode::RegisterClickEvent() {
  if (tap_recognizer_ == nullptr || GetView() != tap_view_.lock()) {
    tap_recognizer_ = TDF_MAKE_SHARED(tdfcore::TapGestureRecognizer);
    gestures_map_[kClickEvent] = tap_recognizer_;
    tap_view_ = GetView();
    tap_view_.lock()->AddGesture(tap_recognizer_);
  }

  if (supported_events_.find(hippy::kClickEvent) != supported_events_.end()) {
    tap_recognizer_->SetTap([WEAK_THIS]() {
      DEFINE_AND_CHECK_SELF(ViewNode)
      self->SendGestureDomEvent(kClickEvent, nullptr);
    });
  } else {
    tap_recognizer_->SetTap(nullptr);
  }

  if (supported_events_.find(hippy::kPressIn) != supported_events_.end()) {
    tap_recognizer_->SetTapDown([WEAK_THIS](const tdfcore::TapDetails& detail) {
      DEFINE_AND_CHECK_SELF(ViewNode)
      self->SendGestureDomEvent(kPressIn, nullptr);
    });
  } else {
    tap_recognizer_->SetTapDown(nullptr);
  }

  if (supported_events_.find(hippy::kPressOut) != supported_events_.end()) {
    tap_recognizer_->SetTapUp([WEAK_THIS](const tdfcore::TapDetails& detail) {
      DEFINE_AND_CHECK_SELF(ViewNode)
      self->SendGestureDomEvent(kPressOut, nullptr);
    });
    tap_recognizer_->SetTapCancel([WEAK_THIS]() {
      DEFINE_AND_CHECK_SELF(ViewNode)
      self->SendGestureDomEvent(kPressOut, nullptr);
    });
  } else {
    tap_recognizer_->SetTapUp(nullptr);
    tap_recognizer_->SetTapCancel(nullptr);
  }
}

void ViewNode::RegisterLongClickEvent() {
  if (long_press_recognizer_ == nullptr || GetView() != long_press_view_.lock()) {
    long_press_recognizer_ = TDF_MAKE_SHARED(tdfcore::LongPressGestureRecognizer);
    gestures_map_[kLongClickEvent] = long_press_recognizer_;
    long_press_view_ = GetView();
    long_press_view_.lock()->AddGesture(long_press_recognizer_);
  }

  long_press_recognizer_->on_long_press_end_ =
  [WEAK_THIS](const tdfcore::LongPressEndDetails &long_press_end_details) -> void {
    DEFINE_AND_CHECK_SELF(ViewNode)
    self->SendGestureDomEvent(kLongClickEvent, nullptr);
  };
}

void ViewNode::RegisterTouchEvent() {
  if (touch_recognizer_ == nullptr || GetView() != touch_view_.lock()) {
    touch_recognizer_ = TDF_MAKE_SHARED(TouchRecognizer);
    gestures_map_[kTouchStartEvent] = touch_recognizer_;
    touch_view_ = GetView();
    touch_view_.lock()->AddGesture(touch_recognizer_);
  }

  if (supported_events_.find(hippy::kTouchStartEvent) != supported_events_.end()) {
    touch_recognizer_->SetTouchStart([WEAK_THIS](const TouchDetails &details) {
      DEFINE_AND_CHECK_SELF(ViewNode)
      auto value = TouchRecognizer::TouchDetails2HippyValue(self->GetRenderInfo().id, "onTouchDown", details);
      self->SendGestureDomEvent(kTouchStartEvent, value);
    });
  } else {
    touch_recognizer_->SetTouchStart(nullptr);
  }

  if (supported_events_.find(hippy::kTouchMoveEvent) != supported_events_.end()) {
    touch_recognizer_->SetTouchMove([WEAK_THIS](const TouchDetails &details) {
      DEFINE_AND_CHECK_SELF(ViewNode)
      auto value = TouchRecognizer::TouchDetails2HippyValue(self->GetRenderInfo().id, "onTouchMove", details);
      self->SendGestureDomEvent(kTouchMoveEvent, value);
    });
  } else {
    touch_recognizer_->SetTouchMove(nullptr);
  }

  if (supported_events_.find(hippy::kTouchEndEvent) != supported_events_.end()) {
    touch_recognizer_->SetTouchEnd([WEAK_THIS](const TouchDetails &details) {
      DEFINE_AND_CHECK_SELF(ViewNode)
      auto value = TouchRecognizer::TouchDetails2HippyValue(self->GetRenderInfo().id, "onTouchEnd", details);
      self->SendGestureDomEvent(kTouchEndEvent, value);
    });
  } else {
    touch_recognizer_->SetTouchEnd(nullptr);
  }

  if (supported_events_.find(hippy::kTouchCancelEvent) != supported_events_.end()) {
    touch_recognizer_->SetTouchCancel([WEAK_THIS](const TouchDetails &details) {
      DEFINE_AND_CHECK_SELF(ViewNode)
      auto value = TouchRecognizer::TouchDetails2HippyValue(self->GetRenderInfo().id, "onTouchCancel", details);
      self->SendGestureDomEvent(kTouchCancelEvent, value);
    });
  } else {
    touch_recognizer_->SetTouchCancel(nullptr);
  }
}

void ViewNode::RemoveGestureEvent(std::string&& event_type) {
  if (gestures_map_.find(event_type) != gestures_map_.end()) {
    auto view = attached_view_.lock();
    if (view) {
      view->RemoveGesture(gestures_map_.find(event_type)->second);
    }
    gestures_map_.erase(event_type);
  }
}

void ViewNode::RemoveAllEventInfo() {
  RemoveGestureEvent(hippy::kClickEvent);
  RemoveGestureEvent(hippy::kLongClickEvent);
  RemoveGestureEvent(hippy::kTouchStartEvent);
  tap_recognizer_ = nullptr;
  long_press_recognizer_ = nullptr;
  touch_recognizer_ = nullptr;
}

void ViewNode::HandleInterceptEvent(const DomStyleMap& dom_style) {
  if (auto it = dom_style.find("onInterceptTouchEvent"); it != dom_style.cend() && it->second != nullptr) {
    intercept_touch_event_flag_ = it->second->ToBooleanChecked();
    if (intercept_touch_event_flag_) {
      auto children_views = GetView()->GetChildren();
      for (const auto& child_view : children_views) {
        child_view->SetHitTestBehavior(tdfcore::HitTestBehavior::kIgnore);
      }
    }
  }
  if (auto it = dom_style.find("onInterceptPullUpEvent"); it != dom_style.cend() && it->second != nullptr) {
    intercept_pullup_event_flag_ = it->second->ToBooleanChecked();
    // TDF not support
  }
}

void ViewNode::OnChildAdd(const std::shared_ptr<ViewNode>& child, int64_t index) {
  // inherited from parent
  if (!IsAttached()) {
    return;
  }
  child->Attach();
}

void ViewNode::OnChildRemove(const std::shared_ptr<ViewNode>& child) { child->Detach(); }

void ViewNode::SendUIDomEvent(std::string type, const std::shared_ptr<footstone::HippyValue>& value, bool can_capture,
                              bool can_bubble) {
  auto dom_node = dom_node_;
  std::transform(type.begin(), type.end(), type.begin(), ::tolower);
  auto event = std::make_shared<hippy::DomEvent>(type, dom_node, can_capture, can_bubble, value);
  std::vector<std::function<void()>> ops = {[dom_node, event] { dom_node->HandleEvent(event); }};
  GetRootNode()->GetDomManager()->PostTask(hippy::Scene(std::move(ops)));
}

void ViewNode::DoCallback(const std::string &function_name,
                          const uint32_t callback_id,
                          const std::shared_ptr<footstone::HippyValue> &value) {
  auto callback = dom_node_->GetCallback(function_name, callback_id);
  if (callback) {
    if(value) {
      callback(std::make_shared<DomArgument>(*value));
    } else {
      FOOTSTONE_LOG(ERROR) << "ViewNode::DoCallback value is null, function_name: " << function_name;
    }
  } else {
    FOOTSTONE_LOG(ERROR) << "ViewNode::DoCallback callback not found: " << function_name << ", " << callback_id;
  }
}

std::shared_ptr<RootViewNode> ViewNode::GetRootNode() const {
  FOOTSTONE_DCHECK(!root_node_.expired());
  return root_node_.lock();
}

void ViewNode::AddChildAt(const std::shared_ptr<ViewNode>& child, int32_t index) {
  FOOTSTONE_DCHECK(!child->GetParent());

  // index可能跳跃变大的情况说明：
  // Dom层批量create结点后，OptimizedRenderManager会依次处理结点，并展开一些子节点到同一层。
  // 如果在endBatch前有2个create，第1个展开结点，第2个插入结点，在处理展开结点的子结点时，会产生跳跃index，因为展开处理是依赖Dom树的。
  // Dom树是即时更新的，结点顺序是先前记录的。

  // check index
  auto checked_index = static_cast<uint32_t >(index);
  if(checked_index > children_.size()) {
    FOOTSTONE_LOG(INFO) << "ViewNode::AddChildAt, index > children.size, index:"
                        << checked_index << ", size:" << children_.size();
    checked_index = static_cast<uint32_t>(children_.size());
  }

  // update related filed
  children_.insert(children_.begin() + checked_index, child);
  child->SetParent(shared_from_this());
  // notify the ViewNode
  OnChildAdd(child, checked_index);
}

void ViewNode::RemoveChild(const std::shared_ptr<ViewNode>& child) {
  FOOTSTONE_DCHECK(child != nullptr);
  if (auto result = std::find(children_.begin(), children_.end(), child); result != children_.end()) {
    // notify the ViewNode to sync the tdfcore::View Tree
    OnChildRemove(child);
    // Update related field
    child->SetParent(nullptr);
    children_.erase(result);
  } else {
    FOOTSTONE_DCHECK(false);
  }
}

std::shared_ptr<ViewNode> ViewNode::RemoveChildAt(int32_t index) {
  FOOTSTONE_DCHECK(index >= 0 && static_cast<uint32_t>(index) < children_.size());
  auto child = children_[footstone::checked_numeric_cast<int32_t, unsigned long>(index)];
  FOOTSTONE_DCHECK(child != nullptr);
  OnChildRemove(child);
  child->SetParent(nullptr);
  children_.erase(children_.begin() + index);
  return child;
}

bool ViewNode::IsAttachViewMatch(const std::shared_ptr<ViewNode>& node, const std::shared_ptr<tdfcore::View>& view) {
  auto node_type = node->GetViewName();
  auto view_type = view->GetType();
  if ((node_type == kViewName && !(view_type == tdfcore::View::ClassType()))
      || (node_type == kTextViewName && !(view_type == tdfcore::TextView::ClassType()))
      || (node_type == kImageViewName && !(view_type == tdfcore::ImageView::ClassType()))
      || (node_type == kTextInputViewName && !(view_type == tdfcore::TextInputView::ClassType()))) {
    return false;
  }
  return true;
}

void ViewNode::Attach(const std::shared_ptr<tdfcore::View>& view) {
  FOOTSTONE_DCHECK(!is_attached_);
  FOOTSTONE_DCHECK(!parent_.expired());
  FOOTSTONE_DCHECK(parent_.lock()->IsAttached());

  is_attached_ = true;
  if (view) {
    view->SetId(render_info_.id);
    if (parent_.lock()->GetInterceptTouchEventFlag()) {
      view->SetHitTestBehavior(tdfcore::HitTestBehavior::kIgnore);
    }
    attached_view_ = view;
  } else {
    // this should be the only caller of CreateView.
    auto v = CreateView();
    v->SetId(render_info_.id);
    v->SetHitTestBehavior(tdfcore::HitTestBehavior::kTranslucent);
    if (parent_.lock()->GetInterceptTouchEventFlag()) {
      v->SetHitTestBehavior(tdfcore::HitTestBehavior::kIgnore);
    }
    // check index
    auto checked_index = static_cast<uint32_t >(GetCorrectedIndex());
    auto view_count = parent_.lock()->GetView()->GetChildren().size();
    if(checked_index > view_count) {
      FOOTSTONE_LOG(INFO) << "ViewNode::Attach, index > view_count, index:"
                          << checked_index << ", size:" << view_count;
      checked_index = static_cast<uint32_t>(view_count);
    }
    // must add to parent_, otherwise the view will be freed immediately.
    parent_.lock()->GetView()->AddView(v, checked_index);
    attached_view_ = v;
  }

  // Sync style/listener/etc
  HandleStyleUpdate(GenerateStyleInfo(dom_node_));
  HandleLayoutUpdate(dom_node_->GetRenderLayoutResult());
  HandleEventInfoUpdate();
  // recursively attach the sub ViewNode tree(sycn the tdfcore::View Tree)
  uint32_t child_index = 0;
  for (const auto& child : children_) {
    std::shared_ptr<tdfcore::View> child_view = nullptr;
    if (child_index < GetView()->GetChildren().size()) {
      child_view = GetView()->GetChildren()[child_index];
      // must check match
      if (!IsAttachViewMatch(child, child_view)) {
        GetView()->RemoveView(child_view);
        child_view = nullptr;
      }
    }
    child->Attach(child_view);
    ++child_index;
  }
  // must delete not matched subviews
  while (GetView()->GetChildren().size() > children_.size()) {
    GetView()->RemoveView(GetView()->GetChildren().back());
  }

  OnAttach();  // notify the ViewNode
}

void ViewNode::Detach(bool sync_to_view_tree) {
  if (!IsAttached()) {
    return;
  }
  FOOTSTONE_DCHECK(!parent_.expired());
  RemoveAllEventInfo();
  // recursively Detach the children at first
  for (const auto& child : children_) {
    child->Detach(sync_to_view_tree);
  }
  OnDetach();

  if (sync_to_view_tree) {
    parent_.lock()->GetView()->RemoveView(GetView());
  }
  attached_view_.reset();
  is_attached_ = false;
}

void ViewNode::CallFunction(const std::string &name, const DomArgument &param, const uint32_t call_back_id) {
  if (name == "measureInWindow") {
    auto frame = GetView()->GetFrame();
    FOOTSTONE_LOG(INFO) << "ViewNode::CallFunction measureInWindow result: "
      << frame.X() << "," << frame.Y() << "," << frame.Width() << "," << frame.Height();

    DomValueObjectType obj;
    obj["x"] = frame.X();
    obj["y"] = frame.Y();
    obj["width"] = frame.Width();
    obj["height"] = frame.Height();
    DoCallback(name, call_back_id, std::make_shared<footstone::HippyValue>(obj));
  }
}

}  // namespace tdf
}  // namespace render
}  // namespace hippy
