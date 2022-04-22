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
#include "module/model/frame_poll_model.h"

namespace tdf {
namespace devtools {

class FramePollModelTest : public ::testing::Test {
 protected:
  FramePollModelTest() {}
  ~FramePollModelTest() {}

  void SetUp() override {
    std::cout << "set up" << std::endl;
    frame_poll_model_ = std::make_shared<FramePollModel>();
  }
  void TearDown() override { std::cout << "set down" << std::endl; }

  std::shared_ptr<FramePollModel> frame_poll_model_;
};

TEST_F(FramePollModelTest, FramePollModel) {
  EXPECT_NO_THROW(frame_poll_model_->SetResponseHandler([]{std::cout << "timeout" << std::endl;}));
  EXPECT_NO_THROW(frame_poll_model_->StartPoll());
//  std::this_thread::sleep_for(std::chrono::duration<int>(2));  // 睡眠导致线程偶现异常
  EXPECT_NO_THROW(frame_poll_model_->StopPoll());
}
}  // namespace devtools
}  // namespace tdf
