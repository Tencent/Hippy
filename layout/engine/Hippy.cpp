/* Tencent is pleased to support the open source community by making Hippy
 * available. Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights
 * reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#include "Hippy.h"

#include "HPUtil.h"

HPNodeRef HPNodeNew() {
  return new HPNode();
}

void HPNodeFree(HPNodeRef node) {
  if (node == nullptr)
    return;
  // free self
  delete node;
}

void HPNodeFreeRecursive(HPNodeRef node) {
  if (node == nullptr) {
    return;
  }

  while (node->childCount() > 0) {
    HPNodeRef child = node->getChild(0);
    HPNodeFreeRecursive(child);
  }

  HPNodeFree(node);
}

void HPNodeStyleSetDirection(HPNodeRef node, HPDirection direction) {
  if (node == nullptr || node->style.direction == direction) {
    return;
  }

  node->style.direction = direction;
  node->markAsDirty();
}

void HPNodeStyleSetWidth(HPNodeRef node, float width) {
  if (node == nullptr || FloatIsEqual(node->style.dim[DimWidth], width)) {
    return;
  }

  node->style.dim[DimWidth] = width;
  node->markAsDirty();
}

void HPNodeStyleSetHeight(HPNodeRef node, float height) {
  if (node == nullptr || FloatIsEqual(node->style.dim[DimHeight], height))
    return;

  node->style.dim[DimHeight] = height;
  node->markAsDirty();
}

bool HPNodeSetMeasureFunc(HPNodeRef node, HPMeasureFunc _measure) {
  if (node == nullptr)
    return false;

  return node->setMeasureFunc(_measure);
}

void HPNodeStyleSetFlex(HPNodeRef node, float flex) {
  if (node == nullptr || FloatIsEqual(node->style.flex, flex))
    return;
  if (FloatIsEqual(flex, 0.0f)) {
    HPNodeStyleSetFlexGrow(node, 0.0f);
    HPNodeStyleSetFlexShrink(node, 0.0f);
  } else if (flex > 0.0f) {
    HPNodeStyleSetFlexGrow(node, flex);
    HPNodeStyleSetFlexShrink(node, 1.0f);
  } else {
    HPNodeStyleSetFlexGrow(node, 0.0f);
    HPNodeStyleSetFlexShrink(node, -flex);
  }
  node->style.flex = flex;
  node->markAsDirty();
}

void HPNodeStyleSetFlexGrow(HPNodeRef node, float flexGrow) {
  if (node == nullptr || FloatIsEqual(node->style.flexGrow, flexGrow))
    return;

  node->style.flexGrow = flexGrow;
  node->markAsDirty();
}

void HPNodeStyleSetFlexShrink(HPNodeRef node, float flexShrink) {
  if (node == nullptr || FloatIsEqual(node->style.flexShrink, flexShrink))
    return;

  node->style.flexShrink = flexShrink;
  node->markAsDirty();
}

void HPNodeStyleSetFlexBasis(HPNodeRef node, float flexBasis) {
  if (node == nullptr || FloatIsEqual(node->style.flexBasis, flexBasis))
    return;

  node->style.flexBasis = flexBasis;
  node->markAsDirty();
}

void HPNodeStyleSetFlexDirection(HPNodeRef node, FlexDirection direction) {
  if (node == nullptr || node->style.flexDirection == direction)
    return;

  node->style.flexDirection = direction;
  node->markAsDirty();
}

void HPNodeStyleSetPositionType(HPNodeRef node, PositionType positionType) {
  if (node == nullptr || node->style.positionType == positionType)
    return;
  node->style.positionType = positionType;
  node->markAsDirty();
}

void HPNodeStyleSetPosition(HPNodeRef node, CSSDirection dir, float value) {
  if (node == nullptr || FloatIsEqual(node->style.position[dir], value))
    return;
  if (node->style.setPosition(dir, value)) {
    node->markAsDirty();
  }
}

void HPNodeStyleSetMargin(HPNodeRef node, CSSDirection dir, float value) {
  if (node == nullptr)
    return;
  if (node->style.setMargin(dir, value)) {
    node->markAsDirty();
  }
}

void HPNodeStyleSetMarginAuto(HPNodeRef node, CSSDirection dir) {
  HPNodeStyleSetMargin(node, dir, VALUE_AUTO);
}

void HPNodeStyleSetPadding(HPNodeRef node, CSSDirection dir, float value) {
  if (node == nullptr)
    return;
  if (node->style.setPadding(dir, value)) {
    node->markAsDirty();
  }
}

void HPNodeStyleSetBorder(HPNodeRef node, CSSDirection dir, float value) {
  if (node == nullptr)
    return;
  if (node->style.setBorder(dir, value)) {
    node->markAsDirty();
  }
}

void HPNodeStyleSetFlexWrap(HPNodeRef node, FlexWrapMode wrapMode) {
  if (node == nullptr || node->style.flexWrap == wrapMode)
    return;

  node->style.flexWrap = wrapMode;
  node->markAsDirty();
}

void HPNodeStyleSetJustifyContent(HPNodeRef node, FlexAlign justify) {
  if (node == nullptr || node->style.justifyContent == justify)
    return;
  node->style.justifyContent = justify;
  node->markAsDirty();
}

void HPNodeStyleSetAlignContent(HPNodeRef node, FlexAlign align) {
  if (node == nullptr || node->style.alignContent == align)
    return;
  node->style.alignContent = align;
  node->markAsDirty();
}

void HPNodeStyleSetAlignItems(HPNodeRef node, FlexAlign align) {
  if (node == nullptr || node->style.alignItems == align)
    return;
  // FlexAlignStart == FlexAlignBaseline
  node->style.alignItems = align;
  node->markAsDirty();
}

void HPNodeStyleSetAlignSelf(HPNodeRef node, FlexAlign align) {
  if (node == nullptr || node->style.alignSelf == align)
    return;
  node->style.alignSelf = align;
  node->markAsDirty();
}

float HPNodeLayoutGetLeft(HPNodeRef node) {
  if (node == nullptr)
    return 0;
  return node->result.position[CSSLeft];
}

float HPNodeLayoutGetTop(HPNodeRef node) {
  if (node == nullptr)
    return 0;
  return node->result.position[CSSTop];
}

float HPNodeLayoutGetRight(HPNodeRef node) {
  if (node == nullptr)
    return 0;
  return node->result.position[CSSRight];
}

float HPNodeLayoutGetBottom(HPNodeRef node) {
  if (node == nullptr)
    return 0;
  return node->result.position[CSSBottom];
}

float HPNodeLayoutGetWidth(HPNodeRef node) {
  if (node == nullptr)
    return 0;
  return node->result.dim[DimWidth];
}

float HPNodeLayoutGetHeight(HPNodeRef node) {
  if (node == nullptr)
    return 0;
  return node->result.dim[DimHeight];
}

float HPNodeLayoutGetMargin(HPNodeRef node, CSSDirection dir) {
  if (node == nullptr || dir > CSSBottom)
    return 0;
  return node->result.margin[dir];
}

float HPNodeLayoutGetPadding(HPNodeRef node, CSSDirection dir) {
  if (node == nullptr || dir > CSSBottom)
    return 0;
  return node->result.padding[dir];
}
float HPNodeLayoutGetBorder(HPNodeRef node, CSSDirection dir) {
  if (node == nullptr || dir > CSSBottom)
    return 0;
  return node->result.border[dir];
}
bool HPNodeLayoutGetHadOverflow(HPNodeRef node) {
  if (node == nullptr)
    return false;
  return node->result.hadOverflow;
}

void HPNodeStyleSetDisplay(HPNodeRef node, DisplayType displayType) {
  if (node == nullptr)
    return;
  node->setDisplayType(displayType);
}

void HPNodeStyleSetMaxWidth(HPNodeRef node, float value) {
  if (node == nullptr || FloatIsEqual(node->style.maxDim[DimWidth], value))
    return;
  node->style.maxDim[DimWidth] = value;
  node->markAsDirty();
}

void HPNodeStyleSetMaxHeight(HPNodeRef node, float value) {
  if (node == nullptr || FloatIsEqual(node->style.maxDim[DimHeight], value))
    return;
  node->style.maxDim[DimHeight] = value;
  node->markAsDirty();
}

void HPNodeStyleSetMinWidth(HPNodeRef node, float value) {
  if (node == nullptr || FloatIsEqual(node->style.minDim[DimWidth], value))
    return;
  node->style.minDim[DimWidth] = value;
  node->markAsDirty();
}

void HPNodeStyleSetMinHeight(HPNodeRef node, float value) {
  if (node == nullptr || FloatIsEqual(node->style.minDim[DimHeight], value))
    return;
  node->style.minDim[DimHeight] = value;
  node->markAsDirty();
}

void HPNodeSetNodeType(HPNodeRef node, NodeType nodeType) {
  if (node == nullptr || nodeType == node->style.nodeType)
    return;
  node->style.nodeType = nodeType;
  // node->markAsDirty();
}

void HPNodeStyleSetOverflow(HPNodeRef node, OverflowType overflowType) {
  if (node == nullptr || overflowType == node->style.overflowType)
    return;

  node->style.overflowType = overflowType;
  node->markAsDirty();
}

bool HPNodeInsertChild(HPNodeRef node, HPNodeRef child, uint32_t index) {
  if (node == nullptr)
    return false;

  return node->insertChild(child, index);
}

bool HPNodeRemoveChild(HPNodeRef node, HPNodeRef child) {
  if (node == nullptr)
    return false;
  return node->removeChild(child);
}

bool HPNodeHasNewLayout(HPNodeRef node) {
  if (node == nullptr)
    return false;
  return node->hasNewLayout();
}

void HPNodesetHasNewLayout(HPNodeRef node, bool hasNewLayout) {
  if (node == nullptr)
    return;
  node->setHasNewLayout(hasNewLayout);
}

void HPNodeMarkDirty(HPNodeRef node) {
  if (node == nullptr)
    return;
  node->markAsDirty();
}

bool HPNodeIsDirty(HPNodeRef node) {
  if (node == nullptr)
    return false;
  return node->isDirty;
}

void HPNodeDoLayout(HPNodeRef node,
                    float parentWidth,
                    float parentHeight,
                    HPConfig config,
                    HPDirection direction,
                    void* layoutContext) {
  if (node == nullptr)
    return;

  node->layout(parentWidth, parentHeight, config, direction, layoutContext);
}

void HPNodePrint(HPNodeRef node) {
  if (node == nullptr)
    return;
  node->printNode();
}

bool HPNodeReset(HPNodeRef node) {
  if (node == nullptr || node->childCount() != 0 || node->getParent() != nullptr)
    return false;

  return node->reset();
}
