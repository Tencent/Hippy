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
#import <UIKit/NSParagraphStyle.h>

NS_ASSUME_NONNULL_BEGIN

@protocol hippyI18nProtocol <NSObject>

@optional

/**return app language by delegate
 */
- (NSString *)currentAppLanguage;

@end

/** I18n manager for hippy
 */
@interface HippyI18nUtils : NSObject

@property(nonatomic, weak) id<hippyI18nProtocol> delegate;

+ (instancetype)sharedInstance;

/**
 * get current app language
 * this method gets app language from delegate by default.
 * if delegate method is not implementated,
 * this method gets language from [[NSLocale currentLocale] objectForKey:NSLocaleLanguageCode]
 */
- (NSString *)currentAppLanguageCode;

/**
 * get current country code from [[NSLocale currentLocale] objectForKey:NSLocaleCountryCode] by default
 */
- (NSString *)currentCountryCode;

/**
 * get app language writing direction from the result of 'currentAppLanguageCode' return value
 */
- (NSWritingDirection)writingDirectionForCurrentAppLanguage;

@end

NS_ASSUME_NONNULL_END
