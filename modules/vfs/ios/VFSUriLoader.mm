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

#import "VFSUriLoader.h"
#import "VFSUriHandler.h"
#import "TypeConverter.h"
#import "HPToolUtils.h"

NSString *const VFSErrorDomain = @"VFSErrorDomain";
NSString *const VFSParamsMethod = @"VFSParamsMethod";
NSString *const VFSParamsHeaders = @"VFSParamsHeaders";
NSString *const VFSParamsBody = @"VFSParamsBody";

void VFSUriLoader::loadContentsAsynchronously(NSString *urlString,
                                              NSDictionary *headers,
                                              NSData *data,
                                              URILoaderProgress progress,
                                              URILoaderCompletion completion) {
    if (!urlString || !completion) {
        return;
    }
    string_view uri = NSStringToU16StringView(urlString);
    std::unordered_map<std::string, std::string> meta = NSDictionaryToStringUnorderedMap(headers);
    auto progressCallback = [progress](int64_t current, int64_t total){
        progress(current, total);
    };
    std::string postContents = "";
    if (data) {
        std::string contents(reinterpret_cast<const char *>([data bytes]) , [data length]);
        postContents = std::move(contents);
    }
    auto requestJob = std::make_shared<hippy::RequestJob>(uri, meta, progressCallback, std::move(postContents));
    auto respFunc = [urlString, completion](std::shared_ptr<hippy::JobResponse> response) {
        NSURL *url = HPURLWithString(urlString, nil);
        std::string contents = response->GetContent();
        NSData *data = [NSData dataWithBytes:reinterpret_cast<const void *>(contents.c_str()) length:contents.length()];
        NSURLResponse *resp = ResponseMapToURLResponse(url, response->GetMeta(), contents.length());
        NSError *error = GetVFSError(response->GetRetCode(), urlString, resp);
        completion(data, resp, error);
    };
    RequestUntrustedContent(requestJob, respFunc);
}

void VFSUriLoader::loadContentsAsynchronously(NSString *urlString,
                                              NSDictionary *headers,
                                              NSData *data,
                                              URILoaderProgressBlock progress,
                                              URILoaderCompletionBlock block) {
    if (!urlString || !block) {
        return;
    }
    string_view uri = NSStringToU16StringView(urlString);
    std::unordered_map<std::string, std::string> meta = NSDictionaryToStringUnorderedMap(headers);
    auto progressCallback = [progress](int64_t current, int64_t total){
        if (progress) {
            progress(current, total);
        }
    };
    std::string postContents = "";
    if (data) {
        std::string contents(reinterpret_cast<const char *>([data bytes]) , [data length]);
        postContents = std::move(contents);
    }
    auto requestJob = std::make_shared<hippy::RequestJob>(uri, meta, progressCallback, std::move(postContents));
    auto respFunc = [urlString, block](std::shared_ptr<hippy::JobResponse> response) {
        NSURL *url = HPURLWithString(urlString, nil);
        std::string contents = response->GetContent();
        NSData *data = [NSData dataWithBytes:reinterpret_cast<const void *>(contents.c_str()) length:contents.length()];
        NSURLResponse *resp = ResponseMapToURLResponse(url, response->GetMeta(), contents.length());
        NSError *error = GetVFSError(response->GetRetCode(), urlString, resp);
        block(data, resp, error);
    };
    RequestUntrustedContent(requestJob, respFunc);
}

NSData *VFSUriLoader::loadContentsSynchronously(NSString *urlString, NSDictionary *headers,
                                                NSData *data, NSURLResponse **response,
                                                NSError **error) {
    if (!urlString) {
        return nil;
    }
    string_view uri = NSStringToU16StringView(urlString);
    std::unordered_map<std::string, std::string> meta = NSDictionaryToStringUnorderedMap(headers);
    std::string postContents = "";
    if (data) {
        std::string contents(reinterpret_cast<const char *>([data bytes]), [data length]);
        postContents = std::move(contents);
    }
    auto requestJob = std::make_shared<hippy::RequestJob>(uri, meta, nullptr, std::move(postContents));
    auto responseJob = std::make_shared<hippy::JobResponse>();
    RequestUntrustedContent(requestJob, responseJob);
    NSURL *url = HPURLWithString(urlString, nil);
    const bytes &contents = responseJob->GetContent();
    *response = ResponseMapToURLResponse(url, responseJob->GetMeta(), contents.length());
    *error = GetVFSError(responseJob->GetRetCode(), urlString, *response);
    NSData *returnData = [NSData dataWithBytes:reinterpret_cast<const void *>(contents.c_str()) length:contents.length()];
    return returnData;
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
