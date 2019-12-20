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

TEST(HippyTest, justify_content_row_flex_start) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetWidth(root, 102);
  HPNodeStyleSetHeight(root, 102);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 10);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 10);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetWidth(root_child2, 10);
  HPNodeInsertChild(root, root_child2, 2);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root_child2));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(92, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(82, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(72, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root_child2));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, justify_content_row_flex_end) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetJustifyContent(root, FlexAlignEnd);
  HPNodeStyleSetWidth(root, 102);
  HPNodeStyleSetHeight(root, 102);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 10);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 10);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetWidth(root_child2, 10);
  HPNodeInsertChild(root, root_child2, 2);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(72, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(82, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(92, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root_child2));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root_child2));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, justify_content_row_center) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetJustifyContent(root, FlexAlignCenter);
  HPNodeStyleSetWidth(root, 102);
  HPNodeStyleSetHeight(root, 102);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 10);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 10);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetWidth(root_child2, 10);
  HPNodeInsertChild(root, root_child2, 2);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(36, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(46, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(56, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root_child2));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(56, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(46, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(36, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root_child2));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, justify_content_row_space_between) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetJustifyContent(root, FlexAlignSpaceBetween);
  HPNodeStyleSetWidth(root, 102);
  HPNodeStyleSetHeight(root, 102);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 10);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 10);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetWidth(root_child2, 10);
  HPNodeInsertChild(root, root_child2, 2);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(46, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(92, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root_child2));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(92, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(46, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root_child2));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, justify_content_row_space_around) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetJustifyContent(root, FlexAlignSpaceAround);
  HPNodeStyleSetWidth(root, 102);
  HPNodeStyleSetHeight(root, 102);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 10);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 10);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetWidth(root_child2, 10);
  HPNodeInsertChild(root, root_child2, 2);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(12, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(46, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root_child2));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(46, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(12, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root_child2));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, justify_content_column_flex_start) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetWidth(root, 102);
  HPNodeStyleSetHeight(root, 102);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetHeight(root_child0, 10);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetHeight(root_child1, 10);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetHeight(root_child2, 10);
  HPNodeInsertChild(root, root_child2, 2);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child2));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child2));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, justify_content_column_flex_end) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetJustifyContent(root, FlexAlignEnd);
  HPNodeStyleSetWidth(root, 102);
  HPNodeStyleSetHeight(root, 102);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetHeight(root_child0, 10);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetHeight(root_child1, 10);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetHeight(root_child2, 10);
  HPNodeInsertChild(root, root_child2, 2);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(72, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(82, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(92, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child2));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(72, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(82, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(92, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child2));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, justify_content_column_center) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetJustifyContent(root, FlexAlignCenter);
  HPNodeStyleSetWidth(root, 102);
  HPNodeStyleSetHeight(root, 102);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetHeight(root_child0, 10);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetHeight(root_child1, 10);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetHeight(root_child2, 10);
  HPNodeInsertChild(root, root_child2, 2);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(36, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(46, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(56, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child2));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(36, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(46, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(56, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child2));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, justify_content_column_space_between) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetJustifyContent(root, FlexAlignSpaceBetween);
  HPNodeStyleSetWidth(root, 102);
  HPNodeStyleSetHeight(root, 102);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetHeight(root_child0, 10);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetHeight(root_child1, 10);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetHeight(root_child2, 10);
  HPNodeInsertChild(root, root_child2, 2);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(46, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(92, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child2));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(46, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(92, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child2));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, justify_content_column_space_around) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetJustifyContent(root, FlexAlignSpaceAround);
  HPNodeStyleSetWidth(root, 102);
  HPNodeStyleSetHeight(root, 102);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetHeight(root_child0, 10);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetHeight(root_child1, 10);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetHeight(root_child2, 10);
  HPNodeInsertChild(root, root_child2, 2);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(12, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(46, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child2));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(12, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(46, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child2));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, justify_content_row_min_width_and_margin) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetJustifyContent(root, FlexAlignCenter);
  HPNodeStyleSetMargin(root, CSSLeft, 100);
  HPNodeStyleSetMinWidth(root, 50);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 20);
  HPNodeStyleSetHeight(root_child0, 20);
  HPNodeInsertChild(root, root_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(15, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child0));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(15, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child0));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, justify_content_row_max_width_and_margin) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetJustifyContent(root, FlexAlignCenter);
  HPNodeStyleSetMargin(root, CSSLeft, 100);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetMaxWidth(root, 80);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 20);
  HPNodeStyleSetHeight(root_child0, 20);
  HPNodeInsertChild(root, root_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child0));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child0));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, justify_content_column_min_height_and_margin) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetJustifyContent(root, FlexAlignCenter);
  HPNodeStyleSetMargin(root, CSSTop, 100);
  HPNodeStyleSetMinHeight(root, 50);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 20);
  HPNodeStyleSetHeight(root_child0, 20);
  HPNodeInsertChild(root, root_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(15, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child0));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(15, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child0));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, justify_content_colunn_max_height_and_margin) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetJustifyContent(root, FlexAlignCenter);
  HPNodeStyleSetMargin(root, CSSTop, 100);
  HPNodeStyleSetHeight(root, 100);
  HPNodeStyleSetMaxHeight(root, 80);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 20);
  HPNodeStyleSetHeight(root_child0, 20);
  HPNodeInsertChild(root, root_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child0));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child0));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, justify_content_column_space_evenly) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetJustifyContent(root, FlexAlignSpaceEvenly);
  HPNodeStyleSetWidth(root, 102);
  HPNodeStyleSetHeight(root, 102);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetHeight(root_child0, 10);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetHeight(root_child1, 10);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetHeight(root_child2, 10);
  HPNodeInsertChild(root, root_child2, 2);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(18, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(46, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(74, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child2));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(18, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(46, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(74, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child2));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, justify_content_row_space_evenly) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetJustifyContent(root, FlexAlignSpaceEvenly);
  HPNodeStyleSetWidth(root, 102);
  HPNodeStyleSetHeight(root, 102);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetHeight(root_child0, 10);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetHeight(root_child1, 10);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetHeight(root_child2, 10);
  HPNodeInsertChild(root, root_child2, 2);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(26, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(51, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(77, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child2));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(102, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(77, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(51, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(26, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child2));

  HPNodeFreeRecursive(root);

}
