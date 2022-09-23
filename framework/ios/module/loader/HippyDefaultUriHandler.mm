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

#import "FootstoneUtils.h"
#import "HippyDefaultUriHandler.h"

static NSURLRequest *RequestFromUriWithHeaders(const footstone::string_view &uri,
                                                     const std::unordered_map<std::string, std::string> &headers) {
    NSURL *url = StringViewToNSURL(uri);
    if (!url) {
        return nil;
    }
    NSMutableURLRequest *request = [[NSMutableURLRequest alloc] initWithURL:url cachePolicy:NSURLRequestUseProtocolCachePolicy timeoutInterval:10];
    for (const auto &it : headers) {
        NSString *headerKey = [NSString stringWithUTF8String:it.first.c_str()];
        NSString *headerValue = [NSString stringWithUTF8String:it.second.c_str()];
        [request setValue:headerValue forHTTPHeaderField:headerKey];
    }
    return [request copy];
}

static hippy::vfs::UriHandler::RetCode RetCodeFromNSError(NSError *error) {
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

void HippyDefaultUriHandler::RequestUntrustedContent(std::shared_ptr<hippy::vfs::UriHandler::SyncContext> ctx,
                                               std::function<std::shared_ptr<hippy::vfs::UriHandler>()> next) {
    NSURLRequest *request = RequestFromUriWithHeaders(ctx->uri, ctx->req_meta);
    if (!request) {
        ctx->code = hippy::vfs::UriHandler::RetCode::UriError;
        return;
    }
    typedef void (^DataTaskResponse)(NSData * data, NSURLResponse *response, NSError *error);
    dispatch_semaphore_t sem = dispatch_semaphore_create(0);
    DataTaskResponse response = ^(NSData * data, NSURLResponse *response, NSError *error){
        if (error) {
            ctx->code = RetCodeFromNSError(error);
        }
        else {
            ctx->code = hippy::vfs::UriHandler::RetCode::Success;
            std::string content(reinterpret_cast<const char *>([data bytes]) , [data length]);
            ctx->content = content;
            if ([response isKindOfClass:[NSHTTPURLResponse class]]) {
                NSHTTPURLResponse *httpResp = (NSHTTPURLResponse *)response;
                NSDictionary *headerFields = [httpResp allHeaderFields];
                std::unordered_map<std::string, std::string> respMap;
                respMap.reserve([headerFields count]);
                for (NSString *key in headerFields) {
                    NSString *value = headerFields[key];
                    std::string keyString([key UTF8String]);
                    std::string valueString([value UTF8String]);
                    respMap[keyString] = valueString;
                }
                ctx->rsp_meta = respMap;
            }
        }
        dispatch_semaphore_signal(sem);
    };
    NSURLSessionDataTask *dataTask = [[NSURLSession sharedSession] dataTaskWithRequest:request completionHandler:response];
    [dataTask resume];
    dispatch_semaphore_wait(sem, DISPATCH_TIME_FOREVER);
}

void HippyDefaultUriHandler::RequestUntrustedContent(std::shared_ptr<hippy::vfs::UriHandler::ASyncContext> ctx,
                                               std::function<std::shared_ptr<hippy::vfs::UriHandler>()> next) {
    NSURLRequest *request = RequestFromUriWithHeaders(ctx->uri, ctx->meta);
    if (!request) {
        ctx->cb(hippy::vfs::UriHandler::RetCode::UriError, std::unordered_map<std::string, std::string>(), "");
        return;
    }
    typedef void (^DataTaskResponse)(NSData * data, NSURLResponse *response, NSError *error);
    DataTaskResponse response = ^(NSData * data, NSURLResponse *response, NSError *error){
        if (error) {
            ctx->cb(RetCodeFromNSError(error), std::unordered_map<std::string, std::string>(), "");
        }
        else {
            std::string content(reinterpret_cast<const char *>([data bytes]) , [data length]);
            if ([response isKindOfClass:[NSHTTPURLResponse class]]) {
                NSHTTPURLResponse *httpResp = (NSHTTPURLResponse *)response;
                NSDictionary *headerFields = [httpResp allHeaderFields];
                std::unordered_map<std::string, std::string> respMap;
                respMap.reserve([headerFields count]);
                for (NSString *key in headerFields) {
                    NSString *value = headerFields[key];
                    std::string keyString([key UTF8String]);
                    std::string valueString([value UTF8String]);
                    respMap[keyString] = valueString;
                }
                ctx->cb(hippy::vfs::UriHandler::RetCode::Success, respMap, content);
            }
            else {
                ctx->cb(hippy::vfs::UriHandler::RetCode::Success, std::unordered_map<std::string, std::string>(), content);
            }
        }
    };
    NSURLSessionDataTask *dataTask = [[NSURLSession sharedSession] dataTaskWithRequest:request completionHandler:response];
    [dataTask resume];
}
