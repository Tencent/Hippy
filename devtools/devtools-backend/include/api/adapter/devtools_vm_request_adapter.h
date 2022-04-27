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

#include <string>

namespace hippy {
namespace devtools {
/**
 * Request encapsulation of upper layer execution engine，like v8、 jsc virtual machine
 */
class VMRequestAdapter {
 public:
  using SendFinishCallback = std::function<void()>;

  /**
   * send message to virtual machine
   * @param msg  message data
   * @param callback  on send finish callback
   */
  virtual void SendMsgToVM(std::string msg, SendFinishCallback sendFinishCallback) = 0;
  virtual ~VMRequestAdapter(){}
};
}  // namespace devtools
}  // namespace hippy
