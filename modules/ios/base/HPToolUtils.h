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

#import <CoreGraphics/CoreGraphics.h>
#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

#include "HippyDefines.h"

NS_ASSUME_NONNULL_BEGIN


// Check is we are currently on the main queue (not to be confused with
// the main thread, which is not neccesarily the same thing)
// https://twitter.com/olebegemann/status/738656134731599872
HIPPY_EXTERN BOOL HPIsMainQueue(void);

// Execute the specified block on the main queue. Unlike dispatch_async()
// this will execute immediately if we're already on the main queue.
HIPPY_EXTERN void HPExecuteOnMainQueue(dispatch_block_t block);

// Deprecated - do not use.
HIPPY_EXTERN void HPExecuteOnMainThread(dispatch_block_t block, BOOL sync);

// Method swizzling
HIPPY_EXTERN void HPSwapClassMethods(Class cls, SEL original, SEL replacement);
HIPPY_EXTERN void HPSwapInstanceMethods(Class cls, SEL original, SEL replacement);

// Module subclass support
HIPPY_EXTERN BOOL HPClassOverridesClassMethod(Class cls, SEL selector);
HIPPY_EXTERN BOOL HPClassOverridesInstanceMethod(Class cls, SEL selector);

// Returns YES if HP is running in a test environment
HIPPY_EXTERN BOOL HPRunningInTestEnvironment(void);

// Returns YES if HP is running in an iOS App Extension
HIPPY_EXTERN BOOL HPRunningInAppExtension(void);

// Returns the shared UIApplication instance, or nil if running in an App Extension
HIPPY_EXTERN UIApplication *__nullable HPSharedApplication(void);

// Returns the current main window, useful if you need to access the root view
// or view controller
HIPPY_EXTERN UIWindow *__nullable HPKeyWindow(void);

// Returns the presented view controller, useful if you need
// e.g. to present a modal view controller or alert over it
HIPPY_EXTERN UIViewController *__nullable HPPresentedViewController(void);

// Does this device support force touch (aka 3D Touch)?
HIPPY_EXTERN BOOL HPForceTouchAvailable(void);

// Create an NSError in the HPErrorDomain
HIPPY_EXTERN NSError *HPErrorWithMessage(NSString *message);

// Create an NSError in the HPErrorDomain
HIPPY_EXTERN NSError *HPErrorWithMessageAndModuleName(NSString *message, NSString *__nullable moduleName);

// Create an NSError with HPFatalModuleName from another error
HIPPY_EXTERN NSError *HPErrorFromErrorAndModuleName(NSError *error, NSString *__nullable moduleName);

// Convert nil values to NSNull, and vice-versa
#define HPNullIfNil(value) (value ?: (id)kCFNull)
#define HPNilIfNull(value) (value == (id)kCFNull ? nil : value)

// Convert NaN or infinite values to zero, as these aren't JSON-safe
HIPPY_EXTERN double HPZeroIfNaN(double value);

// Converts a CGColor to a hex string
HIPPY_EXTERN NSString *HPColorToHexString(CGColorRef color);

/**
 * convert string to UIColor
 * colorString could be 'fff','#fff','ffffff','#ffffff','ffffffff','#ffffffff'
 * or 'red', 'green','blue'.etc
 */
HIPPY_EXTERN UIColor *HPConvertStringToColor(NSString *colorString);

HIPPY_EXTERN UIColor *HPConvertNumberToColor(NSInteger colorNumber);

// Get standard localized string (if it exists)
HIPPY_EXTERN NSString *HPUIKitLocalizedString(NSString *string);

// URL manipulation
HIPPY_EXTERN NSString *__nullable HPGetURLQueryParam(NSURL *__nullable URL, NSString *param);
HIPPY_EXTERN NSURL *__nullable HPURLByReplacingQueryParam(NSURL *__nullable URL, NSString *param, NSString *__nullable value);
HIPPY_EXTERN NSURL *__nullable HPURLWithString(NSString *__nonnull URLString, NSString *__nullable baseURLString);
HIPPY_EXTERN NSString *HPSchemeFromURLString(NSString *urlString);

//Get String Encoding From HTTP URL Response
HIPPY_EXTERN NSStringEncoding HPGetStringEncodingFromURLResponse(NSURLResponse *response);

NS_ASSUME_NONNULL_END
