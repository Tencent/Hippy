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

#pragma once
#include <memory>
#include <string>

namespace tdf {
namespace devtools {

/**
 * @brief 使用框架
 */
enum class Framework {
  kHippy,
  kVl,
  kTdf
};

/**
 * @brief 调试通道
 */
enum Tunnel {
  kWebSocket,  // WebSocket 通道，支持无线局域网/公网，或 Android 有线
  kTcp,  // 有线连接 TCP 通道，相比 WS 对 iOS 可使用 Chrome 调试 JSC（console、source、memory）
  kInterface  // CDP 协议接口调用方式，业务方搭建调试通道
};

/**
 * @brief Devtools Config 调试配置注入
 */
struct DevtoolsConfig {
  /**
   * @brief 当前框架名称，是否需要渲染框架
   */
  Framework framework = Framework::kHippy;

  /**
   * @brief 调试通道
   */
  Tunnel tunnel = Tunnel::kTcp;

  std::string ws_url;  // ws 通道设置的 url
};
}  // namespace devtools
}  // namespace tdf
