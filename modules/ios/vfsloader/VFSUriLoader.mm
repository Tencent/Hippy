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

NSString *const VFSErrorDomain = @"VFSErrorDomain";
NSString *const VFSParamsMethod = @"VFSParamsMethod";
NSString *const VFSParamsHeaders = @"VFSParamsHeaders";
NSString *const VFSParamsBody = @"VFSParamsBody";

VFSUriLoader::VFSUriLoader() {
    SetDefaultHandler(std::make_shared<VFSUriHandler>());
}

VFSUriLoader::VFSUriLoader(const std::shared_ptr<hippy::vfs::UriHandler> &handler) {
    SetDefaultHandler(handler);
}

void VFSUriLoader::loadContentsAsynchronously(NSURL *url, NSDictionary *headers, URILoaderCompletion completion) {
    if (!url || !completion) {
        return;
    }
    string_view uri = NSStringToU16StringView([url absoluteString]);
    std::unordered_map<std::string, std::string> meta = NSDictionaryToStringUnorderedMap(headers);
    auto cb = [completion, url](RetCode code, std::unordered_map<std::string, std::string> map, bytes contents){
        NSData *data = [NSData dataWithBytes:reinterpret_cast<const void *>(contents.c_str()) length:contents.length()];
        NSURLResponse *response = ResponseMapToURLResponse(url, map, contents.length());
        NSError *error = GetVFSError(code, url, response);
        completion(data, response, error);
    };
    RequestUntrustedContent(uri, meta, cb);
}

void VFSUriLoader::loadContentsAsynchronously(NSURL *url, NSDictionary *headers, URILoaderCompletionBlock block) {
    if (!url || !block) {
        return;
    }
    string_view uri = NSStringToU16StringView([url absoluteString]);
    std::unordered_map<std::string, std::string> meta = NSDictionaryToStringUnorderedMap(headers);
    auto cb = [block, url](RetCode code, std::unordered_map<std::string, std::string> map, bytes contents){
        NSData *data = [NSData dataWithBytes:reinterpret_cast<const void *>(contents.c_str()) length:contents.length()];
        NSURLResponse *response = ResponseMapToURLResponse(url, map, contents.length());
        NSError *error = GetVFSError(code, url, response);
        block(data, response, error);
    };
    RequestUntrustedContent(uri, meta, cb);
}


NSData *VFSUriLoader::loadContentsSynchronously(NSURL *url, NSDictionary *headers, NSURLResponse **response, NSError **error) {
    if (!url) {
        return nil;
    }
    string_view uri = NSStringToU16StringView([url absoluteString]);
    std::unordered_map<std::string, std::string> meta = NSDictionaryToStringUnorderedMap(headers);
    RetCode code;
    std::unordered_map<std::string, std::string> rspMeta;
    bytes contents;
    RequestUntrustedContent(uri, meta, code, rspMeta, contents);
    *response = ResponseMapToURLResponse(url, rspMeta, contents.length());
    *error = GetVFSError(code, url, *response);
    NSData *data = [NSData dataWithBytes:reinterpret_cast<const void *>(contents.c_str()) length:contents.length()];
    return data;
}


NSError *VFSUriLoader::GetVFSError(RetCode retCode, NSURL *url, NSURLResponse *response) {
    if (RetCode::Success == retCode) {
        return nil;
    }
    int code = static_cast<int>(retCode);
    NSDictionary *userInfo = @{@"OriginRetCode": @(code), @"OriginURL": url, @"Response":response};
    NSError *error = [NSError errorWithDomain:VFSErrorDomain code:code userInfo:userInfo];
    return error;
}
