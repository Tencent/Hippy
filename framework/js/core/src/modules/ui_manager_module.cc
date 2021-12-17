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
#include "dom/dom_event.h"

REGISTER_MODULE(UIManagerModule, CreateNodes)
REGISTER_MODULE(UIManagerModule, UpdateNodes)
REGISTER_MODULE(UIManagerModule, DeleteNodes)
REGISTER_MODULE(UIManagerModule, StartBatch)
REGISTER_MODULE(UIManagerModule, EndBatch)
REGISTER_MODULE(UIManagerModule, CallUIFunction)

constexpr char kNodePropertyPid[] = "pId";
constexpr char kNodePropertyIndex[] = "index";
constexpr char kNodePropertyViewName[] = "name";
constexpr char kNodePropertyProps[] = "props";
constexpr char kNodePropertyStyle[] = "style";

constexpr char kClickEvent[] = "click";
constexpr char kLongClickEvent[] = "longclick";
constexpr char kTouchStartEvent[] = "touchstart";
constexpr char kTouchMoveEvent[] = "tourchmove";
constexpr char kTouchEndEvent[] = "touchend";
constexpr char kTouchCancelEvent[] = "touchcancel";
constexpr char kLayoutEvent[] = "layout";
// constexpr char kAttachedToWindow[] = "AttachedToWindow";
// constexpr char kDetachedFromWindow[] = "DetachedFromWindow";
constexpr char kShowEvent[] = "show";
constexpr char kDismissEvent[] = "dismiss";

constexpr char kEventsListsKey[] = "__events";
constexpr char kEventNameKey[] = "name";
constexpr char kEventCBKey[] = "cb";

const int32_t kInvalidValue = -1;

using DomValue = tdf::base::DomValue;
using unicode_string_view = tdf::base::unicode_string_view;

using Ctx = hippy::napi::Ctx;
using CtxValue = hippy::napi::CtxValue;
using CallbackInfo = hippy::napi::CallbackInfo;
using DomEvent = hippy::dom::DomEvent;
using DomManager = hippy::dom::DomManager;
using DomNode = hippy::dom::DomNode;
using RegisterFunction = hippy::base::RegisterFunction;
using RegisterMap = hippy::base::RegisterMap;
using StringViewUtils = hippy::base::StringViewUtils;

UIManagerModule::UIManagerModule() = default;

UIManagerModule::~UIManagerModule() = default;

std::tuple<bool, std::string, int32_t> GetNodeId(const std::shared_ptr<Ctx> &context,
                                                 const std::shared_ptr<CtxValue> &node) {
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

std::tuple<bool, std::string, int32_t> GetNodePid(const std::shared_ptr<Ctx> &context,
                                                  const std::shared_ptr<CtxValue> &node) {
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

std::tuple<bool, std::string, int32_t> GetNodeIndex(const std::shared_ptr<Ctx> &context,
                                                    const std::shared_ptr<CtxValue> &node) {
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

std::tuple<bool, std::string, unicode_string_view>
GetNodeViewName(const std::shared_ptr<Ctx> &context,
                const std::shared_ptr<CtxValue> &node) {
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

std::tuple<bool, std::string, unicode_string_view>
GetNodeTagName(const std::shared_ptr<Ctx> &context,
               const std::shared_ptr<CtxValue> &node) {
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
GetNodeStyle(const std::shared_ptr<Ctx> &context,
             std::unordered_map<std::string, DomValue> &props) {
  std::unordered_map<std::string, std::shared_ptr<DomValue>> ret;
  // parse style
  auto style_it = props.find(kNodePropertyStyle);
  if (style_it != props.end()) {
    if (style_it->second.IsObject()) {
      std::unordered_map<std::string, DomValue> style_obj = style_it->second.ToObject();
      for (const auto &p : style_obj) {
        ret[p.first] = std::make_shared<DomValue>(p.second);
      }
    }
    props.erase(style_it);
    return std::make_tuple(true, "", std::move(ret));
  }
  return std::make_tuple(false, "props does not contain style", std::move(ret));
}

std::tuple<bool, std::string,
           std::unordered_map<std::string, std::shared_ptr<DomValue>>>
GetNodeExtValue(const std::shared_ptr<Ctx> &context,
                std::unordered_map<std::string, DomValue> &props) {
  std::unordered_map<std::string, std::shared_ptr<DomValue>> dom_ext_map;
  // parse ext value
  for (const auto &p : props) {
    dom_ext_map[p.first] = std::make_shared<DomValue>(std::move(p.second));
  }
  return std::make_tuple(true, "", std::move(dom_ext_map));
}

std::tuple<bool, std::string,
           std::unordered_map<std::string, std::shared_ptr<DomValue>>,
           std::unordered_map<std::string, std::shared_ptr<DomValue>>>
GetNodeProps(const std::shared_ptr<Ctx> &context, const std::shared_ptr<CtxValue> &node) {
  std::unordered_map<std::string, std::shared_ptr<DomValue>> style_map;
  std::unordered_map<std::string, std::shared_ptr<DomValue>> dom_ext_map;
  std::shared_ptr<CtxValue> props = context->GetProperty(node, kNodePropertyProps);
  if (!props) {
    return std::make_tuple(false, "node does not contain props",
                           std::move(style_map),
                           std::move(dom_ext_map));
  }
  std::shared_ptr<DomValue> props_obj = context->ToDomValue(props);
  if (!props_obj) {
    return std::make_tuple(false, "to dom value failed",
                           std::move(style_map),
                           std::move(dom_ext_map));
  }

  if (!props_obj->IsObject()) {
    return std::make_tuple(false, "props_obj type error",
                           std::move(style_map),
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
      dom_ext_map = std::move(std::get<2>(ext_tuple));
    }
  }
  return std::make_tuple(true, "", std::move(style_map), std::move(dom_ext_map));
}

void BindClickEvent(const std::shared_ptr<Ctx> &context, const std::string &name,
                    const std::shared_ptr<DomNode> &dom_node,
                    const std::shared_ptr<CtxValue> &func) {
  std::weak_ptr<Ctx> weak_context = context;
  int32_t id = dom_node->GetId();
  // dom_node 持有 func
  dom_node->AddEventListener(name,
                             true,
                             [weak_context, func, id](const std::shared_ptr<DomEvent> &event) {
                               auto context = weak_context.lock();
                               if (!context) {
                                 return;
                               }
                               // todo DomEvent 暴露给前端
                               std::string info_json = "{ id: " + std::to_string(id) + " }";
                               const std::shared_ptr<CtxValue> argus[] = {
                                   context->CreateObject(unicode_string_view(info_json))
                               };
                               context->CallFunction(func, 1, argus);
                             });
}

void BindTouchEvent(const std::shared_ptr<Ctx> &context, const std::string &name,
                    const std::shared_ptr<DomNode> &dom_node,
                    const std::shared_ptr<CtxValue> &func) {
  std::weak_ptr<Ctx> weak_context = context;
  int32_t id = dom_node->GetId();
  dom_node->AddEventListener(name, true, [weak_context, func, id]
      (const std::shared_ptr<DomEvent> &event) {
    auto context = weak_context.lock();
    if (!context) {
      return;
    }
    auto info = std::any_cast<hippy::TouchEventInfo>(event->GetValue());
    std::string info_json =
        "{ id: " + std::to_string(id) + ", page_x: " + std::to_string(info.x) + ", page_y:"
            + std::to_string(info.y) + " }";
    const std::shared_ptr<CtxValue> argus[] = {
        context->CreateObject(unicode_string_view(info_json))
    };
    context->CallFunction(func, 1, argus);
  });
}

//void SetAttachListener(std::shared_ptr<Ctx> context, const std::string &name,
//                       std::shared_ptr<DomNode> dom_node,
//                       std::shared_ptr<CtxValue> func) {
//  std::weak_ptr<Ctx> weak_context = context;
//  int32_t id = dom_node->GetId();
//  std::string event;
//  if (name == hippy::kOnAttachedToWindow) {
//    event = kAttachedToWindow;
//  } else if (name == hippy::kOnDetachedFromWindow) {
//    event = kDetachedFromWindow;
//  } else {
//    TDF_BASE_NOTREACHED();
//  }
//  dom_node->AddEventListener(event, true, [weak_context, func, name, id]
//      (const std::shared_ptr<DomEvent> &event) {
//    auto context = weak_context.lock();
//    if (!context) {
//      return;
//    }
//    std::string info_json = "{ id: " + std::to_string(id) + " }";
//    const std::shared_ptr<CtxValue> argus[] = {
//        context->CreateObject(unicode_string_view(info_json))
//    };
//    bool is_attach = std::any_cast<bool>(event->GetValue());
//    if (is_attach && name == kAttachedToWindow) {
//      context->CallFunction(func, 1, argus);
//    } else if (!is_attach && name == kDetachedFromWindow) {
//      context->CallFunction(func, 1, argus);
//    } else {
//      TDF_BASE_NOTREACHED();
//    }
//  });
//}

void BindShowEvent(const std::shared_ptr<Ctx> &context,
                   const std::string &name,
                   const std::shared_ptr<DomNode> &dom_node,
                   const std::shared_ptr<CtxValue> &func) {
  std::weak_ptr<Ctx> weak_context = context;
  int32_t id = dom_node->GetId();
  dom_node->AddEventListener(name, true, [weak_context, func, id]
      (const std::shared_ptr<DomEvent> &event) {
    auto context = weak_context.lock();
    if (!context) {
      return;
    }
    std::string info_json = "{ id: " + std::to_string(id) + " }";
    const std::shared_ptr<CtxValue> argus[] = {
        context->CreateObject(unicode_string_view(info_json))
    };
    context->CallFunction(func, 1, argus);
  });
}

void BindLayoutEvent(const std::shared_ptr<Ctx> &context,
                     const std::string &name,
                     const std::shared_ptr<DomNode> &dom_node,
                     const std::shared_ptr<CtxValue> &func) {
  std::weak_ptr<Ctx> weak_context = context;
  int32_t id = dom_node->GetId();
  dom_node->AddEventListener(kLayoutEvent, true, [weak_context, func, id]
      (const std::shared_ptr<DomEvent> &event) {
    auto context = weak_context.lock();
    if (!context) {
      return;
    }
    auto info = std::any_cast<hippy::LayoutResult>(event->GetValue());
    std::string info_json =
        "{ id: " + std::to_string(id) + ", x: " + std::to_string(info.left) + ", y:"
            + std::to_string(info.top) + ", w: " + std::to_string(info.width) + ", h: "
            + std::to_string(info.height) + " }";
    const std::shared_ptr<CtxValue> argus[] = {
        context->CreateObject(unicode_string_view(info_json))
    };
    context->CallFunction(func, 1, argus);
  });
}

void HandleEventListeners(const std::shared_ptr<Ctx> &context,
                          const std::shared_ptr<CtxValue> &node,
                          const std::shared_ptr<DomNode> &dom_node) {
  auto events = context->GetProperty(node, kEventsListsKey);
  if (events && context->IsArray(events)) {
    auto len = context->GetArrayLength(events);
    for (auto i = 0; i < len; ++i) {
      auto event = context->CopyArrayElement(events, i);
      auto name_prop = context->GetProperty(event, kEventNameKey);
      auto cb = context->GetProperty(event, kEventCBKey);
      unicode_string_view name;
      auto flag = context->GetValueString(name_prop, &name);
      TDF_BASE_DCHECK(flag) << "get event name failed";
      TDF_BASE_DCHECK(context->IsFunction(cb)) << "get event cb failed";
      if (flag && context->IsFunction(cb)) {
        std::string name_str = StringViewUtils::ToU8StdStr(name);
        std::weak_ptr<Ctx> weak_context = context;
        // dom_node 持有 cb
        dom_node->AddEventListener(name_str,
                                   true,
                                   [weak_context, cb](const std::shared_ptr<DomEvent> &event) {
                                     auto context = weak_context.lock();
                                     if (!context) {
                                       return;
                                     }
                                     auto param = context->CreateCtxValue(event->GetValue());
                                     if (param) {
                                       const std::shared_ptr<CtxValue> argus[] = { param };
                                       context->CallFunction(cb, 1, argus);
                                     } else {
                                       const std::shared_ptr<CtxValue> argus[] = {};
                                       context->CallFunction(cb, 0, argus);
                                     }
                                   });
      }
    }

  }

//  auto on_click_func = context->GetProperty(node, hippy::kOnClick);
//  if (on_click_func && context->IsFunction(on_click_func)) {
//    BindClickEvent(context, kClickEvent, dom_node, on_click_func);
//  }
//
//  auto on_long_click_func = context->GetProperty(node, hippy::kOnLongClick);
//  if (on_long_click_func && context->IsFunction(on_long_click_func)) {
//    BindClickEvent(context, kLongClickEvent, dom_node, on_long_click_func);
//  }
//
//  auto on_touch_start_func = context->GetProperty(node, hippy::kOnTouchStart);
//  if (on_touch_start_func && context->IsFunction(on_touch_start_func)) {
//    BindTouchEvent(context, kTouchStartEvent, dom_node, on_touch_start_func);
//  }
//
//  auto on_touch_move_func = context->GetProperty(node, hippy::kOnTouchMove);
//  if (on_touch_move_func && context->IsFunction(on_touch_move_func)) {
//    BindTouchEvent(context, kTouchMoveEvent, dom_node, on_touch_move_func);
//  }
//
//  auto on_touch_end_func = context->GetProperty(node, hippy::kOnTouchEnd);
//  if (on_touch_end_func && context->IsFunction(on_touch_end_func)) {
//    BindTouchEvent(context, kTouchEndEvent, dom_node, on_touch_end_func);
//  }
//
//  auto on_touch_cancel_func = context->GetProperty(node, hippy::kOnTouchCancel);
//  if (on_touch_cancel_func && context->IsFunction(on_touch_cancel_func)) {
//    BindTouchEvent(context, kTouchCancelEvent, dom_node, on_touch_cancel_func);
//  }
//
//  auto on_show_func = context->GetProperty(node, hippy::kOnShow);
//  if (on_show_func && context->IsFunction(on_show_func)) {
//    BindShowEvent(context, kShowEvent, dom_node, on_show_func);
//  }
//
//  auto on_dismiss_func = context->GetProperty(node, hippy::kOnDismiss);
//  if (on_dismiss_func && context->IsFunction(on_dismiss_func)) {
//    BindShowEvent(context, kDismissEvent, dom_node, on_dismiss_func);
//  }
//
//  auto on_layout_func = context->GetProperty(node, hippy::kOnLayout);
//  if (on_layout_func && context->IsFunction(on_layout_func)) {
//    BindLayoutEvent(context, kLayoutEvent, dom_node, on_layout_func);
//  }
}

std::tuple<bool, std::string, std::shared_ptr<DomNode>>
CreateNode(const std::shared_ptr<Ctx> &context,
           const std::shared_ptr<CtxValue> &node,
           const std::shared_ptr<Scope> &scope) {
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

  auto tag_name_tuple = GetNodeTagName(context, node);
  if (!std::get<0>(tag_name_tuple)) {
    return std::make_tuple(false, std::get<1>(tag_name_tuple), dom_node);
  }

  auto props_tuple = GetNodeProps(context, node);

  // create node
  std::string u8_tag_name = StringViewUtils::ToU8StdStr(std::get<2>(tag_name_tuple));
  std::string u8_view_name = StringViewUtils::ToU8StdStr(std::get<2>(view_name_tuple));

  dom_node = std::make_shared<DomNode>(std::get<2>(id_tuple),
                                       std::get<2>(pid_tuple),
                                       std::get<2>(index_tuple),
                                       std::move(u8_tag_name),
                                       std::move(u8_view_name),
                                       std::move(std::get<2>(props_tuple)),
                                       std::move(std::get<3>(props_tuple)),
                                       scope->GetDomManager());
  HandleEventListeners(context, node, dom_node);

  return std::make_tuple(true, "", dom_node);
}

std::tuple<bool, std::string, std::vector<std::shared_ptr<DomNode>>> HandleJsValue(
    const std::shared_ptr<Ctx> &context,
    const std::shared_ptr<CtxValue> &nodes,
    const std::shared_ptr<Scope> &scope) {
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

void UIManagerModule::CreateNodes(const hippy::napi::CallbackInfo &info) {
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

void UIManagerModule::UpdateNodes(const hippy::napi::CallbackInfo &info) {
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

void UIManagerModule::DeleteNodes(const hippy::napi::CallbackInfo &info) {
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

  int32_t id = 0;
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
  DomValue param_value = *(context->ToDomValue(info[2]));
  hippy::CallFunctionCallback cb;
  bool flag = context->IsFunction(info[3]);
  if (flag) {
    auto func = info[3];
    std::weak_ptr<Ctx> weak_context = context;
    std::weak_ptr<CtxValue> weak_func = func;
    cb = [weak_context, weak_func](const std::any &param) -> std::any {
      auto context = weak_context.lock();
      if (!context) {
        return nullptr;
      }
      auto func = weak_func.lock();
      if (!func) {
        return nullptr;
      }
      auto dom_value = std::any_cast<DomValue>(param);
      auto value = context->CreateCtxValue(std::make_shared<DomValue>(dom_value));
      const std::shared_ptr<CtxValue> argus[] = {value};
      context->CallFunction(func, 1, argus);
      return nullptr;
    };
  }
  scope->GetDomManager()->CallFunction(id, name, param_value, cb);
}
