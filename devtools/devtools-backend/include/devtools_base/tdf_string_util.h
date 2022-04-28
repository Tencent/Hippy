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
#include <sstream>
#include <string>
#include <vector>

namespace hippy::devtools {

/**
 * @brief TDF devtools 字符串工具类
 */
class TDFStringUtil {
 public:
  /**
   * @brief 分割字符串方法
   * @param origin 原始字符串
   * @param split_tag 分割字符串的标志
   * @return 分割后的字符串数组
   */
  static std::vector<std::string> SplitString(const std::string& origin, const std::string& split_tag);

  /**
   * @brief 去除字符串首尾空格方法
   * @param origin 原始字符串
   * @return 调整后的字符串
   */
  static std::string TrimmingStringWhitespace(const std::string& origin);

  /**
   * @brief 驼峰转换方法
   *        将 aa-bb 类型的字符串转换成驼峰 aaBb
   * @param origin 原始字符串
   * @return 调整后的字符串
   */
  static std::string Camelize(const std::string& origin);

  /**
   * @brief 逆驼峰转换方法
   *        将驼峰还原 aaBb -> aa-bb
   * @param origin 原始字符串
   * @return 调整后的字符串
   */
  static std::string UnCamelize(const std::string& origin);

  /**
   * @brief 简易字符化方法
   * @tparam T
   * @param value 需要字符化的对象
   * @return
   */
  template <typename T>
  static std::string Characterization(T value) {
    std::stringstream temp_stream;
    temp_stream << value;
    return temp_stream.str();
  }
};

}  // namespace hippy::devtools
