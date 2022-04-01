//
// Copyright (c) 2021. Tencent Corporation. All rights reserved.
//

#include <gtest/gtest.h>
#include <iostream>
#include "module/model/screen_shot_response.h"

namespace tdf {
namespace devtools {

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
}  // namespace devtools
}  // namespace tdf
