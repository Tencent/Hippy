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

TEST(HippyTest, align_content_flex_start) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetFlexWrap(root, FlexWrap);
  HPNodeStyleSetWidth(root, 130);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 50);
  HPNodeStyleSetHeight(root_child0, 10);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 50);
  HPNodeStyleSetHeight(root_child1, 10);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetWidth(root_child2, 50);
  HPNodeStyleSetHeight(root_child2, 10);
  HPNodeInsertChild(root, root_child2, 2);

  const HPNodeRef root_child3 = HPNodeNew();
  HPNodeStyleSetWidth(root_child3, 50);
  HPNodeStyleSetHeight(root_child3, 10);
  HPNodeInsertChild(root, root_child3, 3);

  const HPNodeRef root_child4 = HPNodeNew();
  HPNodeStyleSetWidth(root_child4, 50);
  HPNodeStyleSetHeight(root_child4, 10);
  HPNodeInsertChild(root, root_child4, 4);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(130, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child3));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child4));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child4));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child4));

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, align_content_flex_start_without_height_on_children) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexWrap(root, FlexWrap);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 50);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 50);
  HPNodeStyleSetHeight(root_child1, 10);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetWidth(root_child2, 50);
  HPNodeInsertChild(root, root_child2, 2);

  const HPNodeRef root_child3 = HPNodeNew();
  HPNodeStyleSetWidth(root_child3, 50);
  HPNodeStyleSetHeight(root_child3, 10);
  HPNodeInsertChild(root, root_child3, 3);

  const HPNodeRef root_child4 = HPNodeNew();
  HPNodeStyleSetWidth(root_child4, 50);
  HPNodeInsertChild(root, root_child4, 4);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child3));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child4));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child4));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child4));

  HPNodeFreeRecursive(root);
}
//
// TEST(HippyTest, align_content_flex_start_with_flex) {
//
//
//  const HPNodeRef root = HPNodeNew();
//  HPNodeStyleSetFlexWrap(root, FlexWrap);
//  HPNodeStyleSetWidth(root, 100);
//  HPNodeStyleSetHeight(root, 120);
//
//  const HPNodeRef root_child0 = HPNodeNew();
//  HPNodeStyleSetFlexGrow(root_child0, 1);
//  HPNodeStyleSetFlexBasisPercent(root_child0, 0);
//  HPNodeStyleSetWidth(root_child0, 50);
//  HPNodeInsertChild(root, root_child0, 0);
//
//  const HPNodeRef root_child1 = HPNodeNew();
//  HPNodeStyleSetFlexGrow(root_child1, 1);
//  HPNodeStyleSetFlexBasisPercent(root_child1, 0);
//  HPNodeStyleSetWidth(root_child1, 50);
//  HPNodeStyleSetHeight(root_child1, 10);
//  HPNodeInsertChild(root, root_child1, 1);
//
//  const HPNodeRef root_child2 = HPNodeNew();
//  HPNodeStyleSetWidth(root_child2, 50);
//  HPNodeInsertChild(root, root_child2, 2);
//
//  const HPNodeRef root_child3 = HPNodeNew();
//  HPNodeStyleSetFlexGrow(root_child3, 1);
//  HPNodeStyleSetFlexShrink(root_child3, 1);
//  HPNodeStyleSetFlexBasisPercent(root_child3, 0);
//  HPNodeStyleSetWidth(root_child3, 50);
//  HPNodeInsertChild(root, root_child3, 3);
//
//  const HPNodeRef root_child4 = HPNodeNew();
//  HPNodeStyleSetWidth(root_child4, 50);
//  HPNodeInsertChild(root, root_child4, 4);
//   HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
//  ASSERT_FLOAT_EQ(120, HPNodeLayoutGetHeight(root));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
//  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child0));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
//  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetTop(root_child1));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
//  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child1));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
//  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetTop(root_child2));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child2));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child3));
//  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetTop(root_child3));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child3));
//  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child3));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child4));
//  ASSERT_FLOAT_EQ(120, HPNodeLayoutGetTop(root_child4));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child4));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child4));
//
//  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
//  ASSERT_FLOAT_EQ(120, HPNodeLayoutGetHeight(root));
//
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
//  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child0));
//
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child1));
//  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetTop(root_child1));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
//  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child1));
//
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child2));
//  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetTop(root_child2));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child2));
//
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child3));
//  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetTop(root_child3));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child3));
//  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child3));
//
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child4));
//  ASSERT_FLOAT_EQ(120, HPNodeLayoutGetTop(root_child4));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child4));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child4));
//
//  HPNodeFreeRecursive(root);
//
//
//}

TEST(HippyTest, align_content_flex_end) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetAlignContent(root, FlexAlignEnd);
  HPNodeStyleSetFlexWrap(root, FlexWrap);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 50);
  HPNodeStyleSetHeight(root_child0, 10);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 50);
  HPNodeStyleSetHeight(root_child1, 10);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetWidth(root_child2, 50);
  HPNodeStyleSetHeight(root_child2, 10);
  HPNodeInsertChild(root, root_child2, 2);

  const HPNodeRef root_child3 = HPNodeNew();
  HPNodeStyleSetWidth(root_child3, 50);
  HPNodeStyleSetHeight(root_child3, 10);
  HPNodeInsertChild(root, root_child3, 3);

  const HPNodeRef root_child4 = HPNodeNew();
  HPNodeStyleSetWidth(root_child4, 50);
  HPNodeStyleSetHeight(root_child4, 10);
  HPNodeInsertChild(root, root_child4, 4);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child3));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child4));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetTop(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child4));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child4));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child3));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child4));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetTop(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child4));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child4));

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, align_content_stretch) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetAlignContent(root, FlexAlignStretch);
  HPNodeStyleSetFlexWrap(root, FlexWrap);
  HPNodeStyleSetWidth(root, 150);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 50);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 50);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetWidth(root_child2, 50);
  HPNodeInsertChild(root, root_child2, 2);

  const HPNodeRef root_child3 = HPNodeNew();
  HPNodeStyleSetWidth(root_child3, 50);
  HPNodeInsertChild(root, root_child3, 3);

  const HPNodeRef root_child4 = HPNodeNew();
  HPNodeStyleSetWidth(root_child4, 50);
  HPNodeInsertChild(root, root_child4, 4);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(150, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child3));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child4));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child4));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child4));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(150, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child3));

  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root_child4));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child4));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child4));

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, align_content_spacebetween) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetAlignContent(root, FlexAlignSpaceBetween);
  HPNodeStyleSetFlexWrap(root, FlexWrap);
  HPNodeStyleSetWidth(root, 130);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 50);
  HPNodeStyleSetHeight(root_child0, 10);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 50);
  HPNodeStyleSetHeight(root_child1, 10);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetWidth(root_child2, 50);
  HPNodeStyleSetHeight(root_child2, 10);
  HPNodeInsertChild(root, root_child2, 2);

  const HPNodeRef root_child3 = HPNodeNew();
  HPNodeStyleSetWidth(root_child3, 50);
  HPNodeStyleSetHeight(root_child3, 10);
  HPNodeInsertChild(root, root_child3, 3);

  const HPNodeRef root_child4 = HPNodeNew();
  HPNodeStyleSetWidth(root_child4, 50);
  HPNodeStyleSetHeight(root_child4, 10);
  HPNodeInsertChild(root, root_child4, 4);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(130, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(45, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(45, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child3));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child4));
  ASSERT_FLOAT_EQ(90, HPNodeLayoutGetTop(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child4));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child4));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(130, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(45, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(45, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child3));

  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetLeft(root_child4));
  ASSERT_FLOAT_EQ(90, HPNodeLayoutGetTop(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child4));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child4));

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, align_content_spacearound) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetAlignContent(root, FlexAlignSpaceAround);
  HPNodeStyleSetFlexWrap(root, FlexWrap);
  HPNodeStyleSetWidth(root, 140);
  HPNodeStyleSetHeight(root, 120);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 50);
  HPNodeStyleSetHeight(root_child0, 10);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 50);
  HPNodeStyleSetHeight(root_child1, 10);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetWidth(root_child2, 50);
  HPNodeStyleSetHeight(root_child2, 10);
  HPNodeInsertChild(root, root_child2, 2);

  const HPNodeRef root_child3 = HPNodeNew();
  HPNodeStyleSetWidth(root_child3, 50);
  HPNodeStyleSetHeight(root_child3, 10);
  HPNodeInsertChild(root, root_child3, 3);

  const HPNodeRef root_child4 = HPNodeNew();
  HPNodeStyleSetWidth(root_child4, 50);
  HPNodeStyleSetHeight(root_child4, 10);
  HPNodeInsertChild(root, root_child4, 4);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(140, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(120, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(15, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(15, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(55, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(55, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child3));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child4));
  ASSERT_FLOAT_EQ(95, HPNodeLayoutGetTop(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child4));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child4));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(140, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(120, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(90, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(15, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(15, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(90, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(55, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(55, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child3));

  ASSERT_FLOAT_EQ(90, HPNodeLayoutGetLeft(root_child4));
  ASSERT_FLOAT_EQ(95, HPNodeLayoutGetTop(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child4));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child4));

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, align_content_stretch_row) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetAlignContent(root, FlexAlignStretch);
  HPNodeStyleSetFlexWrap(root, FlexWrap);
  HPNodeStyleSetWidth(root, 150);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 50);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 50);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetWidth(root_child2, 50);
  HPNodeInsertChild(root, root_child2, 2);

  const HPNodeRef root_child3 = HPNodeNew();
  HPNodeStyleSetWidth(root_child3, 50);
  HPNodeInsertChild(root, root_child3, 3);

  const HPNodeRef root_child4 = HPNodeNew();
  HPNodeStyleSetWidth(root_child4, 50);
  HPNodeInsertChild(root, root_child4, 4);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(150, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child3));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child4));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(150, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child3));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child4));

  HPNodeFreeRecursive(root);
}
//
// TEST(HippyTest, align_content_stretch_row_with_children) {
//
//
//  const HPNodeRef root = HPNodeNew();
//  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
//  HPNodeStyleSetAlignContent(root, FlexAlignStretch);
//  HPNodeStyleSetFlexWrap(root, FlexWrap);
//  HPNodeStyleSetWidth(root, 150);
//  HPNodeStyleSetHeight(root, 100);
//
//  const HPNodeRef root_child0 = HPNodeNew();
//  HPNodeStyleSetWidth(root_child0, 50);
//  HPNodeInsertChild(root, root_child0, 0);
//
//  const HPNodeRef root_child0_child0 = HPNodeNew();
//  HPNodeStyleSetFlexGrow(root_child0_child0, 1);
//  HPNodeStyleSetFlexShrink(root_child0_child0, 1);
//  HPNodeStyleSetFlexBasisPercent(root_child0_child0, 0);
//  HPNodeInsertChild(root_child0, root_child0_child0, 0);
//
//  const HPNodeRef root_child1 = HPNodeNew();
//  HPNodeStyleSetWidth(root_child1, 50);
//  HPNodeInsertChild(root, root_child1, 1);
//
//  const HPNodeRef root_child2 = HPNodeNew();
//  HPNodeStyleSetWidth(root_child2, 50);
//  HPNodeInsertChild(root, root_child2, 2);
//
//  const HPNodeRef root_child3 = HPNodeNew();
//  HPNodeStyleSetWidth(root_child3, 50);
//  HPNodeInsertChild(root, root_child3, 3);
//
//  const HPNodeRef root_child4 = HPNodeNew();
//  HPNodeStyleSetWidth(root_child4, 50);
//  HPNodeInsertChild(root, root_child4, 4);
//   HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
//  ASSERT_FLOAT_EQ(150, HPNodeLayoutGetWidth(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0_child0));
//
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child1));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child1));
//
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root_child2));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child2));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child3));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child3));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child3));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child3));
//
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child4));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child4));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child4));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child4));
//
//  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
//  ASSERT_FLOAT_EQ(150, HPNodeLayoutGetWidth(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));
//
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0_child0));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0_child0));
//
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child1));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child1));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child2));
//
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root_child3));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child3));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child3));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child3));
//
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child4));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child4));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child4));
//  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child4));
//
//  HPNodeFreeRecursive(root);
//
//
//}

TEST(HippyTest, align_content_stretch_row_with_flex) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetAlignContent(root, FlexAlignStretch);
  HPNodeStyleSetFlexWrap(root, FlexWrap);
  HPNodeStyleSetWidth(root, 150);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 50);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child1, 1);
  HPNodeStyleSetFlexShrink(root_child1, 1);
  //  HPNodeStyleSetFlexBasisPercent(root_child1, 0);
  HPNodeStyleSetFlexBasis(root_child1, 0);
  HPNodeStyleSetWidth(root_child1, 50);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetWidth(root_child2, 50);
  HPNodeInsertChild(root, root_child2, 2);

  const HPNodeRef root_child3 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child3, 1);
  HPNodeStyleSetFlexShrink(root_child3, 1);
  //  HPNodeStyleSetFlexBasisPercent(root_child3, 0);
  HPNodeStyleSetFlexBasis(root_child3, 0);
  HPNodeStyleSetWidth(root_child3, 50);
  HPNodeInsertChild(root, root_child3, 3);

  const HPNodeRef root_child4 = HPNodeNew();
  HPNodeStyleSetWidth(root_child4, 50);
  HPNodeInsertChild(root, root_child4, 4);
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
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child3));

  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root_child4));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child4));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child4));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(150, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child3));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child4));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child4));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child4));

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, align_content_stretch_row_with_flex_no_shrink) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetAlignContent(root, FlexAlignStretch);
  HPNodeStyleSetFlexWrap(root, FlexWrap);
  HPNodeStyleSetWidth(root, 150);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 50);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child1, 1);
  HPNodeStyleSetFlexShrink(root_child1, 1);
  // HPNodeStyleSetFlexBasisPercent(root_child1, 0);
  HPNodeStyleSetFlexBasis(root_child1, 0);
  HPNodeStyleSetWidth(root_child1, 50);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetWidth(root_child2, 50);
  HPNodeInsertChild(root, root_child2, 2);

  const HPNodeRef root_child3 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child3, 1);
  // HPNodeStyleSetFlexBasisPercent(root_child3, 0);
  HPNodeStyleSetFlexBasis(root_child3, 0);
  HPNodeStyleSetWidth(root_child3, 50);
  HPNodeInsertChild(root, root_child3, 3);

  const HPNodeRef root_child4 = HPNodeNew();
  HPNodeStyleSetWidth(root_child4, 50);
  HPNodeInsertChild(root, root_child4, 4);
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
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child3));

  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root_child4));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child4));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child4));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(150, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child3));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child4));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child4));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child4));

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, align_content_stretch_row_with_margin) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetAlignContent(root, FlexAlignStretch);
  HPNodeStyleSetFlexWrap(root, FlexWrap);
  HPNodeStyleSetWidth(root, 150);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 50);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetMargin(root_child1, CSSLeft, 10);
  HPNodeStyleSetMargin(root_child1, CSSTop, 10);
  HPNodeStyleSetMargin(root_child1, CSSRight, 10);
  HPNodeStyleSetMargin(root_child1, CSSBottom, 10);
  HPNodeStyleSetWidth(root_child1, 50);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetWidth(root_child2, 50);
  HPNodeInsertChild(root, root_child2, 2);

  const HPNodeRef root_child3 = HPNodeNew();
  HPNodeStyleSetMargin(root_child3, CSSLeft, 10);
  HPNodeStyleSetMargin(root_child3, CSSTop, 10);
  HPNodeStyleSetMargin(root_child3, CSSRight, 10);
  HPNodeStyleSetMargin(root_child3, CSSBottom, 10);
  HPNodeStyleSetWidth(root_child3, 50);
  HPNodeInsertChild(root, root_child3, 3);

  const HPNodeRef root_child4 = HPNodeNew();
  HPNodeStyleSetWidth(root_child4, 50);
  HPNodeInsertChild(root, root_child4, 4);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(150, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child3));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child4));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetTop(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child4));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child4));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(150, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child3));

  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root_child4));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetTop(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child4));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child4));

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, align_content_stretch_row_with_padding) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetAlignContent(root, FlexAlignStretch);
  HPNodeStyleSetFlexWrap(root, FlexWrap);
  HPNodeStyleSetWidth(root, 150);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 50);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetPadding(root_child1, CSSLeft, 10);
  HPNodeStyleSetPadding(root_child1, CSSTop, 10);
  HPNodeStyleSetPadding(root_child1, CSSRight, 10);
  HPNodeStyleSetPadding(root_child1, CSSBottom, 10);
  HPNodeStyleSetWidth(root_child1, 50);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetWidth(root_child2, 50);
  HPNodeInsertChild(root, root_child2, 2);

  const HPNodeRef root_child3 = HPNodeNew();
  HPNodeStyleSetPadding(root_child3, CSSLeft, 10);
  HPNodeStyleSetPadding(root_child3, CSSTop, 10);
  HPNodeStyleSetPadding(root_child3, CSSRight, 10);
  HPNodeStyleSetPadding(root_child3, CSSBottom, 10);
  HPNodeStyleSetWidth(root_child3, 50);
  HPNodeInsertChild(root, root_child3, 3);

  const HPNodeRef root_child4 = HPNodeNew();
  HPNodeStyleSetWidth(root_child4, 50);
  HPNodeInsertChild(root, root_child4, 4);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(150, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child3));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child4));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(150, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child3));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child4));

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, align_content_stretch_row_with_single_row) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetAlignContent(root, FlexAlignStretch);
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

TEST(HippyTest, align_content_stretch_row_with_fixed_height) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetAlignContent(root, FlexAlignStretch);
  HPNodeStyleSetFlexWrap(root, FlexWrap);
  HPNodeStyleSetWidth(root, 150);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 50);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 50);
  HPNodeStyleSetHeight(root_child1, 60);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetWidth(root_child2, 50);
  HPNodeInsertChild(root, root_child2, 2);

  const HPNodeRef root_child3 = HPNodeNew();
  HPNodeStyleSetWidth(root_child3, 50);
  HPNodeInsertChild(root, root_child3, 3);

  const HPNodeRef root_child4 = HPNodeNew();
  HPNodeStyleSetWidth(root_child4, 50);
  HPNodeInsertChild(root, root_child4, 4);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(150, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child3));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child4));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetTop(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child4));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child4));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(150, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child3));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child4));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetTop(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child4));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child4));

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, align_content_stretch_row_with_max_height) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetAlignContent(root, FlexAlignStretch);
  HPNodeStyleSetFlexWrap(root, FlexWrap);
  HPNodeStyleSetWidth(root, 150);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 50);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 50);
  HPNodeStyleSetMaxHeight(root_child1, 20);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetWidth(root_child2, 50);
  HPNodeInsertChild(root, root_child2, 2);

  const HPNodeRef root_child3 = HPNodeNew();
  HPNodeStyleSetWidth(root_child3, 50);
  HPNodeInsertChild(root, root_child3, 3);

  const HPNodeRef root_child4 = HPNodeNew();
  HPNodeStyleSetWidth(root_child4, 50);
  HPNodeInsertChild(root, root_child4, 4);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(150, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child3));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child4));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(150, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child3));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child4));

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, align_content_stretch_row_with_min_height) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetAlignContent(root, FlexAlignStretch);
  HPNodeStyleSetFlexWrap(root, FlexWrap);
  HPNodeStyleSetWidth(root, 150);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 50);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 50);
  HPNodeStyleSetMinHeight(root_child1, 80);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetWidth(root_child2, 50);
  HPNodeInsertChild(root, root_child2, 2);

  const HPNodeRef root_child3 = HPNodeNew();
  HPNodeStyleSetWidth(root_child3, 50);
  HPNodeInsertChild(root, root_child3, 3);

  const HPNodeRef root_child4 = HPNodeNew();
  HPNodeStyleSetWidth(root_child4, 50);
  HPNodeInsertChild(root, root_child4, 4);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(150, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(90, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(90, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(90, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(90, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child3));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child4));
  ASSERT_FLOAT_EQ(90, HPNodeLayoutGetTop(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child4));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child4));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(150, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(90, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(90, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(90, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(90, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child3));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child4));
  ASSERT_FLOAT_EQ(90, HPNodeLayoutGetTop(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child4));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child4));

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, align_content_stretch_column) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetAlignContent(root, FlexAlignStretch);
  HPNodeStyleSetFlexWrap(root, FlexWrap);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 150);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetHeight(root_child0, 50);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child0_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0_child0, 1);
  HPNodeStyleSetFlexShrink(root_child0_child0, 1);
  // HPNodeStyleSetFlexBasisPercent(root_child0_child0, 0);
  HPNodeStyleSetFlexBasis(root_child0_child0, 0);
  HPNodeInsertChild(root_child0, root_child0_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child1, 1);
  HPNodeStyleSetFlexShrink(root_child1, 1);
  // HPNodeStyleSetFlexBasisPercent(root_child1, 0);
  HPNodeStyleSetFlexBasis(root_child1, 0);
  HPNodeStyleSetHeight(root_child1, 50);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetHeight(root_child2, 50);
  HPNodeInsertChild(root, root_child2, 2);

  const HPNodeRef root_child3 = HPNodeNew();
  HPNodeStyleSetHeight(root_child3, 50);
  HPNodeInsertChild(root, root_child3, 3);

  const HPNodeRef root_child4 = HPNodeNew();
  HPNodeStyleSetHeight(root_child4, 50);
  HPNodeInsertChild(root, root_child4, 4);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(150, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child3));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child4));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child4));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(150, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0_child0));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child3));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child4));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child4));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child4));

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, align_content_stretch_is_not_overriding_align_items) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetAlignContent(root, FlexAlignStretch);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexDirection(root_child0, FLexDirectionRow);
  HPNodeStyleSetAlignContent(root_child0, FlexAlignStretch);
  HPNodeStyleSetAlignItems(root_child0, FlexAlignCenter);
  HPNodeStyleSetWidth(root_child0, 100);
  HPNodeStyleSetHeight(root_child0, 100);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child0_child0 = HPNodeNew();
  HPNodeStyleSetAlignContent(root_child0_child0, FlexAlignStretch);
  HPNodeStyleSetWidth(root_child0_child0, 10);
  HPNodeStyleSetHeight(root_child0_child0, 10);
  HPNodeInsertChild(root_child0, root_child0_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0));
  ASSERT_FLOAT_EQ(45, HPNodeLayoutGetTop(root_child0_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0_child0));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(90, HPNodeLayoutGetLeft(root_child0_child0));
  ASSERT_FLOAT_EQ(45, HPNodeLayoutGetTop(root_child0_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0_child0));

  HPNodeFreeRecursive(root);
}
