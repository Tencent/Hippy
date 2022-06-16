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

#include "core/base/string_view_utils.h"
#include "dom/dom_manager.h"
#include "ffi/bridge_ffi_impl.h"
#include "ffi/ffi_bridge_runtime.h"
#include "render/ffi/bridge_manager.h"
#include "render/ffi/callback_manager.h"
#include "render/ffi/common_header.h"
#include "render/ffi/render_bridge_ffi_impl.h"
#include "render/queue/voltron_render_manager.h"
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
using voltron::FFIJSBridgeRuntime;
using voltron::JSBridgeRuntime;
using voltron::Sp;
using voltron::StandardMessageCodec;
using voltron::VoltronRenderManager;

EXTERN_C void CreateInstanceFFI(int32_t engine_id, int32_t root_id, double width, double height, const char16_t* action,
                                const char* params, int32_t params_length, int32_t callback_id) {
  auto bridge_manager = BridgeManager::Find(engine_id);
  if (bridge_manager) {
    auto render_manager = std::make_shared<VoltronRenderManager>(engine_id, root_id);
    bridge_manager->InitInstance(engine_id, root_id, render_manager);
    auto runtime = std::static_pointer_cast<FFIJSBridgeRuntime>(bridge_manager->GetRuntime().lock());
    auto dom_manager = bridge_manager->GetDomManager(root_id);
    if (runtime && dom_manager) {
      auto runtime_id = runtime->GetRuntimeId();
      BridgeImpl::BindDomManager(runtime_id, dom_manager);
#if ENABLE_INSPECTOR
      auto scope = BridgeImpl::GetScope(runtime_id);
      if (scope) {
        scope->GetDevtoolsDataSource()->Bind(static_cast<int32_t>(runtime_id), dom_manager->GetId(), 0);
      }
#endif
      std::vector<std::function<void()>> ops = {[dom_manager, width, height]() {
          dom_manager->SetRootSize((float) width, (float) height);
      }};
      dom_manager->PostTask(hippy::dom::Scene(std::move(ops)));
      if (params_length > 0) {
          std::string param_str(params, static_cast<unsigned int>(params_length));
          BridgeImpl::LoadInstance(runtime_id, std::move(param_str));
      }
    }
  }
}

EXTERN_C void DestroyInstanceFFI(int32_t engine_id, int32_t root_id, const char16_t* action, int32_t callback_id) {
  auto bridge_manager = BridgeManager::Find(engine_id);
  if (bridge_manager) {
    bridge_manager->DestroyInstance(engine_id, root_id);
    auto runtime = std::static_pointer_cast<FFIJSBridgeRuntime>(bridge_manager->GetRuntime().lock());
    if (runtime) {
      auto runtime_id = runtime->GetRuntimeId();
      BridgeImpl::UnloadInstance(runtime_id, [callback_id](int64_t value) { CallGlobalCallback(callback_id, value); });
    }
  }
}

EXTERN_C void InitBridge() {
  if (ex_register_func == nullptr) {
      ex_register_func = RegisterCallFuncEx;
  }
}

EXTERN_C int64_t InitJSFrameworkFFI(const char16_t* global_config, int32_t single_thread_mode,
                                    int32_t bridge_param_json, int32_t is_dev_module, int64_t group_id,
                                    int32_t engine_id, int32_t callback_id, const char16_t* char_data_dir,
                                    const char16_t* char_ws_url) {
  auto ffi_runtime = std::make_shared<FFIJSBridgeRuntime>(engine_id);
  BridgeManager::Create(engine_id, ffi_runtime);

  auto result = BridgeImpl::InitJsEngine(ffi_runtime, single_thread_mode, bridge_param_json, is_dev_module, group_id,
                                         global_config, 0, 0,
                                         [callback_id](int64_t value) { CallGlobalCallback(callback_id, value); }, char_data_dir, char_ws_url);
  ffi_runtime->SetRuntimeId(result);

  return result;
}

EXTERN_C int32_t RunScriptFromFileFFI(int32_t engine_id, const char16_t* file_path, const char16_t* script_name,
                                      const char16_t* code_cache_dir, int32_t can_use_code_cache, int32_t callback_id) {
  auto bridge_manager = BridgeManager::Find(engine_id);
  if (bridge_manager) {
    auto runtime = std::static_pointer_cast<FFIJSBridgeRuntime>(bridge_manager->GetRuntime().lock());
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
    auto runtime = std::static_pointer_cast<FFIJSBridgeRuntime>(bridge_manager->GetRuntime().lock());
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

EXTERN_C void CallFunctionFFI(int32_t engine_id, const char16_t* action, const char* params, int32_t params_length,
                              int32_t callback_id) {
  auto bridge_manager = BridgeManager::Find(engine_id);
  if (bridge_manager) {
    auto runtime = std::static_pointer_cast<FFIJSBridgeRuntime>(bridge_manager->GetRuntime().lock());
    if (runtime) {
      auto runtime_id = runtime->GetRuntimeId();
      if (params == nullptr && params_length <= 0) {
        BridgeImpl::CallFunction(runtime_id, action, std::string{},
                                 [callback_id](int64_t value) { CallGlobalCallback(callback_id, value); });
      } else {
        std::string params_str(params, static_cast<unsigned int>(params_length));
        BridgeImpl::CallFunction(runtime_id, action, std::move(params_str), [callback_id](int64_t value) {
          CallGlobalCallback(callback_id, value);
        });
      }
    }
  }
}

EXTERN_C const char* GetCrashMessageFFI() { return "lucas_crash_report_test"; }

EXTERN_C void DestroyFFI(int32_t engine_id, int32_t callback_id, int32_t is_reload) {
  auto bridge_manager = BridgeManager::Find(engine_id);
  if (bridge_manager) {
    auto runtime = std::static_pointer_cast<FFIJSBridgeRuntime>(bridge_manager->GetRuntime().lock());
    BridgeManager::Destroy(engine_id);
    if (runtime) {
      auto runtime_id = runtime->GetRuntimeId();
      BridgeImpl::Destroy(runtime_id, [callback_id](int64_t value) { CallGlobalCallback(callback_id, value); }, is_reload);
    }
  }
}

EXTERN_C void NotifyNetworkEvent(int32_t engine_id, const char16_t* request_id, int32_t event_type, const char16_t* content, const char16_t* extra) {
  TDF_BASE_DLOG(INFO) << "NotifyNetworkEvent, request_id " << request_id << " event_type:" << std::to_string(event_type);
#if ENABLE_INSPECTOR
  auto bridge_manager = BridgeManager::Find(engine_id);
  if (!bridge_manager) {
    return;
  }
  auto runtime = std::static_pointer_cast<FFIJSBridgeRuntime>(bridge_manager->GetRuntime().lock());
  if (!runtime) {
    return;
  }
  auto scope = BridgeImpl::GetScope(runtime->GetRuntimeId());
  if (!scope) {
    return;
  }
  // change char16_t* to std::string
  std::string request_string;
  if (request_id) {
    request_string = hippy::base::StringViewUtils::ToU8StdStr(unicode_string_view(request_id));
  }
  std::string content_string;
  if (content) {
    content_string = hippy::base::StringViewUtils::ToU8StdStr(unicode_string_view(content));
  }

  // dispatch network event
  if (event_type == static_cast<int32_t> (NetworkEventType::kRequestWillBeSent)) {
    auto notification_center = scope->GetDevtoolsDataSource()->GetNotificationCenter();
    notification_center->network_notification->RequestWillBeSent(request_string, hippy::devtools::DevtoolsHttpRequest(content_string));
  } else if (event_type == static_cast<int32_t> (NetworkEventType::kResponseReceived)) {
    // create response request body
    hippy::devtools::DevtoolsHttpResponse response = hippy::devtools::DevtoolsHttpResponse(content_string);
    response.SetBodyData(hippy::base::StringViewUtils::ToU8StdStr(unicode_string_view(extra)));
    auto notification_center = scope->GetDevtoolsDataSource()->GetNotificationCenter();
    notification_center->network_notification->ResponseReceived(request_string, response);
  } else if (event_type == static_cast<int32_t> (NetworkEventType::kLoadingFinished)) {
    auto notification_center = scope->GetDevtoolsDataSource()->GetNotificationCenter();
    notification_center->network_notification->LoadingFinished(request_string, hippy::devtools::DevtoolsLoadingFinished(content_string));
  }
#endif
}

#ifdef __cplusplus
}
#endif
