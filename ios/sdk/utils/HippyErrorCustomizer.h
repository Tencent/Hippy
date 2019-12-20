/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import <Foundation/Foundation.h>

@class HippyErrorInfo;

/**
 * Provides an interface to customize Hippy Native error messages and stack
 * traces from exceptions.
 */
@protocol HippyErrorCustomizer <NSObject>

/**
 * Customizes the given error, returning the passed info argument if no
 * customization is required.
 */
- (nonnull HippyErrorInfo *)customizeErrorInfo:(nonnull HippyErrorInfo *)info;
@end
