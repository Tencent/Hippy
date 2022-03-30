/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#pragma once

#include <cstdint>

namespace voltron {

const double kInvalidSize = -1.0;
const int32_t kInvalidId = -1;

constexpr const char *kParentNodeIdKey = "pid";
constexpr const char *kChildIndexKey = "index";
constexpr const char *kClassNameKey = "name";
constexpr const char *kFuncNameKey = "func_name";
constexpr const char *kFuncParamsKey = "func_params";
constexpr const char *kFuncIdKey = "callback_id";
constexpr const char *kPropsKey = "props";
constexpr const char *kStylesKey = "styles";
constexpr const char *kMoveIdListKey = "move_id";
constexpr const char *kMovePidKey = "move_pid";
constexpr const char *kLayoutNodesKey = "layout_nodes";

constexpr const char *kTouchTypeKey = "touch_type";
constexpr const char *kTouchX = "x";
constexpr const char *kTouchY = "y";

constexpr const char *kShowEventKey = "show";

constexpr const char *kCallUiFuncType = "call_ui";
constexpr const char *kAddClickFuncType = "add_click";
constexpr const char *kAddLongClickFuncType = "add_long_click";
constexpr const char *kAddTouchFuncType = "add_touch";
constexpr const char *kAddShowFuncType = "add_show";
constexpr const char *kRemoveClickFuncType = "remove_click";
constexpr const char *kRemoveLongClickFuncType = "remove_long_click";
constexpr const char *kRemoveTouchFuncType = "remove_touch";
constexpr const char *kRemoveShowFuncType = "remove_show";
} // namespace voltron
