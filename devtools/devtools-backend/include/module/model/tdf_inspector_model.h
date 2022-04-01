//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by ivanfanwu on 2021/9/16.
//

#pragma once

#include <string>

namespace tdf {
namespace devtools {

/**
 * @brief UI 调试 model
 */
class TDFInspectorModel {
 public:
  std::string GetRenderTree(const std::string& render_tree);
};

}  // namespace devtools
}  // namespace tdf
