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

#pragma once

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wsign-conversion"
#pragma clang diagnostic ignored "-Wsign-compare"
#pragma clang diagnostic ignored "-Wextra-semi"
#pragma clang diagnostic ignored "-Wc++98-compat-extra-semi"
#pragma clang diagnostic ignored "-Wignored-qualifiers"
#pragma clang diagnostic ignored "-Wimplicit-float-conversion"
#pragma clang diagnostic ignored "-Wimplicit-int-conversion"
#pragma clang diagnostic ignored "-Wfloat-conversion"
#pragma clang diagnostic ignored "-Wshadow"
#pragma clang diagnostic ignored "-Wdeprecated-copy"
#pragma clang diagnostic ignored "-Wshorten-64-to-32"
#include "core/support/text/text_base.h"
#include "tdfui/view/text/cupertino_text_selection_control.h"
#include "tdfui/view/text/text_view.h"
#include "tdfui/view/view_context.h"
#pragma clang diagnostic pop

#include "renderer/tdf/viewnode/view_names.h"
#include "renderer/tdf/viewnode/view_node.h"

namespace hippy {
inline namespace render {
inline namespace tdf {

inline namespace text {
constexpr const char kText[] = "text";                                    // String
constexpr const char kColor[] = "color";                                  // Integer
constexpr const char kEnableScale[] = "enableScale";                      // boolean
constexpr const char kFontFamily[] = "fontFamily";                        // String
constexpr const char kFontSize[] = "fontSize";                            // float
constexpr const char kFontStyle[] = "fontStyle";                          // String
constexpr const char kFontWeight[] = "fontWeight";                        // String
constexpr const char kLetterSpacing[] = "letterSpacing";                  // float
constexpr const char kLineHeight[] = "lineHeight";                        // int
constexpr const char kLineSpacingExtra[] = "lineSpacingExtra";            // float
constexpr const char kLineSpacingMultiplier[] = "lineSpacingMultiplier";  // float
constexpr const char kNumberOfLines[] = "numberOfLines";                  // int
constexpr const char kTextAlign[] = "textAlign";                          // String
constexpr const char kTextDecorationLine[] = "textDecorationLine";        // String
constexpr const char kTextShadowColor[] = "textShadowColor";              // int
constexpr const char kTextShadowOffset[] = "textShadowOffset";            // HashMap
constexpr const char kTextShadowRadius[] = "textShadowRadius";            // float
}  // namespace text

class TextViewNode : public ViewNode {
  using TextView = tdfcore::TextView;
  using HorizontalAlign = tdfcore::HorizontalAlign;
  using TextDecoration = tdfcore::TextDecoration;
  using TextStyle = tdfcore::TextStyle;

 public:
  explicit TextViewNode(const std::shared_ptr<hippy::dom::DomNode> &dom_node, const RenderInfo info);

  static void RegisterMeasureFunction(uint32_t root_id, const std::shared_ptr<hippy::DomNode>& dom_node,
                                      const std::shared_ptr<TextViewNode>& view_node);

  static void UnregisterMeasureFunction(uint32_t root_id, const std::shared_ptr<hippy::DomNode>& dom_node);

  static std::shared_ptr<TextViewNode> FindLayoutTextViewNode(uint32_t root_id, const std::shared_ptr<hippy::DomNode>& dom_node);

  void SyncTextAttributes(const std::shared_ptr<hippy::DomNode>& dom_node);

 protected:
  void HandleStyleUpdate(const DomStyleMap& dom_style, const DomDeleteProps& dom_delete_props) override;

  /**
   * @brief Update Text's specific attributes, make sure this function can run on any thread.
   */
  void HandleTextStyleUpdate(std::shared_ptr<tdfcore::TextView> text_view,
                             const std::shared_ptr<hippy::DomNode>& dom_node, const DomStyleMap& dom_style);

  void OnChildAdd(const std::shared_ptr<ViewNode>& child, int64_t index) override;
  void OnChildRemove(const std::shared_ptr<ViewNode>& child) override;
  std::string GetViewName() const override { return kTextViewName; }

  void HandleLayoutUpdate(hippy::LayoutResult layout_result) override;

 private:
  std::shared_ptr<tdfcore::View> CreateView(const std::shared_ptr<ViewContext> &context) override;

  void SetText(const DomStyleMap& dom_style, std::shared_ptr<TextView>& text_view);
  void SetTextColor(const DomStyleMap& dom_style, TextStyle& text_style);
  void SetFontSize(const DomStyleMap& dom_style, TextStyle& text_style);
  void SetFontWeight(const DomStyleMap& dom_style, TextStyle& text_style);
  void SetFontStyle(const DomStyleMap& dom_style, TextStyle& text_style);
  void SetLineHeight(const DomStyleMap& dom_style, TextStyle& text_style);
  void SetLetterSpacing(const DomStyleMap& dom_style, TextStyle& text_style);
  void SetFontFamily(const DomStyleMap& dom_style, TextStyle& text_style);
  void SetDecorationLine(const DomStyleMap& dom_style, TextStyle& text_style);
  void SetTextShadowOffset(const DomStyleMap& dom_style);
  void SetTextShadowColor(const DomStyleMap& dom_style);
  void SetTextShadowRadius(const DomStyleMap& dom_style);
  void SetLineSpacingMultiplier(const DomStyleMap& dom_style, TextStyle& text_style);
  void SetLineSpacingExtra(const DomStyleMap& dom_style, TextStyle& text_style);
  void SetNumberOfLines(const DomStyleMap& dom_style, std::shared_ptr<TextView>& text_view);
  void SetHorizontalAlign(const DomStyleMap& dom_style, std::shared_ptr<TextView>& text_view);
  void SetEnableScale(const DomStyleMap& dom_style, std::shared_ptr<TextView>& text_view);
  void UpdateFontStyle(TextStyle& text_style);

  /**
   * @brief return layout_view_ if detached, return GetView() if attached.
   */
  std::shared_ptr<tdfcore::TextView> GetTextView();

  std::string font_style_ = "";
  std::string font_weight_ = "";
  bool has_shadow_ = true;
  float font_size_ = kDefaultFontSize;

  // support layout when not attached.
  std::shared_ptr<tdfcore::TextView> layout_view_;
};

}  // namespace tdf
}  // namespace render
}  // namespace hippy
