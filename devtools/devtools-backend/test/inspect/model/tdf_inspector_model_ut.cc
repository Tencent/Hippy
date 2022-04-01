//
// Copyright (c) 2021. Tencent Corporation. All rights reserved.
//

#include <gtest/gtest.h>
#include <iostream>
#include "module/model/tdf_inspector_model.h"

namespace tdf {
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
}  // namespace tdf
