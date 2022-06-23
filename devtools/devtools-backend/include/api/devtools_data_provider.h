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

#include <memory>
#include "api/adapter/devtools_common_protocol_adapter.h"
#include "api/adapter/devtools_dom_tree_adapter.h"
#include "api/adapter/devtools_memory_adapter.h"
#include "api/adapter/devtools_performance_adapter.h"
#include "api/adapter/devtools_render_tree_adapter.h"
#include "api/adapter/devtools_runtime_adapter.h"
#include "api/adapter/devtools_screen_adapter.h"
#include "api/adapter/devtools_tracing_adapter.h"
#include "api/adapter/devtools_vm_request_adapter.h"

namespace hippy::devtools {
/**
 * @brief Devtools provide a set of adapter interfaces to implement cdp protocol by the external framework,
 * like elements, network, memory, performance, etc
 */
struct DataProvider {
  std::shared_ptr<PerformanceAdapter> performance_adapter;
  std::shared_ptr<MemoryAdapter> memory_adapter;
  std::shared_ptr<ScreenAdapter> screen_adapter;
  std::shared_ptr<TracingAdapter> tracing_adapter;
  std::shared_ptr<VmRequestAdapter> vm_request_adapter;
  std::shared_ptr<DomTreeAdapter> dom_tree_adapter;
  std::shared_ptr<RuntimeAdapter> runtime_adapter;
  std::shared_ptr<RenderTreeAdapter> render_tree_adapter;
  std::shared_ptr<CommonProtocolAdapter> common_protocol_adapter;
};
}  // namespace hippy::devtools
