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
#include <functional>
#include <iostream>
#include <sstream>
#include <string>
#include <utility>
#include <vector>
#include "module/record_logger.h"
#include "nlohmann/json.hpp"

namespace hippy::devtools {
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

  logger_model_.source = hippy::devtools::DEVTOOLS_BACKEND_SOURCE;
  logger_model_.module = "module_name";
  logger_model_.level = "level_name";
  logger_model_.file_name = "file_stream";
  logger_model_.line_number = 20;
  logger_model_.time_stamp = 20;
  EXPECT_NO_THROW(record_logger_->RecordLogData(logger_model_));
}
}  // namespace hippy::devtools
