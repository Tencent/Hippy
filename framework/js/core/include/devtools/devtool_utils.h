//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2022/1/19.
//

#pragma once

#ifdef OS_ANDROID
#include "core/runtime/v8/runtime.h"
#else
#include "dom/dom_manager.h"
#include "dom/dom_node.h"
#endif

namespace hippy {
namespace devtools {
class DevToolUtils {
 public:
  static void PostDomTask(int32_t dom_id, std::function<void()> func) {
    std::shared_ptr<DomManager> dom_manager = DomManager::Find(static_cast<int32_t>(dom_id));
    if (dom_manager) {
      dom_manager->PostTask(func);
    }
  }
};
}  // namespace devtools
}  // namespace hippy
