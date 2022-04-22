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
#include "api/adapter/devtools_elements_request_adapter.h"
#include "api/adapter/devtools_memory_adapter.h"
#include "api/adapter/devtools_network_adapter.h"
#include "api/adapter/devtools_performance_adapter.h"
#include "api/adapter/devtools_render_tree_adapter.h"
#include "api/adapter/devtools_runtime_adapter.h"
#include "api/adapter/devtools_screen_adapter.h"
#include "api/adapter/devtools_tracing_adapter.h"
#include "api/adapter/devtools_v8_request_adapter.h"

namespace tdf {
namespace devtools {
/**
 * devtools调试所需功能数据，由外部框架实现各个功能adapter，并注入
 */
class DataProvider {
 public:
  std::shared_ptr<PerformanceAdapter> GetPerformanceAdapter() { return performance_adapter_; }
  std::shared_ptr<MemoryAdapter> GetMemoryAdapter() { return memory_adapter_; }
  std::shared_ptr<ScreenAdapter> GetScreenAdapter() { return screen_adapter_; }
  std::shared_ptr<TracingAdapter> GetTracingAdapter() { return tracing_adapter_; }
  std::shared_ptr<V8RequestAdapter> GetV8RequestAdapter() { return v8_request_adapter_; }
  std::shared_ptr<ElementsRequestAdapter> GetElementsRequestAdapter() { return elements_request_adapter_; }
  std::shared_ptr<DomTreeAdapter> GetDomTreeAdapter() { return dom_tree_adapter_; }
  std::shared_ptr<RuntimeAdapter> GetRuntimeAdapter() { return runtime_adapter_; }
  std::shared_ptr<RenderTreeAdapter> GetRenderTreeAdapter() { return render_tree_adapter_; }
  std::shared_ptr<CommonProtocolAdapter> GetCommonProtocolAdapter() { return common_protocol_adapter_; }
  std::shared_ptr<NetworkAdapter> GetNetworkAdapter() { return network_adapter_; }

  void SetMemoryAdapter(std::shared_ptr<MemoryAdapter> memory_adapter) { memory_adapter_ = memory_adapter; }
  void SetScreenAdapter(std::shared_ptr<ScreenAdapter> screen_adapter) { screen_adapter_ = screen_adapter; }
  void SetDomTreeAdapter(std::shared_ptr<DomTreeAdapter> dom_tree_adapter) { dom_tree_adapter_ = dom_tree_adapter; }
  void SetTracingAdapter(std::shared_ptr<TracingAdapter> tracing_adapter) { tracing_adapter_ = tracing_adapter; }
  void SetRuntimeAdapter(std::shared_ptr<RuntimeAdapter> runtime_adapter) { runtime_adapter_ = runtime_adapter; }
  void SetPerformanceAdapter(std::shared_ptr<PerformanceAdapter> performance_adapter) {
    performance_adapter_ = performance_adapter;
  }
  void SetV8RequestAdapter(std::shared_ptr<V8RequestAdapter> v8_request_adapter) {
    v8_request_adapter_ = v8_request_adapter;
  }
  void SetElementsRequestAdapter(std::shared_ptr<ElementsRequestAdapter> elements_request_adapter) {
    elements_request_adapter_ = elements_request_adapter;
  }
  void SetRenderTreeAdapter(std::shared_ptr<RenderTreeAdapter> render_tree_adapter) {
    render_tree_adapter_ = render_tree_adapter;
  }
  void SetElementsRequestAdapter(std::shared_ptr<RuntimeAdapter> dom_tree_adapter) {
    runtime_adapter_ = dom_tree_adapter;
  }
  void SetCommonProtocolAdapter(std::shared_ptr<CommonProtocolAdapter> common_protocol_adapter) {
    common_protocol_adapter_ = common_protocol_adapter;
  }
  void SetNetworkAdapter(std::shared_ptr<NetworkAdapter> network_adapter) { network_adapter_ = network_adapter; }

 private:
  std::shared_ptr<PerformanceAdapter> performance_adapter_;
  std::shared_ptr<MemoryAdapter> memory_adapter_;
  std::shared_ptr<ScreenAdapter> screen_adapter_;
  std::shared_ptr<TracingAdapter> tracing_adapter_;
  std::shared_ptr<V8RequestAdapter> v8_request_adapter_;
  std::shared_ptr<ElementsRequestAdapter> elements_request_adapter_;
  std::shared_ptr<DomTreeAdapter> dom_tree_adapter_;
  std::shared_ptr<RuntimeAdapter> runtime_adapter_;
  std::shared_ptr<RenderTreeAdapter> render_tree_adapter_;
  std::shared_ptr<CommonProtocolAdapter> common_protocol_adapter_;
  std::shared_ptr<NetworkAdapter> network_adapter_;
};
}  // namespace devtools
}  // namespace tdf
