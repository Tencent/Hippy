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

TEST(HippyTest, start_overrides) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0, 1);
  HPNodeStyleSetMargin(root_child0, CSSStart, 10);
  HPNodeStyleSetMargin(root_child0, CSSEnd, 20);
  HPNodeInsertChild(root, root_child0, 0);

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetRight(root_child0));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetRight(root_child0));

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, end_overrides) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0, 1);
  HPNodeStyleSetMargin(root_child0, CSSStart, 20);
  HPNodeStyleSetMargin(root_child0, CSSEnd, 10);
  HPNodeInsertChild(root, root_child0, 0);

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetRight(root_child0));

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED, DirectionRTL);
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetRight(root_child0));

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, horizontal_overridden) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0, 1);
  HPNodeStyleSetMargin(root_child0, CSSHorizontal, 10);
  HPNodeStyleSetMargin(root_child0, CSSLeft, 20);
  HPNodeInsertChild(root, root_child0, 0);

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetRight(root_child0));

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, vertical_overridden) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionColumn);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0, 1);
  HPNodeStyleSetMargin(root_child0, CSSVertical, 10);
  HPNodeStyleSetMargin(root_child0, CSSTop, 20);
  HPNodeInsertChild(root, root_child0, 0);

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetBottom(root_child0));

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, horizontal_overrides_all) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionColumn);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0, 1);
  HPNodeStyleSetMargin(root_child0, CSSHorizontal, 10);
  HPNodeStyleSetMargin(root_child0, CSSAll, 20);
  HPNodeInsertChild(root, root_child0, 0);

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetRight(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetBottom(root_child0));

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, vertical_overrides_all) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionColumn);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0, 1);
  HPNodeStyleSetMargin(root_child0, CSSVertical, 10);
  HPNodeStyleSetMargin(root_child0, CSSAll, 20);
  HPNodeInsertChild(root, root_child0, 0);

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(20, HPNodeLayoutGetRight(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetBottom(root_child0));

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, all_overridden) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionColumn);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(root_child0, 1);
  HPNodeStyleSetMargin(root_child0, CSSLeft, 10);
  HPNodeStyleSetMargin(root_child0, CSSTop, 10);
  HPNodeStyleSetMargin(root_child0, CSSRight, 10);
  HPNodeStyleSetMargin(root_child0, CSSBottom, 10);
  HPNodeStyleSetMargin(root_child0, CSSAll, 20);
  HPNodeInsertChild(root, root_child0, 0);

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetLeft(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetTop(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetRight(root_child0));
  ASSERT_FLOAT_EQ(10, HPNodeLayoutGetBottom(root_child0));

  HPNodeFreeRecursive(root);
}
