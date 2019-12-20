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

TEST(HippyTest, dirty_propagation) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetAlignItems(root, FlexAlignStart);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 50);
  HPNodeStyleSetHeight(root_child0, 20);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 50);
  HPNodeStyleSetHeight(root_child1, 20);
  HPNodeInsertChild(root, root_child1, 1);

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  HPNodeStyleSetWidth(root_child0, 20);

  EXPECT_TRUE(root_child0->isDirty);
  EXPECT_FALSE(root_child1->isDirty);
  EXPECT_TRUE(root->isDirty);

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  EXPECT_FALSE(root_child0->isDirty);
  EXPECT_FALSE(root_child1->isDirty);
  EXPECT_FALSE(root->isDirty);

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, dirty_propagation_only_if_prop_changed) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetAlignItems(root, FlexAlignStart);
  HPNodeStyleSetWidth(root, 100);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 50);
  HPNodeStyleSetHeight(root_child0, 20);
  HPNodeInsertChild(root, root_child0, 0);

  const HPNodeRef root_child1 = HPNodeNew();
  HPNodeStyleSetWidth(root_child1, 50);
  HPNodeStyleSetHeight(root_child1, 20);
  HPNodeInsertChild(root, root_child1, 1);

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  HPNodeStyleSetWidth(root_child0, 50);

  EXPECT_FALSE(root_child0->isDirty);
  EXPECT_FALSE(root_child1->isDirty);
  EXPECT_FALSE(root->isDirty);

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, dirty_mark_all_children_as_dirty_when_display_changes) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetFlexDirection(root, FLexDirectionRow);
  HPNodeStyleSetHeight(root, 100);

  const HPNodeRef child0 = HPNodeNew();
  HPNodeStyleSetFlexGrow(child0, 1);
  const HPNodeRef child1 = HPNodeNew();
  HPNodeStyleSetFlexGrow(child1, 1);

  const HPNodeRef child1_child0 = HPNodeNew();
  const HPNodeRef child1_child0_child0 = HPNodeNew();
  HPNodeStyleSetWidth(child1_child0_child0, 8);
  HPNodeStyleSetHeight(child1_child0_child0, 16);

  HPNodeInsertChild(child1_child0, child1_child0_child0, 0);

  HPNodeInsertChild(child1, child1_child0, 0);
  HPNodeInsertChild(root, child0, 0);
  HPNodeInsertChild(root, child1, 0);

  HPNodeStyleSetDisplay(child0, DisplayTypeFlex);
  HPNodeStyleSetDisplay(child1, DisplayTypeNone);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(child1_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(child1_child0_child0));

  HPNodeStyleSetDisplay(child0, DisplayTypeNone);
  HPNodeStyleSetDisplay(child1, DisplayTypeFlex);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);
  ASSERT_FLOAT_EQ(8, HPNodeLayoutGetWidth(child1_child0_child0));
  ASSERT_FLOAT_EQ(16, HPNodeLayoutGetHeight(child1_child0_child0));

  HPNodeStyleSetDisplay(child0, DisplayTypeFlex);
  HPNodeStyleSetDisplay(child1, DisplayTypeNone);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetWidth(child1_child0_child0));
  ASSERT_FLOAT_EQ(0, HPNodeLayoutGetHeight(child1_child0_child0));

  HPNodeStyleSetDisplay(child0, DisplayTypeNone);
  HPNodeStyleSetDisplay(child1, DisplayTypeFlex);
  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);
  ASSERT_FLOAT_EQ(8, HPNodeLayoutGetWidth(child1_child0_child0));
  ASSERT_FLOAT_EQ(16, HPNodeLayoutGetHeight(child1_child0_child0));

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, dirty_node_only_if_children_are_actually_removed) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetAlignItems(root, FlexAlignStart);
  HPNodeStyleSetWidth(root, 50);
  HPNodeStyleSetHeight(root, 50);

  const HPNodeRef child0 = HPNodeNew();
  HPNodeStyleSetWidth(child0, 50);
  HPNodeStyleSetHeight(child0, 25);
  HPNodeInsertChild(root, child0, 0);

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  const HPNodeRef child1 = HPNodeNew();
  HPNodeRemoveChild(root, child1);
  EXPECT_FALSE(root->isDirty);
  HPNodeFree(child1);

  HPNodeRemoveChild(root, child0);
  EXPECT_TRUE(root->isDirty);
  HPNodeFree(child0);

  HPNodeFreeRecursive(root);
}

TEST(HippyTest, dirty_node_only_if_undefined_values_gets_set_to_undefined) {
  const HPNodeRef root = HPNodeNew();
  HPNodeStyleSetWidth(root, 50);
  HPNodeStyleSetHeight(root, 50);
  HPNodeStyleSetMinWidth(root, VALUE_UNDEFINED);

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  EXPECT_FALSE(root->isDirty);

  HPNodeStyleSetMinWidth(root, VALUE_UNDEFINED);

  EXPECT_FALSE(root->isDirty);

  HPNodeFreeRecursive(root);
}
