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

#import "HippyFootstoneUtils.h"
#import "HippyUtils.h"
#import "TypeConverter.h"
#import "VFSUriLoader.h"
#import "VFSUriHandler.h"
#import "HippyAssert.h"
#include <functional>
#include <unordered_map>
#include "footstone/string_view_utils.h"

NSString *const VFSErrorDomain = @"VFSErrorDomain";
NSString *const VFSParamsMethod = @"VFSParamsMethod";
NSString *const VFSParamsHeaders = @"VFSParamsHeaders";
NSString *const VFSParamsBody = @"VFSParamsBody";

void VFSUriLoader::RegisterConvenientUriHandler(NSString *scheme,
                                                const std::shared_ptr<VFSUriHandler>& handler) {
    std::lock_guard<std::mutex> lock(convenintMutex_);
    auto it = convenint_handler_map_.find([scheme hash]);
    if (convenint_handler_map_.end() == it) {
        convenint_handler_map_[[scheme hash]] = default_convenient_handlers_;
        convenint_handler_map_[[scheme hash]].push_front(handler);
    }
    else {
        it->second.push_front(handler);
    }
    handler->SetLoader(std::static_pointer_cast<VFSUriLoader>(shared_from_this()));
}

void VFSUriLoader::AddConvenientDefaultHandler(const std::shared_ptr<VFSUriHandler>& handler) {
    std::lock_guard<std::mutex> lock(convenintMutex_);
    default_convenient_handlers_.push_front(handler);
    for (auto &it : convenint_handler_map_) {
        it.second.push_back(handler);
    }
}

const std::list<std::shared_ptr<VFSUriHandler>> &VFSUriLoader::GetConvenientDefaultHandlers() {
    std::lock_guard<std::mutex> lock(convenintMutex_);
    return default_convenient_handlers_;
}

void VFSUriLoader::RequestUntrustedContent(const string_view& uri,
                                           const std::unordered_map<std::string, std::string>& meta,
                                           std::function<void(RetCode, std::unordered_map<std::string, std::string>, bytes)> cb) {
    hippy::vfs::UriLoader::RequestUntrustedContent(uri, meta, cb);
}

void VFSUriLoader::RequestUntrustedContent(const string_view& uri,
                                           const std::unordered_map<std::string, std::string>& req_meta,
                                           RetCode& code,
                                           std::unordered_map<std::string, std::string>& rsp_meta,
                                           bytes& content) {
    hippy::vfs::UriLoader::RequestUntrustedContent(uri, req_meta, code, rsp_meta, content);
}

void VFSUriLoader::RequestUntrustedContent(const std::shared_ptr<hippy::RequestJob>& request,
                                           std::shared_ptr<hippy::JobResponse> response) {
    hippy::vfs::UriLoader::RequestUntrustedContent(request, response);
}
void VFSUriLoader::RequestUntrustedContent(const std::shared_ptr<hippy::RequestJob>& request,
                                           const std::function<void(std::shared_ptr<hippy::JobResponse>)>& cb) {
    hippy::vfs::UriLoader::RequestUntrustedContent(request, cb);
}

void VFSUriLoader::RequestUntrustedContent(NSString *urlString,
                                           NSDictionary *extraInfo,
                                           NSOperationQueue *operationQueue,
                                           VFSHandlerProgressBlock progress,
                                           VFSHandlerCompletionBlock completion) {
    NSURL *url = HippyURLWithString(urlString, nil);
    HippyAssert(url, @"Invalid URL! %@", urlString);
    NSURLRequest *request = [NSURLRequest requestWithURL:url];
    RequestUntrustedContent(request, extraInfo, operationQueue, progress, completion);
}

void VFSUriLoader::RequestUntrustedContent(NSURLRequest *request,
                                           NSDictionary *extraInfo,
                                           NSOperationQueue *operationQueue,
                                           VFSHandlerProgressBlock progress, 
                                           VFSHandlerCompletionBlock completion) {
    if (!request || !completion) {
        return;
    }
    NSURL *requestURL = [request URL];
    NSString *scheme = [requestURL scheme];
    __block std::list<std::shared_ptr<VFSUriHandler>>::iterator cur_convenient_it;
    __block std::list<std::shared_ptr<VFSUriHandler>>::iterator end_convenient_it;
    {
        std::lock_guard<std::mutex> lock(convenintMutex_);
        auto find = convenint_handler_map_.find([scheme hash]);
        if (convenint_handler_map_.end() != find) {
            auto &scheme_handler_list = find->second;
            cur_convenient_it = scheme_handler_list.begin();
            end_convenient_it = scheme_handler_list.end();
        } else {
            cur_convenient_it = default_convenient_handlers_.begin();
            end_convenient_it = default_convenient_handlers_.end();
        }
    }
    VFSGetNextHandlerBlock block =^std::shared_ptr<VFSUriHandler>(void){
        return GetNextConvinentHandler(cur_convenient_it, end_convenient_it);
    };
    auto &cur_convenient = (*cur_convenient_it);
    //check if convenient loader exists, or forward to cpp loader
    if (cur_convenient) {
        auto startPoint = footstone::TimePoint::SystemNow();
        auto weak_this = weak_from_this();
        VFSHandlerCompletionBlock callback = ^(NSData *data, NSDictionary *userInfo, NSURLResponse *response, NSError *error) {
            auto endPoint = footstone::TimePoint::SystemNow();
            string_view uri(NSStringToU16StringView([[response URL] absoluteString]));
            string_view msg([error.localizedDescription UTF8String]?:"");
            auto shared_this = weak_this.lock();
            if (shared_this) {
                DoRequestResultCallback(uri, startPoint, endPoint, static_cast<int32_t>(error.code), msg);
            }
            if (completion) {
                completion(data, userInfo, response, error);
            }
        };
        cur_convenient->RequestUntrustedContent(request, extraInfo, operationQueue, progress, callback, block);
    } else {
        // TODO: when forward to cpp loader
        // cpp loader does not handle rscType
        string_view uri = NSStringToU8StringView([requestURL absoluteString]);
        auto meta = NSDictionaryToStringUnorderedMap([request allHTTPHeaderFields]);
        auto progressCallback = [progress, operationQueue](int64_t current, int64_t total){
            if (progress) {
                progress(current, total);
            }
        };
        std::string contents = "";
        NSData *body = [request HTTPBody];
        if (body) {
            contents = std::string(reinterpret_cast<const char *>([[request HTTPBody] bytes]) , [[request HTTPBody] length]);
        }
        auto requestJob = std::make_shared<hippy::RequestJob>(uri, meta, GetWorkerManager(), progressCallback, std::move(contents));
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
        RequestUntrustedContent(requestJob, responseCallback);
    }
}

std::shared_ptr<VFSUriHandler> VFSUriLoader::GetNextConvinentHandler(std::list<std::shared_ptr<VFSUriHandler>>::iterator &cur_con_handler_it,
                                                                     const std::list<std::shared_ptr<VFSUriHandler>>::iterator &end_con_handler_it) {
    std::lock_guard<std::mutex> lock(convenintMutex_);
    FOOTSTONE_CHECK(cur_con_handler_it != end_con_handler_it);
    cur_con_handler_it++;
    if (cur_con_handler_it == end_con_handler_it) {
        return nil;
    }
    return *cur_con_handler_it;
}

NSError *GetVFSError(hippy::vfs::UriHandler::RetCode retCode, NSString *urlString, NSURLResponse *response) {
    if (hippy::vfs::UriHandler::RetCode::Success == retCode) {
        return nil;
    }
    int code = static_cast<int>(retCode);
    NSDictionary *userInfo = @{@"OriginRetCode": @(code), @"OriginURLString": urlString, @"Response":response};
    NSError *error = [NSError errorWithDomain:VFSErrorDomain code:code userInfo:userInfo];
    return error;
}
