/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2019 THL A29 Limited, a Tencent company.
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

#include <map>

#include "core/core.h"

namespace voltron {
class VoltronLoader : public hippy::base::UriLoader {
 public:
  using unicode_string_view = tdf::base::unicode_string_view;
  using u8string = unicode_string_view::u8string;

  VoltronLoader();
  virtual ~VoltronLoader() {}

  virtual bool RequestUntrustedContent(const unicode_string_view& uri, std::function<void(u8string)> cb);
  virtual bool RequestUntrustedContent(const unicode_string_view& uri, u8string& str);

  void SetWorkerTaskRunner(std::weak_ptr<WorkerTaskRunner> runner) { runner_ = runner; }
  std::function<void(u8string)> GetRequestCB(int64_t request_id);
  int64_t SetRequestCB(const std::function<void(u8string)>& cb);

 private:
  bool LoadByFile(const unicode_string_view& path, const std::function<void(u8string)>& cb);
  bool LoadByHttp(const unicode_string_view& uri, const std::function<void(u8string)>& cb);

  std::weak_ptr<WorkerTaskRunner> runner_;
  std::unordered_map<int64_t, std::function<void(u8string)>> request_map_;
};
}
