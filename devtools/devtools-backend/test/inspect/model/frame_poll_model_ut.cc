//
// Copyright (c) 2021. Tencent Corporation. All rights reserved.
//

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
