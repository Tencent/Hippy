  /*
 *
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
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#include "driver/modules/scene_builder_module.h"

#include "dom/node_props.h"
#include "driver/base/js_convert_utils.h"
#include "driver/modules/scene_builder_module.h"
#include "driver/modules/ui_manager_module.h"
#include "driver/scope.h"
#include "footstone/logging.h"
#include "footstone/string_view.h"
#include "footstone/string_view_utils.h"

template <typename T>
using ClassTemplate = hippy::ClassTemplate<T>;

template <typename T>
using FunctionDefine = hippy::FunctionDefine<T>;

using HippyValue = footstone::value::HippyValue;
using DomArgument = hippy::dom::DomArgument;
using string_view = footstone::stringview::string_view;
using StringViewUtils = footstone::stringview::StringViewUtils;
using Ctx = hippy::napi::Ctx;
using CtxValue = hippy::napi::CtxValue;
using CallbackInfo = hippy::napi::CallbackInfo;
using DomEvent = hippy::dom::DomEvent;
using DomManager = hippy::dom::DomManager;
using DomNode = hippy::dom::DomNode;
using RefInfo = hippy::dom::RefInfo;
using DomInfo = hippy::dom::DomInfo;
using RegisterFunction = hippy::base::RegisterFunction;
using RegisterMap = hippy::base::RegisterMap;

constexpr char kNodePropertyPid[] = "pId";
constexpr char kNodePropertyIndex[] = "index";
constexpr char kNodePropertyViewName[] = "name";
constexpr char kNodePropertyTagName[] = "tagName";
constexpr char kNodePropertyProps[] = "props";
constexpr char kNodePropertyStyle[] = "style";
constexpr char kNodePropertyRefId[] = "refId";
constexpr char kNodePropertyRelativeToRef[] = "relativeToRef";
constexpr char KNodePropertySkipStyleDiff[] = "skipStyleDiff";
constexpr char kEventCapture[] = "capture";

const int32_t kInvalidValue = -1;

using CtxValue = hippy::napi::CtxValue;

namespace hippy {
inline namespace driver {
inline namespace module {

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

std::tuple<bool, std::string, string_view>
GetNodeViewName(const std::shared_ptr<Ctx> &context,
                const std::shared_ptr<CtxValue> &node) {
  // parse view_name
  std::shared_ptr<CtxValue> view_name_value = context->GetProperty(node, kNodePropertyViewName);
  if (!view_name_value) {
    return std::make_tuple(false, "Get property view name failed", "");
  }
  string_view view_name;
  bool flag = context->GetValueString(view_name_value, &view_name);
  if (!flag) {
    return std::make_tuple(false, "Get view name value failed", "");
  }
  return std::make_tuple(true, "", std::move(view_name));
}

std::tuple<bool, std::string, string_view>
GetNodeTagName(const std::shared_ptr<Ctx> &context,
               const std::shared_ptr<CtxValue> &node) {
  // parse tag_name
  std::shared_ptr<CtxValue> tag_name_value = context->GetProperty(node, kNodePropertyTagName);
  if (!tag_name_value) {
    return std::make_tuple(false, "Get property tag name failed", "");
  }
  string_view tag_name;
  bool flag = context->GetValueString(tag_name_value, &tag_name);
  if (!flag) {
    return std::make_tuple(false, "Get tag name value failed", "");
  }
  return std::make_tuple(true, "", std::move(tag_name));
}

std::tuple<bool, std::string, std::unordered_map<std::string, std::shared_ptr<HippyValue>>>
GetNodeStyle(const std::shared_ptr<Ctx> &context,
             std::unordered_map<std::string, HippyValue> &props) {
  std::unordered_map<std::string, std::shared_ptr<HippyValue>> ret;
  // parse style
  auto style_it = props.find(kNodePropertyStyle);
  if (style_it != props.end()) {
    if (style_it->second.IsObject()) {
      std::unordered_map<std::string, HippyValue> style_obj = style_it->second.ToObjectChecked();
      for (const auto &p : style_obj) {
        ret[p.first] = std::make_shared<HippyValue>(p.second);
      }
    }
    props.erase(style_it);
    return std::make_tuple(true, "", std::move(ret));
  }
  return std::make_tuple(false, "props does not contain style", std::move(ret));
}

std::tuple<bool, std::string,
           std::unordered_map<std::string, std::shared_ptr<HippyValue>>>
GetNodeExtValue(const std::shared_ptr<Ctx> &context,
                std::unordered_map<std::string, HippyValue> &props) {
  std::unordered_map<std::string, std::shared_ptr<HippyValue>> dom_ext_map;
  // parse ext value
  for (const auto &p : props) {
    dom_ext_map[p.first] = std::make_shared<HippyValue>(p.second);
  }
  return std::make_tuple(true, "", std::move(dom_ext_map));
}

std::tuple<bool, std::string,
           std::unordered_map<std::string, std::shared_ptr<HippyValue>>,
           std::unordered_map<std::string, std::shared_ptr<HippyValue>>>
GetNodeProps(const std::shared_ptr<Ctx> &context, const std::shared_ptr<CtxValue> &node) {
  std::unordered_map<std::string, std::shared_ptr<HippyValue>> style_map;
  std::unordered_map<std::string, std::shared_ptr<HippyValue>> dom_ext_map;
  std::shared_ptr<CtxValue> props = context->GetProperty(node, kNodePropertyProps);
  if (!props) {
    return std::make_tuple(false, "node does not contain props",
                           std::move(style_map),
                           std::move(dom_ext_map));
  }
  std::shared_ptr<HippyValue> props_obj = hippy::ToDomValue(context, props);
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

  std::unordered_map<std::string, HippyValue> props_map = props_obj->ToObjectChecked();
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

std::tuple<bool, std::string, int32_t> GetNodeRefId(
    const std::shared_ptr<Ctx> &context,
    const std::shared_ptr<CtxValue> &node) {
  std::shared_ptr<CtxValue> id_value =
      context->GetProperty(node, kNodePropertyRefId);
  if (!id_value) {
    return std::make_tuple(false, "Get property ref id failed", kInvalidValue);
  }
  int32_t id;
  bool flag = context->GetValueNumber(id_value, &id);
  if (!flag) {
    return std::make_tuple(false, "Get ref id value failed", kInvalidValue);
  }
  return std::make_tuple(true, "", id);
}

std::tuple<bool, std::string, int32_t> GetNodeRelativeToRef(
    const std::shared_ptr<Ctx> &context,
    const std::shared_ptr<CtxValue> &node) {
  std::shared_ptr<CtxValue> id_value =
      context->GetProperty(node, kNodePropertyRelativeToRef);
  if (!id_value) {
    return std::make_tuple(false, "Get relative to ref failed", kInvalidValue);
  }
  int32_t id;
  bool flag = context->GetValueNumber(id_value, &id);
  if (!flag) {
    return std::make_tuple(false, "Get relative to ref value failed", kInvalidValue);
  }
  return std::make_tuple(true, "", id);
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

  auto view_name_tuple = GetNodeViewName(context, node);
  if (!std::get<0>(view_name_tuple)) {
    return std::make_tuple(false, std::get<1>(view_name_tuple), dom_node);
  }

  // optional, only js use development
  auto tag_name_tuple = GetNodeTagName(context, node);

  auto props_tuple = GetNodeProps(context, node);

  // create node
  std::string u8_tag_name = StringViewUtils::ToStdString(
      StringViewUtils::ConvertEncoding(std::get<2>(tag_name_tuple),
          string_view::Encoding::Utf8).utf8_value());
  std::string u8_view_name = StringViewUtils::ToStdString(
      StringViewUtils::ConvertEncoding(std::get<2>(view_name_tuple),
          string_view::Encoding::Utf8).utf8_value());
  auto style = std::make_shared<std::unordered_map<std::string, std::shared_ptr<HippyValue>>>(
      std::move(std::get<2>(props_tuple)));
  auto ext = std::make_shared<std::unordered_map<std::string, std::shared_ptr<HippyValue>>>(
      std::move(std::get<3>(props_tuple)));
  FOOTSTONE_CHECK(!scope->GetDomManager().expired());
  dom_node = std::make_shared<DomNode>(std::get<2>(id_tuple),
                                       std::get<2>(pid_tuple),
                                       0,
                                       std::move(u8_tag_name),
                                       std::move(u8_view_name),
                                       style,
                                       ext,
                                       scope->GetRootNode());
  return std::make_tuple(true, "", dom_node);
}

std::tuple<bool, std::string, std::shared_ptr<RefInfo>> CreateRefInfo(
    const std::shared_ptr<Ctx> &context,
    const std::shared_ptr<CtxValue> &node,
    const std::shared_ptr<Scope> &scope) {
  std::shared_ptr<RefInfo> ref_info = nullptr;
  auto ref_id_tuple = GetNodeRefId(context, node);
  if (!std::get<0>(ref_id_tuple)) {
    return std::make_tuple(false, std::get<1>(ref_id_tuple), ref_info);
  }

  auto relative_to_ref_tuple = GetNodeRelativeToRef(context, node);
  if (!std::get<0>(relative_to_ref_tuple)) {
    return std::make_tuple(false, std::get<1>(relative_to_ref_tuple), ref_info);
  }
  ref_info = std::make_shared<RefInfo>(std::get<2>(ref_id_tuple),
                                       std::get<2>(relative_to_ref_tuple));
  return std::make_tuple(true, "", ref_info);
}

std::tuple<bool, std::string, std::shared_ptr<DomInfo>> CreateDomInfo(
    const std::shared_ptr<Ctx> &context,
    const std::shared_ptr<CtxValue> &node,
    const std::shared_ptr<Scope> &scope) {
  std::shared_ptr<DomInfo> dom_info = nullptr;
  std::shared_ptr<DomNode> dom_node = nullptr;
  std::shared_ptr<RefInfo> ref_info = nullptr;
  std::shared_ptr<DiffInfo> diff_info = nullptr;
  uint32_t len = context->GetArrayLength(node);
  if (len > 0) {
    auto dom_node_tuple =
        CreateNode(context, context->CopyArrayElement(node, 0), scope);
    if (!std::get<0>(dom_node_tuple)) {
      return std::make_tuple(false, "get dom node info error.", dom_info);
    }
    dom_node = std::get<2>(dom_node_tuple);
    if (len > 1) {
      auto ref_info_tuple =
          CreateRefInfo(context, context->CopyArrayElement(node, 1), scope);
      if (std::get<0>(ref_info_tuple)) {
        ref_info = std::get<2>(ref_info_tuple);
      }
    }
    if (len == 3) {
      auto diff = context->CopyArrayElement(node, 2);
      std::shared_ptr<CtxValue> style_diff  = context->GetProperty(diff, KNodePropertySkipStyleDiff);
      if (style_diff) {
          bool skip_style_diff;
          context->GetValueBoolean(style_diff, &skip_style_diff);
          diff_info = std::make_shared<hippy::dom::DiffInfo>(skip_style_diff);
      }
    }
  } else {
    return std::make_tuple(false, "dom info length error.", dom_info);
  }
  dom_info = std::make_shared<DomInfo>(dom_node, ref_info, diff_info);
  return std::make_tuple(true, "", dom_info);
}

std::tuple<bool, std::string, std::vector<std::shared_ptr<DomInfo>>> HandleJsValue(
    const std::shared_ptr<Ctx> &context,
    const std::shared_ptr<CtxValue> &nodes,
    const std::shared_ptr<Scope> &scope) {
  uint32_t len = context->GetArrayLength(nodes);
  std::vector<std::shared_ptr<DomInfo>> dom_nodes;
  for (uint32_t i = 0; i < len; ++i) {
    std::shared_ptr<CtxValue> domInfo = context->CopyArrayElement(nodes, i);
    auto tuple = CreateDomInfo(context, domInfo, scope);
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
                             Scope::EventListenerInfo& listener_info) {
  FOOTSTONE_DCHECK(argument_count == 4 || argument_count == 3);

  int32_t dom_id;
  bool ret = context->GetValueNumber(arguments[0], &dom_id);
  FOOTSTONE_CHECK(ret) << "get dom id failed";

  footstone::stringview::string_view str_view;
  ret = context->GetValueString(arguments[1], &str_view);
  std::string event_name = StringViewUtils::ToStdString(StringViewUtils::ConvertEncoding(
      str_view, string_view::Encoding::Utf8).utf8_value());
  FOOTSTONE_DCHECK(ret) << "get event name failed";

  listener_info.dom_id = static_cast<uint32_t>(dom_id);
  listener_info.event_name = event_name;
  listener_info.callback = arguments[2];

  bool use_capture = false;
  if (argument_count == 3) {
    use_capture = false;
  } else if (argument_count == 4) {
    auto capture_parameter = arguments[3];
    // capture support pass object { capture: bool }
    if (context->IsObject(arguments[3])) {
      capture_parameter = context->GetProperty(arguments[3], kEventCapture);
      FOOTSTONE_DCHECK(capture_parameter != nullptr);
    }
    ret = context->GetValueBoolean(capture_parameter, &use_capture);
    FOOTSTONE_DCHECK(ret) << "get use capture failed";
  }
  listener_info.use_capture = use_capture;
}

std::shared_ptr<ClassTemplate<SceneBuilder>> RegisterSceneBuilder(const std::weak_ptr<Scope>& weak_scope) {
  using SceneBuilder = hippy::dom::SceneBuilder;
  ClassTemplate<SceneBuilder> class_template;
  class_template.name = "SceneBuilder";
  class_template.constructor = [](
      const std::shared_ptr<CtxValue>& receiver,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[],
      void* external,
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<SceneBuilder> {
    return std::make_shared<SceneBuilder>();
  };

  FunctionDefine<SceneBuilder> create_func_def;
  create_func_def.name = "create";
  create_func_def.callback = [weak_scope](
      SceneBuilder* builder,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[],
      std::shared_ptr<CtxValue>&) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (!scope || scope->GetRootNode().expired() || scope->GetDomManager().expired()) {
      return nullptr;
    }
    auto nodes = HandleJsValue(scope->GetContext(), arguments[0], scope);
    bool needSortByIndex = false;
    if (argument_count == 2) {
       scope->GetContext()->GetValueBoolean(arguments[1], &needSortByIndex);
    }
    SceneBuilder::Create(scope->GetDomManager(), scope->GetRootNode(), std::move(std::get<2>(nodes)), needSortByIndex);
    return nullptr;
  };
  class_template.functions.emplace_back(std::move(create_func_def));

  FunctionDefine<SceneBuilder> update_func_def;
  update_func_def.name = "update";
  update_func_def.callback = [weak_scope](
      SceneBuilder* builder,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[],
      std::shared_ptr<CtxValue>&) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (!scope || scope->GetRootNode().expired() || scope->GetDomManager().expired()) {
      return nullptr;
    }
    auto ret = HandleJsValue(scope->GetContext(), arguments[0], scope);
    SceneBuilder::Update(scope->GetDomManager(), scope->GetRootNode(), std::move(std::get<2>(ret)));

    return nullptr;
  };
  class_template.functions.emplace_back(std::move(update_func_def));

  FunctionDefine<SceneBuilder> move_func_def;
  move_func_def.name = "move";
  move_func_def.callback = [weak_scope](SceneBuilder *builder, size_t argument_count,
                                        const std::shared_ptr<CtxValue> arguments[],
                                        std::shared_ptr<CtxValue>&)
      -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (!scope || scope->GetRootNode().expired() || scope->GetDomManager().expired()) {
      return nullptr;
    }
    auto weak_dom_manager = scope->GetDomManager();
    std::shared_ptr<CtxValue> nodes = arguments[0];
    std::shared_ptr<Ctx> context = scope->GetContext();
    FOOTSTONE_CHECK(context);
    auto len = context->GetArrayLength(nodes);
    std::vector<std::shared_ptr<DomInfo>> dom_infos;
    for (uint32_t i = 0; i < len; ++i) {
      std::shared_ptr<CtxValue> info = context->CopyArrayElement(nodes, i);
      auto length = context->GetArrayLength(info);
      if (length > 0) {
        auto node = context->CopyArrayElement(info, 0);
        auto id_tuple = GetNodeId(context, node);
        if (!std::get<0>(id_tuple)) {
          return nullptr;
        }

        auto pid_tuple = GetNodePid(context, node);
        if (!std::get<0>(pid_tuple)) {
          return nullptr;
        }
        if (length >= 2) {
          auto ref_info_tuple = CreateRefInfo(
              context, context->CopyArrayElement(info, 1), scope);
          dom_infos.push_back(std::make_shared<DomInfo>(
              std::make_shared<DomNode>(
                  std::get<2>(id_tuple),
                  std::get<2>(pid_tuple),
                  scope->GetRootNode()),
              std::get<2>(ref_info_tuple),
              nullptr));
        }
      }
    }
    SceneBuilder::Move(weak_dom_manager, scope->GetRootNode(), std::move(dom_infos));
    return nullptr;
  };
  class_template.functions.emplace_back(std::move(move_func_def));

  FunctionDefine<SceneBuilder> delete_func_def;
  delete_func_def.name = "delete";
  delete_func_def.callback = [weak_scope](
      SceneBuilder* builder,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[],
      std::shared_ptr<CtxValue>&) -> std::shared_ptr<CtxValue> {

    auto scope = weak_scope.lock();
    if (!scope || scope->GetRootNode().expired() || scope->GetDomManager().expired()) {
      return nullptr;
    }
    auto nodes = arguments[0];
    auto context = scope->GetContext();
    FOOTSTONE_CHECK(context);
    auto len = context->GetArrayLength(nodes);
    std::vector<std::shared_ptr<DomInfo>> dom_infos;
    for (uint32_t i = 0; i < len; ++i) {
      std::shared_ptr<CtxValue> info = context->CopyArrayElement(nodes, i);
      auto length = context->GetArrayLength(info);
      if (length > 0) {
        auto node = context->CopyArrayElement(info, 0);
        auto id_tuple = GetNodeId(context, node);
        if (!std::get<0>(id_tuple)) {
          return nullptr;
        }

        auto pid_tuple = GetNodePid(context, node);
        if (!std::get<0>(pid_tuple)) {

          return nullptr;
        }
        dom_infos.push_back(std::make_shared<DomInfo>(
            std::make_shared<DomNode>(
                std::get<2>(id_tuple),
                std::get<2>(pid_tuple),
                scope->GetRootNode()),
            nullptr, nullptr));
      }
    }
    SceneBuilder::Delete(scope->GetDomManager(), scope->GetRootNode(), std::move(dom_infos));

    return nullptr;
  };
  class_template.functions.emplace_back(std::move(delete_func_def));

  FunctionDefine<SceneBuilder> add_event_listener_def;
  add_event_listener_def.name = "addEventListener";
  add_event_listener_def.callback = [weak_scope](
      SceneBuilder* builder,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[],
      std::shared_ptr<CtxValue>&) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (!scope || scope->GetRootNode().expired() || scope->GetDomManager().expired()) {
      return nullptr;
    }
    Scope::EventListenerInfo listener_info;
    HandleEventListenerInfo(scope->GetContext(), argument_count, arguments, listener_info);
    auto dom_listener_info = scope->AddListener(listener_info);
    SceneBuilder::AddEventListener(scope->GetDomManager(), scope->GetRootNode(), dom_listener_info);
    return nullptr;
  };
  class_template.functions.emplace_back(std::move(add_event_listener_def));

  FunctionDefine<SceneBuilder> remove_event_listener_def;
  remove_event_listener_def.name = "removeEventListener";
  remove_event_listener_def.callback = [weak_scope](
      SceneBuilder* builder,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[],
      std::shared_ptr<CtxValue>&) -> std::shared_ptr<CtxValue> {

    auto scope = weak_scope.lock();
    if (!scope || scope->GetRootNode().expired() || scope->GetDomManager().expired()) {
      return nullptr;
    }
    Scope::EventListenerInfo listener_info;
    HandleEventListenerInfo(scope->GetContext(), argument_count, arguments, listener_info);
    auto dom_listener_info = scope->RemoveListener(listener_info);
    SceneBuilder::RemoveEventListener(scope->GetDomManager(), scope->GetRootNode(), dom_listener_info);
    return nullptr;
  };
  class_template.functions.emplace_back(std::move(remove_event_listener_def));


  FunctionDefine<SceneBuilder> build_func_def;
  build_func_def.name = "build";
  build_func_def.callback = [weak_scope](
      SceneBuilder* builder,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[],
      std::shared_ptr<CtxValue>&) -> std::shared_ptr<CtxValue> {
    TDF_PERF_LOG("SceneBuilder.build()");
    auto scope = weak_scope.lock();
    if (!scope || scope->GetRootNode().expired() || scope->GetDomManager().expired()) {
      TDF_PERF_LOG("SceneBuilder.build() exit with error");
      return nullptr;
    }
    SceneBuilder::Build(scope->GetDomManager(), scope->GetRootNode());
    TDF_PERF_LOG("SceneBuilder.build() End");
    return nullptr;
  };
  class_template.functions.emplace_back(std::move(build_func_def));

  return std::make_shared<ClassTemplate<SceneBuilder>>(std::move(class_template));
}

}
}
}
