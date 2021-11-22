#pragma once

#include <cstdint>

namespace voltron {

const double kInvalidSize = -1.0;
const int32_t kInvalidId = -1;

constexpr const char* kParentNodeIdKey = "pid_key";
constexpr const char* kChildIndexKey = "index_key";
constexpr const char* kClassNameKey = "name_key";
constexpr const char* kPropsKey = "props_key";
constexpr const char* kStylesKey = "styles_key";
constexpr const char* kMoveIdListKey = "move_ids_key";
constexpr const char* kMovePidKey = "move_pid_key";
}  // namespace voltron
