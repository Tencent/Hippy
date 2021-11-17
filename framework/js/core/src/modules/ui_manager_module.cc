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

#include <tuple>

#include "core/modules/module_register.h"
#include "core/base/string_view_utils.h"

REGISTER_MODULE(UIManagerModule, CreateNodes)
REGISTER_MODULE(UIManagerModule, UpdateNodes)
REGISTER_MODULE(UIManagerModule, DeleteNodes)
REGISTER_MODULE(UIManagerModule, StartBatch)
REGISTER_MODULE(UIManagerModule, EndBatch)
REGISTER_MODULE(UIManagerModule, CallUIFunction)

const char *kNodePropertyId = "id";
const char *kNodePropertyPid = "pid";
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
const char *kOnClickFuncName = "__onClickDispatcher";

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
  std::shared_ptr<CtxValue> id_value = context->GetProperty(node, kNodePropertyId);
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

std::tuple<bool, std::string, bool,
           std::unordered_map<std::string, std::shared_ptr<DomValue>>>
GetNodeExtValue(std::shared_ptr<Ctx> context, std::unordered_map<std::string, DomValue> &props) {
  std::unordered_map<std::string, std::shared_ptr<DomValue>> dom_ext_map;
  // handle click listener
  bool on_click_flag = false;
  auto click_flag_it = props.find(kNodePropertyOnClick);
  if (click_flag_it != props.end()) {
    if (click_flag_it->second.IsBoolean()) {
      on_click_flag = click_flag_it->second.ToBoolean();
    } else {
      return std::make_tuple(false, "click flag type error", on_click_flag, std::move(dom_ext_map));
    }
    props.erase(click_flag_it);
  }
  // parse ext value
  for (auto p : props) {
    dom_ext_map[p.first] = std::make_shared<DomValue>(std::move(p.second));
  }
  return std::make_tuple(true, "", on_click_flag, std::move(dom_ext_map));
}

std::tuple<bool, std::string, std::unordered_map<std::string, std::shared_ptr<DomValue>>, bool,
           std::unordered_map<std::string, std::shared_ptr<DomValue>>> GetNodeProps(
    std::shared_ptr<Ctx> context, std::shared_ptr<CtxValue> node) {
  std::unordered_map<std::string, std::shared_ptr<DomValue>> style_map;
  std::unordered_map<std::string, std::shared_ptr<DomValue>> dom_ext_map;
  bool on_click_flag = false;
  std::shared_ptr<CtxValue> props = context->GetProperty(node, kNodePropertyProps);
  if (!props) {
    return std::make_tuple(false, "node does not contain props",
                           std::move(style_map),
                           on_click_flag,
                           std::move(dom_ext_map));
  }
  std::shared_ptr<DomValue> props_obj = context->ToDomValue(props);
  if (!props_obj) {
    return std::make_tuple(false, "to dom value failed",
                           std::move(style_map),
                           on_click_flag,
                           std::move(dom_ext_map));
  }

  if (!props_obj->IsObject()) {
    return std::make_tuple(false, "props_obj type error",
                           std::move(style_map),
                           on_click_flag,
                           std::move(dom_ext_map));
  }

  std::unordered_map<std::string, DomValue> props_map = props_obj->ToObject();
  auto style_tuple = GetNodeStyle(context, props_map);
  if (!std::get<2>(style_tuple).empty()) {
    style_map = std::move(std::get<2>(style_tuple));
  }
  auto ext_tuple = GetNodeExtValue(context, props_map);
  if (std::get<0>(ext_tuple)) {
    if (!std::get<3>(ext_tuple).empty()) {
      dom_ext_map = std::move(std::get<3>(ext_tuple));
    }
    on_click_flag = std::get<2>(ext_tuple);
  }
  return std::make_tuple(true, "", std::move(style_map), on_click_flag, std::move(dom_ext_map));
}

std::tuple<bool, std::string, std::shared_ptr<DomNode>> CreateNode(std::shared_ptr<Ctx> context,
                                                                   std::shared_ptr<CtxValue> node) {
  auto id_tuple = GetNodeId(context, node);
  if (!std::get<0>(id_tuple)) {
    return std::make_tuple(false, std::get<1>(id_tuple), nullptr);
  }

  auto pid_tuple = GetNodePid(context, node);
  if (!std::get<0>(pid_tuple)) {
    return std::make_tuple(false, std::get<1>(pid_tuple), nullptr);
  }

  auto index_tuple = GetNodePid(context, node);
  if (!std::get<0>(index_tuple)) {
    return std::make_tuple(false, std::get<1>(index_tuple), nullptr);
  }

  auto view_name_tuple = GetNodeViewName(context, node);
  if (!std::get<0>(view_name_tuple)) {
    return std::make_tuple(false, std::get<1>(view_name_tuple), nullptr);
  }

  auto tag_name_tuple = GetNodeViewName(context, node);
  if (!std::get<0>(tag_name_tuple)) {
    return std::make_tuple(false, std::get<1>(tag_name_tuple), nullptr);
  }

  auto props_tuple = GetNodeProps(context, node);

  // create node
  std::string u8_tag_name = StringViewUtils::ToU8StdStr(std::get<2>(tag_name_tuple));
  std::string u8_view_name = StringViewUtils::ToU8StdStr(std::get<2>(view_name_tuple));

  std::shared_ptr<DomNode> dom_node = std::make_shared<DomNode>(std::get<2>(id_tuple),
                                                                std::get<2>(pid_tuple),
                                                                std::get<2>(index_tuple),
                                                                std::move(u8_tag_name),
                                                                std::move(u8_view_name),
                                                                std::move(std::get<2>(props_tuple)),
                                                                std::move(std::get<4>(props_tuple)));
  if (std::get<3>(props_tuple)) {
    std::shared_ptr<CtxValue> func = context->GetGlobalObjVar(kOnClickFuncName);
    if (context->IsFunction(func)) {
      std::weak_ptr<Ctx> weak_context = context;
      std::weak_ptr<CtxValue> weak_func = func;
      dom_node->AddClickEventListener([weak_context, weak_func](hippy::TouchEventInfo info) {
        auto context = weak_context.lock();
        if (!context) {
          return;
        }
        auto func = weak_func.lock();
        if (!func) {
          return;
        }
        std::string info_json = "{ x: " + std::to_string(info.x) + ", y:" +
            std::to_string(info.y) + " }";
        std::shared_ptr<CtxValue> param = context->CreateObject(
            unicode_string_view(info_json));
        std::shared_ptr<CtxValue> argv[] = {param};
        context->CallFunction(func, 1, argv);
      });
    }
  }
  return std::make_tuple(true, "", dom_node);
}

std::tuple<bool, std::string, std::vector<std::shared_ptr<DomNode>>> HandleJsValue(
    std::shared_ptr<Ctx> context,
    std::shared_ptr<CtxValue> nodes) {
  uint32_t len = context->GetArrayLength(nodes);
  std::vector<std::shared_ptr<DomNode>> dom_nodes;
  for (uint32_t i = 0; i < len; ++i) {
    std::shared_ptr<CtxValue> node = context->CopyArrayElement(nodes, i);
    auto tuple = CreateNode(context, node);
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
  auto ret = HandleJsValue(context, nodes);
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
  auto ret = HandleJsValue(context, nodes);
  if (!std::get<0>(ret)) {
    info.GetExceptionValue()->Set(context, unicode_string_view(std::get<1>(ret)));
    return;
  }
  scope->GetDomManager()->UpdateDomNode(std::move(std::get<2>(ret)));
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

    auto index_tuple = GetNodePid(context, node);
    if (!std::get<0>(index_tuple)) {
      info.GetExceptionValue()->Set(context, unicode_string_view(std::get<1>(index_tuple)));
      return;
    }
    dom_nodes.push_back(std::make_shared<DomNode>(std::get<2>(id_tuple),
        std::get<2>(pid_tuple), std::get<2>(index_tuple)));
  }
  scope->GetDomManager()->DeleteDomNode(dom_nodes);
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
  }

  hippy::CallFunctionCallback cb;
  bool flag = context->IsFunction(info[3]);
  if (flag) {
    auto func = info[3];
    std::weak_ptr<Ctx> weak_context = context;
    std::weak_ptr<CtxValue> weak_func = func;
    cb = [weak_context, weak_func](const std::any& rst) {
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
