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

namespace tdf {
namespace devtools {
class V8RequestAdapter {
 public:
  using SendFinishCallback = std::function<void()>;

  /**
   * 发送 js debugger 协议到 v8
   * @param msg 数据对象
   * @param callback 发送完成回调
   */
  virtual void SendMsgToV8(std::string msg, SendFinishCallback sendFinishCallback) = 0;
  virtual ~V8RequestAdapter(){}
};
}  // namespace devtools
}  // namespace tdf
