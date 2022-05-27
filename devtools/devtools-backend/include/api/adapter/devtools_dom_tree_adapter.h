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
#include "api/adapter/data/dom_node_metas.h"
#include "api/adapter/data/update_dom_node_metas.h"

namespace hippy::devtools {
/**
 * Dom node tree data adapter, get or update dom node interface declare
 * @see https://chromedevtools.github.io/devtools-protocol/tot/DOM/
 */
class DomTreeAdapter {
 public:
  using DumpDomTreeCallback = std::function<void(const bool is_success, const DomNodeMetas& metas)>;
  using UpdateDomTreeCallback = std::function<void(const bool is_success)>;

   /**
    * @brief update current page dom node tree
    * @param metas dom node properties metas
    * @param callback  finish callback
    */
  virtual void UpdateDomTree(UpdateDomNodeMetas metas, UpdateDomTreeCallback callback) = 0;

  /**
   * get current page dom node tree
   * @param callback finish callback
   */
  virtual void GetDomTree(DumpDomTreeCallback callback) = 0;
  virtual ~DomTreeAdapter() {}
};
}  // namespace hippy::devtools
