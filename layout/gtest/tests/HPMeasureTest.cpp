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

static HPSize _measure(HPNodeRef node,
                       float width,
                       MeasureMode widthMode,
                       float height,
                       MeasureMode heightMode,
                       void* layoutContext) {
  int* measureCount = (int*)node->getContext();
  if (measureCount) {
    (*measureCount)++;
  }

  return HPSize{
      .width = 10,
      .height = 10,
  };
}

static HPSize _simulate_wrapping_text(HPNodeRef node,
                                      float width,
                                      MeasureMode widthMode,
                                      float height,
                                      MeasureMode heightMode,
                                      void* layoutContext) {
  if (widthMode == MeasureModeUndefined || width >= 68) {
    return HPSize{.width = 68, .height = 16};
  }

  return HPSize{
      .width = 50,
      .height = 32,
  };
}

static HPSize _measure_assert_negative(HPNodeRef node,
                                       float width,
                                       MeasureMode widthMode,
                                       float height,
                                       MeasureMode heightMode,
                                       void* layoutContext) {
  EXPECT_GE(width, 0);
  EXPECT_GE(height, 0);

  return HPSize{
      .width = 0,
      .height = 0,
  };
}

TEST(HippyTest, dont_measure_single_grow_shrink_child) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  int measureCount = 0;

  const HPNodeRef root_child0 = HPNodeNew();
  root_child0->setContext(&measureCount);
  HPNodeSetMeasureFunc(root_child0, _measure);
  //  HPNodeSetMeasureFunc(root_child0, _measure);;
  HPNodeStyleSetFlexGrow(root_child0, 1);
  HPNodeStyleSetFlexShrink(root_child0, 1);
  HPNodeInsertChild(root, root_child0, 0);

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_EQ(0, measureCount);

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, measure_absolute_child_with_no_constraints) {
  const HPNodeRef root = HPNodeNew();

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeInsertChild(root, root_child0, 0);

  int measureCount = 0;

  const HPNodeRef root_child0_child0 = HPNodeNew();
  HPNodeStyleSetPositionType(root_child0_child0, PositionTypeAbsolute);
  root_child0_child0->setContext(&measureCount);
  HPNodeSetMeasureFunc(root_child0_child0, _measure);
  HPNodeInsertChild(root_child0, root_child0_child0, 0);

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_EQ(1, measureCount);

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, dont_measure_when_min_equals_max) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetAlignItems(root, FlexAlignStart);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  int measureCount = 0;

  const HPNodeRef root_child0 = HPNodeNew();
  root_child0->setContext(&measureCount);
  HPNodeSetMeasureFunc(root_child0, _measure);
  //  HPNodeSetMeasureFunc(root_child0, _measure);;
  HPNodeStyleSetMinWidth(root_child0, 10);
  HPNodeStyleSetMaxWidth(root_child0, 10);
  HPNodeStyleSetMinHeight(root_child0, 10);
  HPNodeStyleSetMaxHeight(root_child0, 10);
  HPNodeInsertChild(root, root_child0, 0);

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_EQ(0, measureCount);
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, dont_measure_when_min_equals_max_percentages) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetAlignItems(root, FlexAlignStart);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  int measureCount = 0;

  const HPNodeRef root_child0 = HPNodeNew();
  root_child0->setContext(&measureCount);
  HPNodeSetMeasureFunc(root_child0, _measure);
  //  HPNodeSetMeasureFunc(root_child0, _measure);;
  HPNodeStyleSetMinWidth(root_child0, 10);
  HPNodeStyleSetMaxWidth(root_child0, 10);
  HPNodeStyleSetMinHeight(root_child0, 10);
  HPNodeStyleSetMaxHeight(root_child0, 10);
  HPNodeInsertChild(root, root_child0, 0);

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_EQ(0, measureCount);
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, measure_nodes_with_margin_auto_and_stretch) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetWidth(root, 500);
  HPNodeStyleSetHeight(root, 500);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeSetMeasureFunc(root_child0, _measure);
  //  HPNodeSetMeasureFunc(root_child0, _measure);;
  HPNodeStyleSetMarginAuto(root_child0, CSSLeft);
  HPNodeInsertChild(root, root_child0, 0);

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  EXPECT_EQ(490, HPNodeLayoutGetLeft(root_child0));
  EXPECT_EQ(0, HPNodeLayoutGetTop(root_child0));
  EXPECT_EQ(10, HPNodeLayoutGetWidth(root_child0));
  EXPECT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, dont_measure_when_min_equals_max_mixed_width_percent) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetAlignItems(root, FlexAlignStart);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  int measureCount = 0;

  const HPNodeRef root_child0 = HPNodeNew();
  root_child0->setContext(&measureCount);
  //  HPNodeSetMeasureFunc(root_child0, _measure);;
  HPNodeSetMeasureFunc(root_child0, _measure);
  HPNodeStyleSetMinWidth(root_child0, 10);
  HPNodeStyleSetMaxWidth(root_child0, 10);
  HPNodeStyleSetMinHeight(root_child0, 10);
  HPNodeStyleSetMaxHeight(root_child0, 10);
  HPNodeInsertChild(root, root_child0, 0);

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_EQ(0, measureCount);
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, dont_measure_when_min_equals_max_mixed_height_percent) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetAlignItems(root, FlexAlignStart);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  int measureCount = 0;

  const HPNodeRef root_child0 = HPNodeNew();
  root_child0->setContext(&measureCount);
  HPNodeSetMeasureFunc(root_child0, _measure);
  ;
  HPNodeStyleSetMinWidth(root_child0, 10);
  HPNodeStyleSetMaxWidth(root_child0, 10);
  HPNodeStyleSetMinHeight(root_child0, 10);
  HPNodeStyleSetMaxHeight(root_child0, 10);
  HPNodeInsertChild(root, root_child0, 0);

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_EQ(0, measureCount);
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, measure_enough_size_should_be_in_single_line) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetWidth(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetAlignSelf(root_child0, FlexAlignStart);
  HPNodeSetMeasureFunc(root_child0, _simulate_wrapping_text);
  //   HPNodeSetMeasureFunc(root_child0, _simulate_wrapping_text);;

  HPNodeInsertChild(root, root_child0, 0);

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(68, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(16, HPNodeLayoutGetHeight(root_child0));

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, measure_not_enough_size_should_wrap) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetWidth(root, 55);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetAlignSelf(root_child0, FlexAlignStart);
  HPNodeSetMeasureFunc(root_child0, _simulate_wrapping_text);
  //   HPNodeSetMeasureFunc(root_child0, _simulate_wrapping_text);;
  HPNodeInsertChild(root, root_child0, 0);

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(32, HPNodeLayoutGetHeight(root_child0));

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, measure_zero_space_should_grow) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetHeight(root, 200);
  HPNodeStyleSetFlexDirection(root, FLexDirectionColumn);
  HPNodeStyleSetFlexGrow(root, 0);

  int measureCount = 0;

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexDirection(root_child0, FLexDirectionColumn);
  //  HPNodeStyleSetPadding(root_child0, YGEdgeAll, 100);

  HPNodeStyleSetPadding(root_child0, CSSLeft, 100);
  HPNodeStyleSetPadding(root_child0, CSSTop, 100);
  HPNodeStyleSetPadding(root_child0, CSSRight, 100);
  HPNodeStyleSetPadding(root_child0, CSSBottom, 100);

  root_child0->setContext(&measureCount);
  HPNodeSetMeasureFunc(root_child0, _measure);
  ;

  HPNodeInsertChild(root, root_child0, 0);

  HPNodeDoLayout(root, 282, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(282, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, measure_flex_direction_row_and_padding) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetPadding(root, CSSLeft, 25);
  HPNodeStyleSetPadding(root, CSSTop, 25);
  HPNodeStyleSetPadding(root, CSSRight, 25);
  HPNodeStyleSetPadding(root, CSSBottom, 25);
  HPNodeStyleSetWidth(root, 50);
  HPNodeStyleSetHeight(root, 50);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeSetMeasureFunc(root_child0, _simulate_wrapping_text);
  ;
  //  HPNodeSetMeasureFunc(root_child0, _simulate_wrapping_text);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 5);
  HPNodeStyleSetHeight(root_child1, 5);
  HPNodeInsertChild(root, root_child1, 1);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(75, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(5, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(5, HPNodeLayoutGetHeight(root_child1));

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, measure_flex_direction_column_and_padding) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetMargin(root, CSSTop, 20);
  //  HPNodeStyleSetPadding(root, YGEdgeAll, 25);
  HPNodeStyleSetPadding(root, CSSLeft, 25);
  HPNodeStyleSetPadding(root, CSSTop, 25);
  HPNodeStyleSetPadding(root, CSSRight, 25);
  HPNodeStyleSetPadding(root, CSSBottom, 25);
  HPNodeStyleSetWidth(root, 50);
  HPNodeStyleSetHeight(root, 50);

  const HPNodeRef root_child0 = HPNodeNew();
  // HPNodeSetMeasureFunc(root_child0, _simulate_wrapping_text);;
  HPNodeSetMeasureFunc(root_child0, _simulate_wrapping_text);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 5);
  HPNodeStyleSetHeight(root_child1, 5);
  HPNodeInsertChild(root, root_child1, 1);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(32, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(57, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(5, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(5, HPNodeLayoutGetHeight(root_child1));

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, measure_flex_direction_row_no_padding) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetMargin(root, CSSTop, 20);
  HPNodeStyleSetWidth(root, 50);
  HPNodeStyleSetHeight(root, 50);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeSetMeasureFunc(root_child0, _simulate_wrapping_text);
  // HPNodeSetMeasureFunc(root_child0, _simulate_wrapping_text);;
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 5);
  HPNodeStyleSetHeight(root_child1, 5);
  HPNodeInsertChild(root, root_child1, 1);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(5, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(5, HPNodeLayoutGetHeight(root_child1));

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, measure_flex_direction_row_no_padding_align_items_flexstart) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetMargin(root, CSSTop, 20);
  HPNodeStyleSetWidth(root, 50);
  HPNodeStyleSetHeight(root, 50);
  HPNodeStyleSetAlignItems(root, FlexAlignStart);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeSetMeasureFunc(root_child0, _simulate_wrapping_text);
  //   HPNodeSetMeasureFunc(root_child0, _simulate_wrapping_text);;
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 5);
  HPNodeStyleSetHeight(root_child1, 5);
  HPNodeInsertChild(root, root_child1, 1);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(32, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(5, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(5, HPNodeLayoutGetHeight(root_child1));

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, measure_with_fixed_size) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetMargin(root, CSSTop, 20);
  //  HPNodeStyleSetPadding(root, YGEdgeAll, 25);
  HPNodeStyleSetPadding(root, CSSLeft, 25);
  HPNodeStyleSetPadding(root, CSSTop, 25);
  HPNodeStyleSetPadding(root, CSSRight, 25);
  HPNodeStyleSetPadding(root, CSSBottom, 25);
  HPNodeStyleSetWidth(root, 50);
  HPNodeStyleSetHeight(root, 50);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeSetMeasureFunc(root_child0, _simulate_wrapping_text);
  //   HPNodeSetMeasureFunc(root_child0, _simulate_wrapping_text);;
  HPNodeStyleSetWidth(root_child0, 10);
  HPNodeStyleSetHeight(root_child0, 10);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 5);
  HPNodeStyleSetHeight(root_child1, 5);
  HPNodeInsertChild(root, root_child1, 1);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(35, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(5, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(5, HPNodeLayoutGetHeight(root_child1));

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, measure_with_flex_shrink) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetMargin(root, CSSTop, 20);
  //  HPNodeStyleSetPadding(root, YGEdgeAll, 25);
  HPNodeStyleSetPadding(root, CSSLeft, 25);
  HPNodeStyleSetPadding(root, CSSTop, 25);
  HPNodeStyleSetPadding(root, CSSRight, 25);
  HPNodeStyleSetPadding(root, CSSBottom, 25);
  HPNodeStyleSetWidth(root, 50);
  HPNodeStyleSetHeight(root, 50);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeSetMeasureFunc(root_child0, _simulate_wrapping_text);
  ;
  HPNodeStyleSetFlexShrink(root_child0, 1);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 5);
  HPNodeStyleSetHeight(root_child1, 5);
  HPNodeInsertChild(root, root_child1, 1);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(25, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(5, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(5, HPNodeLayoutGetHeight(root_child1));

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, measure_no_padding) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetMargin(root, CSSTop, 20);
  HPNodeStyleSetWidth(root, 50);
  HPNodeStyleSetHeight(root, 50);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeSetMeasureFunc(root_child0, _simulate_wrapping_text);
  ;
  HPNodeStyleSetFlexShrink(root_child0, 1);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 5);
  HPNodeStyleSetHeight(root_child1, 5);
  HPNodeInsertChild(root, root_child1, 1);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(32, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(32, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(5, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(5, HPNodeLayoutGetHeight(root_child1));

  HPNodeFreeRecursive(root);
}

#if GTEST_HAS_DEATH_TEST
TEST(HippyTest, cannot_add_child_to_node_with_measure_func) {
  const HPNodeRef root = HPNodeNew();
  HPNodeSetMeasureFunc(root, _measure);
  //  HPNodeSetMeasureFunc(root, _measure);

  const HPNodeRef root_child0 = HPNodeNew();
  ASSERT_FALSE(HPNodeInsertChild(root, root_child0, 0));
  HPNodeFree(root_child0);
  HPNodeFreeRecursive(root);
}

TEST(HippyTest, cannot_add_nonnull_measure_func_to_non_leaf_node) {
  const HPNodeRef root = HPNodeNew();
  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeInsertChild(root, root_child0, 0);
  ASSERT_FALSE(HPNodeSetMeasureFunc(root, _measure));
  HPNodeFreeRecursive(root);
}

#endif

TEST(HippyTest, can_nullify_measure_func_on_any_node) {
  const HPNodeRef root = HPNodeNew();
  HPNodeInsertChild(root, HPNodeNew(), 0);
  //  root->setMeasureFunc(nullptr);
  HPNodeSetMeasureFunc(root, nullptr);
  ASSERT_TRUE(root->measure == NULL);
  HPNodeFreeRecursive(root);
}

TEST(HippyTest, cant_call_negative_measure) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionColumn);
  HPNodeStyleSetWidth(root, 50);
  HPNodeStyleSetHeight(root, 10);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeSetMeasureFunc(root, _measure_assert_negative);
  //  root_child0->setMeasureFunc(_measure_assert_negative);
  HPNodeStyleSetMargin(root_child0, CSSTop, 20);
  HPNodeInsertChild(root, root_child0, 0);

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, cant_call_negative_measure_horizontal) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetWidth(root, 10);
  HPNodeStyleSetHeight(root, 20);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeSetMeasureFunc(root_child0, _measure_assert_negative);
  //  root_child0->setMeasureFunc(_measure_assert_negative);
  HPNodeStyleSetMargin(root_child0, CSSLeft, 20);
  HPNodeInsertChild(root, root_child0, 0);

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  HPNodeFreeRecursive(root);
}

static HPSize _measure_90_10(HPNodeRef node,
                             float width,
                             MeasureMode widthMode,
                             float height,
                             MeasureMode heightMode,
                             void* layoutContext) {
  return HPSize{
      .width = 90,
      .height = 10,
  };
}

TEST(HippyTest, percent_with_text_node) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetJustifyContent(root, FlexAlignSpaceBetween);
  HPNodeStyleSetAlignItems(root, FlexAlignCenter);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 80);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeSetMeasureFunc(root_child1, _measure_90_10);
  //  root_child1->setMeasureFunc(_measure_90_10);
  HPNodeStyleSetMaxWidth(root_child1, 50);
  HPNodeStyleSetPadding(root_child1, CSSTop, 40);
  HPNodeInsertChild(root, root_child1, 1);

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(100, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(80, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(40, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(15, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(50, HPNodeLayoutGetHeight(root_child1));

  HPNodeFreeRecursive(root);
}
