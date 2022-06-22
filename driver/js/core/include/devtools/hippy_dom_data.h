//
// Created by ivanfanwu on 2022/6/22.
//

#pragma once

#include "dom/root_node.h"

namespace hippy::devtools {
struct HippyDomData {
  int32_t dom_id;
  std::weak_ptr<RootNode> root_node;
};
}  // namespace hippy::devtools