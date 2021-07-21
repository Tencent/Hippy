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

/* this module hold common operations for MTTNode
 *  It's open to outside
 */

#pragma once

#include "MTTNode.h"

MTTNodeRef MTTNodeNew();
void MTTNodeFree(MTTNodeRef node);
void MTTNodeFreeRecursive(MTTNodeRef node);

void MTTNodeStyleSetDirection(MTTNodeRef node, MTTDirection direction);
void MTTNodeStyleSetWidth(MTTNodeRef node, float width);
void MTTNodeStyleSetHeight(MTTNodeRef node, float height);
bool MTTNodeSetMeasureFunc(MTTNodeRef node, MTTMeasureFunc _measure);
void MTTNodeStyleSetFlex(MTTNodeRef node, float flex);
void MTTNodeStyleSetFlexGrow(MTTNodeRef node, float flexGrow);
void MTTNodeStyleSetFlexShrink(MTTNodeRef node, float flexShrink);
void MTTNodeStyleSetFlexBasis(MTTNodeRef node, float flexBasis);
void MTTNodeStyleSetFlexDirection(MTTNodeRef node, FlexDirection direction);
void MTTNodeStyleSetPositionType(MTTNodeRef node, PositionType);
void MTTNodeStyleSetPosition(MTTNodeRef node, CSSDirection dir, float value);
void MTTNodeStyleSetMargin(MTTNodeRef node, CSSDirection dir, float value);
void MTTNodeStyleSetMarginAuto(MTTNodeRef node, CSSDirection dir);
void MTTNodeStyleSetPadding(MTTNodeRef node, CSSDirection dir, float value);
void MTTNodeStyleSetBorder(MTTNodeRef node, CSSDirection dir, float value);

void MTTNodeStyleSetFlexWrap(MTTNodeRef node, FlexWrapMode wrapMode);
void MTTNodeStyleSetJustifyContent(MTTNodeRef node, FlexAlign justify);
void MTTNodeStyleSetAlignContent(MTTNodeRef node, FlexAlign align);
void MTTNodeStyleSetAlignItems(MTTNodeRef node, FlexAlign align);
void MTTNodeStyleSetAlignSelf(MTTNodeRef node, FlexAlign align);
void MTTNodeStyleSetDisplay(MTTNodeRef node, DisplayType displayType);
void MTTNodeStyleSetMaxWidth(MTTNodeRef node, float value);
void MTTNodeStyleSetMaxHeight(MTTNodeRef node, float value);
void MTTNodeStyleSetMinWidth(MTTNodeRef node, float value);
void MTTNodeStyleSetMinHeight(MTTNodeRef node, float value);
void MTTNodeSetNodeType(MTTNodeRef node, NodeType nodeType);
void MTTNodeStyleSetOverflow(MTTNodeRef node, OverflowType overflowType);

float MTTNodeLayoutGetLeft(MTTNodeRef node);
float MTTNodeLayoutGetTop(MTTNodeRef node);
float MTTNodeLayoutGetRight(MTTNodeRef node);
float MTTNodeLayoutGetBottom(MTTNodeRef node);
float MTTNodeLayoutGetWidth(MTTNodeRef node);
float MTTNodeLayoutGetHeight(MTTNodeRef node);
float MTTNodeLayoutGetMaxWidth(MTTNodeRef node);
float MTTNodeLayoutGetMaxHeight(MTTNodeRef node);
float MTTNodeLayoutGetMinWidth(MTTNodeRef node);
float MTTNodeLayoutGetMinHeight(MTTNodeRef node);
float MTTNodeLayoutGetMargin(MTTNodeRef node, CSSDirection dir);
float MTTNodeLayoutGetPadding(MTTNodeRef node, CSSDirection dir);
float MTTNodeLayoutGetBorder(MTTNodeRef node, CSSDirection dir);
float MTTNodeLayoutGetFlexGrow(MTTNodeRef node);
float MTTNodeLayoutGetFlexShrink(MTTNodeRef node);
float MTTNodeLayoutGetPosition(MTTNodeRef node, CSSDirection dir);
DisplayType MTTNodeLayoutGetDisplay(MTTNodeRef node);
float MTTNodeLayoutGetFlexBasis(MTTNodeRef node);
FlexDirection MTTNodeLayoutGetFlexDirection(MTTNodeRef node);
FlexAlign MTTNodeLayoutGetJustifyContent(MTTNodeRef node);
FlexAlign MTTNodeLayoutGetAlignSelf(MTTNodeRef node);
FlexAlign MTTNodeLayoutGetAlignItems(MTTNodeRef node);
PositionType MTTNodeLayoutGetPositionType(MTTNodeRef node);
FlexWrapMode MTTNodeLayoutGetFlexWrap(MTTNodeRef node);
OverflowType MTTNodeLayoutGetOverflow(MTTNodeRef node);
bool MTTNodeLayoutGetHadOverflow(MTTNodeRef node);

bool MTTNodeInsertChild(MTTNodeRef node, MTTNodeRef child, uint32_t index);
bool MTTNodeRemoveChild(MTTNodeRef node, MTTNodeRef child);
uint32_t MTTNodeChildCount(MTTNodeRef node);
MTTNodeRef MTTNodeGetChild(MTTNodeRef node, uint32_t index);

void MTTNodeSetParent(MTTNodeRef node, MTTNodeRef parentNode);

bool MTTNodeHasNewLayout(MTTNodeRef node);
void MTTNodesetHasNewLayout(MTTNodeRef node, bool hasNewLayout);

void MTTNodeSetContext(MTTNodeRef node, void *context);
void *MTTNodeGetContext(MTTNodeRef node);

void MTTNodeMarkDirty(MTTNodeRef node);
bool MTTNodeIsDirty(MTTNodeRef node);
void MTTNodeDoLayout(MTTNodeRef node,
                    float parentWidth,
                    float parentHeight,
                    MTTDirection direction = DirectionLTR,
                    void* layoutContext = nullptr);
void MTTNodePrint(MTTNodeRef node);
bool MTTNodeReset(MTTNodeRef node);
