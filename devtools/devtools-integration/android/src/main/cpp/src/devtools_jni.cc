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

#include "devtools/devtools_jni.h"

#include "api/devtools_backend_service.h"
#include "devtools/devtools_data_source.h"
#include "devtools/vfs/devtools_handler.h"
#include "footstone/check.h"
#include "footstone/string_view_utils.h"
#include "footstone/worker_manager.h"
#include "jni/data_holder.h"
#include "jni/jni_env.h"
#include "jni/jni_register.h"
#include "jni/jni_utils.h"
#include "vfs/vfs_resource_holder.h"

namespace hippy::devtools {
using string_view = footstone::stringview::string_view;
using StringViewUtils = footstone::stringview::StringViewUtils;
using WorkerManager = footstone::runner::WorkerManager;

REGISTER_JNI("com/tencent/devtools/DevtoolsManager",  // NOLINT(cert-err58-cpp)
             "onCreateDevtools",
             "(Ljava/lang/String;Ljava/lang/String;)I",
             OnCreateDevtools)

REGISTER_JNI("com/tencent/devtools/DevtoolsManager",  // NOLINT(cert-err58-cpp)
             "onDestroyDevtools",
             "(IZ)V",
             OnDestroyDevtools)

REGISTER_JNI("com/tencent/devtools/DevtoolsManager",  // NOLINT(cert-err58-cpp)
             "onBindDevtools",
             "(IIII)V",
             OnBindDevtools)

REGISTER_JNI("com/tencent/devtools/DevtoolsManager",  // NOLINT(cert-err58-cpp)
             "onAttachToRoot",
             "(II)V",
             OnAttachToRoot)

REGISTER_JNI("com/tencent/devtools/vfs/DevtoolsProcessor",  // NOLINT(cert-err58-cpp)
             "onNetworkRequest",
             "(ILjava/lang/String;Lcom/tencent/vfs/ResourceDataHolder;)V",
             OnNetworkRequestInvoke)

REGISTER_JNI("com/tencent/devtools/vfs/DevtoolsProcessor",  // NOLINT(cert-err58-cpp)
             "onNetworkResponse",
             "(ILjava/lang/String;Lcom/tencent/vfs/ResourceDataHolder;)V",
             OnNetworkResponseInvoke)

// needs to call by JNI_OnLoad
void DevtoolsJni::Init(JavaVM* j_vm, void* reserved) {}

// needs to call by JNI_OnUnload
void DevtoolsJni::Destroy(JavaVM* j_vm, void* reserved) {}

constexpr uint32_t kPoolSize = 1;
std::shared_ptr<WorkerManager> worker_manager;

jint OnCreateDevtools(JNIEnv* j_env,
                      __unused jobject j_object,
                      jstring j_data_dir,
                      jstring j_ws_url) {
  worker_manager = std::make_shared<WorkerManager>(kPoolSize);
  const string_view data_dir = JniUtils::ToStrView(j_env, j_data_dir);
  const string_view ws_url = JniUtils::ToStrView(j_env, j_ws_url);
  DevtoolsDataSource::SetFileCacheDir(StringViewUtils::ToStdString(
      StringViewUtils::ConvertEncoding(data_dir, string_view::Encoding::Utf8).utf8_value()));
  auto devtools_data_source = std::make_shared<hippy::devtools::DevtoolsDataSource>(
      StringViewUtils::ToStdString(StringViewUtils::ConvertEncoding(ws_url, string_view::Encoding::Utf8).utf8_value()),
      worker_manager);
  uint32_t id = devtools::DevtoolsDataSource::Insert(devtools_data_source);
  JNIEnvironment::ClearJEnvException(j_env);
  FOOTSTONE_DLOG(INFO) << kDevToolsTag << "OnCreateDevtools id=" << id;
  return footstone::checked_numeric_cast<uint32_t, jint>(id);
}

void OnDestroyDevtools(JNIEnv* j_env, __unused jobject j_object, jint j_devtools_id, jboolean j_is_reload) {
  auto devtools_id = static_cast<uint32_t>(j_devtools_id);
  auto devtools_data_source = devtools::DevtoolsDataSource::Find(devtools_id);
  devtools_data_source->Destroy(static_cast<bool>(j_is_reload));
  bool flag = devtools::DevtoolsDataSource::Erase(devtools_id);
  FOOTSTONE_DLOG(INFO) << kDevToolsTag << "OnDestroyDevtools devtools_id=" << devtools_id << ",flag=" << flag;
  FOOTSTONE_DCHECK(flag);
  JNIEnvironment::ClearJEnvException(j_env);
  worker_manager->Terminate();
}

void OnBindDevtools(JNIEnv* j_env,
                    __unused jobject j_object,
                    jint j_devtools_id,
                    jint j_driver_id,
                    jint j_dom_id,
                    jint j_render_id) {
  auto devtools_id = static_cast<uint32_t>(j_devtools_id);
  auto devtools_data_source = devtools::DevtoolsDataSource::Find(devtools_id);
  auto dom_manager_id = footstone::check::checked_numeric_cast<jint, uint32_t>(j_dom_id);
  std::any dom_manager;
  auto flag = hippy::global_data_holder.Find(dom_manager_id, dom_manager);
  FOOTSTONE_CHECK(flag);
  auto dom_manager_object = std::any_cast<std::shared_ptr<DomManager>>(dom_manager);
  devtools_data_source->Bind(dom_manager_object);
}

void OnAttachToRoot(JNIEnv* j_env,
                    __unused jobject j_object,
                    jint j_devtools_id,
                    jint j_root_id) {
  auto& root_map = RootNode::PersistentMap();
  std::shared_ptr<RootNode> root_node;
  uint32_t root_id = footstone::check::checked_numeric_cast<jint, uint32_t>(j_root_id);
  auto ret = root_map.Find(root_id, root_node);
  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << kDevToolsTag << "OnAttachToRoot root_node is nullptr";
    return;
  }
  FOOTSTONE_DLOG(INFO) << kDevToolsTag << "OnAttachToRoot root_id=" << root_id;
  auto devtools_id = static_cast<uint32_t>(j_devtools_id);
  auto devtools_data_source = devtools::DevtoolsDataSource::Find(devtools_id);
  devtools_data_source->SetRootNode(root_node);
}

/**
 * @brief get DevtoolsDataSource instance for related devtools_id
 */
std::shared_ptr<DevtoolsDataSource> GetDevtoolsDataSource(jint j_devtools_id) {
  std::any devtools_instance;
  bool flag = hippy::global_data_holder.Find(
      footstone::checked_numeric_cast<jint, uint32_t>(j_devtools_id),
      devtools_instance);
  FOOTSTONE_CHECK(flag);
  return std::any_cast<std::shared_ptr<DevtoolsDataSource>>(devtools_instance);
}

// call from java for network start request
void OnNetworkRequestInvoke(JNIEnv* j_env,
                            __unused jobject j_object,
                            jint j_devtools_id,
                            jstring j_request_id,
                            jobject j_holder) {
  auto request_id = StringViewUtils::ToStdString(StringViewUtils::ConvertEncoding(
      JniUtils::ToStrView(j_env, j_request_id), footstone::string_view::Encoding::Utf8).utf8_value());
  auto resource_holder = ResourceHolder::Create(j_holder);
  auto uri = StringViewUtils::ToStdString(StringViewUtils::ConvertEncoding(
          resource_holder->GetUri(j_env), string_view::Encoding::Utf8).utf8_value());
  auto req_meta = resource_holder->GetReqMeta(j_env);
  // call devtools
  std::shared_ptr<DevtoolsDataSource> devtools_data_source = GetDevtoolsDataSource(j_devtools_id);
  if (devtools_data_source) {
    hippy::devtools::SentRequest(devtools_data_source->GetNotificationCenter()->network_notification,
                                 request_id,
                                 uri,
                                 req_meta);
  }
  JNIEnvironment::ClearJEnvException(j_env);
}

// call from java for network end response
void OnNetworkResponseInvoke(JNIEnv* j_env,
                             __unused jobject j_object,
                             jint j_devtools_id,
                             jstring j_request_id,
                             jobject j_holder) {
  auto request_id = StringViewUtils::ToStdString(StringViewUtils::ConvertEncoding(
    JniUtils::ToStrView(j_env, j_request_id), string_view::Encoding::Utf8).utf8_value());
  auto resource_holder = ResourceHolder::Create(j_holder);
  auto code = static_cast<int>(resource_holder->GetCode(j_env));
  auto req_meta = resource_holder->GetReqMeta(j_env);
  auto rsp_meta = resource_holder->GetRspMeta(j_env);
  auto content = resource_holder->GetContent(j_env);
  std::shared_ptr<DevtoolsDataSource> devtools_data_source = GetDevtoolsDataSource(j_devtools_id);
  if (devtools_data_source) {
    hippy::devtools::ReceivedResponse(devtools_data_source->GetNotificationCenter()->network_notification,
                                      request_id,
                                      code,
                                      content,
                                      rsp_meta,
                                      req_meta);
  }
  JNIEnvironment::ClearJEnvException(j_env);
}
}  // namespace hippy::devtools
