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

#include "module/model/css_model.h"
#include <algorithm>
#include <regex>
#include <sstream>
#include "api/devtools_backend_service.h"
#include "devtools_base/logging.h"
#include "devtools_base/parse_json_util.h"
#include "devtools_base/tdf_string_util.h"
#include "module/inspect_props.h"

namespace hippy::devtools {

// json key
constexpr char kComputedStyleKey[] = "computedStyle";
constexpr char kInlineStyleKey[] = "inlineStyle";
constexpr char kNodeId[] = "nodeId";
constexpr char kStyleSheetIdKey[] = "styleSheetId";
constexpr char kCssPropertiesKey[] = "cssProperties";
constexpr char kShorthandEntriesKey[] = "shorthandEntries";
constexpr char kCssTextKey[] = "cssText";
constexpr char kRangeKey[] = "range";
constexpr char kStyleKey[] = "style";
constexpr char kStyleNameKey[] = "name";
constexpr char kStyleValueKey[] = "value";
constexpr char kStyleImportantKey[] = "important";
constexpr char kStyleImplicitKey[] = "implicit";
constexpr char kStyleTextKey[] = "text";
constexpr char kStyleParsedOKKey[] = "parsedOk";
constexpr char kStyleDisabledKey[] = "disabled";
constexpr char kStyleRangeKey[] = "range";
constexpr char kStyleStartLineKey[] = "startLine";
constexpr char kStyleStartColumnKey[] = "startColumn";
constexpr char kStyleEndLineKey[] = "endLine";
constexpr char kStyleEndColumnKey[] = "endColumn";
constexpr char kUpdateNodeIdKey[] = "id";
constexpr char kUpdateNodeInfoKey[] = "updateInfo";
constexpr char kDefaultLength[] = "0";
constexpr char kDefaultDisplay[] = "block";
constexpr char kDefaultPosition[] = "relative";

CssModel::CssModel() {
  InitializeBoxModelRequireMap();
  InitializeStyleNumberMap();
  InitializeStyleEnumMap();
}

CssModel CssModel::CreateModel(const nlohmann::json& json) {
  assert(json.is_object());
  CssModel model;
  model.SetNodeId(TDFParseJSONUtil::GetJSONValue(json, kNodeId, 0));
  model.SetWidth(TDFParseJSONUtil::GetJSONValue(json, kWidth, 0.0));
  model.SetHeight(TDFParseJSONUtil::GetJSONValue(json, kHeight, 0.0));
  model.SetStyle(TDFParseJSONUtil::GetJSONValue(json, kStyleKey, nlohmann::json::object()));
  return model;
}

nlohmann::json CssModel::BuildMatchedStylesResponseJson() {
  auto matched_styles_json = nlohmann::json::object();
  matched_styles_json[kInlineStyleKey] = BuildCssStyle();
  return matched_styles_json;
}

nlohmann::json CssModel::BuildComputedStyleResponseJson() {
  auto computed_style_json = nlohmann::json::object();
  computed_style_json[kComputedStyleKey] = BuildComputedStyle();
  return computed_style_json;
}

nlohmann::json CssModel::BuildInlineStylesResponseJson() {
  // inline style use be in GetMatchedStylesJSON, so don't handle now
  return nlohmann::json::object();
}

nlohmann::json CssModel::UpdateDomTreeAndGetStyleTextJson(const nlohmann::json& text) {
  if (!provider_) {
    return nlohmann::json::object();
  }
  if (text.empty()) {
    return nlohmann::json::object();
  }
  auto text_it = text.find(kStyleTextKey);
  if (text_it == text.end()) {
    return nlohmann::json::object();
  }
  auto text_value = text_it.value();
  if (!text_value.is_string() || text_value.empty()) {
    return nlohmann::json::object();
  }

  auto update_info = BuildStyleTextValue(text_value);
  UpdateDomNodeMetas result_metas(node_id_, update_info);
  auto dom_tree_adapter = provider_->dom_tree_adapter;
  if (dom_tree_adapter) {
    auto update_node_id = node_id_;
    dom_tree_adapter->UpdateDomTree(result_metas, [update_node_id](const bool is_success) {
      BACKEND_LOGI(TDF_BACKEND, "CSS, update dom tree, id: %ld, success: %d", update_node_id, is_success);
    });
  }
  return BuildCssStyle();
}

nlohmann::json CssModel::BuildComputedStyle() {
  auto computed_styles = nlohmann::json::array();
  if (style_.empty()) {
    return computed_styles;
  }
  for (auto& prop : style_.items()) {
    auto& key = prop.key();
    if (!ContainsStyleKey(key)) {
      continue;
    }
    // width and height are not taken from style, but from the actual render result
    if (key == kWidth) {
      computed_styles.emplace_back(BuildStylePropertyJson(TDFStringUtil::UnCamelize(kWidth), std::to_string(width_)));
      continue;
    }
    if (key == kHeight) {
      computed_styles.emplace_back(BuildStylePropertyJson(TDFStringUtil::UnCamelize(kHeight), std::to_string(height_)));
      continue;
    }
    auto value = prop.value();
    if (!value.is_string()) {
      value = TDFStringUtil::ToString(value);
    }
    computed_styles.emplace_back(BuildStylePropertyJson(TDFStringUtil::UnCamelize(key), value));
  }

  for (auto& box_model : box_model_require_map_) {
    auto style_it = style_.find(box_model.first);
    if (style_it == style_.end()) {
      computed_styles.emplace_back(
          BuildStylePropertyJson(TDFStringUtil::UnCamelize(box_model.first), box_model.second));
    }
  }
  return computed_styles;
}

nlohmann::json CssModel::BuildCssStyle() {
  auto style_json = nlohmann::json::object();
  if (style_.empty()) {
    return style_json;
  }
  auto css_properties = nlohmann::json::array();
  std::string all_of_css_text;
  for (auto& prop : style_.items()) {
    if (!ContainsStyleKey(prop.key())) {
      continue;
    }
    auto css_name = TDFStringUtil::UnCamelize(prop.key());
    auto prop_value = prop.value();
    if (!prop_value.is_string()) {
      prop_value = TDFStringUtil::ToString(prop_value);
    }
    // css_value can be numbers or strings, so stringstream is used
    std::string css_value = prop_value;
    std::string css_text = css_name + ":" + css_value;
    auto source_range =
        BuildRangeJson(0, all_of_css_text.length(), 0, all_of_css_text.length() + css_text.length() + 1);
    auto css_property = BuildCssPropertyJson(css_name, css_value, source_range);
    css_properties.emplace_back(css_property);
    all_of_css_text = all_of_css_text.append(css_text).append(";");
  }
  style_json[kStyleSheetIdKey] = node_id_;
  style_json[kCssPropertiesKey] = css_properties;
  style_json[kShorthandEntriesKey] = nlohmann::json::object();
  style_json[kCssTextKey] = all_of_css_text;
  style_json[kRangeKey] = BuildRangeJson(0, 0, 0, all_of_css_text.length());
  return style_json;
}

std::vector<CssStyleMetas> CssModel::BuildStyleTextValue(const std::string& text_value) {
  if (text_value.empty()) {
    return {};
  }
  auto text_list = TDFStringUtil::SplitString(text_value, ";");
  auto update_info = std::vector<CssStyleMetas>{};
  for (auto& property : text_list) {
    auto found = property.find(":");
    if (found == std::string::npos) {
      continue;
    }
    auto key = property.substr(0, found);
    auto value = property.substr(found + 1, property.length());
    // remove useless space line
    value = TDFStringUtil::TrimmingString(value);
    key = TDFStringUtil::Camelize(TDFStringUtil::TrimmingString(key));
    // if number type，then need change to double
    if (style_number_set_.find(key) != style_number_set_.end() && value.length()) {
      auto double_value = std::stod(value);
      style_[key] = double_value;
      update_info.emplace_back(key, double_value);
    }
    auto enum_it = style_enum_map_.find(key);
    if (enum_it != style_enum_map_.end()) {
      value = ConvertValueToEnum(enum_it->second, value);
      style_[key] = value;
      update_info.emplace_back(key, value);
    }
  }
  return update_info;
}

bool CssModel::ContainsStyleKey(const std::string& key) {
  return style_number_set_.find(key) != style_number_set_.end() || style_enum_map_.find(key) != style_enum_map_.end();
}

nlohmann::json CssModel::BuildStylePropertyJson(const std::string& name, const std::string& value) {
  auto result = nlohmann::json::object();
  result[kStyleNameKey] = name;
  result[kStyleValueKey] = value;
  return result;
}

nlohmann::json CssModel::BuildCssPropertyJson(const std::string& name, const std::string& value,
                                              const nlohmann::json& source_range) {
  auto css_property = nlohmann::json::object();
  css_property[kStyleNameKey] = name;
  css_property[kStyleValueKey] = value;
  css_property[kStyleImportantKey] = false;
  css_property[kStyleImplicitKey] = false;
  css_property[kStyleTextKey] = "";
  css_property[kStyleParsedOKKey] = true;
  css_property[kStyleDisabledKey] = false;
  css_property[kStyleRangeKey] = source_range;
  return css_property;
}

nlohmann::json CssModel::BuildRangeJson(int32_t start_line, int32_t start_column, int32_t end_line,
                                        int32_t end_column) {
  auto range_json = nlohmann::json::object();
  range_json[kStyleStartLineKey] = start_line;
  range_json[kStyleStartColumnKey] = start_column;
  range_json[kStyleEndLineKey] = end_line;
  range_json[kStyleEndColumnKey] = end_column;
  return range_json;
}

std::string CssModel::ConvertValueToEnum(const std::vector<std::string>& options, const std::string& value) {
  if (options.empty()) {
    return value;
  }
  for (auto& option : options) {
    if (option == value) {
      return value;
    }
  }
  return options[0];
}

void CssModel::InitializeBoxModelRequireMap() {
  box_model_require_map_[kPaddingTop] = kDefaultLength;
  box_model_require_map_[kPaddingLeft] = kDefaultLength;
  box_model_require_map_[kPaddingRight] = kDefaultLength;
  box_model_require_map_[kPaddingBottom] = kDefaultLength;
  box_model_require_map_[kBorderTopWidth] = kDefaultLength;
  box_model_require_map_[kBorderLeftWidth] = kDefaultLength;
  box_model_require_map_[kBorderRightWidth] = kDefaultLength;
  box_model_require_map_[kBorderBottomWidth] = kDefaultLength;
  box_model_require_map_[kMarginTop] = kDefaultLength;
  box_model_require_map_[kMarginLeft] = kDefaultLength;
  box_model_require_map_[kMarginRight] = kDefaultLength;
  box_model_require_map_[kMarginBottom] = kDefaultLength;
  box_model_require_map_[kDisplay] = kDefaultDisplay;
  box_model_require_map_[kPosition] = kDefaultPosition;
}

void CssModel::InitializeStyleNumberMap() {
  style_number_set_ = {kFlex,
                       kFlexGrow,
                       kFlexShrink,
                       kFlexBasis,
                       kWidth,
                       kHeight,
                       kMaxWidth,
                       kMinWidth,
                       kMaxHeight,
                       kMinHeight,
                       kMarginTop,
                       kMarginLeft,
                       kMarginRight,
                       kMarginBottom,
                       kPaddingTop,
                       kPaddingLeft,
                       kPaddingRight,
                       kPaddingBottom,
                       kBorderWidth,
                       kBorderTopWidth,
                       kBorderLeftWidth,
                       kBorderRightWidth,
                       kBorderBottomWidth,
                       kBorderRadius,
                       kBorderTopLeftRadius,
                       kBorderTopRightRadius,
                       kBorderBottomLeftRadius,
                       kBorderBottomRightRadius,
                       kTop,
                       kLeft,
                       kRight,
                       kBottom,
                       kZIndex,
                       kOpacity,
                       kFontSize,
                       kLineHeight};
}

void CssModel::InitializeStyleEnumMap() {
  style_enum_map_[kDisplay] = {kDisplayFlex, kDisplayNone};
  style_enum_map_[kFlexDirection] = {kFlexDirectionColumn, kFlexDirectionColumnReverse, kFlexDirectionRow,
                                     kFlexDirectionRowReverse};
  style_enum_map_[kFlexWrap] = {kFlexWrapNowrap, kFlexWrapWrap, kFlexWrapWrapReverse};
  style_enum_map_[kAlignItems] = {kFlexStart, kCenter, kFlexEnd, kStretch, kBaseline};
  style_enum_map_[kAlignSelf] = {kAuto, kFlexStart, kCenter, kFlexEnd, kStretch, kBaseline};
  style_enum_map_[kJustifyContent] = {kFlexStart,
                                      kCenter,
                                      kFlexEnd,
                                      kJustifyContentSpaceBetween,
                                      kJustifyContentSpaceAround,
                                      kJustifyContentSpaceEvenly};
  style_enum_map_[kOverflow] = {kOverflowHidden, kOverflowVisible, kOverflowScroll};
  style_enum_map_[kPosition] = {kPositionRelative, kPositionAbsolute};
  style_enum_map_[kBackgroundSize] = {kAuto, kContain, kCover, kBackgroundSizeFit};
  style_enum_map_[kBackgroundPositionX] = {kLeft, kCenter, kRight};
  style_enum_map_[kBackgroundPositionY] = {kTop, kCenter, kBottom};
  style_enum_map_[kFontStyle] = {kNormal, kItalic};
  style_enum_map_[kFontWeight] = {kNormal,        kBold,          kFontWeight100, kFontWeight200,
                                  kFontWeight300, kFontWeight400, kFontWeight500, kFontWeight600,
                                  kFontWeight700, kFontWeight800, kFontWeight900};
  style_enum_map_[kTextAlign] = {kLeft, kCenter, kRight};
  style_enum_map_[kResizeMode] = {kCover, kContain, kStretch, kRepeat, kCenter};
}

}  // namespace hippy::devtools
