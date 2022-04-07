//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by Jianguoxie on 29/7/2021.
//

#include "tunnel/tunnel_service.h"
#include <sstream>
#include "api/devtools_backend_service.h"
#include "devtools_base/logging.h"
#include "module/domain_dispatch.h"
#include "tunnel/channel_factory.h"
#include "tunnel/tcp/tcp_channel.h"
#include "tunnel/ws/web_socket_channel.h"

namespace tdf {
namespace devtools {

constexpr uint32_t kClose = 4003;
constexpr uint32_t kReload = 4004;

TunnelService::TunnelService(std::shared_ptr<DomainDispatch> dispatch, const DevtoolsConfig &devtools_config) {
  dispatch_ = dispatch;
  dispatch_->SetResponseHandler([this](const std::string &rsp_data) { channel_->Send(rsp_data); });
  Connect(devtools_config);
}

void TunnelService::Connect(const DevtoolsConfig &devtools_config) {
  channel_ = ChannelFactory::CreateChannel(devtools_config);
  BACKEND_LOGI(TDF_BACKEND, "TunnelService, Start Connect.");
  channel_->Connect([this](void *buffer, ssize_t length, int flag) {
    if (flag == TASK_FLAG) {
      HandleReceiveData(reinterpret_cast<char *>(buffer), static_cast<int32_t>(length));
    }
  });
}

void TunnelService::HandleReceiveData(const char *buffer, int32_t buffer_length) {
  std::string data(buffer, buffer + buffer_length);
  auto isInspectDomain = dispatch_->ReceiveDataFromFrontend(data);
  if (!isInspectDomain) {  // 其余的丢给 v8
    dispatch_->DispatchToV8(data);
  }
}

void TunnelService::SendDataToFrontend(const std::string &rsp_data_string) { channel_->Send(rsp_data_string); }

void TunnelService::Close(bool is_reload) {
  channel_->Close(is_reload ? kReload : kClose, "");
  channel_->Connect(nullptr);
  dispatch_->SetResponseHandler(nullptr);
}
}  // namespace devtools
}  // namespace tdf
