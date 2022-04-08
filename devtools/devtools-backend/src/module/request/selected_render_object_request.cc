//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
//

#include "module/request/selected_render_object_request.h"
#include "module/inspect_props.h"

namespace tdf {
namespace devtools {

void SelectedRenderObjectRequest::RefreshParams(const std::string& params) {
  nlohmann::json params_json = nlohmann::json::parse(params);
  int32_t render_id = params_json[kFrontendKeyId];
  render_id_ = render_id;
}

}  // namespace devtools
}  // namespace tdf
