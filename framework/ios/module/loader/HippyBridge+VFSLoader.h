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

NS_ASSUME_NONNULL_BEGIN

extern NSString *const VFSErrorDomain;

@interface HippyBridge (VFSLoader)

- (void)loadContentsAsynchronouslyFromUrl:(NSURL *)url
                                   params:(NSDictionary *)params
                        completionHandler:(void (^)(NSData *data, NSURLResponse *response, NSError *error))completionHandler;

- (NSData *)loadContentsSynchronouslyFromUrl:(NSURL *)url
                                      params:(NSDictionary *)params
                           returningResponse:(NSURLResponse * _Nullable * _Nullable)response
                                       error:(NSError *_Nullable * _Nullable)error;

@end

NS_ASSUME_NONNULL_END
