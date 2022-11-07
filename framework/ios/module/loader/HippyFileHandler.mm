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
#import "HippyFileHandler.h"

@implementation HippyFileHandler

- (instancetype)init {
    return [self initWithBridge:nil];
}

- (instancetype)initWithBridge:(HippyBridge *)bridge {
    self = [super init];
    if (self) {
        self.bridge = bridge;
    }
    return self;
}

- (void)requestContentAsync:(NSString *)urlString method:(NSString *)method
                    headers:(NSDictionary<NSString *,NSString *> *)httpHeaders body:(NSData *)data
                       next:(HPUriHandler * _Nullable (^)())next
                     result:(void (^)(NSData * _Nullable, NSURLResponse * _Nonnull, NSError * _Nonnull))result {
    HippyBridge *bridge = self.bridge;
    if (!bridge) {
        return;
    }
    if ([HippyBridge isHippyLocalFileURLString:urlString]) {
        urlString = [bridge absoluteStringFromHippyLocalFileURLString:urlString];
    }
    [super requestContentAsync:urlString method:method headers:httpHeaders body:data next:next result:result];
}

- (NSData *)requestContentSync:(NSString *)urlString
                        method:(NSString *_Nullable)method
                       headers:(NSDictionary<NSString *, NSString *> *_Nullable)httpHeaders
                          body:(NSData *_Nullable)data
                          next:(HPUriHandler *_Nullable(^)(void))next
                      response:(NSURLResponse *_Nullable*_Nullable)response
                         error:(NSError *_Nullable*_Nullable)error {
    HippyBridge *bridge = self.bridge;
    if (!bridge) {
        return nil;
    }
    if ([HippyBridge isHippyLocalFileURLString:urlString]) {
        urlString = [bridge absoluteStringFromHippyLocalFileURLString:urlString];
    }
    return [super requestContentSync:urlString method:method headers:httpHeaders body:data next:next response:response error:error];
}

@end
