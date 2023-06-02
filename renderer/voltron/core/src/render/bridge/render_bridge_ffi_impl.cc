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

#include "render/bridge/render_bridge_ffi_impl.h"

#include "dom/dom_manager.h"
#include "footstone/worker_manager.h"
#include "footstone/worker_impl.h"
#include "encodable_value.h"
#include "standard_message_codec.h"
#include "data_holder.h"

using voltron::StandardMessageCodec;
using voltron::EncodableValue;
using voltron::Sp;
using voltron::BridgeRuntime;
using voltron::BridgeManager;
using voltron::VoltronRenderManager;

#ifdef __cplusplus
extern "C" {
#endif

constexpr char kDomWorkerName[] = "dom_worker";
constexpr char kDomRunnerName[] = "dom_task_runner";

EXTERN_C const char *KeepRenderLibStr() {
  return "keep_render_lib";
}

EXTERN_C uint32_t CreateVoltronRenderProvider(double density) {
  auto render_manager = voltron::BridgeManager::CreateRenderManager();
  render_manager->SetDensity((float)density);
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
  auto copy_params = voltron::CopyBytes(params,
                                        footstone::checked_numeric_cast<int32_t, unsigned int>(
                                            params_len));
  std::vector<std::function<void()>> ops = {[keep, params_len, copy_params, bridge_manager,
                                                call_id_str]() {
    bool is_keep = keep;
    FOOTSTONE_DLOG(INFO) << "CallNativeFunctionFFI call_id" << call_id_str;
    std::unique_ptr<EncodableValue> decode_params =
        StandardMessageCodec::GetInstance().DecodeMessage(copy_params,
                                                          footstone::checked_numeric_cast<int32_t,
                                                                                          unsigned int>(
                                                              params_len));
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
    auto copy_params = voltron::CopyBytes(params,
                                          footstone::checked_numeric_cast<int32_t, unsigned int>(
                                              params_len));
    std::vector<std::function<void()>> ops = {[dom_manager, render_manager, node_id, event_name,
                                                  use_capture = capture, use_bubble = bubble,
                                                  copy_params, params_len, root_node]() {
      auto decode_params =
          StandardMessageCodec::GetInstance().DecodeMessage(copy_params,
                                                            footstone::checked_numeric_cast<int32_t,
                                                                                            unsigned int>(
                                                                params_len));
      voltron::ReleaseCopy(copy_params);

      auto dom_node = dom_manager->GetNode(root_node,
                                           footstone::checked_numeric_cast<int32_t, uint32_t>(
                                               node_id));
      FOOTSTONE_DLOG(INFO) << "CallNativeEventFFI event_name:" << event_name
                           << " node_id:" << node_id << " node:" << dom_node;
      if (dom_node) {
        render_manager->CallEvent(dom_node, event_name, use_capture, use_bubble, decode_params);
      }
    }};
    dom_manager->PostTask(hippy::dom::Scene(std::move(ops)));
  } else {
    std::vector<std::function<void()>> ops =
        {[dom_manager, render_manager, node_id, event_name, use_capture = capture,
             use_bubble = bubble, root_node]() {
          auto dom_node = dom_manager->GetNode(root_node,
                                               footstone::checked_numeric_cast<int32_t, uint32_t>(
                                                   node_id));
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
      dom_manager->DoLayout(root_node);
      dom_manager->EndBatch(root_node);
    } else {
      auto node = dom_manager->GetNode(root_node,
                                       footstone::checked_numeric_cast<int32_t, uint32_t>(node_id));

      if (!node) {
        FOOTSTONE_DLOG(WARNING) << "UpdateNodeSize DomNode not found for id: " << node_id;
        return;
      }

      node->SetLayoutSize((float) width, (float) height);
      dom_manager->EndBatch(root_node);
    }
  }};
  dom_manager->PostTask(hippy::dom::Scene(std::move(ops)));
}

EXTERN_C uint32_t CreateDomInstance() {
  auto dom_manager = std::make_shared<hippy::DomManager>();
  auto id = voltron::InsertObject(dom_manager);
  auto worker = std::make_shared<footstone::WorkerImpl>(kDomWorkerName, false);
  worker->Start();
  auto runner = std::make_shared<footstone::TaskRunner>(kDomRunnerName);
  runner->SetWorker(worker);
  worker->Bind({runner});
  dom_manager->SetTaskRunner(runner);
  dom_manager->SetWorker(worker);
  return id;
}

EXTERN_C void DestroyDomInstance(uint32_t dom_manager_id) {
  auto dom_manager = std::any_cast<std::shared_ptr<hippy::DomManager>>(voltron::FindObject(dom_manager_id));
  if (!dom_manager) {
    return;
  }
  dom_manager->GetWorker()->Terminate();
  voltron::EraseObject(dom_manager_id);
}

EXTERN_C void AddRoot(
    uint32_t dom_manager_id,
    uint32_t root_id) {
  auto dom_manager = std::any_cast<std::shared_ptr<hippy::DomManager>>(voltron::FindObject(dom_manager_id));
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
