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

#include <string>
#include <unordered_map>
#include <js_native_api.h>
#include <js_native_api_types.h>
#include "footstone/string_view.h"
#include "footstone/logging.h"
#include "footstone/string_view_utils.h"
#include "vfs/handler/uri_handler.h"

namespace hippy {
  inline namespace vfs {
    using byte_string = std::string;
    using string_view = footstone::stringview::string_view;
    using RetCode = UriHandler::RetCode;

    class ResourceHolder {
    public:
      static std::shared_ptr<ResourceHolder> Create(napi_env ts_env, napi_ref ts_holder_ref);
      explicit ResourceHolder(napi_env ts_env, napi_ref ts_holder_ref) : ts_env_(ts_env), ts_holder_ref_(ts_holder_ref) {}
      ~ResourceHolder();

      uint32_t GetNativeId();
      string_view GetUri();
      RetCode GetCode();
      void SetCode(RetCode);
      std::unordered_map<std::string, std::string> GetReqMeta();
      std::unordered_map<std::string, std::string> GetRspMeta();
      void SetRspMeta(std::unordered_map<std::string, std::string> rsp_meta);
      byte_string GetContent();
      void SetContent(byte_string content);

      void FetchComplete(napi_ref ts_obj_ref);

    private:
      napi_env ts_env_ = 0;
      napi_ref ts_holder_ref_ = 0;
    };
  } // namespace vfs
} // namespace hippy
