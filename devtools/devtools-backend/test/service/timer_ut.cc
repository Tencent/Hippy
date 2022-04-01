
// Copyright (c) 2021. Tencent Corporation. All rights reserved.

// Created by sicilyliu on 2021/11/3.
//
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
