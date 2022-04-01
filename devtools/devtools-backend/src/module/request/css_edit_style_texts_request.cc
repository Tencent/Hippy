//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
//

#include "module/request/css_edit_style_texts_request.h"
#include "module/inspect_props.h"

namespace tdf {
namespace devtools {

void CSSEditStyleTextsRequest::RefreshParams(const std::string& params) {
  auto params_json = nlohmann::json::parse(params);
  if (!params_json.is_object() || params_json.find(kFrontendKeyEdits) == params_json.end()) {
    return;
  }
  edits_ = params_json[kFrontendKeyEdits];
  has_set_edits_ = true;
}

}  // namespace devtools
}  // namespace tdf
