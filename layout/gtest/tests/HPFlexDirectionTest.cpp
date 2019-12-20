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

TEST(HippyTest, flex_direction_column_no_height) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetWidth(root, 100);

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
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child2));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child2));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, flex_direction_row_no_width) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetHeight(root, 100);

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
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child2));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child2));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, flex_direction_column) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

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
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child2));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child2));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, flex_direction_row) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

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
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child2));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(90, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(70, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child2));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, flex_direction_column_reverse) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionColumnReverse);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

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
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(90, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(70, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child2));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(90, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(70, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child2));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, flex_direction_row_reverse) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRowReverse);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

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
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(90, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(70, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child2));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child2));

  HPNodeFreeRecursive(root);

}
