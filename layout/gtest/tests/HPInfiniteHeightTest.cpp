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

// This test isn't correct from the Flexbox standard standpoint,
// because percentages are calculated with parent constraints.
// However, we need to make sure we fail gracefully in this case, not returning NaN
TEST(HippyTest, percent_absolute_position_infinite_height) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetWidth(root, 300);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 300);
  HPNodeStyleSetHeight(root_child0, 300);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetPositionType(root_child1, PositionTypeAbsolute);
  HPNodeStyleSetPosition(root_child1, CSSLeft, 60);
  HPNodeStyleSetPosition(root_child1, CSSTop, 0);
  HPNodeStyleSetWidth(root_child1, 60);
  //  HPNodeStyleSetHeight(root_child1, 0);
  HPNodeInsertChild(root, root_child1, 1);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root));
  ASSERT_FLOAT_EQ(300, HPNodeLayoutGetWidth(root));
  ASSERT_FLOAT_EQ(300, HPNodeLayoutGetHeight(root));

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(300, HPNodeLayoutGetWidth(root_child0));
  ASSERT_FLOAT_EQ(300, HPNodeLayoutGetHeight(root_child0));

  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetLeft(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetTop(root_child1));
  ASSERT_FLOAT_EQ(60, HPNodeLayoutGetWidth(root_child1));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(root_child1));

  HPNodeFreeRecursive(root);
}
