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

#import "HippyBridge.h"
#import "HippyUtils.h"
#include "HippyFileHandler.h"
#include "footstone/logging.h"

HippyFileHandler::HippyFileHandler(HippyBridge *bridge) {
    bridge_ = bridge;
}

void HippyFileHandler::RequestUntrustedContent(std::shared_ptr<hippy::RequestJob> request,
                                               std::shared_ptr<hippy::JobResponse> response,
                                               std::function<std::shared_ptr<UriHandler>()> next) {
    FOOTSTONE_UNIMPLEMENTED();
}

void HippyFileHandler::RequestUntrustedContent(std::shared_ptr<hippy::RequestJob> request,
                                               std::function<void(std::shared_ptr<hippy::JobResponse>)> cb,
                                               std::function<std::shared_ptr<UriHandler>()> next) {
    FOOTSTONE_UNIMPLEMENTED();
}

NSURL *HippyFileHandler::AbsoluteURLFromHippyFileURL(NSURL *fileUrl, NSURL *hippySandboxDirectory) {
    static NSString *defaultHippyLocalFileURLPrefix = @"hpfile://";
    static NSString *hippyLocalRelativeFilePathPrefix = @"./";
    static NSString *hippyLocalAppBundleFilePathPrefix = @"appbundle/";
    static NSString *hippyLocalContainerFilePathPrefix = @"container/";
    
    NSURL *absoluteURL = fileUrl;
    NSString *urlString = [fileUrl absoluteString];
    if ([urlString hasPrefix:defaultHippyLocalFileURLPrefix]) {
        NSString *path = [urlString substringFromIndex:[defaultHippyLocalFileURLPrefix length]];
        
        if ([path hasPrefix:hippyLocalRelativeFilePathPrefix]) {
            // Hippy Sandbox Relative Path
            NSString *relativePath = [path substringFromIndex:hippyLocalRelativeFilePathPrefix.length];
            absoluteURL = [NSURL fileURLWithPath:relativePath relativeToURL:hippySandboxDirectory];
        } else if ([path hasPrefix:hippyLocalAppBundleFilePathPrefix]) {
            // App Bundle Path
            NSString *relativePath = [path substringFromIndex:[hippyLocalAppBundleFilePathPrefix length]];
            absoluteURL = [[NSBundle mainBundle] URLForResource:relativePath withExtension:nil];
        } else if ([path hasPrefix:hippyLocalContainerFilePathPrefix]) {
            // App Container Path
            NSString *relativePath = [path substringFromIndex:[hippyLocalContainerFilePathPrefix length]];
            NSString *containerPath = [NSHomeDirectory() stringByAppendingPathComponent:relativePath];
            absoluteURL = [NSURL fileURLWithPath:containerPath];
        }
    }
    return absoluteURL;
}

void HippyFileHandler::RequestUntrustedContent(NSURLRequest *request,
                                               NSDictionary *extraInfo,
                                               NSOperationQueue *queue,
                                               VFSHandlerProgressBlock progress,
                                               VFSHandlerCompletionBlock completion,
                                               VFSGetNextHandlerBlock next) {
    if (!completion) {
        return;
    }
    HippyBridge *bridge = bridge_;
    if (!bridge || !request) {
        completion(nil, nil, nil, [NSError errorWithDomain:NSURLErrorDomain code:NSURLErrorUnsupportedURL userInfo:nil]);
        return;
    }
    NSURL *url = [request URL];
    if (!url) {
        completion(nil, nil, nil, [NSError errorWithDomain:NSURLErrorDomain code:NSURLErrorUnsupportedURL userInfo:nil]);
        return;
    }
    
    NSURL *absoluteURL = AbsoluteURLFromHippyFileURL(url, [NSURL URLWithString:bridge.sandboxDirectory]);
    if ([absoluteURL isFileURL] || [absoluteURL isFileReferenceURL]) {
        void (^opBlock)() = ^{
            NSError *error;
            NSData *fileData = [NSData dataWithContentsOfURL:absoluteURL options:kNilOptions error:&error];
            NSURLResponse *rsp = [[NSURLResponse alloc] initWithURL:url
                                                           MIMEType:nil
                                              expectedContentLength:fileData.length
                                                   textEncodingName:nil];
            completion(fileData, nil, rsp, error);
        };
        if (queue) {
            [queue addOperationWithBlock:opBlock];
        } else {
            opBlock();
        }
    } else {
        FOOTSTONE_DLOG(ERROR) << "HippyFileHandler cannot load url " << [[absoluteURL absoluteString] UTF8String];
        completion(nil, nil, nil, [NSError errorWithDomain:NSURLErrorDomain code:NSURLErrorUnsupportedURL userInfo:nil]);
    }
}
