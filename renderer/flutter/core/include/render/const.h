#pragma once

#include <cstdint>

namespace voltron {

const double kInvalidSize = -1.0;
const int32_t kInvalidId = -1;

constexpr const char* kParentNodeIdKey = "pid";
constexpr const char* kChildIndexKey = "index";
constexpr const char* kClassNameKey = "name";
constexpr const char* kFuncNameKey = "func_name";
constexpr const char* kFuncParamsKey = "func_params";
constexpr const char* kFuncIdKey = "callback_id";
constexpr const char* kPropsKey = "props";
constexpr const char* kStylesKey = "styles";
constexpr const char* kMoveIdListKey = "move_id";
constexpr const char* kMovePidKey = "move_pid";
constexpr const char* kLayoutNodesKey = "layout_nodes";

constexpr const char* kTouchTypeKey = "touch_type";
constexpr const char* kTouchX = "x";
constexpr const char* kTouchY = "y";

constexpr const char* kShowEventKey = "show";

constexpr const char* kCallUiFuncType = "call_ui";
constexpr const char* kAddClickFuncType = "add_click";
constexpr const char* kAddLongClickFuncType = "add_long_click";
constexpr const char* kAddTouchFuncType = "add_touch";
constexpr const char* kAddShowFuncType = "add_show";
constexpr const char* kRemoveClickFuncType = "remove_click";
constexpr const char* kRemoveLongClickFuncType = "remove_long_click";
constexpr const char* kRemoveTouchFuncType = "remove_touch";
constexpr const char* kRemoveShowFuncType = "remove_show";
}  // namespace voltron
