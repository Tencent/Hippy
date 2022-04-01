
// Copyright (c) 2021. Tencent Corporation. All rights reserved.

// Created by sicilyliu on 2021/10/15.
//
#include <gmock/gmock.h>
#include <gtest/gtest.h>
#include <functional>
#include <iostream>
#include <sstream>
#include <string>
#include <utility>
#include <vector>
#include "module/record_logger.h"
#include "nlohmann/json.hpp"

namespace tdf {
namespace devtools {
using json = nlohmann::json;

class RecordLoggerTest : public ::testing::Test {
 protected:
  RecordLoggerTest() {}
  ~RecordLoggerTest() {}

  void SetUp() override {
    std::cout << "set up" << std::endl;
    record_logger_ = std::make_shared<RecordLogger>();
    operate_callback_ = [](const std::string& log) { std::cout << "test callback" << std::endl; };
  }
  void TearDown() override { std::cout << "set down" << std::endl; }

  std::vector<std::string> record_logs_;
  RecordLogOperateCallback operate_callback_;
  uint32_t max_number_of_logs_ = 0;
  std::shared_ptr<RecordLogger> record_logger_;
  LoggerModel logger_model_;
};

TEST_F(RecordLoggerTest, RecordLogger) {
  EXPECT_NO_THROW(record_logger_->SetMaxNumberOfLogs(max_number_of_logs_));
  EXPECT_NO_THROW(record_logger_->SetRecordLogOperateCallback(operate_callback_));

  logger_model_.source = tdf::devtools::DEVTOOLS_BACKEND_SOURCE;
  logger_model_.module = "module_name";
  logger_model_.level = "level_name";
  logger_model_.file_name = "file_stream";
  logger_model_.line_number = 20;
  logger_model_.time_stamp = 20;
  EXPECT_NO_THROW(record_logger_->RecordLogData(logger_model_));
}
}  // namespace devtools
}  // namespace tdf
