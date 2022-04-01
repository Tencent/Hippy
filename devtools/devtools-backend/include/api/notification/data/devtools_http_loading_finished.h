//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2022/2/24.
//

#pragma once

#include <string>
#include "api/adapter/data/serializable.h"

namespace tdf {
namespace devtools {

/**
 * CDP 网络协议，loading finished事件数据体
 * #see https://chromedevtools.github.io/devtools-protocol/tot/Network/#event-loadingFinished
 */
class DevtoolsLoadingFinished : public Serializable {
 public:
  DevtoolsLoadingFinished(std::string request_id, uint32_t length)
      : request_id_(request_id),
        encoded_data_length_(length),
        timestamp_(time(0)),
        should_report_corb_blocking_(false) {}

  /**
   * 设置回包收到时间
   * @param timestamp 回包时间，以秒为单位
   */
  void SetTimestamp(uint64_t timestamp) { timestamp_ = timestamp; }

  /**
   * 设置是否阻止跨源读取
   * @param blocking 跨源阻止
   */
  void SetReportCorbBlocking(bool blocking) { should_report_corb_blocking_ = blocking; }
  std::string Serialize() const override;

 private:
  std::string request_id_;
  uint32_t encoded_data_length_;
  uint64_t timestamp_;
  bool should_report_corb_blocking_;
};
}  // namespace devtools
}  // namespace tdf
