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
#include "module/model/tdf_inspector_model.h"

namespace hippy {
namespace devtools {

class TDFInspectorModelTest : public ::testing::Test {
 protected:
  TDFInspectorModelTest() {}
  ~TDFInspectorModelTest() {}

  void SetUp() override {
    std::cout << "set up" << std::endl;
    tdf_inspector_model_ = TDFInspectorModel();
  }
  void TearDown() override { std::cout << "set down" << std::endl; }

  TDFInspectorModel tdf_inspector_model_;
};

TEST_F(TDFInspectorModelTest, TDFInspectorModel) { EXPECT_NO_THROW(tdf_inspector_model_.GetRenderTree("render_tree")); }
}  // namespace devtools
}  // namespace hippy
