/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#pragma once

#include <string>

#include "api/adapter/devtools_dom_tree_adapter.h"

namespace hippy::devtools {
class HippyDomTreeAdapter : public hippy::devtools::DomTreeAdapter {
 public:
  explicit HippyDomTreeAdapter(int32_t dom_id) : dom_id_(dom_id) {}
  void UpdateDomTree(hippy::devtools::UpdateDomNodeMetas metas, UpdateDomTreeCallback callback) override;
  void GetDomTree(DumpDomTreeCallback callback) override;

 private:
  int32_t dom_id_;
};
}  // namespace hippy::devtools
