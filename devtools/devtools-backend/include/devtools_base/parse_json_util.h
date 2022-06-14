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
#include "devtools_json.h"

namespace hippy::devtools {

/**
 * @brief Tdf Json parsing tool
 */
class TdfParseJsonUtil {
 public:
  /**
   * @brief get the corresponding key value from the Json structure
   * @tparam T
   * @param json Json data
   * @param key the key that needs to be retrieved
   * @param default_value default value if no key exists
   * @return result value
   */
  template <typename T>
  static T GetJsonValue(const nlohmann::json &json, const std::string &key, T default_value) {
    if (json.contains(key)) {
      return json[key].get<T>();
    }
    return default_value;
  }
};

}  // namespace hippy::devtools
