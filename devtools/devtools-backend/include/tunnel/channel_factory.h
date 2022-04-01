//
// Copyright (c) 2022 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 22/3/11.
//

#pragma once

#include <memory>
#include "api/devtools_config.h"
#include "tunnel/net_channel.h"

namespace tdf {
namespace devtools {

/**
 * @brief 根据业务需要创建不同的 NetChannel
 */
class ChannelFactory {
 public:
  static std::shared_ptr<NetChannel> CreateChannel(const DevtoolsConfig& config);
};

}  // namespace devtools
}  // namespace tdf
