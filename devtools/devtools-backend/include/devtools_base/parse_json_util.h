//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
//

#pragma once
#include <string>
#include "nlohmann/json.hpp"

namespace tdf {
namespace devtools {

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

}  // namespace devtools
}  // namespace tdf
