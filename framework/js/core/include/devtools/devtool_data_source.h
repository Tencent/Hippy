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
#include "devtools_backend/devtools_backend_service.h"
#include "module/record_logger.h"

namespace hippy {
namespace devtools {

/**
 * @brief Devtools JSDelegate 的 Hippy 实现
 */
class DevtoolDataSource : public std::enable_shared_from_this<hippy::devtools::DevtoolDataSource> {
 public:
  DevtoolDataSource() { tdf::devtools::DevtoolsBackendService::GetInstance(); }
  ~DevtoolDataSource() = default;

  void Bind(int32_t dom_id, int32_t runtime_id);
  void SetRuntimeAdapterDebugMode(bool debug_mode);

#ifdef OS_ANDROID
  static void OnGlobalTracingControlGenerate(v8::platform::tracing::TracingController* tracingControl);
#endif

  void SetV8RequestHandler(HippyV8RequestAdapter::V8RequestHandler request_handler);

  static void SendV8Response(std::string data);

  /**
   * @brief 设置是否通知 batch 事件
   * @param need_notify_batch_event
   */
  void SetNeedNotifyBatchEvent(bool need_notify_batch_event);
  void NotifyDocumentUpdate();

  /**
   * @brief 获取当前 runtime_id 的 JSDelegate 实现
   * @return JSDelegate 可能为空
   */
  static std::shared_ptr<DevtoolDataSource> GetDevToolsJSDelegate();

 private:
  int32_t dom_id_;
  int32_t runtime_id_;
  std::shared_ptr<HippyRuntimeAdapter> runtime_adapter_;
};

}  // namespace devtools
}  // namespace hippy

//#endif
