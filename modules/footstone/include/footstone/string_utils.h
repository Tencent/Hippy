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

namespace footstone {
inline namespace utils {

/**
 * @brief string utils class, for split, trim and camelize
 */
class StringUtils {
 public:
  /**
   * @brief split string method
   * @param origin origin string
   * @param split_tag flag to split a string
   * @return array of partitioned strings
   */
  static std::vector <std::string>
  SplitString(const std::string &origin, const std::string &split_tag);

  /**
   * @brief method to remove whitespace at the beginning and end of a string
   * @param origin origin string
   * @return adjusted string
   */
  static std::string TrimmingString(const std::string &origin);

  /**
   * @brief hump conversion method
   *        converts a string of type aa-bb to a hump aaBb
   * @param origin origin string
   * @return the adjusted string
   */
  static std::string Camelize(const std::string &origin);

  /**
   * @brief inverse hump conversion method
   *        restore the hump to aaBb -> aa-bb
   * @param origin origin string
   * @return the adjusted string
   */
  static std::string UnCamelize(const std::string &origin);

  /**
   * @brief simple characterization method
   * @param value object that needs to be characterized
   * @return std::string
   */
  template<typename T>
  static std::string ToString(T value) {
    std::stringstream temp_stream;
    temp_stream << value;
    return temp_stream.str();
  }
};

}
}
