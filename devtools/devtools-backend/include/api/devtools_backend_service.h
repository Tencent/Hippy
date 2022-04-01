//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
//

#pragma once
#include <iostream>
#include <memory>
#include <string>
#include "api/devtools_config.h"
#include "api/devtools_data_channel.h"
#include "api/devtools_data_provider.h"
#include "api/devtools_notification_center.h"
#include "devtools_base/common/task_runner.h"
#include "devtools_base/common/worker_pool.h"
#include "module/record_logger.h"
#include "tunnel/tunnel_service.h"

namespace tdf {
namespace devtools {
/**
 * @brief Devtools Backend Service 调试后端服务，主要负责 Devtools 的调试通道搭建、调试协议分发和接入框架的数据采集
 * 作为接入方，需要关心的是：DataProvider 实现 Adapter 能力的实现
 */
class DevtoolsBackendService: public std::enable_shared_from_this<DevtoolsBackendService> {
 public:
  /**
   * @brief 构造 Devtools 实例
   * @param devtools_config Devtools 参数
   */
  explicit DevtoolsBackendService(const DevtoolsConfig& devtools_config);

  ~DevtoolsBackendService();

  /**
   * @brief 销毁调试实例
   * @param is_reload 是否重新加载，重新加载的销毁调试器会进行复用
   */
  void Destroy(bool is_reload);

  /**
   * devtools所需数据源
   * @return 数据提供源对象
   */
  std::shared_ptr<DataProvider> GetDataProvider() { return data_channel_->GetProvider(); }

  /**
   * devtools所需数据源
   * @return 数据提供源对象
   */
  std::shared_ptr<NotificationCenter> GetNotificationCenter() { return data_channel_->GetNotificationCenter(); }

  /**
   * 获取当前 Task Runner
   */
  std::shared_ptr<TaskRunner> GetTaskRunner() { return task_runner_; }

 private:
  /**
   * @brief 注册 JS 相关回调
   */
  void RegisterJSDebuggerCallback();

  /**
   * @brief 注册日志相关回调
   */
  void RegisterLogCallback();

  std::shared_ptr<RecordLogger> record_logger_ = std::make_shared<RecordLogger>();
  std::shared_ptr<WorkerPool> worker_pool_ = std::make_shared<WorkerPool>(0);
  std::shared_ptr<TaskRunner> task_runner_ = nullptr;
  std::shared_ptr<DataChannel> data_channel_;
  std::shared_ptr<TunnelService> tunnel_service_;
  std::shared_ptr<DomainDispatch> domain_dispatch_;
};
}  // namespace devtools
}  // namespace tdf
