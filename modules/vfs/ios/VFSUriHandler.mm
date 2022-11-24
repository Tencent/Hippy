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

#import "VFSUriHandler.h"
#import "NSURLResponse+ToUnorderedMap.h"
#import "TypeConverter.h"
#import "HPUriLoader.h"

#include "VFSDefines.h"

static bool CheckRequestFromCPP(const std::unordered_map<std::string, std::string> &headers) {
    auto find = headers.find(kRequestOrigin);
    if (headers.end() != find) {
        if (0 == std::strcmp(kRequestFromCPP, find->second.c_str())) {
            return true;
        }
    }
    return false;
}

static NSDictionary<NSString *, NSString *> *HttpHeadersFromMap(const std::unordered_map<std::string, std::string> &headers) {
    NSMutableDictionary<NSString *, NSString *> *headersMap = [NSMutableDictionary dictionaryWithCapacity:headers.size()];
    for (const auto &it : headers) {
        if (0 == strcasecmp(kHeaderMethod, it.first.c_str())) {
            continue;
        }
        else if (0 == strcasecmp(kHeaderBody, it.first.c_str())) {
            continue;
        }
        NSString *headerKey = [NSString stringWithUTF8String:it.first.c_str()];
        NSString *headerValue = [NSString stringWithUTF8String:it.second.c_str()];
        [headersMap setObject:headerValue forKey:headerKey];
    }
    return [headersMap copy];
}

static NSURLRequest *RequestFromUriWithHeaders(const footstone::string_view &uri,
                                                     const std::unordered_map<std::string, std::string> &headers) {
    NSURL *url = StringViewToNSURL(uri);
    if (!url) {
        return nil;
    }
    NSMutableURLRequest *request = [[NSMutableURLRequest alloc] initWithURL:url cachePolicy:NSURLRequestUseProtocolCachePolicy timeoutInterval:10];
    [request setAllHTTPHeaderFields:HttpHeadersFromMap(headers)];
    return [request copy];
}

hippy::vfs::UriHandler::RetCode RetCodeFromNSError(NSError *error) {
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

void VFSUriHandler::RequestUntrustedContent(std::shared_ptr<hippy::vfs::UriHandler::SyncContext> ctx,
                                               std::function<std::shared_ptr<hippy::vfs::UriHandler>()> next) {
    if (CheckRequestFromCPP(ctx->req_meta)) {
        ctx->code = hippy::vfs::UriHandler::RetCode::SchemeNotRegister;
        return;
    }
    NSURLRequest *request = RequestFromUriWithHeaders(ctx->uri, ctx->req_meta);
    if (!request) {
        auto nextHandler = next();
        if (nextHandler) {
            nextHandler->RequestUntrustedContent(ctx, next);
        }
        else {
            //try to get next loader
            HPUriLoader *loader = GetLoader();
            if (loader) {
                ForwardToHPUriLoader(std::move(ctx));
            }
            else {
                ctx->code = hippy::vfs::UriHandler::RetCode::UriError;
            }
        }
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
            std::unordered_map<std::string, std::string> respMap = [response toUnorderedMap];
            ctx->rsp_meta = std::move(respMap);
        }
        dispatch_semaphore_signal(sem);
    };
    NSURLSessionDataTask *dataTask = [[NSURLSession sharedSession] dataTaskWithRequest:request completionHandler:response];
    [dataTask resume];
    dispatch_semaphore_wait(sem, DISPATCH_TIME_FOREVER);
}

void VFSUriHandler::RequestUntrustedContent(std::shared_ptr<hippy::vfs::UriHandler::ASyncContext> ctx,
                                               std::function<std::shared_ptr<hippy::vfs::UriHandler>()> next) {
    if (CheckRequestFromCPP(ctx->req_meta)) {
        std::unordered_map<std::string, std::string> map;
        bytes contents = "";
        ctx->cb(hippy::vfs::UriHandler::RetCode::SchemeNotRegister, map, contents);
        return;
    }
    NSURLRequest *request = RequestFromUriWithHeaders(ctx->uri, ctx->req_meta);
    if (!request) {
        auto nextHandler = next();
        if (nextHandler) {
            nextHandler->RequestUntrustedContent(ctx, next);
        }
        else {
            //try to get next loader
            HPUriLoader *loader = GetLoader();
            if (loader) {
                ForwardToHPUriLoader(std::move(ctx));
            }
            else {
                std::unordered_map<std::string, std::string> map;
                bytes contents = "";
                ctx->cb(hippy::vfs::UriHandler::RetCode::UriError, map, contents);
            }
        }
        return;
    }
    typedef void (^DataTaskResponse)(NSData * data, NSURLResponse *response, NSError *error);
    DataTaskResponse response = ^(NSData * data, NSURLResponse *response, NSError *error){
        if (error) {
            std::unordered_map<std::string, std::string> map;
            bytes contents;
            ctx->cb(RetCodeFromNSError(error), map, contents);
        }
        else {
            std::string content(reinterpret_cast<const char *>([data bytes]) , [data length]);
            std::unordered_map<std::string, std::string> respMap = [response toUnorderedMap];
            ctx->cb(hippy::vfs::UriHandler::RetCode::Success, respMap, content);
        }
    };
    NSURLSessionDataTask *dataTask = [[NSURLSession sharedSession] dataTaskWithRequest:request completionHandler:response];
    [dataTask resume];
}

void VFSUriHandler::ForwardToHPUriLoader(std::shared_ptr<hippy::vfs::UriHandler::ASyncContext> ctx) {
    HPUriLoader *loader = GetLoader();
    if (!loader) {
        return;
    }
    NSString *urlString = StringViewToNSString(ctx->uri);
    auto &map = ctx->req_meta;
    auto search = map.find(kHeaderBody);
    NSData *body = nil;
    if (map.end() != search) {
        const auto &data = search->second;
        body = [NSData dataWithBytes:reinterpret_cast<const void *>(data.c_str()) length:data.length()];
    }
    search = map.find(kHeaderMethod);
    NSString *method = @"get";
    if (map.end() != search) {
        method = [NSString stringWithUTF8String:search->second.c_str()];
    }
    else {
        method = body?@"post":@"get";
    }
    map[kRequestOrigin] = kRequestFromCPP;
    NSDictionary<NSString *, NSString *> *headers = HttpHeadersFromMap(map);
    auto cb = ctx->cb;
    [loader requestContentAsync:urlString method:method headers:headers body:body result:^(NSData *data, NSURLResponse *response, NSError *error) {
        auto code = RetCodeFromNSError(error);
        auto res_map = [response toUnorderedMap];
        std::string contents(reinterpret_cast<const char *>([data bytes]), [data length]);
        cb(code, res_map, contents);
    }];
}

void VFSUriHandler::ForwardToHPUriLoader(std::shared_ptr<hippy::vfs::UriHandler::SyncContext> ctx) {
    HPUriLoader *loader = GetLoader();
    if (!loader) {
        return;
    }
    NSString *urlString = StringViewToNSString(ctx->uri);
    auto &map = ctx->req_meta;
    auto search = map.find(kHeaderBody);
    NSData *body = nil;
    if (map.end() != search) {
        const auto &data = search->second;
        body = [NSData dataWithBytes:reinterpret_cast<const void *>(data.c_str()) length:data.length()];
    }
    search = map.find(kHeaderMethod);
    NSString *method = @"get";
    if (map.end() != search) {
        method = [NSString stringWithUTF8String:search->second.c_str()];
    }
    else {
        method = body?@"post":@"get";
    }
    map[kRequestOrigin] = kRequestFromCPP;
    NSDictionary<NSString *, NSString *> *headers = HttpHeadersFromMap(map);
    NSURLResponse *response = nil;
    NSError *error = nil;
    NSData *responseData = [loader requestContentSync:urlString method:method headers:headers body:body response:&response error:&error];
    auto code = RetCodeFromNSError(error);
    auto res_map = [response toUnorderedMap];
    std::string contents(reinterpret_cast<const char *>([responseData bytes]), [responseData length]);
    ctx->rsp_meta = std::move(res_map);
    ctx->code = code;
    ctx->content = contents;
}
