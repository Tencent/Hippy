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

#import "HPToolUtils.h"
#import "HPUriHandler.h"

#include "VFSUriLoader.h"
#include "VFSDefines.h"

@implementation HPUriHandler

- (void)requestContentAsync:(NSString *)urlString
                     method:(NSString *)method
                    headers:(NSDictionary<NSString *, NSString *> *)httpHeaders
                       body:(NSData *)data
                       next:(HPUriHandler *_Nullable(^)(void))next
                     result:(void(^)(NSData *_Nullable data, NSURLResponse *response, NSError *error))result {
    NSMutableURLRequest *request = nil;
    NSURL *url = HPURLWithString(urlString, nil);
    if (url) {
        request = [NSMutableURLRequest requestWithURL:url];
    }
    if (!request) {
        if (next) {
            HPUriHandler *nextHandler = next();
            if (nextHandler) {
                [nextHandler requestContentAsync:urlString method:method headers:httpHeaders body:data next:next result:result];
            }
            else {
                [self forwardToVFSUriLoaderAsync:urlString method:method headers:httpHeaders body:data result:result];
            }
        }
        return;
    }
    [request setHTTPMethod:method];
    [request setAllHTTPHeaderFields:httpHeaders];
    [request setHTTPBody:data];
    [[[NSURLSession sharedSession] dataTaskWithRequest:request completionHandler:result] resume];
}

- (NSData *)requestContentSync:(NSString *)urlString
                        method:(NSString *)method
                       headers:(NSDictionary<NSString *, NSString *> *)httpHeaders
                          body:(NSData *)data
                          next:(HPUriHandler *_Nullable(^)(void))next
                      response:(NSURLResponse **)response
                         error:(NSError **)error {
    NSMutableURLRequest *request = nil;
    NSURL *url = HPURLWithString(urlString, nil);
    if (url) {
        request = [NSMutableURLRequest requestWithURL:url];
    }
    if (!request) {
        if (next) {
            HPUriHandler *nextHandler = next();
            if (nextHandler) {
                return [nextHandler requestContentSync:urlString method:method headers:httpHeaders
                                                  body:data next:next response:response error:error];
            }
            else {
                return [self forwardToVFSUriLoaderSync:urlString method:method headers:httpHeaders body:data response:response error:error];
            }
        }
    }
    dispatch_semaphore_t sem = dispatch_semaphore_create(0);
    __block NSData *retData = nil;
    [request setHTTPMethod:method];
    [request setAllHTTPHeaderFields:httpHeaders];
    [request setHTTPBody:data];
    __block NSURLResponse *block_response = nil;
    __block NSError *block_error = nil;
    NSURLSessionDataTask *task = [[NSURLSession sharedSession] dataTaskWithRequest:request
            completionHandler:^(NSData * _Nullable data, NSURLResponse * _Nullable resp, NSError * _Nullable err) {
        retData = data;
        block_response = resp;
        block_error = err;
        dispatch_semaphore_signal(sem);
    }];
    [task resume];
    if (response) *response = block_response;
    if (error) *error = block_error;
    dispatch_semaphore_wait(sem, DISPATCH_TIME_FOREVER);
    return retData;
}

- (void)forwardToVFSUriLoaderAsync:(NSString *)urlString
                            method:(NSString *)method
                           headers:(NSDictionary<NSString *, NSString *> *)httpHeaders
                              body:(NSData *)data
                            result:(void(^)(NSData *_Nullable data, NSURLResponse *response, NSError *error))result {
    auto loader = _uriLoader.lock();
    if (loader) {
        NSMutableDictionary *map = [NSMutableDictionary dictionaryWithCapacity:[httpHeaders count] + 3];
        if (method) {
            [map setObject:method forKey:@(kHeaderMethod)];
        }
        if (data) {
            [map setObject:data forKey:@(kHeaderBody)];
        }
        [map setObject:@(kRequestFromOC) forKey:@(kRequestOrigin)];
        if (httpHeaders) {
            [map addEntriesFromDictionary:httpHeaders];
        }
        loader->loadContentsAsynchronously(urlString, [map copy], result);
    }
}

- (NSData *)forwardToVFSUriLoaderSync:(NSString *)urlString method:(NSString *)method
                              headers:(NSDictionary<NSString *, NSString *> *)httpHeaders
                                 body:(NSData *)data response:(NSURLResponse **)response
                                error:(NSError **)error {
    auto loader = _uriLoader.lock();
    if (loader) {
        NSMutableDictionary *map = [NSMutableDictionary dictionaryWithCapacity:[httpHeaders count] + 3];
        if (method) {
            [map setObject:method forKey:@(kHeaderMethod)];
        }
        if (data) {
            [map setObject:data forKey:@(kHeaderBody)];
        }
        [map setObject:@(kRequestFromOC) forKey:@(kRequestOrigin)];
        if (httpHeaders) {
            [map addEntriesFromDictionary:httpHeaders];
        }
        return loader->loadContentsSynchronously(urlString, [map copy], response, error);
    }
    return nil;
}

@end
