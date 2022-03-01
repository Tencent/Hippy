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

#include <memory>

#include "bridge/bridge_manager.h"
#include "bridge/string_util.h"
#include "dom/dom_manager.h"
#include "ffi/bridge_ffi_impl.h"
#include "ffi/callback_manager.h"
#include "ffi/ffi_platform_runtime.h"
#include "render/common.h"
#include "standard_message_codec.h"

#if defined(__ANDROID__) || defined(_WIN32)
#  include "bridge_impl.h"
#else
#  include "bridge_impl_ios.h"
#endif

#ifdef __cplusplus
extern "C" {
#endif

using hippy::DomManager;
using voltron::BridgeManager;
using voltron::EncodableValue;
using voltron::FFIPlatformRuntime;
using voltron::PlatformRuntime;
using voltron::Sp;
using voltron::StandardMessageCodec;
using voltron::VoltronRenderManager;

EXTERN_C void CreateInstanceFFI(int32_t engine_id, int32_t root_id, double width, double height, const char16_t* action,
                                const char* params, int32_t params_length, int32_t callback_id) {
  auto bridge_manager = BridgeManager::Find(engine_id);
  if (bridge_manager) {
    bridge_manager->InitInstance(engine_id, root_id);
    auto runtime = bridge_manager->GetRuntime().lock();
    auto dom_manager = bridge_manager->GetDomManager(root_id);
    if (runtime && dom_manager) {
      auto runtime_id = runtime->GetRuntimeId();
      BridgeImpl::BindDomManager(runtime_id, dom_manager);
    }
    dom_manager->SetRootSize((float)width, (float)height);
    dom_manager->StartTaskRunner();
    CallFunctionFFI(engine_id, action, params, params_length, callback_id);
  }
}

EXTERN_C void DestroyInstanceFFI(int32_t engine_id, int32_t root_id, const char16_t* action,
                                 int32_t callback_id) {
  auto bridge_manager = BridgeManager::Find(engine_id);
  if (bridge_manager) {
    bridge_manager->DestroyInstance(engine_id, root_id);

    CallFunctionFFI(engine_id, action, nullptr, 0, callback_id);
  }
}

EXTERN_C int64_t InitJSFrameworkFFI(const char16_t* global_config, int32_t single_thread_mode,
                                    int32_t bridge_param_json, int32_t is_dev_module, int64_t group_id,
                                    int32_t engine_id, int32_t callback_id) {
  Sp<PlatformRuntime> ffi_runtime = std::make_shared<FFIPlatformRuntime>(engine_id);
  BridgeManager::Create(engine_id, ffi_runtime);

  auto result = BridgeImpl::InitJsEngine(ffi_runtime,
                                         single_thread_mode,
                                         bridge_param_json,
                                         is_dev_module,
                                         group_id,
                                         global_config,
                                         0,0,
                                         [callback_id](int64_t value) {
                                           CallGlobalCallback(callback_id,
                                                              value);
                                         });
  ffi_runtime->SetRuntimeId(result);

  return result;
}

EXTERN_C int32_t RunScriptFromFileFFI(int32_t engine_id, const char16_t* file_path, const char16_t* script_name,
                                      const char16_t* code_cache_dir, int32_t can_use_code_cache, int32_t callback_id) {
  auto bridge_manager = BridgeManager::Find(engine_id);
  if (bridge_manager) {
    auto runtime = bridge_manager->GetRuntime().lock();
    if (runtime) {
      auto runtime_id = runtime->GetRuntimeId();
      return BridgeImpl::RunScriptFromFile(runtime_id, file_path, script_name, code_cache_dir, can_use_code_cache,
                                           [callback_id](int64_t value) { CallGlobalCallback(callback_id, value); });
    }
  }
  return 0;
}

EXTERN_C int32_t RunScriptFromAssetsFFI(int32_t engine_id, const char16_t* asset_name, const char16_t* code_cache_dir,
                                        int32_t can_use_code_cache, const char16_t* asset_str_char,
                                        int32_t callback_id) {
  auto bridge_manager = BridgeManager::Find(engine_id);
  bool result = false;
  if (bridge_manager) {
    auto runtime = bridge_manager->GetRuntime().lock();
    if (runtime) {
      auto runtime_id = runtime->GetRuntimeId();
      result = BridgeImpl::RunScriptFromAssets(
          runtime_id, can_use_code_cache, asset_name, code_cache_dir,
          [callback_id](int value) { CallGlobalCallback(callback_id, value); }, asset_str_char);
    }
  }
  if (!result) {
    delete asset_str_char;
  }
  return result;
}

EXTERN_C void CallFunctionFFI(int32_t engine_id, const char16_t* action, const char* params, int32_t params_length, int32_t callback_id) {
  auto bridge_manager = BridgeManager::Find(engine_id);
  if (bridge_manager) {
    auto runtime = bridge_manager->GetRuntime().lock();
    if (runtime) {
        auto runtime_id = runtime->GetRuntimeId();
        if (params == nullptr && params_length <= 0) {
            BridgeImpl::CallFunction(runtime_id, action, std::string{},
                                     [callback_id](int64_t value) {
                                         CallGlobalCallback(callback_id, value);
                                     });
        } else {
            auto copy_params = copyCharToChar(params, params_length);
            std::string params_str(copy_params, params_length);
            BridgeImpl::CallFunction(runtime_id, action, std::move(params_str),
                                     [callback_id, copy_params](int64_t value) {
                                         CallGlobalCallback(callback_id, value);
                                         delete copy_params;
                                     });
        }
    }
  }
}

EXTERN_C void CallNativeFunctionFFI(int32_t engine_id, int32_t root_id, const char16_t* call_id, const uint8_t* params,
                                    const int32_t& params_len, int32_t keep) {
  auto bridge_manager = BridgeManager::Find(engine_id);
  if (bridge_manager) {
    auto dom_manager = bridge_manager->GetDomManager(root_id);
    if (dom_manager) {
      dom_manager->PostTask([keep, params_len, params, call_id, bridge_manager]() {
        bool is_keep = keep;
        std::string call_id_str = C16CharToString(call_id);
        std::unique_ptr<EncodableValue> decode_params =
            StandardMessageCodec::GetInstance().DecodeMessage(params, params_len);
        bridge_manager->CallNativeCallback(call_id_str, std::move(decode_params), is_keep);
      });
    }
  }
}

EXTERN_C void CallNativeEventFFI(int32_t engine_id, int32_t root_id, int node_id, const char16_t* event,
                                 const uint8_t* params, int32_t params_len) {
  auto bridge_manager = BridgeManager::Find(engine_id);
  if (bridge_manager) {
    auto dom_manager = bridge_manager->GetDomManager(root_id);
    auto render_manager = bridge_manager->GetRenderManager(root_id);
    if (dom_manager && render_manager) {
      dom_manager->PostTask([dom_manager, render_manager, node_id, event, params, params_len]() {
        auto dom_node = dom_manager->GetNode(node_id);
        if (dom_node) {
          std::string event_name = C16CharToString(event);
          if (params && params_len > 0) {
            std::unique_ptr<EncodableValue> decode_params =
                StandardMessageCodec::GetInstance().DecodeMessage(params, params_len);
            render_manager->CallEvent(dom_node, event_name, decode_params);
          } else {
            render_manager->CallEvent(dom_node, event_name, nullptr);
          }
        }
      });
    }
  }
}

EXTERN_C void UpdateNodeSize(int32_t engine_id, int32_t root_id, int32_t node_id, double width, double height) {
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

EXTERN_C void NotifyRenderManager(int32_t engine_id) { BridgeManager::Notify(engine_id); }

EXTERN_C const char* GetCrashMessageFFI() { return "lucas_crash_report_test"; }

EXTERN_C void DestroyFFI(int32_t engine_id, int32_t callback_id) {
  auto bridge_manager = BridgeManager::Find(engine_id);
  if (bridge_manager) {
    auto runtime = bridge_manager->GetRuntime().lock();
    BridgeManager::Destroy(engine_id);
    if (runtime) {
      auto runtime_id = runtime->GetRuntimeId();
      BridgeImpl::Destroy(runtime_id,
                          [callback_id](int64_t value) { CallGlobalCallback(callback_id, value); });
    }
  }
}

EXTERN_C int32_t RegisterCallFunc(int32_t type, void* func) {
  TDF_BASE_DLOG(INFO) << "start register func, type " << type;
  if (type == CALL_NATIVE_FUNC_TYPE) {
    call_native_func = reinterpret_cast<call_native>(func);
    return true;
  } else if (type == REPORT_JSON_EXCEPTION_FUNC_TYPE) {
    report_json_exception_func = reinterpret_cast<report_json_exception>(func);
    return true;
  } else if (type == REPORT_JS_EXCEPTION_FUNC_TYPE) {
    report_js_exception_func = reinterpret_cast<report_js_exception>(func);
    return true;
  } else if (type == SEND_RESPONSE_FUNC_TYPE) {
    send_response_func = reinterpret_cast<send_response>(func);
    return true;
  } else if (type == SEND_NOTIFICATION_FUNC_TYPE) {
    send_notification_func = reinterpret_cast<send_notification>(func);
    return true;
  } else if (type == DESTROY_FUNC_TYPE) {
    destroy_func = reinterpret_cast<destroy_function>(func);
    return true;
  } else if (type == GLOBAL_CALLBACK_TYPE) {
    global_callback_func = reinterpret_cast<global_callback>(func);
    return true;
  } else if (type == POST_RENDER_OP_TYPE) {
    post_render_op_func = reinterpret_cast<post_render_op>(func);
    return true;
  } else if (type == CALCULATE_NODE_LAYOUT_TYPE) {
    calculate_node_layout_func = reinterpret_cast<calculate_node_layout>(func);
    return true;
  }
  TDF_BASE_DLOG(ERROR) << "register func error, unknown type " << type;
  return false;
}

bool CallGlobalCallback(int32_t callback_id, int64_t value) {
  if (global_callback_func) {
    const Work work = [value, callback_id]() { global_callback_func(callback_id, value); };
    const Work* work_ptr = new Work(work);
    PostWorkToDart(work_ptr);
    return true;
  } else {
    TDF_BASE_DLOG(ERROR) << "call callback error, func not found";
  }
  return false;
}

#ifdef __cplusplus
}
#endif
