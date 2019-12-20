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

TEST(HippyTest, zero_out_layout) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetWidth(root, 200);
  HPNodeStyleSetHeight(root, 200);

  const HPNodeRef child = HPNodeNew();
  HPNodeInsertChild(root, child, 0);
  HPNodeStyleSetWidth(child, 100);
  HPNodeStyleSetHeight(child, 100);
  HPNodeStyleSetMargin(child, CSSTop, 10);
  HPNodeStyleSetPadding(child, CSSTop, 10);

  HPNodeDoLayout(root, 100, 100);

  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetMargin(child, CSSTop));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetPadding(child, CSSTop));

  HPNodeStyleSetDisplay(child, DisplayTypeNone);

  HPNodeDoLayout(root, 100, 100);

  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetMargin(child, CSSTop));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetPadding(child, CSSTop));

  HPNodeFreeRecursive(root);
}
