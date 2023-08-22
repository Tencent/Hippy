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
#pragma clang diagnostic ignored "-Wdeprecated-copy-with-dtor"
#pragma clang diagnostic ignored "-Wdeprecated-copy"
#include "tdfui/view/view.h"
#include "core/support/gesture/recognizer/tap_gesture_recognizer.h"
#include "core/support/gesture/recognizer/long_press_gesture_recognizer.h"
#pragma clang diagnostic pop
#include "core/common/listener.h"
#include "dom/dom_argument.h"
#include "dom/dom_node.h"
#include "footstone/hippy_value.h"
#include "footstone/logging.h"

#define TDF_RENDER_CHECK_ATTACH \
  if (!IsAttached()) {          \
    return;                     \
  }

namespace hippy {
inline namespace render {
inline namespace tdf {
inline namespace view {
constexpr const char kView[] = "View";
constexpr const char kAccessibilityLabel[] = "accessibilityLabel";                          // String
constexpr const char kAttachedtowindow[] = "attachedtowindow";                              // boolean
constexpr const char kBackgroundColor[] = "backgroundColor";                                // int
constexpr const char kBackgroundImage[] = "backgroundImage";                                // String
constexpr const char kBackgroundPositionX[] = "backgroundPositionX";                        // int
constexpr const char kBackgroundPositionY[] = "backgroundPositionY";                        // int
constexpr const char kBackgroundSize[] = "backgroundSize";                                  // String
constexpr const char kBorderBottomColor[] = "borderBottomColor";                            // int
constexpr const char kBorderBottomLeftRadius[] = "borderBottomLeftRadius";                  // float
constexpr const char kBorderBottomRightRadius[] = "borderBottomRightRadius";                // float
constexpr const char kBorderBottomWidth[] = "borderBottomWidth";                            // float
constexpr const char kBorderColor[] = "borderColor";                                        // int
constexpr const char kBorderLeftColor[] = "borderLeftColor";                                // int
constexpr const char kBorderLeftWidth[] = "borderLeftWidth";                                // float
constexpr const char kBorderRadius[] = "borderRadius";                                      // float
constexpr const char kBorderRightColor[] = "borderRightColor";                              // int
constexpr const char kBorderRightWidth[] = "borderRightWidth";                              // float
constexpr const char kBorderTopColor[] = "borderTopColor";                                  // int
constexpr const char kBorderTopLeftRadius[] = "borderTopLeftRadius";                        // float
constexpr const char kBorderTopRightRadius[] = "borderTopRightRadius";                      // float
constexpr const char kBorderTopWidth[] = "borderTopWidth";                                  // float
constexpr const char kBorderWidth[] = "borderWidth";                                        // float
constexpr const char kClick[] = "click";                                                    // boolean
constexpr const char kCustomProp[] = "customProp";                                          // Object
constexpr const char kDetachedfromwindow[] = "detachedfromwindow";                          // boolean
constexpr const char kFocusable[] = "focusable";                                            // boolean
constexpr const char kInterceptpullupevent[] = "interceptpullupevent";                      // boolean
constexpr const char kIntercepttouchevent[] = "intercepttouchevent";                        // boolean
constexpr const char kLinearGradient[] = "linearGradient";                                  // HippyMap
constexpr const char kLongclick[] = "longclick";                                            // boolean
constexpr const char kNativeBackgroundAndroid[] = "nativeBackgroundAndroid";                // Map
constexpr const char kNextFocusDownId[] = "nextFocusDownId";                                // int
constexpr const char kNextFocusLeftId[] = "nextFocusLeftId";                                // int
constexpr const char kNextFocusRightId[] = "nextFocusRightId";                              // int
constexpr const char kNextFocusUpId[] = "nextFocusUpId";                                    // int
constexpr const char kOpacity[] = "opacity";                                                // float
constexpr const char kOverflow[] = "overflow";                                              // String
constexpr const char kPressin[] = "pressin";                                                // boolean
constexpr const char kPressout[] = "pressout";                                              // boolean
constexpr const char kRenderToHardwareTextureAndroid[] = "renderToHardwareTextureAndroid";  // boolean
constexpr const char kRequestFocus[] = "requestFocus";                                      // boolean
constexpr const char kShadowColor[] = "shadowColor";                                        // int
constexpr const char kShadowOffset[] = "shadowOffset";                                      // HippyMap
constexpr const char kShadowOffsetX[] = "shadowOffsetX";                                    // float
constexpr const char kShadowOffsetY[] = "shadowOffsetY";                                    // float
constexpr const char kShadowOpacity[] = "shadowOpacity";                                    // float
constexpr const char kShadowRadius[] = "shadowRadius";                                      // float
constexpr const char kShadowSpread[] = "shadowSpread";                                      // float
constexpr const char kTouchcancel[] = "touchcancel";                                        // boolean
constexpr const char kTouchend[] = "touchend";                                              // boolean
constexpr const char kTouchmove[] = "touchmove";                                            // boolean
constexpr const char kTouchstart[] = "touchstart";                                          // boolean
constexpr const char kTransform[] = "transform";                                            // ArrayList
constexpr const char kZIndex[] = "zIndex";
constexpr const char kMatrix[] = "matrix";
constexpr const char kPerspective[] = "perspective";
constexpr const char kRotateX[] = "rotateX";
constexpr const char kRotateY[] = "rotateY";
constexpr const char kRotateZ[] = "rotateZ";
constexpr const char kRotate[] = "rotate";
constexpr const char kScale[] = "scale";
constexpr const char kScaleX[] = "scaleX";
constexpr const char kScaleY[] = "scaleY";
constexpr const char kTranslate[] = "translate";
constexpr const char kTranslateX[] = "translateX";
constexpr const char kTranslateY[] = "translateY";
constexpr const char kSkewX[] = "skewX";
constexpr const char kSkewY[] = "skewY";
}  // namespace view

inline namespace waterfallview {
constexpr const char kWaterfallView[] = "WaterfallView";
constexpr const char kBannerViewMatch[] = "bannerViewMatch";                  // boolean
constexpr const char kColumnSpacing[] = "columnSpacing";                      // int
constexpr const char kContainBannerView[] = "containBannerView";              // boolean
constexpr const char kContentInset[] = "contentInset";                        // HippyMap
constexpr const char kEnableExposureReport[] = "enableExposureReport";        // boolean
constexpr const char kEnableLoadingFooter[] = "enableLoadingFooter";          // boolean
constexpr const char kEnableOnScrollForReport[] = "enableOnScrollForReport";  // boolean
constexpr const char kEnableRefresh[] = "enableRefresh";                      // boolean
constexpr const char kInterItemSpacing[] = "interItemSpacing";                // int
constexpr const char kNumberOfColumns[] = "numberOfColumns";                  // int
constexpr const char kPaddingStartZero[] = "paddingStartZero";                // boolean
constexpr const char kPreloadItemNumber[] = "preloadItemNumber";              // int
constexpr const char kRefreshColor[] = "refreshColor";                        // int
constexpr const char kRefreshColors[] = "refreshColors";                      // HippyArray
}  // namespace waterfallview

inline namespace defaultvalue {
constexpr const float kDefaultFontSize = 14.0;
constexpr const float kDefaultLineHeight = 16.0;
constexpr const tdfcore::Color kDefaultTextColor = tdfcore::Color::Black();
}  // namespace defaultvalue

class ViewNode;

class RootViewNode;

using tdfcore::ViewContext;

/*
 * Binding a tdfcore::View with  a hippy::DomNode.
 */
class ViewNode : public tdfcore::Object, public std::enable_shared_from_this<ViewNode> {
 public:
  using DomValueObjectType = footstone::HippyValue::HippyValueObjectType;
  using DomArgument = hippy::dom::DomArgument;
  using DomStyleMap = std::unordered_map<std::string, std::shared_ptr<footstone::HippyValue>>;
  using DomDeleteProps = std::vector<std::string>;
  using RenderInfo = hippy::dom::DomNode::RenderInfo;
  using node_creator = std::function<std::shared_ptr<ViewNode>(const std::shared_ptr<hippy::dom::DomNode>&)>;
  using Point = tdfcore::TPoint;

  ViewNode(const std::shared_ptr<hippy::dom::DomNode> &dom_node, const RenderInfo info,
           std::shared_ptr<tdfcore::View> view = nullptr);

  virtual ~ViewNode() = default;

  static node_creator GetViewNodeCreator();

  template <class T>
  std::shared_ptr<T> GetView() {
    if (auto view = attached_view_.lock(); view != nullptr) {
      return std::static_pointer_cast<T>(view);
    } else {
      FOOTSTONE_DCHECK(false);
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
  void OnUpdate(const std::shared_ptr<hippy::dom::DomNode> &dom_node);

  /**
   * @brief Be called when a related DomNode is Deleted.
   */
  virtual void OnDelete();

  virtual void HandleLayoutUpdate(hippy::LayoutResult layout_result);

  virtual void OnAddEventListener(uint32_t id, const std::string &name);

  virtual void OnRemoveEventListener(uint32_t id, const std::string &name);

  virtual std::string GetViewName() const { return "View"; }

  virtual void CallFunction(const std::string &name, const DomArgument &param, const uint32_t call_back_id);

  void SetRootNode(std::weak_ptr<RootViewNode> root_node) { root_node_ = root_node; }

  static tdfcore::Color ParseToColor(const std::shared_ptr<footstone::HippyValue> &value);

  std::shared_ptr<ViewNode> GetSharedPtr() { return shared_from_this(); }

  uint64_t AddLayoutUpdateListener(const std::function<void(tdfcore::TRect)> &listener) {
    return layout_listener_.Add(listener);
  }

  void RemoveLayoutUpdateListener(uint64_t id) { layout_listener_.Remove(id); }

  const RenderInfo &GetRenderInfo() const { return render_info_; }

  const std::shared_ptr<hippy::DomNode> GetDomNode() const { return dom_node_; }

  std::vector<std::shared_ptr<ViewNode>> GetChildren() const { return children_; }

  /**
   * @brief attach current ViewNode to a tdfcore::View
   *        if view != nullptr(ListViewItem for example),then reuse it.Otherwise create a new tdfcore::View
   */
  void Attach(const std::shared_ptr<ViewContext> &context, const std::shared_ptr<tdfcore::View> &view = nullptr);

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

  bool GetInterceptTouchEventFlag() { return intercept_touch_event_flag_; }
  bool GetInterceptPullUpEventFlag() { return intercept_pullup_event_flag_; }

  void SetUseViewLayoutOrigin(bool flag) { use_view_layout_origin_ = flag; }

  void DoCallback(const std::string &function_name,
                  const uint32_t callback_id,
                  const std::shared_ptr<footstone::HippyValue> &value);

 protected:
  virtual bool isRoot() { return false; }

  /**
   * @brief notify after the attach action
   */
  virtual void OnAttach() {}

  /**
   * @brief notify before the detach action
   */
  virtual void OnDetach() {}

  int32_t GetCorrectedIndex() const { return corrected_index_; }

  std::shared_ptr<RootViewNode> GetRootNode() const;

  virtual void HandleStyleUpdate(const DomStyleMap &dom_style,
                                 const DomDeleteProps& dom_delete_props = DomDeleteProps());

  /**
   * @brief create the related tdfcore::View when attach if needed.
   */
  virtual std::shared_ptr<tdfcore::View> CreateView(const std::shared_ptr<ViewContext> &context);

  void SendGestureDomEvent(std::string type, const std::shared_ptr<footstone::HippyValue> &value = nullptr) {
    SendUIDomEvent(type, value, true, true);
  }

  void SendUIDomEvent(std::string type, const std::shared_ptr<footstone::HippyValue> &value = nullptr,
                      bool can_capture = false, bool can_bubble = false);

  /**
   * @brief Be called in ViewNode::OnCreate(mount in the ViewNode Tree immediately after create)
   */
  void AddChildAt(const std::shared_ptr<ViewNode> &dom_node, int32_t index);

  void AddChildAtImpl(const std::shared_ptr<ViewNode>& child, int32_t index);

  /**
   * @brief Be called in ViewNode::OnDelete(unmount in the ViewNode Tree immediately after create)
   */
  void RemoveChild(const std::shared_ptr<ViewNode> &child);

  /**
   * @brief Be called in ViewNode::OnDelete(unmount in the ViewNode Tree immediately after create)
   *        Not work for now.Because sometimes OnCreate is before OnDelete,which make index conflict.
   */
  std::shared_ptr<ViewNode> RemoveChildAt(int32_t index);

  /**
   * @brief notify after the AddChild action(sync the tdfcore::View Tree)
   */
  virtual void OnChildAdd(const std::shared_ptr<ViewNode> &child, int64_t index);

  /**
   * @brief notify before the RemoveChild action(sync the tdfcore::View Tree)
   */
  virtual void OnChildRemove(const std::shared_ptr<ViewNode> &child);

  void SetParent(std::shared_ptr<ViewNode> parent) { parent_ = parent; }

  inline std::shared_ptr<ViewNode> GetParent() { return parent_.lock(); }

  uint32_t GetChildCount() const { return footstone::checked_numeric_cast<size_t, uint32_t>(children_.size()); }

  /**
   * @brief merge the style info in DomNode
   */
  static DomStyleMap GenerateStyleInfo(const std::shared_ptr<hippy::DomNode>& dom_node);

  std::set<std::string> GetSupportedEvents() { return supported_events_; }

  virtual void HandleEventInfoUpdate();

  void SetBackgroundImage(const std::string &img_url);

  tdfcore::TM44 GenerateAnimationTransform(const DomStyleMap &dom_style, std::shared_ptr<tdfcore::View> view);

  float GetDensity();

  /**
   * @brief Save DomNode of this ViewNode, can not find DomNode in dom module in reverse.
   */
  const std::shared_ptr<hippy::dom::DomNode> dom_node_;

  const RenderInfo render_info_;

  // set as protected for root node
  bool is_attached_ = false;
  std::weak_ptr<tdfcore::View> attached_view_;

  /**
   * @brief Support backgroundImage for every ViewNode. Has or not for current node.
   */
  bool has_background_image_ = false;

  /**
   * @brief Support backgroundImage for every ViewNode. If node has backgroundImage,
   *        insert a image node between current node and its children nodes.
   *
   *           ViewNode
   *               |
   *        ImageViewNode (For this ViewNode, is_background_image_node_ == true)
   *            /        \
   *       ChildNode1  ChildNode2
   */
  bool is_background_image_node_ = false;

  /**
   * @brief Support backgroundImage for every ViewNode. Record layout result when node is background image node.
   */
  hippy::LayoutResult background_image_layout_result_;

 private:
  bool IsAttachViewMatch(const std::shared_ptr<ViewNode>& node, const std::shared_ptr<tdfcore::View>& view);
  void RegisterClickEvent();
  void RegisterLongClickEvent();
  void RegisterTouchEvent();

  void RemoveGestureEvent(std::string &&event_type);
  void RemoveAllEventInfo();

  void HandleInterceptEvent(const DomStyleMap& dom_style);

  static std::shared_ptr<footstone::HippyValue> PointerDataList2HippyValue(
      uint32_t id, const char *name, const tdfcore::PointerDataList &data_list);

  /**
   * @brief DomNode's RenderInfo.index is not always the related View's index, it may need to be corrected.
   */
  int32_t corrected_index_;

  std::weak_ptr<RootViewNode> root_node_;

  tdfcore::Listener<tdfcore::TRect> layout_listener_;

  std::weak_ptr<ViewNode> parent_;
  std::vector<std::shared_ptr<ViewNode>> children_;

  std::set<std::string> supported_events_;
  std::unordered_map<std::string, std::shared_ptr<tdfcore::GestureRecognizer>> gestures_map_;

  std::shared_ptr<tdfcore::TapGestureRecognizer> tap_recognizer_;
  std::shared_ptr<tdfcore::LongPressGestureRecognizer> long_press_recognizer_;
  std::shared_ptr<tdfcore::PointerEventListener> touch_event_;
  std::weak_ptr<tdfcore::View> tap_view_;
  std::weak_ptr<tdfcore::View> long_press_view_;
  std::weak_ptr<tdfcore::View> touch_view_;

  bool intercept_touch_event_flag_ = false;
  bool intercept_pullup_event_flag_ = false;

  bool use_view_layout_origin_ = false;
};

}  // namespace tdf
}  // namespace render
}  // namespace hippy
