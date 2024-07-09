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

#include "VFSUriHandler.h"

@class HippyBridge;

class HippyFileHandler : public VFSUriHandler {
public:
    HippyFileHandler() = delete;
    HippyFileHandler(HippyBridge *bridge);

    virtual void RequestUntrustedContent(
        std::shared_ptr<hippy::RequestJob> request,
        std::shared_ptr<hippy::JobResponse> response,
        std::function<std::shared_ptr<UriHandler>()> next) override;
    virtual void RequestUntrustedContent(
        std::shared_ptr<hippy::RequestJob> request,
        std::function<void(std::shared_ptr<hippy::JobResponse>)> cb,
        std::function<std::shared_ptr<UriHandler>()> next) override;

    /// Convert relative addresses(such as hpfile://) to absolute paths
    /// - Parameters:
    ///   - hippyFileUrl: file url
    ///   - hippySandboxDirectory: sandbox directory of hippy app
    static NSURL *AbsoluteURLFromHippyFileURL(NSURL *hippyFileUrl, NSURL *hippySandboxDirectory);

    virtual void RequestUntrustedContent(NSURLRequest *request,
                                         NSDictionary *extraInfo,
                                         NSOperationQueue *queue,
                                         VFSHandlerProgressBlock progress,
                                         VFSHandlerCompletionBlock completion,
                                         VFSGetNextHandlerBlock next) override;

private:
    __weak HippyBridge *bridge_;
};
