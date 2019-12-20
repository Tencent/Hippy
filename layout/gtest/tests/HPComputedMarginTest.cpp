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

TEST(HippyTest, computed_layout_margin) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);
  //HPNodeStyleSetMarginPercent(root, CSSStart, 10);
  //TODO:: not support percent. ianwang .2018.01.13
  HPNodeStyleSetMargin(root, CSSStart, 10);

  HPNodeDoLayout(root, 100, 100);

  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetMargin(root, CSSLeft));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetMargin(root, CSSRight));

  HPNodeDoLayout(root, 100, 100, DirectionRTL);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetMargin(root, CSSLeft));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetMargin(root, CSSRight));

  HPNodeFreeRecursive(root);
}
