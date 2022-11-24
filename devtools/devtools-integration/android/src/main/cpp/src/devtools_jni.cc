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

#include "jni/jni_register.h"
#include "jni/jni_utils.h"
#include "jni/jni_env.h"
#include "jni/data_holder.h"
#include "footstone/string_view_utils.h"
#include "footstone/worker_manager.h"
#include "footstone/check.h"
#include "vfs/vfs_resource_holder.h"
#include "api/devtools_backend_service.h"
#include "devtools/vfs/devtools_handler.h"
#include "devtools/devtools_data_source.h"

namespace hippy::devtools {
using StringViewUtils = footstone::stringview::StringViewUtils;
using WorkerManager = footstone::runner::WorkerManager;

REGISTER_JNI("com/tencent/devtools/vfs/DevToolsProcessor", // NOLINT(cert-err58-cpp)
             "onNetworkRequest",
             "(Ijava/lang/String;Lcom/tencent/vfs/ResourceDataHolder;)V",
             OnNetworkRequestInvoke)

REGISTER_JNI("com/tencent/devtools/vfs/DevToolsProcessor", // NOLINT(cert-err58-cpp)
             "onNetworkResponse",
             "(Ijava/lang/String;Lcom/tencent/vfs/ResourceDataHolder;)V",
             OnNetworkResponseInvoke)

std::shared_ptr<DevtoolsDataSource> GetDevtoolsDataSource(jint j_devtools_id) {
  std::any devtools_instance;
  bool flag = hippy::global_data_holder.Find(
      footstone::checked_numeric_cast<jint, uint32_t>(j_devtools_id),
      devtools_instance);
  FOOTSTONE_CHECK(flag);
  return std::any_cast<std::shared_ptr<DevtoolsDataSource>>(devtools_instance);
}

void OnNetworkRequestInvoke(JNIEnv *j_env,
                            __unused jobject j_object,
                            jint j_devtools_id,
                            jstring j_request_id,
                            jobject j_holder) {
  auto request_id =
      footstone::StringViewUtils::ToStdString(footstone::StringViewUtils::ConvertEncoding(
          JniUtils::ToStrView(j_env, j_request_id),
          footstone::string_view::Encoding::Utf8).utf8_value());
  auto resource_holder = ResourceHolder::Create(j_holder);
  auto uri =
      footstone::StringViewUtils::ToStdString(footstone::StringViewUtils::ConvertEncoding(
          resource_holder->GetUri(j_env),
          footstone::string_view::Encoding::Utf8).utf8_value());
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

void OnNetworkResponseInvoke(JNIEnv *j_env,
                             __unused jobject j_object,
                             jint j_devtools_id,
                             jstring j_request_id,
                             jobject j_holder) {
  auto request_id =
      footstone::StringViewUtils::ToStdString(footstone::StringViewUtils::ConvertEncoding(
          JniUtils::ToStrView(j_env, j_request_id),
          footstone::string_view::Encoding::Utf8).utf8_value());
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

} // namespace hippy::devtools
