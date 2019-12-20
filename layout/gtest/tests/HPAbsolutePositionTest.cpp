/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#include <gtest.h>
#include <Hippy.h>

TEST(HippyTest, absolute_layout_width_height_start_top) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetPositionType(root_child0, PositionTypeAbsolute);
  HPNodeStyleSetPosition(root_child0, CSSStart, 10);
  HPNodeStyleSetPosition(root_child0, CSSTop, 10);
  HPNodeStyleSetWidth(root_child0, 10);
  HPNodeStyleSetHeight(root_child0, 10);
  HPNodeInsertChild(root, root_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, absolute_layout_width_height_end_bottom) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetPositionType(root_child0, PositionTypeAbsolute);
  HPNodeStyleSetPosition(root_child0, CSSEnd, 10);
  HPNodeStyleSetPosition(root_child0, CSSBottom, 10);
  HPNodeStyleSetWidth(root_child0, 10);
  HPNodeStyleSetHeight(root_child0, 10);
  HPNodeInsertChild(root, root_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, absolute_layout_start_top_end_bottom) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetPositionType(root_child0, PositionTypeAbsolute);
  HPNodeStyleSetPosition(root_child0, CSSLeft, 10);
  HPNodeStyleSetPosition(root_child0, CSSTop, 10);
  HPNodeStyleSetPosition(root_child0, CSSRight, 10);
  HPNodeStyleSetPosition(root_child0, CSSBottom, 10);
  HPNodeInsertChild(root, root_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetHeight(root_child0));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

   ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
   ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
   ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
   ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

   ASSERT_FLOAT_EQ(10, HPNodeLayoutGetLeft(root_child0));
   ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child0));
   ASSERT_FLOAT_EQ(80, HPNodeLayoutGetWidth(root_child0));
   ASSERT_FLOAT_EQ(80, HPNodeLayoutGetHeight(root_child0));

   HPNodeFreeRecursive(root);


}

TEST(HippyTest, absolute_layout_width_height_start_top_end_bottom) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetPositionType(root_child0, PositionTypeAbsolute);
  HPNodeStyleSetPosition(root_child0, CSSLeft, 10);
  HPNodeStyleSetPosition(root_child0, CSSTop, 10);
  HPNodeStyleSetPosition(root_child0, CSSRight, 10);
  HPNodeStyleSetPosition(root_child0, CSSBottom, 10);
  HPNodeStyleSetWidth(root_child0, 10);
  HPNodeStyleSetHeight(root_child0, 10);
  HPNodeInsertChild(root, root_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));


  HPNodeFreeRecursive(root);

}

TEST(HippyTest, do_not_clamp_height_of_absolute_node_to_height_of_its_overflow_hidden_parent) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetOverflow(root, OverflowHidden);
  HPNodeStyleSetWidth(root, 50);
  HPNodeStyleSetHeight(root, 50);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetPositionType(root_child0, PositionTypeAbsolute);
  HPNodeStyleSetPosition(root_child0, CSSStart, 0);
  HPNodeStyleSetPosition(root_child0, CSSTop, 0);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child0_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0_child0, 100);
  HPNodeStyleSetHeight(root_child0_child0, 100);
  HPNodeInsertChild(root_child0, root_child0_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0_child0));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(-50, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root_child0_child0));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root_child0_child0));


  HPNodeFreeRecursive(root);
}

//TODO:: Failed test... ianwang..2018.1.12.padding border VS position,  position = padding + border...
TEST(HippyTest, absolute_layout_within_border) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetMargin(root, CSSLeft, 10);
  HPNodeStyleSetMargin(root, CSSTop, 10);
  HPNodeStyleSetMargin(root, CSSRight, 10);
  HPNodeStyleSetMargin(root, CSSBottom, 10);
  HPNodeStyleSetPadding(root, CSSLeft, 10);
  HPNodeStyleSetPadding(root, CSSTop, 10);
  HPNodeStyleSetPadding(root, CSSRight, 10);
  HPNodeStyleSetPadding(root, CSSBottom, 10);
  HPNodeStyleSetBorder(root, CSSLeft, 10);
  HPNodeStyleSetBorder(root, CSSTop, 10);
  HPNodeStyleSetBorder(root, CSSRight, 10);
  HPNodeStyleSetBorder(root, CSSBottom, 10);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetPositionType(root_child0, PositionTypeAbsolute);
  HPNodeStyleSetPosition(root_child0, CSSLeft, 0);
  HPNodeStyleSetPosition(root_child0, CSSTop, 0);
  HPNodeStyleSetWidth(root_child0, 50);
  HPNodeStyleSetHeight(root_child0, 50);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetPositionType(root_child1, PositionTypeAbsolute);
  HPNodeStyleSetPosition(root_child1, CSSRight, 0);
  HPNodeStyleSetPosition(root_child1, CSSBottom, 0);
  HPNodeStyleSetWidth(root_child1, 50);
  HPNodeStyleSetHeight(root_child1, 50);
  HPNodeInsertChild(root, root_child1, 1);

  const HPNodeRef root_child2 = HPNodeNew();
  HPNodeStyleSetPositionType(root_child2, PositionTypeAbsolute);
  HPNodeStyleSetPosition(root_child2, CSSLeft, 0);
  HPNodeStyleSetPosition(root_child2, CSSTop, 0);
  HPNodeStyleSetMargin(root_child2, CSSLeft, 10);
  HPNodeStyleSetMargin(root_child2, CSSTop, 10);
  HPNodeStyleSetMargin(root_child2, CSSRight, 10);
  HPNodeStyleSetMargin(root_child2, CSSBottom, 10);
  HPNodeStyleSetWidth(root_child2, 50);
  HPNodeStyleSetHeight(root_child2, 50);
  HPNodeInsertChild(root, root_child2, 2);

  const HPNodeRef root_child3 = HPNodeNew();
  HPNodeStyleSetPositionType(root_child3, PositionTypeAbsolute);
  HPNodeStyleSetPosition(root_child3, CSSRight, 0);
  HPNodeStyleSetPosition(root_child3, CSSBottom, 0);
  HPNodeStyleSetMargin(root_child3, CSSLeft, 10);
  HPNodeStyleSetMargin(root_child3, CSSTop, 10);
  HPNodeStyleSetMargin(root_child3, CSSRight, 10);
  HPNodeStyleSetMargin(root_child3, CSSBottom, 10);
  HPNodeStyleSetWidth(root_child3, 50);
  HPNodeStyleSetHeight(root_child3, 50);
  HPNodeInsertChild(root, root_child3, 3);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child3));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child1));

  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetLeft(root_child2));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child2));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child2));

  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetLeft(root_child3));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetTop(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child3));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child3));


  HPNodeFreeRecursive(root);
}

TEST(HippyTest, absolute_layout_align_items_and_justify_content_center) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetJustifyContent(root, FlexAlignCenter);
  HPNodeStyleSetAlignItems(root, FlexAlignCenter);
  HPNodeStyleSetFlexGrow(root, 1);
  HPNodeStyleSetWidth(root, 110);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetPositionType(root_child0, PositionTypeAbsolute);
  HPNodeStyleSetWidth(root_child0, 60);
  HPNodeStyleSetHeight(root_child0, 40);
  HPNodeInsertChild(root, root_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(110, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child0));


  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(110, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child0));


  HPNodeFreeRecursive(root);

}

TEST(HippyTest, absolute_layout_align_items_and_justify_content_flex_end) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetJustifyContent(root, FlexAlignEnd);
  HPNodeStyleSetAlignItems(root, FlexAlignEnd);
  HPNodeStyleSetFlexGrow(root, 1);
  HPNodeStyleSetWidth(root, 110);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetPositionType(root_child0, PositionTypeAbsolute);
  HPNodeStyleSetWidth(root_child0, 60);
  HPNodeStyleSetHeight(root_child0, 40);
  HPNodeInsertChild(root, root_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(110, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child0));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(110, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child0));


  HPNodeFreeRecursive(root);
}

TEST(HippyTest, absolute_layout_justify_content_center) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetJustifyContent(root, FlexAlignCenter);
  HPNodeStyleSetFlexGrow(root, 1);
  HPNodeStyleSetWidth(root, 110);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetPositionType(root_child0, PositionTypeAbsolute);
  HPNodeStyleSetWidth(root_child0, 60);
  HPNodeStyleSetHeight(root_child0, 40);
  HPNodeInsertChild(root, root_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(110, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child0));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(110, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child0));


  HPNodeFreeRecursive(root);

}

TEST(HippyTest, absolute_layout_align_items_center) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetAlignItems(root, FlexAlignCenter);
  HPNodeStyleSetFlexGrow(root, 1);
  HPNodeStyleSetWidth(root, 110);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetPositionType(root_child0, PositionTypeAbsolute);
  HPNodeStyleSetWidth(root_child0, 60);
  HPNodeStyleSetHeight(root_child0, 40);
  HPNodeInsertChild(root, root_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(110, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child0));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(110, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child0));


  HPNodeFreeRecursive(root);
}

TEST(HippyTest, absolute_layout_align_items_center_on_child_only) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexGrow(root, 1);
  HPNodeStyleSetWidth(root, 110);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetAlignSelf(root_child0, FlexAlignCenter);
  HPNodeStyleSetPositionType(root_child0, PositionTypeAbsolute);
  HPNodeStyleSetWidth(root_child0, 60);
  HPNodeStyleSetHeight(root_child0, 40);
  HPNodeInsertChild(root, root_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(110, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child0));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(110, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child0));


  HPNodeFreeRecursive(root);
}

TEST(HippyTest, absolute_layout_align_items_and_justify_content_center_and_top_position) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetJustifyContent(root, FlexAlignCenter);
  HPNodeStyleSetAlignItems(root, FlexAlignCenter);
  HPNodeStyleSetFlexGrow(root, 1);
  HPNodeStyleSetWidth(root, 110);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetPositionType(root_child0, PositionTypeAbsolute);
  HPNodeStyleSetPosition(root_child0, CSSTop, 10);
  HPNodeStyleSetWidth(root_child0, 60);
  HPNodeStyleSetHeight(root_child0, 40);
  HPNodeInsertChild(root, root_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(110, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child0));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(110, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child0));



  HPNodeFreeRecursive(root);

}


TEST(HippyTest, absolute_layout_align_items_and_justify_content_center_and_bottom_position) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetJustifyContent(root, FlexAlignCenter);
  HPNodeStyleSetAlignItems(root, FlexAlignCenter);
  HPNodeStyleSetFlexGrow(root, 1);
  HPNodeStyleSetWidth(root, 110);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetPositionType(root_child0, PositionTypeAbsolute);
  HPNodeStyleSetPosition(root_child0, CSSBottom, 10);
  HPNodeStyleSetWidth(root_child0, 60);
  HPNodeStyleSetHeight(root_child0, 40);
  HPNodeInsertChild(root, root_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(110, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child0));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(110, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child0));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, absolute_layout_align_items_and_justify_content_center_and_left_position) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetJustifyContent(root, FlexAlignCenter);
  HPNodeStyleSetAlignItems(root, FlexAlignCenter);
  HPNodeStyleSetFlexGrow(root, 1);
  HPNodeStyleSetWidth(root, 110);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetPositionType(root_child0, PositionTypeAbsolute);
  HPNodeStyleSetPosition(root_child0, CSSLeft, 5);
  HPNodeStyleSetWidth(root_child0, 60);
  HPNodeStyleSetHeight(root_child0, 40);
  HPNodeInsertChild(root, root_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(110, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(5, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child0));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(110, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(5, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child0));
  HPNodeFreeRecursive(root);

}

TEST(HippyTest, absolute_layout_align_items_and_justify_content_center_and_right_position) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetJustifyContent(root, FlexAlignCenter);
  HPNodeStyleSetAlignItems(root, FlexAlignCenter);
  HPNodeStyleSetFlexGrow(root, 1);
  HPNodeStyleSetWidth(root, 110);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetPositionType(root_child0, PositionTypeAbsolute);
  HPNodeStyleSetPosition(root_child0, CSSRight, 5);
  HPNodeStyleSetWidth(root_child0, 60);
  HPNodeStyleSetHeight(root_child0, 40);
  HPNodeInsertChild(root, root_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(110, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(45, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child0));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(110, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(45, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(30, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetHeight(root_child0));

  HPNodeFreeRecursive(root);

}

TEST(HippyTest, position_root_with_rtl_should_position_withoutdirection) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetPosition(root, CSSLeft, 72);
  HPNodeStyleSetWidth(root, 52);
  HPNodeStyleSetHeight(root, 52);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(72, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(52, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(52, HPNodeLayoutGetHeight(root));


  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(72, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(52, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(52, HPNodeLayoutGetHeight(root));


  HPNodeFreeRecursive(root);

}

//TEST(HippyTest, absolute_layout_percentage_bottom_based_on_parent_height) {
//
//
//  const HPNodeRef root = HPNodeNew();
//  HPNodeStyleSetWidth(root, 100);
//  HPNodeStyleSetHeight(root, 200);
//
//  const HPNodeRef root_child0 = HPNodeNew();
//  HPNodeStyleSetPositionType(root_child0, PositionTypeAbsolute);
//  HPNodeStyleSetPositionPercent(root_child0, CSSTop, 50);
//  HPNodeStyleSetWidth(root_child0, 10);
//  HPNodeStyleSetHeight(root_child0, 10);
//  HPNodeInsertChild(root, root_child0, 0);
//
//  const HPNodeRef root_child1 = HPNodeNew();
//  HPNodeStyleSetPositionType(root_child1, PositionTypeAbsolute);
//  HPNodeStyleSetPositionPercent(root_child1, CSSBottom, 50);
//  HPNodeStyleSetWidth(root_child1, 10);
//  HPNodeStyleSetHeight(root_child1, 10);
//  HPNodeInsertChild(root, root_child1, 1);
//
//  const HPNodeRef root_child2 = HPNodeNew();
//  HPNodeStyleSetPositionType(root_child2, PositionTypeAbsolute);
//  HPNodeStyleSetPositionPercent(root_child2, CSSTop, 10);
//  HPNodeStyleSetPositionPercent(root_child2, CSSBottom, 10);
//  HPNodeStyleSetWidth(root_child2, 10);
//  HPNodeInsertChild(root, root_child2, 2);
//   HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
//  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetHeight(root));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetTop(root_child0));
//  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0));
//  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
//  ASSERT_FLOAT_EQ(90, HPNodeLayoutGetTop(root_child1));
//  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child1));
//  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1));
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child2));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root_child2));
//  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child2));
//  ASSERT_FLOAT_EQ(160, HPNodeLayoutGetHeight(root_child2));
//
//  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED,);
//
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
//  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
//  ASSERT_FLOAT_EQ(200, HPNodeLayoutGetHeight(root));
//
//  ASSERT_FLOAT_EQ(90, HPNodeLayoutGetLeft(root_child0));
//  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetTop(root_child0));
//  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0));
//  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));
//
//  ASSERT_FLOAT_EQ(90, HPNodeLayoutGetLeft(root_child1));
//  ASSERT_FLOAT_EQ(90, HPNodeLayoutGetTop(root_child1));
//  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child1));
//  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child1));
//
//  ASSERT_FLOAT_EQ(90, HPNodeLayoutGetLeft(root_child2));
//  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root_child2));
//  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child2));
//  ASSERT_FLOAT_EQ(160, HPNodeLayoutGetHeight(root_child2));
//
//  HPNodeFreeRecursive(root);
//
//
//}

TEST(HippyTest, absolute_layout_in_wrap_reverse_column_container) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexWrap(root, FlexWrapReverse);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetPositionType(root_child0, PositionTypeAbsolute);
  HPNodeStyleSetWidth(root_child0, 20);
  HPNodeStyleSetHeight(root_child0, 20);
  HPNodeInsertChild(root, root_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child0));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child0));


  HPNodeFreeRecursive(root);

}

TEST(HippyTest, absolute_layout_in_wrap_reverse_row_container) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetFlexWrap(root, FlexWrapReverse);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetPositionType(root_child0, PositionTypeAbsolute);
  HPNodeStyleSetWidth(root_child0, 20);
  HPNodeStyleSetHeight(root_child0, 20);
  HPNodeInsertChild(root, root_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child0));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child0));


  HPNodeFreeRecursive(root);
}

TEST(HippyTest, absolute_layout_in_wrap_reverse_column_container_flex_end) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexWrap(root, FlexWrapReverse);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetAlignSelf(root_child0, FlexAlignEnd);
  HPNodeStyleSetPositionType(root_child0, PositionTypeAbsolute);
  HPNodeStyleSetWidth(root_child0, 20);
  HPNodeStyleSetHeight(root_child0, 20);
  HPNodeInsertChild(root, root_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child0));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child0));


  HPNodeFreeRecursive(root);
}

TEST(HippyTest, absolute_layout_in_wrap_reverse_row_container_flex_end) {

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetFlexWrap(root, FlexWrapReverse);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetAlignSelf(root_child0, FlexAlignEnd);
  HPNodeStyleSetPositionType(root_child0, PositionTypeAbsolute);
  HPNodeStyleSetWidth(root_child0, 20);
  HPNodeStyleSetHeight(root_child0, 20);
  HPNodeInsertChild(root, root_child0, 0);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child0));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetHeight(root_child0));


  HPNodeFreeRecursive(root);
}
