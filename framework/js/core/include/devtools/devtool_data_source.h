//
//  Copyright (c) 2021 Tencent Corporation. All rights reserved.
//  Created by thomasyqguo on 2022/1/18.
//

#pragma once

//#if TDF_SERVICE_ENABLED

#include <memory>
#include <string>
#ifdef OS_ANDROID
#include "v8/libplatform/v8-tracing.h"
#endif
#include "core/engine.h"
#include "core/task/worker_task_runner.h"
#include "devtools/adapter/hippy_runtime_adapter.h"
#include "devtools/adapter/hippy_v8_request_adapter.h"
#include "api/devtools_backend_service.h"
#include "module/record_logger.h"

namespace hippy {
namespace devtools {

/**
 * @brief Devtools JSDelegate 的 Hippy 实现
 */
class DevtoolDataSource : public std::enable_shared_from_this<hippy::devtools::DevtoolDataSource> {
 public:
  DevtoolDataSource() {
    devtools_service_ = std::make_shared<tdf::devtools::DevtoolsBackendService>();
    all_services.push_back(devtools_service_);
  }
  ~DevtoolDataSource() = default;

  void Bind(int32_t dom_id, int32_t runtime_id);
  void SetRuntimeAdapterDebugMode(bool debug_mode);

#ifdef OS_ANDROID
  static void OnGlobalTracingControlGenerate(v8::platform::tracing::TracingController* tracingControl);
  static void SetFileCacheDir(std::string file_dir);
#endif

  void SetV8RequestHandler(HippyV8RequestAdapter::V8RequestHandler request_handler);

  static void SendV8Response(std::string data);

 private:
  int32_t dom_id_;
  int32_t runtime_id_;
  std::shared_ptr<HippyRuntimeAdapter> runtime_adapter_;
  std::shared_ptr<tdf::devtools::DevtoolsBackendService> devtools_service_;
  static std::vector<std::weak_ptr<tdf::devtools::DevtoolsBackendService>> all_services;
};

}  // namespace devtools
}  // namespace hippy

//#endif
