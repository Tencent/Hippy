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

#include <map>
#include <memory>
#include <string>
#include "api/devtools_data_provider.h"
#include "api/devtools_notification_center.h"
#include "devtools_base/domain_propos.h"
#include "devtools_base/error.h"
#include "module/inspect_event.h"
#include "module/inspect_props.h"

namespace hippy {
namespace devtools {

class DomainDispatch;
/**
 * @brief domain 处理基类，封装与 frontend 交互发消息的基础方法，并对 frontend 调用的 method 进行分发处理
 */
class BaseDomain {
 public:
  explicit BaseDomain(std::weak_ptr<DomainDispatch> dispatch) : dispatch_(dispatch) {}

  /**
   * @brief 当前 domain 名称
   */
  virtual std::string_view GetDomainName() = 0;

  /**
   * @brief 注册 domain 下面的方法
   */
  virtual void RegisterMethods() = 0;

  /**
   * @brief 处理 domain 的开关事件
   * @param id 唯一自增 id
   * @param method 调用命令
   * @return 是开关事件就返回 true，并直接回包
   */
  bool HandleDomainSwitchEvent(int32_t id, const std::string& method);

  /**
   * @brief 成功时的回包
   * @param id：Frontend传过来的id
   * @param result：回包结果数据
   */
  void ResponseResultToFrontend(int32_t id, const std::string& result);

  /**
   * @brief 失败时的回包
   * @param id Frontend 传过来的 id
   * @param error_code 错误码
   * @param error_msg 错误信息
   */
  void ResponseErrorToFrontend(int32_t id, const int32_t error_code, const std::string& error_msg);

  /**
   * @brief 抛 event 事件给 frontend
   * @param event 回包的 event，需要实现 ToJsonString
   */
  void SendEventToFrontend(const InspectEvent&& event);

 protected:
  /**
   * @brief 处理 frontend 发过来的 method
   * @param id 唯一自增 id
   * @param method 调用命令
   * @param params 调用参数
   */
  bool HandleFrontendMethod(int32_t id, const std::string& method, const std::string& params);

  std::weak_ptr<DomainDispatch> dispatch_;

  std::shared_ptr<DataProvider> GetDataProvider();

  std::shared_ptr<NotificationCenter> GetNotificationCenter();

 private:
  std::string name_;
};

}  // namespace devtools
}  // namespace hippy
