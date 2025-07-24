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

#include <ark_runtime/jsvm.h>
#include <memory>
#include <string>
#include "devtools/devtools_data_source.h"
#include "ohos/jsh_debug_connection.h"
#include "ohos/jsh_get_url_connection.h"

namespace hippy {
inline namespace driver {
class Scope;
}
}

namespace hippy {
inline namespace driver {
inline namespace runtime {
inline namespace inspector {

using JSHGetUrlConnection = hippy::devtools::JSHGetUrlConnection;
using JSHDebugConnection = hippy::devtools::JSHDebugConnection;

class JSHInspectorClientImpl : public std::enable_shared_from_this<JSHInspectorClientImpl> {
 public:
  explicit JSHInspectorClientImpl() {}
  ~JSHInspectorClientImpl() {}
  
  inline void SetDevtoolsDataSource(std::shared_ptr<hippy::devtools::DevtoolsDataSource> devtools_data_source) {
    devtools_data_source_ = devtools_data_source;
  }
  
  void CreateInspector(const std::shared_ptr<Scope>& scope);
  void DestroyInspector(bool is_reload);
  
  void SendMessageToJSH(const std::string&& msg);

 private:
  void ConnInspector();
  void HandleRecvMessage(const std::string& msg);
  
  std::shared_ptr<hippy::devtools::DevtoolsDataSource> devtools_data_source_;
  
  std::shared_ptr<JSHGetUrlConnection> get_url_conn_;
  std::shared_ptr<JSHDebugConnection> debug_conn_;
  
  JSVM_Env opened_jsvm_env_ = nullptr;
};

} // namespace inspector
} // namespace runtime
} // namespace driver
} // namespace hippy
