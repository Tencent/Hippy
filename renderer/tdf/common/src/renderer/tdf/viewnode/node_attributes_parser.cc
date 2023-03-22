/**
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

#include "renderer/tdf/viewnode/node_attributes_parser.h"

#include "footstone/logging.h"
#include "renderer/tdf/viewnode/view_node.h"

namespace hippy {
inline namespace render {
inline namespace tdf {
namespace util {

Color ConversionIntToColor(uint32_t value) {
  uint8_t alpha = (0xFF & (value >> 24));
  uint8_t red = (0xFF & (value >> 16));
  uint8_t green = (0xFF & (value >> 8));
  uint8_t blue = (0xFF & (value >> 0));
  return Color::ARGB(alpha, red, green, blue);
}

bool ConvertDirectionToPoint(const std::string& direction, Point& begin_point, Point& end_point) {
  bool is_converted = false;
  if (!direction.empty()) {
    if (direction == "totop") {
      begin_point = Point::Make(0.5, 1);
      end_point = Point::Make(0.5, 0);
      is_converted = true;
    } else if (direction == "totopright") {
      begin_point = Point::Make(0, 1);
      end_point = Point::Make(1, 0);
      is_converted = true;
    } else if (direction == "toright") {
      begin_point = Point::Make(0, 0.5);
      end_point = Point::Make(1, 0.5);
      is_converted = true;
    } else if (direction == "tobottomright") {
      begin_point = Point::Make(0, 0);
      end_point = Point::Make(1, 1);
      is_converted = true;
    } else if (direction == "tobottom") {
      begin_point = Point::Make(0.5, 0);
      end_point = Point::Make(0.5, 1);
      is_converted = true;
    } else if (direction == "tobottomleft") {
      begin_point = Point::Make(1, 0);
      end_point = Point::Make(0, 1);
      is_converted = true;
    } else if (direction == "toleft") {
      begin_point = Point::Make(1, 0.5);
      end_point = Point::Make(0, 0.5);
      is_converted = true;
    } else if (direction == "totopleft") {
      begin_point = Point::Make(1, 1);
      end_point = Point::Make(0, 0);
      is_converted = true;
    }
  }
  return is_converted;
}

void ParseLinearGradientInfo(tdfcore::View& view, const footstone::HippyValue::HippyValueObjectType& gradient_map) {
  auto degree = gradient_map.find("angle");
  Point gradient_begin_ = Point::Make(0, 1);
  Point gradient_end_ = Point::Make(0, 0);
  float gradient_rotate_degree_ = 0;
  if (degree != gradient_map.end()) {
    auto direction = degree->second.ToStringChecked();
    if (!ConvertDirectionToPoint(direction, gradient_begin_, gradient_end_)) {
      gradient_rotate_degree_ = std::stof(direction);
    }
  }
  std::vector<Color> gradient_colors_;
  std::vector<float> gradient_stops_;
  auto color_stop_list = gradient_map.find("colorStopList");
  if (color_stop_list != gradient_map.end()) {
    auto color_stops = color_stop_list->second.ToArrayChecked();
    gradient_stops_.clear();
    gradient_colors_.clear();
    for (auto& child : color_stops) {
      if (child.IsObject()) {
        auto object = child.ToObjectChecked();
        auto color = object.find("color");
        auto ratio = object.find("ratio");
        if (color != object.end() && ratio != object.end()) {
          gradient_colors_.push_back(ConversionIntToColor(static_cast<uint32_t>(color->second.ToDoubleChecked())));
          gradient_stops_.push_back(static_cast<float>(ratio->second.ToDoubleChecked()));
        }
      }
    }
  }
  if (gradient_colors_.empty() || gradient_colors_.size() != gradient_stops_.size()) {
    return;
  }
  auto gradient = TDF_MAKE_SHARED(tdfcore::LinearGradient, gradient_begin_, gradient_end_, gradient_colors_,
                                  gradient_stops_, tdfcore::TileMode::kClamp, gradient_rotate_degree_);
  view.SetGradient(gradient);
}

void ParseShadowInfo(tdfcore::View& view, const DomStyleMap& style_map) {
  auto shadow = view.GetShadow();
  auto color = shadow.GetColor();
  if (auto it = style_map.find(view::kShadowColor); it != style_map.cend() && it->second != nullptr) {
    color = ConversionIntToColor(static_cast<uint32_t>(it->second->ToDoubleChecked()));
  }
  if (auto it = style_map.find(view::kShadowOpacity); it != style_map.cend() && it->second != nullptr) {
    auto opacity = std::round(std::clamp(static_cast<float>(it->second->ToDoubleChecked()), 0.0f, 1.0f));
    color = color.SetA(static_cast<uint8_t>(opacity * 255));
  }

  auto offset_x = shadow.Offset().x;
  auto offset_y = shadow.Offset().y;
  if (auto it = style_map.find(view::kShadowOffset); it != style_map.cend() && it->second != nullptr) {
    auto offset_props = it->second->ToObjectChecked();
    if (auto x = offset_props.find("x"); x != offset_props.end()) {
      offset_x = static_cast<tdfcore::TScalar>(x->second.ToDoubleChecked());
    }
    auto y = offset_props.find("y");
    if (y != offset_props.end()) {
      offset_y = static_cast<tdfcore::TScalar>(y->second.ToDoubleChecked());
    }
  }
  if (auto it = style_map.find(view::kShadowOffsetX); it != style_map.cend() && it->second != nullptr) {
    offset_x = static_cast<tdfcore::TScalar>(it->second->ToDoubleChecked());
  }

  if (auto it = style_map.find(view::kShadowOffsetY); it != style_map.cend() && it->second != nullptr) {
    offset_y = static_cast<tdfcore::TScalar>(it->second->ToDoubleChecked());
  }
  auto offset = tdfcore::TPoint::Make(offset_x, offset_y);

  auto radius = shadow.BlurRadius();
  if (auto it = style_map.find(view::kShadowRadius); it != style_map.cend() && it->second != nullptr) {
    radius = static_cast<tdfcore::TScalar>(it->second->ToDoubleChecked());
  }
  auto spread = shadow.SpreadRadius();
  if (auto it = style_map.find(view::kShadowSpread); it != style_map.cend() && it->second != nullptr) {
    spread = static_cast<tdfcore::TScalar>(it->second->ToDoubleChecked());
  }

  view.SetShadow(tdfcore::BoxShadow(color, offset, radius, spread));
}

void ParseBorderInfo(tdfcore::View& view, const DomStyleMap& style_map) {
  auto default_style = std::make_pair(0, tdfcore::Color::Transparent());
  auto border_style = ParseBorderStyle(style_map, view::kBorderWidth, view::kBorderColor, default_style);
  default_style = std::make_pair(border_style.Width(), border_style.GetColor());

  auto left_border_style = ParseBorderStyle(style_map, view::kBorderLeftWidth, view::kBorderLeftColor, default_style);
  auto top_border_style = ParseBorderStyle(style_map, view::kBorderTopWidth, view::kBorderTopColor, default_style);
  auto right_border_style =
      ParseBorderStyle(style_map, view::kBorderRightWidth, view::kBorderRightColor, default_style);
  auto bottom_border_style =
      ParseBorderStyle(style_map, view::kBorderBottomWidth, view::kBorderBottomColor, default_style);
  auto border = tdfcore::BoxBorder(left_border_style, top_border_style, right_border_style, bottom_border_style);
  view.SetBorder(border);

  float radius = 0, radius_tl = 0, radius_tr = 0, radius_bl = 0, radius_br = 0;
  bool has_radius = false;
  if (auto it = style_map.find(view::kBorderRadius); it != style_map.end() && it->second != nullptr) {
    FOOTSTONE_DCHECK(it->second->IsDouble());
    radius = static_cast<float>(it->second->ToDoubleChecked());
    has_radius = true;
    radius_tl = radius_tr = radius_bl = radius_br = radius;
  }
  if (auto it = style_map.find(view::kBorderTopLeftRadius); it != style_map.end() && it->second != nullptr) {
    FOOTSTONE_DCHECK(it->second->IsDouble());
    radius_tl = static_cast<float>(it->second->ToDoubleChecked());
    has_radius = true;
  }
  if (auto it = style_map.find(view::kBorderTopRightRadius); it != style_map.end() && it->second != nullptr) {
    FOOTSTONE_DCHECK(it->second->IsDouble());
    radius_tr = static_cast<float>(it->second->ToDoubleChecked());
    has_radius = true;
  }
  if (auto it = style_map.find(view::kBorderBottomLeftRadius); it != style_map.end() && it->second != nullptr) {
    FOOTSTONE_DCHECK(it->second->IsDouble());
    radius_bl = static_cast<float>(it->second->ToDoubleChecked());
    has_radius = true;
  }
  if (auto it = style_map.find(view::kBorderBottomRightRadius); it != style_map.end() && it->second != nullptr) {
    FOOTSTONE_DCHECK(it->second->IsDouble());
    radius_br = static_cast<float>(it->second->ToDoubleChecked());
    has_radius = true;
  }
  if (has_radius) {
    std::array<float, 8> radius_arr = {radius_tl, radius_tl, radius_tr, radius_tr, radius_br, radius_br, radius_bl, radius_bl};
    view.SetRadius(radius_arr);
  }
}

tdfcore::BorderStyle ParseBorderStyle(const DomStyleMap& style_map, const char* width_name, const char* color_name,
                                      std::pair<float, tdfcore::Color> default_style) {
  if (auto it = style_map.find(width_name); it != style_map.cend() && it->second != nullptr) {
    FOOTSTONE_DCHECK(it->second->IsDouble());
    default_style.first = static_cast<float>(it->second->ToDoubleChecked());
    if (auto it2 = style_map.find(color_name); it2 != style_map.end() && default_style.first > 0) {
      FOOTSTONE_DCHECK(it2->second->IsDouble());
      default_style.second = ConversionIntToColor(static_cast<uint32_t>(it2->second->ToDoubleChecked()));
    }
  }
  return tdfcore::BorderStyle(default_style.second, default_style.first);
}

}  // namespace util
}  // namespace tdf
}  // namespace render
}  // namespace hippy
