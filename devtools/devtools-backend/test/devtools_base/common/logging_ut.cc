
// Copyright (c) 2021. Tencent Corporation. All rights reserved.

// Created by sicilyliu on 2021/10/29.
//
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

namespace tdf {
namespace devtools {

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

}  // namespace devtools
}  // namespace tdf
