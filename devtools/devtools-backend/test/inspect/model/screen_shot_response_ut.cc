/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#include <gtest/gtest.h>
#include <iostream>
#include "module/model/screen_shot_response.h"

namespace hippy::devtools {

class ScreenShotResponseTest : public ::testing::Test {
 protected:
  ScreenShotResponseTest() {}
  ~ScreenShotResponseTest() {}

  void SetUp() override {
    std::cout << "set up" << std::endl;
    screen_shot_response_ = ScreenShotResponse();
  }
  void TearDown() override { std::cout << "set down" << std::endl; }

  ScreenShotResponse screen_shot_response_;
};

TEST_F(ScreenShotResponseTest, ScreenShotResponse) {
  // screen data not empty
  EXPECT_NO_THROW(screen_shot_response_ = ScreenShotResponse("screen_data", 100, 200));
  EXPECT_NO_THROW(screen_shot_response_.ToJsonString());

  // screen data empty
  EXPECT_NO_THROW(screen_shot_response_ = ScreenShotResponse("", 100, 200));
  EXPECT_NO_THROW(screen_shot_response_.ToJsonString());
}
}  // namespace devtools::devtools
