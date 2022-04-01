//
// Copyright (c) 2021. Tencent Corporation. All rights reserved.
//

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
