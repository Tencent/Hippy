/*
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
#pragma clang diagnostic ignored "-Wc++98-compat-extra-semi"
#include "yoga/Yoga.h"
#pragma clang diagnostic pop

#include "dom/layout_node.h"

namespace hippy {
inline namespace dom {

class YogaLayoutNode : public LayoutNode, public std::enable_shared_from_this<YogaLayoutNode> {
 public:
  YogaLayoutNode();

  virtual ~YogaLayoutNode();

  void CalculateLayout(float parent_width, float parent_height, Direction direction = Direction::RTL,
                       void* layout_context = nullptr) override;

  void SetLayoutStyles(
      const std::unordered_map<std::string, std::shared_ptr<footstone::value::HippyValue>>& style_update,
      const std::vector<std::string>& style_delete) override;

  void SetWidth(float width) override;

  void SetHeight(float height) override;
    
  void SetMaxWidth(float width) override;

  void SetMaxHeight(float height) override;

  void SetScaleFactor(float sacle_factor) override;

  void SetMeasureFunction(MeasureFunction measure_function) override;

  bool HasMeasureFunction() override;

  float GetLeft() override;

  float GetTop() override;

  float GetRight() override;

  float GetBottom() override;

  float GetWidth() override;

  float GetHeight() override;

  float GetMargin(Edge edge) override;

  float GetPadding(Edge edge) override;

  float GetBorder(Edge edge) override;

  float GetStyleWidth() override;

  float GetStyleHeight() override;

  void SetPosition(Edge edge, float position) override;

  bool LayoutHadOverflow();

  YGNodeRef GetLayoutEngineNodeRef() { return yoga_node_; }

  void InsertChild(std::shared_ptr<LayoutNode> child, uint32_t index) override;

  void RemoveChild(const std::shared_ptr<LayoutNode> child) override;

  bool HasNewLayout() override;

  void SetHasNewLayout(bool has_new_layout) override;

  void ResetLayoutCache() override;

  void MarkDirty() override;

  bool HasParentEngineNode() override;

  void Print() override;

  bool IsDirty() override;

  void Reset();

  int64_t GetKey() { return key_; }

 private:
  void Parser(const std::unordered_map<std::string, std::shared_ptr<footstone::value::HippyValue>>& style_update,
              const std::vector<std::string>& style_delete);

  void SetYGWidth(std::shared_ptr<footstone::value::HippyValue> hippy_value);

  void SetYGHeight(std::shared_ptr<footstone::value::HippyValue> hippy_value);

  void SetDirection(YGDirection direction);

  void SetYGMaxWidth(std::shared_ptr<footstone::value::HippyValue> hippy_value);

  void SetYGMaxHeight(std::shared_ptr<footstone::value::HippyValue> hippy_value);

  void SetYGMinWidth(std::shared_ptr<footstone::value::HippyValue> hippy_value);

  void SetYGMinHeight(std::shared_ptr<footstone::value::HippyValue> hippy_value);

  void SetYGFlexBasis(std::shared_ptr<footstone::value::HippyValue> dom_value);

  void SetFlex(float flex);

  void SetFlexGrow(float flex_grow);

  void SetFlexShrink(float flex_shrink);

  void SetFlexDirection(YGFlexDirection flex_direction);

  void SetPositionType(YGPositionType position_type);

  void SetYGPosition(YGEdge edge, std::shared_ptr<footstone::value::HippyValue> hippy_value);

  void SetYGMargin(YGEdge edge, std::shared_ptr<footstone::value::HippyValue> hippy_value);

  void SetYGPadding(YGEdge edge, std::shared_ptr<footstone::value::HippyValue> hippy_value);

  void SetYGBorder(YGEdge edge, std::shared_ptr<footstone::value::HippyValue> hippy_value);

  void SetFlexWrap(YGWrap wrap_mode);

  void SetJustifyContent(YGJustify justify);

  void SetAlignContent(YGAlign align_content);

  void SetAlignItems(YGAlign align_items);

  void SetAlignSelf(YGAlign align_self);

  void SetDisplay(YGDisplay display_type);

  void SetOverflow(YGOverflow overflow);

  void SetAspectRatio(float aspectRatio);

  void Allocate();

  void Deallocate();

 private:
  std::weak_ptr<YogaLayoutNode> parent_;
  std::vector<std::shared_ptr<YogaLayoutNode>> children_;

  YGNodeRef yoga_node_;
  YGConfigRef yoga_config_;
  int64_t key_;
};

}  // namespace dom
}  // namespace hippy
