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
 *     http://www.apache.org/licenses/LICENSE2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#include "driver/vm/jsh/inspector/jsh_inspector_client_impl.h"
#include <unistd.h>
#include "driver/napi/jsh/jsh_ctx.h"
#include "driver/scope.h"
#include "oh_napi/oh_napi_task_runner.h"

#define JSVM_INSPECTOR_PORT 9225

namespace hippy {
inline namespace driver {
inline namespace runtime {
inline namespace inspector {

void JSHInspectorClientImpl::ConnInspector() {
  get_url_conn_ = std::make_shared<JSHGetUrlConnection>();
  
  // 请求json body
  std::string body;
  bool ret = get_url_conn_->DoRequestJsonBody(body);
  if (!ret) {
    FOOTSTONE_LOG(ERROR) << "JSH conn inspector, req json fail.";
    return;
  }
  
  // 从body解析出web socket的url
  std::string wsUrl;
  ret = get_url_conn_->ParseWsUrlFromBody(body, wsUrl);
  if (!ret) {
    FOOTSTONE_LOG(ERROR) << "JSH conn inspector, parse ws url fail.";
    return;
  }
  
  get_url_conn_ = nullptr;
  
  // 建立调试连接
  debug_conn_ = std::make_shared<JSHDebugConnection>();
  debug_conn_->Connect(wsUrl, [WEAK_THIS](const std::string& msg) {
    DEFINE_AND_CHECK_SELF(JSHInspectorClientImpl)
    self->HandleRecvMessage(msg);
  });
}

void JSHInspectorClientImpl::HandleRecvMessage(const std::string& msg) {
  if (devtools_data_source_) {
    devtools_data_source_->GetNotificationCenter()->vm_response_notification->ResponseToFrontend(msg);
  }
}

void JSHInspectorClientImpl::CreateInspector(const std::shared_ptr<Scope>& scope) {
  // 主线程再连接 inspector 做中转
  OhNapiTaskRunner *taskRunner = OhNapiTaskRunner::Instance(nullptr);
  taskRunner->RunAsyncTask([WEAK_THIS]() {
    DEFINE_AND_CHECK_SELF(JSHInspectorClientImpl)
    sleep(1);
    self->ConnInspector();
  });

  // JS线程先打开 inspector
  auto ctx = std::static_pointer_cast<hippy::napi::JSHCtx>(scope->GetContext());
  auto env = ctx->env_;
  opened_jsvm_env_ = env;
  OH_JSVM_OpenInspector(env, "localhost", JSVM_INSPECTOR_PORT);
  OH_JSVM_WaitForDebugger(env, true);
}

void JSHInspectorClientImpl::DestroyInspector(bool is_reload) {
  if (opened_jsvm_env_) {
    OH_JSVM_CloseInspector(opened_jsvm_env_);
    opened_jsvm_env_ = nullptr;
  }
}

void JSHInspectorClientImpl::SendMessageToJSH(const std::string&& msg) {
  if (debug_conn_) {
    debug_conn_->Send(msg);
  }
}

} // namespace inspector
} // namespace runtime
} // namespace driver
} // namespace hippy
