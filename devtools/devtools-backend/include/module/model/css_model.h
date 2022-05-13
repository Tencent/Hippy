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
 * @brief CSS Model, @see https://chromedevtools.github.io/devtools-protocol/tot/CSS/
 */
class CssModel : public BaseModel {
 public:
  CssModel();

  /**
   * @brief create css mode by json
   * @param json css struct
   * @return CSSModel
   */
  static CssModel CreateModel(const nlohmann::json& json);

  /**
   * @brief css method to getMatchedStyles
   * @return style json
   */
  nlohmann::json BuildMatchedStylesResponseJson();

  /**
   * @brief css method to getComputedStyle
   * @return style json
   */
  nlohmann::json BuildComputedStyleResponseJson();

  /**
   * @brief css method to getInlineStyles
   * @return style json
   */
  static nlohmann::json BuildInlineStylesResponseJson();

  /**
   * @brief css method to setStyleTexts, it will effect the display
   * @return style json
   */
  nlohmann::json UpdateDomTreeAndGetStyleTextJson(const nlohmann::json& text);

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
  nlohmann::json BuildComputedStyle();
  nlohmann::json BuildCssStyle();
  std::vector<hippy::devtools::CssStyleMetas> BuildStyleTextValue(const std::string& text_value);
  bool ContainsStyleKey(const std::string& key);
  static nlohmann::json BuildStylePropertyJson(const std::string& name, const std::string& value);
  static nlohmann::json BuildCssPropertyJson(const std::string& name, const std::string& value,
                                             const nlohmann::json& source_range);
  static nlohmann::json BuildRangeJson(int32_t start_line, int32_t start_column, int32_t end_line, int32_t end_column);
  static std::string ConvertValueToEnum(const std::vector<std::string>& options, const std::string& value);

  nlohmann::json style_ = nlohmann::json::object();
  std::map<std::string, std::string> box_model_require_map_;
  std::set<std::string> style_number_set_;
  std::map<std::string, std::vector<std::string>> style_enum_map_;
  int32_t node_id_ = 0;
  double width_ = 0;
  double height_ = 0;
};
}  // namespace hippy::devtools
