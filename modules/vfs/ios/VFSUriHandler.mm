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
#import "HippyFootstoneUtils.h"
#import "NSURLResponse+ToUnorderedMap.h"
#import "NSURLSessionDataProgress.h"
#import "TypeConverter.h"
#import "VFSUriHandler.h"
#import "VFSUriLoader.h"
#import "HippyImageViewCustomLoader.h"
#include "footstone/string_view_utils.h"
#include "vfs/uri_loader.h"
#include <objc/runtime.h>


static char *progressKey = nullptr;
NSString *const kHippyVFSRequestResTypeKey = @"kHippyVFSRequestResTypeKey";
NSString *const kHippyVFSRequestCustomImageLoaderKey = @"kHippyVFSRequestCustomImageLoaderKey";
NSString *const kHippyVFSRequestExtraInfoForCustomImageLoaderKey = @"kHippyVFSRequestExtraInfoForCustomImageLoaderKey";
NSString *const HippyVFSResponseDecodedImageKey = @"HippyVFSResponseDecodedImageKey";


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
    NSMutableURLRequest *request = [[NSMutableURLRequest alloc] initWithURL:url];
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
            std::shared_ptr<VFSUriLoader> loader = GetLoader().lock();
            if (loader) {
                //load synchronously unimplemented, use asynchronously method
                FOOTSTONE_UNIMPLEMENTED();
            }
            else {
                response->SetRetCode(hippy::vfs::UriHandler::RetCode::UriError);
            }
        }
        return;
    }
    dispatch_semaphore_t sem = dispatch_semaphore_create(0);
    VFSHandlerCompletionBlock rsp = ^(NSData * data, NSDictionary *userInfo, NSURLResponse *resp, NSError *error){
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
    NSURLSessionDataTask *dataTask = [[NSURLSession sharedSession] dataTaskWithRequest:req 
                                                                     completionHandler:^(NSData * _Nullable data,
                                                                                         NSURLResponse * _Nullable response,
                                                                                         NSError * _Nullable error) {
        rsp(data, nil, response, error);
    }];
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
            //try to forward to oc uri handler
            if (!cb) {
                return;
            }
            auto loader = weakLoader_.lock();
            if (!loader) {
                std::unordered_map<std::string, std::string> map;
                bytes contents = "loader not set";
                auto job_resp = std::make_shared<hippy::JobResponse>(hippy::vfs::UriHandler::RetCode::ResourceNotFound);
                cb(job_resp);
                return;
            }
            loader->RequestUntrustedContent(req, nil, nil, ^(NSUInteger current, NSUInteger total) {
                request->GetProgressCallback()(current, total);
            }, ^(NSData *data, NSDictionary *userInfo, NSURLResponse *resp, NSError *error) {
                RetCode code = RetCodeFromNSError(error);
                string_view errMsg = NSStringToU8StringView([error localizedFailureReason]);
                auto map = [resp toUnorderedMap];
                std::string content(reinterpret_cast<const char *>([data bytes]) , [data length]);
                auto jobResp = std::make_shared<hippy::JobResponse>(code, errMsg, map, std::move(content));
                cb(jobResp);
            });
        }
        return;
    }
    NSURLSessionDataProgress *dataProgress = [[NSURLSessionDataProgress alloc] initWithRequestJob:request responseCallback:cb];
    NSURLSession *session = [NSURLSession sessionWithConfiguration:[NSURLSessionConfiguration defaultSessionConfiguration] delegate:dataProgress delegateQueue:nil];
    NSURLSessionDataTask *dataTask = [session dataTaskWithRequest:req];
    objc_setAssociatedObject(dataTask, &progressKey, dataProgress, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    [dataTask resume];
}

void VFSUriHandler::RequestUntrustedContent(NSURLRequest *request,
                                            NSDictionary *extraInfo,
                                            NSOperationQueue *queue,
                                            VFSHandlerProgressBlock progress,
                                            VFSHandlerCompletionBlock completion,
                                            VFSGetNextHandlerBlock next) {
    FOOTSTONE_CHECK(request);
    if (!request) {
        return;
    }
    NSURL *requestURL = [request URL];
    
    // If it is an image request,
    // we need to determine whether the user has a custom ImageLoader,
    // if so, we need to request data through the custom ImageLoader.
    if (extraInfo &&
        extraInfo[kHippyVFSRequestCustomImageLoaderKey] &&
        [extraInfo[kHippyVFSRequestResTypeKey] integerValue] == HippyVFSRscTypeImage) {
        id<HippyImageCustomLoaderProtocol> customLoader = extraInfo[kHippyVFSRequestCustomImageLoaderKey];
        NSDictionary *extraForCustomLoader = extraInfo[kHippyVFSRequestExtraInfoForCustomImageLoaderKey];
        
        [customLoader loadImageAtUrl:requestURL
                           extraInfo:extraForCustomLoader
                            progress:progress
                           completed:^(NSData * _Nullable data, 
                                       NSURL * _Nonnull url,
                                       NSError * _Nullable error,
                                       UIImage * _Nullable image,
                                       HippyImageLoaderControlOptions options) {
            NSDictionary *dict = nil;
            if (image && (options & HippyImageLoaderControl_SkipDecodeOrDownsample)) {
                dict = @{ HippyVFSResponseDecodedImageKey: image };
            }
            NSURLResponse *rsp = [[NSURLResponse alloc] initWithURL:url
                                                           MIMEType:nil
                                              expectedContentLength:data.length
                                                   textEncodingName:nil];
            completion(data, dict, rsp, error);
        }];
        return;
    }
    
    NSDictionary<NSString *, NSString *> *httpHeaders = [request allHTTPHeaderFields];
    if ([httpHeaders[@(kRequestOrigin)] isEqualToString:@(kRequestFromOC)]) {
        NSDictionary *userInfo = @{NSURLErrorFailingURLErrorKey: requestURL,
                                   NSURLErrorFailingURLStringErrorKey: [requestURL absoluteString],
                                   @"NSURLErrorFailingInfo": @"scheme not registered"};
        NSInteger code = static_cast<NSInteger>(hippy::JobResponse::RetCode::SchemeNotRegister);
        NSError *error = [NSError errorWithDomain:NSURLErrorDomain code:code userInfo:userInfo];
        completion(nil, nil, nil, error);
        return;
    }
    NSURLSessionDataProgress *dataProgress = [[NSURLSessionDataProgress alloc] initWithProgress:progress result:completion];
    NSURLSession *session = [NSURLSession sessionWithConfiguration:[NSURLSessionConfiguration defaultSessionConfiguration] delegate:dataProgress delegateQueue:queue];
    NSURLSessionDataTask *dataTask = [session dataTaskWithRequest:request];
    if (!dataTask) {
        auto nextHandler = next();
        if (nextHandler) {
            nextHandler->RequestUntrustedContent(request, extraInfo, queue, progress, completion, next);
        }
        else {
            //try to forward to cpp uri handler
            auto loader = weakLoader_.lock();
            if (!loader) {
                NSDictionary *userInfo = @{NSURLErrorFailingURLErrorKey: requestURL,
                                           NSURLErrorFailingURLStringErrorKey: [requestURL absoluteString],
                                           @"NSURLErrorFailingInfo": @"loader not found"};
                NSInteger code = static_cast<NSInteger>(hippy::JobResponse::RetCode::ResourceNotFound);
                NSError *error = [NSError errorWithDomain:NSURLErrorDomain code:code userInfo:userInfo];
                completion(nil, nil, nil, error);
                return;
            }
            auto progressCallback = [progress](int64_t current, int64_t total){
                if (progress) {
                    progress(current, total);
                }
            };
            footstone::string_view uri = NSStringToU8StringView([requestURL absoluteString]);
            std::unordered_map<std::string, std::string> meta = NSDictionaryToStringUnorderedMap(httpHeaders);
            meta[kRequestOrigin] = kRequestFromOC;
            NSData *httpBody = [request HTTPBody];
            std::string content(reinterpret_cast<const char *>([httpBody bytes]) , [httpBody length]);
            auto requestJob = std::make_shared<hippy::RequestJob>(uri, meta, loader->GetWorkerManager(), progressCallback, std::move(content));
            auto responseCallback = [completion, requestURL](std::shared_ptr<hippy::JobResponse> cb){
                if (completion) {
                    NSData *data = [NSData dataWithBytes:cb->GetContent().data() length:cb->GetContent().length()];
                    NSURLResponse *response = ResponseMapToURLResponse(requestURL, cb->GetMeta(), cb->GetContent().length());
                    NSError *error = nil;
                    if (!footstone::StringViewUtils::IsEmpty(cb->GetErrorMessage())) {
                        NSString *errorMsg = StringViewToNSString(cb->GetErrorMessage());
                        NSDictionary *userInfo = @{NSURLErrorFailingURLErrorKey: requestURL,
                                                   NSURLErrorFailingURLStringErrorKey: [requestURL absoluteString],
                                                   @"NSURLErrorFailingInfo": errorMsg};
                        NSInteger code = static_cast<NSInteger>(cb->GetRetCode());
                        error = [NSError errorWithDomain:NSURLErrorDomain code:code userInfo:userInfo];
                    }
                    completion(data, nil, response, error);
                }
            };
            loader->hippy::UriLoader::RequestUntrustedContent(requestJob, responseCallback);
        }
        return;
    }
    objc_setAssociatedObject(dataTask, &progressKey, dataProgress, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    [dataTask resume];
}
