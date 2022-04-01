// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by sicilyliu on 2021/12/22.
//

#pragma once

#include <sstream>
#include <string>
#include "nlohmann/json.hpp"
#include "module/inspect_props.h"

namespace tdf {
namespace devtools {

#define ENUM_TO_STR(enu) #enu

constexpr const char* kNodeLocationDefaultValue = "[0, 0, 0, 0, 0, 0, 0, 0, 0]";

/**
 * @brief 负责各类型转换 string 的 util
 **/
class TransformStringUtil {
 public:
  template <typename T>
  /**
   * @brief 将 number 类型（包括int，long等）转成 string 类型
   * @param number 任何类型的数字
   */
  static std::string NumbertoString(const T& number) {
    std::string number_string;
    std::stringstream ss;
    ss << number;
    ss >> number_string;
    return number_string;
  }

  /**
   * @brief 处理字符串中的转义字符
   */
  static std::string HandleEscapeCharacter(std::string resource_str) {
    if (!resource_str.length()) {
      return "";
    }
    std::string original_escape_character = "\"", new_escape_character = "\\\"";
    std::string::size_type pos = 0;
    while ((pos = resource_str.find(original_escape_character, pos)) != std::string::npos) {
      resource_str.replace(pos, original_escape_character.length(), new_escape_character);
      pos += 2;  // 因为替换之后，长度增长了 1，还需跳过当前被替换的字符，所以 +2
    }
    return resource_str;
  }

  /**
   * 填充 DOM Node 默认的协议数据，保证 location 不为空
   * @param style 单节点样式
   * @return 包含 location 协议的数据
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

}  // namespace devtools
}  // namespace tdf
