/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http:  www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#include <gtest.h>
#include <Hippy.h>

TEST(HippyTest, wrap_column) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexWrap(root, FlexWrap);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 30);
  HPNodeStyleSetHeight(root_child0, 30);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 30);
  HPNodeStyleSetHeight(root_child1, 30);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetWidth(root_child2, 30);
  HPNodeStyleSetHeight(root_child2, 30);
  HPNodeInsertChild(root, root_child2, 2);

  const HPNodeRef root_child3 = HPNodeNew();
  HPNodeStyleSetWidth(root_child3, 30);
  HPNodeStyleSetHeight(root_child3, 30);
  HPNodeInsertChild(root, root_child3, 3);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetHeight(root_child3));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetHeight(root_child3));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, wrap_row) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetFlexWrap(root, FlexWrap);
  HPNodeStyleSetWidth(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 30);
  HPNodeStyleSetHeight(root_child0, 30);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 30);
  HPNodeStyleSetHeight(root_child1, 30);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetWidth(root_child2, 30);
  HPNodeStyleSetHeight(root_child2, 30);
  HPNodeInsertChild(root, root_child2, 2);

  const HPNodeRef root_child3 = HPNodeNew();
  HPNodeStyleSetWidth(root_child3, 30);
  HPNodeStyleSetHeight(root_child3, 30);
  HPNodeInsertChild(root, root_child3, 3);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetHeight(root_child3));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(70, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(70, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetHeight(root_child3));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, wrap_row_align_items_flex_end) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetAlignItems(root, FlexAlignEnd);
  HPNodeStyleSetFlexWrap(root, FlexWrap);
  HPNodeStyleSetWidth(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 30);
  HPNodeStyleSetHeight(root_child0, 10);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 30);
  HPNodeStyleSetHeight(root_child1, 20);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetWidth(root_child2, 30);
  HPNodeStyleSetHeight(root_child2, 30);
  HPNodeInsertChild(root, root_child2, 2);

  const HPNodeRef root_child3 = HPNodeNew();
  HPNodeStyleSetWidth(root_child3, 30);
  HPNodeStyleSetHeight(root_child3, 30);
  HPNodeInsertChild(root, root_child3, 3);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetHeight(root_child3));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(70, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(70, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetHeight(root_child3));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, wrap_row_align_items_center) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetAlignItems(root, FlexAlignCenter);
  HPNodeStyleSetFlexWrap(root, FlexWrap);
  HPNodeStyleSetWidth(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 30);
  HPNodeStyleSetHeight(root_child0, 10);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 30);
  HPNodeStyleSetHeight(root_child1, 20);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetWidth(root_child2, 30);
  HPNodeStyleSetHeight(root_child2, 30);
  HPNodeInsertChild(root, root_child2, 2);

  const HPNodeRef root_child3 = HPNodeNew();
  HPNodeStyleSetWidth(root_child3, 30);
  HPNodeStyleSetHeight(root_child3, 30);
  HPNodeInsertChild(root, root_child3, 3);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(5, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetHeight(root_child3));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(70, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(5, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(70, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetHeight(root_child3));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, flex_wrap_children_with_min_main_overriding_flex_basis) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetFlexWrap(root, FlexWrap);
  HPNodeStyleSetWidth(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexBasis(root_child0, 50);
  HPNodeStyleSetMinWidth(root_child0, 55);
  HPNodeStyleSetHeight(root_child0, 50);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetFlexBasis(root_child1, 50);
  HPNodeStyleSetMinWidth(root_child1, 55);
  HPNodeStyleSetHeight(root_child1, 50);
  HPNodeInsertChild(root, root_child1, 1);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(55, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(55, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child1));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(45, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(55, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(45, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(55, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child1));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, flex_wrap_wrap_to_child_height) {

  const HPNodeRef root = HPNodeNew();

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexDirection(root_child0, FLexDirectionRow);
  HPNodeStyleSetAlignItems(root_child0, FlexAlignStart);
  HPNodeStyleSetFlexWrap(root_child0, FlexWrap);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child0_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0_child0, 100);
  HPNodeInsertChild(root_child0, root_child0_child0, 0);

  const HPNodeRef root_child0_child0_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0_child0_child0, 100);
  HPNodeStyleSetHeight(root_child0_child0_child0, 100);
  HPNodeInsertChild(root_child0_child0, root_child0_child0_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 100);
  HPNodeStyleSetHeight(root_child1, 100);
  HPNodeInsertChild(root, root_child1, 1);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0_child0_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0_child0_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child1));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0_child0_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0_child0_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child1));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, flex_wrap_align_stretch_fits_one_row) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetFlexWrap(root, FlexWrap);
  HPNodeStyleSetWidth(root, 150);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 50);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 50);
  HPNodeInsertChild(root, root_child1, 1);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(150, HPNodeLayoutGetWidth(root));
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
  ASSERT_FLOAT_EQ(150, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child1));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, wrap_reverse_row_align_content_flex_start) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetFlexWrap(root, FlexWrapReverse);
  HPNodeStyleSetWidth(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 30);
  HPNodeStyleSetHeight(root_child0, 10);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 30);
  HPNodeStyleSetHeight(root_child1, 20);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetWidth(root_child2, 30);
  HPNodeStyleSetHeight(root_child2, 30);
  HPNodeInsertChild(root, root_child2, 2);

  const HPNodeRef root_child3 = HPNodeNew();
  HPNodeStyleSetWidth(root_child3, 30);
  HPNodeStyleSetHeight(root_child3, 40);
  HPNodeInsertChild(root, root_child3, 3);

  const HPNodeRef root_child4 = HPNodeNew();
  HPNodeStyleSetWidth(root_child4, 30);
  HPNodeStyleSetHeight(root_child4, 50);
  HPNodeInsertChild(root, root_child4, 4);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(70, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child3));

  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetLeft(root_child4));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child4));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child4));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(70, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(70, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(70, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child3));

  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetLeft(root_child4));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child4));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child4));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, wrap_reverse_row_align_content_center) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetAlignContent(root, FlexAlignCenter);
  HPNodeStyleSetFlexWrap(root, FlexWrapReverse);
  HPNodeStyleSetWidth(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 30);
  HPNodeStyleSetHeight(root_child0, 10);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 30);
  HPNodeStyleSetHeight(root_child1, 20);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetWidth(root_child2, 30);
  HPNodeStyleSetHeight(root_child2, 30);
  HPNodeInsertChild(root, root_child2, 2);

  const HPNodeRef root_child3 = HPNodeNew();
  HPNodeStyleSetWidth(root_child3, 30);
  HPNodeStyleSetHeight(root_child3, 40);
  HPNodeInsertChild(root, root_child3, 3);

  const HPNodeRef root_child4 = HPNodeNew();
  HPNodeStyleSetWidth(root_child4, 30);
  HPNodeStyleSetHeight(root_child4, 50);
  HPNodeInsertChild(root, root_child4, 4);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(70, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child3));

  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetLeft(root_child4));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child4));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child4));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(70, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(70, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(70, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child3));

  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetLeft(root_child4));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child4));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child4));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, wrap_reverse_row_single_line_different_size) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetFlexWrap(root, FlexWrapReverse);
  HPNodeStyleSetWidth(root, 300);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 30);
  HPNodeStyleSetHeight(root_child0, 10);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 30);
  HPNodeStyleSetHeight(root_child1, 20);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetWidth(root_child2, 30);
  HPNodeStyleSetHeight(root_child2, 30);
  HPNodeInsertChild(root, root_child2, 2);

  const HPNodeRef root_child3 = HPNodeNew();
  HPNodeStyleSetWidth(root_child3, 30);
  HPNodeStyleSetHeight(root_child3, 40);
  HPNodeInsertChild(root, root_child3, 3);

  const HPNodeRef root_child4 = HPNodeNew();
  HPNodeStyleSetWidth(root_child4, 30);
  HPNodeStyleSetHeight(root_child4, 50);
  HPNodeInsertChild(root, root_child4, 4);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(300, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(90, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child3));

  ASSERT_FLOAT_EQ(120, HPNodeLayoutGetLeft(root_child4));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child4));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child4));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(300, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(270, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(240, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(210, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(180, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child3));

  ASSERT_FLOAT_EQ(150, HPNodeLayoutGetLeft(root_child4));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child4));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child4));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, wrap_reverse_row_align_content_stretch) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetAlignContent(root, FlexAlignStretch);
  HPNodeStyleSetFlexWrap(root, FlexWrapReverse);
  HPNodeStyleSetWidth(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 30);
  HPNodeStyleSetHeight(root_child0, 10);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 30);
  HPNodeStyleSetHeight(root_child1, 20);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetWidth(root_child2, 30);
  HPNodeStyleSetHeight(root_child2, 30);
  HPNodeInsertChild(root, root_child2, 2);

  const HPNodeRef root_child3 = HPNodeNew();
  HPNodeStyleSetWidth(root_child3, 30);
  HPNodeStyleSetHeight(root_child3, 40);
  HPNodeInsertChild(root, root_child3, 3);

  const HPNodeRef root_child4 = HPNodeNew();
  HPNodeStyleSetWidth(root_child4, 30);
  HPNodeStyleSetHeight(root_child4, 50);
  HPNodeInsertChild(root, root_child4, 4);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(70, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child3));

  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetLeft(root_child4));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child4));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child4));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(70, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(70, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(70, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child3));

  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetLeft(root_child4));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child4));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child4));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, wrap_reverse_row_align_content_space_around) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetAlignContent(root, FlexAlignSpaceAround);
  HPNodeStyleSetFlexWrap(root, FlexWrapReverse);
  HPNodeStyleSetWidth(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 30);
  HPNodeStyleSetHeight(root_child0, 10);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 30);
  HPNodeStyleSetHeight(root_child1, 20);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetWidth(root_child2, 30);
  HPNodeStyleSetHeight(root_child2, 30);
  HPNodeInsertChild(root, root_child2, 2);

  const HPNodeRef root_child3 = HPNodeNew();
  HPNodeStyleSetWidth(root_child3, 30);
  HPNodeStyleSetHeight(root_child3, 40);
  HPNodeInsertChild(root, root_child3, 3);

  const HPNodeRef root_child4 = HPNodeNew();
  HPNodeStyleSetWidth(root_child4, 30);
  HPNodeStyleSetHeight(root_child4, 50);
  HPNodeInsertChild(root, root_child4, 4);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(70, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child3));

  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetLeft(root_child4));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child4));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child4));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(70, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(70, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(70, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child3));

  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetLeft(root_child4));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child4));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child4));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, wrap_reverse_column_fixed_size) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetAlignItems(root, FlexAlignCenter);
  HPNodeStyleSetFlexWrap(root, FlexWrapReverse);
  HPNodeStyleSetWidth(root, 200);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 30);
  HPNodeStyleSetHeight(root_child0, 10);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 30);
  HPNodeStyleSetHeight(root_child1, 20);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetWidth(root_child2, 30);
  HPNodeStyleSetHeight(root_child2, 30);
  HPNodeInsertChild(root, root_child2, 2);

  const HPNodeRef root_child3 = HPNodeNew();
  HPNodeStyleSetWidth(root_child3, 30);
  HPNodeStyleSetHeight(root_child3, 40);
  HPNodeInsertChild(root, root_child3, 3);

  const HPNodeRef root_child4 = HPNodeNew();
  HPNodeStyleSetWidth(root_child4, 30);
  HPNodeStyleSetHeight(root_child4, 50);
  HPNodeInsertChild(root, root_child4, 4);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(170, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(170, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(170, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(170, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child3));

  ASSERT_FLOAT_EQ(140, HPNodeLayoutGetLeft(root_child4));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child4));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child4));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child3));

  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetLeft(root_child4));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child4));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child4));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, wrapped_row_within_align_items_center) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetAlignItems(root, FlexAlignCenter);
  HPNodeStyleSetWidth(root, 200);
  HPNodeStyleSetHeight(root, 200);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexDirection(root_child0, FLexDirectionRow);
  HPNodeStyleSetFlexWrap(root_child0, FlexWrap);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child0_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0_child0, 150);
  HPNodeStyleSetHeight(root_child0_child0, 80);
  HPNodeInsertChild(root_child0, root_child0_child0, 0);

  const HPNodeRef root_child0_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0_child1, 80);
  HPNodeStyleSetHeight(root_child0_child1, 80);
  HPNodeInsertChild(root_child0, root_child0_child1, 1);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(160, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
  ASSERT_FLOAT_EQ(150, HPNodeLayoutGetWidth(root_child0_child0));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetHeight(root_child0_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child1));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetTop(root_child0_child1));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetWidth(root_child0_child1));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetHeight(root_child0_child1));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(160, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
  ASSERT_FLOAT_EQ(150, HPNodeLayoutGetWidth(root_child0_child0));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetHeight(root_child0_child0));

  ASSERT_FLOAT_EQ(120, HPNodeLayoutGetLeft(root_child0_child1));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetTop(root_child0_child1));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetWidth(root_child0_child1));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetHeight(root_child0_child1));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, wrapped_row_within_align_items_flex_start) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetAlignItems(root, FlexAlignStart);
  HPNodeStyleSetWidth(root, 200);
  HPNodeStyleSetHeight(root, 200);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexDirection(root_child0, FLexDirectionRow);
  HPNodeStyleSetFlexWrap(root_child0, FlexWrap);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child0_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0_child0, 150);
  HPNodeStyleSetHeight(root_child0_child0, 80);
  HPNodeInsertChild(root_child0, root_child0_child0, 0);

  const HPNodeRef root_child0_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0_child1, 80);
  HPNodeStyleSetHeight(root_child0_child1, 80);
  HPNodeInsertChild(root_child0, root_child0_child1, 1);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(160, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
  ASSERT_FLOAT_EQ(150, HPNodeLayoutGetWidth(root_child0_child0));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetHeight(root_child0_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child1));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetTop(root_child0_child1));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetWidth(root_child0_child1));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetHeight(root_child0_child1));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(160, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
  ASSERT_FLOAT_EQ(150, HPNodeLayoutGetWidth(root_child0_child0));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetHeight(root_child0_child0));

  ASSERT_FLOAT_EQ(120, HPNodeLayoutGetLeft(root_child0_child1));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetTop(root_child0_child1));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetWidth(root_child0_child1));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetHeight(root_child0_child1));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, wrapped_row_within_align_items_flex_end) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetAlignItems(root, FlexAlignEnd);
  HPNodeStyleSetWidth(root, 200);
  HPNodeStyleSetHeight(root, 200);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexDirection(root_child0, FLexDirectionRow);
  HPNodeStyleSetFlexWrap(root_child0, FlexWrap);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child0_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0_child0, 150);
  HPNodeStyleSetHeight(root_child0_child0, 80);
  HPNodeInsertChild(root_child0, root_child0_child0, 0);

  const HPNodeRef root_child0_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0_child1, 80);
  HPNodeStyleSetHeight(root_child0_child1, 80);
  HPNodeInsertChild(root_child0, root_child0_child1, 1);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(160, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
  ASSERT_FLOAT_EQ(150, HPNodeLayoutGetWidth(root_child0_child0));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetHeight(root_child0_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child1));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetTop(root_child0_child1));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetWidth(root_child0_child1));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetHeight(root_child0_child1));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(160, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
  ASSERT_FLOAT_EQ(150, HPNodeLayoutGetWidth(root_child0_child0));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetHeight(root_child0_child0));

  ASSERT_FLOAT_EQ(120, HPNodeLayoutGetLeft(root_child0_child1));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetTop(root_child0_child1));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetWidth(root_child0_child1));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetHeight(root_child0_child1));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, wrapped_column_max_height) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetJustifyContent(root, FlexAlignCenter);
  HPNodeStyleSetAlignContent(root, FlexAlignCenter);
  HPNodeStyleSetAlignItems(root, FlexAlignCenter);
  HPNodeStyleSetFlexWrap(root, FlexWrap);
  HPNodeStyleSetWidth(root, 700);
  HPNodeStyleSetHeight(root, 500);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 100);
  HPNodeStyleSetHeight(root_child0, 500);
  HPNodeStyleSetMaxHeight(root_child0, 200);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetMargin(root_child1, CSSLeft, 20);
  HPNodeStyleSetMargin(root_child1, CSSTop, 20);
  HPNodeStyleSetMargin(root_child1, CSSRight, 20);
  HPNodeStyleSetMargin(root_child1, CSSBottom, 20);
  HPNodeStyleSetWidth(root_child1, 200);
  HPNodeStyleSetHeight(root_child1, 200);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetWidth(root_child2, 100);
  HPNodeStyleSetHeight(root_child2, 100);
  HPNodeInsertChild(root, root_child2, 2);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(700, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(500, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(250, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(250, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(420, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child2));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(700, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(500, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(350, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(300, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(250, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(180, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child2));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, wrapped_column_max_height_flex) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetJustifyContent(root, FlexAlignCenter);
  HPNodeStyleSetAlignContent(root, FlexAlignCenter);
  HPNodeStyleSetAlignItems(root, FlexAlignCenter);
  HPNodeStyleSetFlexWrap(root, FlexWrap);
  HPNodeStyleSetWidth(root, 700);
  HPNodeStyleSetHeight(root, 500);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0, 1);
  HPNodeStyleSetFlexShrink(root_child0, 1);
  HPNodeStyleSetFlexBasis(root_child0, 0);
  HPNodeStyleSetWidth(root_child0, 100);
  HPNodeStyleSetHeight(root_child0, 500);
  HPNodeStyleSetMaxHeight(root_child0, 200);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child1, 1);
  HPNodeStyleSetFlexShrink(root_child1, 1);
  HPNodeStyleSetFlexBasis(root_child1, 0);
  HPNodeStyleSetMargin(root_child1, CSSLeft, 20);
  HPNodeStyleSetMargin(root_child1, CSSTop, 20);
  HPNodeStyleSetMargin(root_child1, CSSRight, 20);
  HPNodeStyleSetMargin(root_child1, CSSBottom, 20);
  HPNodeStyleSetWidth(root_child1, 200);
  HPNodeStyleSetHeight(root_child1, 200);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetWidth(root_child2, 100);
  HPNodeStyleSetHeight(root_child2, 100);
  HPNodeInsertChild(root, root_child2, 2);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(700, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(500, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(300, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(180, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(250, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(180, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(300, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(400, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child2));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(700, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(500, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(300, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(180, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(250, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(180, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(300, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(400, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child2));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, wrap_nodes_with_content_sizing_overflowing_margin) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetWidth(root, 500);
  HPNodeStyleSetHeight(root, 500);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexDirection(root_child0, FLexDirectionRow);
  HPNodeStyleSetFlexWrap(root_child0, FlexWrap);
  HPNodeStyleSetWidth(root_child0, 85);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child0_child0 = HPNodeNew();
  HPNodeInsertChild(root_child0, root_child0_child0, 0);

  const HPNodeRef root_child0_child0_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0_child0_child0, 40);
  HPNodeStyleSetHeight(root_child0_child0_child0, 40);
  HPNodeInsertChild(root_child0_child0, root_child0_child0_child0, 0);

  const HPNodeRef root_child0_child1 = HPNodeNew();
  HPNodeStyleSetMargin(root_child0_child1, CSSRight, 10);
  HPNodeInsertChild(root_child0, root_child0_child1, 1);

  const HPNodeRef root_child0_child1_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0_child1_child0, 40);
  HPNodeStyleSetHeight(root_child0_child1_child0, 40);
  HPNodeInsertChild(root_child0_child1, root_child0_child1_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(500, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(500, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(85, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetWidth(root_child0_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child0_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetWidth(root_child0_child0_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child0_child0_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child1));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetTop(root_child0_child1));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetWidth(root_child0_child1));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child0_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child1_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child1_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetWidth(root_child0_child1_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child0_child1_child0));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(500, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(500, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(415, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(85, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(45, HPNodeLayoutGetLeft(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetWidth(root_child0_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child0_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetWidth(root_child0_child0_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child0_child0_child0));

  ASSERT_FLOAT_EQ(35, HPNodeLayoutGetLeft(root_child0_child1));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetTop(root_child0_child1));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetWidth(root_child0_child1));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child0_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child1_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child1_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetWidth(root_child0_child1_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child0_child1_child0));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, wrap_nodes_with_content_sizing_margin_cross) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetWidth(root, 500);
  HPNodeStyleSetHeight(root, 500);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexDirection(root_child0, FLexDirectionRow);
  HPNodeStyleSetFlexWrap(root_child0, FlexWrap);
  HPNodeStyleSetWidth(root_child0, 70);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child0_child0 = HPNodeNew();
  HPNodeInsertChild(root_child0, root_child0_child0, 0);

  const HPNodeRef root_child0_child0_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0_child0_child0, 40);
  HPNodeStyleSetHeight(root_child0_child0_child0, 40);
  HPNodeInsertChild(root_child0_child0, root_child0_child0_child0, 0);

  const HPNodeRef root_child0_child1 = HPNodeNew();
  HPNodeStyleSetMargin(root_child0_child1, CSSTop, 10);
  HPNodeInsertChild(root_child0, root_child0_child1, 1);

  const HPNodeRef root_child0_child1_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0_child1_child0, 40);
  HPNodeStyleSetHeight(root_child0_child1_child0, 40);
  HPNodeInsertChild(root_child0_child1, root_child0_child1_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(500, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(500, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(70, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(90, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetWidth(root_child0_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child0_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetWidth(root_child0_child0_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child0_child0_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child0_child1));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetWidth(root_child0_child1));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child0_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child1_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child1_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetWidth(root_child0_child1_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child0_child1_child0));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(500, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(500, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(430, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(70, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(90, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetLeft(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetWidth(root_child0_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child0_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetWidth(root_child0_child0_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child0_child0_child0));

  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetLeft(root_child0_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child0_child1));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetWidth(root_child0_child1));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child0_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child1_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child1_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetWidth(root_child0_child1_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child0_child1_child0));

  HPNodeFreeRecursive(root);

}
