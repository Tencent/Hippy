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
#include "core/task/javascript_task.h"
#include "dom/node_props.h"
#include "dom/dom_node.h"
#include "dom/dom_event.h"
#include "dom/dom_argument.h"

REGISTER_MODULE(UIManagerModule, CreateNodes)
REGISTER_MODULE(UIManagerModule, UpdateNodes)
REGISTER_MODULE(UIManagerModule, DeleteNodes)
REGISTER_MODULE(UIManagerModule, EndBatch)
REGISTER_MODULE(UIManagerModule, CallUIFunction)
REGISTER_MODULE(UIManagerModule, SetContextName)

constexpr char kNodePropertyPid[] = "pId";
constexpr char kNodePropertyIndex[] = "index";
constexpr char kNodePropertyViewName[] = "name";
constexpr char kNodePropertyProps[] = "props";
constexpr char kNodePropertyStyle[] = "style";

//constexpr char kClickEvent[] = "click";
//constexpr char kLongClickEvent[] = "longclick";
//constexpr char kTouchStartEvent[] = "touchstart";
//constexpr char kTouchMoveEvent[] = "touchmove";
//constexpr char kTouchEndEvent[] = "touchend";
//constexpr char kTouchCancelEvent[] = "touchcancel";
//constexpr char kLayoutEvent[] = "layout";
//constexpr char kAttachedToWindow[] = "attachedtowindow";
//constexpr char kDetachedFromWindow[] = "detachedfromwindow";
//constexpr char kShowEvent[] = "show";
//constexpr char kDismissEvent[] = "dismiss";

constexpr char kEventListsKey[] = "__events";
constexpr char kEventNameKey[] = "name";
constexpr char kEventCBKey[] = "cb";

const int32_t kInvalidValue = -1;
const uint32_t kInvalidListenerId = 0;

using DomValue = tdf::base::DomValue;
using DomArgument = hippy::dom::DomArgument;
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
  std::shared_ptr<CtxValue> id_value = context->GetProperty(node, hippy::kId);
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

void HandleEventListeners(const std::shared_ptr<Ctx> &context,
                          const std::shared_ptr<CtxValue> &node,
                          const std::shared_ptr<DomNode> &dom_node,
                          const std::shared_ptr<Scope> &scope) {
  auto events = context->GetProperty(node, kEventListsKey);
  if (events && context->IsArray(events)) {
    auto len = context->GetArrayLength(events);
    for (uint32_t i = 0; i < len; ++i) {
      auto event = context->CopyArrayElement(events, i);
      auto name_prop = context->GetProperty(event, kEventNameKey);
      auto cb = context->GetProperty(event, kEventCBKey);
      unicode_string_view name;
      auto flag = context->GetValueString(name_prop, &name);
      TDF_BASE_DCHECK(flag) << "get event name failed";
      TDF_BASE_DCHECK(context->IsFunction(cb)) << "get event cb failed";
      if (flag) { // 线上有问题的时候可以兼容，debug包会命中上面DCHECK
        std::string name_str = StringViewUtils::ToU8StdStr(name);
        std::weak_ptr<Ctx> weak_context = context;
        std::weak_ptr<JavaScriptTaskRunner> weak_runner = scope->GetTaskRunner();
        auto dom_id = dom_node->GetId();
        if (context->IsNullOrUndefined(cb) || context->IsFunction(cb)) {
          // cb null 代表移除
          auto listener_id = scope->GetListenerId(dom_id, name_str);
          if (listener_id != kInvalidListenerId) {
            // 目前hippy上层还不支持绑定多个回调，有更新时先移除老的监听，再绑定新的
            TDF_BASE_CHECK(!scope->GetDomManager().expired());
            scope->GetDomManager().lock()->RemoveEventListener(dom_id, name_str, listener_id);
          }
        }
        if (context->IsFunction(cb)) {
          std::weak_ptr<Scope> weak_scope = scope;
          // dom_node 持有 cb
          dom_node->AddEventListener(
              name_str, true,
              [weak_context, cb](const std::shared_ptr<DomEvent> &event) {
                auto context = weak_context.lock();
                if (!context) {
                  return;
                }
                auto param = context->CreateCtxValue(event->GetValue());
                if (param) {
                  const std::shared_ptr<CtxValue> argus[] = {param};
                  context->CallFunction(cb, 1, argus);
                } else {
                  const std::shared_ptr<CtxValue> argus[] = {};
                  context->CallFunction(cb, 0, argus);
                }
              },
              [weak_scope, dom_id, name_str](const std::shared_ptr<DomArgument>& arg) {
                DomValue dom_value;
                std::shared_ptr<Scope> scope = weak_scope.lock();
                if (scope && arg->ToObject(dom_value) && dom_value.IsUInt32()) {
                  scope->AddListener(dom_id, name_str, dom_value.ToUint32());
                }
              });
        }
      }
    }
  }
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

  TDF_BASE_CHECK(!scope->GetDomManager().expired());
  dom_node = std::make_shared<DomNode>(std::get<2>(id_tuple),
                                       std::get<2>(pid_tuple),
                                       std::get<2>(index_tuple),
                                       std::move(u8_tag_name),
                                       std::move(u8_view_name),
                                       std::move(std::get<2>(props_tuple)),
                                       std::move(std::get<3>(props_tuple)),
                                       scope->GetDomManager().lock());
  HandleEventListeners(context, node, dom_node, scope);
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

  TDF_BASE_CHECK(!scope->GetDomManager().expired());
  scope->GetDomManager().lock()->CreateDomNodes(std::move(std::get<2>(ret)));
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
  TDF_BASE_CHECK(!scope->GetDomManager().expired());
  scope->GetDomManager().lock()->UpdateDomNodes(std::move(std::get<2>(ret)));
}

void UIManagerModule::DeleteNodes(const hippy::napi::CallbackInfo &info) {
  std::shared_ptr<Scope> scope = info.GetScope();
  std::shared_ptr<Ctx> context = scope->GetContext();
  TDF_BASE_CHECK(context);

  std::shared_ptr<CtxValue> nodes = info[1];
  auto len = context->GetArrayLength(nodes);
  std::vector<std::shared_ptr<DomNode>> dom_nodes;
  for (uint32_t i = 0; i < len; ++i) {
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
  // 节点都删除了，其上的eventListener自然也销毁了，此处不用显式RemoveEventListener
  TDF_BASE_CHECK(!scope->GetDomManager().expired());
  scope->GetDomManager().lock()->DeleteDomNodes(std::move(dom_nodes));
}

void UIManagerModule::EndBatch(const hippy::napi::CallbackInfo &info) {
  std::shared_ptr<Scope> scope = info.GetScope();
  std::shared_ptr<Ctx> context = scope->GetContext();
  TDF_BASE_CHECK(context);

  TDF_BASE_CHECK(!scope->GetDomManager().expired());
  scope->GetDomManager().lock()->EndBatch();
}

void UIManagerModule::CallUIFunction(const hippy::napi::CallbackInfo &info) {
  std::shared_ptr<Scope> scope = info.GetScope();
  std::shared_ptr<Ctx> context = scope->GetContext();
  TDF_BASE_CHECK(context);

  int32_t id = 0;
  auto id_value = context->ToDomValue(info[0]);
  if (id_value->IsNumber()) {
    id = static_cast<int32_t>(id_value->ToDouble());
  }

  std::string name;
  auto name_value = context->ToDomValue(info[1]);
  if (name_value->IsString()) {
    name = name_value->ToString();
  }

  std::unordered_map<std::string, std::shared_ptr<DomValue>> param;
  DomArgument param_value = *(context->ToDomArgument(info[2]));
  hippy::CallFunctionCallback cb = nullptr;
  bool flag = context->IsFunction(info[3]);
  if (flag) {
    auto func = info[3];
    std::weak_ptr<Ctx> weak_context = context;
    std::weak_ptr<CtxValue> weak_func = func;
    std::weak_ptr<JavaScriptTaskRunner> weak_runner = scope->GetTaskRunner();
    cb = [weak_context, func,
          weak_runner](const std::shared_ptr<DomArgument> &argument) -> void {
      auto runner = weak_runner.lock();
      if (runner) {
        std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
        task->callback = [weak_context, func, argument]() {
          auto context = weak_context.lock();
          if (!context) {
            return;
          }

          if (!func) {
            return;
          }

          DomValue value;
          bool flag = argument->ToObject(value);
          if (flag) {
            auto param = context->CreateCtxValue(
                std::make_shared<DomValue>(std::move(value)));
            if (param) {
              const std::shared_ptr<CtxValue> argus[] = {param};
              context->CallFunction(func, 1, argus);
            } else {
              const std::shared_ptr<CtxValue> argus[] = {};
              context->CallFunction(func, 0, argus);
            }
            return;
          } else {
            context->ThrowException(unicode_string_view("param ToObject failed"));
          }
        };
        runner->PostTask(task);
      }
    };
  }
  TDF_BASE_CHECK(!scope->GetDomManager().expired());
  scope->GetDomManager().lock()->CallFunction(static_cast<uint32_t>(id), name, param_value, cb);
}

void UIManagerModule::SetContextName(const hippy::napi::CallbackInfo &info) {
  std::shared_ptr<Scope> scope = info.GetScope();
  std::shared_ptr<Ctx> context = scope->GetContext();
  TDF_BASE_CHECK(context);
  
#if TDF_SERVICE_ENABLED
  auto ctx_context_name = info[0];
  unicode_string_view unicode_context_name;
  bool flag = context->GetValueString(ctx_context_name, &unicode_context_name);
  if (scope->GetDevtoolsDataSource() && flag) {
    auto context_name = StringViewUtils::ToU8StdStr(unicode_context_name);
    scope->GetDevtoolsDataSource()->SetContextName(context_name);
  }
#endif
}
