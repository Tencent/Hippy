/*
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

#include <ace/xcomponent/native_interface_xcomponent.h>
#include <arkui/native_node_napi.h>
#include "renderer/native_render_provider_capi.h"
#include "oh_napi/oh_napi_utils.h"
#include "renderer/native_render_manager.h"
#include "oh_napi/ark_ts.h"
#include "oh_napi/oh_napi_object.h"
#include "oh_napi/oh_napi_object_builder.h"
#include "oh_napi/oh_napi_task_runner.h"
#include "oh_napi/oh_napi_invocation.h"
#include "oh_napi/oh_napi_register.h"
#include "footstone/hippy_value.h"
#include "dom/render_manager.h"
#include "dom/root_node.h"
#include "dom/scene.h"

using DomArgument = hippy::dom::DomArgument;
using DomEvent = hippy::dom::DomEvent;
using DomManager = hippy::dom::DomManager;
using HippyValue = footstone::value::HippyValue;
using NativeRenderManager = hippy::render::native::NativeRenderManager;
using RenderManager = hippy::dom::RenderManager;
using RootNode = hippy::dom::RootNode;
using Scene = hippy::dom::Scene;

namespace hippy {
inline namespace framework {
inline namespace renderer {
inline namespace native {

void NativeRenderProvider_UpdateRootSize(uint32_t render_manager_id, uint32_t root_id, float width, float height) {
  auto &map = NativeRenderManager::PersistentMap();
  std::shared_ptr<NativeRenderManager> render_manager;
  bool ret = map.Find(render_manager_id, render_manager);
  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "UpdateRootSize render_manager_id invalid";
    return;
  }

  auto &root_map = RootNode::PersistentMap();
  std::shared_ptr<RootNode> root_node;
  ret = root_map.Find(root_id, root_node);
  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "UpdateRootSize root_node is nullptr";
    return;
  }
  
  std::shared_ptr<DomManager> dom_manager = root_node->GetDomManager().lock();
  if (dom_manager == nullptr) {
    FOOTSTONE_DLOG(WARNING) << "UpdateRootSize dom_manager is nullptr";
    return;
  }

  std::vector<std::function<void()>> ops;
  ops.emplace_back([dom_manager, root_node, width, height] {
    FOOTSTONE_LOG(INFO) << "update root size width = " << width << ", height = " << height << std::endl;
    dom_manager->SetRootSize(root_node, width, height);
    dom_manager->DoLayout(root_node);
    dom_manager->EndBatch(root_node);
  });
  dom_manager->PostTask(Scene(std::move(ops)));
}

void NativeRenderProvider_UpdateNodeSize(uint32_t render_manager_id, uint32_t root_id, uint32_t node_id, float width, float height) {
  auto &map = NativeRenderManager::PersistentMap();
  std::shared_ptr<NativeRenderManager> render_manager;
  bool ret = map.Find(render_manager_id, render_manager);
  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "UpdateNodeSize render_manager_id invalid";
    return;
  }
  
  auto &root_map = RootNode::PersistentMap();
  std::shared_ptr<RootNode> root_node;
  ret = root_map.Find(root_id, root_node);
  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "UpdateNodeSize root_node is nullptr";
    return;
  }
  
  std::shared_ptr<DomManager> dom_manager = root_node->GetDomManager().lock();
  if (dom_manager == nullptr) {
    FOOTSTONE_DLOG(WARNING) << "UpdateNodeSize dom_manager is nullptr";
    return;
  }

  auto node = dom_manager->GetNode(root_node, node_id);
  if (node == nullptr) {
    FOOTSTONE_DLOG(WARNING) << "UpdateNodeSize DomNode not found for id: " << node_id;
    return;
  }

  std::unordered_map<std::string, std::shared_ptr<HippyValue>> update_style;
  std::shared_ptr<HippyValue> width_value = std::make_shared<HippyValue>(width);
  std::shared_ptr<HippyValue> height_value = std::make_shared<HippyValue>(height);
  update_style.insert({"width", width_value});
  update_style.insert({"height", height_value});

  std::vector<std::function<void()>> ops = {[dom_manager, root_node, node, update_style] {
    node->UpdateDomNodeStyleAndParseLayoutInfo(update_style);
    dom_manager->EndBatch(root_node);
  }};
  dom_manager->PostTask(Scene(std::move(ops)));
}

void NativeRenderProvider_OnReceivedEvent(uint32_t render_manager_id, uint32_t root_id, uint32_t node_id,
            const std::string &event_name, const std::shared_ptr<HippyValue> &params, bool capture, bool bubble) {
  auto &map = NativeRenderManager::PersistentMap();
  std::shared_ptr<NativeRenderManager> render_manager;
  bool ret = map.Find(render_manager_id, render_manager);
  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "OnReceivedEvent render_manager_id invalid";
    return;
  }

  auto &root_map = RootNode::PersistentMap();
  std::shared_ptr<RootNode> root_node;
  ret = root_map.Find(root_id, root_node);
  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "OnReceivedEvent root_node is nullptr";
    return;
  }

  render_manager->ReceivedEvent(root_node, node_id, event_name, params, capture, bubble);
}

void NativeRenderProvider_DoCallBack(uint32_t render_manager_id, int32_t result, const std::string &func_name,
            uint32_t root_id, uint32_t node_id, uint32_t cb_id, const HippyValue &params) {
  auto &map = NativeRenderManager::PersistentMap();
  std::shared_ptr<NativeRenderManager> render_manager;
  bool ret = map.Find(render_manager_id, render_manager);
  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "DoCallBack render_manager_id invalid";
    return;
  }
  
  auto &root_map = RootNode::PersistentMap();
  std::shared_ptr<RootNode> root_node;
  ret = root_map.Find(root_id, root_node);
  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "DoCallBack root_node is nullptr";
    return;
  }

  std::shared_ptr<DomManager> dom_manager = root_node->GetDomManager().lock();
  if (dom_manager == nullptr) {
    FOOTSTONE_DLOG(WARNING) << "DoCallBack dom_manager is nullptr";
    return;
  }

  std::vector<std::function<void()>> ops = {[root_id, node_id, cb_id, func_name, dom_manager, params] {
    auto &root_map = RootNode::PersistentMap();
    std::shared_ptr<RootNode> root_node;
    bool ret = root_map.Find(root_id, root_node);
    if (!ret) {
      FOOTSTONE_DLOG(WARNING) << "DoCallBack root_node is nullptr";
      return;
    }

    auto node = dom_manager->GetNode(root_node, node_id);
    if (node == nullptr) {
      FOOTSTONE_DLOG(WARNING) << "DoCallBack DomNode not found for id: " << node_id;
      return;
    }

    auto callback = node->GetCallback(func_name, cb_id);
    if (callback == nullptr) {
      FOOTSTONE_DLOG(WARNING) << "DoCallBack Callback not found for func_name: " << func_name;
      return;
    }

    callback(std::make_shared<DomArgument>(params));
  }};
  dom_manager->PostTask(Scene(std::move(ops)));
}

napi_value BindNativeRoot(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info);

  // NodeContent
  ArkUI_NodeContentHandle contentHandle = nullptr;
  auto code = OH_ArkUI_GetNodeContentFromNapiValue(env, args[0], &contentHandle);
  if (code != ARKUI_ERROR_CODE_NO_ERROR || !contentHandle) {
    return arkTs.GetUndefined();
  }

  uint32_t render_manager_id = static_cast<uint32_t>(arkTs.GetInteger(args[1]));
  uint32_t root_id = static_cast<uint32_t>(arkTs.GetInteger(args[2]));
  uint32_t node_id = static_cast<uint32_t>(arkTs.GetInteger(args[3]));

  auto &map = NativeRenderManager::PersistentMap();
  std::shared_ptr<NativeRenderManager> render_manager;
  bool ret = map.Find(render_manager_id, render_manager);
  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "BindRoot: render_manager_id invalid";
    return arkTs.GetUndefined();
  }

  render_manager->BindNativeRoot(contentHandle, root_id, node_id);

  return arkTs.GetUndefined();
}

napi_value UnbindNativeRoot(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info);
  uint32_t render_manager_id = static_cast<uint32_t>(arkTs.GetInteger(args[0]));
  uint32_t root_id = static_cast<uint32_t>(arkTs.GetInteger(args[1]));
  uint32_t node_id = static_cast<uint32_t>(arkTs.GetInteger(args[2]));

  auto &map = NativeRenderManager::PersistentMap();
  std::shared_ptr<NativeRenderManager> render_manager;
  bool ret = map.Find(render_manager_id, render_manager);
  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "UnbindRoot: render_manager_id invalid";
    return arkTs.GetUndefined();
  }

  render_manager->UnbindNativeRoot(root_id, node_id);

  return arkTs.GetUndefined();
}

static napi_value DestroyRoot(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info);
  uint32_t render_manager_id = static_cast<uint32_t>(arkTs.GetInteger(args[0]));
  uint32_t root_id = static_cast<uint32_t>(arkTs.GetInteger(args[1]));

  auto &map = NativeRenderManager::PersistentMap();
  std::shared_ptr<NativeRenderManager> render_manager;
  bool ret = map.Find(render_manager_id, render_manager);
  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "DestroyRoot: render_manager_id invalid";
    return arkTs.GetUndefined();
  }

  render_manager->DestroyRoot(root_id);

  return arkTs.GetUndefined();
}

static napi_value DoCallbackForCallCustomTsView(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info);
  uint32_t render_manager_id = static_cast<uint32_t>(arkTs.GetInteger(args[0]));
  uint32_t root_id = static_cast<uint32_t>(arkTs.GetInteger(args[1]));
  uint32_t node_id = static_cast<uint32_t>(arkTs.GetInteger(args[2]));
  uint32_t callback_id = static_cast<uint32_t>(arkTs.GetInteger(args[3]));
  auto ts_result = args[4];
  auto result = OhNapiUtils::NapiValue2HippyValue(env, ts_result);

  auto &map = NativeRenderManager::PersistentMap();
  std::shared_ptr<NativeRenderManager> render_manager;
  bool ret = map.Find(render_manager_id, render_manager);
  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "DoCallbackForCall: render_manager_id invalid";
    return arkTs.GetUndefined();
  }

  render_manager->DoCallbackForCallCustomTsView(root_id, node_id, callback_id, result);

  return arkTs.GetUndefined();
}

static napi_value GetViewParent(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info);
  uint32_t render_manager_id = static_cast<uint32_t>(arkTs.GetInteger(args[0]));
  uint32_t root_id = static_cast<uint32_t>(arkTs.GetInteger(args[1]));
  uint32_t node_id = static_cast<uint32_t>(arkTs.GetInteger(args[2]));

  auto &map = NativeRenderManager::PersistentMap();
  std::shared_ptr<NativeRenderManager> render_manager;
  bool ret = map.Find(render_manager_id, render_manager);
  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "GetViewParent: render_manager_id invalid";
    return arkTs.GetNull();
  }

  uint32_t parent_id = 0;
  std::string parent_view_type;
  ret = render_manager->GetViewParent(root_id, node_id, parent_id, parent_view_type);
  if (ret) {
    auto params_builder = arkTs.CreateObjectBuilder();
    params_builder.AddProperty("tag", parent_id);
    params_builder.AddProperty("viewName", parent_view_type);
    return params_builder.Build();
  }

  return arkTs.GetNull();
}

static napi_value GetViewChildren(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info);
  uint32_t render_manager_id = static_cast<uint32_t>(arkTs.GetInteger(args[0]));
  uint32_t root_id = static_cast<uint32_t>(arkTs.GetInteger(args[1]));
  uint32_t node_id = static_cast<uint32_t>(arkTs.GetInteger(args[2]));

  auto &map = NativeRenderManager::PersistentMap();
  std::shared_ptr<NativeRenderManager> render_manager;
  bool ret = map.Find(render_manager_id, render_manager);
  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "GetViewChildren: render_manager_id invalid";
    return arkTs.GetNull();
  }

  std::vector<uint32_t> children_ids;
  std::vector<std::string> children_view_types;
  ret = render_manager->GetViewChildren(root_id, node_id, children_ids, children_view_types);
  if (ret) {
    std::vector<napi_value> children;
    for (int i = 0; i < (int)children_ids.size(); i++) {
      auto params_builder = arkTs.CreateObjectBuilder();
      params_builder.AddProperty("tag", children_ids[(size_t)i]);
      params_builder.AddProperty("viewName", children_view_types[(size_t)i]);
      children.push_back(params_builder.Build());
    }
    return arkTs.CreateArray(children);
  }

  return arkTs.GetNull();
}

static napi_value CallViewMethod(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info);
  uint32_t render_manager_id = static_cast<uint32_t>(arkTs.GetInteger(args[0]));
  uint32_t root_id = static_cast<uint32_t>(arkTs.GetInteger(args[1]));
  uint32_t node_id = static_cast<uint32_t>(arkTs.GetInteger(args[2]));
  std::string method = arkTs.GetString(args[3]);

  std::vector<HippyValue> params;
  auto ts_params = args[4];
  if (arkTs.IsArray(ts_params)) {
    auto length = arkTs.GetArrayLength(ts_params);
    if (length > 0) {
      for (uint32_t i = 0; i < length; i ++) {
        auto ts_param = arkTs.GetArrayElement(ts_params, i);
        auto param = OhNapiUtils::NapiValue2HippyValue(env, ts_param);
        params.push_back(param);
      }
    }
  }

  auto ts_callback = args[5];
  napi_ref callback_ref = 0;
  if (arkTs.GetType(ts_callback) == napi_function) {
    callback_ref = arkTs.CreateReference(ts_callback);
  }

  auto &map = NativeRenderManager::PersistentMap();
  std::shared_ptr<NativeRenderManager> render_manager;
  bool ret = map.Find(render_manager_id, render_manager);
  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "CallViewMethod: render_manager_id invalid";
    return arkTs.GetUndefined();
  }

  std::function<void(const HippyValue &result)> cb = [env, callback_ref](const HippyValue &result) {
    ArkTS arkTs(env);
    std::vector<napi_value> args = {
      OhNapiUtils::HippyValue2NapiValue(env, result)
    };
    auto callback = arkTs.GetReferenceValue(callback_ref);
    arkTs.Call(callback, args);
    arkTs.DeleteReference(callback_ref);
  };

  render_manager->CallViewMethod(root_id, node_id, method, params, callback_ref ? cb : nullptr);
  return arkTs.GetUndefined();
}

static napi_value SetViewEventListener(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);

  auto args = arkTs.GetCallbackArgs(info);
  uint32_t render_manager_id = static_cast<uint32_t>(arkTs.GetInteger(args[0]));
  uint32_t root_id = static_cast<uint32_t>(arkTs.GetInteger(args[1]));
  uint32_t node_id = static_cast<uint32_t>(arkTs.GetInteger(args[2]));

  auto ts_callback = args[3];
  napi_ref callback_ref = 0;
  if (arkTs.GetType(ts_callback) == napi_function) {
    callback_ref = arkTs.CreateReference(ts_callback);
  }

  auto &map = NativeRenderManager::PersistentMap();
  std::shared_ptr<NativeRenderManager> render_manager;
  bool ret = map.Find(render_manager_id, render_manager);
  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "SetViewEventListener: render_manager_id invalid";
    return arkTs.GetUndefined();
  }

  render_manager->SetViewEventListener(root_id, node_id, callback_ref);

  return arkTs.GetUndefined();
}

static napi_value GetViewFrameInRoot(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info);
  uint32_t render_manager_id = static_cast<uint32_t>(arkTs.GetInteger(args[0]));
  uint32_t root_id = static_cast<uint32_t>(arkTs.GetInteger(args[1]));
  uint32_t node_id = static_cast<uint32_t>(arkTs.GetInteger(args[2]));

  auto &map = NativeRenderManager::PersistentMap();
  std::shared_ptr<NativeRenderManager> render_manager;
  bool ret = map.Find(render_manager_id, render_manager);
  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "GetViewFrameInRoot: render_manager_id invalid";
    return arkTs.GetNull();
  }

  HRRect rect = render_manager->GetViewFrameInRoot(root_id, node_id);
  auto params_builder = arkTs.CreateObjectBuilder();
  params_builder.AddProperty("x", rect.x);
  params_builder.AddProperty("y", rect.y);
  params_builder.AddProperty("width", rect.width);
  params_builder.AddProperty("height", rect.height);
  return params_builder.Build();
}

static napi_value AddBizViewInRoot(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);

  auto args = arkTs.GetCallbackArgs(info);
  uint32_t render_manager_id = static_cast<uint32_t>(arkTs.GetInteger(args[0]));
  uint32_t root_id = static_cast<uint32_t>(arkTs.GetInteger(args[1]));
  uint32_t biz_view_id = static_cast<uint32_t>(arkTs.GetInteger(args[2]));
  napi_value ts_node = args[3];

  napi_handle_scope scope = nullptr;
  napi_open_handle_scope(env, &scope);
  if (scope == nullptr) {
    return arkTs.GetUndefined();
  }

  napi_valuetype type = arkTs.GetType(ts_node);
  if (type == napi_null) {
    FOOTSTONE_LOG(ERROR) << "add custom ts view error, ts_node null";
    return arkTs.GetUndefined();
  }

  ArkUI_NodeHandle node_handle = nullptr;
  auto status = OH_ArkUI_GetNodeHandleFromNapiValue(env, ts_node, &node_handle);
  if (status != ARKUI_ERROR_CODE_NO_ERROR) {
    FOOTSTONE_LOG(ERROR) << "add custom ts view error, nodeHandle fail, status: " << status << ", node_handle: " << node_handle;
    return arkTs.GetUndefined();
  }
  
  napi_close_handle_scope(env, scope);

  float x = static_cast<float>(arkTs.GetDouble(args[4]));
  float y = static_cast<float>(arkTs.GetDouble(args[5]));

  auto &map = NativeRenderManager::PersistentMap();
  std::shared_ptr<NativeRenderManager> render_manager;
  bool ret = map.Find(render_manager_id, render_manager);
  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "AddCustomViewInRoot: render_manager_id invalid";
    return arkTs.GetUndefined();
  }

  render_manager->AddBizViewInRoot(root_id, biz_view_id, node_handle, HRPosition{x, y});

  return arkTs.GetUndefined();
}

static napi_value RemoveBizViewInRoot(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);

  auto args = arkTs.GetCallbackArgs(info);
  uint32_t render_manager_id = static_cast<uint32_t>(arkTs.GetInteger(args[0]));
  uint32_t root_id = static_cast<uint32_t>(arkTs.GetInteger(args[1]));
  uint32_t biz_view_id = static_cast<uint32_t>(arkTs.GetInteger(args[2]));

  auto &map = NativeRenderManager::PersistentMap();
  std::shared_ptr<NativeRenderManager> render_manager;
  bool ret = map.Find(render_manager_id, render_manager);
  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "RemoveCustomViewInRoot: render_manager_id invalid";
    return arkTs.GetUndefined();
  }

  render_manager->RemoveBizViewInRoot(root_id, biz_view_id);

  return arkTs.GetUndefined();
}

REGISTER_OH_NAPI("NativeRenderProvider", "NativeRenderProvider_BindNativeRoot", BindNativeRoot)
REGISTER_OH_NAPI("NativeRenderProvider", "NativeRenderProvider_UnbindNativeRoot", UnbindNativeRoot)
REGISTER_OH_NAPI("NativeRenderProvider", "NativeRenderProvider_DestroyRoot", DestroyRoot)
REGISTER_OH_NAPI("NativeRenderProvider", "NativeRenderProvider_DoCallbackForCallCustomTsView", DoCallbackForCallCustomTsView)
REGISTER_OH_NAPI("NativeRenderProvider", "NativeRenderProvider_GetViewParent", GetViewParent)
REGISTER_OH_NAPI("NativeRenderProvider", "NativeRenderProvider_GetViewChildren", GetViewChildren)
REGISTER_OH_NAPI("NativeRenderProvider", "NativeRenderProvider_CallViewMethod", CallViewMethod)
REGISTER_OH_NAPI("NativeRenderProvider", "NativeRenderProvider_SetViewEventListener", SetViewEventListener)
REGISTER_OH_NAPI("NativeRenderProvider", "NativeRenderProvider_GetViewFrameInRoot", GetViewFrameInRoot)
REGISTER_OH_NAPI("NativeRenderProvider", "NativeRenderProvider_AddBizViewInRoot", AddBizViewInRoot)
REGISTER_OH_NAPI("NativeRenderProvider", "NativeRenderProvider_RemoveBizViewInRoot", RemoveBizViewInRoot)

}
}
}
}
