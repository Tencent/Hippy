//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
//

#include "module/request/screen_shot_request.h"
#include "module/inspect_props.h"

namespace tdf {
namespace devtools {

void ScreenShotRequest::RefreshParams(const std::string& params) {
  nlohmann::json params_json = nlohmann::json::parse(params);
  format_ = params_json[kFrontendKeyFormat].get<std::string>();
  quality_ = params_json[kFrontendKeyQuality].get<int32_t>();
  max_width_ = params_json[kFrontendKeyMaxWidth].get<int32_t>();
  max_height_ = params_json[kFrontendKeyMaxHeight].get<int32_t>();
}

}  // namespace devtools
}  // namespace tdf
