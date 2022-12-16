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

void VFSUriLoader::loadContentsAsynchronously(NSString *urlString, NSDictionary *headers, URILoaderCompletion completion) {
    if (!urlString || !completion) {
        return;
    }
    string_view uri = NSStringToU16StringView(urlString);
    std::unordered_map<std::string, std::string> meta = NSDictionaryToStringUnorderedMap(headers);
    auto cb = [completion, urlString](RetCode code, std::unordered_map<std::string, std::string> map, bytes contents){
        NSURL *url = HPURLWithString(urlString, nil);
        NSData *data = [NSData dataWithBytes:reinterpret_cast<const void *>(contents.c_str()) length:contents.length()];
        NSURLResponse *response = ResponseMapToURLResponse(url, map, contents.length());
        NSError *error = GetVFSError(code, urlString, response);
        completion(data, response, error);
    };
    RequestUntrustedContent(uri, meta, cb);
}

void VFSUriLoader::loadContentsAsynchronously(NSString *urlString, NSDictionary *headers,
                                              URILoaderProgress progress, URILoaderCompletion completion) {
    //todo vfs loader
    FOOTSTONE_UNIMPLEMENTED();
}

void VFSUriLoader::loadContentsAsynchronously(NSString *urlString, NSDictionary *headers, URILoaderCompletionBlock block) {
    if (!urlString || !block) {
        return;
    }
    string_view uri = NSStringToU16StringView(urlString);
    std::unordered_map<std::string, std::string> meta = NSDictionaryToStringUnorderedMap(headers);
    auto cb = [block, urlString](RetCode code, std::unordered_map<std::string, std::string> map, bytes contents){
        NSURL *url = HPURLWithString(urlString, nil);
        NSData *data = [NSData dataWithBytes:reinterpret_cast<const void *>(contents.c_str()) length:contents.length()];
        NSURLResponse *response = ResponseMapToURLResponse(url, map, contents.length());
        NSError *error = GetVFSError(code, urlString, response);
        block(data, response, error);
    };
    RequestUntrustedContent(uri, meta, cb);
}

void VFSUriLoader::loadContentsAsynchronously(NSString *urlString, NSDictionary *headers,
                                              URILoaderProgressBlock progress, URILoaderCompletionBlock block) {
    //todo vfs loader
    FOOTSTONE_UNIMPLEMENTED();
}

NSData *VFSUriLoader::loadContentsSynchronously(NSString *urlString, NSDictionary *headers, NSURLResponse **response, NSError **error) {
    if (!urlString) {
        return nil;
    }
    string_view uri = NSStringToU16StringView(urlString);
    std::unordered_map<std::string, std::string> meta = NSDictionaryToStringUnorderedMap(headers);
    RetCode code;
    std::unordered_map<std::string, std::string> rspMeta;
    bytes contents;
    RequestUntrustedContent(uri, meta, code, rspMeta, contents);
    NSURL *url = HPURLWithString(urlString, nil);
    *response = ResponseMapToURLResponse(url, rspMeta, contents.length());
    *error = GetVFSError(code, urlString, *response);
    NSData *data = [NSData dataWithBytes:reinterpret_cast<const void *>(contents.c_str()) length:contents.length()];
    return data;
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
