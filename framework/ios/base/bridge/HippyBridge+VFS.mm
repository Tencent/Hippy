/*!
 * iOS SDK
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
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#import "HippyBridge+VFS.h"
#import "HippyBridge+Private.h"
#import "VFSUriLoader.h"
#import "HippyAssert.h"

@implementation HippyBridge (VFS)

- (void)loadContentUsingVFS:(NSString *)urlString
                  extraInfo:(NSDictionary *)extraInfo
             operationQueue:(NSOperationQueue *)operationQueue
                   progress:(VFSHandlerProgressBlock)progress
                 completion:(VFSHandlerCompletionBlock)completion {
    auto loader = [self vfsUriLoader].lock();
    if (!loader) {
        static NSString *kHippyBridge = @"HippyBridge";
        NSDictionary *info = @{ NSLocalizedDescriptionKey : @"VFSUriLoader is not available"};
        completion(nil, extraInfo, nil, [NSError errorWithDomain:kHippyBridge
                                                            code:-1
                                                        userInfo:info]);
        return;
    }
    loader->RequestUntrustedContent(urlString, extraInfo, operationQueue, progress, completion);
}

@end
