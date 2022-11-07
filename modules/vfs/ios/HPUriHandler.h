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

#import <Foundation/Foundation.h>

#include <memory>

class VFSUriLoader;

NS_ASSUME_NONNULL_BEGIN

@interface HPUriHandler : NSObject

@property(nonatomic, assign)BOOL enableForward;

- (void)requestContentAsync:(NSString *)urlString
                     method:(NSString *)method
                    headers:(NSDictionary<NSString *, NSString *> *)httpHeaders
                       body:(NSData *)data
                       next:(HPUriHandler *_Nullable(^)(void))next
                     result:(void(^)(NSData *_Nullable, NSURLResponse *, NSError *))result;

- (NSData *)requestContentSync:(NSString *)urlString
                        method:(NSString *_Nullable)method
                       headers:(NSDictionary<NSString *, NSString *> *_Nullable)httpHeaders
                          body:(NSData *_Nullable)data
                          next:(HPUriHandler *_Nullable(^)(void))next
                      response:(NSURLResponse *_Nullable*_Nullable)response
                         error:(NSError *_Nullable*_Nullable)error;

@property(nonatomic, assign)std::weak_ptr<VFSUriLoader> uriLoader;

@end

NS_ASSUME_NONNULL_END
