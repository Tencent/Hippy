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

#include "common_header.h"

namespace voltron {

enum VoltronRenderOpType {
  ADD_NODE,
  DELETE_NODE,
  // update node中内部的衍生操作
  RECOMBINE_NODE,
  MOVE_NODE,
  UPDATE_NODE,
  UPDATE_LAYOUT,
  BATCH,
  DISPATCH_UI_FUNC,
  ADD_EVENT,
  REMOVE_EVENT,
};

} // namespace voltron
