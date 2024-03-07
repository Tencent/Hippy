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

#include <functional>
#include <unordered_map>
#include "footstone/hippy_value.h"

namespace hippy {
inline namespace dom {

enum class Edge {
  EdgeLeft,
  EdgeTop,
  EdgeRight,
  EdgeBottom,
  EdgeStart,
  EdgeEnd,
};

enum class Direction {
  Inherit,
  LTR,
  RTL,
};

enum class LayoutMeasureMode {
  Undefined,
  Exactly,
  AtMost,
};

struct LayoutSize {
  float width;
  float height;
};

using Edge = Edge;
using Direction = Direction;
using LayoutSize = LayoutSize;
using LayoutMeasureMode = LayoutMeasureMode;

using MeasureFunction = std::function<LayoutSize(float width, LayoutMeasureMode widthMeasureMode, float height,
                                                 LayoutMeasureMode heightMeasureMode, void* layoutContext)>;

class LayoutNode {
 public:
  LayoutNode();

  virtual ~LayoutNode();

  virtual float GetWidth() = 0;
  virtual float GetHeight() = 0;
  virtual float GetLeft() = 0;
  virtual float GetTop() = 0;
  virtual float GetRight() = 0;
  virtual float GetBottom() = 0;
  virtual float GetStyleWidth() = 0;
  virtual float GetStyleHeight() = 0;
  virtual float GetMargin(Edge edge) = 0;
  virtual float GetPadding(Edge edge) = 0;
  virtual float GetBorder(Edge edge) = 0;

  virtual void SetWidth(float width) = 0;
  virtual void SetHeight(float height) = 0;
  virtual void SetPosition(Edge edge, float position) = 0;
  virtual void SetScaleFactor(float scale_factor) = 0;
  virtual bool HasNewLayout() = 0;
  virtual void SetHasNewLayout(bool has_new_layout) = 0;
  virtual void SetMeasureFunction(MeasureFunction measure_function) = 0;
  virtual bool HasMeasureFunction() = 0;
  virtual void MarkDirty() = 0;
  virtual bool IsDirty() = 0;
  virtual bool HasParentEngineNode() = 0;
  virtual void Print() = 0;

  /**
   * @brief 插入子节点
   * @param child
   * @param index
   */
  virtual void InsertChild(std::shared_ptr<LayoutNode> child, uint32_t index) = 0;

  /**
   * @brief 删除子节点
   * @param child
   */
  virtual void RemoveChild(const std::shared_ptr<LayoutNode> child) = 0;

  /**
   * @brief 删除子节点
   * @param parent_width 父容器宽度
   * @param parent_height 父容器高度
   * @param direction 排版方向
   * @param layout_context layout context
   */
  virtual void CalculateLayout(float parent_width, float parent_height, Direction direction = Direction::LTR,
                               void* layout_context = nullptr) = 0;

  /**
   * @brief 设置属性
   * @param style_map 属性的map
   */
  virtual void SetLayoutStyles(
      const std::unordered_map<std::string, std::shared_ptr<footstone::value::HippyValue>>& style_update,
      const std::vector<std::string>& style_delete) = 0;
};

std::shared_ptr<LayoutNode> CreateLayoutNode();

}  // namespace dom
}  // namespace hippy
