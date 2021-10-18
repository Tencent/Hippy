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

/* this module hold common operations for HPNode
 *  It's open to outside
 */

#pragma once

#include "HPNode.h"
#include "HPConfig.h"

HPNodeRef HPNodeNew();
void HPNodeFree(HPNodeRef node);
void HPNodeFreeRecursive(HPNodeRef node);

void HPNodeStyleSetDirection(HPNodeRef node, HPDirection direction);
void HPNodeStyleSetWidth(HPNodeRef node, float width);
void HPNodeStyleSetHeight(HPNodeRef node, float height);
bool HPNodeSetMeasureFunc(HPNodeRef node, HPMeasureFunc _measure);
void HPNodeStyleSetFlex(HPNodeRef node, float flex);
void HPNodeStyleSetFlexGrow(HPNodeRef node, float flexGrow);
void HPNodeStyleSetFlexShrink(HPNodeRef node, float flexShrink);
void HPNodeStyleSetFlexBasis(HPNodeRef node, float flexBasis);
void HPNodeStyleSetFlexDirection(HPNodeRef node, FlexDirection direction);
void HPNodeStyleSetPositionType(HPNodeRef node, PositionType);
void HPNodeStyleSetPosition(HPNodeRef node, CSSDirection dir, float value);
void HPNodeStyleSetMargin(HPNodeRef node, CSSDirection dir, float value);
void HPNodeStyleSetMarginAuto(HPNodeRef node, CSSDirection dir);
void HPNodeStyleSetPadding(HPNodeRef node, CSSDirection dir, float value);
void HPNodeStyleSetBorder(HPNodeRef node, CSSDirection dir, float value);

void HPNodeStyleSetFlexWrap(HPNodeRef node, FlexWrapMode wrapMode);
void HPNodeStyleSetJustifyContent(HPNodeRef node, FlexAlign justify);
void HPNodeStyleSetAlignContent(HPNodeRef node, FlexAlign align);
void HPNodeStyleSetAlignItems(HPNodeRef node, FlexAlign align);
void HPNodeStyleSetAlignSelf(HPNodeRef node, FlexAlign align);
void HPNodeStyleSetDisplay(HPNodeRef node, DisplayType displayType);
void HPNodeStyleSetMaxWidth(HPNodeRef node, float value);
void HPNodeStyleSetMaxHeight(HPNodeRef node, float value);
void HPNodeStyleSetMinWidth(HPNodeRef node, float value);
void HPNodeStyleSetMinHeight(HPNodeRef node, float value);
void HPNodeSetNodeType(HPNodeRef node, NodeType nodeType);
void HPNodeStyleSetOverflow(HPNodeRef node, OverflowType overflowType);

float HPNodeLayoutGetLeft(HPNodeRef node);
float HPNodeLayoutGetTop(HPNodeRef node);
float HPNodeLayoutGetRight(HPNodeRef node);
float HPNodeLayoutGetBottom(HPNodeRef node);
float HPNodeLayoutGetWidth(HPNodeRef node);
float HPNodeLayoutGetHeight(HPNodeRef node);
float HPNodeLayoutGetMargin(HPNodeRef node, CSSDirection dir);
float HPNodeLayoutGetPadding(HPNodeRef node, CSSDirection dir);
float HPNodeLayoutGetBorder(HPNodeRef node, CSSDirection dir);
bool HPNodeLayoutGetHadOverflow(HPNodeRef node);

void HPNodeSetConfig(HPNodeRef node, HPConfigRef config);

bool HPNodeInsertChild(HPNodeRef node, HPNodeRef child, uint32_t index);
bool HPNodeRemoveChild(HPNodeRef node, HPNodeRef child);
bool HPNodeHasNewLayout(HPNodeRef node);
void HPNodesetHasNewLayout(HPNodeRef node, bool hasNewLayout);
void HPNodeMarkDirty(HPNodeRef node);
bool HPNodeIsDirty(HPNodeRef node);
void HPNodeDoLayout(HPNodeRef node,
                    float parentWidth,
                    float parentHeight,
                    HPDirection direction = DirectionLTR,
                    void* layoutContext = nullptr);
void HPNodePrint(HPNodeRef node);
bool HPNodeReset(HPNodeRef node);
