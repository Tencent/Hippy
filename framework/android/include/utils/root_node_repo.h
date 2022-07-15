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

#include "dom/root_node.h"

namespace framework {
namespace utils {

using RootNode = hippy::dom::RootNode;

class RootNodeRepo {
 public:
  static void Insert(const std::shared_ptr<RootNode>& root_node);

  static std::shared_ptr<RootNode> Find(uint32_t id);

  static bool Erase(uint32_t id);
};

}  // namespace utils
}  // namespace framework