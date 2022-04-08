//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by ivanfanwu on 2021/7/13.
//

#pragma once

#include <map>
#include <memory>
#include <string>
#include "api/devtools_data_channel.h"
#include "module/domain/base_domain.h"
#include "module/inspect_event.h"

namespace tdf {
namespace devtools {
class BaseDomain;

/**
 * @brief Domain 分发处理器，包括俩部分：1、chrome debugging protocol， 2、自定义的 protocol
 */
class DomainDispatch : public std::enable_shared_from_this<DomainDispatch> {
 public:
  explicit DomainDispatch(std::shared_ptr<DataChannel> data_channel) : data_channel_(data_channel) {}

  std::shared_ptr<DataChannel> GetDataChannel() { return data_channel_; }

  /**
   * @brief 注册 domain handler
   */
  void RegisterDomainHandler(const std::shared_ptr<BaseDomain>& domain);

  /**
   * @brief 清楚注册的  domain handler
   */
  void ClearDomainHandler();

  /**
   * @brief 从 frontend 收到消息
   * @param 从 frontend 发过来的消息体
   */
  bool ReceiveDataFromFrontend(std::string data);

  void DispatchToV8(std::string data);

  /**
   * @brief 回包给 frontend
   * @param 回包的结果数据
   */
  void SendDataToFrontend(int32_t id, const std::string& result, const std::string& error_code);

  /**
   * @brief 主动抛 event 事件给 frontend
   * @param event 回包的 event，需要实现 ToJsonString
   */
  void SendEventToFrontend(const InspectEvent&& event);

  /**
   * @brief 注册 JSDebugger Domain 事件
   */
  void RegisterJSDebuggerDomainListener();

  void SetResponseHandler(std::function<void(const std::string)> rsp_handler) { rsp_handler_ = rsp_handler; }

  /**
   * @brief 注册默认 Domain 事件的监听
   */
  void RegisterDefaultDomainListener();

 private:
  std::map<std::string, std::shared_ptr<BaseDomain>> domain_register_map_;
  std::function<void(const std::string)> rsp_handler_;
  std::shared_ptr<DataChannel> data_channel_;
};

}  // namespace devtools
}  // namespace tdf
