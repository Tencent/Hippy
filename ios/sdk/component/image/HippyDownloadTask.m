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

#import "HippyDownloadTask.h"

typedef void(^DownloadProgress)(NSUInteger, NSUInteger);
typedef void(^CompletionBlock)(NSData *, NSURL *, NSError *);

static NSOperationQueue *DataLoaderQueue(void) {
    static dispatch_once_t onceToken;
    static NSOperationQueue *_hippy_data_queue = nil;
    dispatch_once(&onceToken, ^{
        _hippy_data_queue = [[NSOperationQueue alloc] init];
        _hippy_data_queue.maxConcurrentOperationCount = 8;
    });
    return _hippy_data_queue;
}

@interface HippyDownloadTask ()<NSURLSessionDataDelegate> {
    NSURL *_URL;
    DownloadProgress _progress;
    CompletionBlock _completion;
    NSURLSessionDataTask *_task;
    NSMutableData *_data;
    NSUInteger _imageDataTotalLength;
}

@end

@implementation HippyDownloadTask

#pragma mark Life Cycle
- (instancetype)initWithURL:(NSURL *)URL progress:(DownloadProgress)progress
                 completion:(CompletionBlock)completion {
    self = [super init];
    if (self) {
        _URL = URL;
        _progress = progress;
        _completion = completion;
    }
    return self;
}

- (void)dealloc {
    [self cancel];
}

#pragma mark Download Task
- (void)beginTask {
    NSURLSessionConfiguration *sessionConfiguration = [NSURLSessionConfiguration ephemeralSessionConfiguration];
    NSURLSession *session = [NSURLSession sessionWithConfiguration:sessionConfiguration delegate:self
                                                     delegateQueue:DataLoaderQueue()];
    _task = [session dataTaskWithURL:_URL];
    [_task resume];
}

- (void)cancel {
    [_task cancel];
}

#pragma mark URL request delegate implementation
- (void)URLSession:(__unused NSURLSession *)session
          dataTask:(NSURLSessionDataTask *)dataTask
didReceiveResponse:(NSURLResponse *)response
 completionHandler:(void (^)(NSURLSessionResponseDisposition disposition))completionHandler {
    if (_task == dataTask) {
        _imageDataTotalLength = response.expectedContentLength;
        completionHandler(NSURLSessionResponseAllow);
        NSUInteger capacity =
            NSURLResponseUnknownLength != _imageDataTotalLength ? (NSUInteger)_imageDataTotalLength : 256;
        _data = [[NSMutableData alloc] initWithCapacity:capacity];
    }
}

- (void)URLSession:(__unused NSURLSession *)session dataTask:(NSURLSessionDataTask *)dataTask
    didReceiveData:(NSData *)data {
    if (_task == dataTask) {
        [_data appendData:data];
        if (_progress) {
            _progress([_data length], _imageDataTotalLength);
        }
    }
}

- (void)URLSession:(__unused NSURLSession *)session task:(NSURLSessionTask *)task didCompleteWithError:(nullable NSError *)error {
    if (_task == task) {
        if (_progress) {
            _progress([_data length], _imageDataTotalLength);
        }
        if (_completion) {
            _completion(_data, _URL, error);
        }
    }
    [session finishTasksAndInvalidate];
}

@end
