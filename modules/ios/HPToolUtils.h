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

#include "MacroDefines.h"

NS_ASSUME_NONNULL_BEGIN

// JSON serialization/deserialization
HP_EXTERN NSString *__nullable HPJSONStringify(id __nullable jsonObject, NSError **error);
HP_EXTERN id __nullable HPJSONParse(NSString *__nullable jsonString, NSError **error);
HP_EXTERN id __nullable HPJSONParseMutable(NSString *__nullable jsonString, NSError **error);

// Sanitize a JSON object by stripping invalid types and/or NaN values
HP_EXTERN id HPJSONClean(id object);

// Get MD5 hash of a string
HP_EXTERN NSString *HPMD5Hash(NSString *string);

// Check is we are currently on the main queue (not to be confused with
// the main thread, which is not neccesarily the same thing)
// https://twitter.com/olebegemann/status/738656134731599872
HP_EXTERN BOOL HPIsMainQueue(void);

// Execute the specified block on the main queue. Unlike dispatch_async()
// this will execute immediately if we're already on the main queue.
HP_EXTERN void HPExecuteOnMainQueue(dispatch_block_t block);

// Deprecated - do not use.
HP_EXTERN void HPExecuteOnMainThread(dispatch_block_t block, BOOL sync);
//__deprecated_msg("Use HPExecuteOnMainQueue instead. HPExecuteOnMainQueue is "
//                 "async. If you need to use the `sync` option... please don't.");

// Get screen metrics in a thread-safe way
HP_EXTERN CGFloat HPScreenScale(void);
HP_EXTERN CGSize HPScreenSize(void);

// Round float coordinates to nearest whole screen pixel (not point)
HP_EXTERN CGFloat HPRoundPixelValue(CGFloat value);
HP_EXTERN CGFloat HPCeilPixelValue(CGFloat value);
HP_EXTERN CGFloat HPFloorPixelValue(CGFloat value);

// Convert a size in points to pixels, rounded up to the nearest integral size
HP_EXTERN CGSize HPSizeInPixels(CGSize pointSize, CGFloat scale);

// Method swizzling
HP_EXTERN void HPSwapClassMethods(Class cls, SEL original, SEL replacement);
HP_EXTERN void HPSwapInstanceMethods(Class cls, SEL original, SEL replacement);

// Module subclass support
HP_EXTERN BOOL HPClassOverridesClassMethod(Class cls, SEL selector);
HP_EXTERN BOOL HPClassOverridesInstanceMethod(Class cls, SEL selector);

// Creates a standardized error object to return in callbacks
HP_EXTERN NSDictionary<NSString *, id> *HPMakeError(
    NSString *message, id __nullable toStringify, NSDictionary<NSString *, id> *__nullable extraData);
HP_EXTERN NSDictionary<NSString *, id> *HPMakeAndLogError(
    NSString *message, id __nullable toStringify, NSDictionary<NSString *, id> *__nullable extraData);
HP_EXTERN NSDictionary<NSString *, id> *HPJSErrorFromNSError(NSError *error);
HP_EXTERN NSDictionary<NSString *, id> *HPJSErrorFromCodeMessageAndNSError(NSString *code, NSString *message, NSError *__nullable error);

// The default error code to use as the `code` property for callback error objects
HP_EXTERN NSString *const HPErrorUnspecified;

// Returns YES if HP is running in a test environment
HP_EXTERN BOOL HPRunningInTestEnvironment(void);

// Returns YES if HP is running in an iOS App Extension
HP_EXTERN BOOL HPRunningInAppExtension(void);

// Returns the shared UIApplication instance, or nil if running in an App Extension
HP_EXTERN UIApplication *__nullable HPSharedApplication(void);

// Returns the current main window, useful if you need to access the root view
// or view controller
HP_EXTERN UIWindow *__nullable HPKeyWindow(void);

// Returns the presented view controller, useful if you need
// e.g. to present a modal view controller or alert over it
HP_EXTERN UIViewController *__nullable HPPresentedViewController(void);

// Does this device support force touch (aka 3D Touch)?
HP_EXTERN BOOL HPForceTouchAvailable(void);

// Create an NSError in the HPErrorDomain
HP_EXTERN NSError *HPErrorWithMessage(NSString *message);

// Create an NSError in the HPErrorDomain
HP_EXTERN NSError *HPErrorWithMessageAndModuleName(NSString *message, NSString *__nullable moduleName);

// Create an NSError with HPFatalModuleName from another error
HP_EXTERN NSError *HPErrorFromErrorAndModuleName(NSError *error, NSString *__nullable moduleName);

// Convert nil values to NSNull, and vice-versa
#define HPNullIfNil(value) (value ?: (id)kCFNull)
#define HPNilIfNull(value) (value == (id)kCFNull ? nil : value)

// Convert NaN or infinite values to zero, as these aren't JSON-safe
HP_EXTERN double HPZeroIfNaN(double value);

// Convert data to a Base64-encoded data URL
HP_EXTERN NSURL *HPDataURL(NSString *mimeType, NSData *data);

// Returns the relative path within the main bundle for an absolute URL
// (or nil, if the URL does not specify a path within the main bundle)
HP_EXTERN NSString *__nullable HPBundlePathForURL(NSURL *__nullable URL);

// Determines if a given image URL refers to a local image
HP_EXTERN BOOL HPIsLocalAssetURL(NSURL *__nullable imageURL);

// Creates a new, unique temporary file path with the specified extension
HP_EXTERN NSString *__nullable HPTempFilePath(NSString *__nullable extension, NSError **error);

// Converts a CGColor to a hex string
HP_EXTERN NSString *HPColorToHexString(CGColorRef color);

/**
 * convert string to UIColor
 * colorString could be 'fff','#fff','ffffff','#ffffff','ffffffff','#ffffffff'
 * or 'red', 'green','blue'.etc
 */
HP_EXTERN UIColor *HPConvertStringToColor(NSString *colorString);

HP_EXTERN UIColor *HPConvertNumberToColor(NSInteger colorNumber);

// Get standard localized string (if it exists)
HP_EXTERN NSString *HPUIKitLocalizedString(NSString *string);

// URL manipulation
HP_EXTERN NSString *__nullable HPGetURLQueryParam(NSURL *__nullable URL, NSString *param);
HP_EXTERN NSURL *__nullable HPURLByReplacingQueryParam(NSURL *__nullable URL, NSString *param, NSString *__nullable value);
HP_EXTERN NSURL *__nullable HPURLWithString(NSString *__nonnull URLString, NSString *__nullable baseURLString);
HP_EXTERN NSString *HPSchemeFromURLString(NSString *urlString);

//Get String Encoding From HTTP URL Response
HP_EXTERN NSStringEncoding HPGetStringEncodingFromURLResponse(NSURLResponse *response);

NS_ASSUME_NONNULL_END
