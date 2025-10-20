/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

#include "dom/layout_node.h"
#if defined(LAYOUT_ENGINE_YOGA)
#include "dom/yoga_layout_node.h"
#elif defined(LAYOUT_ENGINE_TAITANK)
#include "dom/taitank_layout_node.h"
#elif defined(LAYOUT_ENGINE_YOGA_AND_TAITANK)
#include "dom/yoga_layout_node.h"
#include "dom/taitank_layout_node.h"
#endif

namespace hippy {
inline namespace dom {

LayoutNode::LayoutNode() = default;

LayoutNode::~LayoutNode() = default;

void InitLayoutConsts(LayoutEngineType type) {
#if defined(LAYOUT_ENGINE_YOGA)
  InitLayoutConstsYoga();
#elif defined(LAYOUT_ENGINE_TAITANK)
  InitLayoutConstsTaitank();
#elif defined(LAYOUT_ENGINE_YOGA_AND_TAITANK)
  if (type == LayoutEngineYoga) {
    InitLayoutConstsYoga();
  } else {
    InitLayoutConstsTaitank();
  }
#endif
}

std::shared_ptr<LayoutNode> CreateLayoutNode(LayoutEngineType type, void* layout_config) {
#if defined(LAYOUT_ENGINE_YOGA)
  return CreateLayoutNodeYoga();
#elif defined(LAYOUT_ENGINE_TAITANK)
  return CreateLayoutNodeTaitank((TaitankConfig*)layout_config);
#elif defined(LAYOUT_ENGINE_YOGA_AND_TAITANK)
  if (type == LayoutEngineYoga) {
    return CreateLayoutNodeYoga();
  } else {
    return CreateLayoutNodeTaitank((TaitankConfig*)layout_config);
  }
#endif
}

void* CreateLayoutConfig(LayoutEngineType type) {
#if defined(LAYOUT_ENGINE_YOGA)
  return nullptr;
#elif defined(LAYOUT_ENGINE_TAITANK)
  return new TaitankConfig();
#elif defined(LAYOUT_ENGINE_YOGA_AND_TAITANK)
  if (type == LayoutEngineYoga) {
    return nullptr;
  } else {
    return new TaitankConfig();
  }
#endif
}

void DestroyLayoutConfig(LayoutEngineType type, void* config) {
  if (!config) {
    return;
  }
#if defined(LAYOUT_ENGINE_YOGA)
#elif defined(LAYOUT_ENGINE_TAITANK)
  TaitankConfig *p = (TaitankConfig*)config;
  delete p;
#elif defined(LAYOUT_ENGINE_YOGA_AND_TAITANK)
  if (type == LayoutEngineYoga) {
  } else {
    TaitankConfig *p = (TaitankConfig*)config;
    delete p;
  }
#endif
}

}  // namespace dom
}  // namespace hippy
