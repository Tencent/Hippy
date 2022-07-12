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
#include "footstone/macros.h"
#include "footstone/logging.h"
#include "module/domain_dispatch.h"
#include "tunnel/tcp/tcp_channel.h"
#include "tunnel/ws/web_socket_channel.h"

namespace hippy::devtools {

constexpr int32_t kClose = 4003;
constexpr int32_t kReload = 4004;

TunnelService::TunnelService(std::shared_ptr<DomainDispatch> dispatch, const DevtoolsConfig &devtools_config)
    : dispatch_(std::move(dispatch)) {
  channel_ = NetChannel::CreateChannel(devtools_config);
}

void TunnelService::Connect() {
  FOOTSTONE_DLOG(INFO) << "TunnelService, start connect.";
  channel_->Connect([WEAK_THIS](const std::string& msg, int flag) {
    if (flag == kTaskFlag) {
      DEFINE_AND_CHECK_SELF(TunnelService)
      self->HandleReceiveData(msg);
    }
  });
  dispatch_->SetResponseHandler([WEAK_THIS](const std::string &rsp_data) {
    DEFINE_AND_CHECK_SELF(TunnelService)
    self->channel_->Send(rsp_data);
  });
}

void TunnelService::HandleReceiveData(const std::string& msg) {
  auto is_inspect_domain = dispatch_->ReceiveDataFromFrontend(msg);
  if (!is_inspect_domain) {  // others send to VM if use CDP
    dispatch_->DispatchToVm(msg);
  }
}

void TunnelService::SendDataToFrontend(const std::string &rsp_data_string) { channel_->Send(rsp_data_string); }

void TunnelService::Close(bool is_reload) {
  channel_->Close(is_reload ? kReload : kClose, "");
  dispatch_->SetResponseHandler(nullptr);
}
}  // namespace hippy::devtools
