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
#import "NSURLSessionDataProgress.h"

#include <objc/runtime.h>

#include "VFSDefines.h"

static char *progressKey = nullptr;

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

static NSDictionary<NSString *, NSString *> *HttpHeadersFromMap(const std::unordered_map<std::string, std::string> &headers, const std::unordered_map<std::string, std::string> &additialInfo) {
    NSMutableDictionary<NSString *, NSString *> *headersMap = [NSMutableDictionary dictionaryWithCapacity:headers.size() + additialInfo.size()];
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
    for (const auto &it : additialInfo) {
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

void VFSUriHandler::RequestUntrustedContent(std::shared_ptr<hippy::RequestJob> request,
                                            std::shared_ptr<hippy::JobResponse> response,
                                            std::function<std::shared_ptr<UriHandler>()> next) {
    if (CheckRequestFromCPP(request->GetMeta())) {
        response->SetRetCode(hippy::vfs::UriHandler::RetCode::SchemeNotRegister);
        return;
    }
    NSURLRequest *req = RequestFromUriWithHeaders(request->GetUri(), request->GetMeta());
    if (!request) {
        auto nextHandler = next();
        if (nextHandler) {
            nextHandler->RequestUntrustedContent(request, response, next);
        }
        else {
            //try to get next loader
            HPUriLoader *loader = GetLoader();
            if (loader) {
                ForwardToHPUriLoader(request, response);
            }
            else {
                response->SetRetCode(hippy::vfs::UriHandler::RetCode::UriError);
            }
        }
        return;
    }
    typedef void (^DataTaskResponse)(NSData * data, NSURLResponse *response, NSError *error);
    dispatch_semaphore_t sem = dispatch_semaphore_create(0);
    DataTaskResponse rsp = ^(NSData * data, NSURLResponse *resp, NSError *error){
        if (error) {
            response->SetRetCode(RetCodeFromNSError(error));
            NSString *errorMsg = [error localizedFailureReason];
            response->SetErrorMessage(NSStringToU8StringView(errorMsg));
        }
        else {
            response->SetRetCode(hippy::vfs::UriHandler::RetCode::Success);
            std::string content(reinterpret_cast<const char *>([data bytes]) , [data length]);
            response->SetContent(std::move(content));
            std::unordered_map<std::string, std::string> respMap = [resp toUnorderedMap];
            response->SetMeta(std::move(respMap));
        }
        dispatch_semaphore_signal(sem);
    };
    NSURLSessionDataTask *dataTask = [[NSURLSession sharedSession] dataTaskWithRequest:req completionHandler:rsp];
    [dataTask resume];
    dispatch_semaphore_wait(sem, DISPATCH_TIME_FOREVER);
}

void VFSUriHandler::RequestUntrustedContent(std::shared_ptr<hippy::RequestJob> request,
                                            std::function<void(std::shared_ptr<hippy::JobResponse>)> cb,
                                            std::function<std::shared_ptr<UriHandler>()> next) {
    if (CheckRequestFromCPP(request->GetMeta())) {
        std::unordered_map<std::string, std::string> map;
        bytes contents = "";
        auto job_resp = std::make_shared<hippy::JobResponse>(hippy::vfs::UriHandler::RetCode::SchemeNotRegister);
        cb(job_resp);
        return;
    }
    NSURLRequest *req = RequestFromUriWithHeaders(request->GetUri(), request->GetMeta());
    if (!req) {
        auto nextHandler = next();
        if (nextHandler) {
            nextHandler->RequestUntrustedContent(request, cb, next);
        }
        else {
            //try to get next loader
            HPUriLoader *loader = GetLoader();
            if (loader) {
                ForwardToHPUriLoader(request, cb);
            }
            else {
                std::unordered_map<std::string, std::string> map;
                bytes contents = "";
                auto job_resp = std::make_shared<hippy::JobResponse>(hippy::vfs::UriHandler::RetCode::UriError);
                cb(job_resp);
            }
        }
        return;
    }
    NSURLSessionDataProgress *dataProgress = [[NSURLSessionDataProgress alloc] initWithRequestJob:request responseCallback:cb];
    NSURLSession *session = [NSURLSession sessionWithConfiguration:[NSURLSessionConfiguration defaultSessionConfiguration] delegate:dataProgress delegateQueue:nil];
    NSURLSessionDataTask *dataTask = [session dataTaskWithRequest:req];
    objc_setAssociatedObject(dataTask, &progressKey, dataProgress, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    [dataTask resume];
}

void VFSUriHandler::ForwardToHPUriLoader(std::shared_ptr<hippy::RequestJob> request,
                                         std::function<void(std::shared_ptr<hippy::JobResponse>)> cb) {
    HPUriLoader *loader = GetLoader();
    if (!loader) {
        return;
    }
    NSString *urlString = StringViewToNSString(request->GetUri());
    auto &map = request->GetMeta();
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
    std::unordered_map<std::string, std::string> additionInfo;
    additionInfo[kRequestOrigin] = kRequestFromCPP;
    NSDictionary<NSString *, NSString *> *headers = HttpHeadersFromMap(map, additionInfo);
    [loader requestContentAsync:urlString method:method headers:headers body:body progress:^(NSUInteger current, NSUInteger total) {
        auto progressCallback = request->GetProgressCallback();
        if (progressCallback) {
            progressCallback(current, total);
        }
    } result:^(NSData *data, NSURLResponse *response, NSError *error) {
        auto code = RetCodeFromNSError(error);
        auto res_map = [response toUnorderedMap];
        std::string contents(reinterpret_cast<const char *>([data bytes]), [data length]);
        auto jobResp = std::make_shared<hippy::JobResponse>(code, NSStringToU16StringView([error localizedFailureReason]), res_map, std::move(contents));
    }];
}

void VFSUriHandler::ForwardToHPUriLoader(std::shared_ptr<hippy::RequestJob> request,
                                         std::shared_ptr<hippy::JobResponse> response) {
    HPUriLoader *loader = GetLoader();
    if (!loader) {
        return;
    }
    NSString *urlString = StringViewToNSString(request->GetUri());
    auto &map = request->GetMeta();
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
    std::unordered_map<std::string, std::string> additionInfo;
    additionInfo[kRequestOrigin] = kRequestFromCPP;
    NSDictionary<NSString *, NSString *> *headers = HttpHeadersFromMap(map, additionInfo);
    NSURLResponse *resp = nil;
    NSError *error = nil;
    NSData *responseData = [loader requestContentSync:urlString method:method headers:headers body:body response:&resp error:&error];
    auto code = RetCodeFromNSError(error);
    auto res_map = [resp toUnorderedMap];
    std::string contents(reinterpret_cast<const char *>([responseData bytes]), [responseData length]);
    response->SetMeta(std::move(res_map));
    response->SetRetCode(code);
    response->SetContent(std::move(contents));
}
