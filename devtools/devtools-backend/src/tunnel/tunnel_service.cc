/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
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

#include "tunnel/tunnel_service.h"
#include <sstream>
#include <utility>
#include "api/devtools_backend_service.h"
#include "devtools_base/logging.h"
#include "module/domain_dispatch.h"
#include "tunnel/tcp/tcp_channel.h"
#include "tunnel/ws/web_socket_channel.h"

namespace hippy::devtools {

constexpr int32_t kClose = 4003;
constexpr int32_t kReload = 4004;

TunnelService::TunnelService(std::shared_ptr<DomainDispatch>  dispatch, const DevtoolsConfig &config) : dispatch_(std::move(dispatch)) {
  dispatch_->SetResponseHandler([this](const std::string &rsp_data) { channel_->Send(rsp_data); });
  Connect(config);
}

void TunnelService::Connect(const DevtoolsConfig &devtools_config) {
  channel_ = NetChannel::CreateChannel(devtools_config);
  BACKEND_LOGI(TDF_BACKEND, "TunnelService, Start Connect.");
  channel_->Connect([this](void *buffer, ssize_t length, int flag) {
    if (flag == kTaskFlag) {
      HandleReceiveData(reinterpret_cast<char *>(buffer), static_cast<int32_t>(length));
    }
  });
}

void TunnelService::HandleReceiveData(const char *buffer, int32_t buffer_length) {
  std::string data(buffer, buffer + buffer_length);
  auto isInspectDomain = dispatch_->ReceiveDataFromFrontend(data);
  if (!isInspectDomain) {  // others send to v8 if use CDP
    dispatch_->DispatchToV8(data);
  }
}

void TunnelService::SendDataToFrontend(const std::string &rsp_data_string) { channel_->Send(rsp_data_string); }

void TunnelService::Close(bool is_reload) {
  channel_->Close(is_reload ? kReload : kClose, "");
  dispatch_->SetResponseHandler(nullptr);
}
}  // namespace hippy::devtools
