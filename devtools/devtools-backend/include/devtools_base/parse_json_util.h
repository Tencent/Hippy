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
#include "nlohmann/json.hpp"

namespace hippy::devtools {

/**
 * @brief TDF JSON 解析工具
 */
class TDFParseJSONUtil {
 public:
  /**
   * @brief 从 JSON 结构中获取对应 key 的值
   * @tparam T
   * @param json JSON数据
   * @param key 需要获取值的 key
   * @param default_value 若不存在 key 情况下的默认值
   * @return 结果值
   */
  template <typename T>
  static T GetJSONValue(const nlohmann::json &json, const std::string &key, T default_value) {
    if (json.contains(key)) {
      return json[key].get<T>();
    }
    return default_value;
  }
};

}  // namespace devtools::devtools
