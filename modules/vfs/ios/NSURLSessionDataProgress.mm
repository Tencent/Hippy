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

#import "NSURLSessionDataProgress.h"
#import "TypeConverter.h"
#import "NSURLResponse+ToUnorderedMap.h"
#import "HippyFootstoneUtils.h"

#include "vfs/job_response.h"
#include "vfs/request_job.h"

hippy::vfs::UriHandler::RetCode RetCodeFromNSError(NSError *error) {
    if (!error) {
        return hippy::vfs::UriHandler::RetCode::Success;
    }
    hippy::vfs::UriHandler::RetCode retCode = hippy::vfs::UriHandler::RetCode::Failed;
    if ([[error domain] isEqualToString:NSURLErrorDomain]) {
        switch ([error code]) {
            case NSURLErrorBadURL:
            case NSURLErrorUnsupportedURL:
            case NSURLErrorDNSLookupFailed:
                retCode = hippy::vfs::UriHandler::RetCode::UriError;
                break;
            case NSURLErrorCannotFindHost:
            case NSURLErrorCannotConnectToHost:
            case NSURLErrorNetworkConnectionLost:
            case NSURLErrorFileIsDirectory:
            case NSURLErrorNoPermissionsToReadFile:
                retCode = hippy::vfs::UriHandler::RetCode::PathError;
                break;
            case NSURLErrorResourceUnavailable:
                retCode = hippy::vfs::UriHandler::RetCode::ResourceNotFound;
                break;
            case NSURLErrorNotConnectedToInternet:
            case NSURLErrorUserCancelledAuthentication:
            case NSURLErrorUserAuthenticationRequired:
            case NSURLErrorCannotDecodeRawData:
            case NSURLErrorCannotDecodeContentData:
            case NSURLErrorCannotParseResponse:
            case NSURLErrorAppTransportSecurityRequiresSecureConnection:
                retCode = hippy::vfs::UriHandler::RetCode::DelegateError;
                break;
            case NSURLErrorTimedOut:
                retCode = hippy::vfs::UriHandler::RetCode::Timeout;
                break;
            default:
                break;
        }
    }
    return retCode;
}


@interface NSURLSessionDataProgress () {
    NSUInteger _totalCount;
    
    std::string _currentReceivedString;
    std::shared_ptr<hippy::RequestJob> _requestJob;
    std::function<void(std::shared_ptr<hippy::JobResponse>)> _cb;
    
    NSMutableData *_currentReceivedData;
    VFSHandlerProgressBlock _progress;
    VFSHandlerCompletionBlock _result;
    
    BOOL _cxxType;
}

@end

@implementation NSURLSessionDataProgress

- (instancetype)initWithRequestJob:(const std::shared_ptr<hippy::RequestJob> &)requestJob
                  responseCallback:(std::function<void(std::shared_ptr<hippy::JobResponse>)>)cb {
    self = [super init];
    if (self) {
        _requestJob = requestJob;
        _cb = cb;
        _cxxType = YES;
    }
    return self;
}

- (instancetype)initWithProgress:(VFSHandlerProgressBlock)progress
                          result:(VFSHandlerCompletionBlock)result {
    self = [super init];
    if (self) {
        _progress = [progress copy];
        _result = [result copy];
    }
    return self;
}

- (void)URLSession:(NSURLSession *)session
              task:(NSURLSessionTask *)task
didCompleteWithError:(nullable NSError *)error {
    if (_cxxType) {
        if (_cb) {
            if (error) {
                std::unordered_map<std::string, std::string> map;
                auto job_resp = std::make_shared<hippy::JobResponse>(RetCodeFromNSError(error), NSStringToU8StringView([error localizedFailureReason]), map, "");
                _cb(job_resp);
            }
            else {
                std::unordered_map<std::string, std::string> respMap = [task.response toUnorderedMap];
                auto job_resp = std::make_shared<hippy::JobResponse>(hippy::vfs::UriHandler::RetCode::Success, "", respMap, std::move(_currentReceivedString));
                _cb(job_resp);
            }
        }
    }
    else {
        if (_result) {
            _result(_currentReceivedData, nil, task.response, error);
        }
    }
    [session finishTasksAndInvalidate];
}

- (void)URLSession:(NSURLSession *)session
          dataTask:(NSURLSessionDataTask *)dataTask
didReceiveResponse:(NSURLResponse *)response
 completionHandler:(void (^)(NSURLSessionResponseDisposition disposition))completionHandler {
    long long expectedContentLength = [response expectedContentLength] > 0 ? [response expectedContentLength] : 0;
    if (_cxxType) {
        _currentReceivedString.reserve(expectedContentLength);
    }
    else {
        _currentReceivedData = [NSMutableData dataWithCapacity:expectedContentLength];
    }
    _totalCount = expectedContentLength;
    completionHandler(NSURLSessionResponseAllow);
}

- (void)URLSession:(NSURLSession *)session
          dataTask:(NSURLSessionDataTask *)dataTask
    didReceiveData:(NSData *)data {
    if (_cxxType) {
        std::string contents(reinterpret_cast<const char *>([data bytes]) , [data length]);
        _currentReceivedString.append(contents);
        if (_requestJob) {
            auto progressCallback = _requestJob->GetProgressCallback();
            if (progressCallback) {
                progressCallback(_currentReceivedString.size(), _totalCount);
            }
        }
    }
    else {
        [_currentReceivedData appendData:data];
        if (_progress) {
            _progress([_currentReceivedData length], _totalCount);
        }
    }
}

@end
