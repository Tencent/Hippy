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

struct _MeasureConstraint {
  float width;
  MeasureMode widthMode;
  float height;
  MeasureMode heightMode;
};

struct _MeasureConstraintList {
  uint32_t length;
  struct _MeasureConstraint *constraints;
};

static HPSize _measure(HPNodeRef node, float width, MeasureMode widthMode,
                       float height, MeasureMode heightMode, void * layoutContext) {
  struct _MeasureConstraintList* constraintList =
      (struct _MeasureConstraintList*) node->getContext();
  struct _MeasureConstraint *constraints = constraintList->constraints;
  uint32_t currentIndex = constraintList->length;
  (&constraints[currentIndex])->width = width;
  (&constraints[currentIndex])->widthMode = widthMode;
  (&constraints[currentIndex])->height = height;
  (&constraints[currentIndex])->heightMode = heightMode;
  constraintList->length = currentIndex + 1;

  return HPSize { .width = widthMode == MeasureModeUndefined ? 10 : width,
      .height = heightMode == MeasureModeUndefined ? 10 : width, };
}

/*TEST(HippyTest, exactly_measure_stretched_child_column) {
  struct _MeasureConstraintList constraintList = _MeasureConstraintList {
      .length = 0, .constraints = (struct _MeasureConstraint *) malloc(
          10 * sizeof(struct _MeasureConstraint)), };

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  //  root_child0->setContext(&constraintList);
  root_child0->setContext(&constraintList);
  root_child0->measure = (_measure);
  //  root_child0->measure=(_measure);
  HPNodeInsertChild(root, root_child0, 0);

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_EQ(1, constraintList.length);

  ASSERT_FLOAT_EQ(100, constraintList.constraints[0].width);
  ASSERT_EQ(MeasureModeExactly, constraintList.constraints[0].widthMode);

  free(constraintList.constraints);
  HPNodeFreeRecursive(root);
}

TEST(HippyTest, exactly_measure_stretched_child_row) {
  struct _MeasureConstraintList constraintList = _MeasureConstraintList {
      .length = 0, .constraints = (struct _MeasureConstraint *) malloc(
          10 * sizeof(struct _MeasureConstraint)), };

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  //  root_child0->setContext(&constraintList);
  root_child0->setContext(&constraintList);
  root_child0->measure = (_measure);
  HPNodeInsertChild(root, root_child0, 0);

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_EQ(1, constraintList.length);

  ASSERT_FLOAT_EQ(100, constraintList.constraints[0].height);
  ASSERT_EQ(MeasureModeExactly, constraintList.constraints[0].heightMode);

  free(constraintList.constraints);
  HPNodeFreeRecursive(root);
}*/

TEST(HippyTest, at_most_main_axis_column) {
  struct _MeasureConstraintList constraintList = _MeasureConstraintList {
      .length = 0, .constraints = (struct _MeasureConstraint *) malloc(
          10 * sizeof(struct _MeasureConstraint)), };

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  root_child0->setContext(&constraintList);
  root_child0->measure = (_measure);
  HPNodeInsertChild(root, root_child0, 0);

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_EQ(1, constraintList.length);

  ASSERT_FLOAT_EQ(100, constraintList.constraints[0].height);
  ASSERT_EQ(MeasureModeAtMost, constraintList.constraints[0].heightMode);

  free(constraintList.constraints);
  HPNodeFreeRecursive(root);
}

TEST(HippyTest, at_most_cross_axis_column) {
  struct _MeasureConstraintList constraintList = _MeasureConstraintList {
      .length = 0, .constraints = (struct _MeasureConstraint *) malloc(
          10 * sizeof(struct _MeasureConstraint)), };

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetAlignItems(root, FlexAlignStart);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  root_child0->setContext(&constraintList);
  root_child0->measure = (_measure);
  HPNodeInsertChild(root, root_child0, 0);

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_EQ(1, constraintList.length);

  ASSERT_FLOAT_EQ(100, constraintList.constraints[0].width);
  ASSERT_EQ(MeasureModeAtMost, constraintList.constraints[0].widthMode);

  free(constraintList.constraints);
  HPNodeFreeRecursive(root);
}

TEST(HippyTest, at_most_main_axis_row) {
  struct _MeasureConstraintList constraintList = _MeasureConstraintList {
      .length = 0, .constraints = (struct _MeasureConstraint *) malloc(
          10 * sizeof(struct _MeasureConstraint)), };

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  root_child0->setContext(&constraintList);
  root_child0->measure = (_measure);
  HPNodeInsertChild(root, root_child0, 0);

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_EQ(1, constraintList.length);

  ASSERT_FLOAT_EQ(100, constraintList.constraints[0].width);
  ASSERT_EQ(MeasureModeAtMost, constraintList.constraints[0].widthMode);

  free(constraintList.constraints);
  HPNodeFreeRecursive(root);
}

TEST(HippyTest, at_most_cross_axis_row) {
  struct _MeasureConstraintList constraintList = _MeasureConstraintList {
      .length = 0, .constraints = (struct _MeasureConstraint *) malloc(
          10 * sizeof(struct _MeasureConstraint)), };

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetAlignItems(root, FlexAlignStart);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  root_child0->setContext(&constraintList);
  root_child0->measure = (_measure);
  HPNodeInsertChild(root, root_child0, 0);

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_EQ(1, constraintList.length);

  ASSERT_FLOAT_EQ(100, constraintList.constraints[0].height);
  ASSERT_EQ(MeasureModeAtMost, constraintList.constraints[0].heightMode);

  free(constraintList.constraints);
  HPNodeFreeRecursive(root);
}

TEST(HippyTest, flex_child) {
  struct _MeasureConstraintList constraintList = _MeasureConstraintList {
      .length = 0, .constraints = (struct _MeasureConstraint *) malloc(
          10 * sizeof(struct _MeasureConstraint)), };

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0, 1);
  root_child0->setContext(&constraintList);
  root_child0->measure = (_measure);
  HPNodeInsertChild(root, root_child0, 0);

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_EQ(2, constraintList.length);

  ASSERT_FLOAT_EQ(100, constraintList.constraints[0].height);
  ASSERT_EQ(MeasureModeAtMost, constraintList.constraints[0].heightMode);

  ASSERT_FLOAT_EQ(100, constraintList.constraints[1].height);
  ASSERT_EQ(MeasureModeExactly, constraintList.constraints[1].heightMode);

  free(constraintList.constraints);
  HPNodeFreeRecursive(root);
}

TEST(HippyTest, flex_child_with_flex_basis) {
  struct _MeasureConstraintList constraintList = _MeasureConstraintList {
      .length = 0, .constraints = (struct _MeasureConstraint *) malloc(
          10 * sizeof(struct _MeasureConstraint)), };

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0, 1);
  HPNodeStyleSetFlexBasis(root_child0, 0);
  root_child0->setContext(&constraintList);
  root_child0->measure = (_measure);
  HPNodeInsertChild(root, root_child0, 0);

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_EQ(1, constraintList.length);

  ASSERT_FLOAT_EQ(100, constraintList.constraints[0].height);
  ASSERT_EQ(MeasureModeExactly, constraintList.constraints[0].heightMode);

  free(constraintList.constraints);
  HPNodeFreeRecursive(root);
}

TEST(HippyTest, overflow_scroll_column) {
  struct _MeasureConstraintList constraintList = _MeasureConstraintList {
      .length = 0, .constraints = (struct _MeasureConstraint *) malloc(
          10 * sizeof(struct _MeasureConstraint)), };

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetAlignItems(root, FlexAlignStart);
  HPNodeStyleSetOverflow(root, OverflowScroll);
  HPNodeStyleSetHeight(root, 100);
  HPNodeStyleSetWidth(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  root_child0->setContext(&constraintList);
  root_child0->measure = (_measure);
  HPNodeInsertChild(root, root_child0, 0);

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_EQ(1, constraintList.length);

  ASSERT_FLOAT_EQ(100, constraintList.constraints[0].width);
  ASSERT_EQ(MeasureModeAtMost, constraintList.constraints[0].widthMode);

  ASSERT_TRUE(isUndefined(constraintList.constraints[0].height));
  ASSERT_EQ(MeasureModeUndefined, constraintList.constraints[0].heightMode);

  free(constraintList.constraints);
  HPNodeFreeRecursive(root);
}

TEST(HippyTest, overflow_scroll_row) {
  struct _MeasureConstraintList constraintList = _MeasureConstraintList {
      .length = 0, .constraints = (struct _MeasureConstraint *) malloc(
          10 * sizeof(struct _MeasureConstraint)), };

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetAlignItems(root, FlexAlignStart);
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetOverflow(root, OverflowScroll);
  HPNodeStyleSetHeight(root, 100);
  HPNodeStyleSetWidth(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  root_child0->setContext(&constraintList);
  root_child0->measure = (_measure);
  HPNodeInsertChild(root, root_child0, 0);

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_EQ(1, constraintList.length);

  ASSERT_TRUE(isUndefined(constraintList.constraints[0].width));
  ASSERT_EQ(MeasureModeUndefined, constraintList.constraints[0].widthMode);

  ASSERT_FLOAT_EQ(100, constraintList.constraints[0].height);
  ASSERT_EQ(MeasureModeAtMost, constraintList.constraints[0].heightMode);

  free(constraintList.constraints);
  HPNodeFreeRecursive(root);
}
