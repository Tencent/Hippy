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

#include "footstone/string_view_utils.h"
#include "dom/dom_manager.h"
#include "bridge/bridge_ffi_impl.h"
#include "bridge/ffi_bridge_runtime.h"
#include "render/bridge/bridge_manager.h"
#include "callback_manager.h"
#include "common_header.h"
#include "render/bridge/render_bridge_ffi_impl.h"
#include "render/queue/voltron_render_manager.h"
#include "standard_message_codec.h"
#include "wrapper.h"
#include "data_holder.h"

#if defined(__ANDROID__) || defined(_WIN32)
#  include "bridge_impl.h"
#else
#  include "bridge_impl_ios.h"
#endif

#ifdef ENABLE_INSPECTOR
#include "devtools/devtools_data_source.h"
#include "devtools/vfs/devtools_handler.h"
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
using footstone::WorkerManager;

std::atomic<int32_t> voltronEngineIndex = 0;

EXTERN_C int32_t GetVoltronEngineIndexFFI() {
  return ++voltronEngineIndex;
}

EXTERN_C void LoadInstanceFFI(int32_t engine_id, const char* params, int32_t params_length) {
  auto bridge_manager = BridgeManager::Find(engine_id);
  if (!bridge_manager) {
    FOOTSTONE_DLOG(WARNING) << "LoadInstanceFFI engine_id invalid";
    return;
  }

  auto runtime = std::static_pointer_cast<FFIJSBridgeRuntime>(bridge_manager->GetRuntime());
  if (!runtime) {
    FOOTSTONE_DLOG(WARNING) << "LoadInstanceFFI runtime unbind";
    return;
  }

  auto runtime_id = runtime->GetRuntimeId();
  if (params_length <= 0) {
    FOOTSTONE_DLOG(WARNING) << "LoadInstanceFFI params length error";
    return;
  }

  std::string param_str(params, static_cast<unsigned int>(params_length));
  BridgeImpl::LoadInstance(runtime_id, std::move(param_str));
}

EXTERN_C void UnloadInstanceFFI(int32_t engine_id, const char* params, int32_t params_length) {
  auto bridge_manager = BridgeManager::Find(engine_id);
  if (!bridge_manager) {
    FOOTSTONE_DLOG(WARNING) << "UnloadInstanceFFI engine_id invalid";
    return;
  }

  auto runtime = std::static_pointer_cast<FFIJSBridgeRuntime>(bridge_manager->GetRuntime());
  if (!runtime) {
    FOOTSTONE_DLOG(WARNING) << "UnloadInstanceFFI runtime unbind";
    return;
  }

  auto runtime_id = runtime->GetRuntimeId();
  std::string param_str(params, static_cast<unsigned int>(params_length));
  BridgeImpl::UnloadInstance(runtime_id, std::move(param_str));
}

EXTERN_C int64_t InitJSFrameworkFFI(const char16_t* global_config, int32_t single_thread_mode,
                                    int32_t bridge_param_json, int32_t is_dev_module, int64_t group_id,
                                    uint32_t vfs_id, uint32_t ffi_id, uint32_t dom_manager_id,
                                    int32_t engine_id, int32_t callback_id, uint32_t devtools_id) {
  auto ffi_runtime = std::make_shared<FFIJSBridgeRuntime>(engine_id, ffi_id, bridge_param_json);
  auto bridge_manager = BridgeManager::Create(engine_id, ffi_runtime);

  auto vfs_wrapper = std::any_cast<std::shared_ptr<voltron::VfsWrapper>>(voltron::FindObject(vfs_id));
  FOOTSTONE_DCHECK(vfs_wrapper != nullptr);
  FOOTSTONE_DCHECK(vfs_wrapper->GetLoader()->GetWorkerManager() != nullptr);

  auto result = BridgeImpl::InitJsEngine(ffi_runtime, single_thread_mode, bridge_param_json, is_dev_module, group_id,
                                         vfs_wrapper->GetLoader()->GetWorkerManager(), dom_manager_id, global_config, 0, 0,
                                         [callback_id, ffi_id](int64_t value) { CallGlobalCallback(ffi_id, callback_id, value); }, devtools_id);
  ffi_runtime->SetRuntimeId(result);

  return result;
}

EXTERN_C int32_t RunScriptFromUriFFI(int32_t engine_id,
                                     uint32_t vfs_id,
                                     const char16_t *uri,
                                     const char16_t *code_cache_dir,
                                     int32_t can_use_code_cache,
                                     int32_t is_local_file,
                                     int32_t callback_id) {
  auto bridge_manager = BridgeManager::Find(engine_id);
  if (!bridge_manager) {
    FOOTSTONE_DLOG(WARNING) << "RunScriptFromAssetsFFI engine_id invalid";
    return false;
  }

  auto runtime = std::static_pointer_cast<FFIJSBridgeRuntime>(bridge_manager->GetRuntime());
  if (!runtime) {
    FOOTSTONE_DLOG(WARNING) << "RunScriptFromAssetsFFI runtime unbind";
    return false;
  }

  auto runtime_id = runtime->GetRuntimeId();
  auto ffi_id = runtime->GetFfiId();
  bool result = BridgeImpl::RunScriptFromUri(
      runtime_id, vfs_id, can_use_code_cache, is_local_file, uri, code_cache_dir,
      [callback_id, ffi_id](int value) { CallGlobalCallback(ffi_id, callback_id, value); });
  return result;
}

EXTERN_C void CallFunctionFFI(int32_t engine_id, const char16_t* action, const char* params, int32_t params_length,
                              int32_t callback_id) {
  auto bridge_manager = BridgeManager::Find(engine_id);
  if (!bridge_manager) {
    FOOTSTONE_DLOG(WARNING) << "CallFunctionFFI engine_id invalid";
    return;
  }

  auto runtime = std::static_pointer_cast<FFIJSBridgeRuntime>(bridge_manager->GetRuntime());
  if (!runtime) {
    FOOTSTONE_DLOG(WARNING) << "CallFunctionFFI runtime unbind";
    return;
  }

  auto runtime_id = runtime->GetRuntimeId();
  auto ffi_id = runtime->GetFfiId();
  if (params == nullptr && params_length <= 0) {
    BridgeImpl::CallFunction(runtime_id, action, std::string{},
                             [callback_id, ffi_id](int64_t value) {
                               CallGlobalCallback(ffi_id, callback_id,
                                                  value);
                             });
  } else {
    std::string params_str(params, static_cast<unsigned int>(params_length));
    BridgeImpl::CallFunction(runtime_id,
                             action,
                             std::move(params_str),
                             [callback_id, ffi_id](int64_t value) {
                               CallGlobalCallback(ffi_id, callback_id, value);
                             });

  }
}

EXTERN_C const char* GetCrashMessageFFI() { return "lucas_crash_report_test"; }

EXTERN_C void DestroyFFI(int32_t engine_id, int32_t callback_id, int32_t is_reload) {
  auto bridge_manager = BridgeManager::Find(engine_id);
  if (!bridge_manager) {
    FOOTSTONE_DLOG(WARNING) << "DestroyFFI engine_id invalid";
    return;
  }

  BridgeManager::Destroy(engine_id);

  auto runtime = std::static_pointer_cast<FFIJSBridgeRuntime>(bridge_manager->GetRuntime());
  if (!runtime) {
    FOOTSTONE_DLOG(WARNING) << "DestroyFFI runtime unbind";
    return;
  }

  auto runtime_id = runtime->GetRuntimeId();
  auto ffi_id = runtime->GetFfiId();
  BridgeImpl::Destroy(runtime_id,
                      [callback_id, ffi_id](int64_t value) { CallGlobalCallback(ffi_id, callback_id, value); },
                      is_reload);
}

EXTERN_C void NotifyNetworkEvent(int32_t engine_id, const char16_t* request_id, int32_t event_type, const char16_t* content, const char16_t* extra) {
  FOOTSTONE_DLOG(INFO) << "NotifyNetworkEvent, request_id " << request_id << " event_type:" << std::to_string(event_type);
#if ENABLE_INSPECTOR
  auto bridge_manager = BridgeManager::Find(engine_id);
  if (!bridge_manager) {
    return;
  }
  auto runtime = std::static_pointer_cast<FFIJSBridgeRuntime>(bridge_manager->GetRuntime());
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
    request_string = footstone::StringViewUtils::ToStdString(footstone::StringViewUtils::CovertToUtf8(footstone::string_view(request_id), footstone::string_view::Encoding::Utf16).utf8_value());
  }
  std::string content_string;
  if (content) {
    content_string = footstone::StringViewUtils::ToStdString(footstone::StringViewUtils::CovertToUtf8(footstone::string_view(content), footstone::string_view::Encoding::Utf16).utf8_value());
  }

  // dispatch network event
  if (event_type == static_cast<int32_t> (NetworkEventType::kRequestWillBeSent)) {
    auto notification_center = scope->GetDevtoolsDataSource()->GetNotificationCenter();
    notification_center->network_notification->RequestWillBeSent(request_string, hippy::devtools::DevtoolsHttpRequest(content_string));
  } else if (event_type == static_cast<int32_t> (NetworkEventType::kResponseReceived)) {
    // create response request body
    hippy::devtools::DevtoolsHttpResponse response = hippy::devtools::DevtoolsHttpResponse(content_string);
    response.SetBodyData(footstone::StringViewUtils::ToStdString(footstone::StringViewUtils::CovertToUtf8(footstone::string_view(extra), footstone::string_view::Encoding::Utf16).utf8_value()));
    auto notification_center = scope->GetDevtoolsDataSource()->GetNotificationCenter();
    notification_center->network_notification->ResponseReceived(request_string, response);
  } else if (event_type == static_cast<int32_t> (NetworkEventType::kLoadingFinished)) {
    auto notification_center = scope->GetDevtoolsDataSource()->GetNotificationCenter();
    notification_center->network_notification->LoadingFinished(request_string, hippy::devtools::DevtoolsLoadingFinished(content_string));
  }
#endif
}

EXTERN_C void DoBindDomAndRender(uint32_t dom_manager_id, int32_t engine_id, uint32_t render_id) {
  auto bridge_manager = BridgeManager::Find(engine_id);
  if (!bridge_manager) {
    FOOTSTONE_DLOG(WARNING) << "DoBindDomAndRender engine_id invalid";
    return;
  }

  auto runtime = std::static_pointer_cast<FFIJSBridgeRuntime>(bridge_manager->GetRuntime());
  if (!runtime) {
    FOOTSTONE_DLOG(WARNING) << "DoBindDomAndRender engine runtime unbind";
    return;
  }
  auto dom_manager = std::any_cast<std::shared_ptr<DomManager>>(voltron::FindObject(dom_manager_id));

  auto runtime_id = runtime->GetRuntimeId();
  auto scope = BridgeImpl::GetScope(runtime_id);
  if (!scope) {
    FOOTSTONE_DLOG(WARNING) << "DoBindDomAndRender runtime_id invalid";
    return;
  }

  auto render_manager = voltron::BridgeManager::FindRenderManager(render_id);
  if (!render_manager) {
    FOOTSTONE_DLOG(WARNING) << "DoBindDomAndRender render_id invalid";
    return;
  }

  scope->SetDomManager(dom_manager);
  dom_manager->SetRenderManager(render_manager);
  render_manager->SetDomManager(dom_manager);
  render_manager->BindBridgeId(engine_id);

#ifdef ENABLE_INSPECTOR
  auto devtools_data_source = scope->GetDevtoolsDataSource();
  if (devtools_data_source) {
    devtools_data_source->Bind(dom_manager);
  }
#endif
}

EXTERN_C void DoConnectRootViewAndRuntime(int32_t engine_id, uint32_t root_id) {
  auto bridge_manager = BridgeManager::Find(engine_id);
  if (!bridge_manager) {
    FOOTSTONE_DLOG(WARNING) << "DoConnectRootViewAndRuntime engine_id invalid";
    return;
  }

  auto runtime = std::static_pointer_cast<FFIJSBridgeRuntime>(bridge_manager->GetRuntime());
  if (!runtime) {
    FOOTSTONE_DLOG(WARNING) << "DoConnectRootViewAndRuntime engine runtime unbind";
    return;
  }

  auto runtime_id = runtime->GetRuntimeId();
  auto scope = BridgeImpl::GetScope(runtime_id);
  if (!scope) {
    FOOTSTONE_DLOG(WARNING) << "DoConnectRootViewAndRuntime runtime_id invalid";
    return;
  }

  auto& root_map = hippy::RootNode::PersistentMap();
  std::shared_ptr<hippy::RootNode> root_node;
  bool ret = root_map.Find(root_id, root_node);
  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "DoConnect root_node is nullptr";
    return;
  }

  scope->SetRootNode(root_node);
#ifdef ENABLE_INSPECTOR
  auto devtools_data_source = scope->GetDevtoolsDataSource();
  if (devtools_data_source) {
    devtools_data_source->SetRootNode(root_node);
  }
#endif

  auto dom_manager = scope->GetDomManager().lock();
  std::shared_ptr<voltron::VoltronRenderManager> render_manager =
      std::static_pointer_cast<voltron::VoltronRenderManager>(dom_manager->GetRenderManager().lock());

  float density = render_manager->GetDensity();
  auto layout_node = root_node->GetLayoutNode();
  layout_node->SetScaleFactor(density);
}

EXTERN_C void OnNetworkRequestInvoke(int32_t engine_id,
                                     const char16_t* request_id,
                                     const uint8_t *rep_meta_data,
                                     int32_t rep_meta_data_length) {
#ifdef ENABLE_INSPECTOR
  auto bridge_manager = BridgeManager::Find(engine_id);
  if (!bridge_manager) {
    FOOTSTONE_DLOG(WARNING) << "OnNetworkRequestInvoke: engine_id invalid";
    return;
  }

  auto runtime = std::static_pointer_cast<FFIJSBridgeRuntime>(bridge_manager->GetRuntime());
  if (!runtime) {
    FOOTSTONE_DLOG(WARNING) << "OnNetworkRequestInvoke: engine runtime unbind";
    return;
  }

  auto runtime_id = runtime->GetRuntimeId();
  auto scope = BridgeImpl::GetScope(runtime_id);
  if (!scope) {
    FOOTSTONE_DLOG(WARNING) << "OnNetworkRequestInvoke: runtime_id invalid";
    return;
  }

  auto req_ptr = voltron::VfsWrapper::DecodeBytes(rep_meta_data,
                                      footstone::checked_numeric_cast<int32_t, size_t>(
                                          rep_meta_data_length));
  auto req_map = std::get_if<voltron::EncodableMap>(req_ptr.get());
  if (!req_map) {
    FOOTSTONE_DLOG(WARNING) << "OnNetworkRequestInvoke: req map is nil";
    return;
  }

  auto request_id_str = voltron::C16CharToString(request_id);
  auto d_uri_iter = req_map->find(voltron::EncodableValue(voltron::kUriKey));
  if (d_uri_iter == req_map->end()) {
    FOOTSTONE_DLOG(WARNING) << "OnNetworkRequestInvoke: uri value invalid";
    return;
  }
  auto uri = std::get<std::string>(d_uri_iter->second);
  auto req_meta = voltron::VfsWrapper::ParseHeaders(req_map, voltron::kReqHeadersKey);

  auto devtools_data_source = scope->GetDevtoolsDataSource();
  if (!devtools_data_source) {
    FOOTSTONE_DLOG(WARNING) << "OnNetworkRequestInvoke: devtools not init";
    return;
  }

  hippy::devtools::SentRequest(devtools_data_source->GetNotificationCenter()->network_notification,
                               request_id_str,
                               uri,
                               req_meta);
#endif
}

EXTERN_C void OnNetworkResponseInvoke(int32_t engine_id,
                                      const char16_t* request_id,
                                      const uint8_t *rsp_meta_data,
                                      int32_t rsp_meta_data_length) {
#ifdef ENABLE_INSPECTOR
  auto bridge_manager = BridgeManager::Find(engine_id);
  if (!bridge_manager) {
    FOOTSTONE_DLOG(WARNING) << "OnNetworkRequestInvoke: engine_id invalid";
    return;
  }

  auto runtime = std::static_pointer_cast<FFIJSBridgeRuntime>(bridge_manager->GetRuntime());
  if (!runtime) {
    FOOTSTONE_DLOG(WARNING) << "OnNetworkRequestInvoke: engine runtime unbind";
    return;
  }

  auto runtime_id = runtime->GetRuntimeId();
  auto scope = BridgeImpl::GetScope(runtime_id);
  if (!scope) {
    FOOTSTONE_DLOG(WARNING) << "OnNetworkRequestInvoke: runtime_id invalid";
    return;
  }

  auto rsp_ptr = voltron::VfsWrapper::DecodeBytes(rsp_meta_data,
                                                  footstone::checked_numeric_cast<int32_t, size_t>(
                                                      rsp_meta_data_length));
  auto rsp_map = std::get_if<voltron::EncodableMap>(rsp_ptr.get());
  if (!rsp_map) {
    FOOTSTONE_DLOG(WARNING) << "OnNetworkRequestInvoke: rsp map is nil";
    return;
  }

  auto request_id_str = voltron::C16CharToString(request_id);
  auto d_uri_iter = rsp_map->find(voltron::EncodableValue(voltron::kUriKey));
  if (d_uri_iter == rsp_map->end()) {
    FOOTSTONE_DLOG(WARNING) << "OnNetworkRequestInvoke: uri value invalid";
    return;
  }
  auto req_meta = voltron::VfsWrapper::ParseHeaders(rsp_map, voltron::kReqHeadersKey);
  auto result_code = hippy::UriLoader::RetCode::Failed;
  auto result_code_iter = rsp_map->find(EncodableValue(voltron::kResultCodeKey));
  if (result_code_iter != rsp_map->end()) {
    result_code = voltron::VfsWrapper::ParseResultCode(std::get<int32_t>(result_code_iter->second));
  }

  auto devtools_data_source = scope->GetDevtoolsDataSource();
  if (!devtools_data_source) {
    FOOTSTONE_DLOG(WARNING) << "OnNetworkRequestInvoke: devtools not init";
    return;
  }

  if (result_code == hippy::UriLoader::RetCode::Success) {
    auto rsp_meta = voltron::VfsWrapper::ParseHeaders(rsp_map, voltron::kRspHeadersKey);
    auto buffer_iter = rsp_map->find(EncodableValue(voltron::kBufferKey));
    if (buffer_iter != rsp_map->end()) {
      auto buffer = std::get<std::vector<uint8_t>>(buffer_iter->second);
      char* buffer_address = reinterpret_cast<char*>(buffer.data());
      auto content = std::string(buffer_address, buffer.size());
      hippy::devtools::ReceivedResponse(devtools_data_source->GetNotificationCenter()->network_notification,
                                        request_id_str,
                                        static_cast<int>(result_code),
                                        content,
                                        rsp_meta,
                                        req_meta);
    } else {
      FOOTSTONE_UNREACHABLE();
    }
  } else {
    hippy::devtools::ReceivedResponse(devtools_data_source->GetNotificationCenter()->network_notification,
                                      request_id_str,
                                      static_cast<int>(result_code),
                                      hippy::UriHandler::bytes(),
                                      {},
                                      req_meta);
  }
#endif
}

#ifdef ENABLE_INSPECTOR
std::shared_ptr<footstone::WorkerManager> worker_manager;
#endif

EXTERN_C uint32_t CreateDevtoolsFFI(const char16_t* char_data_dir,
                                    const char16_t* char_ws_url) {
  uint32_t id;
#ifdef ENABLE_INSPECTOR
  auto data_dir = voltron::C16CharToString(char_data_dir);
  auto ws_url = voltron::C16CharToString(char_ws_url);
  hippy::devtools::DevtoolsDataSource::SetFileCacheDir(data_dir);
  worker_manager = std::make_shared<footstone::WorkerManager>(1);

  auto devtools_data_source = std::make_shared<hippy::devtools::DevtoolsDataSource>(ws_url, worker_manager);
  id = hippy::devtools::DevtoolsDataSource::Insert(devtools_data_source);
  FOOTSTONE_DLOG(INFO) << "OnCreateDevtools id=" << id;
#endif
  return id;
}

EXTERN_C void DestroyDevtoolsFFI(uint32_t devtools_id, int32_t is_reload) {
#ifdef ENABLE_INSPECTOR
  auto devtools_data_source = hippy::devtools::DevtoolsDataSource::Find(devtools_id);
  devtools_data_source->Destroy(is_reload);
  bool flag = hippy::devtools::DevtoolsDataSource::Erase(devtools_id);
  FOOTSTONE_DLOG(INFO)<< "OnDestroyDevtools devtools_id=" << devtools_id << ",flag=" << flag;
  FOOTSTONE_DCHECK(flag);
  worker_manager->Terminate();
#endif
}


#ifdef __cplusplus
}
#endif
