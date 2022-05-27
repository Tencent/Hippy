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

namespace hippy::devtools {

class DomainDispatch;
/**
 * @brief abstract base domain, handle domain.method from frontend
 */
class BaseDomain {
 public:
  explicit BaseDomain(std::weak_ptr<DomainDispatch> dispatch) : dispatch_(dispatch) {}

  virtual ~BaseDomain() {}

  /**
   * @brief domain name
   */
  virtual std::string GetDomainName() = 0;

  /**
   * @brief register domain method
   */
  virtual void RegisterMethods() = 0;

  /**
   * @brief register domain callback
   */
  virtual void RegisterCallback() = 0;

  /**
   * @brief handle domain.enable and domain.disable switch
   * @param id
   * @param method
   * @return if switch enable or disable return true, else return false
   */
  bool HandleDomainSwitchEvent(int32_t id, const std::string& method);

  /**
   * @brief handle domain.method success response
   * @param id frontend id
   * @param result response result
   */
  void ResponseResultToFrontend(int32_t id, const std::string& result);

  /**
   * @brief handle domain.method fail response
   * @param id
   * @param error_code
   * @param error_msg
   */
  void ResponseErrorToFrontend(int32_t id, const int32_t error_code, const std::string& error_msg);

  /**
   * @brief send event to frontend
   * @param inspect event that need to implement ToJsonString
   */
  void SendEventToFrontend(InspectEvent&& event);

 protected:
  std::weak_ptr<DomainDispatch> dispatch_;

  std::shared_ptr<DataProvider> GetDataProvider();

  std::shared_ptr<NotificationCenter> GetNotificationCenter();

 private:
  std::string name_;
};

}  // namespace hippy::devtools
