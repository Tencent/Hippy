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
#include "module/model/screen_shot_model.h"

namespace tdf {
namespace devtools {

class ScreenShotModelTest : public ::testing::Test {
 protected:
  ScreenShotModelTest() {}
  ~ScreenShotModelTest() {}

  void SetUp() override {
    std::cout << "set up" << std::endl;
    screen_shot_model_ = ScreenShotModel();
  }
  void TearDown() override { std::cout << "set down" << std::endl; }

  ScreenShotModel screen_shot_model_;
};

TEST_F(ScreenShotModelTest, ScreenShotModel) {
  auto screen_shot_callback = ScreenShotModel::ScreenShotCallback(
      [](ScreenShotResponse&& response) { std::string result = response.ToJsonString(); });
  EXPECT_NO_THROW(screen_shot_model_.SetResponseScreenShotCallback(screen_shot_callback));
  EXPECT_NO_THROW(screen_shot_model_.SetSendEventScreenShotCallback(screen_shot_callback));
  ScreenShotRequest request;
  EXPECT_NO_THROW(screen_shot_model_.SetScreenShotRequest(request));
  EXPECT_NO_THROW(screen_shot_model_.ReqScreenShotToResponse());
  EXPECT_NO_THROW(screen_shot_model_.ReqScreenShotToSendEvent());
}
}  // namespace devtools
}  // namespace tdf
