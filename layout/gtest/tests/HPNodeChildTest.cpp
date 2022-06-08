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

TEST(HippyTest, reset_layout_when_child_removed) {
  const HPNodeRef root = HPNodeNew();

  const HPNodeRef root_child0 = HPNodeNew();
  HPNodeStyleSetWidth(root_child0, 100);
  HPNodeStyleSetHeight(root_child0, 100);
  HPNodeInsertChild(root, root_child0, 0);

  HPNodeDoLayout(root, VALUE_UNDEFINED, VALUE_UNDEFINED);

  ASSERT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_EQ(100, HPNodeLayoutGetWidth(root_child0));
  ASSERT_EQ(100, HPNodeLayoutGetHeight(root_child0));

  HPNodeRemoveChild(root, root_child0);

  ASSERT_EQ(0, HPNodeLayoutGetLeft(root_child0));
  ASSERT_EQ(0, HPNodeLayoutGetTop(root_child0));
  ASSERT_TRUE(isUndefined(HPNodeLayoutGetWidth(root_child0)));
  ASSERT_TRUE(isUndefined(HPNodeLayoutGetHeight(root_child0)));

  HPNodeFreeRecursive(root);
}
