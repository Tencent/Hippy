/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights reserved.
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

#include <Hippy.h>
#include <gtest.h>

TEST(HippyTest, display_none) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0, 1);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child1, 1);
  HPNodeStyleSetDisplay(root_child1, DisplayTypeNone);
  HPNodeInsertChild(root, root_child1, 1);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child1));

  HPNodeStyleSetDisplay(root_child1, DisplayTypeFlex);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child1));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child1));

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, display_none_fixed_size) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0, 1);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 20);
  HPNodeStyleSetHeight(root_child1, 20);
  HPNodeStyleSetDisplay(root_child1, DisplayTypeNone);
  HPNodeInsertChild(root, root_child1, 1);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child1));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child1));

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, display_none_with_margin) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetMargin(root_child0, CSSLeft, 10);
  HPNodeStyleSetMargin(root_child0, CSSTop, 10);
  HPNodeStyleSetMargin(root_child0, CSSRight, 10);
  HPNodeStyleSetMargin(root_child0, CSSBottom, 10);
  HPNodeStyleSetWidth(root_child0, 20);
  HPNodeStyleSetHeight(root_child0, 20);
  HPNodeStyleSetDisplay(root_child0, DisplayTypeNone);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child1, 1);
  HPNodeInsertChild(root, root_child1, 1);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child1));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child1));

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, display_none_with_child) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0, 1);
  HPNodeStyleSetFlexShrink(root_child0, 1);
  HPNodeStyleSetFlexBasis(root_child0, 0);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child1, 1);
  HPNodeStyleSetFlexShrink(root_child1, 1);
  HPNodeStyleSetFlexBasis(root_child1, 0);
  HPNodeStyleSetDisplay(root_child1, DisplayTypeNone);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child1_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child1_child0, 1);
  HPNodeStyleSetFlexShrink(root_child1_child0, 1);
  HPNodeStyleSetFlexBasis(root_child1_child0, 0);
  HPNodeStyleSetWidth(root_child1_child0, 20);
  HPNodeStyleSetMinWidth(root_child1_child0, 0);
  HPNodeStyleSetMinHeight(root_child1_child0, 0);
  HPNodeInsertChild(root_child1, root_child1_child0, 0);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child2, 1);
  HPNodeStyleSetFlexShrink(root_child2, 1);
  HPNodeStyleSetFlexBasis(root_child2, 0);
  HPNodeInsertChild(root, root_child2, 2);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child1_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child1_child0));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child2));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child1_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child1_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child2));

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, display_none_with_position) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0, 1);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child1, 1);
  HPNodeStyleSetPosition(root_child1, CSSTop, 10);
  HPNodeStyleSetDisplay(root_child1, DisplayTypeNone);
  HPNodeInsertChild(root, root_child1, 1);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child1));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child1));

  HPNodeFreeRecursive(root);
}
