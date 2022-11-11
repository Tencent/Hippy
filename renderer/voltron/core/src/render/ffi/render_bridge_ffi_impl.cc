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

#include <dom/dom_manager.h>
#include "render/ffi/render_bridge_ffi_impl.h"
#include "standard_message_codec.h"
#include "encodable_value.h"

using voltron::StandardMessageCodec;
using voltron::EncodableValue;
using voltron::Sp;
using voltron::BridgeRuntime;
using voltron::BridgeManager;
using voltron::VoltronRenderManager;

#ifdef __cplusplus
extern "C" {
#endif

constexpr char kDomRunnerName[] = "hippy_dom";

EXTERN_C int32_t RegisterCallFunc(int32_t type, void *func) {
  FOOTSTONE_DLOG(INFO) << "start register func, type " << type;
  if (type == static_cast<int>(RenderFFIRegisterFuncType::kGlobalCallback)) {
    global_callback_func = reinterpret_cast<global_callback>(func);
    return true;
  } else if (type == static_cast<int>(RenderFFIRegisterFuncType::kPostRenderOp)) {
    post_render_op_func = reinterpret_cast<post_render_op>(func);
    return true;
  } else if (type == static_cast<int>(RenderFFIRegisterFuncType::kCalculateNodeLayout)) {
    calculate_node_layout_func = reinterpret_cast<calculate_node_layout>(func);
    return true;
  } else if (ex_register_func != nullptr) {
    return ex_register_func(type, func);
  }
  FOOTSTONE_DLOG(ERROR) << "register func error, unknown type " << type;
  return false;
}

bool CallGlobalCallback(int32_t callback_id, int64_t value) {
  if (global_callback_func) {
    const Work work = [value, callback_id]() {
      global_callback_func(callback_id, value);
    };
    const Work *work_ptr = new Work(work);
    PostWorkToDart(work_ptr);
    return true;
  } else {
    FOOTSTONE_DLOG(ERROR) << "call callback error, func not found";
  }
  return false;
}

EXTERN_C uint32_t CreateVoltronRenderProvider() {
  auto render_manager = voltron::BridgeManager::CreateRenderManager();
  if (render_manager) {
    return render_manager->GetId();
  }
  FOOTSTONE_DLOG(WARNING) << "CreateVoltronRenderProvider failed";
  return 0;
}

EXTERN_C void DestroyVoltronRenderProvider(uint32_t render_manager_id) {
  voltron::BridgeManager::DestroyRenderManager(render_manager_id);
}

EXTERN_C void CallNativeFunctionFFI(int32_t engine_id, uint32_t render_manager_id,
                                    const char16_t *call_id,
                                    const uint8_t *params, int32_t params_len,
                                    int32_t keep) {
  auto bridge_manager = BridgeManager::Find(engine_id);
  if (!bridge_manager) {
    FOOTSTONE_DLOG(WARNING) << "CallNativeFunction engine_id invalid";
    return;
  }

  auto render_manager = BridgeManager::FindRenderManager(render_manager_id);
  if (!render_manager) {
    FOOTSTONE_DLOG(WARNING) << "CallNativeEvent render_manager_id invalid";
    return;
  }

  auto dom_manager = render_manager->GetDomManager();
  if (!dom_manager) {
    FOOTSTONE_DLOG(WARNING) << "CallNativeFunction dom_manager unbind";
    return;
  }

  if (!params || params_len <= 0) {
    FOOTSTONE_DLOG(WARNING) << "CallNativeFunction params invalid";
    return;
  }

  std::string call_id_str = voltron::C16CharToString(call_id);
  auto copy_params = voltron::CopyBytes(params, params_len);
  std::vector<std::function<void()>> ops = {[keep, params_len, copy_params, bridge_manager,
                                                call_id_str]() {
    bool is_keep = keep;
    FOOTSTONE_DLOG(INFO) << "CallNativeFunctionFFI call_id" << call_id_str;
    std::unique_ptr<EncodableValue> decode_params =
        StandardMessageCodec::GetInstance().DecodeMessage(copy_params,
                                                          params_len);
    voltron::ReleaseCopy(copy_params);
    bridge_manager->CallNativeCallback(call_id_str,
                                       std::move(decode_params), is_keep);
  }};
  dom_manager->PostTask(hippy::dom::Scene(std::move(ops)));
}

EXTERN_C void CallNativeEventFFI(uint32_t render_manager_id, uint32_t root_id,
                                 int32_t node_id, const char16_t *event,
                                 bool capture, bool bubble,
                                 const uint8_t *params, int32_t params_len) {
  auto render_manager = BridgeManager::FindRenderManager(render_manager_id);
  if (!render_manager) {
    FOOTSTONE_DLOG(WARNING) << "CallNativeEvent render_manager_id invalid";
    return;
  }

  auto dom_manager = render_manager->GetDomManager();
  if (!dom_manager) {
    FOOTSTONE_DLOG(WARNING) << "CallNativeEvent dom_manager unbind";
    return;
  }

  auto &root_map = hippy::RootNode::PersistentMap();
  std::shared_ptr<hippy::RootNode> root_node;
  auto ret = root_map.Find(root_id, root_node);
  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "CallNativeEvent root_node is nullptr";
    return;
  }

  std::string event_name = voltron::C16CharToString(event);
  if (params && params_len > 0) {
    auto copy_params = voltron::CopyBytes(params, params_len);
    std::vector<std::function<void()>> ops = {[dom_manager, render_manager, node_id, event_name,
                                                use_capture = capture, use_bubble = bubble,
                                                copy_params, params_len, root_node]() {
      auto decode_params =
          StandardMessageCodec::GetInstance().DecodeMessage(copy_params,
                                                            params_len);
      voltron::ReleaseCopy(copy_params);

      auto dom_node = dom_manager->GetNode(root_node, node_id);
      FOOTSTONE_DLOG(INFO) << "CallNativeEventFFI event_name:" << event_name
                           << " node_id:" << node_id << " node:" << dom_node;
      if (dom_node) {
        render_manager->CallEvent(dom_node, event_name, use_capture, use_bubble, decode_params);
      }
    }};
    dom_manager->PostTask(hippy::dom::Scene(std::move(ops)));
  } else {
    std::vector<std::function<void()>> ops = {[dom_manager, render_manager, node_id, event_name, use_capture = capture, use_bubble = bubble, root_node]() {
      auto dom_node = dom_manager->GetNode(root_node, node_id);
      if (dom_node) {
        render_manager->CallEvent(dom_node, event_name, use_capture, use_bubble, nullptr);
      }
    }};
    dom_manager->PostTask(hippy::dom::Scene(std::move(ops)));
  }
}

EXTERN_C void UpdateNodeSize(uint32_t render_manager_id, uint32_t root_id,
                             int32_t node_id, double width, double height) {
  auto render_manager = BridgeManager::FindRenderManager(render_manager_id);
  if (!render_manager) {
    FOOTSTONE_DLOG(WARNING) << "CallNativeEvent render_manager_id invalid";
    return;
  }

  auto dom_manager = render_manager->GetDomManager();
  if (!dom_manager) {
    FOOTSTONE_DLOG(WARNING) << "UpdateNodeSize dom_manager unbind";
    return;
  }

  auto &root_map = hippy::RootNode::PersistentMap();
  std::shared_ptr<hippy::RootNode> root_node;
  auto ret = root_map.Find(root_id, root_node);
  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "UpdateNodeSize root_node is nullptr";
    return;
  }

  std::vector<std::function<void()>> ops = {[dom_manager, width, height, node_id, root_node]() {
    if (node_id == 0) {
      dom_manager->SetRootSize(root_node, (float) width, (float) height);
    } else {
      auto node = dom_manager->GetNode(root_node, node_id);

      if (!node) {
        FOOTSTONE_DLOG(WARNING) << "UpdateNodeSize DomNode not found for id: " << node_id;
        return;
      }

      node->SetLayoutSize((float) width, (float) height);
    }
  }};
  dom_manager->PostTask(hippy::dom::Scene(std::move(ops)));
}

EXTERN_C uint32_t CreateWorkerManager() {
  return voltron::BridgeManager::CreateWorkerManager();
}

EXTERN_C void DestroyWorkerManager(uint32_t worker_manager_id) {
  voltron::BridgeManager::DestroyWorkerManager(worker_manager_id);
}

EXTERN_C uint32_t CreateDomInstance(uint32_t worker_manager_id) {
  auto dom_manager = std::make_shared<hippy::DomManager>();
  hippy::DomManager::Insert(dom_manager);
  std::shared_ptr<footstone::WorkerManager>
      worker_manager = voltron::BridgeManager::FindWorkerManager(worker_manager_id);
  FOOTSTONE_DCHECK(worker_manager != nullptr);
  auto runner = worker_manager->CreateTaskRunner(kDomRunnerName);
  dom_manager->SetTaskRunner(runner);
  return dom_manager->GetId();
}

EXTERN_C void DestroyDomInstance(uint32_t dom_manager_id) {
  auto dom_manager = hippy::DomManager::Find(dom_manager_id);
  if (dom_manager) {
    hippy::DomManager::Erase(dom_manager_id);
  }
}

EXTERN_C void AddRoot(
    uint32_t dom_manager_id,
    uint32_t root_id) {
  std::shared_ptr<hippy::DomManager> dom_manager = hippy::DomManager::Find(dom_manager_id);
  auto root_node = std::make_shared<hippy::RootNode>(root_id);
  root_node->SetDomManager(dom_manager);
  auto &persistent_map = hippy::RootNode::PersistentMap();
  persistent_map.Insert(root_id, root_node);
}

EXTERN_C void RemoveRoot(uint32_t dom_manager_id,
                         uint32_t root_id) {
  auto &persistent_map = hippy::RootNode::PersistentMap();
  persistent_map.Erase(root_id);
}

#ifdef __cplusplus
}
#endif
