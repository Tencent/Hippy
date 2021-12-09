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

#include "MTTLayout.h"

#include "MTTUtil.h"

MTTNodeRef MTTNodeNew() {
  return new MTTNode();
}

MTTNodeRef MTTNodeNewWithScaleFactor(float scaleFactor) {
  return new MTTNode(scaleFactor);
}

void MTTNodeFree(MTTNodeRef node) {
  if (node == nullptr)
    return;
  // free self
  delete node;
}

void MTTNodeFreeRecursive(MTTNodeRef node) {
  if (node == nullptr) {
    return;
  }

  while (node->childCount() > 0) {
    MTTNodeRef child = node->getChild(0);
    MTTNodeFreeRecursive(child);
  }

  MTTNodeFree(node);
}

void MTTNodeStyleSetDirection(MTTNodeRef node, MTTDirection direction) {
  if (node == nullptr || node->style.direction == direction) {
    return;
  }

  node->style.direction = direction;
  node->markAsDirty();
}

void MTTNodeStyleSetWidth(MTTNodeRef node, float width) {
  if (node == nullptr || FloatIsEqual(node->style.dim[DimWidth], width)) {
    return;
  }

  node->style.dim[DimWidth] = width;
  node->markAsDirty();
}

void MTTNodeStyleSetHeight(MTTNodeRef node, float height) {
  if (node == nullptr || FloatIsEqual(node->style.dim[DimHeight], height))
    return;

  node->style.dim[DimHeight] = height;
  node->markAsDirty();
}

bool MTTNodeSetMeasureFunc(MTTNodeRef node, MTTMeasureFunc _measure) {
  if (node == nullptr)
    return false;

  return node->setMeasureFunc(_measure);
}

void MTTNodeStyleSetFlex(MTTNodeRef node, float flex) {
  if (node == nullptr || FloatIsEqual(node->style.flex, flex))
    return;
  if (FloatIsEqual(flex, 0.0f)) {
    MTTNodeStyleSetFlexGrow(node, 0.0f);
    MTTNodeStyleSetFlexShrink(node, 0.0f);
  } else if (flex > 0.0f) {
    MTTNodeStyleSetFlexGrow(node, flex);
    MTTNodeStyleSetFlexShrink(node, 1.0f);
  } else {
    MTTNodeStyleSetFlexGrow(node, 0.0f);
    MTTNodeStyleSetFlexShrink(node, -flex);
  }
  node->style.flex = flex;
  node->markAsDirty();
}

void MTTNodeStyleSetFlexGrow(MTTNodeRef node, float flexGrow) {
  if (node == nullptr || FloatIsEqual(node->style.flexGrow, flexGrow))
    return;

  node->style.flexGrow = flexGrow;
  node->markAsDirty();
}

void MTTNodeStyleSetFlexShrink(MTTNodeRef node, float flexShrink) {
  if (node == nullptr || FloatIsEqual(node->style.flexShrink, flexShrink))
    return;

  node->style.flexShrink = flexShrink;
  node->markAsDirty();
}

void MTTNodeStyleSetFlexBasis(MTTNodeRef node, float flexBasis) {
  if (node == nullptr || FloatIsEqual(node->style.flexBasis, flexBasis))
    return;

  node->style.flexBasis = flexBasis;
  node->markAsDirty();
}

void MTTNodeStyleSetFlexDirection(MTTNodeRef node, FlexDirection direction) {
  if (node == nullptr || node->style.flexDirection == direction)
    return;

  node->style.flexDirection = direction;
  node->markAsDirty();
}

void MTTNodeStyleSetPositionType(MTTNodeRef node, PositionType positionType) {
  if (node == nullptr || node->style.positionType == positionType)
    return;
  node->style.positionType = positionType;
  node->markAsDirty();
}

void MTTNodeStyleSetPosition(MTTNodeRef node, CSSDirection dir, float value) {
  if (node == nullptr || FloatIsEqual(node->style.position[dir], value))
    return;
  if (node->style.setPosition(dir, value)) {
    node->markAsDirty();
  }
}

void MTTNodeStyleSetMargin(MTTNodeRef node, CSSDirection dir, float value) {
  if (node == nullptr)
    return;
  if (node->style.setMargin(dir, value)) {
    node->markAsDirty();
  }
}

void MTTNodeStyleSetMarginAuto(MTTNodeRef node, CSSDirection dir) {
  MTTNodeStyleSetMargin(node, dir, VALUE_AUTO);
}

void MTTNodeStyleSetPadding(MTTNodeRef node, CSSDirection dir, float value) {
  if (node == nullptr)
    return;
  if (node->style.setPadding(dir, value)) {
    node->markAsDirty();
  }
}

void MTTNodeStyleSetBorder(MTTNodeRef node, CSSDirection dir, float value) {
  if (node == nullptr)
    return;
  if (node->style.setBorder(dir, value)) {
    node->markAsDirty();
  }
}

void MTTNodeStyleSetFlexWrap(MTTNodeRef node, FlexWrapMode wrapMode) {
  if (node == nullptr || node->style.flexWrap == wrapMode)
    return;

  node->style.flexWrap = wrapMode;
  node->markAsDirty();
}

void MTTNodeStyleSetJustifyContent(MTTNodeRef node, FlexAlign justify) {
  if (node == nullptr || node->style.justifyContent == justify)
    return;
  node->style.justifyContent = justify;
  node->markAsDirty();
}

void MTTNodeStyleSetAlignContent(MTTNodeRef node, FlexAlign align) {
  if (node == nullptr || node->style.alignContent == align)
    return;
  node->style.alignContent = align;
  node->markAsDirty();
}

void MTTNodeStyleSetAlignItems(MTTNodeRef node, FlexAlign align) {
  if (node == nullptr || node->style.alignItems == align)
    return;
  // FlexAlignStart == FlexAlignBaseline
  node->style.alignItems = align;
  node->markAsDirty();
}

void MTTNodeStyleSetAlignSelf(MTTNodeRef node, FlexAlign align) {
  if (node == nullptr || node->style.alignSelf == align)
    return;
  node->style.alignSelf = align;
  node->markAsDirty();
}

float MTTNodeLayoutGetLeft(MTTNodeRef node) {
  if (node == nullptr)
    return 0;
  return node->result.position[CSSLeft];
}

float MTTNodeLayoutGetTop(MTTNodeRef node) {
  if (node == nullptr)
    return 0;
  return node->result.position[CSSTop];
}

float MTTNodeLayoutGetRight(MTTNodeRef node) {
  if (node == nullptr)
    return 0;
  return node->result.position[CSSRight];
}

float MTTNodeLayoutGetBottom(MTTNodeRef node) {
  if (node == nullptr)
    return 0;
  return node->result.position[CSSBottom];
}

float MTTNodeLayoutGetWidth(MTTNodeRef node) {
  if (node == nullptr)
    return 0;
  return node->result.dim[DimWidth];
}

float MTTNodeLayoutGetHeight(MTTNodeRef node) {
  if (node == nullptr)
    return 0;
  return node->result.dim[DimHeight];
}

float MTTNodeLayoutGetMaxWidth(MTTNodeRef node) {
  if (node == nullptr) {
    return 0;
  }
  return node->style.maxDim[DimWidth];
}

float MTTNodeLayoutGetMaxHeight(MTTNodeRef node) {
  if (node == nullptr) {
    return 0;
  }
  return node->style.maxDim[DimHeight];
}

float MTTNodeLayoutGetMinWidth(MTTNodeRef node) {
  if (node == nullptr) {
    return 0;
  }
  return node->style.minDim[DimWidth];
}

float MTTNodeLayoutGetMinHeight(MTTNodeRef node) {
  if (node == nullptr) {
    return 0;
  }
  return node->style.minDim[DimHeight];
}

float MTTNodeLayoutGetMargin(MTTNodeRef node, CSSDirection dir) {
  if (node == nullptr || dir > CSSBottom)
    return 0;
  return node->result.margin[dir];
}

float MTTNodeLayoutGetPadding(MTTNodeRef node, CSSDirection dir) {
  if (node == nullptr || dir > CSSBottom)
    return 0;
  return node->result.padding[dir];
}
float MTTNodeLayoutGetBorder(MTTNodeRef node, CSSDirection dir) {
  if (node == nullptr || dir > CSSBottom)
    return 0;
  return node->result.border[dir];
}

bool MTTNodeLayoutGetHadOverflow(MTTNodeRef node) {
  if (node == nullptr)
    return false;
  return node->result.hadOverflow;
}

float MTTNodeLayoutGetFlexGrow(MTTNodeRef node) {
  if (nullptr != node) {
    return node->style.flexGrow;
  }
  return 0.f;
}
float MTTNodeLayoutGetFlexShrink(MTTNodeRef node) {
  if (nullptr != node) {
    return node->style.flexShrink;
  }
  return 0.f;
}

float MTTNodeLayoutGetPosition(MTTNodeRef node, CSSDirection dir) {
  if (nullptr == node) {
    return 0;
  }
  return node->style.position[dir];
}

DisplayType MTTNodeLayoutGetDisplay(MTTNodeRef node) {
  if (nullptr == node) {
    return DisplayTypeFlex;
  }
  return node->style.displayType;
}

float MTTNodeLayoutGetFlexBasis(MTTNodeRef node) {
  if (nullptr == node) {
    return 0;
  }
  return node->style.getFlexBasis();
}

FlexDirection MTTNodeLayoutGetFlexDirection(MTTNodeRef node) {
  if (nullptr == node) {
    return FLexDirectionRow;
  }
  return node->style.flexDirection;
}

FlexAlign MTTNodeLayoutGetJustifyContent(MTTNodeRef node) {
  if (nullptr == node) {
    return FlexAlignStart;
  }
  return node->style.alignContent;
}

FlexAlign MTTNodeLayoutGetAlignSelf(MTTNodeRef node) {
  if (nullptr == node) {
    return FlexAlignAuto;
  }
  return node->style.alignSelf;
}

FlexAlign MTTNodeLayoutGetAlignItems(MTTNodeRef node) {
  if (nullptr == node) {
    return FlexAlignStart;
  }
  return node->style.alignItems;
}

PositionType MTTNodeLayoutGetPositionType(MTTNodeRef node) {
  if (nullptr == node) {
    return PositionTypeRelative;
  }
  return node->style.positionType;
}

FlexWrapMode MTTNodeLayoutGetFlexWrap(MTTNodeRef node) {
  if (nullptr == node) {
    return FlexNoWrap;
  }
  return node->style.flexWrap;
}

OverflowType MTTNodeLayoutGetOverflow(MTTNodeRef node) {
  if (nullptr == node) {
    return OverflowVisible;
  }
  return node->style.overflowType;
}

void MTTNodeStyleSetDisplay(MTTNodeRef node, DisplayType displayType) {
  if (node == nullptr)
    return;
  node->setDisplayType(displayType);
}

void MTTNodeStyleSetMaxWidth(MTTNodeRef node, float value) {
  if (node == nullptr || FloatIsEqual(node->style.maxDim[DimWidth], value))
    return;
  node->style.maxDim[DimWidth] = value;
  node->markAsDirty();
}

void MTTNodeStyleSetMaxHeight(MTTNodeRef node, float value) {
  if (node == nullptr || FloatIsEqual(node->style.maxDim[DimHeight], value))
    return;
  node->style.maxDim[DimHeight] = value;
  node->markAsDirty();
}

void MTTNodeStyleSetMinWidth(MTTNodeRef node, float value) {
  if (node == nullptr || FloatIsEqual(node->style.minDim[DimWidth], value))
    return;
  node->style.minDim[DimWidth] = value;
  node->markAsDirty();
}

void MTTNodeStyleSetMinHeight(MTTNodeRef node, float value) {
  if (node == nullptr || FloatIsEqual(node->style.minDim[DimHeight], value))
    return;
  node->style.minDim[DimHeight] = value;
  node->markAsDirty();
}

void MTTNodeSetNodeType(MTTNodeRef node, NodeType nodeType) {
  if (node == nullptr || nodeType == node->style.nodeType)
    return;
  node->style.nodeType = nodeType;
  // node->markAsDirty();
}

void MTTNodeStyleSetOverflow(MTTNodeRef node, OverflowType overflowType) {
  if (node == nullptr || overflowType == node->style.overflowType)
    return;

  node->style.overflowType = overflowType;
  node->markAsDirty();
}

bool MTTNodeInsertChild(MTTNodeRef node, MTTNodeRef child, uint32_t index) {
  if (node == nullptr)
    return false;

  return node->insertChild(child, index);
}

bool MTTNodeRemoveChild(MTTNodeRef node, MTTNodeRef child) {
  if (node == nullptr)
    return false;
  return node->removeChild(child);
}

uint32_t MTTNodeChildCount(MTTNodeRef node) {
  if (nullptr == node) {
    return 0;
  }
  return node->childCount();
}

MTTNodeRef MTTNodeGetChild(MTTNodeRef node, uint32_t index) {
  return node->getChild(index);
}

void MTTNodeSetParent(MTTNodeRef node, MTTNodeRef parentNode) {
  node->setParent(parentNode);
}

MTTNodeRef MTTNodeGetParent(MTTNodeRef node) {
  return node->getParent();
}

bool MTTNodeHasNewLayout(MTTNodeRef node) {
  if (node == nullptr)
    return false;
  return node->hasNewLayout();
}

void MTTNodesetHasNewLayout(MTTNodeRef node, bool hasNewLayout) {
  if (node == nullptr)
    return;
  node->setHasNewLayout(hasNewLayout);
}

void MTTNodeSetContext(MTTNodeRef node, void *context) {
  if (nullptr != node) {
    node->setContext(context);
  }
}

void *MTTNodeGetContext(MTTNodeRef node) {
  if (nullptr != node) {
    return node->getContext();
  }
  return NULL;
}

void MTTNodeMarkDirty(MTTNodeRef node) {
  if (node == nullptr)
    return;
  node->markAsDirty();
}

bool MTTNodeIsDirty(MTTNodeRef node) {
  if (node == nullptr)
    return false;
  return node->isDirty;
}

void MTTNodeDoLayout(MTTNodeRef node,
                    float parentWidth,
                    float parentHeight,
                    MTTDirection direction,
                    void* layoutContext) {
  if (node == nullptr)
    return;

  node->layout(parentWidth, parentHeight, direction, layoutContext);
}

void MTTNodePrint(MTTNodeRef node) {
  if (node == nullptr)
    return;
  node->printNode();
}

bool MTTNodeReset(MTTNodeRef node) {
  if (node == nullptr || node->childCount() != 0 || node->getParent() != nullptr)
    return false;

  return node->reset();
}
