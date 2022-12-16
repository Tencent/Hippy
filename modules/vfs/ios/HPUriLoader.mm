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

#import "HPAsserts.h"
#import "HPUriLoader.h"
#import "HPUriHandler.h"
#import "TypeConverter.h"
#import "VFSUriLoader.h"

#include "VFSDefines.h"

static BOOL CheckRequestFromOC(NSDictionary<NSString *, NSString *> *header) {
    NSString *origin = [header objectForKey:@(kRequestOrigin)];
    if ([origin isEqualToString:@(kRequestFromOC)]) {
        return YES;
    }
    return NO;
}

@interface HPUriLoader () {
    NSMutableArray<HPUriHandler *> *_defaultHandlers;
    NSMutableDictionary<NSString *, NSMutableArray<HPUriHandler *> *> *_handlers;
    std::mutex _mutex;
}

@end

@implementation HPUriLoader

- (instancetype)initWithDefaultHandler:(HPUriHandler *)handler {
    self = [super init];
    if (self) {
        _defaultHandlers = [NSMutableArray arrayWithCapacity:4];
        _handlers = [NSMutableDictionary dictionaryWithCapacity:4];
        if (!handler) {
            handler = [[HPUriHandler alloc] init];
        }
        [_defaultHandlers addObject:handler];
    }
    return self;
}

- (instancetype)init {
    return [self initWithDefaultHandler:nil];
}

- (void)pushDefaultHandler:(HPUriHandler *)handler {
    std::lock_guard<std::mutex> lock(_mutex);
    [_defaultHandlers addObject:handler];
}

- (void)registerHandler:(HPUriHandler *)handler forScheme:(NSString *)scheme {
    HPAssertParam(scheme);
    if (scheme) {
        std::lock_guard<std::mutex> lock(_mutex);
        id handlersForScheme = [_handlers objectForKey:scheme];
        if (!handlersForScheme) {
            handlersForScheme = [NSMutableArray arrayWithCapacity:4];
            [_handlers setObject:handlersForScheme forKey:scheme];
        }
        [handlersForScheme addObject:handler];
    }
}

- (void)requestContentAsync:(NSString *)urlString method:(NSString *)method
                    headers:(NSDictionary<NSString *, NSString *> *)httpHeaders
                       body:(NSData *)data
                   progress:(void(^)(NSUInteger current, NSUInteger total))progress
                     result:(void(^)(NSData *_Nullable data, NSURLResponse *response, NSError *error))result {
    if (CheckRequestFromOC(httpHeaders)) {
        return;
    }
    HPAssertParam(urlString);
    NSString *scheme = HPSchemeFromURLString(urlString);
    method = method?:data?@"post":@"get";
    __block NSArray<HPUriHandler *> *currentListOfHandlers = nil;
    __block HPUriHandler *currentHandler = nil;
    {
        std::lock_guard<std::mutex> lock(_mutex);
        currentListOfHandlers = [_handlers objectForKey:scheme];
        currentListOfHandlers = currentListOfHandlers?:_defaultHandlers;
        currentHandler = [currentListOfHandlers lastObject];
    }
    __weak HPUriLoader *weakLoader = self;
    [currentHandler requestContentAsync:urlString method:method headers:httpHeaders body:data next:^HPUriHandler *_Nullable {
        HPUriLoader *strongLoader = weakLoader;
        if (!strongLoader) {
            return nil;
        }
        [strongLoader getNextHandler:&currentHandler currentList:&currentListOfHandlers];
        return currentHandler;
    } progress:progress result:result];
}

- (NSData *)requestContentSync:(NSString *)urlString method:(NSString *)method
                       headers:(NSDictionary<NSString *, NSString *> *)httpHeaders
                          body:(NSData *)data
                      response:(NSURLResponse **)response
                         error:(NSError **)error {
    if (CheckRequestFromOC(httpHeaders)) {
        return nil;
    }
    HPAssertParam(urlString);
    NSString *scheme = HPSchemeFromURLString(urlString);
    method = method?:data?@"post":@"get";
    __block NSArray<HPUriHandler *> *currentListOfHandlers = nil;
    __block HPUriHandler *currentHandler = nil;
    {
        std::lock_guard<std::mutex> lock(_mutex);
        currentListOfHandlers = [_handlers objectForKey:scheme];
        currentListOfHandlers = currentListOfHandlers?:_defaultHandlers;
        currentHandler = [currentListOfHandlers lastObject];
    }
    __weak HPUriLoader *weakLoader = self;
    __block NSURLResponse *block_response = response?*response:nil;
    __block NSError *block_error = error?*error:nil;
    return [currentHandler requestContentSync:urlString method:method headers:httpHeaders body:data next:^HPUriHandler * {
        HPUriLoader *strongLoader = weakLoader;
        if (!strongLoader) {
            return nil;
        }
        [strongLoader getNextHandler:&currentHandler currentList:&currentListOfHandlers];
        return currentHandler;
    } response:&block_response error:&block_error];
}

- (void)getNextHandler:(HPUriHandler **)pCurrentHandler currentList:(NSArray<HPUriHandler *> **)pCurrentList {
    HPUriHandler *currentHandler = *pCurrentHandler;
    NSArray<HPUriHandler *> *currentListOfHandlers = *pCurrentList;
    HPAssert([currentListOfHandlers containsObject:currentHandler], @"current list doesnt contain current handler");
    std::lock_guard<std::mutex> lock(_mutex);
    if (currentHandler == [currentListOfHandlers lastObject]) {
        if (currentListOfHandlers == _defaultHandlers) {
            *pCurrentHandler = nil;
        }
        else {
            currentListOfHandlers = _defaultHandlers;
            *pCurrentHandler = [_defaultHandlers firstObject];
        }
    }
    else {
        NSUInteger index = [currentListOfHandlers indexOfObject:currentHandler];
        *pCurrentHandler = [currentListOfHandlers objectAtIndex:index + 1];
    }
}

@end
