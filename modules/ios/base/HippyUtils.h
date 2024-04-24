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
#import "HippyDefines.h"

NS_ASSUME_NONNULL_BEGIN

// Check is we are currently on the main queue (not to be confused with
// the main thread, which is not necessarily the same thing)
// https://twitter.com/olebegemann/status/738656134731599872
HIPPY_EXTERN BOOL HippyIsMainQueue(void);

// Execute the specified block on the main queue. Unlike dispatch_async()
// this will execute immediately if we're already on the main queue.
HIPPY_EXTERN void HippyExecuteOnMainQueue(dispatch_block_t block);

// Deprecated - do not use.
HIPPY_EXTERN void HippyExecuteOnMainThread(dispatch_block_t block, BOOL sync);

// Method swizzling
HIPPY_EXTERN void HippySwapClassMethods(Class cls, SEL original, SEL replacement);
HIPPY_EXTERN void HippySwapInstanceMethods(Class cls, SEL original, SEL replacement);
HIPPY_EXTERN void HippySwapInstanceMethodWithBlock(Class cls, SEL original, id replacementBlock, SEL replacementSelector);

// Module subclass support
HIPPY_EXTERN BOOL HippyClassOverridesClassMethod(Class cls, SEL selector);
HIPPY_EXTERN BOOL HippyClassOverridesInstanceMethod(Class cls, SEL selector);

// Returns YES if HP is running in a test environment
HIPPY_EXTERN BOOL HippyRunningInTestEnvironment(void);

// Returns YES if HP is running in an iOS App Extension
HIPPY_EXTERN BOOL HippyRunningInAppExtension(void);

// Returns the shared UIApplication instance, or nil if running in an App Extension
HIPPY_EXTERN UIApplication *__nullable HippySharedApplication(void);

// Returns the current main window, useful if you need to access the root view
// or view controller
HIPPY_EXTERN UIWindow *__nullable HippyKeyWindow(void);

// Returns the presented view controller, useful if you need
// e.g. to present a modal view controller or alert over it
HIPPY_EXTERN UIViewController *__nullable HippyPresentedViewController(void);

// Does this device support force touch (aka 3D Touch)?
HIPPY_EXTERN BOOL HippyForceTouchAvailable(void);


#pragma mark -

// JSON serialization/deserialization
HIPPY_EXTERN NSString *__nullable HippyJSONStringify(id __nullable jsonObject, NSError **error);
HIPPY_EXTERN id __nullable HippyJSONParse(NSString *__nullable jsonString, NSError **error);
HIPPY_EXTERN id __nullable HippyJSONParseMutable(NSString *__nullable jsonString, NSError **error);

// Sanitize a JSON object by stripping invalid types and/or NaN values
HIPPY_EXTERN id HippyJSONClean(id object);

// Get MD5 hash of a string
HIPPY_EXTERN NSString *HippyMD5Hash(NSString *string);


#pragma mark -

// Create an NSError in the HippyErrorDomain
HIPPY_EXTERN NSError *HippyErrorWithMessage(NSString *message);

// Create an NSError in the HippyErrorDomain
HIPPY_EXTERN NSError *HippyErrorWithMessageAndModuleName(NSString *message, NSString *__nullable moduleName);

// Create an NSError with HippyFatalModuleName from another error
HIPPY_EXTERN NSError *HippyErrorFromErrorAndModuleName(NSError *error, NSString *__nullable moduleName);

// Creates a standardized error object to return in callbacks
HIPPY_EXTERN NSDictionary<NSString *, id> *HippyMakeError(NSString *message, id __nullable toStringify,
                                                          NSDictionary<NSString *, id> *__nullable extraData);
                                                          
HIPPY_EXTERN NSDictionary<NSString *, id> *HippyMakeAndLogError(NSString *message, id __nullable toStringify,
                                                                NSDictionary<NSString *, id> *__nullable extraData);

HIPPY_EXTERN NSDictionary<NSString *, id> *HippyJSErrorFromNSError(NSError *error);

HIPPY_EXTERN NSDictionary<NSString *, id> *HippyJSErrorFromCodeMessageAndNSError(NSString *code, NSString *message, NSError *__nullable error);

// The default error code to use as the `code` property for callback error objects
HIPPY_EXTERN NSString *const HippyErrorUnspecified;


#pragma mark -

// Convert nil values to NSNull, and vice-versa
#define HippyNullIfNil(value) (value ?: (id)kCFNull)
#define HippyNilIfNull(value) (value == (id)kCFNull ? nil : value)

// Convert NaN or infinite values to zero, as these aren't JSON-safe
HIPPY_EXTERN double HippyZeroIfNaN(double value);

// Converts a CGColor to a hex string
HIPPY_EXTERN NSString *HippyColorToHexString(CGColorRef color);

/**
 * convert string to UIColor
 * colorString could be 'fff','#fff','ffffff','#ffffff','ffffffff','#ffffffff'
 * or 'red', 'green','blue'.etc
 */
HIPPY_EXTERN UIColor *HippyConvertStringToColor(NSString *colorString);

HIPPY_EXTERN UIColor *HippyConvertNumberToColor(NSInteger colorNumber);

// Get standard localized string (if it exists)
HIPPY_EXTERN NSString *HippyUIKitLocalizedString(NSString *string);

// URL manipulation
HIPPY_EXTERN NSString *__nullable HippyGetURLQueryParam(NSURL *__nullable URL, NSString *param);
HIPPY_EXTERN NSURL *__nullable HippyURLByReplacingQueryParam(NSURL *__nullable URL, NSString *param, NSString *__nullable value);
HIPPY_EXTERN NSURL *__nullable HippyURLWithString(NSString *__nonnull URLString, NSString *__nullable baseURLString);
HIPPY_EXTERN NSString *HippySchemeFromURLString(NSString *urlString);

//Get String Encoding From HTTP URL Response
HIPPY_EXTERN NSStringEncoding HippyGetStringEncodingFromURLResponse(NSURLResponse *response);


#pragma mark -

/// 工具类
/// Utility class
///
/// 注意，类名及方法名禁止修改
/// Note that modifying the class name and method name is prohibited!
@interface HippyUtils : NSObject

/// HippySDK版本号
/// HippySDK version number
///
/// 注意方法名禁止修改，外部可能会动态调用，来判断Hippy版本号
/// Note that the method name cannot be modified,
/// users may call it dynamically to determine the Hippy version number.
+ (NSString *)sdkVersion;

@end


NS_ASSUME_NONNULL_END
