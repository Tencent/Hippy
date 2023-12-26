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

#include <js_native_api.h>
#include <js_native_api_types.h>
#include "vfs/handler/uri_handler.h"
#include "footstone/persistent_object_map.h"
#include "footstone/string_view.h"

namespace hippy {
inline namespace vfs {

class NapiDelegateHandler : public UriHandler, public std::enable_shared_from_this<NapiDelegateHandler> {
 public:
  using string_view = footstone::string_view;
  struct NapiDelegateHandlerAsyncWrapper {
    std::weak_ptr<NapiDelegateHandler> delegate;
    std::shared_ptr<RequestJob> request;
    std::function<void(std::shared_ptr<JobResponse>)> cb;
    NapiDelegateHandlerAsyncWrapper(std::weak_ptr<NapiDelegateHandler> delegate, std::shared_ptr<RequestJob> request,
                                      const std::function<void(std::shared_ptr<JobResponse>)> &cb) {
        this->delegate = delegate;
        this->request = request;
        this->cb = cb;
    }
  };
  using AsyncWrapperMap = footstone::PersistentObjectMap<uint32_t, std::shared_ptr<NapiDelegateHandlerAsyncWrapper>>;
  using NapiDelegateHandlerMap = footstone::PersistentObjectMap<uint32_t, std::shared_ptr<NapiDelegateHandler>>;

  NapiDelegateHandler(napi_env env, napi_ref delegate_ref);
  virtual ~NapiDelegateHandler();

  virtual void RequestUntrustedContent(
      std::shared_ptr<RequestJob> request,
      std::shared_ptr<JobResponse> response,
      std::function<std::shared_ptr<UriHandler>()> next) override;
  virtual void RequestUntrustedContent(
      std::shared_ptr<RequestJob> request,
      std::function<void(std::shared_ptr<JobResponse>)> cb,
      std::function<std::shared_ptr<UriHandler>()> next) override;

  static inline AsyncWrapperMap& GetAsyncWrapperMap() {
    return wrapper_map_;
  }

 private:
   napi_env ts_env_ = 0;
   napi_ref ts_delegate_ref_ = 0;
   static std::atomic<uint32_t> request_id_;
   static AsyncWrapperMap wrapper_map_;
};

}
}
