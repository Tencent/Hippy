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

#include "core/modules/scene_builder.h"

#include "base/unicode_string_view.h"
#include "core/base/string_view_utils.h"
#include "core/modules/scene_builder.h"
#include "core/modules/ui_manager_module.h"
#include "core/napi/js_native_api_types.h"
#include "core/scope.h"
#include "dom/node_props.h"

template <typename T>
using InstanceDefine = hippy::napi::InstanceDefine<T>;

template <typename T>
using FunctionDefine = hippy::napi::FunctionDefine<T>;

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


constexpr char kNodePropertyPid[] = "pId";
constexpr char kNodePropertyIndex[] = "index";
constexpr char kNodePropertyViewName[] = "name";
constexpr char kNodePropertyProps[] = "props";
constexpr char kNodePropertyStyle[] = "style";

const int32_t kInvalidValue = -1;

using CtxValue = hippy::napi::CtxValue;

namespace hippy {

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
      std::unordered_map<std::string, DomValue> style_obj = style_it->second.ToObjectChecked();
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

  std::unordered_map<std::string, DomValue> props_map = props_obj->ToObjectChecked();
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



void HandleEventListenerInfo(const std::shared_ptr<hippy::napi::Ctx> &context,
                             const size_t argument_count,
                             const std::shared_ptr<CtxValue> arguments[],
                             hippy::dom::EventListenerInfo& listener_info){
  TDF_BASE_CHECK(argument_count == 2 || argument_count == 3);

  int32_t dom_id;
  bool ret = context->GetValueNumber(arguments[0], &dom_id);
  TDF_BASE_CHECK(ret) << "get dom id failed";

  tdf::base::unicode_string_view str_view;
  ret = context->GetValueString(arguments[1], &str_view);
  std::string event_name = hippy::base::StringViewUtils::ToU8StdStr(str_view);
  TDF_BASE_DCHECK(ret) << "get event name failed";

  listener_info.dom_id = static_cast<uint32_t>(dom_id);
  listener_info.event_name = event_name;
  listener_info.callback = nullptr;

  if (argument_count == 3) {
    listener_info.callback = arguments[2];
  }
}

std::shared_ptr<InstanceDefine<SceneBuilder>> RegisterSceneBuilder(const std::weak_ptr<Scope>& weak_scope) {
  using SceneBuilder = hippy::dom::SceneBuilder;
  InstanceDefine<SceneBuilder> def;
  def.name = "SceneBuilder";
  def.constructor = [](size_t argument_count,
                       const std::shared_ptr<CtxValue> arguments[]) -> std::shared_ptr<SceneBuilder> {
    return std::make_shared<SceneBuilder>();
  };

  FunctionDefine<SceneBuilder> create_func_def;
  create_func_def.name = "Create";
  create_func_def.cb = [weak_scope](
      SceneBuilder* builder,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[]) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (scope) {
      auto weak_dom_manager = scope->GetDomManager();
      auto ret = HandleJsValue(scope->GetContext(), arguments[0], scope);
      builder->Create(weak_dom_manager, std::move(std::get<2>(ret)));
    }
    return nullptr;
  };
  def.functions.emplace_back(std::move(create_func_def));

  FunctionDefine<SceneBuilder> update_func_def;
  update_func_def.name = "Update";
  update_func_def.cb = [weak_scope](
      SceneBuilder* builder,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[]) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (scope) {
      auto weak_dom_manager = scope->GetDomManager();
      auto ret = HandleJsValue(scope->GetContext(), arguments[0], scope);
      builder->Update(weak_dom_manager, std::move(std::get<2>(ret)));
    }
    return nullptr;
  };
  def.functions.emplace_back(std::move(update_func_def));

  FunctionDefine<SceneBuilder> delete_func_def;
  delete_func_def.name = "Delete";
  delete_func_def.cb = [weak_scope](
      SceneBuilder* builder,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[]) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (scope) {
      auto weak_dom_manager = scope->GetDomManager();
      std::shared_ptr<CtxValue> nodes = arguments[0];
      std::shared_ptr<Ctx> context = scope->GetContext();
      TDF_BASE_CHECK(context);

      auto len = context->GetArrayLength(nodes);
      std::vector<std::shared_ptr<DomNode>> dom_nodes;
      for (uint32_t i = 0; i < len; ++i) {
        std::shared_ptr<CtxValue> node = context->CopyArrayElement(nodes, i);
        auto id_tuple = GetNodeId(context, node);
        if (!std::get<0>(id_tuple)) {
          return nullptr;
        }

        auto pid_tuple = GetNodePid(context, node);
        if (!std::get<0>(pid_tuple)) {
          return nullptr;
        }

        auto index_tuple = GetNodeIndex(context, node);
        if (!std::get<0>(index_tuple)) {
          return nullptr;
        }
        dom_nodes.push_back(std::make_shared<DomNode>(std::get<2>(id_tuple),
                                                      std::get<2>(pid_tuple),
                                                      std::get<2>(index_tuple)));
      }
      builder->Delete(weak_dom_manager, std::move(dom_nodes));
    }
    return nullptr;
  };
  def.functions.emplace_back(std::move(delete_func_def));

  FunctionDefine<SceneBuilder> add_event_listener_def;
  add_event_listener_def.name = "AddEventListener";
  add_event_listener_def.cb = [weak_scope](
      SceneBuilder* builder,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[]) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (scope) {
      hippy::dom::EventListenerInfo listener_info;
      HandleEventListenerInfo(scope->GetContext(), argument_count, arguments, listener_info);
      builder->AddEventListener(scope, listener_info);
    }
    return nullptr;
  };
  def.functions.emplace_back(std::move(add_event_listener_def));

  // TODO remove event listener
  FunctionDefine<SceneBuilder> remove_event_listener_def;
  remove_event_listener_def.name = "RemoveEventListener";
  remove_event_listener_def.cb = [weak_scope](
      SceneBuilder* builder,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[]) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (scope) {
      hippy::dom::EventListenerInfo listener_info;
      HandleEventListenerInfo(scope->GetContext(), argument_count, arguments, listener_info);
      builder->RemoveEventListener(scope, listener_info);
    }
    return nullptr;
  };
  def.functions.emplace_back(std::move(remove_event_listener_def));


  FunctionDefine<SceneBuilder> build_func_def;
  build_func_def.name = "Build";
  build_func_def.cb = [weak_scope](
      SceneBuilder* builder,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[]) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (scope) {
      auto weak_dom_manager = scope->GetDomManager();
      auto screen = builder->Build(weak_dom_manager);
      auto dom_manager = weak_dom_manager.lock();
      if (dom_manager) {
        dom_manager->PostTask([screen]() {
          screen.Build();
        });
      }
    }
    return nullptr;
  };
  def.functions.emplace_back(std::move(build_func_def));

  std::shared_ptr<InstanceDefine<SceneBuilder>> build = std::make_shared<
      InstanceDefine<SceneBuilder>>(def);
  auto scope = weak_scope.lock();
  if (scope) {
    scope->SaveClassInstance(build);
  }

  return build;
}

}


