/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import <tgmath.h>

#import <CoreGraphics/CoreGraphics.h>
#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

#import "HippyAssert.h"
#import "HippyDefines.h"

NS_ASSUME_NONNULL_BEGIN

// JSON serialization/deserialization
HIPPY_EXTERN NSString *__nullable HippyJSONStringify(id __nullable jsonObject, NSError **error);
HIPPY_EXTERN id __nullable HippyJSONParse(NSString *__nullable jsonString, NSError **error);
HIPPY_EXTERN id __nullable HippyJSONParseMutable(NSString *__nullable jsonString, NSError **error);

// Sanitize a JSON object by stripping invalid types and/or NaN values
HIPPY_EXTERN id HippyJSONClean(id object);

// Get MD5 hash of a string
HIPPY_EXTERN NSString *HippyMD5Hash(NSString *string);

// Check is we are currently on the main queue (not to be confused with
// the main thread, which is not neccesarily the same thing)
// https://twitter.com/olebegemann/status/738656134731599872
HIPPY_EXTERN BOOL HippyIsMainQueue(void);

// Execute the specified block on the main queue. Unlike dispatch_async()
// this will execute immediately if we're already on the main queue.
HIPPY_EXTERN void HippyExecuteOnMainQueue(dispatch_block_t block);

// Deprecated - do not use.
HIPPY_EXTERN void HippyExecuteOnMainThread(dispatch_block_t block, BOOL sync);
//__deprecated_msg("Use HippyExecuteOnMainQueue instead. HippyExecuteOnMainQueue is "
//                 "async. If you need to use the `sync` option... please don't.");

// Get screen metrics in a thread-safe way
HIPPY_EXTERN CGFloat HippyScreenScale(void);
HIPPY_EXTERN CGSize HippyScreenSize(void);

// Round float coordinates to nearest whole screen pixel (not point)
HIPPY_EXTERN CGFloat HippyRoundPixelValue(CGFloat value);
HIPPY_EXTERN CGFloat HippyCeilPixelValue(CGFloat value);
HIPPY_EXTERN CGFloat HippyFloorPixelValue(CGFloat value);

// Convert a size in points to pixels, rounded up to the nearest integral size
HIPPY_EXTERN CGSize HippySizeInPixels(CGSize pointSize, CGFloat scale);

// Method swizzling
HIPPY_EXTERN void HippySwapClassMethods(Class cls, SEL original, SEL replacement);
HIPPY_EXTERN void HippySwapInstanceMethods(Class cls, SEL original, SEL replacement);

// Module subclass support
HIPPY_EXTERN BOOL HippyClassOverridesClassMethod(Class cls, SEL selector);
HIPPY_EXTERN BOOL HippyClassOverridesInstanceMethod(Class cls, SEL selector);

// Creates a standardized error object to return in callbacks
HIPPY_EXTERN NSDictionary<NSString *, id> *HippyMakeError(NSString *message, id __nullable toStringify, NSDictionary<NSString *, id> *__nullable extraData);
HIPPY_EXTERN NSDictionary<NSString *, id> *HippyMakeAndLogError(NSString *message, id __nullable toStringify, NSDictionary<NSString *, id> *__nullable extraData);
HIPPY_EXTERN NSDictionary<NSString *, id> *HippyJSErrorFromNSError(NSError *error);
HIPPY_EXTERN NSDictionary<NSString *, id> *HippyJSErrorFromCodeMessageAndNSError(NSString *code, NSString *message, NSError *__nullable error);

// The default error code to use as the `code` property for callback error objects
HIPPY_EXTERN NSString *const HippyErrorUnspecified;

// Returns YES if Hippy is running in a test environment
HIPPY_EXTERN BOOL HippyRunningInTestEnvironment(void);

// Returns YES if Hippy is running in an iOS App Extension
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

// Create an NSError in the HippyErrorDomain
HIPPY_EXTERN NSError *HippyErrorWithMessage(NSString *message);

// Convert nil values to NSNull, and vice-versa
#define HippyNullIfNil(value) (value ?: (id)kCFNull)
#define HippyNilIfNull(value) (value == (id)kCFNull ? nil : value)

// Convert NaN or infinite values to zero, as these aren't JSON-safe
HIPPY_EXTERN double HippyZeroIfNaN(double value);

// Convert data to a Base64-encoded data URL
HIPPY_EXTERN NSURL *HippyDataURL(NSString *mimeType, NSData *data);

// Returns the relative path within the main bundle for an absolute URL
// (or nil, if the URL does not specify a path within the main bundle)
HIPPY_EXTERN NSString *__nullable HippyBundlePathForURL(NSURL *__nullable URL);

// Determines if a given image URL refers to a local image
HIPPY_EXTERN BOOL HippyIsLocalAssetURL(NSURL *__nullable imageURL);

// Creates a new, unique temporary file path with the specified extension
HIPPY_EXTERN NSString *__nullable HippyTempFilePath(NSString *__nullable extension, NSError **error);

// Converts a CGColor to a hex string
HIPPY_EXTERN NSString *HippyColorToHexString(CGColorRef color);

// Get standard localized string (if it exists)
HIPPY_EXTERN NSString *HippyUIKitLocalizedString(NSString *string);

// URL manipulation
HIPPY_EXTERN NSString *__nullable HippyGetURLQueryParam(NSURL *__nullable URL, NSString *param);
HIPPY_EXTERN NSURL *__nullable HippyURLByReplacingQueryParam(NSURL *__nullable URL, NSString *param, NSString *__nullable value);
HIPPY_EXTERN NSURL *__nullable HippyURLWithString(NSString *__nonnull URLString, NSString *__nullable baseURLString);

NS_ASSUME_NONNULL_END
