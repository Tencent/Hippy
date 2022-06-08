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

static HPSize _measureMax(HPNodeRef node,
                          float width,
                          MeasureMode widthMode,
                          float height,
                          MeasureMode heightMode,
                          void* layoutContext) {
  int* measureCount = (int*)node->getContext();
  (*measureCount)++;

  return HPSize{
      .width = widthMode == MeasureModeUndefined ? 10 : width,
      .height = heightMode == MeasureModeUndefined ? 10 : height,
  };
}

static HPSize _measureMin(HPNodeRef node,
                          float width,
                          MeasureMode widthMode,
                          float height,
                          MeasureMode heightMode,
                          void* layoutContext) {
  int* measureCount = (int*)node->getContext();
  *measureCount = *measureCount + 1;
  return HPSize{
      .width = widthMode == MeasureModeUndefined || (widthMode == MeasureModeAtMost && width > 10)
                   ? 10
                   : width,
      .height =
          heightMode == MeasureModeUndefined || (heightMode == MeasureModeAtMost && height > 10)
              ? 10
              : height,
  };
}

static HPSize _measure_84_49(HPNodeRef node,
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
      .width = 84.f,
      .height = 49.f,
  };
}

TEST(HippyTest, measure_once_single_flexible_child) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetAlignItems(root, FlexAlignStart);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  int measureCount = 0;
  root_child0->setContext(&measureCount);
  root_child0->measure = (_measureMax);
  HPNodeStyleSetFlexGrow(root_child0, 1);
  HPNodeInsertChild(root, root_child0, 0);

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_EQ(1, measureCount);

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, remeasure_with_same_exact_width_larger_than_needed_height) {
  const HPNodeRef root = HPNodeNew();

  const HPNodeRef root_child0 = HPNodeNew();
  int measureCount = 0;
  root_child0->setContext(&measureCount);
  root_child0->measure = (_measureMin);
  HPNodeInsertChild(root, root_child0, 0);

  HPNodeDoLayout(root, 100, 100);
  HPNodeDoLayout(root, 100, 50);

  ASSERT_EQ(1, measureCount);

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, remeasure_with_same_atmost_width_larger_than_needed_height) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetAlignItems(root, FlexAlignStart);

  const HPNodeRef root_child0 = HPNodeNew();
  int measureCount = 0;
  root_child0->setContext(&measureCount);
  root_child0->measure = (_measureMin);
  HPNodeInsertChild(root, root_child0, 0);

  HPNodeDoLayout(root, 100, 100);
  HPNodeDoLayout(root, 100, 50);

  ASSERT_EQ(1, measureCount);

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, remeasure_with_computed_width_larger_than_needed_height) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetAlignItems(root, FlexAlignStart);

  const HPNodeRef root_child0 = HPNodeNew();
  int measureCount = 0;
  root_child0->setContext(&measureCount);
  root_child0->measure = (_measureMin);
  HPNodeInsertChild(root, root_child0, 0);

  HPNodeDoLayout(root, 100, 100);
  HPNodeStyleSetAlignItems(root, FlexAlignStretch);
  HPNodeDoLayout(root, 10, 50);

  ASSERT_EQ(1, measureCount);

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, remeasure_with_atmost_computed_width_undefined_height) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetAlignItems(root, FlexAlignStart);

  const HPNodeRef root_child0 = HPNodeNew();
  int measureCount = 0;
  root_child0->setContext(&measureCount);
  root_child0->measure = (_measureMin);
  HPNodeInsertChild(root, root_child0, 0);

  HPNodeDoLayout(root, 100, VALUE_UNDEFINED);
  HPNodeDoLayout(root, 10, VALUE_UNDEFINED);

  ASSERT_EQ(1, measureCount);

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, remeasure_with_already_measured_value_smaller_but_still_float_equal) {
  int measureCount = 0;

  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetWidth(root, 288.f);
  HPNodeStyleSetHeight(root, 288.f);
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetPadding(root_child0, CSSLeft, 2.88f);
  HPNodeStyleSetPadding(root_child0, CSSTop, 2.88f);
  HPNodeStyleSetPadding(root_child0, CSSRight, 2.88f);
  HPNodeStyleSetPadding(root_child0, CSSBottom, 2.88f);
  HPNodeStyleSetFlexDirection(root_child0, FLexDirectionRow);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child0_child0 = HPNodeNew();
  root_child0_child0->setContext(&measureCount);
  root_child0_child0->measure = _measure_84_49;
  HPNodeInsertChild(root_child0, root_child0_child0, 0);

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  HPNodeFreeRecursive(root);

  ASSERT_EQ(1, measureCount);
}
