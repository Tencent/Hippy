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

static HPSize _measureFloor(HPNodeRef node,
                            float width,
                            MeasureMode widthMeasureMode,
                            float height,
                            MeasureMode heightMeasureMode,
                            void* layoutContext) {
  return HPSize{
      width = 10.2f,
      height = 10.2f,
  };
}

static HPSize _measureCeil(HPNodeRef node,
                           float width,
                           MeasureMode widthMode,
                           float height,
                           MeasureMode heightMode,
                           void* layoutContext) {
  return HPSize{
      width = 10.5f,
      height = 10.5f,
  };
}

static HPSize _measureFractial(HPNodeRef node,
                               float width,
                               MeasureMode widthMode,
                               float height,
                               MeasureMode heightMode,
                               void* layoutContext) {
  return HPSize{
      width = 0.5f,
      height = 0.5f,
  };
}

TEST(HippyTest, rounding_feature_with_custom_measure_func_floor) {
  const HPNodeRef root = HPNodeNew();

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeSetMeasureFunc(root_child0, _measureFloor);
  //  root_child0->setMeasureFunc(_measureFloor);
  HPNodeInsertChild(root, root_child0, 0);

  //  YGConfigSetPointScaleFactor(config, 0.0f);
  //
  //  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);
  //
  //  ASSERT_FLOAT_EQ(10.2, HPNodeLayoutGetWidth(root_child0));
  //  ASSERT_FLOAT_EQ(10.2, HPNodeLayoutGetHeight(root_child0));

  //  YGConfigSetPointScaleFactor(config, 1.0f);

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(11, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(11, HPNodeLayoutGetHeight(root_child0));

  //  YGConfigSetPointScaleFactor(config, 2.0f);
  //
  //  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);
  //
  //  ASSERT_FLOAT_EQ(10.5, HPNodeLayoutGetWidth(root_child0));
  //  ASSERT_FLOAT_EQ(10.5, HPNodeLayoutGetHeight(root_child0));
  //
  //  YGConfigSetPointScaleFactor(config, 4.0f);
  //
  //  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);
  //
  //  ASSERT_FLOAT_EQ(10.25, HPNodeLayoutGetWidth(root_child0));
  //  ASSERT_FLOAT_EQ(10.25, HPNodeLayoutGetHeight(root_child0));
  //
  //  YGConfigSetPointScaleFactor(config, 1.0f / 3.0f);
  //
  //  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);
  //
  //  ASSERT_FLOAT_EQ(12.0, HPNodeLayoutGetWidth(root_child0));
  //  ASSERT_FLOAT_EQ(12.0, HPNodeLayoutGetHeight(root_child0));

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, rounding_feature_with_custom_measure_func_ceil) {
  const HPNodeRef root = HPNodeNew();

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeSetMeasureFunc(root_child0, _measureCeil);
  //  root_child0->setMeasureFunc(_measureCeil);
  HPNodeInsertChild(root, root_child0, 0);

  //  YGConfigSetPointScaleFactor(config, 1.0f);

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(11, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(11, HPNodeLayoutGetHeight(root_child0));

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, rounding_feature_with_custom_measure_and_fractial_matching_scale) {
  const HPNodeRef root = HPNodeNew();

  //  const HPNodeRef root_child0 = HPNodeNew();
  //  HPNodeStyleSetPosition(root_child0, CSSLeft, 73.625);
  //  root_child0->setMeasureFunc(_measureFractial);
  //  HPNodeInsertChild(root, root_child0, 0);
  //
  //  YGConfigSetPointScaleFactor(config, 2.0f);
  //
  //  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);
  //
  //  ASSERT_FLOAT_EQ(0.5, HPNodeLayoutGetWidth(root_child0));
  //  ASSERT_FLOAT_EQ(0.5, HPNodeLayoutGetHeight(root_child0));
  //  ASSERT_FLOAT_EQ(73.5, HPNodeLayoutGetLeft(root_child0));

  HPNodeFreeRecursive(root);
}
