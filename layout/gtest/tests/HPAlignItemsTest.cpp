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

TEST(HippyTest, align_items_stretch) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetHeight(root_child0, 10);
  HPNodeInsertChild(root, root_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

//  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
//  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, align_items_center) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetAlignItems(root, FlexAlignCenter);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 10);
  HPNodeStyleSetHeight(root_child0, 10);
  HPNodeInsertChild(root, root_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(45, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(45, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, align_items_flex_start) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetAlignItems(root, FlexAlignStart);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 10);
  HPNodeStyleSetHeight(root_child0, 10);
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

//  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));
//
//  ASSERT_FLOAT_EQ(90, HPNodeLayoutGetLeft(root_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
//  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0));
//  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, align_items_flex_end) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetAlignItems(root, FlexAlignEnd);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 10);
  HPNodeStyleSetHeight(root_child0, 10);
  HPNodeInsertChild(root, root_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(90, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

//  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
//  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0));
//  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  HPNodeFreeRecursive(root);

}

//TODO:: baseline not support ianwang 2018.01.13.
/*
TEST(HippyTest, align_baseline) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetAlignItems(root, FlexAlignBaseline);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 50);
  HPNodeStyleSetHeight(root_child0, 50);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 50);
  HPNodeStyleSetHeight(root_child1, 20);
  HPNodeInsertChild(root, root_child1, 1);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1));

//  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));
//
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
//  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetTop(root_child1));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1));

  HPNodeFreeRecursive(root);

}


TEST(HippyTest, align_baseline_child) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetAlignItems(root, FlexAlignBaseline);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 50);
  HPNodeStyleSetHeight(root_child0, 50);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 50);
  HPNodeStyleSetHeight(root_child1, 20);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child1_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1_child0, 50);
  HPNodeStyleSetHeight(root_child1_child0, 10);
  HPNodeInsertChild(root_child1, root_child1_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1_child0));

//  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));
//
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
//  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetTop(root_child1));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1_child0));
//  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1_child0));

  HPNodeFreeRecursive(root);

}


TEST(HippyTest, align_baseline_child_multiline) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetAlignItems(root, FlexAlignBaseline);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 50);
  HPNodeStyleSetHeight(root_child0, 60);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetFlexDirection(root_child1, FLexDirectionRow);
  HPNodeStyleSetFlexWrap(root_child1, FlexWrap);
  HPNodeStyleSetWidth(root_child1, 50);
  HPNodeStyleSetHeight(root_child1, 25);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child1_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1_child0, 25);
  HPNodeStyleSetHeight(root_child1_child0, 20);
  HPNodeInsertChild(root_child1, root_child1_child0, 0);

  const HPNodeRef root_child1_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1_child1, 25);
  HPNodeStyleSetHeight(root_child1_child1, 10);
  HPNodeInsertChild(root_child1, root_child1_child1, 1);

  const HPNodeRef root_child1_child2 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1_child2, 25);
  HPNodeStyleSetHeight(root_child1_child2, 20);
  HPNodeInsertChild(root_child1, root_child1_child2, 2);

  const HPNodeRef root_child1_child3 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1_child3, 25);
  HPNodeStyleSetHeight(root_child1_child3, 10);
  HPNodeInsertChild(root_child1, root_child1_child3, 3);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1_child0));
  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetWidth(root_child1_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1_child0));

  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetLeft(root_child1_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1_child1));
  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetWidth(root_child1_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1_child2));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root_child1_child2));
  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetWidth(root_child1_child2));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1_child2));

  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetLeft(root_child1_child3));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root_child1_child3));
  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetWidth(root_child1_child3));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1_child3));

//  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));
//
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
//  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetHeight(root_child0));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
//  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetTop(root_child1));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
//  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetHeight(root_child1));
//
//  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetLeft(root_child1_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1_child0));
//  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetWidth(root_child1_child0));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1_child0));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1_child1));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1_child1));
//  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetWidth(root_child1_child1));
//  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1_child1));
//
//  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetLeft(root_child1_child2));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root_child1_child2));
//  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetWidth(root_child1_child2));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1_child2));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1_child3));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root_child1_child3));
//  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetWidth(root_child1_child3));
//  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1_child3));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, align_baseline_child_multiline_override) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetAlignItems(root, FlexAlignBaseline);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 50);
  HPNodeStyleSetHeight(root_child0, 60);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetFlexDirection(root_child1, FLexDirectionRow);
  HPNodeStyleSetFlexWrap(root_child1, FlexWrap);
  HPNodeStyleSetWidth(root_child1, 50);
  HPNodeStyleSetHeight(root_child1, 25);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child1_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1_child0, 25);
  HPNodeStyleSetHeight(root_child1_child0, 20);
  HPNodeInsertChild(root_child1, root_child1_child0, 0);

  const HPNodeRef root_child1_child1 = HPNodeNew();
  HPNodeStyleSetAlignSelf(root_child1_child1, FlexAlignBaseline);
  HPNodeStyleSetWidth(root_child1_child1, 25);
  HPNodeStyleSetHeight(root_child1_child1, 10);
  HPNodeInsertChild(root_child1, root_child1_child1, 1);

  const HPNodeRef root_child1_child2 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1_child2, 25);
  HPNodeStyleSetHeight(root_child1_child2, 20);
  HPNodeInsertChild(root_child1, root_child1_child2, 2);

  const HPNodeRef root_child1_child3 = HPNodeNew();
  HPNodeStyleSetAlignSelf(root_child1_child3, FlexAlignBaseline);
  HPNodeStyleSetWidth(root_child1_child3, 25);
  HPNodeStyleSetHeight(root_child1_child3, 10);
  HPNodeInsertChild(root_child1, root_child1_child3, 3);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1_child0));
  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetWidth(root_child1_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1_child0));

  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetLeft(root_child1_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1_child1));
  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetWidth(root_child1_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1_child2));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root_child1_child2));
  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetWidth(root_child1_child2));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1_child2));

  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetLeft(root_child1_child3));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root_child1_child3));
  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetWidth(root_child1_child3));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1_child3));

//  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));
//
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
//  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetHeight(root_child0));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child1));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
//  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetHeight(root_child1));
//
//  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetLeft(root_child1_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1_child0));
//  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetWidth(root_child1_child0));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1_child0));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1_child1));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1_child1));
//  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetWidth(root_child1_child1));
//  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1_child1));
//
//  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetLeft(root_child1_child2));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root_child1_child2));
//  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetWidth(root_child1_child2));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1_child2));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1_child3));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root_child1_child3));
//  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetWidth(root_child1_child3));
//  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1_child3));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, align_baseline_child_multiline_no_override_on_secondline) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetAlignItems(root, FlexAlignBaseline);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 50);
  HPNodeStyleSetHeight(root_child0, 60);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetFlexDirection(root_child1, FLexDirectionRow);
  HPNodeStyleSetFlexWrap(root_child1, FlexWrap);
  HPNodeStyleSetWidth(root_child1, 50);
  HPNodeStyleSetHeight(root_child1, 25);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child1_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1_child0, 25);
  HPNodeStyleSetHeight(root_child1_child0, 20);
  HPNodeInsertChild(root_child1, root_child1_child0, 0);

  const HPNodeRef root_child1_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1_child1, 25);
  HPNodeStyleSetHeight(root_child1_child1, 10);
  HPNodeInsertChild(root_child1, root_child1_child1, 1);

  const HPNodeRef root_child1_child2 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1_child2, 25);
  HPNodeStyleSetHeight(root_child1_child2, 20);
  HPNodeInsertChild(root_child1, root_child1_child2, 2);

  const HPNodeRef root_child1_child3 = HPNodeNew();
  HPNodeStyleSetAlignSelf(root_child1_child3, FlexAlignBaseline);
  HPNodeStyleSetWidth(root_child1_child3, 25);
  HPNodeStyleSetHeight(root_child1_child3, 10);
  HPNodeInsertChild(root_child1, root_child1_child3, 3);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1_child0));
  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetWidth(root_child1_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1_child0));

  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetLeft(root_child1_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1_child1));
  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetWidth(root_child1_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1_child2));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root_child1_child2));
  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetWidth(root_child1_child2));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1_child2));

  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetLeft(root_child1_child3));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root_child1_child3));
  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetWidth(root_child1_child3));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1_child3));

//  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));
//
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
//  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetHeight(root_child0));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
//  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetTop(root_child1));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
//  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetHeight(root_child1));
//
//  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetLeft(root_child1_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1_child0));
//  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetWidth(root_child1_child0));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1_child0));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1_child1));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1_child1));
//  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetWidth(root_child1_child1));
//  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1_child1));
//
//  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetLeft(root_child1_child2));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root_child1_child2));
//  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetWidth(root_child1_child2));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1_child2));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1_child3));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root_child1_child3));
//  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetWidth(root_child1_child3));
//  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1_child3));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, align_baseline_child_top) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetAlignItems(root, FlexAlignBaseline);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetPosition(root_child0, CSSTop, 10);
  HPNodeStyleSetWidth(root_child0, 50);
  HPNodeStyleSetHeight(root_child0, 50);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 50);
  HPNodeStyleSetHeight(root_child1, 20);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child1_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1_child0, 50);
  HPNodeStyleSetHeight(root_child1_child0, 10);
  HPNodeInsertChild(root_child1, root_child1_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1_child0));

//  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));
//
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child0));
//  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
//  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetTop(root_child1));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1_child0));
//  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1_child0));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, align_baseline_child_top2) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetAlignItems(root, FlexAlignBaseline);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 50);
  HPNodeStyleSetHeight(root_child0, 50);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetPosition(root_child1, CSSTop, 5);
  HPNodeStyleSetWidth(root_child1, 50);
  HPNodeStyleSetHeight(root_child1, 20);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child1_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1_child0, 50);
  HPNodeStyleSetHeight(root_child1_child0, 10);
  HPNodeInsertChild(root_child1, root_child1_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(45, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1_child0));

//  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));
//
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
//  ASSERT_FLOAT_EQ(45, HPNodeLayoutGetTop(root_child1));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1_child0));
//  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1_child0));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, align_baseline_double_nested_child) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetAlignItems(root, FlexAlignBaseline);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 50);
  HPNodeStyleSetHeight(root_child0, 50);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child0_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0_child0, 50);
  HPNodeStyleSetHeight(root_child0_child0, 20);
  HPNodeInsertChild(root_child0, root_child0_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 50);
  HPNodeStyleSetHeight(root_child1, 20);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child1_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1_child0, 50);
  HPNodeStyleSetHeight(root_child1_child0, 15);
  HPNodeInsertChild(root_child1, root_child1_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child0_child0));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(5, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1_child0));
  ASSERT_FLOAT_EQ(15, HPNodeLayoutGetHeight(root_child1_child0));

//  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));
//
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0_child0));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child0_child0));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
//  ASSERT_FLOAT_EQ(5, HPNodeLayoutGetTop(root_child1));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1_child0));
//  ASSERT_FLOAT_EQ(15, HPNodeLayoutGetHeight(root_child1_child0));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, align_baseline_column) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetAlignItems(root, FlexAlignBaseline);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 50);
  HPNodeStyleSetHeight(root_child0, 50);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 50);
  HPNodeStyleSetHeight(root_child1, 20);
  HPNodeInsertChild(root, root_child1, 1);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1));

//  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));
//
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));
//
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child1));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child1));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, align_baseline_child_margin) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetAlignItems(root, FlexAlignBaseline);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetMargin(root_child0, CSSLeft, 5);
  HPNodeStyleSetMargin(root_child0, CSSTop, 5);
  HPNodeStyleSetMargin(root_child0, CSSRight, 5);
  HPNodeStyleSetMargin(root_child0, CSSBottom, 5);
  HPNodeStyleSetWidth(root_child0, 50);
  HPNodeStyleSetHeight(root_child0, 50);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 50);
  HPNodeStyleSetHeight(root_child1, 20);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child1_child0 = HPNodeNew();
  HPNodeStyleSetMargin(root_child1_child0, CSSLeft, 1);
  HPNodeStyleSetMargin(root_child1_child0, CSSTop, 1);
  HPNodeStyleSetMargin(root_child1_child0, CSSRight, 1);
  HPNodeStyleSetMargin(root_child1_child0, CSSBottom, 1);
  HPNodeStyleSetWidth(root_child1_child0, 50);
  HPNodeStyleSetHeight(root_child1_child0, 10);
  HPNodeInsertChild(root_child1, root_child1_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(5, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(5, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(44, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(1, HPNodeLayoutGetLeft(root_child1_child0));
  ASSERT_FLOAT_EQ(1, HPNodeLayoutGetTop(root_child1_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1_child0));
//
//  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));
//
//  ASSERT_FLOAT_EQ(45, HPNodeLayoutGetLeft(root_child0));
//  ASSERT_FLOAT_EQ(5, HPNodeLayoutGetTop(root_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));
//
//  ASSERT_FLOAT_EQ(-10, HPNodeLayoutGetLeft(root_child1));
//  ASSERT_FLOAT_EQ(44, HPNodeLayoutGetTop(root_child1));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1));
//
//  ASSERT_FLOAT_EQ(-1, HPNodeLayoutGetLeft(root_child1_child0));
//  ASSERT_FLOAT_EQ(1, HPNodeLayoutGetTop(root_child1_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1_child0));
//  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1_child0));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, align_baseline_child_padding) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetAlignItems(root, FlexAlignBaseline);
  HPNodeStyleSetPadding(root, CSSLeft, 5);
  HPNodeStyleSetPadding(root, CSSTop, 5);
  HPNodeStyleSetPadding(root, CSSRight, 5);
  HPNodeStyleSetPadding(root, CSSBottom, 5);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 50);
  HPNodeStyleSetHeight(root_child0, 50);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetPadding(root_child1, CSSLeft, 5);
  HPNodeStyleSetPadding(root_child1, CSSTop, 5);
  HPNodeStyleSetPadding(root_child1, CSSRight, 5);
  HPNodeStyleSetPadding(root_child1, CSSBottom, 5);
  HPNodeStyleSetWidth(root_child1, 50);
  HPNodeStyleSetHeight(root_child1, 20);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child1_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1_child0, 50);
  HPNodeStyleSetHeight(root_child1_child0, 10);
  HPNodeInsertChild(root_child1, root_child1_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(5, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(5, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(55, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(5, HPNodeLayoutGetLeft(root_child1_child0));
  ASSERT_FLOAT_EQ(5, HPNodeLayoutGetTop(root_child1_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1_child0));

//  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));
//
//  ASSERT_FLOAT_EQ(45, HPNodeLayoutGetLeft(root_child0));
//  ASSERT_FLOAT_EQ(5, HPNodeLayoutGetTop(root_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));
//
//  ASSERT_FLOAT_EQ(-5, HPNodeLayoutGetLeft(root_child1));
//  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetTop(root_child1));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1));
//
//  ASSERT_FLOAT_EQ(-5, HPNodeLayoutGetLeft(root_child1_child0));
//  ASSERT_FLOAT_EQ(5, HPNodeLayoutGetTop(root_child1_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1_child0));
//  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1_child0));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, align_baseline_multiline) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetAlignItems(root, FlexAlignBaseline);
  HPNodeStyleSetFlexWrap(root, FlexWrap);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 50);
  HPNodeStyleSetHeight(root_child0, 50);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 50);
  HPNodeStyleSetHeight(root_child1, 20);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child1_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1_child0, 50);
  HPNodeStyleSetHeight(root_child1_child0, 10);
  HPNodeInsertChild(root_child1, root_child1_child0, 0);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetWidth(root_child2, 50);
  HPNodeStyleSetHeight(root_child2, 20);
  HPNodeInsertChild(root, root_child2, 2);

  const HPNodeRef root_child2_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child2_child0, 50);
  HPNodeStyleSetHeight(root_child2_child0, 10);
  HPNodeInsertChild(root_child2, root_child2_child0, 0);

  const HPNodeRef root_child3 = HPNodeNew();
  HPNodeStyleSetWidth(root_child3, 50);
  HPNodeStyleSetHeight(root_child3, 50);
  HPNodeInsertChild(root, root_child3, 3);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child2_child0));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child3));

//  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));
//
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
//  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetTop(root_child1));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1_child0));
//  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1_child0));
//
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child2));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetTop(root_child2));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child2));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2_child0));
//  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child2_child0));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child3));
//  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetTop(root_child3));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child3));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child3));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, align_baseline_multiline_column) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetAlignItems(root, FlexAlignBaseline);
  HPNodeStyleSetFlexWrap(root, FlexWrap);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 50);
  HPNodeStyleSetHeight(root_child0, 50);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 30);
  HPNodeStyleSetHeight(root_child1, 50);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child1_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1_child0, 20);
  HPNodeStyleSetHeight(root_child1_child0, 20);
  HPNodeInsertChild(root_child1, root_child1_child0, 0);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetWidth(root_child2, 40);
  HPNodeStyleSetHeight(root_child2, 70);
  HPNodeInsertChild(root, root_child2, 2);

  const HPNodeRef root_child2_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child2_child0, 10);
  HPNodeStyleSetHeight(root_child2_child0, 10);
  HPNodeInsertChild(root_child2, root_child2_child0, 0);

  const HPNodeRef root_child3 = HPNodeNew();
  HPNodeStyleSetWidth(root_child3, 50);
  HPNodeStyleSetHeight(root_child3, 20);
  HPNodeInsertChild(root, root_child3, 3);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetWidth(root_child1_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1_child0));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(70, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child2_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child2_child0));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(70, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child3));

//  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));
//
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));
//
//  ASSERT_FLOAT_EQ(70, HPNodeLayoutGetLeft(root_child1));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child1));
//  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child1));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child1));
//
//  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetLeft(root_child1_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1_child0));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetWidth(root_child1_child0));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1_child0));
//
//  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetLeft(root_child2));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
//  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetWidth(root_child2));
//  ASSERT_FLOAT_EQ(70, HPNodeLayoutGetHeight(root_child2));
//
//  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetLeft(root_child2_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2_child0));
//  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child2_child0));
//  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child2_child0));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child3));
//  ASSERT_FLOAT_EQ(70, HPNodeLayoutGetTop(root_child3));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child3));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child3));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, align_baseline_multiline_column2) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetAlignItems(root, FlexAlignBaseline);
  HPNodeStyleSetFlexWrap(root, FlexWrap);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 50);
  HPNodeStyleSetHeight(root_child0, 50);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 30);
  HPNodeStyleSetHeight(root_child1, 50);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child1_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1_child0, 20);
  HPNodeStyleSetHeight(root_child1_child0, 20);
  HPNodeInsertChild(root_child1, root_child1_child0, 0);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetWidth(root_child2, 40);
  HPNodeStyleSetHeight(root_child2, 70);
  HPNodeInsertChild(root, root_child2, 2);

  const HPNodeRef root_child2_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child2_child0, 10);
  HPNodeStyleSetHeight(root_child2_child0, 10);
  HPNodeInsertChild(root_child2, root_child2_child0, 0);

  const HPNodeRef root_child3 = HPNodeNew();
  HPNodeStyleSetWidth(root_child3, 50);
  HPNodeStyleSetHeight(root_child3, 20);
  HPNodeInsertChild(root, root_child3, 3);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetWidth(root_child1_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1_child0));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(70, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child2_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child2_child0));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(70, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child3));

//  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));
//
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));
//
//  ASSERT_FLOAT_EQ(70, HPNodeLayoutGetLeft(root_child1));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child1));
//  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root_child1));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child1));
//
//  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetLeft(root_child1_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1_child0));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetWidth(root_child1_child0));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1_child0));
//
//  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetLeft(root_child2));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
//  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetWidth(root_child2));
//  ASSERT_FLOAT_EQ(70, HPNodeLayoutGetHeight(root_child2));
//
//  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetLeft(root_child2_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2_child0));
//  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child2_child0));
//  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child2_child0));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child3));
//  ASSERT_FLOAT_EQ(70, HPNodeLayoutGetTop(root_child3));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child3));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child3));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, align_baseline_multiline_row_and_column) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetAlignItems(root, FlexAlignBaseline);
  HPNodeStyleSetFlexWrap(root, FlexWrap);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 50);
  HPNodeStyleSetHeight(root_child0, 50);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 50);
  HPNodeStyleSetHeight(root_child1, 50);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child1_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1_child0, 50);
  HPNodeStyleSetHeight(root_child1_child0, 10);
  HPNodeInsertChild(root_child1, root_child1_child0, 0);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetWidth(root_child2, 50);
  HPNodeStyleSetHeight(root_child2, 20);
  HPNodeInsertChild(root, root_child2, 2);

  const HPNodeRef root_child2_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child2_child0, 50);
  HPNodeStyleSetHeight(root_child2_child0, 10);
  HPNodeInsertChild(root_child2, root_child2_child0, 0);

  const HPNodeRef root_child3 = HPNodeNew();
  HPNodeStyleSetWidth(root_child3, 50);
  HPNodeStyleSetHeight(root_child3, 20);
  HPNodeInsertChild(root, root_child3, 3);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child2_child0));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(90, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child3));

//  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));
//
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
//  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetTop(root_child1));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child1));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1_child0));
//  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1_child0));
//
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child2));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetTop(root_child2));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child2));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2_child0));
//  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child2_child0));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child3));
//  ASSERT_FLOAT_EQ(90, HPNodeLayoutGetTop(root_child3));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child3));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child3));

  HPNodeFreeRecursive(root);

}*/

TEST(HippyTest, align_items_center_child_with_margin_bigger_than_parent) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetJustifyContent(root, FlexAlignCenter);
  HPNodeStyleSetAlignItems(root, FlexAlignCenter);
  HPNodeStyleSetWidth(root, 52);
  HPNodeStyleSetHeight(root, 52);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetAlignItems(root_child0, FlexAlignCenter);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child0_child0 = HPNodeNew();
  HPNodeStyleSetMargin(root_child0_child0, CSSLeft, 10);
  HPNodeStyleSetMargin(root_child0_child0, CSSRight, 10);
  HPNodeStyleSetWidth(root_child0_child0, 52);
  HPNodeStyleSetHeight(root_child0_child0, 52);
  HPNodeInsertChild(root_child0, root_child0_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(52, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(52, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(-10, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(72, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(52, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetLeft(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
  ASSERT_FLOAT_EQ(52, HPNodeLayoutGetWidth(root_child0_child0));
  ASSERT_FLOAT_EQ(52, HPNodeLayoutGetHeight(root_child0_child0));

//  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
//  ASSERT_FLOAT_EQ(52, HPNodeLayoutGetWidth(root));
//  ASSERT_FLOAT_EQ(52, HPNodeLayoutGetHeight(root));
//
//  ASSERT_FLOAT_EQ(-10, HPNodeLayoutGetLeft(root_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
//  ASSERT_FLOAT_EQ(72, HPNodeLayoutGetWidth(root_child0));
//  ASSERT_FLOAT_EQ(52, HPNodeLayoutGetHeight(root_child0));
//
//  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetLeft(root_child0_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
//  ASSERT_FLOAT_EQ(52, HPNodeLayoutGetWidth(root_child0_child0));
//  ASSERT_FLOAT_EQ(52, HPNodeLayoutGetHeight(root_child0_child0));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, align_items_flex_end_child_with_margin_bigger_than_parent) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetJustifyContent(root, FlexAlignCenter);
  HPNodeStyleSetAlignItems(root, FlexAlignCenter);
  HPNodeStyleSetWidth(root, 52);
  HPNodeStyleSetHeight(root, 52);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetAlignItems(root_child0, FlexAlignEnd);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child0_child0 = HPNodeNew();
  HPNodeStyleSetMargin(root_child0_child0, CSSLeft, 10);
  HPNodeStyleSetMargin(root_child0_child0, CSSRight, 10);
  HPNodeStyleSetWidth(root_child0_child0, 52);
  HPNodeStyleSetHeight(root_child0_child0, 52);
  HPNodeInsertChild(root_child0, root_child0_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(52, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(52, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(-10, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(72, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(52, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetLeft(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
  ASSERT_FLOAT_EQ(52, HPNodeLayoutGetWidth(root_child0_child0));
  ASSERT_FLOAT_EQ(52, HPNodeLayoutGetHeight(root_child0_child0));

//  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
//  ASSERT_FLOAT_EQ(52, HPNodeLayoutGetWidth(root));
//  ASSERT_FLOAT_EQ(52, HPNodeLayoutGetHeight(root));
//
//  ASSERT_FLOAT_EQ(-10, HPNodeLayoutGetLeft(root_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
//  ASSERT_FLOAT_EQ(72, HPNodeLayoutGetWidth(root_child0));
//  ASSERT_FLOAT_EQ(52, HPNodeLayoutGetHeight(root_child0));
//
//  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetLeft(root_child0_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
//  ASSERT_FLOAT_EQ(52, HPNodeLayoutGetWidth(root_child0_child0));
//  ASSERT_FLOAT_EQ(52, HPNodeLayoutGetHeight(root_child0_child0));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, align_items_center_child_without_margin_bigger_than_parent) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetJustifyContent(root, FlexAlignCenter);
  HPNodeStyleSetAlignItems(root, FlexAlignCenter);
  HPNodeStyleSetWidth(root, 52);
  HPNodeStyleSetHeight(root, 52);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetAlignItems(root_child0, FlexAlignCenter);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child0_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0_child0, 72);
  HPNodeStyleSetHeight(root_child0_child0, 72);
  HPNodeInsertChild(root_child0, root_child0_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(52, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(52, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(-10, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(-10, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(72, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(72, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
  ASSERT_FLOAT_EQ(72, HPNodeLayoutGetWidth(root_child0_child0));
  ASSERT_FLOAT_EQ(72, HPNodeLayoutGetHeight(root_child0_child0));

//  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
//  ASSERT_FLOAT_EQ(52, HPNodeLayoutGetWidth(root));
//  ASSERT_FLOAT_EQ(52, HPNodeLayoutGetHeight(root));
//
//  ASSERT_FLOAT_EQ(-10, HPNodeLayoutGetLeft(root_child0));
//  ASSERT_FLOAT_EQ(-10, HPNodeLayoutGetTop(root_child0));
//  ASSERT_FLOAT_EQ(72, HPNodeLayoutGetWidth(root_child0));
//  ASSERT_FLOAT_EQ(72, HPNodeLayoutGetHeight(root_child0));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
//  ASSERT_FLOAT_EQ(72, HPNodeLayoutGetWidth(root_child0_child0));
//  ASSERT_FLOAT_EQ(72, HPNodeLayoutGetHeight(root_child0_child0));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, align_items_flex_end_child_without_margin_bigger_than_parent) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetJustifyContent(root, FlexAlignCenter);
  HPNodeStyleSetAlignItems(root, FlexAlignCenter);
  HPNodeStyleSetWidth(root, 52);
  HPNodeStyleSetHeight(root, 52);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetAlignItems(root_child0, FlexAlignEnd);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child0_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0_child0, 72);
  HPNodeStyleSetHeight(root_child0_child0, 72);
  HPNodeInsertChild(root_child0, root_child0_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(52, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(52, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(-10, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(-10, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(72, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(72, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
  ASSERT_FLOAT_EQ(72, HPNodeLayoutGetWidth(root_child0_child0));
  ASSERT_FLOAT_EQ(72, HPNodeLayoutGetHeight(root_child0_child0));

//  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
//  ASSERT_FLOAT_EQ(52, HPNodeLayoutGetWidth(root));
//  ASSERT_FLOAT_EQ(52, HPNodeLayoutGetHeight(root));
//
//  ASSERT_FLOAT_EQ(-10, HPNodeLayoutGetLeft(root_child0));
//  ASSERT_FLOAT_EQ(-10, HPNodeLayoutGetTop(root_child0));
//  ASSERT_FLOAT_EQ(72, HPNodeLayoutGetWidth(root_child0));
//  ASSERT_FLOAT_EQ(72, HPNodeLayoutGetHeight(root_child0));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
//  ASSERT_FLOAT_EQ(72, HPNodeLayoutGetWidth(root_child0_child0));
//  ASSERT_FLOAT_EQ(72, HPNodeLayoutGetHeight(root_child0_child0));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, align_center_should_size_based_on_content) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetAlignItems(root, FlexAlignCenter);
  HPNodeStyleSetMargin(root, CSSTop, 20);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetJustifyContent(root_child0, FlexAlignCenter);
  HPNodeStyleSetFlexShrink(root_child0, 1);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child0_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0_child0, 1);
  HPNodeStyleSetFlexShrink(root_child0_child0, 1);
  HPNodeInsertChild(root_child0, root_child0_child0, 0);

  const HPNodeRef root_child0_child0_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0_child0_child0, 20);
  HPNodeStyleSetHeight(root_child0_child0_child0, 20);
  HPNodeInsertChild(root_child0_child0, root_child0_child0_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetWidth(root_child0_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child0_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetWidth(root_child0_child0_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child0_child0_child0));

//  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));
//
//  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetLeft(root_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetWidth(root_child0));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child0));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetWidth(root_child0_child0));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child0_child0));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0_child0));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetWidth(root_child0_child0_child0));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child0_child0_child0));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, align_strech_should_size_based_on_parent) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetMargin(root, CSSTop, 20);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetJustifyContent(root_child0, FlexAlignCenter);
  HPNodeStyleSetFlexShrink(root_child0, 1);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child0_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0_child0, 1);
  HPNodeStyleSetFlexShrink(root_child0_child0, 1);
  HPNodeInsertChild(root_child0, root_child0_child0, 0);

  const HPNodeRef root_child0_child0_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0_child0_child0, 20);
  HPNodeStyleSetHeight(root_child0_child0_child0, 20);
  HPNodeInsertChild(root_child0_child0, root_child0_child0_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child0_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetWidth(root_child0_child0_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child0_child0_child0));

//  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child0));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0_child0));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child0_child0));
//
//  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetLeft(root_child0_child0_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0_child0));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetWidth(root_child0_child0_child0));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child0_child0_child0));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, align_flex_start_with_shrinking_children) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetWidth(root, 500);
  HPNodeStyleSetHeight(root, 500);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetAlignItems(root_child0, FlexAlignStart);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child0_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0_child0, 1);
  HPNodeStyleSetFlexShrink(root_child0_child0, 1);
  HPNodeInsertChild(root_child0, root_child0_child0, 0);

  const HPNodeRef root_child0_child0_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0_child0_child0, 1);
  HPNodeStyleSetFlexShrink(root_child0_child0_child0, 1);
  HPNodeInsertChild(root_child0_child0, root_child0_child0_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(500, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(500, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(500, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child0_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child0_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child0_child0_child0));

//  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
//  ASSERT_FLOAT_EQ(500, HPNodeLayoutGetWidth(root));
//  ASSERT_FLOAT_EQ(500, HPNodeLayoutGetHeight(root));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
//  ASSERT_FLOAT_EQ(500, HPNodeLayoutGetWidth(root_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child0));
//
//  ASSERT_FLOAT_EQ(500, HPNodeLayoutGetLeft(root_child0_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child0_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child0_child0));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child0_child0_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child0_child0_child0));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, align_flex_start_with_stretching_children) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetWidth(root, 500);
  HPNodeStyleSetHeight(root, 500);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child0_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0_child0, 1);
  HPNodeStyleSetFlexShrink(root_child0_child0, 1);
  HPNodeInsertChild(root_child0, root_child0_child0, 0);

  const HPNodeRef root_child0_child0_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0_child0_child0, 1);
  HPNodeStyleSetFlexShrink(root_child0_child0_child0, 1);
  HPNodeInsertChild(root_child0_child0, root_child0_child0_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(500, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(500, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(500, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
  ASSERT_FLOAT_EQ(500, HPNodeLayoutGetWidth(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child0_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0_child0));
  ASSERT_FLOAT_EQ(500, HPNodeLayoutGetWidth(root_child0_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child0_child0_child0));

//  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
//  ASSERT_FLOAT_EQ(500, HPNodeLayoutGetWidth(root));
//  ASSERT_FLOAT_EQ(500, HPNodeLayoutGetHeight(root));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
//  ASSERT_FLOAT_EQ(500, HPNodeLayoutGetWidth(root_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child0));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
//  ASSERT_FLOAT_EQ(500, HPNodeLayoutGetWidth(root_child0_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child0_child0));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0_child0));
//  ASSERT_FLOAT_EQ(500, HPNodeLayoutGetWidth(root_child0_child0_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child0_child0_child0));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, align_flex_start_with_shrinking_children_with_stretch) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetWidth(root, 500);
  HPNodeStyleSetHeight(root, 500);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetAlignItems(root_child0, FlexAlignStart);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child0_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0_child0, 1);
  HPNodeStyleSetFlexShrink(root_child0_child0, 1);
  HPNodeInsertChild(root_child0, root_child0_child0, 0);

  const HPNodeRef root_child0_child0_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0_child0_child0, 1);
  HPNodeStyleSetFlexShrink(root_child0_child0_child0, 1);
  HPNodeInsertChild(root_child0_child0, root_child0_child0_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(500, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(500, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(500, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child0_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child0_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child0_child0_child0));

//  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
//  ASSERT_FLOAT_EQ(500, HPNodeLayoutGetWidth(root));
//  ASSERT_FLOAT_EQ(500, HPNodeLayoutGetHeight(root));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
//  ASSERT_FLOAT_EQ(500, HPNodeLayoutGetWidth(root_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child0));
//
//  ASSERT_FLOAT_EQ(500, HPNodeLayoutGetLeft(root_child0_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child0_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child0_child0));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child0_child0_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child0_child0_child0));

  HPNodeFreeRecursive(root);

}
