//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
//

#pragma once

#include <memory>
#include "api/adapter/devtools_screen_adapter.h"

namespace tdf {
namespace devtools {

/**
 * TDF 基础工具类
 */
class TDFBaseUtil {
 public:
  /**
   * 附加屏幕系数比例
   * @param origin_value 原始值
   * @return 附加后的值
   */
  static double AddScreenScaleFactor(std::shared_ptr<ScreenAdapter> screen_adapter, double origin_value);

  /**
   * 移除屏幕系数比例
   * @param origin_value 原始值
   * @return 移除后的值
   */
  static double RemoveScreenScaleFactor(std::shared_ptr<ScreenAdapter> screen_adapter, double origin_value);
};
}  // namespace devtools
}  // namespace tdf
