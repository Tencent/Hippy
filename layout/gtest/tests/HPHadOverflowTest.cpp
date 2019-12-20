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

using namespace ::testing;

class HippyTest_HadOverflowTests : public Test {
 protected:
  HippyTest_HadOverflowTests() {
    root = HPNodeNew();
    HPNodeStyleSetWidth(root, 200);
    HPNodeStyleSetHeight(root, 100);
    HPNodeStyleSetFlexDirection(root, FLexDirectionColumn);
    HPNodeStyleSetFlexWrap(root, FlexNoWrap);
  }

  ~HippyTest_HadOverflowTests() {
    HPNodeFreeRecursive(root);

  }

  HPNodeRef root;
};

TEST_F(HippyTest_HadOverflowTests, children_overflow_no_wrap_and_no_flex_children) {
  const HPNodeRef child0 = HPNodeNew();
  HPNodeStyleSetWidth(child0, 80);
  HPNodeStyleSetHeight(child0, 40);
  HPNodeStyleSetMargin(child0, CSSTop, 10);
  HPNodeStyleSetMargin(child0, CSSBottom, 15);
  HPNodeInsertChild(root, child0, 0);
  const HPNodeRef child1 = HPNodeNew();
  HPNodeStyleSetWidth(child1, 80);
  HPNodeStyleSetHeight(child1, 40);
  HPNodeStyleSetMargin(child1, CSSBottom, 5);
  HPNodeInsertChild(root, child1, 1);

  HPNodeDoLayout(root, 200, 100);

  ASSERT_TRUE(HPNodeLayoutGetHadOverflow(root));
}

TEST_F(HippyTest_HadOverflowTests, spacing_overflow_no_wrap_and_no_flex_children) {
  const HPNodeRef child0 = HPNodeNew();
  HPNodeStyleSetWidth(child0, 80);
  HPNodeStyleSetHeight(child0, 40);
  HPNodeStyleSetMargin(child0, CSSTop, 10);
  HPNodeStyleSetMargin(child0, CSSBottom, 10);
  HPNodeInsertChild(root, child0, 0);
  const HPNodeRef child1 = HPNodeNew();
  HPNodeStyleSetWidth(child1, 80);
  HPNodeStyleSetHeight(child1, 40);
  HPNodeStyleSetMargin(child1, CSSBottom, 5);
  HPNodeInsertChild(root, child1, 1);

  HPNodeDoLayout(root, 200, 100);

  ASSERT_TRUE(HPNodeLayoutGetHadOverflow(root));
}

TEST_F(HippyTest_HadOverflowTests, no_overflow_no_wrap_and_flex_children) {
  const HPNodeRef child0 = HPNodeNew();
  HPNodeStyleSetWidth(child0, 80);
  HPNodeStyleSetHeight(child0, 40);
  HPNodeStyleSetMargin(child0, CSSTop, 10);
  HPNodeStyleSetMargin(child0, CSSBottom, 10);
  HPNodeInsertChild(root, child0, 0);
  const HPNodeRef child1 = HPNodeNew();
  HPNodeStyleSetWidth(child1, 80);
  HPNodeStyleSetHeight(child1, 40);
  HPNodeStyleSetMargin(child1, CSSBottom, 5);
  HPNodeStyleSetFlexShrink(child1, 1);
  HPNodeInsertChild(root, child1, 1);

  HPNodeDoLayout(root, 200, 100);

  ASSERT_FALSE(HPNodeLayoutGetHadOverflow(root));
}

TEST_F(HippyTest_HadOverflowTests, hadOverflow_gets_reset_if_not_logger_valid) {
  const HPNodeRef child0 = HPNodeNew();
  HPNodeStyleSetWidth(child0, 80);
  HPNodeStyleSetHeight(child0, 40);
  HPNodeStyleSetMargin(child0, CSSTop, 10);
  HPNodeStyleSetMargin(child0, CSSBottom, 10);
  HPNodeInsertChild(root, child0, 0);
  const HPNodeRef child1 = HPNodeNew();
  HPNodeStyleSetWidth(child1, 80);
  HPNodeStyleSetHeight(child1, 40);
  HPNodeStyleSetMargin(child1, CSSBottom, 5);
  HPNodeInsertChild(root, child1, 1);

  HPNodeDoLayout(root, 200, 100);

  ASSERT_TRUE(HPNodeLayoutGetHadOverflow(root));

  HPNodeStyleSetFlexShrink(child1, 1);

  HPNodeDoLayout(root, 200, 100);
  ASSERT_FALSE(HPNodeLayoutGetHadOverflow(root));
}

TEST_F(HippyTest_HadOverflowTests, spacing_overflow_in_nested_nodes) {
  const HPNodeRef child0 = HPNodeNew();
  HPNodeStyleSetWidth(child0, 80);
  HPNodeStyleSetHeight(child0, 40);
  HPNodeStyleSetMargin(child0, CSSTop, 10);
  HPNodeStyleSetMargin(child0, CSSBottom, 10);
  HPNodeInsertChild(root, child0, 0);
  const HPNodeRef child1 = HPNodeNew();
  HPNodeStyleSetWidth(child1, 80);
  HPNodeStyleSetHeight(child1, 40);
  HPNodeInsertChild(root, child1, 1);
  const HPNodeRef child1_1 = HPNodeNew();
  HPNodeStyleSetWidth(child1_1, 80);
  HPNodeStyleSetHeight(child1_1, 40);
  HPNodeStyleSetMargin(child1_1, CSSBottom, 5);
  HPNodeInsertChild(child1, child1_1, 0);

  HPNodeDoLayout(root, 200, 100);

  ASSERT_TRUE(HPNodeLayoutGetHadOverflow(root));
}
