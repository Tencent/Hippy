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

#include <gtest.h>
#include <Hippy.h>

TEST(HippyTest, max_width) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetMaxWidth(root_child0, 50);
  HPNodeStyleSetHeight(root_child0, 10);
  HPNodeInsertChild(root, root_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, max_height) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 10);
  HPNodeStyleSetMaxHeight(root_child0, 50);
  HPNodeInsertChild(root, root_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(90, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, min_height) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0, 1);
  HPNodeStyleSetMinHeight(root_child0, 60);
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
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, min_width) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0, 1);
  HPNodeStyleSetMinWidth(root_child0, 60);
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
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child1));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child1));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, justify_content_min_max) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetJustifyContent(root, FlexAlignCenter);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetMinHeight(root, 100);
  HPNodeStyleSetMaxHeight(root, 200);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 60);
  HPNodeStyleSetHeight(root_child0, 60);
  HPNodeInsertChild(root, root_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetHeight(root_child0));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetHeight(root_child0));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, align_items_min_max) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetAlignItems(root, FlexAlignCenter);
  HPNodeStyleSetMinWidth(root, 100);
  HPNodeStyleSetMaxWidth(root, 200);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 60);
  HPNodeStyleSetHeight(root_child0, 60);
  HPNodeInsertChild(root, root_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetHeight(root_child0));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetHeight(root_child0));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, justify_content_overflow_min_max) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetJustifyContent(root, FlexAlignCenter);
  HPNodeStyleSetMinHeight(root, 100);
  HPNodeStyleSetMaxHeight(root, 110);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 50);
  HPNodeStyleSetHeight(root_child0, 50);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 50);
  HPNodeStyleSetHeight(root_child1, 50);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetWidth(root_child2, 50);
  HPNodeStyleSetHeight(root_child2, 50);
  HPNodeInsertChild(root, root_child2, 2);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(110, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(-20, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child2));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(110, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(-20, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child2));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, flex_grow_to_min) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetMinHeight(root, 100);
  HPNodeStyleSetMaxHeight(root, 500);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0, 1);
  HPNodeStyleSetFlexShrink(root_child0, 1);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetHeight(root_child1, 50);
  HPNodeInsertChild(root, root_child1, 1);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child1));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child1));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, flex_grow_in_at_most_container) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetAlignItems(root, FlexAlignStart);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexDirection(root_child0, FLexDirectionRow);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child0_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0_child0, 1);
  HPNodeStyleSetFlexBasis(root_child0_child0, 0);
  HPNodeInsertChild(root_child0, root_child0_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child0_child0));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child0_child0));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, flex_grow_child) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0, 1);
  HPNodeStyleSetFlexBasis(root_child0, 0);
  HPNodeStyleSetHeight(root_child0, 100);
  HPNodeInsertChild(root, root_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, flex_grow_within_constrained_min_max_column) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetMinHeight(root, 100);
  HPNodeStyleSetMaxHeight(root, 200);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0, 1);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetHeight(root_child1, 50);
  HPNodeInsertChild(root, root_child1, 1);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child1));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child1));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, flex_grow_within_max_width) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetWidth(root, 200);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexDirection(root_child0, FLexDirectionRow);
  HPNodeStyleSetMaxWidth(root_child0, 100);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child0_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0_child0, 1);
  HPNodeStyleSetHeight(root_child0_child0, 20);
  HPNodeInsertChild(root_child0, root_child0_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child0_child0));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child0_child0));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, flex_grow_within_constrained_max_width) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetWidth(root, 200);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexDirection(root_child0, FLexDirectionRow);
  HPNodeStyleSetMaxWidth(root_child0, 300);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child0_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0_child0, 1);
  HPNodeStyleSetHeight(root_child0_child0, 20);
  HPNodeInsertChild(root_child0, root_child0_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetWidth(root_child0_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child0_child0));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetWidth(root_child0_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child0_child0));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, flex_root_ignored) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexGrow(root, 1);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetMinHeight(root, 100);
  HPNodeStyleSetMaxHeight(root, 500);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0, 1);
  HPNodeStyleSetFlexBasis(root_child0, 200);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetHeight(root_child1, 100);
  HPNodeInsertChild(root, root_child1, 1);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(300, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child1));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(300, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child1));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, flex_grow_root_minimized) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetMinHeight(root, 100);
  HPNodeStyleSetMaxHeight(root, 500);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0, 1);
  HPNodeStyleSetMinHeight(root_child0, 100);
  HPNodeStyleSetMaxHeight(root_child0, 500);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child0_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0_child0, 1);
  HPNodeStyleSetFlexBasis(root_child0_child0, 200);
  HPNodeInsertChild(root_child0, root_child0_child0, 0);

  const HPNodeRef root_child0_child1 = HPNodeNew();
  HPNodeStyleSetHeight(root_child0_child1, 100);
  HPNodeInsertChild(root_child0, root_child0_child1, 1);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(300, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(300, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0_child0));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetHeight(root_child0_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child1));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetTop(root_child0_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0_child1));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(300, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(300, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0_child0));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetHeight(root_child0_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child1));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetTop(root_child0_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0_child1));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, flex_grow_height_maximized) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 500);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0, 1);
  HPNodeStyleSetMinHeight(root_child0, 100);
  HPNodeStyleSetMaxHeight(root_child0, 500);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child0_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0_child0, 1);
  HPNodeStyleSetFlexBasis(root_child0_child0, 200);
  HPNodeInsertChild(root_child0, root_child0_child0, 0);

  const HPNodeRef root_child0_child1 = HPNodeNew();
  HPNodeStyleSetHeight(root_child0_child1, 100);
  HPNodeInsertChild(root_child0, root_child0_child1, 1);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(500, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(500, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0_child0));
  ASSERT_FLOAT_EQ(400, HPNodeLayoutGetHeight(root_child0_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child1));
  ASSERT_FLOAT_EQ(400, HPNodeLayoutGetTop(root_child0_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0_child1));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(500, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(500, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0_child0));
  ASSERT_FLOAT_EQ(400, HPNodeLayoutGetHeight(root_child0_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child1));
  ASSERT_FLOAT_EQ(400, HPNodeLayoutGetTop(root_child0_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0_child1));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, flex_grow_within_constrained_min_row) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetMinWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0, 1);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 50);
  HPNodeInsertChild(root, root_child1, 1);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

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

TEST(HippyTest, flex_grow_within_constrained_min_column) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetMinHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0, 1);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetHeight(root_child1, 50);
  HPNodeInsertChild(root, root_child1, 1);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child1));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child1));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, flex_grow_within_constrained_max_row) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetWidth(root, 200);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexDirection(root_child0, FLexDirectionRow);
  HPNodeStyleSetMaxWidth(root_child0, 100);
  HPNodeStyleSetHeight(root_child0, 100);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child0_child0 = HPNodeNew();
  HPNodeStyleSetFlexShrink(root_child0_child0, 1);
  HPNodeStyleSetFlexBasis(root_child0_child0, 100);
  HPNodeInsertChild(root_child0, root_child0_child0, 0);

  const HPNodeRef root_child0_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0_child1, 50);
  HPNodeInsertChild(root_child0, root_child0_child1, 1);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0_child0));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child0_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0_child1));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0_child1));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, flex_grow_within_constrained_max_column) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetMaxHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexShrink(root_child0, 1);
  HPNodeStyleSetFlexBasis(root_child0, 100);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetHeight(root_child1, 50);
  HPNodeInsertChild(root, root_child1, 1);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child1));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child1));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, child_min_max_width_flexing) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetWidth(root, 120);
  HPNodeStyleSetHeight(root, 50);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0, 1);
  HPNodeStyleSetFlexBasis(root_child0, 0);
  HPNodeStyleSetMinWidth(root_child0, 60);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child1, 1);
  HPNodeStyleSetFlexBasis(root_child1, 60);
  HPNodeStyleSetMaxWidth(root_child1, 20);
  HPNodeInsertChild(root, root_child1, 1);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(120, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child1));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(120, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child1));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, min_width_overrides_width) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetWidth(root, 50);
  HPNodeStyleSetMinWidth(root, 100);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, max_width_overrides_width) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetWidth(root, 200);
  HPNodeStyleSetMaxWidth(root, 100);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, min_height_overrides_height) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetHeight(root, 50);
  HPNodeStyleSetMinHeight(root, 100);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, max_height_overrides_height) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetHeight(root, 200);
  HPNodeStyleSetMaxHeight(root, 100);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, min_max_percent_no_width_height) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetAlignItems(root, FlexAlignStart);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetMinWidth(root_child0, 10);
  HPNodeStyleSetMaxWidth(root_child0, 10);
  HPNodeStyleSetMinHeight(root_child0, 10);
  HPNodeStyleSetMaxHeight(root_child0, 10);
  HPNodeInsertChild(root, root_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(90, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  HPNodeFreeRecursive(root);

}
