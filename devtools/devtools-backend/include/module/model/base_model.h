//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by ivanfanwu on 2021/7/13.
//

#pragma once

#include <memory>
#include "api/devtools_data_provider.h"
#include "api/devtools_notification_center.h"

namespace tdf {
namespace devtools {

/**
 * @brief model 处理基类
 */
class BaseModel {
 public:
  void SetDataProvider(std::shared_ptr<DataProvider> provider) { provider_ = provider; }

 protected:
  std::shared_ptr<DataProvider> provider_;
};

}  // namespace devtools
}  // namespace tdf
