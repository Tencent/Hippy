/*
 *
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
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#pragma once

#include <memory>

#include "driver/napi/js_ctx.h"
#include "footstone/logging.h"

namespace hippy {
#ifdef ENABLE_INSPECTOR
namespace devtools {
class DevtoolsDataSource;
}
#endif
inline namespace driver {
inline namespace vm {

class VM {
 public:
  static const int64_t kDefaultGroupId = -1;
  static const int64_t kDebuggerGroupId = -2;
  using string_view = footstone::string_view;
  using Ctx = hippy::napi::Ctx;
  using CtxValue = hippy::napi::CtxValue;
#ifdef ENABLE_INSPECTOR
  using DevtoolsDataSource = hippy::devtools::DevtoolsDataSource;
#endif

  struct VMInitParam {
   public:
    bool is_debug;
    int64_t group_id;
#ifdef ENABLE_INSPECTOR
    std::shared_ptr<DevtoolsDataSource> devtools_data_source;
#endif
    std::function<void(const std::any& bridge,
                       const string_view& description,
                       const string_view& stack)> uncaught_exception_callback;
    VMInitParam(bool is_debug, int64_t group_id, std::function<void(const std::any& bridge,
                                                                    const string_view& description,
                                                                    const string_view& stack)> uncaught_exception_callback):
                                                                    is_debug(is_debug), group_id(group_id),
                                                                    uncaught_exception_callback(std::move(uncaught_exception_callback)) {}
    VMInitParam(): VMInitParam(false, VM::kDefaultGroupId, nullptr) {}
  };

  VM(std::shared_ptr<VMInitParam> param = std::make_shared<VMInitParam>())
      : is_debug_(param->is_debug), group_id_(param->group_id), uncaught_exception_callback_(param->uncaught_exception_callback) {}
  virtual ~VM() { FOOTSTONE_DLOG(INFO) << "~VM"; }

  inline void SetDebug(bool is_debug) {
    is_debug_ = is_debug;
  }
  inline bool IsDebug() {
    return is_debug_;
  }

  inline int64_t GetGroupId() {
    return group_id_;
  }

  inline const auto& GetUncaughtExceptionCallback() {
    return uncaught_exception_callback_;
  }

  static void HandleException(const std::shared_ptr<Ctx>& ctx, const string_view& event_name, const std::shared_ptr<CtxValue>& exception);

  virtual std::shared_ptr<CtxValue> ParseJson(const std::shared_ptr<Ctx>& ctx, const string_view& json) = 0;
  virtual std::shared_ptr<Ctx> CreateContext() = 0;
 private:
  bool is_debug_;
  int64_t group_id_;
  std::function<void(const std::any& bridge,
                     const string_view& description,
                     const string_view& stack)> uncaught_exception_callback_;
};

std::shared_ptr<VM> CreateVM(const std::shared_ptr<VM::VMInitParam>& param);

}

}
}
