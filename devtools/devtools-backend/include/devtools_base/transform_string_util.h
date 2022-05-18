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

#include <algorithm>
#include <cctype>
#include <sstream>
#include <string>
#include "module/inspect_props.h"
#include "nlohmann/json.hpp"

namespace hippy::devtools {

#define ENUM_TO_STR(enu) #enu

constexpr char kNodeLocationDefaultValue[] = "[0, 0, 0, 0, 0, 0, 0, 0, 0]";

/**
 * @brief responsible for converting the util of each type to string
 **/
class TransformStringUtil {
 public:

  static std::string ToLower(std::string name) {
    transform(name.begin(), name.end(), name.begin(), ::tolower);
    return name;
  }

  static std::string ReplaceUnderLine(std::string enum_name) {
    replace(enum_name.begin(), enum_name.end(), '_', '-');
    return enum_name;
  }

  /**
   * @brief convert number (int, long, etc.) to string
   * @param number Any type of number
   */
  template <typename T>
  static std::string NumbertoString(const T& number) {
    std::string number_string;
    std::stringstream ss;
    ss << number;
    ss >> number_string;
    return number_string;
  }

  /**
   * @brief handles escape characters in strings
   */
  static std::string HandleEscapeCharacter(std::string resource_str) {
    if (!resource_str.length()) {
      return "";
    }
    std::string original_escape_character = "\"", new_escape_character = "\\\"";
    std::string::size_type pos = 0;
    while ((pos = resource_str.find(original_escape_character, pos)) != std::string::npos) {
      resource_str.replace(pos, original_escape_character.length(), new_escape_character);
      pos += 2;  // since the length increases by 1 after the substitution, we need to skip the current character being replaced, so +2
    }
    return resource_str;
  }

  /**
   * populate the default protocol data for the DOM Node to ensure that the location is not empty
   * @param style single-node style
   * @return contains data for the Location protocol
   */
  static std::string CombineNodeDefaultValue(std::string style) {
    nlohmann::json style_json = nlohmann::json::parse(style);
    if (!style_json.contains(kBorder)) {
      style_json[kBorder] = nlohmann::json::parse(kNodeLocationDefaultValue);
    }
    if (!style_json.contains(kMargin)) {
      style_json[kMargin] = nlohmann::json::parse(kNodeLocationDefaultValue);
    }
    if (!style_json.contains(kPadding)) {
      style_json[kPadding] = nlohmann::json::parse(kNodeLocationDefaultValue);
    }
    return style_json.dump();
  }
};

}  // namespace hippy::devtools
