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

#include "vfs/handler/uri_handler.h"

@class NSError;
@class HPUriLoader;

hippy::vfs::UriHandler::RetCode RetCodeFromNSError(NSError *error);

class VFSUriHandler : public hippy::vfs::UriHandler {
  public:
    virtual void RequestUntrustedContent(
        std::shared_ptr<hippy::vfs::UriHandler::SyncContext> ctx,
        std::function<std::shared_ptr<hippy::vfs::UriHandler>()> next);
    virtual void RequestUntrustedContent(
        std::shared_ptr<hippy::vfs::UriHandler::ASyncContext> ctx,
        std::function<std::shared_ptr<hippy::vfs::UriHandler>()> next);

    inline HPUriLoader *GetLoader(){return loader_;}
    inline void SetLoader(HPUriLoader *loader){loader_ = loader;}
    
  private:
    void ForwardToHPUriLoader(std::shared_ptr<hippy::vfs::UriHandler::ASyncContext> ctx);
    void ForwardToHPUriLoader(std::shared_ptr<hippy::vfs::UriHandler::SyncContext> ctx);
    __weak HPUriLoader *loader_;
};
