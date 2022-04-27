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
#include <set>
#include <string>
#include <vector>
#include "api/adapter/data/update_dom_node_metas.h"
#include "module/model/base_model.h"
#include "nlohmann/json.hpp"

namespace hippy::devtools {

/**
 * @brief chrome devtools CSS 相关协议的数据类
 *        负责记录 Node CSS 相关数据及转成 chrome 协议需要的 JSON 格式
 *        chrome 协议参考 https://chromedevtools.github.io/devtools-protocol/tot/CSS/
 */
class CSSModel : public BaseModel {
 public:
  CSSModel();

  /**
   * @brief 快捷构造方法
   * @param json 上层给过来的 CSS 数据结构
   * @return CSSModel
   */
  static CSSModel CreateModelByJSON(const nlohmann::json& json);

  /**
   * @brief 获取chrome CSS getMatchedStyles所需JSON数据
   * @return JSON数据
   */
  nlohmann::json GetMatchedStylesJSON();

  /**
   * @brief 获取chrome CSS getComputedStyle所需JSON数据
   * @return JSON数据
   */
  nlohmann::json GetComputedStyleJSON();

  /**
   * @brief 获取chrome CSS getInlineStyles所需JSON数据
   * @return JSON数据
   */
  static nlohmann::json GetInlineStylesJSON();

  /**
   * @brief 获取chrome CSS setStyleTexts所需JSON数据
   * @return JSON数据
   */
  nlohmann::json GetStyleTextJSON(const nlohmann::json& text);

  void SetWidth(double width) { width_ = width; }
  constexpr double GetWidth() const { return width_; }

  void SetHeight(double height) { height_ = height; }
  constexpr double GetHeight() const { return height_; }

  void SetNodeId(int32_t node_id) { node_id_ = node_id; }
  constexpr int32_t GetNodeId() const { return node_id_; }

  void SetStyle(const nlohmann::json& style) { style_ = style; }
  nlohmann::json GetStyle() const { return style_; }

 private:
  void InitializeBoxModelRequireMap();
  void InitializeStyleNumberMap();
  void InitializeStyleEnumMap();
  nlohmann::json ParseComputedStyle();
  nlohmann::json ParseCSSStyle();
  std::vector<hippy::devtools::CSSStyleMetas> ParseStyleTextValue(const std::string& text_value);
  bool ContainsStyleKey(const std::string& key);
  static nlohmann::json GetStylePropertyJSON(const std::string& name, const std::string& value);
  static nlohmann::json GetCSSPropertyJSON(const std::string& name, const std::string& value,
                                           const nlohmann::json& source_range);
  static nlohmann::json GetRange(int32_t start_line, int32_t start_column, int32_t end_line, int32_t end_column);
  static std::string ConversionEnum(const std::vector<std::string>& options, const std::string& value);

  nlohmann::json style_ = nlohmann::json::object();
  std::map<std::string, std::string> box_model_require_map_;
  std::set<std::string> style_number_set_;
  std::map<std::string, std::vector<std::string>> style_enum_map_;
  int32_t node_id_ = 0;
  double width_ = 0;
  double height_ = 0;
};
}  // namespace devtools::devtools
