
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
#include <gmock/gmock.h>
#include <gtest/gtest.h>
#include <chrono>
#include <list>
#include <memory>
#include <sstream>
#include "devtools_base/logging.h"
#include "devtools_base/time.h"

#ifdef OS_ANDROID
#  include <android/log.h>
#else
#endif

namespace hippy::devtools {

class LoggerTest : public ::testing::Test {
 protected:
  LoggerTest() {}
  ~LoggerTest() {}

  void SetUp() override {
    std::cout << "set up" << std::endl;
    logger_ = std::make_shared<Logger>();
    log_callback_ = [](LoggerModel logger_model) {};
    steady_clock_time_ = std::make_shared<SteadyClockTime>();
  }
  void TearDown() override { std::cout << "set down" << std::endl; }

  std::shared_ptr<Logger> logger_;
  std::shared_ptr<SteadyClockTime> steady_clock_time_;
  LogCallback log_callback_;
};

TEST_F(LoggerTest, Logger) {
  EXPECT_NO_THROW(logger_->RegisterCallback(log_callback_));
  EXPECT_NO_THROW(logger_->GetTimeStamp());
  EXPECT_NO_THROW(BACKEND_LOGD("module", "HandleScreencastFrameAck params:%s", "ss"));
  EXPECT_NO_THROW(BACKEND_LOGI("", "HandleScreencastFrameAck params:%s", "ss"));
  EXPECT_NO_THROW(BACKEND_LOGW("module", "format"));
  EXPECT_NO_THROW(logger_->Log(DEVTOOLS_LOG_FATAL, __FILE__, __LINE__, "module", ""));
  EXPECT_NO_THROW(logger_->Log(99, __FILE__, __LINE__, "module", "format"));
  steady_clock_time_->NowTimeSinceEpoch(SteadyClockTime::TimeUnit::kNanoSeconds);
}

}  // namespace devtools::devtools
