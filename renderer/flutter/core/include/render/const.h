#pragma once

#include <cstdint>

namespace voltron {

const double kInvalidSize = -1.0;
const int32_t kInvalidId = -1;

constexpr const char* kParentNodeIdKey = "pid";
constexpr const char* kChildIndexKey = "index";
constexpr const char* kClassNameKey = "name";
constexpr const char* kFuncNameKey = "func_name";
constexpr const char* kFunParamsKey = "func_params";
constexpr const char* kFunIdKey = "callback_id";
constexpr const char* kPropsKey = "props";
constexpr const char* kStylesKey = "styles";
constexpr const char* kMoveIdListKey = "move_id";
constexpr const char* kMovePidKey = "move_pid";
}  // namespace voltron
