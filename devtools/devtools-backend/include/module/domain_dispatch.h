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
#include "api/devtools_data_channel.h"
#include "module/domain/base_domain.h"
#include "module/inspect_event.h"

namespace hippy::devtools {
class BaseDomain;

/**
 * @brief domain dispatch, including two parts protocol, 1. chrome debugging protocol， 2. self define protocol start with TDF_
 */
class DomainDispatch : public std::enable_shared_from_this<DomainDispatch> {
 public:
  explicit DomainDispatch(std::shared_ptr<DataChannel> data_channel) : data_channel_(data_channel) {}

  std::shared_ptr<DataChannel> GetDataChannel() { return data_channel_; }

  /**
   * @brief register domain handler which can handle Domain.Method
   */
  void RegisterDomainHandler(const std::shared_ptr<BaseDomain>& domain);

  /**
   * @brief clear domain register handler
   */
  void ClearDomainHandler();

  /**
   * @brief receive msg from frontend
   * @param params passing from frontend
   */
  bool ReceiveDataFromFrontend(const std::string& data);

  void DispatchToVM(const std::string& data);

  /**
   * @brief response to frontend after call ReceiveDataFromFrontend
   * @param result response
   */
  void SendDataToFrontend(int32_t id, const std::string& result, const std::string& error_code);

  /**
   * @brief send event to frontend if you want
   * @param event params that should be implemented ToJsonString
   */
  void SendEventToFrontend(InspectEvent&& event);

  /**
   * @brief register domain handler relative with JS engine
   */
  void RegisterJSDebuggerDomainListener();

  void SetResponseHandler(std::function<void(const std::string)> rsp_handler) { rsp_handler_ = rsp_handler; }

  /**
   * @brief register domain handler default
   */
  void RegisterDefaultDomainListener();

 private:
  std::map<std::string, std::shared_ptr<BaseDomain>> domain_register_map_;
  std::function<void(const std::string)> rsp_handler_;
  std::shared_ptr<DataChannel> data_channel_;
};

}  // namespace hippy::devtools
