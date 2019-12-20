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

TEST(HippyTest, align_self_center) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetAlignSelf(root_child0, FlexAlignCenter);
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

TEST(HippyTest, align_self_flex_end) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetAlignSelf(root_child0, FlexAlignEnd);
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

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, align_self_flex_start) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetAlignSelf(root_child0, FlexAlignStart);
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

TEST(HippyTest, align_self_flex_end_override_flex_start) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetAlignItems(root, FlexAlignStart);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetAlignSelf(root_child0, FlexAlignEnd);
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

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  HPNodeFreeRecursive(root);

}

//base line not support. TODO:: 2018.01.13.ianwang.
/*
TEST(HippyTest, align_self_baseline) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetAlignSelf(root_child0, FlexAlignBaseline);
  HPNodeStyleSetWidth(root_child0, 50);
  HPNodeStyleSetHeight(root_child0, 50);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetAlignSelf(root_child1, FlexAlignBaseline);
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

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1_child0));

  HPNodeFreeRecursive(root);

}*/
