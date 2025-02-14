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

#import "HippyBridge+BundleLoad.h"
#import "HippyBridge+Private.h"
#import "HippyBridge+VFSLoader.h"
#import "HippyJSExecutor.h"
#import "HippyAssert.h"
#import "HippyRedBox.h"
#import "HippyLog.h"


// Bundle related
#define HIPPY_BUNDLE_FETCH_TIMEOUT_SEC    30 // Bundle fetch operation timeout value, 30s
static NSString *const kHippyBundleFetchQueueName = @"com.hippy.bundleQueue.fetch";
static NSString *const kHippyBundleExecuteQueueName = @"com.hippy.bundleQueue.execute";
static NSString *const kHippyBundleLoadErrorDomain = @"HippyBundleLoadErrorDomain";
static NSString *const kFileUriScheme = @"file";


@implementation HippyBridge (BundleLoad)

- (void)prepareBundleQueue {
    NSOperationQueue *bundleQueue = [[NSOperationQueue alloc] init];
    bundleQueue.qualityOfService = NSQualityOfServiceUserInitiated;
    bundleQueue.name = kHippyBundleFetchQueueName;
    bundleQueue.maxConcurrentOperationCount = NSOperationQueueDefaultMaxConcurrentOperationCount;
    self.bundleQueue = bundleQueue;
}

- (BOOL)isLoading {
    HippyAssertMainQueue();
    return self.loadingCount > 0;
}

#pragma mark - Bundle Load

#define BUNDLE_LOAD_NOTI_SUCCESS_USER_INFO(whichSelf) \
@{ kHippyNotiBridgeKey: whichSelf, \
   kHippyNotiBundleUrlKey: bundleURL, \
   kHippyNotiBundleTypeKey : @(bundleType) }

#define BUNDLE_LOAD_NOTI_ERROR_USER_INFO(whichSelf) \
@{ kHippyNotiBridgeKey: whichSelf, \
   kHippyNotiBundleUrlKey: bundleURL, \
   kHippyNotiBundleTypeKey : @(bundleType), \
   kHippyNotiErrorKey : error }

- (void)loadBundleURL:(NSURL *)bundleURL
           bundleType:(HippyBridgeBundleType)bundleType
           completion:(nonnull HippyBridgeBundleLoadCompletionBlock)completion {
    HippyAssertParam(bundleURL);
    if (!bundleURL) {
        if (completion) {
            static NSString *bundleError = @"bundle url is nil";
            NSError *error = HippyErrorWithMessage(bundleError);
            completion(nil, error);
        }
        return;
    }
    
    // bundleURL checking
    NSURLComponents *components = [NSURLComponents componentsWithURL:bundleURL resolvingAgainstBaseURL:NO];
    if (components.scheme == nil) {
        // If a given url has no scheme, it is considered a file url by default.
        components.scheme = kFileUriScheme;
        bundleURL = components.URL;
    }
    
    HippyLogInfo(@"[HP PERF] Begin loading bundle(%s) at %s",
                 HIPPY_CSTR_NOT_NULL(bundleURL.absoluteString.lastPathComponent.UTF8String),
                 HIPPY_CSTR_NOT_NULL(bundleURL.absoluteString.UTF8String));
    [self.allBundleURLs addObject:bundleURL];
    
    NSDictionary *userInfo = BUNDLE_LOAD_NOTI_SUCCESS_USER_INFO(self);
    [[NSNotificationCenter defaultCenter] postNotificationName:HippyJavaScriptWillStartLoadingNotification
                                                        object:self
                                                      userInfo:userInfo];
    [self beginLoadingBundle:bundleURL bundleType:bundleType completion:completion];
}

- (void)beginLoadingBundle:(NSURL *)bundleURL
                bundleType:(HippyBridgeBundleType)bundleType
                completion:(HippyBridgeBundleLoadCompletionBlock)completion {
    HippyAssertMainQueue();
    HippyAssertParam(bundleURL);
    HippyAssertParam(completion);
    
    __weak __typeof(self)weakSelf = self;
    __block NSData *script = nil;
    self.loadingCount++;
    
    // Fetch operation
    NSBlockOperation *fetchOperation = [NSBlockOperation blockOperationWithBlock:^{
        __strong __typeof(weakSelf) strongSelf = weakSelf;
        if (!strongSelf) {
            return;
        }
        HippyLogInfo(@"Start fetching bundle(%s)",
                     HIPPY_CSTR_NOT_NULL(bundleURL.absoluteString.lastPathComponent.UTF8String));
        // create semaphore
        dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);
        [strongSelf fetchBundleWithURL:bundleURL completion:^(NSData *source, NSError *error) {
            __strong __typeof(weakSelf)strongSelf = weakSelf;
            if (!strongSelf || !bundleURL) {
                return;
            }
            NSDictionary *userInfo;
            if (error) {
                HippyBridgeFatal(error, strongSelf);
                userInfo = BUNDLE_LOAD_NOTI_ERROR_USER_INFO(strongSelf);
            } else {
                script = source;
                userInfo = BUNDLE_LOAD_NOTI_SUCCESS_USER_INFO(strongSelf);
            }
            [[NSNotificationCenter defaultCenter] postNotificationName:HippyJavaScripDidLoadSourceCodeNotification
                                                                object:strongSelf
                                                              userInfo:userInfo];
            HippyLogInfo(@"End fetching bundle(%s) error?:%@",
                         HIPPY_CSTR_NOT_NULL(bundleURL.absoluteString.lastPathComponent.UTF8String), error);
            dispatch_semaphore_signal(semaphore);  // release semaphore
        }];
        // wait semaphore
        dispatch_time_t timeout = dispatch_time(DISPATCH_TIME_NOW, HIPPY_BUNDLE_FETCH_TIMEOUT_SEC * NSEC_PER_SEC);
        intptr_t result = dispatch_semaphore_wait(semaphore, timeout);
        if (result != 0) {
            HippyLogError(@"Fetch operation timed out!!! (30s)");
        }
    }];
    
    // Execution operation
    NSBlockOperation *executeOperation = [NSBlockOperation blockOperationWithBlock:^{
        HippyLogInfo(@"Start executing bundle(%s)",
                     HIPPY_CSTR_NOT_NULL(bundleURL.absoluteString.lastPathComponent.UTF8String));
        __strong __typeof(weakSelf) strongSelf = weakSelf;
        if (!strongSelf || !strongSelf.valid || !script) {
            NSString *errMsg = [NSString stringWithFormat:@"Bundle Execution Operation Fail! valid:%d, script:%@",
                                strongSelf.valid, script];
            HippyLogError(@"%@", errMsg);
            completion(bundleURL, HippyErrorWithMessage(errMsg));
            @synchronized (self) {
                strongSelf.lastExecuteOperation = nil;
            }
            return;
        }
        [strongSelf executeJSCode:script sourceURL:bundleURL onCompletion:^(id result, NSError *error) {
            HippyLogInfo(@"End executing bundle(%s)",
                         HIPPY_CSTR_NOT_NULL(bundleURL.absoluteString.lastPathComponent.UTF8String));
            @synchronized (self) {
                strongSelf.lastExecuteOperation = nil;
            }
            if (completion) {
                completion(bundleURL, error);
            }
            if (!strongSelf || !strongSelf.valid) {
                return;
            }
            if (error) {
                HippyBridgeFatal(error, strongSelf);
            }
            
            dispatch_async(dispatch_get_main_queue(), ^{
                __strong __typeof(weakSelf)strongSelf = weakSelf;
                if (!strongSelf) {
                    return;
                }
                strongSelf.loadingCount--;
                NSNotificationName notiName = error ? HippyJavaScriptDidFailToLoadNotification : HippyJavaScriptDidLoadNotification;
                NSDictionary *userInfo = error ? BUNDLE_LOAD_NOTI_ERROR_USER_INFO(strongSelf) : BUNDLE_LOAD_NOTI_SUCCESS_USER_INFO(strongSelf);
                [[NSNotificationCenter defaultCenter] postNotificationName:notiName object:strongSelf userInfo:userInfo];
            });
        }];
    }];
    
    // Add dependency, make sure that doing fetch before execute,
    // and all execution operations must be queued.
    [executeOperation addDependency:fetchOperation];
    @synchronized (self) {
        NSOperation *lastOp = self.lastExecuteOperation;
        if (lastOp) {
            [executeOperation addDependency:lastOp];
        }
    }
    
    // Enqueue operation
    [self.bundleQueue addOperations:@[fetchOperation, executeOperation] waitUntilFinished:NO];
    @synchronized (self) {
        self.lastExecuteOperation = executeOperation;
    }
}

#pragma mark - Bundle Fetch and Execute

/// Fetch JS Bundle
- (void)fetchBundleWithURL:(NSURL *)bundleURL completion:(void (^)(NSData *source, NSError *error))completion {
    HippyAssertParam(bundleURL);
    HippyAssertParam(completion);
    // Fetch the bundle
    // Call the completion handler with the fetched data or error
    [self loadContentsAsyncFromUrl:bundleURL.absoluteString
                            params:nil
                             queue:nil
                          progress:nil
                 completionHandler:^(NSData * _Nullable data,
                                     NSDictionary * _Nullable userInfo,
                                     NSURLResponse * _Nullable response,
                                     NSError * _Nullable error) {
        completion(data, error);
    }];
}

/// Execute JS Bundle
- (void)executeJSCode:(NSData *)script
            sourceURL:(NSURL *)sourceURL
         onCompletion:(HippyJavaScriptCallback)completion {
    if (!script) {
        completion(nil, HippyErrorWithMessageAndModuleName(@"no valid data", self.moduleName));
        return;
    }
    if (![self isValid] || !script || !sourceURL) {
        completion(nil, HippyErrorWithMessageAndModuleName(@"bridge is not valid", self.moduleName));
        return;
    }
    HippyAssert(self.javaScriptExecutor, @"js executor must not be null");
    __weak __typeof(self)weakSelf = self;
    [self.javaScriptExecutor executeApplicationScript:script sourceURL:sourceURL onComplete:^(id result ,NSError *error) {
        __strong __typeof(weakSelf)strongSelf = weakSelf;
        if (!strongSelf || ![strongSelf isValid]) {
            completion(result, error);
            return;
        }
        if (error) {
            HippyLogError(@"ExecuteApplicationScript Error! %@", error.description);
            HippyExecuteOnMainQueue(^{
                __strong __typeof(weakSelf)strongSelf = weakSelf;
                [strongSelf stopLoadingWithError:error scriptSourceURL:sourceURL];
            });
        }
        completion(result, error);
    }];
}

- (void)stopLoadingWithError:(NSError *)error scriptSourceURL:(NSURL *)sourceURL {
    HippyAssertMainQueue();
    if (![self isValid]) {
        return;
    }
    __weak HippyBridge *weakSelf = self;
    [self.javaScriptExecutor executeBlockOnJavaScriptQueue:^{
        HippyBridge *strongSelf = weakSelf;
        if (!strongSelf || ![strongSelf isValid]) {
            [strongSelf.javaScriptExecutor invalidate];
        }
    }];
    if ([error userInfo][HippyJSStackTraceKey]) {
        [self.redBox showErrorMessage:[error localizedDescription] withStack:[error userInfo][HippyJSStackTraceKey]];
    }
}

@end
