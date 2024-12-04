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
#import "HippyVFSDefines.h"

NS_ASSUME_NONNULL_BEGIN

/// Category of HippyBridge responsible for loading data
@interface HippyBridge (VFSLoader)

/// Load data from url (GET)
/// - Parameters:
///   - urlString: request url
///   - httpHeaders: http headers, optional
///   - queue: operation queue, optional
///   - progress: progress callback, optional
///   - completionHandler: completion callback
- (void)loadContentsAsyncFromUrl:(NSString *)urlString
                          params:(nullable NSDictionary<NSString *, NSString *> *)httpHeaders
                           queue:(nullable NSOperationQueue *)queue
                        progress:(nullable VFSHandlerProgressBlock)progress
               completionHandler:(VFSHandlerCompletionBlock)completionHandler;


/// Load data using given request
/// - Parameters:
///   - request: URLRequest
///   - queue: operation queue, optional
///   - progress: progress callback, optional
///   - completionHandler: completion callback
- (void)loadContentsAsyncWithRequest:(NSURLRequest *)request
                               queue:(nullable NSOperationQueue *)queue
                            progress:(nullable VFSHandlerProgressBlock)progress
                   completionHandler:(VFSHandlerCompletionBlock)completionHandler;

@end

NS_ASSUME_NONNULL_END
