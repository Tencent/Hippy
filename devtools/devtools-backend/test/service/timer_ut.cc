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
#include <unistd.h>
#include "tunnel/timer.h"

namespace tdf {
namespace devtools {

void TimeoutFunction() { std::cout << "test timeout function" << std::endl; }

class TimerTest : public ::testing::Test {
 protected:
  TimerTest() {}
  ~TimerTest() {}

  void SetUp() override {
    std::cout << "set up" << std::endl;
    timer_ = std::make_shared<Timer>(TimeoutFunction, std::chrono::milliseconds(500));
  }
  void TearDown() override { std::cout << "set down" << std::endl; }
  std::shared_ptr<Timer> timer_;
};

TEST_F(TimerTest, Timer) {
  EXPECT_NO_THROW(timer_->Start());
  EXPECT_EQ(timer_->IsRunning(), true);
  sleep(1);
  EXPECT_NO_THROW(timer_->Stop());
  EXPECT_EQ(timer_->IsRunning(), false);
}

}  // namespace devtools
}  // namespace tdf
