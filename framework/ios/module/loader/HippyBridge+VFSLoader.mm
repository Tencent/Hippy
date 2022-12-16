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
#import "HPUriLoader.h"

#include "VFSUriLoader.h"

@implementation HippyBridge (VFSLoader)

static NSDictionary *AssembleParams(NSDictionary<NSString *, NSString *> *_Nullable httpHeaders, NSString *_Nullable method, NSData *_Nullable body) {
    NSMutableDictionary *params = [NSMutableDictionary dictionaryWithCapacity:8];
    if (httpHeaders) {
        [params addEntriesFromDictionary:params];
    }
    if (method) {
        NSString *m = method?:body?@"post":@"get";
        [params setObject:m forKey:@"method"];
    }
    if (body) {
        [params setObject:body forKey:@"body"];
    }
    return [params copy];
}

- (void)loadContentsAsynchronouslyFromUrl:(NSString *)urlString
                                   method:(NSString *_Nullable)method
                                   params:(NSDictionary<NSString *, NSString *> *)httpHeaders
                                     body:(NSData *)body
                                 progress:(void(^)(NSUInteger current, NSUInteger total))progress
                        completionHandler:(void (^)(NSData *data, NSURLResponse *response, NSError *error))completionHandler {
    if (!urlString || !completionHandler) {
        return;
    }
    
    HPUriLoader *loader = [self HPUriLoader];
    if (loader) {
        [loader requestContentAsync:urlString method:method headers:httpHeaders body:body progress:progress result:completionHandler];
    }
    else {
        auto loader = [self VFSUriLoader].lock();
        if (loader) {
            VFSUriLoader::URILoaderCompletion completion = [completionHandler](NSData * retData, NSURLResponse *retResponse, NSError *retError) {
                completionHandler(retData, retResponse, retError);
            };
            NSDictionary *params = AssembleParams(httpHeaders, method, body);
            loader->loadContentsAsynchronously(urlString, params, completion);
        }
    }
}

- (NSData *)loadContentsSynchronouslyFromUrl:(NSString *)urlString
                                      method:(NSString *_Nullable)method
                                      params:(NSDictionary<NSString *, NSString *> *_Nullable)httpHeaders
                                        body:(NSData *)body
                           returningResponse:(NSURLResponse * _Nullable * _Nullable)response
                                       error:(NSError *_Nullable * _Nullable)error {
    HPUriLoader *loader = [self HPUriLoader];
    if (loader) {
        [loader requestContentSync:urlString method:method headers:httpHeaders body:body response:response error:error];
    }
    else {
        auto loader = [self VFSUriLoader].lock();
        if (loader) {
            NSDictionary *params = AssembleParams(httpHeaders, method, body);
            return loader->loadContentsSynchronously(urlString, params, response, error);
        }
    }
    return nil;
}

@end
