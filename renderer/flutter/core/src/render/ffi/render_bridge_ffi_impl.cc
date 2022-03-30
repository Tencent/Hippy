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

#include "render/ffi/render_bridge_ffi_impl.h"
#include "standard_message_codec.h"
#include "encodable_value.h"

using voltron::StandardMessageCodec;
using voltron::EncodableValue;

#ifdef __cplusplus
extern "C" {
#endif

EXTERN_C int32_t RegisterCallFunc(int32_t type, void *func) {
  TDF_BASE_DLOG(INFO) << "start register func, type " << type;
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
  TDF_BASE_DLOG(ERROR) << "register func error, unknown type " << type;
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
    TDF_BASE_DLOG(ERROR) << "call callback error, func not found";
  }
  return false;
}

EXTERN_C void CallNativeFunctionFFI(int32_t engine_id, int32_t root_id,
                                    const char16_t *call_id,
                                    const uint8_t *params, int32_t params_len,
                                    int32_t keep) {
  auto bridge_manager = BridgeManager::Find(engine_id);
  if (bridge_manager) {
    auto dom_manager = bridge_manager->GetDomManager(root_id);
    if (dom_manager) {
      std::string call_id_str = voltron::C16CharToString(call_id);
      if (params && params_len > 0) {
        auto copy_params = voltron::CopyBytes(params, params_len);
        dom_manager->PostTask([keep, params_len, copy_params, bridge_manager,
                               call_id_str]() {
          bool is_keep = keep;
          TDF_BASE_DLOG(INFO) << "CallNativeFunctionFFI call_id" << call_id_str;
          std::unique_ptr<EncodableValue> decode_params =
              StandardMessageCodec::GetInstance().DecodeMessage(copy_params,
                                                                params_len);
          voltron::ReleaseCopy(copy_params);
          bridge_manager->CallNativeCallback(call_id_str,
                                             std::move(decode_params), is_keep);
        });
      }
    }
  }
}

EXTERN_C void CallNativeEventFFI(int32_t engine_id, int32_t root_id,
                                 int node_id, const char16_t *event,
                                 const uint8_t *params, int32_t params_len) {
  auto bridge_manager = BridgeManager::Find(engine_id);
  if (bridge_manager) {
    auto dom_manager = bridge_manager->GetDomManager(root_id);
    auto render_manager = std::static_pointer_cast<VoltronRenderManager>(
        bridge_manager->GetRenderManager(root_id));
    if (dom_manager && render_manager) {
      std::string event_name = voltron::C16CharToString(event);
      if (params && params_len > 0) {
        auto copy_params = voltron::CopyBytes(params, params_len);
        dom_manager->PostTask([dom_manager, render_manager, node_id, event_name,
                               copy_params, params_len]() {
          auto decode_params =
              StandardMessageCodec::GetInstance().DecodeMessage(copy_params,
                                                                params_len);
          voltron::ReleaseCopy(copy_params);

          auto dom_node = dom_manager->GetNode(node_id);
          TDF_BASE_DLOG(INFO) << "CallNativeEventFFI event_name:" << event_name
                              << " node_id:" << node_id << " node:" << dom_node;
          if (dom_node) {
            render_manager->CallEvent(dom_node, event_name, decode_params);
          }
        });
      } else {
        dom_manager->PostTask(
            [dom_manager, render_manager, node_id, event_name]() {
              auto dom_node = dom_manager->GetNode(node_id);
              if (dom_node) {
                render_manager->CallEvent(dom_node, event_name, nullptr);
              }
            });
      }
    }
  }
}

EXTERN_C void UpdateNodeSize(int32_t engine_id, int32_t root_id,
                             int32_t node_id, double width, double height) {
  auto bridge_manager = BridgeManager::Find(engine_id);
  if (bridge_manager) {
    auto dom_manager = bridge_manager->GetDomManager(root_id);
    if (dom_manager) {
      dom_manager->PostTask([dom_manager, width, height, node_id]() {
        if (node_id == 0) {
          dom_manager->SetRootSize((float)width, (float)height);
        } else {
          auto node = dom_manager->GetNode(node_id);
          if (node) {
            node->SetLayoutSize((float)width, (float)height);
          }
        }
      });
    }
  }
}

EXTERN_C void NotifyRenderManager(int32_t engine_id) {
  BridgeManager::ReverseTraversal(
      engine_id, [](const Sp<hippy::RenderManager>& render_manager) {
        auto render_manager_ptr =
            std::static_pointer_cast<VoltronRenderManager>(render_manager);
        if (render_manager_ptr) {
          render_manager_ptr->Notify();
        }
      });
}

#ifdef __cplusplus
}
#endif