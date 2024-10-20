/*!
* iOS SDK
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
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

#import <Foundation/Foundation.h>
#import "HippyBridgeModule.h"

NS_ASSUME_NONNULL_BEGIN

HIPPY_EXTERN NSString *const HippyLoadFontNotification;

@interface HippyFontLoaderModule : NSObject<HippyBridgeModule>

/**
 * Get the font file path according to url.
 *
 * @param url - The url where font file is downloaded
 * @return The font file path. Null means the font file has't been downloaded from url.
 */
+ (nullable NSString *)getFontPath:(NSString *)url;

/**
 * Register font files belong to the specific font family if needed.
 *
 * @param fontFamily - The font family needs to be registered
 */
+ (void)registerFontIfNeeded:(NSString *)fontFamily;

@end

NS_ASSUME_NONNULL_END
