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

#ifndef HippyVFSDefines_h
#define HippyVFSDefines_h

#import <Foundation/Foundation.h>
#include <functional>
#include <memory>

constexpr char kRequestOrigin[] = "kRequestOrigin";
constexpr char kRequestFromCPP[] = "kRequestFromCPP";
constexpr char kRequestFromOC[] = "kRequestFromOC";

constexpr char kHeaderBody[] = "kHeaderBody";
constexpr char kHeaderMethod[] = "kHeaderMethod";

enum HippyVFSRscType {
    HippyVFSRscTypeOther = 0,
    HippyVFSRscTypeImage,
};


// Resource Type Key for VFS Request in `extraInfo` parameter,
// Value is defined in HippyVFSRscType
FOUNDATION_EXPORT NSString *_Nonnull const kHippyVFSRequestResTypeKey;

// Custom Image Loader (id<HippyImageCustomLoaderProtocol>) instance for Image request
FOUNDATION_EXPORT NSString *_Nonnull const kHippyVFSRequestCustomImageLoaderKey;

// Store `ExtraInfo` dictionary for Custom Image Loader
FOUNDATION_EXPORT NSString *_Nonnull const kHippyVFSRequestExtraInfoForCustomImageLoaderKey;

// The image returned in `userInfo` parameter of VFSHandlerCompletionBlock
FOUNDATION_EXPORT NSString *_Nonnull const HippyVFSResponseDecodedImageKey;


typedef void(^VFSHandlerProgressBlock)(NSUInteger current, NSUInteger total);
typedef void(^VFSHandlerCompletionBlock)(NSData *_Nullable data,
                                         NSDictionary *_Nullable userInfo,
                                         NSURLResponse *_Nullable response,
                                         NSError * _Nullable error);

class VFSUriHandler;
typedef std::shared_ptr<VFSUriHandler>(^VFSGetNextHandlerBlock)(void);

#endif /* HippyVFSDefines_h */
