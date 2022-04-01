//
// Copyright (c) 2022 Tencent Corporation. All rights reserved.
//

#include "api/adapter/data/update_dom_node_metas.h"

namespace tdf {
namespace devtools {

bool CSSStyleMetas::IsDouble() const noexcept { return type_ == Type::kDouble; }

bool CSSStyleMetas::IsString() const noexcept { return type_ == Type::kString; }

std::string CSSStyleMetas::ToString() { return IsString() ? string_value_ : ""; }

double CSSStyleMetas::ToDouble() { return IsDouble() ? double_value_ : 0.f; }

}  // namespace devtools
}  // namespace tdf
