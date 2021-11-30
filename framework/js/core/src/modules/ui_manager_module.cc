/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#include "core/modules/ui_manager_module.h"

#include <set>
#include <tuple>

#include "core/modules/module_register.h"
#include "core/base/string_view_utils.h"
#include "dom/node_props.h"
#include "dom/dom_node.h"

REGISTER_MODULE(UIManagerModule, CreateNode)
REGISTER_MODULE(UIManagerModule, UpdateNode)
REGISTER_MODULE(UIManagerModule, DeleteNode)
REGISTER_MODULE(UIManagerModule, StartBatch)
REGISTER_MODULE(UIManagerModule, EndBatch)
REGISTER_MODULE(UIManagerModule, CallUIFunction)

constexpr char kFuncParamKey[] = "param";
constexpr char kModalViewName[] = "modal";
constexpr char kTextViewName[] = "text";
constexpr char kImageViewName[] = "image";

const char *kNodePropertyId = "id";
const char *kNodePropertyPid = "pId";
const char *kNodePropertyIndex = "index";
const char *kNodePropertyViewName = "name";
const char *kNodePropertyTagName = "tagName";
const char *kNodePropertyProps = "props";
const char *kNodePropertyStyle = "style";
const char *kNodePropertyOnClick = "onClick";
const char *kStylePropertyBackgroundColor = "backgroundColor";
const char *kStylePropertyWidth = "width";
const char *kStylePropertyHeight = "height";
const char *kStylePropertyMargin = "margin";
const char *kStylePropertyDisplay = "display";

const int32_t kInvalidValue = -1;

using DomValue = tdf::base::DomValue;
using unicode_string_view = tdf::base::unicode_string_view;

using Ctx = hippy::napi::Ctx;
using CtxValue = hippy::napi::CtxValue;
using CallbackInfo = hippy::napi::CallbackInfo;
using DomManager = hippy::dom::DomManager;
using DomNode = hippy::dom::DomNode;
using RegisterFunction = hippy::base::RegisterFunction;
using RegisterMap = hippy::base::RegisterMap;
using StringViewUtils = hippy::base::StringViewUtils;

UIManagerModule::UIManagerModule() {}

UIManagerModule::~UIManagerModule() {}

std::tuple<bool, std::string, int32_t> GetNodeId(std::shared_ptr<Ctx> context,
                                                 std::shared_ptr<CtxValue> node) {
  // parse id
  std::shared_ptr<CtxValue> id_value = context->GetProperty(node, hippy::kNodeId);
  if (!id_value) {
    return std::make_tuple(false, "Get property id failed", kInvalidValue);
  }
  int32_t id;
  bool flag = context->GetValueNumber(id_value, &id);
  if (!flag) {
    return std::make_tuple(false, "Get id value failed", kInvalidValue);
  }
  return std::make_tuple(true, "", id);
}

std::tuple<bool, std::string, int32_t> GetNodePid(std::shared_ptr<Ctx> context,
                                                  std::shared_ptr<CtxValue> node) {
  // parse pid
  std::shared_ptr<CtxValue> pid_value = context->GetProperty(node, kNodePropertyPid);
  if (!pid_value) {
    return std::make_tuple(false, "Get property pid failed", kInvalidValue);
  }
  int32_t pid;
  bool flag = context->GetValueNumber(pid_value, &pid);
  if (!flag) {
    return std::make_tuple(false, "Get pid value failed", kInvalidValue);
  }
  return std::make_tuple(true, "", pid);
}

std::tuple<bool, std::string, int32_t> GetNodeIndex(std::shared_ptr<Ctx> context,
                                                    std::shared_ptr<CtxValue> node) {
  // parse index
  std::shared_ptr<CtxValue> index_value = context->GetProperty(node, kNodePropertyIndex);
  if (!index_value) {
    return std::make_tuple(false, "Get property index failed", kInvalidValue);
  }
  int32_t index;
  bool flag = context->GetValueNumber(index_value, &index);
  if (!flag) {
    return std::make_tuple(false, "Get index value failed", kInvalidValue);
  }
  return std::make_tuple(true, "", index);
}

std::tuple<bool, std::string, unicode_string_view> GetNodeViewName(std::shared_ptr<Ctx> context,
                                                                   std::shared_ptr<CtxValue> node) {
  // parse view_name
  std::shared_ptr<CtxValue> view_name_value = context->GetProperty(node, kNodePropertyViewName);
  if (!view_name_value) {
    return std::make_tuple(false, "Get property view name failed", "");
  }
  unicode_string_view view_name;
  bool flag = context->GetValueString(view_name_value, &view_name);
  if (!flag) {
    return std::make_tuple(false, "Get view name value failed", "");
  }
  return std::make_tuple(true, "", std::move(view_name));
}

std::tuple<bool, std::string, unicode_string_view> GetNodeTagName(std::shared_ptr<Ctx> context,
                                                                  std::shared_ptr<CtxValue> node) {
  // parse tag_name
  std::shared_ptr<CtxValue> tag_name_value = context->GetProperty(node, kNodePropertyViewName);
  if (!tag_name_value) {
    return std::make_tuple(false, "Get property tag name failed", "");
  }
  unicode_string_view tag_name;
  bool flag = context->GetValueString(tag_name_value, &tag_name);
  if (!flag) {
    return std::make_tuple(false, "Get tag name value failed", "");
  }
  return std::make_tuple(true, "", std::move(tag_name));
}

std::tuple<bool, std::string, std::unordered_map<std::string, std::shared_ptr<DomValue>>>
GetNodeStyle(std::shared_ptr<Ctx> context, std::unordered_map<std::string, DomValue> &props) {
  std::unordered_map<std::string, std::shared_ptr<DomValue>> ret;
  // parse style
  auto style_it = props.find(kNodePropertyStyle);
  if (style_it != props.end()) {
    if (style_it->second.IsObject()) {
      std::unordered_map<std::string, DomValue> style_obj = style_it->second.ToObject();
      for (auto p : style_obj) {
        ret[p.first] = std::make_shared<DomValue>(std::move(p.second));
      }
    }
    props.erase(style_it);
    return std::make_tuple(true, "", std::move(ret));
  }
  return std::make_tuple(false, "props does not contain style", std::move(ret));
}

std::tuple<bool, std::string, bool>
HandleFunctionListener(std::shared_ptr<Ctx> context, const std::string &name,
                       std::unordered_map<std::string, DomValue> &props) {
  // handle function listener
  bool has_function = false;
  auto it = props.find(name);
  if (it != props.end()) {
    if (it->second.IsBoolean()) {
      has_function = it->second.ToBoolean();
    } else {
      return std::make_tuple(false, name + " type error", has_function);
    }
    props.erase(it);
  }
  return std::make_tuple(true, "", has_function);
}

std::tuple<bool, std::string,
           std::set<std::string>,
           std::unordered_map<std::string, std::shared_ptr<DomValue>>>
GetNodeExtValue(std::shared_ptr<Ctx> context, std::unordered_map<std::string, DomValue> &props) {
  std::unordered_map<std::string, std::shared_ptr<DomValue>> dom_ext_map;
  std::set<std::string> func_set;
  // handle click listener
  auto on_click_tuple = HandleFunctionListener(context, hippy::kOnClick, props);
  if (!std::get<0>(on_click_tuple)) {
    return std::make_tuple(false, std::get<1>(on_click_tuple),
                           std::move(func_set), std::move(dom_ext_map));
  }
  func_set.insert(hippy::kOnClick);

  // handle layout listener
  auto on_layout_tuple = HandleFunctionListener(context, hippy::kOnLayout, props);
  if (!std::get<0>(on_layout_tuple)) {
    return std::make_tuple(false, std::get<1>(on_layout_tuple),
                           std::move(func_set), std::move(dom_ext_map));
  }
  func_set.insert(hippy::kOnLayout);

  // handle long click listener
  auto on_long_click_tuple = HandleFunctionListener(context, hippy::kOnLongClick, props);
  if (!std::get<0>(on_long_click_tuple)) {
    return std::make_tuple(false, std::get<1>(on_long_click_tuple),
                           std::move(func_set), std::move(dom_ext_map));
  }
  func_set.insert(hippy::kOnLongClick);

  // handle touch start listener
  auto on_touch_start_tuple = HandleFunctionListener(context, hippy::kOnTouchStart, props);
  if (!std::get<0>(on_touch_start_tuple)) {
    return std::make_tuple(false, std::get<1>(on_touch_start_tuple),
                           std::move(func_set), std::move(dom_ext_map));
  }
  func_set.insert(hippy::kOnTouchStart);

  // handle touch move listener
  auto on_touch_move_tuple = HandleFunctionListener(context, hippy::kOnTouchMove, props);
  if (!std::get<0>(on_touch_move_tuple)) {
    return std::make_tuple(false, std::get<1>(on_touch_move_tuple),
                           std::move(func_set), std::move(dom_ext_map));
  }
  func_set.insert(hippy::kOnTouchMove);

  // handle touch end listener
  auto on_touch_end_tuple = HandleFunctionListener(context, hippy::kOnTouchEnd, props);
  if (!std::get<0>(on_touch_end_tuple)) {
    return std::make_tuple(false, std::get<1>(on_touch_end_tuple),
                           std::move(func_set), std::move(dom_ext_map));
  }
  func_set.insert(hippy::kOnTouchEnd);

  // handle touch cancel listener
  auto on_touch_cancel_tuple = HandleFunctionListener(context, hippy::kOnTouchCancel, props);
  if (!std::get<0>(on_touch_cancel_tuple)) {
    return std::make_tuple(false, std::get<1>(on_touch_cancel_tuple),
                           std::move(func_set), std::move(dom_ext_map));
  }
  func_set.insert(hippy::kOnTouchCancel);

  // handle attached to window listener
  auto on_attached_to_window_tuple = HandleFunctionListener(context, hippy::kOnAttachedToWindow,
                                                            props);
  if (!std::get<0>(on_attached_to_window_tuple)) {
    return std::make_tuple(false, std::get<1>(on_attached_to_window_tuple),
                           std::move(func_set), std::move(dom_ext_map));
  }
  func_set.insert(hippy::kOnAttachedToWindow);

  // handle attached from window listener
  auto on_attached_from_window_tuple = HandleFunctionListener(context, hippy::kOnDetachedFromWindow,
                                                              props);
  if (!std::get<0>(on_attached_from_window_tuple)) {
    return std::make_tuple(false, std::get<1>(on_attached_from_window_tuple),
                           std::move(func_set), std::move(dom_ext_map));
  }
  func_set.insert(hippy::kOnDetachedFromWindow);

  // handle show listener
  auto on_show_tuple = HandleFunctionListener(context, hippy::kOnShow, props);
  if (!std::get<0>(on_show_tuple)) {
    return std::make_tuple(false, std::get<1>(on_show_tuple),
                           std::move(func_set), std::move(dom_ext_map));
  }
  func_set.insert(hippy::kOnShow);

  // handle dismiss listener
  auto on_dismiss_tuple = HandleFunctionListener(context, hippy::kOnDismiss, props);
  if (!std::get<0>(on_dismiss_tuple)) {
    return std::make_tuple(false, std::get<1>(on_dismiss_tuple),
                           std::move(func_set), std::move(dom_ext_map));
  }
  func_set.insert(hippy::kOnDismiss);

  // parse ext value
  for (auto p : props) {
    dom_ext_map[p.first] = std::make_shared<DomValue>(std::move(p.second));
  }
  return std::make_tuple(true, "", std::move(func_set), std::move(dom_ext_map));
}

std::tuple<bool, std::string, std::unordered_map<std::string, std::shared_ptr<DomValue>>,
           std::set<std::string>,
           std::unordered_map<std::string, std::shared_ptr<DomValue>>> GetNodeProps(
    std::shared_ptr<Ctx> context, std::shared_ptr<CtxValue> node) {
  std::unordered_map<std::string, std::shared_ptr<DomValue>> style_map;
  std::unordered_map<std::string, std::shared_ptr<DomValue>> dom_ext_map;
  std::set<std::string> func_set;
  std::shared_ptr<CtxValue> props = context->GetProperty(node, kNodePropertyProps);
  if (!props) {
    return std::make_tuple(false, "node does not contain props",
                           std::move(style_map),
                           std::move(func_set),
                           std::move(dom_ext_map));
  }
  std::shared_ptr<DomValue> props_obj = context->ToDomValue(props);
  if (!props_obj) {
    return std::make_tuple(false, "to dom value failed",
                           std::move(style_map),
                           std::move(func_set),
                           std::move(dom_ext_map));
  }

  if (!props_obj->IsObject()) {
    return std::make_tuple(false, "props_obj type error",
                           std::move(style_map),
                           std::move(func_set),
                           std::move(dom_ext_map));
  }

  std::unordered_map<std::string, DomValue> props_map = props_obj->ToObject();
  auto style_tuple = GetNodeStyle(context, props_map);
  if (!std::get<2>(style_tuple).empty()) {
    style_map = std::move(std::get<2>(style_tuple));
  }
  auto ext_tuple = GetNodeExtValue(context, props_map);
  if (std::get<0>(ext_tuple)) {
    if (!std::get<2>(ext_tuple).empty()) {
      func_set = std::move(std::get<2>(ext_tuple));
    }
    if (!std::get<3>(ext_tuple).empty()) {
      dom_ext_map = std::move(std::get<3>(ext_tuple));
    }
  }
  return std::make_tuple(true, "", std::move(style_map), std::move(func_set),
                         std::move(dom_ext_map));
}

void BindClickEvent(std::shared_ptr<Ctx> context, const std::string &name,
                    std::shared_ptr<DomNode> dom_node) {
  std::shared_ptr<CtxValue>
      func = context->GetGlobalObjVar(unicode_string_view("__" + name));
  if (context->IsFunction(func)) {
    std::weak_ptr<Ctx> weak_context = context;
    std::weak_ptr<CtxValue> weak_func = func;
    int32_t id = dom_node->GetId();
    dom_node->AddClickEventListener([weak_context, weak_func, id]() {
      auto context = weak_context.lock();
      if (!context) {
        return;
      }
      auto func = weak_func.lock();
      if (!func) {
        return;
      }
      std::string info_json = "{ id: " + std::to_string(id) + " }";
      const std::shared_ptr<CtxValue> argus[] = {
          context->CreateObject(unicode_string_view(info_json))
      };
      context->CallFunction(func, 1, argus);
    });
  }
}

void BindTouchEvent(std::shared_ptr<Ctx> context, const std::string &name,
                    std::shared_ptr<DomNode> dom_node) {
  std::shared_ptr<CtxValue>
      func = context->GetGlobalObjVar(unicode_string_view("__" + name));
  if (context->IsFunction(func)) {
    std::weak_ptr<Ctx> weak_context = context;
    std::weak_ptr<CtxValue> weak_func = func;
    hippy::TouchEvent event;
    if (name == hippy::kOnTouchStart) {
      event = hippy::TouchEvent::Start;
    } else if (name == hippy::kOnTouchMove) {
      event = hippy::TouchEvent::Move;
    } else if (name == hippy::kOnTouchEnd) {
      event = hippy::TouchEvent::End;
    } else if (name == hippy::kOnTouchCancel) {
      event = hippy::TouchEvent::Cancel;
    } else {
      TDF_BASE_NOTREACHED();
    }
    int32_t id = dom_node->GetId();
    dom_node->AddTouchEventListener(event, [weak_context, weak_func, id]
        (hippy::TouchEvent event, hippy::TouchEventInfo info) {
      auto context = weak_context.lock();
      if (!context) {
        return;
      }
      auto func = weak_func.lock();
      if (!func) {
        return;
      }
      std::string info_json =
          "{ id: " + std::to_string(id) + ", page_x: " + std::to_string(info.x) + ", page_y:"
              + std::to_string(info.y) + " }";
      const std::shared_ptr<CtxValue> argus[] = {
          context->CreateObject(unicode_string_view(info_json))
      };
      context->CallFunction(func, 1, argus);
    });
  }
}

void SetAttachListener(std::shared_ptr<Ctx> context, const std::string &name,
                       std::shared_ptr<DomNode> dom_node) {

  std::shared_ptr<CtxValue> func = context->GetGlobalObjVar(unicode_string_view("__" + name));
  if (context->IsFunction(func)) {
    std::weak_ptr<Ctx> weak_context = context;
    std::weak_ptr<CtxValue> weak_func = func;
    int32_t id = dom_node->GetId();
    dom_node->SetOnAttachChangedListener([weak_context, weak_func, name, id](bool is_attach) {
      auto context = weak_context.lock();
      if (!context) {
        return;
      }
      auto func = weak_func.lock();
      if (!func) {
        return;
      }
      std::string info_json = "{ id: " + std::to_string(id) + " }";
      const std::shared_ptr<CtxValue> argus[] = {
          context->CreateObject(unicode_string_view(info_json))
      };
      if (is_attach && name == hippy::kOnAttachedToWindow) {
        context->CallFunction(func, 1, argus);
      } else if (!is_attach && name == hippy::kOnDetachedFromWindow) {
        context->CallFunction(func, 1, argus);
      } else {
        TDF_BASE_NOTREACHED();
      }
    });
  }
}

void BindShowEvent(std::shared_ptr<Ctx> context, const std::string &name,
                   std::shared_ptr<DomNode> dom_node) {
  std::shared_ptr<CtxValue>
      func = context->GetGlobalObjVar(unicode_string_view("__" + name));
  if (context->IsFunction(func)) {
    std::weak_ptr<Ctx> weak_context = context;
    std::weak_ptr<CtxValue> weak_func = func;
    hippy::ShowEvent event;
    if (name == hippy::kOnShow) {
      event = hippy::ShowEvent::Show;
    } else if (name == hippy::kOnDismiss) {
      event = hippy::ShowEvent::Dismiss;
    } else {
      TDF_BASE_NOTREACHED();
      return;
    }
    int32_t id = dom_node->GetId();
    dom_node->AddShowEventListener(event, [weak_context, weak_func, id](const std::any &) {
      auto context = weak_context.lock();
      if (!context) {
        return;
      }
      auto func = weak_func.lock();
      if (!func) {
        return;
      }
      std::string info_json = "{ id: " + std::to_string(id) + " }";
      const std::shared_ptr<CtxValue> argus[] = {
          context->CreateObject(unicode_string_view(info_json))
      };
      context->CallFunction(func, 1, argus);
    });
  }
}

std::tuple<bool, std::string, std::shared_ptr<DomNode>> CreateNode(std::shared_ptr<Ctx> context,
                                                                   std::shared_ptr<CtxValue> node,
                                                                   std::shared_ptr<Scope> scope) {
  std::shared_ptr<DomNode> dom_node = nullptr;
  auto id_tuple = GetNodeId(context, node);
  if (!std::get<0>(id_tuple)) {
    return std::make_tuple(false, std::get<1>(id_tuple), dom_node);
  }

  auto pid_tuple = GetNodePid(context, node);
  if (!std::get<0>(pid_tuple)) {
    return std::make_tuple(false, std::get<1>(pid_tuple), dom_node);
  }

  auto index_tuple = GetNodeIndex(context, node);
  if (!std::get<0>(index_tuple)) {
    return std::make_tuple(false, std::get<1>(index_tuple), dom_node);
  }

  auto view_name_tuple = GetNodeViewName(context, node);
  if (!std::get<0>(view_name_tuple)) {
    return std::make_tuple(false, std::get<1>(view_name_tuple), dom_node);
  }

  auto tag_name_tuple = GetNodeViewName(context, node);
  if (!std::get<0>(tag_name_tuple)) {
    return std::make_tuple(false, std::get<1>(tag_name_tuple), dom_node);
  }

  auto props_tuple = GetNodeProps(context, node);

  // create node
  std::string u8_tag_name = StringViewUtils::ToU8StdStr(std::get<2>(tag_name_tuple));
  std::string u8_view_name = StringViewUtils::ToU8StdStr(std::get<2>(view_name_tuple));

  /*
   * 特殊组件，需要js delegate特殊处理
   * 1. modal组件需要外部传入宽高，因为大部分modal组件render实现会挂在window上
   * 2. text组件需要外部传入测量方法
   * 3. image组件需要外部传入测量方法
   */
  bool isModalView = false;
  if (u8_view_name == kModalViewName) {
    isModalView = true;
  }

  bool isTextView = false;
  if (u8_view_name == kTextViewName) {
    isTextView = true;
  }

  bool isImageView = false;
  if (u8_view_name == kImageViewName) {
    isImageView = true;
  }

  dom_node = std::make_shared<DomNode>(std::get<2>(id_tuple), std::get<2>(pid_tuple),
    std::get<2>(index_tuple), std::move(u8_tag_name), std::move(u8_view_name),
    std::move(std::get<2>(props_tuple)), std::move(std::get<4>(props_tuple)),
    scope->GetDomManager());
  std::set<std::string> func_set = std::move(std::get<3>(props_tuple));
  if (!func_set.empty()) {
    for (const auto &v : func_set) {
      if (v == hippy::kOnClick) {
        BindClickEvent(context, hippy::kOnClick, dom_node);
      } else if (v == hippy::kOnLongClick) {
        BindClickEvent(context, hippy::kOnLongClick, dom_node);
      } else if (v == hippy::kOnTouchStart) {
        BindTouchEvent(context, hippy::kOnTouchStart, dom_node);
      } else if (v == hippy::kOnTouchMove) {
        BindTouchEvent(context, hippy::kOnTouchMove, dom_node);
      } else if (v == hippy::kOnTouchEnd) {
        BindTouchEvent(context, hippy::kOnTouchEnd, dom_node);
      } else if (v == hippy::kOnTouchCancel) {
        BindTouchEvent(context, hippy::kOnTouchCancel, dom_node);
      } else if (v == hippy::kOnAttachedToWindow) {
        SetAttachListener(context, hippy::kOnAttachedToWindow, dom_node);
      } else if (v == hippy::kOnDetachedFromWindow) {
        SetAttachListener(context, hippy::kOnDetachedFromWindow, dom_node);
      }
    }
  }

  if (isModalView) {
    auto size = scope->GetDomManager()->GetRootSize();
    dom_node->SetLayoutWidth(std::get<0>(size));
    dom_node->SetLayoutHeight(std::get<1>(size));
  }
  return std::make_tuple(true, "", dom_node);
}

std::tuple<bool, std::string, std::vector<std::shared_ptr<DomNode>>> HandleJsValue(
    std::shared_ptr<Ctx> context,
    std::shared_ptr<CtxValue> nodes,
    std::shared_ptr<Scope> scope) {
  uint32_t len = context->GetArrayLength(nodes);
  std::vector<std::shared_ptr<DomNode>> dom_nodes;
  for (uint32_t i = 0; i < len; ++i) {
    std::shared_ptr<CtxValue> node = context->CopyArrayElement(nodes, i);
    auto tuple = CreateNode(context, node, scope);
    if (!std::get<0>(tuple)) {
      return std::make_tuple(false, std::move(std::get<1>(tuple)), std::move(dom_nodes));
    }
    dom_nodes.push_back(std::get<2>(tuple));
  }
  return std::make_tuple(true, "", std::move(dom_nodes));
}

void UIManagerModule::CreateNode(const hippy::napi::CallbackInfo &info) {
  std::shared_ptr<Scope> scope = info.GetScope();
  std::shared_ptr<Ctx> context = scope->GetContext();
  TDF_BASE_CHECK(context);

  // info[0] rootId 兼容上个版本，暂时无用
  std::shared_ptr<CtxValue> nodes = info[1];
  auto ret = HandleJsValue(context, nodes, scope);
  if (!std::get<0>(ret)) {
    info.GetExceptionValue()->Set(context, unicode_string_view(std::get<1>(ret)));
    return;
  }
  scope->GetDomManager()->CreateDomNodes(std::move(std::get<2>(ret)));
}

void UIManagerModule::UpdateNode(const hippy::napi::CallbackInfo &info) {
  std::shared_ptr<Scope> scope = info.GetScope();
  std::shared_ptr<Ctx> context = scope->GetContext();
  TDF_BASE_CHECK(context);

  std::shared_ptr<CtxValue> nodes = info[1];
  auto ret = HandleJsValue(context, nodes, scope);
  if (!std::get<0>(ret)) {
    info.GetExceptionValue()->Set(context, unicode_string_view(std::get<1>(ret)));
    return;
  }
  scope->GetDomManager()->UpdateDomNodes(std::move(std::get<2>(ret)));
}

void UIManagerModule::DeleteNode(const hippy::napi::CallbackInfo &info) {
  std::shared_ptr<Scope> scope = info.GetScope();
  std::shared_ptr<Ctx> context = scope->GetContext();
  TDF_BASE_CHECK(context);

  std::shared_ptr<CtxValue> nodes = info[1];
  uint32_t len = context->GetArrayLength(nodes);
  std::vector<std::shared_ptr<DomNode>> dom_nodes;
  for (auto i = 0; i < len; ++i) {
    std::shared_ptr<CtxValue> node = context->CopyArrayElement(nodes, i);
    auto id_tuple = GetNodeId(context, node);
    if (!std::get<0>(id_tuple)) {
      info.GetExceptionValue()->Set(context, unicode_string_view(std::get<1>(id_tuple)));
      return;
    }

    auto pid_tuple = GetNodePid(context, node);
    if (!std::get<0>(pid_tuple)) {
      info.GetExceptionValue()->Set(context, unicode_string_view(std::get<1>(pid_tuple)));
      return;
    }

    auto index_tuple = GetNodeIndex(context, node);
    if (!std::get<0>(index_tuple)) {
      info.GetExceptionValue()->Set(context, unicode_string_view(std::get<1>(index_tuple)));
      return;
    }
    dom_nodes.push_back(std::make_shared<DomNode>(std::get<2>(id_tuple),
                                                  std::get<2>(pid_tuple),
                                                  std::get<2>(index_tuple)));
  }
  scope->GetDomManager()->DeleteDomNodes(std::move(dom_nodes));
}

void UIManagerModule::StartBatch(const hippy::napi::CallbackInfo &info) {
  std::shared_ptr<Scope> scope = info.GetScope();
  std::shared_ptr<Ctx> context = scope->GetContext();
  TDF_BASE_CHECK(context);

  scope->GetDomManager()->BeginBatch();
}

void UIManagerModule::EndBatch(const hippy::napi::CallbackInfo &info) {
  std::shared_ptr<Scope> scope = info.GetScope();
  std::shared_ptr<Ctx> context = scope->GetContext();
  TDF_BASE_CHECK(context);

  scope->GetDomManager()->EndBatch();
}

void UIManagerModule::CallUIFunction(const hippy::napi::CallbackInfo &info) {
  assert(info.Length() == 2);
  std::shared_ptr<Scope> scope = info.GetScope();
  std::shared_ptr<Ctx> context = scope->GetContext();
  TDF_BASE_CHECK(context);

  int32_t id;
  auto id_value = context->ToDomValue(info[0]);
  if (id_value->IsNumber()) {
    id = id_value->ToInt32();
  }

  std::string name;
  auto name_value = context->ToDomValue(info[1]);
  if (name_value->IsString()) {
    name = name_value->ToString();
  }

  std::unordered_map<std::string, std::shared_ptr<DomValue>> param;
  auto param_value = context->ToDomValue(info[2]);
  if (param_value->IsObject()) {
    auto param_obj = param_value->ToObject();
    for (auto p: param_obj) {
      param[p.first] = std::make_shared<DomValue>(std::move(p.second));
    }
  } else if (param_value->IsArray()) { // 暂时兼容老版本，后续该处改为协商机制
    param[kFuncParamKey] = param_value;
  }

  hippy::CallFunctionCallback cb;
  bool flag = context->IsFunction(info[3]);
  if (flag) {
    auto func = info[3];
    std::weak_ptr<Ctx> weak_context = context;
    std::weak_ptr<CtxValue> weak_func = func;
    cb = [weak_context, weak_func](const std::any &rst) {
      auto context = weak_context.lock();
      if (!context) {
        return;
      }
      auto func = weak_func.lock();
      if (!func) {
        return;
      }
    };
  }
  scope->GetDomManager()->CallFunction(id, name, param, cb);
}
