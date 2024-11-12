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

typedef NS_ENUM(NSInteger, HippyFontUrlState) {
    HippyFontUrlPending = 0,
    HippyFontUrlLoading = 1,
    HippyFontUrlLoaded = 2,
    HippyFontUrlFailed = 3,
};

/**
 * @class HippyFontLoaderModule
 * @brief This class is responsible for loading and registering fonts.
 *
 * This class is a hippy module, providing a load method for the front end to download and register fonts.
 * It also provides method for native side to register font.
 */
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
+ (BOOL)registerFontIfNeeded:(NSString *)fontFamily;

/**
 * Whether the font is downloading from the url.
 *
 * @param url - The font url needs to download from.
 * @return Yes if the font is downloading from the url.
 */
+ (BOOL)isUrlLoading:(NSString *)url;

/**
 * Get the serial queue in HippyFontLoaderModule for asyn serial operations.
 *
 * @return The serial dispatch_queue_t.
 */
+ (dispatch_queue_t)getFontSerialQueue;

/**
 * Load font from the url.
 *
 * @param urlString - The url where font file is downloaded.
 * @param resolve - The callback block for downloading successful.
 * @param reject - The callback block for downloading failed.
 */
- (void)load:(NSString *)fontFamily from:(NSString *)urlString resolver:(nullable HippyPromiseResolveBlock)resolve
    rejecter:(nullable HippyPromiseRejectBlock)reject;

@end

NS_ASSUME_NONNULL_END
