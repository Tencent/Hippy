//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
//

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
