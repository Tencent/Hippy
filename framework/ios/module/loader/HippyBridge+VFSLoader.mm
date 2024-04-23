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

#import "HippyBridge+VFSLoader.h"
#import "HippyBridge+Private.h"
#import "HippyUtils.h"
#include "VFSUriLoader.h"
#include "VFSUriHandler.h"


@implementation HippyBridge (VFSLoader)

- (void)loadContentsAsynchronouslyFromUrl:(NSString *)urlString
                                   method:(NSString *_Nullable)method
                                   params:(NSDictionary<NSString *, NSString *> *)httpHeaders
                                     body:(NSData *)body
                                    queue:(NSOperationQueue *_Nullable)queue
                                 progress:(VFSHandlerProgressBlock)progress
                        completionHandler:(VFSHandlerCompletionBlock)completionHandler {
    if (!urlString || !completionHandler) {
        return;
    }
    std::shared_ptr<VFSUriLoader> loader = [self vfsUriLoader].lock();
    if (loader) {
        NSURL *url = HippyURLWithString(urlString, nil);
        NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:url];
        if (method) {
            [request setHTTPMethod:method];
        }
        if (httpHeaders) {
            for (NSString *key in httpHeaders) {
                [request setValue:httpHeaders[key] forHTTPHeaderField:key];
            }
        }
        if (body) {
            [request setHTTPBody:body];
        }
        loader->RequestUntrustedContent(request, nil, queue, progress, completionHandler);
    }
}

@end
