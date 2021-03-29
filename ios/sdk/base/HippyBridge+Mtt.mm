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

#import "HippyBridge+Mtt.h"
#import <objc/runtime.h>
#import "HippyBridge+Private.h"
#import "HippyPerformanceLogger.h"
#import "HippyBridge+LocalFileSource.h"
#import "HippyAssert.h"
NSString *const HippySecondaryBundleDidStartLoadNotification = @"HippySecondaryBundleDidStartLoadNotification";
NSString *const HippySecondaryBundleDidLoadSourceCodeNotification = @"HippySecondaryBundleDidLoadSourceCodeNotification";
NSString *const HippySecondaryBundleDidLoadNotification = @"HippySecondaryBundleDidLoadNotification";

@interface SecondaryBundle : NSObject

@property (nonatomic, strong) NSURL *url;
@property (nonatomic, copy) SecondaryBundleLoadingCompletion loadBundleCompletion;
@property (nonatomic, copy) SecondaryBundleLoadingCompletion enqueueScriptCompletion;
@property (nonatomic, copy) SecondaryBundleCompletion completion;

@end

@implementation SecondaryBundle

@end

static const void *HippyBridgeIsSecondaryBundleLoadingKey = &HippyBridgeIsSecondaryBundleLoadingKey;
static const void *HippyBridgePendingLoadBundlesKey = &HippyBridgePendingLoadBundlesKey;
static const void *HippyBridgeLoadedBundlesKey = &HippyBridgeLoadedBundlesKey;

@implementation HippyBridge (Mtt)

- (NSMutableArray *)pendingLoadBundles {
    id value = objc_getAssociatedObject(self, HippyBridgePendingLoadBundlesKey);
    return value;
}

- (void)setPendingLoadBundles:(NSMutableArray *)pendingLoadBundles {
    objc_setAssociatedObject(self, HippyBridgePendingLoadBundlesKey, pendingLoadBundles, OBJC_ASSOCIATION_RETAIN);
}

- (NSMutableDictionary *)loadedBundleURLs {
    id value = objc_getAssociatedObject(self, HippyBridgeLoadedBundlesKey);
    return value;
}

- (void)setLoadedBundleURLs:(NSMutableDictionary *)loadedBundleURLs {
    objc_setAssociatedObject(self, HippyBridgeLoadedBundlesKey, loadedBundleURLs, OBJC_ASSOCIATION_RETAIN);
}

- (BOOL)isSecondaryBundleLoading {
    return [(NSNumber *)objc_getAssociatedObject(self, &HippyBridgeIsSecondaryBundleLoadingKey) boolValue];
}

- (void)setIsSecondaryBundleLoading:(BOOL)isSecondaryBundleLoading {
    objc_setAssociatedObject(self, &HippyBridgeIsSecondaryBundleLoadingKey, @(isSecondaryBundleLoading), OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (void)loadSecondary:(NSURL *)secondaryBundleURL
       loadBundleCompletion:(SecondaryBundleLoadingCompletion)loadBundleCompletion
    enqueueScriptCompletion:(SecondaryBundleLoadingCompletion)enqueueScriptCompletion
                 completion:(SecondaryBundleCompletion)completion {
    if (secondaryBundleURL.absoluteString.length == 0) {
        return;
    }
    __weak HippyBatchedBridge *batchedBridge = (HippyBatchedBridge *)[self batchedBridge];
    NSString *key = secondaryBundleURL.absoluteString;
    batchedBridge.workFolder = key;
    BOOL loaded;
    @synchronized(self) {
        loaded = [self.loadedBundleURLs objectForKey:key] != nil;
    }
    // 已经加载，直接返回
    if (loaded) {
        if (completion) {
            if ([self.batchedBridge.javaScriptExecutor respondsToSelector:@selector(secondBundleLoadCompleted:)]) {
                [self.batchedBridge.javaScriptExecutor secondBundleLoadCompleted:YES];
            }
            completion(YES);
        }

        [self loadNextBundle];

        return;
    }

    // 正在加载中，丢进队列
    if (batchedBridge.isSecondaryBundleLoading) {
        SecondaryBundle *bundle = [[SecondaryBundle alloc] init];
        bundle.url = secondaryBundleURL;
        bundle.loadBundleCompletion = loadBundleCompletion;
        bundle.enqueueScriptCompletion = enqueueScriptCompletion;
        bundle.completion = completion;

        if (!self.pendingLoadBundles) {
            self.pendingLoadBundles = [[NSMutableArray alloc] init];
        }

        @synchronized(self) {
            [self.pendingLoadBundles addObject:bundle];
        }
    } else {
        [self.performanceLogger markStartForTag:HippySecondaryStartup];

        batchedBridge.isSecondaryBundleLoading = YES;

        [[NSNotificationCenter defaultCenter] postNotificationName:HippySecondaryBundleDidStartLoadNotification object:self
                                                          userInfo:@{ @"url": key }];

        dispatch_queue_t bridgeQueue = dispatch_queue_create("mtt.bussiness.HippyBridgeQueue", DISPATCH_QUEUE_CONCURRENT);
        dispatch_group_t initModulesAndLoadSource = dispatch_group_create();
        dispatch_group_enter(initModulesAndLoadSource);
        __block NSData *sourceCode = nil;
        [HippyJavaScriptLoader loadBundleAtURL:secondaryBundleURL onProgress:nil
                                    onComplete:^(NSError *error, NSData *source, __unused int64_t sourceLength) {
                                        if (!error) {
                                            sourceCode = source;
                                        } else {
                                            batchedBridge.isSecondaryBundleLoading = NO;
                                        }

                                        NSMutableDictionary *userInfo =
                                            [[NSMutableDictionary alloc] initWithDictionary:@ { @"url": key, @"bridge": self }];
                                        if (error) {
                                            [userInfo setObject:error forKey:@"error"];
                                        }

                                        [[NSNotificationCenter defaultCenter] postNotificationName:HippySecondaryBundleDidLoadSourceCodeNotification
                                                                                            object:self
                                                                                          userInfo:userInfo];

                                        if (loadBundleCompletion) {
                                            loadBundleCompletion(error);
                                        }

                                        dispatch_group_leave(initModulesAndLoadSource);
                                    }];

        dispatch_group_notify(initModulesAndLoadSource, bridgeQueue, ^{
            HippyBatchedBridge *strongBridge = batchedBridge;
            if (sourceCode) {
                // 公共包正在加载，等待
                dispatch_semaphore_wait(strongBridge.semaphore, DISPATCH_TIME_FOREVER);

                dispatch_semaphore_signal(strongBridge.semaphore);

                HippyAssert(!strongBridge.isLoading, @"异常了common包没有加载好");

                [strongBridge enqueueApplicationScript:sourceCode url:secondaryBundleURL onComplete:^(NSError *error) {
                    if (enqueueScriptCompletion) {
                        enqueueScriptCompletion(error);
                    }

                    NSMutableDictionary *userInfo = [[NSMutableDictionary alloc] initWithDictionary:@ { @"url": key, @"bridge": self }];
                    if (error) {
                        [userInfo setObject:error forKey:@"error"];
                    }

                    [[NSNotificationCenter defaultCenter] postNotificationName:HippySecondaryBundleDidLoadNotification object:self userInfo:userInfo];

                    if (!error) {
                        if (!self.loadedBundleURLs) {
                            self.loadedBundleURLs = [[NSMutableDictionary alloc] init];
                        }

                        // 加载成功，保存Url，下次无需加载
                        @synchronized(self) {
                            [self.loadedBundleURLs setObject:@(YES) forKey:key];
                        }
                    }

                    batchedBridge.isSecondaryBundleLoading = NO;

                    [self.performanceLogger markStopForTag:HippySecondaryStartup];

                    if (completion) {
                        if ([self.batchedBridge.javaScriptExecutor respondsToSelector:@selector(secondBundleLoadCompleted:)]) {
                            [self.batchedBridge.javaScriptExecutor secondBundleLoadCompleted:!error];
                        }
                        completion(!error);
                    }

                    [self loadNextBundle];
                }];
            } else {
                if (completion) {
                    if ([self.batchedBridge.javaScriptExecutor respondsToSelector:@selector(secondBundleLoadCompleted:)]) {
                        [self.batchedBridge.javaScriptExecutor secondBundleLoadCompleted:NO];
                    }
                    completion(NO);
                }

                [self loadNextBundle];
            }
        });
    }
}

- (void)loadNextBundle {
    @synchronized(self) {
        if (self.pendingLoadBundles.count != 0) {
            SecondaryBundle *bundle = self.pendingLoadBundles[0];
            [self.pendingLoadBundles removeObject:bundle];
            [self loadSecondary:bundle.url loadBundleCompletion:bundle.loadBundleCompletion enqueueScriptCompletion:bundle.enqueueScriptCompletion
                             completion:bundle.completion];
        }
    }
}

- (BOOL)isSecondaryBundleURLLoaded:(NSURL *)secondaryBundleURL {
    @synchronized(self) {
        return [self.loadedBundleURLs objectForKey:secondaryBundleURL.absoluteString] != nil;
    }
}

@end
