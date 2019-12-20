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

TEST(HippyTest, rounding_flex_basis_flex_grow_row_width_of_100) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0, 1);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child1, 1);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child2, 1);
  HPNodeInsertChild(root, root_child2, 2);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(33, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(33, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(34, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(67, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(33, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child2));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(67, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(33, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(33, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(34, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(33, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child2));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, rounding_flex_basis_flex_grow_row_prime_number_width) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetWidth(root, 113);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0, 1);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child1, 1);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child2, 1);
  HPNodeInsertChild(root, root_child2, 2);

  const HPNodeRef root_child3 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child3, 1);
  HPNodeInsertChild(root, root_child3, 3);

  const HPNodeRef root_child4 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child4, 1);
  HPNodeInsertChild(root, root_child4, 4);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(113, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(23, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(23, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(22, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(45, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(23, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(68, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(22, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child3));

  ASSERT_FLOAT_EQ(90, HPNodeLayoutGetLeft(root_child4));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child4));
  ASSERT_FLOAT_EQ(23, HPNodeLayoutGetWidth(root_child4));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child4));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(113, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(90, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(23, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(68, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(22, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(45, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(23, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(23, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(22, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child3));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child4));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child4));
  ASSERT_FLOAT_EQ(23, HPNodeLayoutGetWidth(root_child4));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child4));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, rounding_flex_basis_flex_shrink_row) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetWidth(root, 101);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexShrink(root_child0, 1);
  HPNodeStyleSetFlexBasis(root_child0, 100);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetFlexBasis(root_child1, 25);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetFlexBasis(root_child2, 25);
  HPNodeInsertChild(root, root_child2, 2);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(101, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(51, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(51, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(76, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child2));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(101, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(51, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child2));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, rounding_flex_basis_overrides_main_size) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 113);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0, 1);
  HPNodeStyleSetFlexBasis(root_child0, 50);
  HPNodeStyleSetHeight(root_child0, 20);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child1, 1);
  HPNodeStyleSetHeight(root_child1, 10);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child2, 1);
  HPNodeStyleSetHeight(root_child2, 10);
  HPNodeInsertChild(root, root_child2, 2);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(113, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(64, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(64, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(89, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(24, HPNodeLayoutGetHeight(root_child2));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(113, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(64, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(64, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(89, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(24, HPNodeLayoutGetHeight(root_child2));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, rounding_total_fractial) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetWidth(root, 87.4f);
  HPNodeStyleSetHeight(root, 113.4f);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0, 0.7f);
  HPNodeStyleSetFlexBasis(root_child0, 50.3f);
  HPNodeStyleSetHeight(root_child0, 20.3f);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child1, 1.6f);
  HPNodeStyleSetHeight(root_child1, 10);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child2, 1.1f);
  HPNodeStyleSetHeight(root_child2, 10.7f);
  HPNodeInsertChild(root, root_child2, 2);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(87, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(113, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(87, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(59, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(59, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(87, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(89, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(87, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(24, HPNodeLayoutGetHeight(root_child2));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(87, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(113, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(87, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(59, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(59, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(87, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(89, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(87, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(24, HPNodeLayoutGetHeight(root_child2));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, rounding_total_fractial_nested) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetWidth(root, 87.4f);
  HPNodeStyleSetHeight(root, 113.4f);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0, 0.7f);
  HPNodeStyleSetFlexBasis(root_child0, 50.3f);
  HPNodeStyleSetHeight(root_child0, 20.3f);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child0_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0_child0, 1);
  HPNodeStyleSetFlexBasis(root_child0_child0, 0.3f);
  HPNodeStyleSetPosition(root_child0_child0, CSSBottom, 13.3f);
  HPNodeStyleSetHeight(root_child0_child0, 9.9f);
  HPNodeInsertChild(root_child0, root_child0_child0, 0);

  const HPNodeRef root_child0_child1 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0_child1, 4);
  HPNodeStyleSetFlexBasis(root_child0_child1, 0.3f);
  HPNodeStyleSetPosition(root_child0_child1, CSSTop, 13.3f);
  HPNodeStyleSetHeight(root_child0_child1, 1.1f);
  HPNodeInsertChild(root_child0, root_child0_child1, 1);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child1, 1.6f);
  HPNodeStyleSetHeight(root_child1, 10);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child2, 1.1f);
  HPNodeStyleSetHeight(root_child2, 10.7f);
  HPNodeInsertChild(root, root_child2, 2);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(87, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(113, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(87, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(59, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0));
  ASSERT_FLOAT_EQ(-13, HPNodeLayoutGetTop(root_child0_child0));
  ASSERT_FLOAT_EQ(87, HPNodeLayoutGetWidth(root_child0_child0));
  ASSERT_FLOAT_EQ(12, HPNodeLayoutGetHeight(root_child0_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child1));
  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetTop(root_child0_child1));
  ASSERT_FLOAT_EQ(87, HPNodeLayoutGetWidth(root_child0_child1));
  ASSERT_FLOAT_EQ(47, HPNodeLayoutGetHeight(root_child0_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(59, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(87, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(89, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(87, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(24, HPNodeLayoutGetHeight(root_child2));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(87, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(113, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(87, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(59, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0));
  ASSERT_FLOAT_EQ(-13, HPNodeLayoutGetTop(root_child0_child0));
  ASSERT_FLOAT_EQ(87, HPNodeLayoutGetWidth(root_child0_child0));
  ASSERT_FLOAT_EQ(12, HPNodeLayoutGetHeight(root_child0_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child1));
  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetTop(root_child0_child1));
  ASSERT_FLOAT_EQ(87, HPNodeLayoutGetWidth(root_child0_child1));
  ASSERT_FLOAT_EQ(47, HPNodeLayoutGetHeight(root_child0_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(59, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(87, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(89, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(87, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(24, HPNodeLayoutGetHeight(root_child2));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, rounding_fractial_input_1) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 113.4f);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0, 1);
  HPNodeStyleSetFlexBasis(root_child0, 50);
  HPNodeStyleSetHeight(root_child0, 20);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child1, 1);
  HPNodeStyleSetHeight(root_child1, 10);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child2, 1);
  HPNodeStyleSetHeight(root_child2, 10);
  HPNodeInsertChild(root, root_child2, 2);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(113, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(64, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(64, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(89, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(24, HPNodeLayoutGetHeight(root_child2));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(113, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(64, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(64, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(89, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(24, HPNodeLayoutGetHeight(root_child2));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, rounding_fractial_input_2) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 113.6f);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0, 1);
  HPNodeStyleSetFlexBasis(root_child0, 50);
  HPNodeStyleSetHeight(root_child0, 20);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child1, 1);
  HPNodeStyleSetHeight(root_child1, 10);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child2, 1);
  HPNodeStyleSetHeight(root_child2, 10);
  HPNodeInsertChild(root, root_child2, 2);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(114, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(65, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(65, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(24, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(89, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetHeight(root_child2));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(114, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(65, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(65, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(24, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(89, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetHeight(root_child2));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, rounding_fractial_input_3) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetPosition(root, CSSTop, 0.3f);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 113.4f);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0, 1);
  HPNodeStyleSetFlexBasis(root_child0, 50);
  HPNodeStyleSetHeight(root_child0, 20);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child1, 1);
  HPNodeStyleSetHeight(root_child1, 10);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child2, 1);
  HPNodeStyleSetHeight(root_child2, 10);
  HPNodeInsertChild(root, root_child2, 2);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(114, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(65, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(64, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(24, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(89, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetHeight(root_child2));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(114, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(65, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(64, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(24, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(89, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetHeight(root_child2));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, rounding_fractial_input_4) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetPosition(root, CSSTop, 0.7f);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 113.4f);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0, 1);
  HPNodeStyleSetFlexBasis(root_child0, 50);
  HPNodeStyleSetHeight(root_child0, 20);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child1, 1);
  HPNodeStyleSetHeight(root_child1, 10);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child2, 1);
  HPNodeStyleSetHeight(root_child2, 10);
  HPNodeInsertChild(root, root_child2, 2);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(1, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(113, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(64, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(64, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(89, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(24, HPNodeLayoutGetHeight(root_child2));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(1, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(113, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(64, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(64, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(89, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(24, HPNodeLayoutGetHeight(root_child2));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, rounding_inner_node_controversy_horizontal) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetWidth(root, 320);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0, 1);
  HPNodeStyleSetHeight(root_child0, 10);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child1, 1);
  HPNodeStyleSetHeight(root_child1, 10);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child1_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child1_child0, 1);
  HPNodeStyleSetHeight(root_child1_child0, 10);
  HPNodeInsertChild(root_child1, root_child1_child0, 0);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child2, 1);
  HPNodeStyleSetHeight(root_child2, 10);
  HPNodeInsertChild(root, root_child2, 2);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(320, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(107, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(107, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(106, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1_child0));
  ASSERT_FLOAT_EQ(106, HPNodeLayoutGetWidth(root_child1_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1_child0));

  ASSERT_FLOAT_EQ(213, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(107, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child2));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(320, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(213, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(107, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(107, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(106, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1_child0));
  ASSERT_FLOAT_EQ(106, HPNodeLayoutGetWidth(root_child1_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(107, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child2));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, rounding_inner_node_controversy_vertical) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetHeight(root, 320);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0, 1);
  HPNodeStyleSetWidth(root_child0, 10);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child1, 1);
  HPNodeStyleSetWidth(root_child1, 10);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child1_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child1_child0, 1);
  HPNodeStyleSetWidth(root_child1_child0, 10);
  HPNodeInsertChild(root_child1, root_child1_child0, 0);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child2, 1);
  HPNodeStyleSetWidth(root_child2, 10);
  HPNodeInsertChild(root, root_child2, 2);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(320, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(107, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(107, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(106, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child1_child0));
  ASSERT_FLOAT_EQ(106, HPNodeLayoutGetHeight(root_child1_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(213, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(107, HPNodeLayoutGetHeight(root_child2));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(320, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(107, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(107, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(106, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child1_child0));
  ASSERT_FLOAT_EQ(106, HPNodeLayoutGetHeight(root_child1_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(213, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(107, HPNodeLayoutGetHeight(root_child2));

  HPNodeFreeRecursive(root);

}

//TODO:: not support percent
//TEST(HippyTest, rounding_inner_node_controversy_combined) {

//  const HPNodeRef root = HPNodeNew();
//  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
//  HPNodeStyleSetWidth(root, 640);
//  HPNodeStyleSetHeight(root, 320);
//
//  const HPNodeRef root_child0 = HPNodeNew();
//  HPNodeStyleSetFlexGrow(root_child0, 1);
//  HPNodeStyleSetHeightPercent(root_child0, 100);
//  HPNodeInsertChild(root, root_child0, 0);
//
//  const HPNodeRef root_child1 = HPNodeNew();
//  HPNodeStyleSetFlexGrow(root_child1, 1);
//  HPNodeStyleSetHeightPercent(root_child1, 100);
//  HPNodeInsertChild(root, root_child1, 1);
//
//  const HPNodeRef root_child1_child0 = HPNodeNew();
//  HPNodeStyleSetFlexGrow(root_child1_child0, 1);
//  HPNodeStyleSetWidthPercent(root_child1_child0, 100);
//  HPNodeInsertChild(root_child1, root_child1_child0, 0);
//
//  const HPNodeRef root_child1_child1 = HPNodeNew();
//  HPNodeStyleSetFlexGrow(root_child1_child1, 1);
//  HPNodeStyleSetWidthPercent(root_child1_child1, 100);
//  HPNodeInsertChild(root_child1, root_child1_child1, 1);
//
//  const HPNodeRef root_child1_child1_child0 = HPNodeNew();
//  HPNodeStyleSetFlexGrow(root_child1_child1_child0, 1);
//  HPNodeStyleSetWidthPercent(root_child1_child1_child0, 100);
//  HPNodeInsertChild(root_child1_child1, root_child1_child1_child0, 0);
//
//  const HPNodeRef root_child1_child2 = HPNodeNew();
//  HPNodeStyleSetFlexGrow(root_child1_child2, 1);
//  HPNodeStyleSetWidthPercent(root_child1_child2, 100);
//  HPNodeInsertChild(root_child1, root_child1_child2, 2);
//
//  const HPNodeRef root_child2 = HPNodeNew();
//  HPNodeStyleSetFlexGrow(root_child2, 1);
//  HPNodeStyleSetHeightPercent(root_child2, 100);
//  HPNodeInsertChild(root, root_child2, 2);
//  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
//  ASSERT_FLOAT_EQ(640, HPNodeLayoutGetWidth(root));
//  ASSERT_FLOAT_EQ(320, HPNodeLayoutGetHeight(root));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
//  ASSERT_FLOAT_EQ(213, HPNodeLayoutGetWidth(root_child0));
//  ASSERT_FLOAT_EQ(320, HPNodeLayoutGetHeight(root_child0));
//
//  ASSERT_FLOAT_EQ(213, HPNodeLayoutGetLeft(root_child1));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
//  ASSERT_FLOAT_EQ(214, HPNodeLayoutGetWidth(root_child1));
//  ASSERT_FLOAT_EQ(320, HPNodeLayoutGetHeight(root_child1));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1_child0));
//  ASSERT_FLOAT_EQ(214, HPNodeLayoutGetWidth(root_child1_child0));
//  ASSERT_FLOAT_EQ(107, HPNodeLayoutGetHeight(root_child1_child0));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1_child1));
//  ASSERT_FLOAT_EQ(107, HPNodeLayoutGetTop(root_child1_child1));
//  ASSERT_FLOAT_EQ(214, HPNodeLayoutGetWidth(root_child1_child1));
//  ASSERT_FLOAT_EQ(106, HPNodeLayoutGetHeight(root_child1_child1));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1_child1_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1_child1_child0));
//  ASSERT_FLOAT_EQ(214, HPNodeLayoutGetWidth(root_child1_child1_child0));
//  ASSERT_FLOAT_EQ(106, HPNodeLayoutGetHeight(root_child1_child1_child0));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1_child2));
//  ASSERT_FLOAT_EQ(213, HPNodeLayoutGetTop(root_child1_child2));
//  ASSERT_FLOAT_EQ(214, HPNodeLayoutGetWidth(root_child1_child2));
//  ASSERT_FLOAT_EQ(107, HPNodeLayoutGetHeight(root_child1_child2));
//
//  ASSERT_FLOAT_EQ(427, HPNodeLayoutGetLeft(root_child2));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
//  ASSERT_FLOAT_EQ(213, HPNodeLayoutGetWidth(root_child2));
//  ASSERT_FLOAT_EQ(320, HPNodeLayoutGetHeight(root_child2));

//  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
//  ASSERT_FLOAT_EQ(640, HPNodeLayoutGetWidth(root));
//  ASSERT_FLOAT_EQ(320, HPNodeLayoutGetHeight(root));
//
//  ASSERT_FLOAT_EQ(427, HPNodeLayoutGetLeft(root_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
//  ASSERT_FLOAT_EQ(213, HPNodeLayoutGetWidth(root_child0));
//  ASSERT_FLOAT_EQ(320, HPNodeLayoutGetHeight(root_child0));
//
//  ASSERT_FLOAT_EQ(213, HPNodeLayoutGetLeft(root_child1));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
//  ASSERT_FLOAT_EQ(214, HPNodeLayoutGetWidth(root_child1));
//  ASSERT_FLOAT_EQ(320, HPNodeLayoutGetHeight(root_child1));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1_child0));
//  ASSERT_FLOAT_EQ(214, HPNodeLayoutGetWidth(root_child1_child0));
//  ASSERT_FLOAT_EQ(107, HPNodeLayoutGetHeight(root_child1_child0));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1_child1));
//  ASSERT_FLOAT_EQ(107, HPNodeLayoutGetTop(root_child1_child1));
//  ASSERT_FLOAT_EQ(214, HPNodeLayoutGetWidth(root_child1_child1));
//  ASSERT_FLOAT_EQ(106, HPNodeLayoutGetHeight(root_child1_child1));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1_child1_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1_child1_child0));
//  ASSERT_FLOAT_EQ(214, HPNodeLayoutGetWidth(root_child1_child1_child0));
//  ASSERT_FLOAT_EQ(106, HPNodeLayoutGetHeight(root_child1_child1_child0));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1_child2));
//  ASSERT_FLOAT_EQ(213, HPNodeLayoutGetTop(root_child1_child2));
//  ASSERT_FLOAT_EQ(214, HPNodeLayoutGetWidth(root_child1_child2));
//  ASSERT_FLOAT_EQ(107, HPNodeLayoutGetHeight(root_child1_child2));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
//  ASSERT_FLOAT_EQ(213, HPNodeLayoutGetWidth(root_child2));
//  ASSERT_FLOAT_EQ(320, HPNodeLayoutGetHeight(root_child2));

//  HPNodeFreeRecursive(root);

//}
