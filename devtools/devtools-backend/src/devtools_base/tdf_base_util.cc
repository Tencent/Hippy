//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
//

#include "devtools_base/tdf_base_util.h"
#include "api/devtools_backend_service.h"

namespace tdf {
namespace devtools {

double TDFBaseUtil::AddScreenScaleFactor(std::shared_ptr<ScreenAdapter> screen_adapter, double origin_value) {
  if (!screen_adapter) {
    return 1.f;
  }
  return origin_value * screen_adapter->GetScreenScale();
}

double TDFBaseUtil::RemoveScreenScaleFactor(std::shared_ptr<ScreenAdapter> screen_adapter, double origin_value) {
  if (!screen_adapter || screen_adapter->GetScreenScale() == 0) {
    return 1.f;
  }
  return origin_value / screen_adapter->GetScreenScale();
}
}  // namespace devtools
}  // namespace tdf
