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

#pragma once

#include "worker.h"

#include <memory>

#include "cv_driver.h"

namespace footstone {
inline namespace runner {

class WorkerImpl: public Worker, public std::enable_shared_from_this<WorkerImpl> {
 public:
  WorkerImpl(std::string name = "", bool is_schedulable = true, std::unique_ptr<Driver> driver = std::make_unique<CVDriver>()):
    Worker(std::move(name), is_schedulable, std::move(driver)) {}
  virtual void SetName(const std::string& name) override;
  virtual std::weak_ptr<Worker> GetSelf() override {
      auto self = shared_from_this();
      return std::static_pointer_cast<Worker>(self);
  }
};

}
}
