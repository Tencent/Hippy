/*!
 * iOS SDK
 *
 * Tencent is pleased to support the open source community by making
 * NativeRender available.
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

#import <tgmath.h>

#import <CoreGraphics/CoreGraphics.h>
#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "NativeRenderDefines.h"

NS_ASSUME_NONNULL_BEGIN

// JSON serialization/deserialization
NATIVE_RENDER_EXTERN NSString *__nullable NativeRenderJSONStringify(id __nullable jsonObject, NSError **error);
NATIVE_RENDER_EXTERN id __nullable NativeRenderJSONParse(NSString *__nullable jsonString, NSError **error);
NATIVE_RENDER_EXTERN id __nullable NativeRenderJSONParseMutable(NSString *__nullable jsonString, NSError **error);

// Sanitize a JSON object by stripping invalid types and/or NaN values
NATIVE_RENDER_EXTERN id NativeRenderJSONClean(id object);

// Get MD5 hash of a string
NATIVE_RENDER_EXTERN NSString *NativeRenderMD5Hash(NSString *string);

// Check is we are currently on the main queue (not to be confused with
// the main thread, which is not neccesarily the same thing)
// https://twitter.com/olebegemann/status/738656134731599872
NATIVE_RENDER_EXTERN BOOL NativeRenderIsMainQueue(void);

// Execute the specified block on the main queue. Unlike dispatch_async()
// this will execute immediately if we're already on the main queue.
NATIVE_RENDER_EXTERN void NativeRenderExecuteOnMainQueue(dispatch_block_t block);

// Deprecated - do not use.
NATIVE_RENDER_EXTERN void NativeRenderExecuteOnMainThread(dispatch_block_t block, BOOL sync);
//__deprecated_msg("Use NativeRenderExecuteOnMainQueue instead. NativeRenderExecuteOnMainQueue is "
//                 "async. If you need to use the `sync` option... please don't.");

// Get screen metrics in a thread-safe way
NATIVE_RENDER_EXTERN CGFloat NativeRenderScreenScale(void);
NATIVE_RENDER_EXTERN CGSize NativeRenderScreenSize(void);

// Round float coordinates to nearest whole screen pixel (not point)
NATIVE_RENDER_EXTERN CGFloat NativeRenderRoundPixelValue(CGFloat value);
NATIVE_RENDER_EXTERN CGFloat NativeRenderCeilPixelValue(CGFloat value);
NATIVE_RENDER_EXTERN CGFloat NativeRenderFloorPixelValue(CGFloat value);

// Convert a size in points to pixels, rounded up to the nearest integral size
NATIVE_RENDER_EXTERN CGSize NativeRenderSizeInPixels(CGSize pointSize, CGFloat scale);

// Method swizzling
NATIVE_RENDER_EXTERN void NativeRenderSwapClassMethods(Class cls, SEL original, SEL replacement);
NATIVE_RENDER_EXTERN void NativeRenderSwapInstanceMethods(Class cls, SEL original, SEL replacement);

// Module subclass support
NATIVE_RENDER_EXTERN BOOL NativeRenderClassOverridesClassMethod(Class cls, SEL selector);
NATIVE_RENDER_EXTERN BOOL NativeRenderClassOverridesInstanceMethod(Class cls, SEL selector);

// Creates a standardized error object to return in callbacks
NATIVE_RENDER_EXTERN NSDictionary<NSString *, id> *NativeRenderMakeError(
    NSString *message, id __nullable toStringify, NSDictionary<NSString *, id> *__nullable extraData);
NATIVE_RENDER_EXTERN NSDictionary<NSString *, id> *NativeRenderMakeAndLogError(
    NSString *message, id __nullable toStringify, NSDictionary<NSString *, id> *__nullable extraData);
NATIVE_RENDER_EXTERN NSDictionary<NSString *, id> *NativeRenderJSErrorFromNSError(NSError *error);
NATIVE_RENDER_EXTERN NSDictionary<NSString *, id> *NativeRenderJSErrorFromCodeMessageAndNSError(NSString *code, NSString *message, NSError *__nullable error);

// The default error code to use as the `code` property for callback error objects
NATIVE_RENDER_EXTERN NSString *const RenderErrorUnspecified;

// Returns YES if NativeRender is running in a test environment
NATIVE_RENDER_EXTERN BOOL NativeRenderRunningInTestEnvironment(void);

// Returns YES if NativeRender is running in an iOS App Extension
NATIVE_RENDER_EXTERN BOOL NativeRenderRunningInAppExtension(void);

// Returns the shared UIApplication instance, or nil if running in an App Extension
NATIVE_RENDER_EXTERN UIApplication *__nullable NativeRenderSharedApplication(void);

// Returns the current main window, useful if you need to access the root view
// or view controller
NATIVE_RENDER_EXTERN UIWindow *__nullable NativeRenderKeyWindow(void);

// Returns the presented view controller, useful if you need
// e.g. to present a modal view controller or alert over it
NATIVE_RENDER_EXTERN UIViewController *__nullable NativeRenderPresentedViewController(void);

// Does this device support force touch (aka 3D Touch)?
NATIVE_RENDER_EXTERN BOOL NativeRenderForceTouchAvailable(void);

// Create an NSError in the NativeRenderErrorDomain
NATIVE_RENDER_EXTERN NSError *NativeRenderErrorWithMessage(NSString *message);

// Create an NSError in the NativeRenderErrorDomain
NATIVE_RENDER_EXTERN NSError *NativeRenderErrorWithMessageAndModuleName(NSString *message, NSString *__nullable moduleName);

// Create an NSError with NativeRenderFatalModuleName from another error
NATIVE_RENDER_EXTERN NSError *NativeRenderErrorFromErrorAndModuleName(NSError *error, NSString *__nullable moduleName);

// Convert nil values to NSNull, and vice-versa
#define NativeRenderNullIfNil(value) (value ?: (id)kCFNull)
#define NativeRenderNilIfNull(value) (value == (id)kCFNull ? nil : value)

// Convert NaN or infinite values to zero, as these aren't JSON-safe
NATIVE_RENDER_EXTERN double NativeRenderZeroIfNaN(double value);

// Convert data to a Base64-encoded data URL
NATIVE_RENDER_EXTERN NSURL *NativeRenderDataURL(NSString *mimeType, NSData *data);

// Returns the relative path within the main bundle for an absolute URL
// (or nil, if the URL does not specify a path within the main bundle)
NATIVE_RENDER_EXTERN NSString *__nullable NativeRenderBundlePathForURL(NSURL *__nullable URL);

// Determines if a given image URL refers to a local image
NATIVE_RENDER_EXTERN BOOL NativeRenderIsLocalAssetURL(NSURL *__nullable imageURL);

// Creates a new, unique temporary file path with the specified extension
NATIVE_RENDER_EXTERN NSString *__nullable NativeRenderTempFilePath(NSString *__nullable extension, NSError **error);

// Converts a CGColor to a hex string
NATIVE_RENDER_EXTERN NSString *NativeRenderColorToHexString(CGColorRef color);

/**
 * convert string to UIColor
 * colorString could be 'fff','#fff','ffffff','#ffffff','ffffffff','#ffffffff'
 * or 'red', 'green','blue'.etc
 */
NATIVE_RENDER_EXTERN UIColor *NativeRenderConvertStringToColor(NSString *colorString);

NATIVE_RENDER_EXTERN UIColor *NativeRenderConvertNumberToColor(NSInteger colorNumber);

// Get standard localized string (if it exists)
NATIVE_RENDER_EXTERN NSString *NativeRenderUIKitLocalizedString(NSString *string);

// URL manipulation
NATIVE_RENDER_EXTERN NSString *__nullable NativeRenderGetURLQueryParam(NSURL *__nullable URL, NSString *param);
NATIVE_RENDER_EXTERN NSURL *__nullable NativeRenderURLByReplacingQueryParam(NSURL *__nullable URL, NSString *param, NSString *__nullable value);
NATIVE_RENDER_EXTERN NSURL *__nullable NativeRenderURLWithString(NSString *__nonnull URLString, NSString *__nullable baseURLString);

//Get String Encoding From HTTP URL Response
NATIVE_RENDER_EXTERN NSStringEncoding NativeRenderGetStringEncodingFromURLResponse(NSURLResponse *response);

NS_ASSUME_NONNULL_END
