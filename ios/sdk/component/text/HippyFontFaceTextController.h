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
#import <UIKit/UIKit.h>
#import "HippyBridgeModule.h"

NS_ASSUME_NONNULL_BEGIN

extern NSString *HippyTextFontFaceErrorDomain;

extern NSString *HippyTextFontFaceURLKey;

typedef NS_ENUM(NSUInteger, HippyTextFontFaceErrorCode) {
    HippyTextFontFaceErrorURLUnavailable,
    HippyTextFontFaceErrorDataUnavailable,
    HippyTextFontFaceErrorRegisterFailure,
    HippyTextFontFaceErrorFontAcquireFailure,
};

@interface HippyFontFaceTextController : NSObject<HippyBridgeModule>

/**
 * register a font with data from url, return a UIFont instance from block.
 * if the font is already registered, return instance immediately.
 * this method acquire font data synchronize.
 */
- (void)fontName:(NSString *)name fontSize:(CGFloat)fontSize URL:(NSURL *)url completion:(void (^)(UIFont *font, NSError *error))completionBlock;

/**
 * font datas will be saved in tempary folder for default, for hippy doesnt know where to save
 * subclass can override it for custom path
 */
- (NSString *)downloadPathForFontURL:(NSURL *)URL;

@end

NS_ASSUME_NONNULL_END
