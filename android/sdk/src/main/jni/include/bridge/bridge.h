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

#include "core/inspector/bridge.h"

#include <memory>

#include "jni/scoped_java_ref.h"

namespace hippy {
  class ADRBridge: public Bridge {
   public:
    ADRBridge(JNIEnv* j_env, jobject j_obj): ref_(std::make_shared<JavaRef>(j_env, j_obj)){}
    virtual ~ADRBridge() = default;
#ifndef V8_WITHOUT_INSPECTOR
    virtual void SendResponse(std::unique_ptr<v8_inspector::StringBuffer> message) override;
    virtual void SendNotification(std::unique_ptr<v8_inspector::StringBuffer> message) override;
#endif
    inline jobject GetObj() {
      return ref_->GetObj();
    }
    inline std::shared_ptr<JavaRef> GetRef() {
      return ref_;
    }
   private:
    std::shared_ptr<JavaRef> ref_;
  };
}
