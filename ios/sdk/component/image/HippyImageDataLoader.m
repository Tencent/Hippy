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

#import "HippyImageDataLoader.h"
#import "HippyUtils.h"
#import "HippyImageCacheManager.h"

NSString *const HippyImageDataLoaderErrorDomain = @"HippyImageDataLoaderErrorDomain";

const NSUInteger HippyImageDataLoaderErrorFileNotExists = 1000;
const NSUInteger HippyImageDataLoaderErrorNoPathIncoming = 1001;
const NSUInteger HippyImageDataLoaderErrorPathToUrl = 1002;

typedef NS_ENUM(NSUInteger, ImagePathType) {
    ImagePathTypeUnknown,
    ImagePathTypeHTTPPath,
    ImagePathTypeFilePath,
    ImagePathTypeBase64Path,
};

typedef void(^DownloadProgress)(NSUInteger, NSUInteger);
typedef void(^CompletionBlock)(id, NSString *, NSError *);

static ImagePathType checkPathTypeFromUrl(NSURL *Url) {
    ImagePathType type = ImagePathTypeUnknown;
    if ([Url isFileURL]) {
        type = ImagePathTypeFilePath;
    }
    else {
        NSString *path = [Url absoluteString];
        if ([path hasPrefix:@"http"]) {
            type = ImagePathTypeHTTPPath;
        }
        else if ([path containsString:@"data:image/"] && [path containsString:@";base64,"]) {
            type = ImagePathTypeBase64Path;
        }
    }
    return type;
}

static NSOperationQueue *ImageDataLoaderQueue(void) {
    static dispatch_once_t onceToken;
    static NSOperationQueue *_hippy_image_queue = nil;
    dispatch_once(&onceToken, ^{
        _hippy_image_queue = [[NSOperationQueue alloc] init];
        _hippy_image_queue.maxConcurrentOperationCount = 1;
    });
    return _hippy_image_queue;
}

@interface HippyImageDataLoader ()<NSURLSessionDataDelegate> {
    ImagePathType _imagePathType;
    NSURLSessionDataTask *_task;
    NSMutableData *_imageData;
    NSUInteger _imageDataTotalLength;
    DownloadProgress _progress;
    CompletionBlock _completion;
}

@end

@implementation HippyImageDataLoader

#pragma mark HippyImageDataLoaderProtocol Implementation

- (BOOL)canHandleImageAtUrl:(NSURL *)Url {
    ImagePathType type = checkPathTypeFromUrl(Url);
    return ImagePathTypeUnknown != type;
}

- (void)loadImageAtUrl:(NSURL *)Url progress:(DownloadProgress)progress
         completion:(CompletionBlock)dataCompletion {
    ImagePathType type = checkPathTypeFromUrl(Url);
    switch (type) {
        case ImagePathTypeHTTPPath:
            [self loadImageAtHTTPUrl:Url progress:progress dataCompletion:dataCompletion];
            break;
        case ImagePathTypeFilePath:
            [self loadImageAtFileUrl:Url progress:progress dataCompletion:dataCompletion];
            break;
        case ImagePathTypeBase64Path:
            [self loadImageAtBase64Url:Url progress:progress dataCompletion:dataCompletion];
            break;
        default:
            break;
    }
}

- (void)cancelImageDownloadAtUrl:(NSURL *)Url {
    [_task cancel];
}

#pragma mark Image Data Loader

- (void)loadImageAtHTTPUrl:(NSURL *)Url progress:(DownloadProgress)progress dataCompletion:(CompletionBlock)dataCompletion {
    if (_task) {
        [_task cancel];
    }
    if (Url) {
        NSURLSessionConfiguration *sessionConfiguration = [NSURLSessionConfiguration ephemeralSessionConfiguration];
        NSURLSession *session = [NSURLSession sessionWithConfiguration:sessionConfiguration delegate:self
                                                         delegateQueue:ImageDataLoaderQueue()];
        _task = [session dataTaskWithURL:Url];
        [_task resume];
        _progress = progress;
        _completion = dataCompletion;
    }
}

- (void)loadImageAtFileUrl:(NSURL *)Url progress:(DownloadProgress)progress dataCompletion:(CompletionBlock)dataCompletion {
    if (Url) {
        NSString *path = [Url path];
        BOOL isDirectory = NO;
        BOOL fileExists = [[NSFileManager defaultManager] fileExistsAtPath:path isDirectory:&isDirectory];
        if (fileExists) {
            NSError *error = nil;
            NSData *data = [NSData dataWithContentsOfFile:path options:NSDataReadingMappedIfSafe error:&error];
            if (error) {
                dataCompletion(nil, path, error);
            }
            else {
                NSUInteger length = [data length];
                if (progress) {
                    progress(length, length);
                }
                if (dataCompletion) {
                    dataCompletion(data, path, nil);
                }
            }
        }else {
            if (dataCompletion) {
                NSError *error = [NSError errorWithDomain:HippyImageDataLoaderErrorDomain code:HippyImageDataLoaderErrorFileNotExists userInfo:@{@"path": path}];
                dataCompletion(nil, path, error);
            }
        }
    }else {
        if (dataCompletion) {
            NSError *error = [NSError errorWithDomain:HippyImageDataLoaderErrorDomain code:HippyImageDataLoaderErrorNoPathIncoming userInfo:nil];
            dataCompletion(nil, [Url path], error);
        }
    }
}

- (void)loadImageAtBase64Url:(NSURL *)Url progress:(DownloadProgress)progress dataCompletion:(CompletionBlock)dataCompletion {
    if (Url) {
        if (Url) {
            NSError *error = nil;
            NSData *data = [NSData dataWithContentsOfURL:Url options:NSDataReadingMappedIfSafe error:&error];
            if (error) {
                dataCompletion(nil, [Url absoluteString], error);
            }else {
                NSUInteger length = [data length];
                if (progress) {
                    progress(length, length);
                }
                if (dataCompletion) {
                    dataCompletion(data, [Url absoluteString], nil);
                }
            }
        }else {
            if (dataCompletion) {
                NSError *error = [NSError errorWithDomain:HippyImageDataLoaderErrorDomain code:HippyImageDataLoaderErrorNoPathIncoming userInfo:nil];
                dataCompletion(nil, [Url absoluteString], error);
            }
        }
    }else {
        if (dataCompletion) {
            NSError *error = [NSError errorWithDomain:HippyImageDataLoaderErrorDomain code:HippyImageDataLoaderErrorNoPathIncoming userInfo:nil];
            dataCompletion(nil, [Url absoluteString], error);
        }
    }
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
        _imageData = [[NSMutableData alloc] initWithCapacity:capacity];
    }
}

- (void)URLSession:(__unused NSURLSession *)session dataTask:(NSURLSessionDataTask *)dataTask
    didReceiveData:(NSData *)data {
    if (_task == dataTask) {
        [_imageData appendData:data];
        if (_progress) {
            _progress([_imageData length], _imageDataTotalLength);
        }
    }
}

- (void)URLSession:(__unused NSURLSession *)session task:(NSURLSessionTask *)task didCompleteWithError:(nullable NSError *)error {
    if (_task == task) {
        if (_progress) {
            _progress([_imageData length], _imageDataTotalLength);
        }
        if (_completion) {
            _completion(_imageData, [[[task originalRequest] URL] absoluteString], error);
        }
    }
    [session finishTasksAndInvalidate];
}

- (void)dealloc {
    [_task cancel];
}

@end
