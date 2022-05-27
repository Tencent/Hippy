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

#include <string>
#include <utility>
#include "module/inspect_props.h"

namespace hippy::devtools {

/**
 * @brief inspect event when you need send data to frontend but not reponse to frontend
 */
struct InspectEvent {
  /**
   * @brief event constructor
   * @param method method name
   * @param params data string
   */
  InspectEvent(const std::string& method, std::string&& params) {
    method_ = method;
    params_ = std::move(params);  // the params will be so large, like sometimes more 1M, then use move to improve performance
  }

  /**
   * @brief change data to cdp event json string
   */
  std::string ToJsonString() const {
    std::string result = "{\"";
    result += kFrontendKeyMethod;
    result += "\":\"";
    result += method_;
    result += "\",\"";
    result += kFrontendKeyParams;
    result += "\":";
    result += params_;
    result += "}";
    return result;
  }

 private:
  std::string method_;
  std::string params_;
};

}  // namespace hippy::devtools
